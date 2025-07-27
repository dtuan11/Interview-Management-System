package com.group2.InterviewManagement.services.Impl;

import com.group2.InterviewManagement.dto.RoleDTO;
import com.group2.InterviewManagement.models.Role;
import com.group2.InterviewManagement.repository.RoleRepository;
import com.group2.InterviewManagement.services.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;

    @Autowired
    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public List<RoleDTO> findAll() {
        return roleRepository.findRoleIdAndRoleName();
    }

    @Override
    public Role findByRoleName(String roleName) {
        return roleRepository.findByRoleName(roleName);
    }
}
