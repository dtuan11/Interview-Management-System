package com.group2.InterviewManagement.dto.OfferResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ViewOfferResponse {
    private int offerId;
    private String candidateName;
    private String email;
    private String approvedBy;
    private String approverUsername;
    private String recruiterOwner;
    private String department;
    private String notes;
    private String status;
}
