package com.group2.InterviewManagement.services.Impl;

import com.group2.InterviewManagement.dto.*;
import com.group2.InterviewManagement.models.*;
import com.group2.InterviewManagement.models.key.KeyInterviewScheduleInterviewer;
import com.group2.InterviewManagement.repository.*;
import com.group2.InterviewManagement.services.EmailServices;
import com.group2.InterviewManagement.services.InterviewScheduleService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static com.group2.InterviewManagement.Enum.CandidateStatus.*;
import static com.group2.InterviewManagement.Enum.InterviewScheduleStatus.*;

@Service
public class InterviewScheduleServiceImpl implements InterviewScheduleService {


    private final InterviewScheduleRepository interviewScheduleRepository;
    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final InterviewScheduleInterviewerRepository interviewScheduleInterviewerRepository;
    private final EmailServices emailServices;

    @Autowired
    public InterviewScheduleServiceImpl(UserRepository userRepository, InterviewScheduleRepository interviewScheduleRepository, CandidateRepository candidateRepository, JobRepository jobRepository, InterviewScheduleInterviewerRepository interviewScheduleInterviewerRepository, EmailServices emailServices) {
        this.userRepository = userRepository;
        this.interviewScheduleRepository = interviewScheduleRepository;
        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
        this.interviewScheduleInterviewerRepository = interviewScheduleInterviewerRepository;
        this.emailServices = emailServices;
    }

    @Override
    public List<InterviewScheduleDTO> getAllInterviewSchedules() {
        return interviewScheduleRepository.findAll().stream()
                .map(this::parseInterviewToInterviewDTO)
                .collect(Collectors.toList());
    }

    public Page<InterviewSchedule> findInterviewSchedules(String keyword, String status, String interviewer, Pageable pageable) {
        return interviewScheduleRepository.findInterviewSchedules(keyword, status, interviewer, pageable);
    }

    public Page<InterviewSchedule> findInterviewSchedulesInterviewer(Integer interviewerId, String keyword, String status, Pageable pageable) {
        return interviewScheduleRepository.findInterviewSchedulesForInterviewer(interviewerId,keyword, status, pageable);
    }

    @Override
    public List<InterviewTitleDTO> getInterviewTitle() {
        return interviewScheduleRepository.getInterviewTitle();
    }

    @Transactional
    public boolean createInterviewSchedule(InterviewScheduleDTO interviewScheduleDTO) {
            User recruiter = userRepository.findByUserId(interviewScheduleDTO.getRecruiterOwner().getId());
            Job job = jobRepository.findByJobIdAndIsActive(interviewScheduleDTO.getJob().getJobId(), 1);
            Candidate candidate = candidateRepository.getByCandidateId(Integer.parseInt(interviewScheduleDTO.getCandidateDTO().getId()));


            candidate.setCandidateStatus("Waiting for interview");
            candidateRepository.save(candidate);

            InterviewSchedule interviewSchedule = InterviewSchedule.builder()
                .scheduleId(interviewScheduleDTO.getScheduleId()) // Assuming scheduleId is set correctly in DTO
                .scheduleTitle(interviewScheduleDTO.getScheduleTitle())
                .candidate(candidate)
                .scheduleDate(interviewScheduleDTO.getScheduleDate())
                .scheduleFrom(interviewScheduleDTO.getScheduleFrom())
                .scheduleTo(interviewScheduleDTO.getScheduleTo())
                .interviewScheduleResult("N/A")
                .interviewScheduleStatus("New")
                .note(interviewScheduleDTO.getNote())
                .job(job)
                .recruiter(recruiter)
                .location(interviewScheduleDTO.getLocation())
                .meetingId(interviewScheduleDTO.getMeetingId())
                .isActive(true)
                .build();

            InterviewSchedule interviewScheduleSaved = interviewScheduleRepository.save(interviewSchedule);

            List<UserDTO> listIdInterviewers = interviewScheduleDTO.getInterviewers();
            List<User> interviewers = new ArrayList<>();

            for (UserDTO userDTO : listIdInterviewers) {
                User user = userRepository.findByUserId(userDTO.getId());
                interviewers.add(user);
                KeyInterviewScheduleInterviewer keyInterviewScheduleInterviewer = KeyInterviewScheduleInterviewer.builder()
                    .scheduleId(interviewScheduleSaved.getScheduleId())
                    .userId(userDTO.getId())
                    .build();
                InterviewScheduleInterviewer interviewScheduleInterviewer = InterviewScheduleInterviewer.builder()
                    .keyInterviewScheduleInterviewer(keyInterviewScheduleInterviewer)
                    .interviewer(user)
                    .interviewSchedule(interviewScheduleSaved)
                    .build();
                interviewScheduleInterviewerRepository.save(interviewScheduleInterviewer);
            }

            InterviewSchedule refreshedInterviewSchedule = interviewScheduleRepository.findByScheduleId(interviewScheduleSaved.getScheduleId());

            try {
                sendEmailNotifications(refreshedInterviewSchedule, interviewers);
            } catch (Exception e) {
                System.err.println("Failed to send email notifications: " + e.getMessage());
            }
        return true;
    }

