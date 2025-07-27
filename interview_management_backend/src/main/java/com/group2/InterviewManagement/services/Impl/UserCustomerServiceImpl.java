package com.group2.InterviewManagement.services.Impl;

import com.group2.InterviewManagement.models.Role;
import com.group2.InterviewManagement.models.User;
import com.group2.InterviewManagement.repository.UserRepository;
import com.group2.InterviewManagement.repository.UserRepositoryRest;
import com.group2.InterviewManagement.repository.UserRoleRepository;
import com.group2.InterviewManagement.services.UserCustomerServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserCustomerServiceImpl implements UserCustomerServices {
    private final UserRepositoryRest userRepositoryRest;
    private final UserRoleRepository userRoleRepository;

    @Autowired
    public UserCustomerServiceImpl(UserRepositoryRest userRepositoryRest, UserRoleRepository userRoleRepository) {
        this.userRepositoryRest = userRepositoryRest;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public User findUserByUsername(String username) {
        return userRepositoryRest.findUserByUsername(username);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepositoryRest.findUserByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                getAuthorities(user.getUserId())
        );
    }

    @Override
    public List<String> getRoles(User user){
        return  user.getRoleUsers().stream().map(roleUser -> roleUser.getRole().getRoleName()).collect(Collectors.toList());
    }

    public Collection<? extends GrantedAuthority> getAuthorities(int userId) {
        List<Role> roles = userRoleRepository.findRolesByUserId(userId);
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getRoleName()))
                .collect(Collectors.toList());
    }

}
