package com.group2.InterviewManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CandidateDTO {
    private int candidateId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String candidateStatus;
    private String position;
    private UserCandidateDTO recruiterDTO;
}