    @Override
    public InterviewScheduleDTO parseInterviewToInterviewDTO(InterviewSchedule interviewSchedule) {

        List<UserDTO> interviewerDTO = interviewSchedule.getInterviewScheduleInterviewer().stream()
                .map(interviewScheduleInterviewer -> UserDTO.builder()
                        .id(interviewScheduleInterviewer.getInterviewer().getUserId())
                        .username(interviewScheduleInterviewer.getInterviewer().getUsername())
                        .fullName(interviewScheduleInterviewer.getInterviewer().getFullName())
                        .isActive(String.valueOf(interviewScheduleInterviewer.getInterviewer().isActive()))
                        .build())
                .collect(Collectors.toList());

       UserDTO recruiterDTO = UserDTO.builder()

               .id(interviewSchedule.getRecruiter().getUserId())
               .username((interviewSchedule.getRecruiter().getUsername()))
               .fullName(interviewSchedule.getRecruiter().getFullName())
               .isActive(String.valueOf(interviewSchedule.getRecruiter().isActive()))
               .build();

        UserCandidateDTO candidateDTO =UserCandidateDTO.builder()
                .id(String.valueOf(interviewSchedule.getCandidate().getCandidateId()))
                .fullName(interviewSchedule.getCandidate().getFullName())
                .isActive(interviewSchedule.getCandidate().isActive())
                .build();

        JobDTO jobDTO = JobDTO.builder()
                .jobId(interviewSchedule.getJob().getJobId())
                .jobTitle(interviewSchedule.getJob().getJobTitle())
                .isActive(String.valueOf(interviewSchedule.getJob().getIsActive()))
                .build();

        return InterviewScheduleDTO.builder()
                .scheduleId(interviewSchedule.getScheduleId())
                .scheduleTitle(interviewSchedule.getScheduleTitle())
                .candidateDTO(candidateDTO)
                .scheduleDate(interviewSchedule.getScheduleDate())
                .scheduleFrom(interviewSchedule.getScheduleFrom())
                .scheduleTo(interviewSchedule.getScheduleTo())
                .result(interviewSchedule.getInterviewScheduleResult())
                .status(interviewSchedule.getInterviewScheduleStatus())
                .note(interviewSchedule.getNote())
                .job(jobDTO)
                .interviewers(interviewerDTO)
                .location(interviewSchedule.getLocation())
                .recruiterOwner(recruiterDTO)
                .meetingId(interviewSchedule.getMeetingId())
                .build();
    }

    @Override
    public InterviewScheduleDTO findInterviewScheduleById(int id) {
        InterviewSchedule interviewSchedule = interviewScheduleRepository.findByScheduleId(id);
        return parseInterviewToInterviewDTO(interviewSchedule);
    }

