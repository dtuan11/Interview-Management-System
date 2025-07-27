package com.group2.InterviewManagement.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobDTO {
    private Integer jobId;
    private String jobTitle;
    private String isActive;
    private LocalDate startDate;
    private LocalDate endDate;
    private String jobSkills;
    private String jobLevel;
    private String jobBenefit;
    private double salaryRangeFrom;
    private double salaryRangeTo;
    private String workingAddress;
    private String jobDescription;
    private String jobStatus;
    private LocalDate createAt;
    private LocalDate updateAt;
    private Integer updateById;
    private String updateByUserName;
}