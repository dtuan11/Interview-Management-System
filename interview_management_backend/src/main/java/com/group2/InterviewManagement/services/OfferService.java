package com.group2.InterviewManagement.services;

import com.group2.InterviewManagement.dto.CreateOfferDTO;
import com.group2.InterviewManagement.dto.OfferResponse.*;
import com.group2.InterviewManagement.dto.request.CreateOfferRequest;
import com.group2.InterviewManagement.dto.request.EditOfferRequest;
import com.group2.InterviewManagement.dto.response.CustomPageDTO;
import com.group2.InterviewManagement.models.Offer;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;


public interface OfferService {
    CustomPageDTO<ViewOfferResponse> viewOffer(Pageable pageable);
    CustomPageDTO<ViewOfferResponse> searchOffers(String search, String department, String status, Pageable pageable);
    Offer createOffer(CreateOfferRequest offerRequestDTO);
    Offer editOffer(EditOfferRequest request);
    Offer findByOfferId(Integer offerId);
    GetOfferByIdResponse GetOfferById(Integer offerId);
    ViewOfferDetailResponse viewOfferDetail(int offerId);
    ViewOfferDetailResponse approveOffer(int offerId);
    ViewOfferDetailResponse rejectOffer(int offerId,String reason);
    ViewOfferDetailResponse markOfferAsSent(int offerId);
    ViewOfferDetailResponse acceptOffer(int offerId);
    ViewOfferDetailResponse declineOffer(int offerId);
    ViewOfferDetailResponse cancelOffer(int offerId);

    ViewOfferDetailResponse updateStatus(int offerId, String status);

    void sendReminders();
    List<Offer> getOffersBetweenDates(LocalDate fromDate, LocalDate toDate);
    ViewOfferDetailResponse parseOfferToViewOfferDetailResponse(Offer offer);

    Offer parseCreateOfferRequestToOffer(CreateOfferRequest dto);

    ViewOfferDetailResponse parseOfferToViewOfferDetailNoInterviewResponse(Offer offer);

    GetOfferByIdResponse parseOfferToGetOfferByIdResponse(Offer offer);

    GetOfferByIdResponse parseOfferToGetOfferByIdNoInterviewResponse(Offer offer);
}