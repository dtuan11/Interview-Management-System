package com.group2.InterviewManagement.controller;

import com.group2.InterviewManagement.dto.UserCandidateDTO;
import com.group2.InterviewManagement.dto.UserDTO;
import com.group2.InterviewManagement.dto.response.ResponseDTO;
import com.group2.InterviewManagement.dto.response.SearchResponse;
import com.group2.InterviewManagement.exception.AppException;
import com.group2.InterviewManagement.exception.ErrorCode;
import com.group2.InterviewManagement.models.User;
import com.group2.InterviewManagement.repository.UserRepository;
import com.group2.InterviewManagement.repository.UserRepositoryRest;
import com.group2.InterviewManagement.services.AccountService;
import com.group2.InterviewManagement.services.UserServices;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.group2.InterviewManagement.Enum.Role.MANAGER;
import static com.group2.InterviewManagement.Enum.Role.RECRUITER;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final AccountService accountService;
    private final UserRepositoryRest userRepositoryRest;
    private final UserRepository userRepository;
    private final UserServices userServices;

    @Autowired
    public UserController(AccountService accountService, UserRepositoryRest userRepositoryRest, UserRepository userRepository, UserServices userServices) {
        this.accountService = accountService;
        this.userRepositoryRest = userRepositoryRest;
        this.userRepository = userRepository;
        this.userServices = userServices;

    }

    @PostMapping("/create")
    public ResponseEntity<ResponseDTO> save(@RequestBody UserDTO userDTO) {
        User user = accountService.parseUserDTOtoUser(userDTO);
        User userSaved = accountService.addNewUserAccount(user);
        if (userSaved == null) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().code(400).message("Save user fail!").data(user).build());
        }
        return ResponseEntity.ok().body(ResponseDTO.builder().code(4).message("Save user success").data(user).build());
    }

    @PutMapping("/update/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable("userId") int userId, @RequestBody UserDTO userDTO) {
        try {
            User user = accountService.updateUserByID(userId, userDTO);
            UserDTO userDTO1 = accountService.mapUsertoUserDTO(user);
            return ResponseEntity.ok(ResponseDTO.builder()
                    .code(200)
                    .message("Successfully updated user.")
                    .data(userDTO1)
                    .build());
        } catch (AppException e) {
            // Handling known AppException
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .code(e.getErrorCode().getCode())
                    .message(e.getErrorCode().getMessage())
                    .build());
        } catch (Exception e) {
            // Handling unexpected exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseDTO.builder()
                    .code(ErrorCode.UnDefine_Error.getCode())
                    .message(ErrorCode.UnDefine_Error.getMessage())
                    .build());
        }
    }

    @GetMapping("/is-18-years-old")
    public ResponseEntity<Boolean> isUser18YearsOld(@RequestParam("dob") LocalDate dob) {
        LocalDate todayMinus18Years = LocalDate.now().minusYears(18);
        boolean is18YearsOld = userRepositoryRest.isUser18YearsOld(dob);
        return ResponseEntity.ok(is18YearsOld);
    }

    @GetMapping("/is-exists-phone-number")
    public ResponseEntity<Boolean> existsPhoneNumber(@RequestParam("phoneNumber") String phoneNumber) {
        return ResponseEntity.ok(userRepositoryRest.existsUserByPhoneNumber(phoneNumber));
    }

    @GetMapping("/is-exists-email")
    public ResponseEntity<Boolean> existsEmail(@RequestParam("email") String email) {
        return ResponseEntity.ok(userRepositoryRest.existsUsersByEmail(email));
    }
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepositoryRest.searchByAllFields(keyword, role, pageable);
        List<UserDTO> users = userPage.getContent().stream()
                .map(accountService::mapUsertoUserDTO) // Use method reference to mapUserToDTO
                .toList();
        return ResponseEntity.ok(new SearchResponse(users, userPage.getTotalPages()));
    }


    @GetMapping("/{id}")
    public ResponseEntity<ResponseDTO> getUserById(@PathVariable Integer id) {
            User user = accountService.getUserByID(id);
            UserDTO userDTO = accountService.mapUsertoUserDTO(user);
            return ResponseEntity.ok().body(ResponseDTO.builder().code(200).message("Successfully").data(userDTO).build());
    }
    @PutMapping("/update-active/{id}")
    public ResponseEntity<?> toggleUserActiveStatus(@PathVariable int id) {
        try {
            accountService.updateIsActiveById(id);
            return ResponseEntity.ok().body(ResponseDTO.builder().code(200).message("Successfully updated user status.").build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().code(ErrorCode.ChangeStatusUserFail.getCode()).message(ErrorCode.ChangeStatusUserFail.getMessage()).build());
        }
    }
    @GetMapping("/get-all-recruiter")
    public ResponseEntity<ResponseDTO> getAllRecruiter() {
        List<User> users = userServices.findAllByRoleAndIsActive(true,RECRUITER.getDisplayName());
        if(users == null) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder().message("Get data Recruiter fail!").build());
        }

        List<UserCandidateDTO> userCandidateDTOS = userServices.parseUsersToUserCandidateDTOs(users);

        return ResponseEntity.ok().body(ResponseDTO.builder().data(userCandidateDTOS).message("Get data Recruiter fail success").build());
    }
    @GetMapping("/getManager")
    public ResponseEntity<ResponseDTO> getManager(){
        try{
            List<User> getManager = userServices.findAllByRoleAndIsActive(true, MANAGER.getDisplayName());
            List<UserCandidateDTO> userCandidateDTOS = userServices.parseUsersToUserCandidateDTOs(getManager);
            ResponseDTO response = ResponseDTO.builder()
                    .message("sucess")
                    .code(200)
                    .data(userCandidateDTOS)
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

}