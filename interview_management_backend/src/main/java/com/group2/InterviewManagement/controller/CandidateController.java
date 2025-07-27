package com.group2.InterviewManagement.controller;

import com.group2.InterviewManagement.Enum.CandidateStatus;
import com.group2.InterviewManagement.dto.CandidateDTO;
import com.group2.InterviewManagement.dto.CandidateDetailDTO;
import com.group2.InterviewManagement.dto.CandidateNameDTO;
import com.group2.InterviewManagement.dto.UserCandidateDTO;
import com.group2.InterviewManagement.dto.response.ResponseDTO;
import com.group2.InterviewManagement.exception.ErrorCode;
import com.group2.InterviewManagement.models.Candidate;
import com.group2.InterviewManagement.models.User;
import com.group2.InterviewManagement.services.CandidateService;
import com.group2.InterviewManagement.services.FileService;
import com.group2.InterviewManagement.services.OfferService;
import com.group2.InterviewManagement.services.UserServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import static com.group2.InterviewManagement.Enum.Role.RECRUITER;

@RestController
@RequestMapping("/api/candidate")
public class CandidateController {
    private CandidateService candidateService;
    private FileService fileService;
    private UserServices userServices;
    private OfferService offerService;

    @Autowired
    public CandidateController(CandidateService candidateService, FileService fileService, UserServices userServices, OfferService offerService) {
        this.candidateService = candidateService;
        this.fileService = fileService;
        this.userServices = userServices;
        this.offerService = offerService;
    }

