package com.group2.InterviewManagement.services.Impl;

import com.group2.InterviewManagement.Enum.CandidateStatus;
import com.group2.InterviewManagement.Enum.OfferStatus;
import com.group2.InterviewManagement.dto.OfferResponse.*;
import com.group2.InterviewManagement.dto.request.CreateOfferRequest;
import com.group2.InterviewManagement.dto.request.EditOfferRequest;
import com.group2.InterviewManagement.dto.response.CustomPageDTO;
import com.group2.InterviewManagement.exception.AppException;
import com.group2.InterviewManagement.exception.ErrorCode;
import com.group2.InterviewManagement.models.Offer;
import com.group2.InterviewManagement.repository.CandidateRepository;
import com.group2.InterviewManagement.repository.InterviewScheduleRepository;
import com.group2.InterviewManagement.repository.OfferRepository;
import com.group2.InterviewManagement.repository.UserRepository;
import com.group2.InterviewManagement.services.EmailServices;
import com.group2.InterviewManagement.services.OfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class OfferServiceImpl implements OfferService {

    private OfferRepository offerRepository;
    private CandidateRepository candidateRepository;
    private UserRepository userRepository;
    private InterviewScheduleRepository interviewScheduleRepository;
    private EmailServices emailServices;

    @Autowired
    public OfferServiceImpl(OfferRepository offerRepository, CandidateRepository candidateRepository, UserRepository userRepository, InterviewScheduleRepository interviewScheduleRepository, EmailServices emailServices) {
        this.offerRepository = offerRepository;
        this.candidateRepository = candidateRepository;
        this.userRepository = userRepository;
        this.interviewScheduleRepository = interviewScheduleRepository;
        this.emailServices = emailServices;
    }

    @Override
    public Offer findByOfferId(Integer offerId) {
        return offerRepository.findByOfferId(offerId);
    }

    @Override
    public GetOfferByIdResponse GetOfferById(Integer offerId) {
        try {
            Offer offer = offerRepository.findByOfferId(offerId);
            if (offer.getInterviewSchedule() == null) {
                return parseOfferToGetOfferByIdNoInterviewResponse(offer);
            }
            return parseOfferToGetOfferByIdResponse(offer);
        } catch (Exception e) {
            return null;
        }

    }

    @Override
    public CustomPageDTO<ViewOfferResponse> viewOffer(Pageable pageable) {
        Page<ViewOfferResponse> offers = offerRepository.viewOffer(pageable);
        return new CustomPageDTO<>(offers.getTotalElements(), offers.getNumber(), pageable.getPageSize(), offers.getContent());
    }

    @Override
    public CustomPageDTO<ViewOfferResponse> searchOffers(String search, String department, String status, Pageable pageable) {
        Page<ViewOfferResponse> offers = offerRepository.searchOffers(search, department, status, pageable);
        return new CustomPageDTO<>(offers.getTotalElements(), offers.getNumber(), pageable.getPageSize(), offers.getContent());
    }

    @Override
    public Offer createOffer(CreateOfferRequest offerRequestDTO) {
        Offer offer = parseCreateOfferRequestToOffer(offerRequestDTO);
        Offer offers = offerRepository.save(offer);
        candidateRepository.updateCandidateStatus((offerRequestDTO.getCandidateName()), String.valueOf(CandidateStatus.WAITING_FOR_APPROVAL.getDisplayName()));
        return offers;
    }

    @Override
    public Offer editOffer(EditOfferRequest request) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        if (offerRepository.existsEditByCandidateId(candidateRepository.findByEmail(request.getCandidateName()).getCandidateId(), request.getOfferId())) {
            throw new AppException(ErrorCode.CandidateNameExists);
        }
        if (offerRepository.existsEditByScheduleId(request.getScheduleInfo(), request.getOfferId())) {
            throw new AppException(ErrorCode.ScheduleInfoExists);
        }
        Offer offer = offerRepository.findByOfferId(request.getOfferId());
        offer.setCandidate(candidateRepository.findByEmail(request.getCandidateName()));
        offer.setPosition(request.getPosition());
        offer.setApproveByManager(userRepository.findByUsername(request.getApproverBy()));
        offer.setInterviewSchedule(interviewScheduleRepository.findById(request.getScheduleInfo()));
        offer.setContractStart(request.getContractPeriodFrom());
        offer.setContractEnd(request.getContractPeriodTo());
        offer.setContractType(request.getContractType());
        offer.setLevel(request.getLevel());
        offer.setDepartment(request.getDepartment());
        offer.setRecruiterOwner(userRepository.findByUsername(request.getRecruiterOwner()));
        offer.setDueDate(request.getDueDate());
        offer.setBasicSalary(request.getBasicSalary());
        offer.setNote(request.getNote());
        offer.setUpdateAt(LocalDate.now());
        offer.setUpdateBy(userRepository.findByUsername(username));
        offerRepository.save(offer);
        return offer;

    }

    @Override
    public ViewOfferDetailResponse viewOfferDetail(int offerId) {
        try {
            Offer offer = offerRepository.findByOfferId(offerId);
            if (offer.getInterviewSchedule() == null) {
                return parseOfferToViewOfferDetailNoInterviewResponse(offer);
            }
            return parseOfferToViewOfferDetailResponse(offer);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public ViewOfferDetailResponse approveOffer(int offerId) {
        try {
            Offer offer = offerRepository.findByOfferId(offerId);
            offer.setOfferStatus(OfferStatus.APPROVED.getDisplayName());
            offerRepository.save(offer);
            candidateRepository.updateCandidateStatus(offer.getCandidate().getCandidateId(), String.valueOf(CandidateStatus.APPROVED_OFFER.getDisplayName()));
            return parseOfferToViewOfferDetailResponse(offer);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public ViewOfferDetailResponse rejectOffer(int offerId, String reason) {
            Offer offer = offerRepository.findByOfferId(offerId);
            offer.setOfferStatus(OfferStatus.REJECTED.getDisplayName());
            offer.setReasonReject(reason);
            candidateRepository.updateCandidateStatus(offer.getCandidate().getCandidateId(), String.valueOf(CandidateStatus.REJECTED_OFFER.getDisplayName()));
            offerRepository.save(offer);
            if (offer.getInterviewSchedule() == null) {
                return parseOfferToViewOfferDetailNoInterviewResponse(offer);
            }
            return parseOfferToViewOfferDetailResponse(offer);
    }

    @Override
    public ViewOfferDetailResponse markOfferAsSent(int offerId) {
        try {
            Offer offer = offerRepository.findByOfferId(offerId);
            offer.setOfferStatus(OfferStatus.WAITING_FOR_RESPONSE.getDisplayName());
            offerRepository.save(offer);
            candidateRepository.updateCandidateStatus(offer.getCandidate().getCandidateId(), String.valueOf(CandidateStatus.WAITING_FOR_RESPONSE.getDisplayName()));
            return parseOfferToViewOfferDetailResponse(offer);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public ViewOfferDetailResponse acceptOffer(int offerId) {
        try {
            Offer offer = offerRepository.findByOfferId(offerId);
            offer.setOfferStatus(OfferStatus.ACCEPTED_OFFER.getDisplayName());
            offerRepository.save(offer);
            candidateRepository.updateCandidateStatus(offer.getCandidate().getCandidateId(), String.valueOf(CandidateStatus.ACCEPTED_OFFER.getDisplayName()));
            return parseOfferToViewOfferDetailResponse(offer);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public ViewOfferDetailResponse declineOffer(int offerId) {
        try {
            Offer offer = offerRepository.findByOfferId(offerId);
            offer.setOfferStatus(OfferStatus.DECLINED_OFFER.getDisplayName());
            offerRepository.save(offer);
            candidateRepository.updateCandidateStatus(offer.getCandidate().getCandidateId(), String.valueOf(CandidateStatus.DECLINED_OFFER.getDisplayName()));
            return parseOfferToViewOfferDetailResponse(offer);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public ViewOfferDetailResponse cancelOffer(int offerId) {
        try {
            Offer offer = offerRepository.findByOfferId(offerId);
            offer.setOfferStatus(OfferStatus.CANCELLED.getDisplayName());
            offerRepository.save(offer);
            candidateRepository.updateCandidateStatus(offer.getCandidate().getCandidateId(), String.valueOf(CandidateStatus.CANCELLED_OFFER.getDisplayName()));
            return parseOfferToViewOfferDetailResponse(offer);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public ViewOfferDetailResponse updateStatus(int offerId, String status) {
        Offer offer = offerRepository.findByOfferId(offerId);
        if (status.toLowerCase() .equals( (OfferStatus.APPROVED.getDisplayName()).toLowerCase())) {
            offer.setOfferStatus(OfferStatus.APPROVED.getDisplayName());
            candidateRepository.updateCandidateStatus(offer.getCandidate().getCandidateId(), String.valueOf(CandidateStatus.APPROVED_OFFER.getDisplayName()));
        }else
        if (status.toLowerCase() .equals( OfferStatus.REJECTED.getDisplayName().toLowerCase())) {
            offer.setOfferStatus(OfferStatus.REJECTED.getDisplayName());
            candidateRepository.updateCandidateStatus(offer.getCandidate().getCandidateId(), String.valueOf(CandidateStatus.REJECTED_OFFER.getDisplayName()));
        }else
        if (status.toLowerCase() .equals( OfferStatus.WAITING_FOR_RESPONSE.getDisplayName().toLowerCase())) {
            offer.setOfferStatus(OfferStatus.WAITING_FOR_RESPONSE.getDisplayName());
            candidateRepository.updateCandidateStatus(offer.getCandidate().getCandidateId(), String.valueOf(CandidateStatus.WAITING_FOR_RESPONSE.getDisplayName()));
        } else
        if (status.toLowerCase() .equals( OfferStatus.ACCEPTED_OFFER.getDisplayName().toLowerCase())) {
            offer.setOfferStatus(OfferStatus.ACCEPTED_OFFER.getDisplayName());
            candidateRepository.updateCandidateStatus(offer.getCandidate().getCandidateId(), String.valueOf(CandidateStatus.ACCEPTED_OFFER.getDisplayName()));
        }else
        if (status.toLowerCase().equals( OfferStatus.DECLINED_OFFER.getDisplayName().toLowerCase())) {
            offer.setOfferStatus(OfferStatus.DECLINED_OFFER.getDisplayName());
            candidateRepository.updateCandidateStatus(offer.getCandidate().getCandidateId(), String.valueOf(CandidateStatus.DECLINED_OFFER.getDisplayName()));
        }else
        if (status.toLowerCase().equals(OfferStatus.CANCELLED.getDisplayName().toLowerCase())){
            offer.setOfferStatus(OfferStatus.CANCELLED.getDisplayName());
            candidateRepository.updateCandidateStatus(offer.getCandidate().getCandidateId(), String.valueOf(CandidateStatus.CANCELLED_OFFER.getDisplayName()));
        }else
        if (status.toLowerCase().equals(OfferStatus.WAITING_FOR_APPROVAL.getDisplayName().toLowerCase())){
            offer.setOfferStatus(OfferStatus.WAITING_FOR_APPROVAL.getDisplayName());
            candidateRepository.updateCandidateStatus(offer.getCandidate().getCandidateId(), String.valueOf(CandidateStatus.WAITING_FOR_APPROVAL.getDisplayName()));
        }
        offerRepository.save(offer);
        if (offer.getInterviewSchedule() == null) {
            return parseOfferToViewOfferDetailNoInterviewResponse(offer);
        }
            return parseOfferToViewOfferDetailResponse(offer);
    }

    @Override
    public void sendReminders() {
        String url = EndPointServices.front_end_host+"/offer-detail/";
        List<Offer> offers = offerRepository.findByDueDateAndOfferStatus(LocalDate.now(), OfferStatus.WAITING_FOR_APPROVAL.getDisplayName());
        for (Offer offer : offers) {
            emailServices.sendEmail(
                    "interviewmanagement.fa.fpt@gmail.com",
                    offer.getApproveByManager().getEmail(),
                    "Reminder to take action on the offer",
                    "Please review the offer. Click here to review: <a href=\"" + EndPointServices.front_end_host+"/offer-detail/" + offer.getOfferId() + "\">here</a>"
            );
        }
    }

    public List<Offer> getOffersBetweenDates(LocalDate fromDate, LocalDate toDate) {
        return offerRepository.exportExcel(fromDate, toDate);
    }

    @Override
    public ViewOfferDetailResponse parseOfferToViewOfferDetailResponse(Offer offer) {
        ViewOfferDetailResponse viewOfferDetailResponse = ViewOfferDetailResponse.builder()
                .offerId(offer.getOfferId())
                .candidateName(offer.getCandidate().getFullName())
                .approver(offer.getApproveByManager().getFullName())
                .approverUsername(offer.getApproveByManager().getUsername())
                .interviewInfoTitle(offer.getInterviewSchedule().getScheduleTitle())
                .contractPeriodFrom(offer.getContractStart())
                .contractPeriodTo(offer.getContractEnd())
                .interviewNotes(offer.getInterviewSchedule().getNote())
                .interviewInfoName(offerRepository.listInterviewByOfferId(offer.getOfferId()))
                .contractType(offer.getContractType())
                .level(offer.getLevel())
                .department(offer.getDepartment())
                .position(offer.getPosition())
                .dueDate(offer.getDueDate())
                .basicSalary(offer.getBasicSalary())
                .note(offer.getNote())
                .reasonReject(offer.getReasonReject())
                .recruiterOwner(offer.getRecruiterOwner().getUsername())
                .status(offer.getOfferStatus())
                .createAt(offer.getCreateAt())
                .updateBy(offer.getUpdateBy().getUsername())
                .updateAt(offer.getUpdateAt())
                .build();
        return viewOfferDetailResponse;
    }
    @Override
    public ViewOfferDetailResponse parseOfferToViewOfferDetailNoInterviewResponse(Offer offer) {
        ViewOfferDetailResponse viewOfferDetailResponse = ViewOfferDetailResponse.builder()
                .offerId(offer.getOfferId())
                .candidateName(offer.getCandidate().getFullName())
                .approver(offer.getApproveByManager().getFullName())
                .approverUsername(offer.getApproveByManager().getUsername())
                .contractPeriodFrom(offer.getContractStart())
                .contractPeriodTo(offer.getContractEnd())
                .contractType(offer.getContractType())
                .level(offer.getLevel())
                .department(offer.getDepartment())
                .position(offer.getPosition())
                .dueDate(offer.getDueDate())
                .basicSalary(offer.getBasicSalary())
                .note(offer.getNote())
                .reasonReject(offer.getReasonReject())
                .recruiterOwner(offer.getRecruiterOwner().getUsername())
                .status(offer.getOfferStatus())
                .createAt(offer.getCreateAt())
                .updateBy(offer.getUpdateBy().getUsername())
                .updateAt(offer.getUpdateAt())
                .build();
        return viewOfferDetailResponse;
    }
    @Override
    public Offer parseCreateOfferRequestToOffer(CreateOfferRequest dto) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        Offer offers = Offer.builder()
                .candidate(candidateRepository.getByCandidateId(dto.getCandidateName()))
                .position(dto.getPosition())
                .approveByManager(userRepository.findByUsername(dto.getApproverBy()))
                .interviewSchedule(interviewScheduleRepository.findById(dto.getScheduleInfo()))
                .contractStart(dto.getContractPeriodFrom())
                .contractEnd(dto.getContractPeriodTo())
                .contractType(dto.getContractType())
                .level(dto.getLevel())
                .department(dto.getDepartment())
                .recruiterOwner(userRepository.findByUsername(dto.getRecruiterOwner()))
                .dueDate(dto.getDueDate())
                .basicSalary(dto.getBasicSalary())
                .note(dto.getNote())
                .updateAt(LocalDate.now())
                .createAt(LocalDate.now())
                .updateBy(userRepository.findByUsername(username))
                .offerStatus(OfferStatus.WAITING_FOR_APPROVAL.getDisplayName())  // Theo business rule
                .isActive(true)
                .build();
        return offers;

    }

    @Override
    public GetOfferByIdResponse parseOfferToGetOfferByIdResponse(Offer offer) {
        GetOfferByIdResponse getOfferByIdResponse = GetOfferByIdResponse.builder()
                .offerId(offer.getOfferId())
                .candidateId(offer.getCandidate().getCandidateId())
                .candidateName(offer.getCandidate().getFullName())
                .email(offer.getCandidate().getEmail())
                .approverBy(offer.getApproveByManager().getFullName())
                .approverByUsername(offer.getApproveByManager().getUsername())
                .interviewInfo((offer.getInterviewSchedule().getScheduleId()))
                .interviewTitle((offer.getInterviewSchedule().getScheduleTitle()))
                .contractPeriodFrom(offer.getContractStart())
                .contractPeriodTo(offer.getContractEnd())
                .interviewNotes((offer.getInterviewSchedule().getNote()))
                .contractType(offer.getContractType())
                .level(offer.getLevel())
                .department(offer.getDepartment())
                .position(offer.getPosition())
                .dueDate(offer.getDueDate())
                .basicSalary(offer.getBasicSalary())
                .note(offer.getNote())
                .recruiterOwnerFullName(offer.getRecruiterOwner().getFullName())
                .recruiterOwner(offer.getRecruiterOwner().getUsername())
                .status(offer.getOfferStatus())
                .createAt(offer.getCreateAt())
                .updateBy(offer.getUpdateBy().getUserId())
                .updateAt(offer.getUpdateAt())
                .isActive(offer.isActive())
                .build();
        return getOfferByIdResponse;

    }

    @Override
    public GetOfferByIdResponse parseOfferToGetOfferByIdNoInterviewResponse(Offer offer) {

        GetOfferByIdResponse getOfferByIdResponse = GetOfferByIdResponse.builder()
                .offerId(offer.getOfferId())
                .candidateId(offer.getCandidate().getCandidateId())
                .candidateName(offer.getCandidate().getFullName())
                .email(offer.getCandidate().getEmail())
                .approverBy(offer.getApproveByManager().getFullName())
                .approverByUsername(offer.getApproveByManager().getUsername())
                .contractPeriodFrom(offer.getContractStart())
                .contractPeriodTo(offer.getContractEnd())
                .contractType(offer.getContractType())
                .level(offer.getLevel())
                .department(offer.getDepartment())
                .position(offer.getPosition())
                .dueDate(offer.getDueDate())
                .basicSalary(offer.getBasicSalary())
                .note(offer.getNote())
                .recruiterOwnerFullName(offer.getRecruiterOwner().getFullName())
                .recruiterOwner(offer.getRecruiterOwner().getUsername())
                .status(offer.getOfferStatus())
                .createAt(offer.getCreateAt())
                .updateBy(offer.getUpdateBy().getUserId())
                .updateAt(offer.getUpdateAt())
                .isActive(offer.isActive())
                .build();
        return getOfferByIdResponse;

    }
}