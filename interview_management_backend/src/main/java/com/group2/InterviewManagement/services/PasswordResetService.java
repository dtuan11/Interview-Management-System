package com.group2.InterviewManagement.services;

import com.group2.InterviewManagement.models.PasswordReset;
import com.group2.InterviewManagement.models.User;
import org.springframework.stereotype.Service;

import java.util.Optional;
public interface PasswordResetService {
    PasswordReset createPasswordResetLink(User user);

    Optional<PasswordReset> validatePasswordResetLink(String link,String email);

    void deactivatePasswordResetLink(String token);

    String generateToken();
    void cleanupExpiredAndInactivePasswordResetLinks();


}
