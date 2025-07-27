package com.group2.InterviewManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collector;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class UserCandidateDTO {
    private String id;
    private String fullName;
    private String username;
    private Boolean isActive;
    private int recruiterId;
    private String recruiterName;
    private String recruiterUserName;
}
