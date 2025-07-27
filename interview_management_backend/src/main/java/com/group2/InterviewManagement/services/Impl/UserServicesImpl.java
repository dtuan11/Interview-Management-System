package com.group2.InterviewManagement.services.Impl;

import com.group2.InterviewManagement.dto.UserCandidateDTO;
import com.group2.InterviewManagement.models.User;
import com.group2.InterviewManagement.repository.UserRepository;
import com.group2.InterviewManagement.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
@Service
public class UserServicesImpl implements com.group2.InterviewManagement.services.UserServices {
    private UserRepository userRepository;
    private UserRoleRepository userRoleRepository;

    @Autowired
    public UserServicesImpl(UserRepository userRepository, UserRoleRepository userRoleRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public List<User> findAllByRoleAndIsActive(String role) {
        return List.of();
    }

    @Override
    public List<User> findAllByRoleAndIsActive(boolean isActive, String role) {
        return userRepository.findByRolesAndIsActive(isActive, role);
    }




    @Override
    public List<UserCandidateDTO> parseUsersToUserCandidateDTOs(List<User> users) {
        List<UserCandidateDTO> userCandidateDTOS = new ArrayList<>();
        for(User user : users) {
            UserCandidateDTO userCandidateDTO = UserCandidateDTO.builder()
                    .id(String.valueOf(user.getUserId()))
                    .fullName(user.getFullName())
                    .username(user.getUsername())
                    .build();
                    userCandidateDTOS.add(userCandidateDTO);
        }
        return userCandidateDTOS;
    }

    @Override
    public List<User> getInterviewers() {
        List<User> interviewers = userRoleRepository.findInterviewers();
        return interviewers;
    }

    @Override
    public List<User> findAllByIsActive(boolean isActive) {
        return userRepository.findAllByIsActive(isActive);
    }

    @Override
    public List<User> getRecruiter() {
        List<User> recruiters = userRoleRepository.findRecruiters();
        return recruiters;
    }

@Override
public List<User> getRoleADM(){

        return userRoleRepository.findUsersByRoles();
    }

    @Override
    public User findById(int id) {
        return userRepository.findByUserId(id);
    }


    @Override
    public User getUserByFullName(String fullName) {
        return userRepository.findByfullName(fullName);
    }
}