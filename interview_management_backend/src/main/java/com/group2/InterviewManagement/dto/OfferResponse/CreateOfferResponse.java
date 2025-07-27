package com.group2.InterviewManagement.dto.OfferResponse;

import com.group2.InterviewManagement.models.Offer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateOfferResponse {
    private String message;
    private Offer data;

}
