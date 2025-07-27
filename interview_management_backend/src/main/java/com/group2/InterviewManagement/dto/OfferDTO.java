package com.group2.InterviewManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OfferDTO {
    private int offerId;
    private int candidateId;
    private int approveByManagerId;
    private String department;
    private String note;
    private String offerStatus;
    private boolean isActive;
    private String candidateName;
    private String position;
    private String interviewInfo;
    private LocalDate contractPeriodFrom;
    private LocalDate contractPeriodTo;
    private String interviewNotes;
    private String contractType;
    private String level;
    private String recruiterOwner;
    private LocalDate dueDate;
    private double basicSalary;
}
