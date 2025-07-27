package com.group2.InterviewManagement.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EditOfferRequest {
    private int offerId;
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
}
