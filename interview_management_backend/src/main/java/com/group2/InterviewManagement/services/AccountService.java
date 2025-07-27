package com.group2.InterviewManagement.services;

import com.group2.InterviewManagement.dto.UserDTO;
import com.group2.InterviewManagement.models.User;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;

public interface AccountService {
    public User addNewUserAccount(User user);


    User parseUserDTOtoUser(UserDTO candidateDTO);

    String createUserNameFromFull(String fullName);

    int CountUserNameLike(String username);

    void sendAccount(String username, String password,String emailSend);


    User updateUserByID(int userId, UserDTO userDTO);

    public boolean isUser18YearsOld(LocalDate dob);

    boolean checkExpiredToken(String token);

    void updateIsActiveById(int id);

    ResponseEntity<?> forgotPassword(String email);

    void sendForgotPassword(String email,String link);

    ResponseEntity<?> setnewPassword(String email, String password);

    boolean isValidPassword(String password);

    boolean isDepartment(String department);

    UserDTO mapUsertoUserDTO(User user);

    User getUserByID(int userID);

}
