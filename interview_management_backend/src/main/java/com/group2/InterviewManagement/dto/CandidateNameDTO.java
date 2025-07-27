package com.group2.InterviewManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CandidateNameDTO {
    private int candidateId;
    private String fullName;
    private String email;
    private String position;
    private int scheduleId;
    private String scheduleTitle;
    private String scheduleNote;
    private String level;
    private int recruiterOwnerId;
    private String recruiterOwnerFullName;
    private String recruiterOwnerusername;
}
