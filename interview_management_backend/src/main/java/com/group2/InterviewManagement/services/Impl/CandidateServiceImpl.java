package com.group2.InterviewManagement.services.Impl;

import com.group2.InterviewManagement.Enum.InterviewScheduleStatus;
import com.group2.InterviewManagement.Enum.OfferStatus;
import com.group2.InterviewManagement.dto.CandidateDTO;
import com.group2.InterviewManagement.dto.CandidateDetailDTO;
import com.group2.InterviewManagement.dto.CandidateNameDTO;
import com.group2.InterviewManagement.dto.UserCandidateDTO;
import com.group2.InterviewManagement.models.Candidate;
import com.group2.InterviewManagement.models.InterviewSchedule;
import com.group2.InterviewManagement.models.Offer;
import com.group2.InterviewManagement.models.User;
import com.group2.InterviewManagement.repository.CandidateRepository;
import com.group2.InterviewManagement.repository.InterviewScheduleRepository;
import com.group2.InterviewManagement.repository.OfferRepository;
import com.group2.InterviewManagement.repository.UserRepository;
import com.group2.InterviewManagement.services.CandidateService;
import com.group2.InterviewManagement.services.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static com.group2.InterviewManagement.Enum.CandidateStatus.BANNED;
import static com.group2.InterviewManagement.Enum.CandidateStatus.OPEN;

@Service
public class CandidateServiceImpl implements CandidateService {
    private CandidateRepository candidateRepository;
    private UserRepository userRepository;
    private OfferRepository offerRepository;
    private InterviewScheduleRepository interviewScheduleRepository;
    private FileService fileService;

    @Autowired
    public CandidateServiceImpl(CandidateRepository candidateRepository, UserRepository userRepository, OfferRepository offerRepository, InterviewScheduleRepository interviewScheduleRepository, FileService fileService) {
        this.candidateRepository = candidateRepository;
        this.userRepository = userRepository;
        this.offerRepository = offerRepository;
        this.interviewScheduleRepository = interviewScheduleRepository;
        this.fileService = fileService;
    }

    @Override
    public Candidate findById(int id) {
        return candidateRepository.getByCandidateId(id);
    }

    @Override
    public List<Candidate> getOpenCandidates() {
        return candidateRepository.findAllByCandidateStatus("Open");
    }


    @Override
    public Candidate save(Candidate candidate) {
        return candidateRepository.save(candidate);
    }

    @Override
    public List<CandidateDTO> parseCandidatesToCandidateDTOs(List<Candidate> candidates) {
        List<CandidateDTO> candidateDTOS = new ArrayList<>();
        for (Candidate candidate : candidates) {
            CandidateDTO candidateDTO = parseCandidateToCandidateDTO(candidate);
            candidateDTOS.add(candidateDTO);
        }
        return candidateDTOS;
    }

    @Override
    public CandidateDTO parseCandidateToCandidateDTO(Candidate candidate) {
        UserCandidateDTO recruiterDTO = UserCandidateDTO.builder()
                .fullName(candidate.getRecruiter().getFullName())
                .username(candidate.getRecruiter().getUsername())
                .id(String.valueOf(candidate.getRecruiter().getUserId()))
                .build();
        return CandidateDTO.builder()
                .fullName(candidate.getFullName())
                .recruiterDTO(recruiterDTO)
                .candidateId(candidate.getCandidateId())
                .candidateStatus(candidate.getCandidateStatus())
                .position(candidate.getPosition())
                .phoneNumber(candidate.getPhoneNumber())
                .email(candidate.getEmail())
                .build();
    }

