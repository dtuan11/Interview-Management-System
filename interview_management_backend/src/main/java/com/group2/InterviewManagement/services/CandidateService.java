package com.group2.InterviewManagement.services;

import com.group2.InterviewManagement.dto.CandidateDTO;
import com.group2.InterviewManagement.dto.CandidateDetailDTO;
import com.group2.InterviewManagement.dto.CandidateNameDTO;
import com.group2.InterviewManagement.models.Candidate;
import com.group2.InterviewManagement.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CandidateService {
    String BAN = "BAN";
    String DELETE = "DELETE";

    Candidate findById(int id);

    Candidate save(Candidate candidate);
    List<CandidateDTO> parseCandidatesToCandidateDTOs(List<Candidate> candidates);

    CandidateDTO parseCandidateToCandidateDTO(Candidate candidate);

    CandidateDetailDTO parseCandidateToCandidateDetailDTO(Candidate candidate);

    Candidate parseCandidateDetailDTOToCandidate(CandidateDetailDTO candidateDetailDTO);

    Candidate parseCandidateDTOtoCandidate(CandidateDTO candidateDTO);

    Page<Candidate> findCandidateAndPaging(String keyword, String status, boolean isActive, Pageable pageable);
    CandidateNameDTO parseCandidateToCandidateNameDTO(Candidate candidate);
    List<Candidate> getOpenCandidates();
    List<Candidate> findAllByIsActiveIsTrue();
    List<CandidateNameDTO> getAllCandidate(String candidateStatus);

    boolean updateCandidate(CandidateDetailDTO candidateDetailDTO);



    boolean existsCandidateByEmailAndIsActiveIsTrue(String email);
    boolean existsCandidateByPhoneAndIsActiveIsTrue(String phone);
    boolean banOrDeleteCandidate(Candidate candidate, User updater, String action);
    boolean unbanCandidate(Candidate candidate, User updater);
}