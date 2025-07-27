package com.group2.InterviewManagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.group2.InterviewManagement.dto.OfferResponse.*;
import com.group2.InterviewManagement.dto.request.CreateOfferRequest;
import com.group2.InterviewManagement.dto.request.EditOfferRequest;
import com.group2.InterviewManagement.dto.response.CustomPageDTO;
import com.group2.InterviewManagement.dto.response.ResponseDTO;
import com.group2.InterviewManagement.models.Offer;
import com.group2.InterviewManagement.services.OfferService;
import com.group2.InterviewManagement.utils.ExcelExporter;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("api/offer")
public class OfferController {

    private final OfferService offerService;

    @Autowired
    public OfferController(OfferService offerService) {
        this.offerService = offerService;

    }

    @GetMapping("/getOffer/{pageIndex}")
    public ResponseEntity<ResponseDTO> getAll(
            @RequestParam(defaultValue = "0") int pageIndex){
        try{
            Pageable pageable = PageRequest.of(pageIndex, 10);
            CustomPageDTO<ViewOfferResponse> viewOfferList = offerService.viewOffer(pageable);
            ResponseDTO response = ResponseDTO.builder()
                    .message("sucess")
                    .code(200)
                    .data(viewOfferList)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.OK);
        }catch (Exception e){
            ResponseDTO response = ResponseDTO.builder()
                    .message("Internal server error")
                    .code(500)
                    .data(null)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/search/{pageIndex}")
    public ResponseEntity<ResponseDTO> searchOffers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @PathVariable(value = "pageIndex") int pageIndex){
        try {
            Pageable pageable = PageRequest.of(pageIndex, 10);
            CustomPageDTO<ViewOfferResponse> viewOfferList = offerService.searchOffers(search, department, status, pageable);
            if(viewOfferList.getTotal()==0){
                ResponseDTO response = ResponseDTO.builder()
                        .message("No item matches with your search data. Please try again")
                        .code(200)
                        .data(viewOfferList)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
            ResponseDTO response = ResponseDTO.builder()
                    .message("success")
                    .code(200)
                    .data(viewOfferList)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ResponseDTO response = ResponseDTO.builder()
                    .message("Internal server error")
                    .code(500)
                    .data(null)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PostMapping("/create")
    public ResponseEntity<ResponseDTO> createOffer(
            @RequestBody CreateOfferRequest offerRequestDTO) {
            Offer offerResponseDTO = offerService.createOffer(offerRequestDTO);
            if (offerResponseDTO==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("Failed to created offer")
                        .code(400)
                        .data(offerResponseDTO)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ResponseDTO response = ResponseDTO.builder()
                    .message("Sucessfully created offer")
                    .code(200)
                    .data(offerResponseDTO)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.OK);

    }
    @PutMapping("/edit")
    public ResponseEntity<ResponseDTO> editOffer(
            @RequestBody EditOfferRequest editOfferRequest) {
        Offer offerResponseDTO = offerService.editOffer(editOfferRequest);
            if (offerResponseDTO==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("Failed to updated change")
                        .code(400)
                        .data(offerResponseDTO)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ResponseDTO response = ResponseDTO.builder()
                    .message("Change has been successfully updated")
                    .code(200)
                    .data(offerResponseDTO)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @GetMapping("/getOfferById/{id}")
    public ResponseEntity<ResponseDTO> getOfferById(
            @PathVariable("id") int id){
        try {
            Offer offer=offerService.findByOfferId(id);
            if (offer==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("OfferId does not exist")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            GetOfferByIdResponse getOfferByIdResponse = offerService.GetOfferById(id);
            if (getOfferByIdResponse==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("Fail to view offer getOfferById")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ResponseDTO response = ResponseDTO.builder()
                    .message("Sucess")
                    .code(200)
                    .data(getOfferByIdResponse)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ResponseDTO response = ResponseDTO.builder()
                    .message("Internal server error")
                    .code(500)
                    .data(null)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/viewOfferDetail/{id}")
    public ResponseEntity<ResponseDTO> viewOfferDetail(
            @PathVariable("id") int id){
        try {
            Offer offer=offerService.findByOfferId(id);
            if (offer==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("OfferId does not exist")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
                ViewOfferDetailResponse viewOfferDetailResponse = offerService.viewOfferDetail(id);
                if (viewOfferDetailResponse == null) {
                    ResponseDTO response = ResponseDTO.builder()
                            .message("Fail to view offer detail")
                            .code(400)
                            .data(null)
                            .build();
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
                ResponseDTO response = ResponseDTO.builder()
                        .message("Sucess")
                        .code(200)
                        .data(viewOfferDetailResponse)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ResponseDTO response = ResponseDTO.builder()
                    .message("Internal server error")
                    .code(500)
                    .data(null)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PutMapping("/approveOffer/{id}")
    public ResponseEntity<ResponseDTO> approveOffer(
            @PathVariable("id") int id){
        try {
            Offer offer=offerService.findByOfferId(id);
            if (offer==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("OfferId does not exist")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ViewOfferDetailResponse viewOfferDetailResponse = offerService.approveOffer(id);
            if (viewOfferDetailResponse==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("Fail to update status approveOffer detail")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ResponseDTO response = ResponseDTO.builder()
                    .message("Sucess")
                    .code(200)
                    .data(viewOfferDetailResponse)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ResponseDTO response = ResponseDTO.builder()
                    .message("Internal server error")
                    .code(500)
                    .data(null)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PutMapping("/rejectOffer/{id}/{reason}")
    public ResponseEntity<ResponseDTO> rejectOffer(
            @PathVariable("id") int id,
            @PathVariable("reason") String reason){
        try {
            Offer offer=offerService.findByOfferId(id);
            if (offer==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("OfferId does not exist")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ViewOfferDetailResponse viewOfferDetailResponse = offerService.rejectOffer(id,reason);
            if (viewOfferDetailResponse==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("Fail to update status rejectOffer detail")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ResponseDTO response = ResponseDTO.builder()
                    .message("Sucess")
                    .code(200)
                    .data(viewOfferDetailResponse)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ResponseDTO response = ResponseDTO.builder()
                    .message("Internal server error")
                    .code(500)
                    .data(null)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PutMapping("/markOfferAsSent/{id}")
    public ResponseEntity<ResponseDTO> markOfferAsSent(
            @PathVariable("id") int id){
        try {
            Offer offer=offerService.findByOfferId(id);
            if (offer==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("OfferId does not exist")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ViewOfferDetailResponse viewOfferDetailResponse = offerService.markOfferAsSent(id);
            if (viewOfferDetailResponse==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("Fail to update status markOfferAsSent detail")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ResponseDTO response = ResponseDTO.builder()
                    .message("Sucess")
                    .code(200)
                    .data(viewOfferDetailResponse)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ResponseDTO response = ResponseDTO.builder()
                    .message("Internal server error")
                    .code(500)
                    .data(null)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PutMapping("/acceptOffer/{id}")
    public ResponseEntity<ResponseDTO> acceptOffer(
            @PathVariable("id") int id){
        try {
            Offer offer=offerService.findByOfferId(id);
            if (offer==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("OfferId does not exist")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ViewOfferDetailResponse viewOfferDetailResponse = offerService.acceptOffer(id);
            if (viewOfferDetailResponse==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("Fail to update status acceptOffer detail")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ResponseDTO response = ResponseDTO.builder()
                    .message("Sucess")
                    .code(200)
                    .data(viewOfferDetailResponse)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ResponseDTO response = ResponseDTO.builder()
                    .message("Internal server error")
                    .code(500)
                    .data(null)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PutMapping("/declineOffer/{id}")
    public ResponseEntity<ResponseDTO> declineOffer(
            @PathVariable("id") int id){
        try {
            Offer offer=offerService.findByOfferId(id);
            if (offer==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("OfferId does not exist")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ViewOfferDetailResponse viewOfferDetailResponse = offerService.declineOffer(id);
            if (viewOfferDetailResponse==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("Fail to update status declineOffer detail")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ResponseDTO response = ResponseDTO.builder()
                    .message("Sucess")
                    .code(200)
                    .data(viewOfferDetailResponse)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ResponseDTO response = ResponseDTO.builder()
                    .message("Internal server error")
                    .code(500)
                    .data(null)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PutMapping("/cancelOffer/{id}")
    public ResponseEntity<ResponseDTO> cancelOffer(
            @PathVariable("id") int id){
        try {
            Offer offer=offerService.findByOfferId(id);
            if (offer==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("OfferId does not exist")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ViewOfferDetailResponse viewOfferDetailResponse = offerService.cancelOffer(id);
            if (viewOfferDetailResponse==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("Fail to update status cancelOffer detail")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ResponseDTO response = ResponseDTO.builder()
                    .message("Sucess")
                    .code(200)
                    .data(viewOfferDetailResponse)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ResponseDTO response = ResponseDTO.builder()
                    .message("Internal server error")
                    .code(500)
                    .data(null)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PutMapping("/updateStatus/{id}/{status}")
    public ResponseEntity<ResponseDTO> cancelOffer(
            @PathVariable("id") int id,
            @PathVariable("status") String status){
        try {
            Offer offer=offerService.findByOfferId(id);
            if (offer==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("OfferId does not exist")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ViewOfferDetailResponse viewOfferDetailResponse = offerService.updateStatus(id, status);
            if (viewOfferDetailResponse==null){
                ResponseDTO response = ResponseDTO.builder()
                        .message("Fail to update status detail")
                        .code(400)
                        .data(null)
                        .build();
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            ResponseDTO response = ResponseDTO.builder()
                    .message("Sucess")
                    .code(200)
                    .data(viewOfferDetailResponse)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            ResponseDTO response = ResponseDTO.builder()
                    .message("Internal server error")
                    .code(500)
                    .data(null)
                    .build();
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/sendEmailReminder")
    public ResponseEntity<String> sendReminders() {
        offerService.sendReminders();
        return ResponseEntity.ok("Reminders sent successfully.");
    }
    @GetMapping("/export/{fromDate}/{toDate}")
    public void exportOffers(@PathVariable("fromDate") String fromDate,
                             @PathVariable("toDate") String toDate,
                             HttpServletResponse response) throws IOException {

        try {
            LocalDate start = LocalDate.parse(fromDate);
            LocalDate end = LocalDate.parse(toDate);

            List<Offer> offers = offerService.getOffersBetweenDates(start, end);

            if (offers.isEmpty()) {
                response.setContentType("application/json");
                response.setStatus(HttpServletResponse.SC_OK);
                ResponseDTO responseDTO = ResponseDTO.builder()
                        .message("No offer on the selected date")
                        .code(200)
                        .data(offers)
                        .build();
                response.getWriter().write(new ObjectMapper().writeValueAsString(responseDTO));
                return;
            } else {
                response.setContentType("application/octet-stream");
                String headerKey = "Content-Disposition";
                String headerValue = "attachment; filename=Offerlist_" + start + "_" + end + ".xlsx";
                response.setHeader(headerKey, headerValue);

                ExcelExporter excelExporter = new ExcelExporter(offers);
                excelExporter.export(response);
            }

        } catch (Exception e) {
            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            ResponseDTO responseDTO = ResponseDTO.builder()
                    .message("Internal server error")
                    .code(500)
                    .data(null)
                    .build();
            response.getWriter().write(new ObjectMapper().writeValueAsString(responseDTO));
        }
    }


}
