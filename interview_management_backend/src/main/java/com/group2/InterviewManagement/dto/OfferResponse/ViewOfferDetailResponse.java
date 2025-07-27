package com.group2.InterviewManagement.dto.OfferResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ViewOfferDetailResponse {
    private int offerId;
    private String candidateName;
    private String position;
    private String approver;
    private String approverUsername;
    private String interviewInfoTitle;
    private List<String> interviewInfoName;
    private LocalDate contractPeriodFrom;
    private LocalDate contractPeriodTo;
    private String interviewNotes;
    private String status;
    private String contractType;
    private String level;
    private String department;
    private String recruiterOwner;
    private LocalDate dueDate;
    private double basicSalary;
    private String note;
    private String reasonReject;
    private LocalDate createAt;
    private String updateBy;
    private LocalDate updateAt;
}
