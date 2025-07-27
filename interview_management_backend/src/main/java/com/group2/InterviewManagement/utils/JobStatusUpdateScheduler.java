package com.group2.InterviewManagement.utils;

import com.group2.InterviewManagement.services.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class JobStatusUpdateScheduler {

    private final JobService jobService;

    @Autowired
    public JobStatusUpdateScheduler(JobService jobService) {
        this.jobService = jobService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        jobService.updateJobStatuses("Application Startup");
    }

    @Scheduled(cron = "0 0 0 * * ?") // Runs daily at midnight
    public void scheduledMidnightUpdate() {
        jobService.updateJobStatuses("Midnight Schedule");
    }

}