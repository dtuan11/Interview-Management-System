package com.group2.InterviewManagement.dto.OfferResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GetOfferByIdResponse {
    private int offerId;
    private int candidateId;
    private String candidateName;
    private String email;
    private String position;
    private String approverBy;
    private String approverByUsername;
    private int interviewInfo;
    private String interviewTitle;
    private String interviewNotes;
    private LocalDate contractPeriodFrom;
    private LocalDate contractPeriodTo;
    private String contractType;
    private String level;
    private String department;
    private String recruiterOwnerFullName;
    private String recruiterOwner;
    private LocalDate dueDate;
    private double basicSalary;
    private String note;
    private LocalDate createAt;
    private LocalDate updateAt;
    private int updateBy;
    private String status;
    private boolean isActive;
}
