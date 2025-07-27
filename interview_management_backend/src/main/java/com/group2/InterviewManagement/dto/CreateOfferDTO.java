package com.group2.InterviewManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateOfferDTO {
    private String candidateName;
    private String position;
    private String approverBy;
    private int scheduleInfo;
    private LocalDate contractPeriodFrom;
    private LocalDate contractPeriodTo;
    private String contractType;
    private String level;
    private String department;
    private String recruiterOwner;
    private LocalDate dueDate;
    private double basicSalary;
    private String note;
    private LocalDate createAt;
    private LocalDate updateAt;
    private String updateBy;
    private String status;
    private boolean isActive;
}
