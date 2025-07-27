package com.group2.InterviewManagement.repository;

import com.group2.InterviewManagement.Enum.Role;
import com.group2.InterviewManagement.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import com.group2.InterviewManagement.models.Candidate;
import com.group2.InterviewManagement.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
//    User findByUserName(String username);

    User findByUserId(int id);


    User findByUsername(String username);

    @Query("SELECT COUNT(u) FROM User u WHERE u.username LIKE ?1%")
    int countByUsernameStartingWith(String usernamePrefix);

    User findByfullName(String fullName);
    @Query(" SELECT u FROM User u " +
            " JOIN u.roleUsers ur " +
            " JOIN ur.role r" +
            " WHERE u.isActive = :isActive " +
            " AND r.roleName = :roleName ")
    List<User> findByRolesAndIsActive(@Param("isActive") boolean isActive, @Param("roleName") String roleName);

    @Query("SELECT u FROM RoleUser ru" +
            " join User u ON ru.keyRoleUser.userId=u.userId"+
            " join Role r ON ru.keyRoleUser.roleId=r.roleId"+
            " WHERE r.roleName=:role AND u.isActive= true")
    List<User> getUserByRoleAndIsActive(@Param("role") String role);

    List<User> findAllByIsActive(boolean isActive);
}