    @Transactional
    public InterviewScheduleDTO updateInterviewSchedule(int id, InterviewScheduleDTO interviewScheduleDTO) {
        // Fetch existing InterviewSchedule entity
        InterviewSchedule interviewSchedule = interviewScheduleRepository.findByScheduleId(id);
        if (interviewSchedule == null) {
            throw new ResourceNotFoundException("Interview Schedule not found with id: " + id);
        }
        updateInterviewScheduleFields(interviewSchedule, interviewScheduleDTO);
        updateCandidate(interviewSchedule, interviewScheduleDTO.getCandidateDTO(), interviewScheduleDTO.getResult());
        updateJob(interviewSchedule, interviewScheduleDTO.getJob());
        updateRecruiter(interviewSchedule, interviewScheduleDTO.getRecruiterOwner());
        updateInterviewers(interviewSchedule, interviewScheduleDTO.getInterviewers());
        // Save updated InterviewSchedule
        InterviewSchedule savedInterviewSchedule = interviewScheduleRepository.save(interviewSchedule);

        return parseInterviewToInterviewDTO(savedInterviewSchedule);
    }

    private void updateInterviewScheduleFields(InterviewSchedule interviewSchedule, InterviewScheduleDTO interviewScheduleDTO) {
        if (interviewScheduleDTO.getScheduleTitle() != null) {
            interviewSchedule.setScheduleTitle(interviewScheduleDTO.getScheduleTitle());
        }
        if (interviewScheduleDTO.getScheduleDate() != null) {
            interviewSchedule.setScheduleDate(interviewScheduleDTO.getScheduleDate());
        } else if (interviewSchedule.getScheduleDate() == null) {
            throw new IllegalArgumentException("Schedule date cannot be null");
        }
        if (interviewScheduleDTO.getScheduleFrom() != null) {
            interviewSchedule.setScheduleFrom(interviewScheduleDTO.getScheduleFrom());
        }
        if (interviewScheduleDTO.getScheduleTo() != null) {
            interviewSchedule.setScheduleTo(interviewScheduleDTO.getScheduleTo());
        }

        if (interviewScheduleDTO.getResult() != null && !interviewScheduleDTO.getResult().equals(interviewSchedule.getInterviewScheduleResult())) {
            interviewSchedule.setInterviewScheduleResult(interviewScheduleDTO.getResult());
            // Update interview status based on the result
            if ("Passed".equals(interviewScheduleDTO.getResult())) {
                interviewSchedule.setInterviewScheduleStatus(PASSED_INTERVIEW.getDisplayName());
            } else if ("Failed".equals(interviewScheduleDTO.getResult())) {
                interviewSchedule.setInterviewScheduleStatus(FAILED_INTERVIEW.getDisplayName());
            }
        } else if (interviewSchedule.getInterviewScheduleResult() == null) {
            interviewSchedule.setInterviewScheduleResult("N/A");
        }

        if (interviewScheduleDTO.getStatus() != null) {
            interviewSchedule.setInterviewScheduleStatus(interviewScheduleDTO.getStatus());
        } else if (interviewSchedule.getInterviewScheduleStatus() == null) {
            interviewSchedule.setInterviewScheduleStatus(NEW.getDisplayName()); // Set a default value if needed
        }

        if (interviewScheduleDTO.getNote() != null) {
            interviewSchedule.setNote(interviewScheduleDTO.getNote());
        }
        if (interviewScheduleDTO.getLocation() != null) {
            interviewSchedule.setLocation(interviewScheduleDTO.getLocation());
        }
        if (interviewScheduleDTO.getMeetingId() != null) {
            interviewSchedule.setMeetingId(interviewScheduleDTO.getMeetingId());
        }

        // Set the status to Interviewed
        interviewSchedule.setInterviewScheduleStatus(INTERVIEWED.getDisplayName());
    }

