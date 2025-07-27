package com.group2.InterviewManagement.repository;

import com.group2.InterviewManagement.models.Role;
import com.group2.InterviewManagement.models.RoleUser;
import com.group2.InterviewManagement.models.User;
import com.group2.InterviewManagement.models.key.KeyRoleUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
@Repository
public interface UserRoleRepository extends JpaRepository<RoleUser, KeyRoleUser> {
    @Query("SELECT ru.role FROM RoleUser ru WHERE ru.user.userId = :userId")
    List<Role> findRolesByUserId(@Param("userId") int userId);

    @Query("SELECT ru.user FROM RoleUser ru WHERE ru.role.roleName = :roleName")
    List<User> findUsersByRoleName(@Param("roleName") String roleName);

     default List<User> findInterviewers() {
        return findUsersByRoleName("INTERVIEWER");
    }

     default List<User> findRecruiters() {
        return findUsersByRoleName("RECRUITER");
    }

    @Query("SELECT ru.user FROM RoleUser ru WHERE ru.role.roleName IN :roleNames")
    List<User> findUsersByRoleNames(@Param("roleNames") List<String> roleNames);

    default List<User> findUsersByRoles() {
        return findUsersByRoleNames(Arrays.asList("MANAGER", "ADMIN", "RECRUITER"));
    }
}
