package com.group2.InterviewManagement.utils;

import com.group2.InterviewManagement.dto.JobDTO;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class JobValidator {

    public List<String> validateJob(JobDTO job) {
        List<String> errors = new ArrayList<>();

        if (job.getJobTitle() == null || job.getJobTitle().trim().isEmpty()) {
            errors.add("Job Title is required");
        }

        if (job.getJobSkills() == null || job.getJobSkills().isEmpty()) {
            errors.add("Job Skills are required");
        }

        // Salary Range From validation
        if (job.getSalaryRangeFrom() < 0) {
            errors.add("Salary Range From must be 0 or greater");
        }

        // Salary Range To validation
        if (job.getSalaryRangeTo() < 0) {
            errors.add("Salary Range To must be 0 or greater");
        }

        // Salary Range comparison
        if (job.getSalaryRangeFrom() > job.getSalaryRangeTo()) {
            errors.add("Salary Range To must be greater than or equal to Salary Range From");
        }

        LocalDate currentDate = LocalDate.now();
        if (job.getStartDate() != null && job.getStartDate().isBefore(currentDate)) {
            errors.add("Start date must be today or a future date");
        }

        if (job.getStartDate() != null && job.getEndDate() != null && job.getEndDate().isBefore(job.getStartDate())) {
            errors.add("End date must be later than start date");
        }

        if (job.getJobBenefit() == null || job.getJobBenefit().isEmpty()) {
            errors.add("Job Benefit is required");
        }

        if (job.getJobLevel() == null || job.getJobLevel().isEmpty()) {
            errors.add("Job Level is required");
        }

        if (job.getJobDescription() != null && job.getJobDescription().length() > 500) {
            errors.add("Description must be less than 500 characters");
        }

        return errors;
    }
}