    private void updateCandidate(InterviewSchedule interviewSchedule, UserCandidateDTO candidateDTO, String result) {
        // Retrieve the current candidate associated with the interview schedule
        Candidate currentCandidate = interviewSchedule.getCandidate();

        if (currentCandidate != null) {
            // Update the status of the current candidate to "Open"
            currentCandidate.setCandidateStatus(OPEN.getDisplayName());
            candidateRepository.save(currentCandidate);
        }

        if (candidateDTO != null) {
            // Find the new candidate by their ID
            Candidate newCandidate = candidateRepository.getByCandidateId(Integer.parseInt(candidateDTO.getId()));
            if (newCandidate == null) {
                throw new ResourceNotFoundException("Candidate not found");
            }

            // Update the new candidate's status based on the interview result
            if (result != null) {
                switch (result) {
                    case "Passed":
                        newCandidate.setCandidateStatus(PASSED_INTERVIEW.getDisplayName());
                        break;
                    case "Failed":
                        newCandidate.setCandidateStatus(FAILED_INTERVIEW.getDisplayName());
                        break;
                    default:
                        newCandidate.setCandidateStatus(WAITING_FOR_INTERVIEW.getDisplayName());
                        break;
                }
            } else {
                newCandidate.setCandidateStatus(WAITING_FOR_INTERVIEW.getDisplayName());
            }

            candidateRepository.save(newCandidate);
            interviewSchedule.setCandidate(newCandidate);
        }
    }




    private void updateJob(InterviewSchedule interviewSchedule, JobDTO jobDTO) {
        if (jobDTO != null) {
            Job job = jobRepository.findByJobIdAndIsActive(jobDTO.getJobId(), 1);
            if (job == null) {
                throw new ResourceNotFoundException("Job not found");
            }
            interviewSchedule.setJob(job);
        }
    }

