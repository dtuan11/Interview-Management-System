package com.group2.InterviewManagement.repository;

import com.group2.InterviewManagement.models.User;
import org.hibernate.sql.Update;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.Optional;

@RepositoryRestController(path = "user-list")
@RepositoryRestResource(path = "user-list")
public interface UserRepositoryRest extends JpaRepository<User, Integer> {
    public User findUserByUsername(String username);

    @Query("SELECT DISTINCT u FROM User u " +
            "LEFT JOIN u.roleUsers ru " +
            "LEFT JOIN ru.role r " +
            "WHERE " +
            "(:keyword IS NULL OR " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.roleName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:role IS NULL OR " +
            "LOWER(r.roleName) LIKE LOWER(CONCAT('%', :role, '%'))) " +
            "ORDER BY u.userId DESC ")
    Page<User> searchByAllFields(@Param("keyword") String keyword,
                                 @Param("role") String role,
                                 Pageable pageable);
    @RestResource(path = "exists-email")

    boolean existsUsersByEmail(String email);

    @RestResource(path = "exists-phone-number")
    boolean existsUserByPhoneNumber(String phoneNumber);

    @RestResource(path = "is-18-years-old")
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.dob <= :date")
    boolean isUser18YearsOld(@RequestParam("date") LocalDate date);

    @Modifying
    @Query("UPDATE User u " +
            "SET u.isActive = CASE WHEN u.isActive = true THEN false ELSE true END" +
            " WHERE u.userId = :id")
    void toggleIsActiveById(@Param("id") int id);

 Optional<User> findByEmail(String email);


}