    @Override
    public CandidateDetailDTO parseCandidateToCandidateDetailDTO(Candidate candidate) {
        UserCandidateDTO recruiterDTO = UserCandidateDTO.builder()
                .id(String.valueOf(candidate.getRecruiter().getUserId()))
                .username(candidate.getRecruiter().getUsername())
                .fullName(candidate.getRecruiter().getFullName())
                .build();
        UserCandidateDTO updaterDTO = UserCandidateDTO.builder()
                .id(String.valueOf(candidate.getUpdater().getUserId()))
                .fullName(candidate.getUpdater().getFullName())
                .username(candidate.getUpdater().getUsername())
                .build();

        CandidateDetailDTO candidateDetailDTO = CandidateDetailDTO.builder()
                .candidateId(candidate.getCandidateId())
                .candidateStatus(candidate.getCandidateStatus())
                .address(candidate.getAddress())
                .dob(candidate.getDob())
                .email(candidate.getEmail())
                .gender(candidate.isGender())
                .cvAttachmentUrl(candidate.getCvAttachment())
                .highest_level(candidate.getHighest_level())
                .fullName(candidate.getFullName())
                .skills(candidate.getSkills())
                .phoneNumber(candidate.getPhoneNumber())
                .note(candidate.getNote())
                .yearOfExperience(candidate.getYearOfExperience())
                .position(candidate.getPosition())
                .createAt(candidate.getCreateAt())
                .updateAt(candidate.getUpdateAt())
                .recruiterDTO(recruiterDTO)
                .updaterDTO(updaterDTO)
                .isActive(candidate.isActive())
                .build();

        String cvAttachmentUrl = candidate.getCvAttachment();

        if (!"N/A".equals(cvAttachmentUrl)) {
            candidateDetailDTO.setCvAttachmentUrl(cvAttachmentUrl);
            candidateDetailDTO.setCvAttachmentFileName(fileService.getFileName(cvAttachmentUrl));
        }

        return candidateDetailDTO;
    }

    @Override
    public Candidate parseCandidateDetailDTOToCandidate(CandidateDetailDTO candidateDetailDTO) {

        User recruiter = userRepository.findByUserId(Integer.parseInt(candidateDetailDTO.getRecruiterDTO().getId()));
        User updater = userRepository.findByUserId(Integer.parseInt(candidateDetailDTO.getUpdaterDTO().getId()));
        return Candidate.builder()
                .candidateId(candidateDetailDTO.getCandidateId())
                .candidateStatus(candidateDetailDTO.getCandidateStatus())
                .address(candidateDetailDTO.getAddress())
                .dob(candidateDetailDTO.getDob())
                .email(candidateDetailDTO.getEmail())
                .gender(candidateDetailDTO.isGender())
                .cvAttachment(candidateDetailDTO.getCvAttachmentUrl())
                .highest_level(candidateDetailDTO.getHighest_level())
                .fullName(candidateDetailDTO.getFullName())
                .skills(candidateDetailDTO.getSkills())
                .phoneNumber(candidateDetailDTO.getPhoneNumber())
                .note(candidateDetailDTO.getNote())
                .yearOfExperience(candidateDetailDTO.getYearOfExperience())
                .position(candidateDetailDTO.getPosition())
                .createAt(candidateDetailDTO.getCreateAt())
                .updateAt(candidateDetailDTO.getUpdateAt())
                .isActive(candidateDetailDTO.isActive())
                .updater(updater)
                .recruiter(recruiter)
                .build();
    }

    @Override
    public Candidate parseCandidateDTOtoCandidate(CandidateDTO candidateDTO) {
        return null;
    }


    @Override
    public Page<Candidate> findCandidateAndPaging(String keyword, String status, boolean isActive, Pageable pageable) {
        return candidateRepository.findCandidateAndPaging(keyword, status, isActive, pageable);
    }

    @Override
    public List<Candidate> findAllByIsActiveIsTrue() {
        return candidateRepository.findAllByIsActiveIsTrue();
    }

    @Override
    public CandidateNameDTO parseCandidateToCandidateNameDTO(Candidate candidate) {
        return CandidateNameDTO.builder()
                .fullName(candidate.getFullName())
                .candidateId(candidate.getCandidateId())
                .email(candidate.getEmail())
                .build();
    }