    private void updateRecruiter(InterviewSchedule interviewSchedule, UserDTO recruiterDTO) {
        if (recruiterDTO != null) {
            User recruiter = userRepository.findById(recruiterDTO.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found"));
            interviewSchedule.setRecruiter(recruiter);
        }
    }

    private void updateInterviewers(InterviewSchedule interviewSchedule, List<UserDTO> interviewerDTOs) {
        if (interviewerDTOs != null) {
            // Remove existing interviewers
            interviewScheduleInterviewerRepository.deleteByInterviewSchedule(interviewSchedule);

            // Add new interviewers
            for (UserDTO interviewerDTO : interviewerDTOs) {
                User interviewer = userRepository.findById(interviewerDTO.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Interviewer not found with id: " + interviewerDTO.getId()));

                KeyInterviewScheduleInterviewer key = new KeyInterviewScheduleInterviewer(interviewSchedule.getScheduleId(), interviewer.getUserId());
                InterviewScheduleInterviewer interviewScheduleInterviewer = InterviewScheduleInterviewer.builder()
                        .keyInterviewScheduleInterviewer(key)
                        .interviewer(interviewer)
                        .interviewSchedule(interviewSchedule)
                        .build();
                interviewScheduleInterviewerRepository.save(interviewScheduleInterviewer);
            }
        }
    }

    @Transactional
    public InterviewScheduleDTO cancelInterviewSchedule(int id) {
        // Fetch existing InterviewSchedule entity
        InterviewSchedule interviewSchedule = interviewScheduleRepository.findByScheduleId(id);
        if (interviewSchedule == null) {
            throw new ResourceNotFoundException("Interview Schedule not found with id: " + id);
        }
        // Update the status of the interview schedule
        interviewSchedule.setInterviewScheduleStatus(CANCELLED.getDisplayName());
        // Update the status of the candidate
        Candidate candidate = interviewSchedule.getCandidate();
        if (candidate != null) {
            candidate.setCandidateStatus(CANCELLED_INTERVIEW.getDisplayName());
            candidateRepository.save(candidate);
        }
        // Save updated InterviewSchedule
        InterviewSchedule savedInterviewSchedule = interviewScheduleRepository.save(interviewSchedule);
        return parseInterviewToInterviewDTO(savedInterviewSchedule);
    }

    @Transactional
    public InterviewScheduleDTO editSchedule(int id, InterviewScheduleDTO interviewScheduleDTO) {
        // Fetch existing InterviewSchedule entity
        InterviewSchedule interviewSchedule = interviewScheduleRepository.findByScheduleId(id);
        if (interviewSchedule == null) {
            throw new ResourceNotFoundException("Interview Schedule not found with id: " + id);
        }

        updateInterviewScheduleFieldsPreserveStatus(interviewSchedule, interviewScheduleDTO);
        updateCandidate(interviewSchedule, interviewScheduleDTO.getCandidateDTO(), interviewScheduleDTO.getResult());
        updateJob(interviewSchedule, interviewScheduleDTO.getJob());
        updateRecruiter(interviewSchedule, interviewScheduleDTO.getRecruiterOwner());
        updateInterviewers(interviewSchedule, interviewScheduleDTO.getInterviewers());

        // Save updated InterviewSchedule
        InterviewSchedule savedInterviewSchedule = interviewScheduleRepository.save(interviewSchedule);

        return parseInterviewToInterviewDTO(savedInterviewSchedule);
    }

    private void updateInterviewScheduleFieldsPreserveStatus(InterviewSchedule interviewSchedule, InterviewScheduleDTO interviewScheduleDTO) {
        if (interviewScheduleDTO.getScheduleTitle() != null) {
            interviewSchedule.setScheduleTitle(interviewScheduleDTO.getScheduleTitle());
        }
        if (interviewScheduleDTO.getScheduleDate() != null) {
            interviewSchedule.setScheduleDate(interviewScheduleDTO.getScheduleDate());
        } else if (interviewSchedule.getScheduleDate() == null) {
            throw new IllegalArgumentException("Schedule date cannot be null");
        }
        if (interviewScheduleDTO.getScheduleFrom() != null) {
            interviewSchedule.setScheduleFrom(interviewScheduleDTO.getScheduleFrom());
        }
        if (interviewScheduleDTO.getScheduleTo() != null) {
            interviewSchedule.setScheduleTo(interviewScheduleDTO.getScheduleTo());
        }

        if (interviewScheduleDTO.getResult() != null && !interviewScheduleDTO.getResult().equals(interviewSchedule.getInterviewScheduleResult())) {
            interviewSchedule.setInterviewScheduleResult(interviewScheduleDTO.getResult());
            // Update interview status based on the result only if result has changed
            if ("Passed".equals(interviewScheduleDTO.getResult())) {
                interviewSchedule.setInterviewScheduleStatus(PASSED_INTERVIEW.getDisplayName());
            } else if ("Failed".equals(interviewScheduleDTO.getResult())) {
                interviewSchedule.setInterviewScheduleStatus(FAILED_INTERVIEW.getDisplayName());
            } else {
                // If result is neither "Passed" nor "Failed", set status to INTERVIEWED
                interviewSchedule.setInterviewScheduleStatus(INTERVIEWED.getDisplayName());
            }
        } else if (interviewSchedule.getInterviewScheduleResult() == null) {
            interviewSchedule.setInterviewScheduleResult("N/A");
        }

        // Only update status if it's explicitly provided in the DTO
        if (interviewScheduleDTO.getStatus() != null) {
            interviewSchedule.setInterviewScheduleStatus(interviewScheduleDTO.getStatus());
        }

        if (interviewScheduleDTO.getNote() != null) {
            interviewSchedule.setNote(interviewScheduleDTO.getNote());
        }
        if (interviewScheduleDTO.getLocation() != null) {
            interviewSchedule.setLocation(interviewScheduleDTO.getLocation());
        }
        if (interviewScheduleDTO.getMeetingId() != null) {
            interviewSchedule.setMeetingId(interviewScheduleDTO.getMeetingId());
        }
    }

    @Override
    @Transactional
    public boolean sendInterviewNotifications(int interviewScheduleId) {
        InterviewSchedule schedule = interviewScheduleRepository.findByScheduleId(interviewScheduleId);

        if (schedule == null) {
            System.err.println("Interview schedule not found with id: " + interviewScheduleId);
            return false;
        }

        try {
            sendInterviewerReminders(schedule);
            schedule.setInterviewScheduleStatus("Invited");
            interviewScheduleRepository.save(schedule);

            return true;
        } catch (Exception e) {
            System.err.println("Error occurred while sending notifications: " + e.getMessage());
            return false;
        }
    }

    private void sendEmailNotifications(InterviewSchedule interviewSchedule, List<User> interviewers) {
        if (interviewSchedule == null) {
            System.err.println("InterviewSchedule is null");
            return;
        }

        if (interviewers.isEmpty()) {
            System.err.println("No interviewers found for interview schedule: " + interviewSchedule.getScheduleId());
        } else {
            for (User interviewer : interviewers) {
                sendEmail(interviewer.getEmail(),
                        "Interview Invitation: " + interviewSchedule.getScheduleTitle(),
                        buildEmailContent("Interview Invitation", interviewer.getFullName(), interviewSchedule, false));
            }
        }

        if (interviewSchedule.getCandidate() != null && interviewSchedule.getCandidate().getEmail() != null) {
            sendEmail(
                    interviewSchedule.getCandidate().getEmail(),
                    "Interview Invitation: " + interviewSchedule.getScheduleTitle(),
                    buildEmailContent("Interview Invitation", interviewSchedule.getCandidate().getFullName(), interviewSchedule, false));
        } else {
            System.err.println("Candidate or candidate email is null for interview schedule: " + interviewSchedule.getScheduleId());
        }

        if (interviewSchedule.getRecruiter() != null && interviewSchedule.getRecruiter().getEmail() != null) {
            sendEmail(
                    interviewSchedule.getRecruiter().getEmail(),
                    "Interview Invitation: " + interviewSchedule.getScheduleTitle(),
                    buildEmailContent("Interview Invitation", interviewSchedule.getRecruiter().getFullName(), interviewSchedule, false));
        } else {
            System.err.println("Recruiter or recruiter email is null for interview schedule: " + interviewSchedule.getScheduleId());
        }
    }

    private void sendResultReminderEmail(InterviewSchedule interviewSchedule) {
        List<User> interviewers = interviewSchedule.getInterviewScheduleInterviewer().stream()
                .map(InterviewScheduleInterviewer::getInterviewer)
                .filter(Objects::nonNull)
                .toList();

        for (User interviewer : interviewers) {
            sendEmail(interviewer.getEmail(),
                    "Interview Result Reminder: " + interviewSchedule.getScheduleTitle(),
                    buildEmailContent("Interview Result Reminder", interviewer.getFullName(), interviewSchedule, true));
        }

        if (interviewSchedule.getCandidate() != null && interviewSchedule.getCandidate().getEmail() != null) {
            sendEmail(
                    interviewSchedule.getCandidate().getEmail(),
                    "Interview Result Reminder: " + interviewSchedule.getScheduleTitle(),
                    buildEmailContent("Interview Result Reminder", interviewSchedule.getCandidate().getFullName(), interviewSchedule, true));
        }

        if (interviewSchedule.getRecruiter() != null && interviewSchedule.getRecruiter().getEmail() != null) {
            sendEmail(
                    interviewSchedule.getRecruiter().getEmail(),
                    "Interview Result Reminder: " + interviewSchedule.getScheduleTitle(),
                    buildEmailContent("Interview Result Reminder", interviewSchedule.getRecruiter().getFullName(), interviewSchedule, true));
        }
    }

    private String buildEmailContent(String emailType, String recipientName, InterviewSchedule schedule, boolean isResultReminder) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        StringBuilder content = new StringBuilder();
        content.append("<html><body>")
                .append("<h2>").append(emailType).append("</h2>")
                .append("<p>Dear ").append(recipientName).append(",</p>")
                .append("<p>").append(isResultReminder ? "This is a reminder about the following interview:" : "You are invited to an interview:").append("</p>")
                .append("<p><strong>Title:</strong> ").append(schedule.getScheduleTitle()).append("</p>")
                .append("<p><strong>Date:</strong> ").append(schedule.getScheduleDate().format(dateFormatter)).append("</p>")
                .append("<p><strong>Time:</strong> ").append(schedule.getScheduleFrom().format(timeFormatter)).append(" - ").append(schedule.getScheduleTo().format(timeFormatter)).append("</p>")
                .append("<p><strong>Location:</strong> ").append(schedule.getLocation()).append("</p>")
                .append("<p><strong>Candidate:</strong> ").append(schedule.getCandidate().getFullName()).append("</p>")
                .append("<p><strong>Job Position:</strong> ").append(schedule.getJob().getJobTitle()).append("</p>");

        if (isResultReminder) {
            content.append("<p>Please submit/check the interview result as soon as possible.</p>");
        } else {
            content.append("<p>Please let us know if you have any questions or need to reschedule.</p>");
        }

        content.append("<p>Thank you,<br>IMS Team</p>")
                .append("</body></html>");

        return content.toString();
    }

    private void sendEmail(String to, String subject, String htmlContent) {
        Thread thread = new Thread(() ->
                emailServices.sendEmail("interviewmanagement.fa.fpt@gmail.com", to, subject, htmlContent)
        );
        thread.start();
    }

    private void sendInterviewerReminders(InterviewSchedule schedule) {
        List<User> interviewers = schedule.getInterviewScheduleInterviewer().stream()
                .map(InterviewScheduleInterviewer::getInterviewer)
                .toList();

        for (User interviewer : interviewers) {
            sendEmail(interviewer.getEmail(),
                    "Interview Invitation: " + schedule.getScheduleTitle(),
                    buildInterviewerInvitationContent(interviewer, schedule));
        }
    }

    private String buildInterviewerInvitationContent(User interviewer, InterviewSchedule schedule) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        return "<html><body>" +
                "<h2>Interview Invitation</h2>" +
                "<p>Dear " + interviewer.getFullName() + ",</p>" +
                "<p>You are invited to conduct an interview:</p>" +
                "<p><strong>Title:</strong> " + schedule.getScheduleTitle() + "</p>" +
                "<p><strong>Date:</strong> " + schedule.getScheduleDate().format(dateFormatter) + "</p>" +
                "<p><strong>Time:</strong> " + schedule.getScheduleFrom().format(timeFormatter) + " - " + schedule.getScheduleTo().format(timeFormatter) + "</p>" +
                "<p><strong>Location:</strong> " + schedule.getLocation() + "</p>" +
                "<p><strong>Candidate:</strong> " + schedule.getCandidate().getFullName() + "</p>" +
                "<p><strong>Job Position:</strong> " + schedule.getJob().getJobTitle() + "</p>" +
                "<p>Please let us know if you have any questions or need to reschedule.</p>" +
                "<p>Thank you,<br>IMS Team</p>" +
                "</body></html>";
    }

    @Override
    @Transactional
    public void sendInterviewNotificationsForDate() {
        LocalDate today = LocalDate.now();
        List<InterviewSchedule> interviews = interviewScheduleRepository.findByScheduleDate(today);
        for (InterviewSchedule interview : interviews) {
            sendInterviewNotifications(interview.getScheduleId());
        }
    }

    @Override
    @Transactional
    public void sendNotifications24HoursAfterMeeting() {
        LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
        LocalDate yesterday = now.toLocalDate().minusDays(1);
        List<InterviewSchedule> completedInterviews = interviewScheduleRepository.findByScheduleDateLessThanEqual(yesterday);

        for (InterviewSchedule interview : completedInterviews) {
            if (interview != null && INVITED.getDisplayName().equals(interview.getInterviewScheduleStatus())) {
                LocalDateTime meetingEndDateTime = LocalDateTime.of(interview.getScheduleDate(), interview.getScheduleTo());
                LocalDateTime twentyFourHoursAfterMeeting = meetingEndDateTime.plusHours(24);

                if (now.isAfter(twentyFourHoursAfterMeeting) && now.isBefore(twentyFourHoursAfterMeeting.plusHours(1))) {
                    sendResultReminderEmail(interview);
                }
            }
        }
    }

}