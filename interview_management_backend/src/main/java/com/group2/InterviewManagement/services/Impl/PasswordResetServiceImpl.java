package com.group2.InterviewManagement.services.Impl;

import com.group2.InterviewManagement.models.PasswordReset;
import com.group2.InterviewManagement.models.User;
import com.group2.InterviewManagement.repository.PasswordResetRepository;
import com.group2.InterviewManagement.services.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {
    private final PasswordResetRepository passwordResetRepository;

    @Autowired
    public PasswordResetServiceImpl(PasswordResetRepository passwordResetRepository) {
        this.passwordResetRepository = passwordResetRepository;
    }

    @Override
    public PasswordReset createPasswordResetLink(User user) {
        String token = generateToken();
        String link = EndPointServices.front_end_host+"/reset-password/" + token + "/"+user.getEmail();
        PasswordReset passwordReset= PasswordReset.builder()
                .link(link)
                .createdAt(LocalDateTime.now())
                .isActive(true)
                .user(user)
                .build();
        return  passwordResetRepository.save(passwordReset);
    }

    @Override
    public Optional<PasswordReset> validatePasswordResetLink(String token, String email) {
        return passwordResetRepository.findByLinkContainingAndIsActiveTrue(token)
                .filter(passwordReset ->
                        passwordReset.getCreatedAt().isAfter(LocalDateTime.now().minusHours(24)) &&
                                passwordReset.getUser().getEmail().equals(email));
    }

    @Override
    public void deactivatePasswordResetLink(String token) {
        passwordResetRepository.findByLinkContainingAndIsActiveTrue(token).ifPresent(passwordReset -> {
            passwordReset.setIsActive(false);
            passwordResetRepository.save(passwordReset);
        });
    }

    @Override
    public String generateToken() {
        return UUID.randomUUID().toString();
    }

    @Override
    @Scheduled(fixedRate = 43200000)
    public void cleanupExpiredAndInactivePasswordResetLinks() {
        LocalDateTime now = LocalDateTime.now();
        List<PasswordReset> expiredOrInactiveLinks = passwordResetRepository.findAllByCreatedAtBeforeOrIsActiveFalse(now.minusHours(24));
        for (PasswordReset passwordReset : expiredOrInactiveLinks) {
            passwordResetRepository.delete(passwordReset);
        }
    }
}