    @GetMapping("/get-all-candidate")
    public ResponseEntity<ResponseDTO> getAllCandidate(@RequestParam() Integer pageNumber,
                                                       @RequestParam(required = false) String keyword,
                                                       @RequestParam(required = false) String status) {
        Pageable pageable = PageRequest.of(pageNumber, 10);
        if (keyword.isEmpty() && keyword == null) {
            keyword = "";
        }

        if (status.isEmpty() && status == null) {
            status = "";
        }
        Page<Candidate> candidates = candidateService.findCandidateAndPaging(keyword, status, true, pageable);

        if (candidates == null) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().message("Get all candidate fail!").build());
        }

        List<CandidateDTO> candidateDTOS = candidateService.parseCandidatesToCandidateDTOs(candidates.getContent());
        HashMap<String, Object> mapCandidate = new HashMap<>();

        mapCandidate.put("candidateList", candidateDTOS);
        mapCandidate.put("pageNumber", candidates.getNumber());
        mapCandidate.put("totalPage", candidates.getTotalPages());

        return ResponseEntity.ok().body(ResponseDTO.builder().code(200).data(mapCandidate).message("Get all candidate success").build());
    }

    @PostMapping("/save-candidate")
    public ResponseEntity<ResponseDTO> save(@ModelAttribute CandidateDetailDTO candidateDetailDTO) {
        try {
            // Kiểm tra file đính kèm CV
            if (candidateDetailDTO.getCvAttachmentFile() != null && !candidateDetailDTO.getCvAttachmentFile().isEmpty()) {
                String cvAttachmentUrl = uploadCvFile(candidateDetailDTO.getCvAttachmentFile(), "CV_" + candidateDetailDTO.getFullName());
                candidateDetailDTO.setCvAttachmentUrl(cvAttachmentUrl);
            } else {
                candidateDetailDTO.setCvAttachmentUrl("N/A");
//                return ResponseEntity.badRequest().body(ResponseDTO.builder().message("No data in file CV!").build());
            }

            candidateDetailDTO.setActive(true);

            // Chuyển đổi và lưu candidate
            Candidate candidate = candidateService.parseCandidateDetailDTOToCandidate(candidateDetailDTO);
            Candidate candidateSaved = candidateService.save(candidate);

            if (candidateSaved == null) {
                return ResponseEntity.badRequest().body(ResponseDTO.builder().message("Failed to created candidate").build());
            }
            return ResponseEntity.ok().body(ResponseDTO.builder().message("Successfully created candidate").build());

        } catch (IOException e) {
            System.out.println("Error during CV upload or candidate save process" + e);
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.builder().message("An error occurred during the save process" + e).build());
        } catch (Exception e) {
            // Log lỗi và trả về phản hồi lỗi
            System.out.println("Unexpected error" + e);
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.builder().message("An unexpected error occurred" + e).build());
        }
    }


    @GetMapping("/get-all-recruiter")
    public ResponseEntity<ResponseDTO> getAllRecruiter() {
        List<User> users = userServices.findAllByRoleAndIsActive( true, RECRUITER.getDisplayName());
        if (users == null) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().message("Get data Recruiter fail!").build());
        }

        List<UserCandidateDTO> userCandidateDTOS = new ArrayList<>();
        for (User user : users) {
            UserCandidateDTO userCandidateDTO = UserCandidateDTO.builder()
                    .id(String.valueOf(user.getUserId()))
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .build();
            userCandidateDTOS.add(userCandidateDTO);
        }

        return ResponseEntity.ok().body(ResponseDTO.builder().data(userCandidateDTOS).message("Get data Recruiter success!").build());
    }

    @PostMapping("/get-candidate-detail")
    public ResponseEntity<ResponseDTO> getCandidateDetail(@RequestParam int candidateId) {
        Candidate candidate = candidateService.findById(candidateId);
        if (candidate == null) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().message("Get candidate detail fail!").build());
        }

        CandidateDetailDTO candidateDetailDTO = candidateService.parseCandidateToCandidateDetailDTO(candidate);

        return ResponseEntity.ok().body(ResponseDTO.builder().data(candidateDetailDTO).message("Get candidate detail success").build());
    }

    @GetMapping("/getAllCandidateName")
    public ResponseEntity<ResponseDTO> getAllCandidateName(){
        try{
            List<CandidateNameDTO> getAllCandidateName = candidateService.getAllCandidate(CandidateStatus.BANNED.getDisplayName());
            ResponseDTO response = ResponseDTO.builder()
                    .message("success")
                    .code(200)
                    .data(getAllCandidateName)
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

    @PostMapping("/update-candidate")
    public ResponseEntity<ResponseDTO> update(@ModelAttribute CandidateDetailDTO candidateDetailDTO) throws IOException {
        if (candidateDetailDTO.getCvAttachmentFile() != null && !candidateDetailDTO.getCvAttachmentFile().isEmpty()) {

            try {
                Candidate candidate = candidateService.findById(candidateDetailDTO.getCandidateId());

                String oldUrl = candidate.getCvAttachment();
                if (oldUrl != null && !"N/A".equals(oldUrl)) {
                    boolean isDeletedOldFile = fileService.deleteFileByFileUrl(oldUrl);
                    if (!isDeletedOldFile) {
                        return ResponseEntity.badRequest().body(ResponseDTO.builder().message("Delete old file Cv Fail").build());
                    }
                }

                String cvAttachmentUrl = uploadCvFile(candidateDetailDTO.getCvAttachmentFile(), "CV_" + candidateDetailDTO.getFullName());
                if(cvAttachmentUrl.isEmpty()) {
                    return ResponseEntity.badRequest().body(ResponseDTO.builder().message("Upload new file Cv Fail").build());
                }
                candidateDetailDTO.setCvAttachmentUrl(cvAttachmentUrl);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }

        }
//        else {
//                return ResponseEntity.badRequest().body(ResponseDTO.builder().message("No data in file CV!").build());
//        }

        if (candidateService.updateCandidate(candidateDetailDTO)) {
            return ResponseEntity.ok().body(ResponseDTO.builder().code(200).message("Change has been successfully updated").build());
        }
        return ResponseEntity.badRequest().body(ResponseDTO.builder().code(ErrorCode.UpdateCandidateFail.getCode()).message(ErrorCode.UpdateCandidateFail.getMessage()).build());
    }

    @PostMapping("/ban-candidate")
    public ResponseEntity<ResponseDTO> banCandidate(@RequestParam int candidateId, @RequestParam int updaterId) throws Exception {
        Candidate candidate = candidateService.findById(candidateId);
        User updater = userServices.findById(updaterId);

        if (candidate == null) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().code(ErrorCode.CandidateIDNotFound.getCode()).message("Candidate not found").build());
        }

        if (updater == null) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().code(ErrorCode.UserIDNotFount.getCode()).message("Updater not found").build());
        }

        boolean isBanned = candidateService.banOrDeleteCandidate(candidate, updater, CandidateService.BAN);

        if (isBanned) {
            return ResponseEntity.ok().body(ResponseDTO.builder().code(200).message("Banned candidate success").build());
        } else {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().message("Banned candidate Fail").build());
        }
    }

    @PostMapping("/unban-candidate")
    public ResponseEntity<ResponseDTO> unbanCandidate(@RequestParam int candidateId, @RequestParam int updaterId) throws Exception {
        Candidate candidate = candidateService.findById(candidateId);
        User updater = userServices.findById(updaterId);

        if (candidate == null) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().code(ErrorCode.CandidateIDNotFound.getCode()).message("Candidate not found").build());
        }

        if (updater == null) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().code(ErrorCode.UserIDNotFount.getCode()).message("Updater not found").build());
        }

        boolean isUnbanned= candidateService.unbanCandidate(candidate, updater);
        if (isUnbanned) {
            return ResponseEntity.ok().body(ResponseDTO.builder().code(200).message("Unban candidate success").build());
        } else {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().message("Unban candidate Fail").build());
        }
    }

    @PostMapping("/delete-candidate")
    public ResponseEntity<ResponseDTO> deleteCandidate(@RequestParam int candidateId, @RequestParam int updaterId) {
        Candidate candidate = candidateService.findById(candidateId);
        User updater = userServices.findById(updaterId);

        if (candidate == null) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().code(ErrorCode.CandidateIDNotFound.getCode()).message("Candidate not found").build());
        }

        if (updater == null) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().code(ErrorCode.UserIDNotFount.getCode()).message("Updater not found").build());
        }

        String oldUrl = candidate.getCvAttachment();
        if (oldUrl != null && !"N/A".equals(oldUrl)) {
            boolean isDeletedOldFile = fileService.deleteFileByFileUrl(oldUrl);
            if (!isDeletedOldFile) {
                return ResponseEntity.badRequest().body(ResponseDTO.builder().message("Delete old file Cv Fail").build());
            }
        }

        boolean isDeleted = candidateService.banOrDeleteCandidate(candidate,updater, CandidateService.DELETE);
        if (isDeleted) {
            return ResponseEntity.ok().body(ResponseDTO.builder().code(200).message("Delete candidate success").build());
        } else {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().message("Delete candidate Fail").build());
        }
    }

    private String uploadCvFile(MultipartFile file, String filename) throws IOException {
        String fileExtension = getFileExtension(filename);
        File tempFile = File.createTempFile("temp", "." + fileExtension);
        try {
            file.transferTo(tempFile);
            return fileService.uploadFile(tempFile, filename);
        } finally {
            // Xóa tệp tạm thời sau khi tải lên
            tempFile.delete();
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null) {
            return null;
        }
        String extension = "";
        int i = filename.lastIndexOf('.');
        if (i > 0) {
            extension = filename.substring(i + 1).toLowerCase();
        }
        return extension;
    }
    @GetMapping("/is-exists-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        boolean exists = candidateService.existsCandidateByEmailAndIsActiveIsTrue(email);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/is-exists-phone")
    public ResponseEntity<Boolean> checkPhoneExists(@RequestParam String phone) {
        boolean exists = candidateService.existsCandidateByPhoneAndIsActiveIsTrue(phone);
        return ResponseEntity.ok(exists);
    }

}