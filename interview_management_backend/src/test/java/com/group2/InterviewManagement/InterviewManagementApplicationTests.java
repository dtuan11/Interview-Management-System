package com.group2.InterviewManagement;

import com.group2.InterviewManagement.Enum.HighestLevel;
import com.group2.InterviewManagement.dto.InterviewScheduleDTO;
import com.group2.InterviewManagement.models.Candidate;
import com.group2.InterviewManagement.repository.CandidateRepository;
import com.group2.InterviewManagement.repository.CommonValueRepository;
import com.group2.InterviewManagement.repository.UserRepository;
import com.group2.InterviewManagement.services.AccountService;
import com.group2.InterviewManagement.services.CandidateService;
import com.group2.InterviewManagement.services.Impl.CandidateServiceImpl;
import com.group2.InterviewManagement.services.InterviewScheduleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static com.group2.InterviewManagement.Enum.HighestLevel.HIGHEST_LEVEL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class InterviewManagementApplicationTests {
    private AccountService userServices;
    private UserRepository userRepository;
    private CommonValueRepository commonValueRepository;
    @Autowired
    public InterviewManagementApplicationTests(AccountService userServices, UserRepository userRepository, CommonValueRepository commonValueRepository) {
        this.userServices = userServices;
        this.userRepository = userRepository;
        this.commonValueRepository = commonValueRepository;
    }



    @Test
    void contextLoads() {
//        commonValueRepository.getAllByNameAndIndexKeyGreaterThanEqualAndIndexKeyIsLessThanEqual(HIGHEST_LEVEL.getValue(),0, 3);
    }

}