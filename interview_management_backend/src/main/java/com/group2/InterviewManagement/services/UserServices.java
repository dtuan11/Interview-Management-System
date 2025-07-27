package com.group2.InterviewManagement.services;

import com.group2.InterviewManagement.dto.UserCandidateDTO;
import com.group2.InterviewManagement.models.User;

import java.util.List;

public interface UserServices {
    List<User> findAllByRoleAndIsActive(String role);

    List<User> findAllByRoleAndIsActive(boolean isActive, String role);

    List<UserCandidateDTO> parseUsersToUserCandidateDTOs(List<User> users);

    List<User> getInterviewers();
    List<User> findAllByIsActive(boolean isActive);

    List<User> getRecruiter();

    User getUserByFullName(String fullName);

    List<User> getRoleADM();
    User findById(int id);
}