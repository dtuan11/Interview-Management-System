package com.group2.InterviewManagement.controller;

import com.group2.InterviewManagement.dto.*;
import com.group2.InterviewManagement.dto.response.ResponseDTO;
import com.group2.InterviewManagement.models.*;
import com.group2.InterviewManagement.repository.InterviewScheduleRepository;
import com.group2.InterviewManagement.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interview")
public class InterviewScheduleController {


    private final InterviewScheduleRepository interviewScheduleRepository;
    private final InterviewScheduleService interviewScheduleService;
    private final CandidateService candidateService;
    private final JobService jobService;
    private final UserServices userService;

    @Autowired
    public InterviewScheduleController(InterviewScheduleRepository interviewScheduleRepository, InterviewScheduleService interviewScheduleService, CandidateService candidateService, JobService jobService, UserServices userService) {
        this.interviewScheduleRepository = interviewScheduleRepository;
        this.interviewScheduleService = interviewScheduleService;
        this.candidateService = candidateService;
        this.jobService = jobService;
        this.userService = userService;
    }


    @GetMapping("/get-all")
    public ResponseEntity<ResponseDTO> getAllInterviewSchedules(@RequestParam(defaultValue = "0") Integer pageNumber) {
        Pageable pageable = PageRequest.of(pageNumber, 10); // Lấy 10 phần tử trên mỗi trang
        Page<InterviewSchedule> interviewSchedules = interviewScheduleRepository.findAll(pageable);

        if (interviewSchedules.isEmpty()) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().message("No interview schedules found").build());
        }

        List<InterviewScheduleDTO> interviewScheduleDTOS = interviewSchedules.getContent().stream()
                .map(interviewScheduleService::parseInterviewToInterviewDTO)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("interviewSchedules", interviewScheduleDTOS);
        response.put("pageNumber", interviewSchedules.getNumber());
        response.put("totalPages", interviewSchedules.getTotalPages());

        return ResponseEntity.ok().body(ResponseDTO.builder().data(response).message("Get all interview schedules success").build());
    }


    @GetMapping("/get-all-interview-schedule")
    public ResponseEntity<ResponseDTO> searchAndFilterInterviewSchedules(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String interviewer,
            @RequestParam Integer pageNumber) {

        Pageable pageable = PageRequest.of(pageNumber, 10);
        Page<InterviewSchedule> interviewSchedules = interviewScheduleService.findInterviewSchedules(keyword, status, interviewer, pageable);

        if (interviewSchedules.isEmpty()) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().message("No interview schedules found for the given filters").build());
        }

        List<InterviewScheduleDTO> interviewScheduleDTOS = interviewSchedules.getContent().stream()
                .map(interviewScheduleService::parseInterviewToInterviewDTO)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("interviewSchedules", interviewScheduleDTOS);
        response.put("pageNumber", interviewSchedules.getNumber());
        response.put("totalPages", interviewSchedules.getTotalPages());

        return ResponseEntity.ok().body(ResponseDTO.builder().data(response).message("Search and filter interview schedules success").build());
    }


    @GetMapping("/interviewers")
    public ResponseEntity<ResponseDTO> getAllInterviewers() {
        List<User> interviewers = userService.getInterviewers();
        List<User> recruiters = userService.getRecruiter();
        List<Job> jobs = jobService.getJobOpen();
        List<User> role = userService.getRoleADM();
        if (interviewers.isEmpty()) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().message("No interviewers found").build());
        }

        List<UserDTO> interviewerDTOs = interviewers.stream()
                .map(interviewer -> UserDTO.builder()
                        .id(interviewer.getUserId())
                        .username(interviewer.getUsername())
                        .fullName(interviewer.getFullName())
                        .isActive(String.valueOf(interviewer.isActive()))
                        .build())
                .collect(Collectors.toList());

        List<String> recruiterNames = recruiters.stream()
                .map(User::getFullName)
                .collect(Collectors.toList());

        List<String> roles = role.stream()
                .map(User::getFullName)
                .collect(Collectors.toList());

        List<JobDTO> jobDTOs = jobs.stream()
                .map(job -> JobDTO.builder()
                        .jobId(job.getJobId())
                        .jobTitle(job.getJobTitle())
                        .build())
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("interviewers", interviewerDTOs);
        response.put("recruiters", recruiterNames);
        response.put("jobs", jobDTOs);
        response.put("roles", roles);
        return ResponseEntity.ok().body(ResponseDTO.builder().data(response).message("Fetch interviewers success").build());
    }


    @GetMapping("/initialize-form-data")
    public ResponseEntity<Map<String, Object>> getFormInitializationData() {
        try {
            List<Job> jobs = jobService.getJobOpen();
            List<User> interviewers = userService.getInterviewers();
            List<User> recruiters = userService.getRecruiter();
            List<Candidate> activeCandidates = candidateService.getOpenCandidates();
            List<User> role = userService.getRoleADM();
            List<JobDTO> jobDTOs = jobs.stream()
                    .map(job -> JobDTO.builder()
                            .jobId(job.getJobId())
                            .jobTitle(job.getJobTitle())
                            .isActive(String.valueOf(job.getIsActive()))
                            .build())
                    .collect(Collectors.toList());

            List<UserDTO> interviewerDTOs = interviewers.stream()
                    .map(interviewer -> UserDTO.builder()
                            .id(interviewer.getUserId())
                            .username(interviewer.getUsername())
                            .fullName(interviewer.getFullName())
                            .isActive(String.valueOf(interviewer.isActive()))
                            .build())
                    .collect(Collectors.toList());



            List<UserCandidateDTO> candidateDTOs = activeCandidates.stream()
                    .map(candidate -> UserCandidateDTO.builder()
                            .id(String.valueOf(candidate.getCandidateId()))
                            .fullName(candidate.getFullName())
                            .isActive(candidate.isActive())
                            .recruiterId(candidate.getRecruiter().getUserId())
                            .recruiterName(candidate.getRecruiter().getFullName())
                            .recruiterUserName(candidate.getRecruiter().getUsername())
                            .build())
                    .collect(Collectors.toList());


            List<UserDTO> roleDTOs = role.stream()
                    .map(interviewer -> UserDTO.builder()
                            .id(interviewer.getUserId())
                            .username(interviewer.getUsername())
                            .fullName(interviewer.getFullName())
                            .isActive(String.valueOf(interviewer.isActive()))
                            .build())
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("jobs", jobDTOs);
            response.put("interviewers", interviewerDTOs);

            response.put("openCandidates", candidateDTOs);
            response.put("roles", roleDTOs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    @PostMapping("/create")
    public ResponseEntity<String> createInterviewSchedule(@RequestBody InterviewScheduleDTO scheduleDTO) {
        try {

            interviewScheduleService.createInterviewSchedule(scheduleDTO);
            return ResponseEntity.ok("Interview Schedule created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create Interview Schedule" + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDTO> getInterviewById(@PathVariable Integer id) {
        if (id == null) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().message("ID cannot be null").build());
        }

        try {
            InterviewScheduleDTO interviewScheduleDTO = interviewScheduleService.findInterviewScheduleById(id);
            return ResponseEntity.ok(ResponseDTO.builder().data(interviewScheduleDTO).build());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponseDTO.builder().message(e.getMessage()).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseDTO.builder().message("Interview Schedule Not Found!").build());
        }
    }

    @PutMapping("/submit-result/{id}")
    public ResponseEntity<ResponseDTO> submitResult(@PathVariable Integer id, @RequestBody InterviewScheduleDTO interviewScheduleDTO) {
        try {
            InterviewScheduleDTO updatedInterviewSchedule = interviewScheduleService.updateInterviewSchedule(id, interviewScheduleDTO);
            return ResponseEntity.ok(ResponseDTO.builder().data(updatedInterviewSchedule).build());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponseDTO.builder().message(e.getMessage()).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseDTO.builder().message("An unexpected error occurred" + e.getMessage()).build());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ResponseDTO> updateInterviewSchedule(@PathVariable Integer id, @RequestBody InterviewScheduleDTO interviewScheduleDTO) {
        try {
            InterviewScheduleDTO updatedInterviewSchedule = interviewScheduleService.editSchedule(id, interviewScheduleDTO);
            return ResponseEntity.ok(ResponseDTO.builder().data(updatedInterviewSchedule).build());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponseDTO.builder().message(e.getMessage()).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseDTO.builder().message("An unexpected error occurred" + e.getMessage()).build());
        }
    }

    @PutMapping("/cancel-schedule/{id}")
    public ResponseEntity<ResponseDTO> cancelInterviewSchedule(@PathVariable Integer id) {
        try {
            InterviewScheduleDTO updatedInterviewSchedule = interviewScheduleService.cancelInterviewSchedule(id);
            return ResponseEntity.ok(ResponseDTO.builder().code(200).data(updatedInterviewSchedule).build());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponseDTO.builder().message(e.getMessage()).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseDTO.builder().message("An unexpected error occurred" + e.getMessage()).build());
        }
    }


    @GetMapping("/getInterviewTitle")
    public ResponseEntity<ResponseDTO> getInterviewTitle() {
        try {
            List<InterviewTitleDTO> interviewTitleDTOS = interviewScheduleService.getInterviewTitle();
            if (interviewTitleDTOS.isEmpty()) {
                ResponseDTO response = ResponseDTO.builder()
                        .message("Empty to get interview title")
                        .code(400)
                        .data(interviewTitleDTOS)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ResponseDTO response = ResponseDTO.builder()
                    .code(200)
                    .message("sucess")
                    .data(interviewTitleDTOS)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ResponseDTO response = ResponseDTO.builder()
                    .message("Internal server error")
                    .code(500)
                    .data(null)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @PostMapping("/{id}/send-reminder")
    public ResponseEntity<ResponseDTO> sendInterviewNotification(@PathVariable Integer id) {
        boolean success = interviewScheduleService.sendInterviewNotifications(id);

        if (success) {
            InterviewScheduleDTO updatedSchedule = interviewScheduleService.findInterviewScheduleById(id);
            return ResponseEntity.ok(ResponseDTO.builder()
                    .message("Invitation sent successfully")
                    .data(updatedSchedule)
                    .build());
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to send invitation. Please check logs for details.")
                            .build());
        }
    }

    @GetMapping("/get-all-interview-schedule-interviewer/{id}")
    public ResponseEntity<ResponseDTO> searchAndFilterInterviewSchedulesInterviewer(
            @PathVariable Integer id,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam Integer pageNumber) {

        Pageable pageable = PageRequest.of(pageNumber, 10);
        Page<InterviewSchedule> interviewSchedules = interviewScheduleService.findInterviewSchedulesInterviewer(id, keyword, status, pageable);

        if (interviewSchedules.isEmpty()) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().message("No interview schedules found for the given filters").build());
        }

        List<InterviewScheduleDTO> interviewScheduleDTOS = interviewSchedules.getContent().stream()
                .map(interviewScheduleService::parseInterviewToInterviewDTO)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("interviewSchedules", interviewScheduleDTOS);
        response.put("pageNumber", interviewSchedules.getNumber());
        response.put("totalPages", interviewSchedules.getTotalPages());

        return ResponseEntity.ok().body(ResponseDTO.builder().data(response).message("Search and filter interview schedules success").build());
    }

}
