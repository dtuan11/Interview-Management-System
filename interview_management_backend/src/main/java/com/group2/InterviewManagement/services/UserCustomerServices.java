package com.group2.InterviewManagement.services;

import com.group2.InterviewManagement.models.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

public interface UserCustomerServices extends UserDetailsService {
    public User findUserByUsername(String username);

    UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;
     List<String> getRoles(User user);

}