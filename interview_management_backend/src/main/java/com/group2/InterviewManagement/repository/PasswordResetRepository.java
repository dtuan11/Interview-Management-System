package com.group2.InterviewManagement.repository;

import com.group2.InterviewManagement.models.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PasswordResetRepository extends JpaRepository<PasswordReset,Integer> {
    Optional<PasswordReset> findByLinkContainingAndIsActiveTrue(String link);
    List<PasswordReset> findAllByCreatedAtBefore(LocalDateTime dateTime);
    List<PasswordReset> findAllByCreatedAtBeforeOrIsActiveFalse(LocalDateTime dateTime);

}
