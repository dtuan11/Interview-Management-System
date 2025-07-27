package com.group2.InterviewManagement.repository;

import com.group2.InterviewManagement.dto.RoleDTO;
import com.group2.InterviewManagement.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<Role,Integer> {
    @Query("select new com.group2.InterviewManagement.dto.RoleDTO(r.roleId, r.roleName) from Role r")
    List<RoleDTO> findRoleIdAndRoleName();

    Role findByRoleName(String roleName);
}
