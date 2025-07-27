package com.group2.InterviewManagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.group2.InterviewManagement.repository")
@EnableScheduling
public class InterviewManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(InterviewManagementApplication.class, args);
    }

}