    @Override
    public List<CandidateNameDTO> getAllCandidate(String candidateStatus) {
        List<CandidateNameDTO> CandidateNameDTO = candidateRepository.getAllCandidate(candidateStatus);
        return CandidateNameDTO;
    }

    @Override
    public boolean updateCandidate(CandidateDetailDTO candidateDetailDTO) {
        try {
            Candidate candidate = candidateRepository.getByCandidateId(candidateDetailDTO.getCandidateId());
            User updater = userRepository.findByUserId(Integer.parseInt(candidateDetailDTO.getUpdaterDTO().getId()));
            User recruiter = userRepository.findByUserId(Integer.parseInt(candidateDetailDTO.getRecruiterDTO().getId()));

            candidate.setAddress(candidateDetailDTO.getAddress());
            candidate.setDob(candidateDetailDTO.getDob());
            candidate.setEmail(candidateDetailDTO.getEmail());
            candidate.setGender(candidateDetailDTO.isGender());
            candidate.setHighest_level(candidateDetailDTO.getHighest_level());
            candidate.setFullName(candidateDetailDTO.getFullName());
            candidate.setSkills(candidateDetailDTO.getSkills());
            candidate.setPhoneNumber(candidateDetailDTO.getPhoneNumber());
            candidate.setNote(candidateDetailDTO.getNote());
            candidate.setYearOfExperience(candidateDetailDTO.getYearOfExperience());
            candidate.setPosition(candidateDetailDTO.getPosition());
            candidate.setUpdateAt(candidateDetailDTO.getUpdateAt());
            candidate.setUpdater(updater);
            candidate.setRecruiter(recruiter);

            if (candidateDetailDTO.getCvAttachmentUrl() != null && !candidateDetailDTO.getCvAttachmentUrl().isEmpty()) {
                candidate.setCvAttachment(candidateDetailDTO.getCvAttachmentUrl());
            }

            candidateRepository.save(candidate);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
        return true;
    }

    @Override
    public boolean banOrDeleteCandidate(Candidate candidate, User updater, String action) {
        try {
            Offer offer = candidate.getOffer();
            List<InterviewSchedule> interviewSchedules = candidate.getInterviewSchedules();

            boolean hasOffer = offer != null;
            boolean hasInterviewSchedules = interviewSchedules != null && !interviewSchedules.isEmpty();

            // Log the status of the offer and interview schedules
            System.out.println("offer: " + hasOffer);
            System.out.println("inter: " + hasInterviewSchedules);

            if (BAN.equals(action)) {
                candidate.setCandidateStatus(BANNED.getDisplayName());
            } else {
                candidate.setActive(false);
            }

            candidate.setUpdater(updater);
            candidate.setUpdateAt(LocalDate.now());
            candidateRepository.save(candidate);

            if (hasOffer) {
                offer.setOfferStatus(OfferStatus.CANCELLED.getDisplayName());
                offerRepository.save(offer);
            }

            if (hasInterviewSchedules) {
                interviewSchedules.forEach(schedule -> {
                    schedule.setInterviewScheduleStatus(InterviewScheduleStatus.CANCELLED.getDisplayName());
                    interviewScheduleRepository.save(schedule);
                });
            }

            return true;

        } catch (Exception e) {
            System.err.println("Failed to ban candidate: " + e.getMessage());
            return false;
        }
    }


    @Override
    public boolean unbanCandidate(Candidate candidate, User updater) {
        try {
            candidate.setCandidateStatus(OPEN.getDisplayName());
            candidate.setUpdater(updater);
            candidate.setUpdateAt(LocalDate.now());
            candidateRepository.save(candidate);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to ban candidate: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean existsCandidateByEmailAndIsActiveIsTrue(String email) {
        return candidateRepository.existsCandidateByEmailAndIsActiveIsTrue(email);
    }

    @Override
    public boolean existsCandidateByPhoneAndIsActiveIsTrue(String phone) {
        return candidateRepository.existsCandidateByPhoneNumberAndIsActiveIsTrue(phone);
    }

}