package com.group2.InterviewManagement.services;

import com.group2.InterviewManagement.dto.RoleDTO;
import com.group2.InterviewManagement.models.Role;

import java.util.List;

public interface RoleService {
    List<RoleDTO> findAll();

    Role findByRoleName(String roleName);
}
