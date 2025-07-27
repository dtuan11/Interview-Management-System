package com.group2.InterviewManagement.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CandidateDetailDTO {
    private int candidateId;
    private String fullName;
    private String email;
    private boolean gender;
    private String phoneNumber;
    private String address;
    private LocalDate dob;
    private String candidateStatus;
    @JsonIgnore
    private MultipartFile cvAttachmentFile;
    private String cvAttachmentFileName;
    private String cvAttachmentUrl;
    private String position;
    private String skills;
    private String yearOfExperience;
    private String highest_level;
    private String note;
    private UserCandidateDTO recruiterDTO;
    private UserCandidateDTO updaterDTO;
    private boolean isActive;
    private LocalDate createAt;
    private LocalDate updateAt;
}
