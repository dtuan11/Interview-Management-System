package com.group2.InterviewManagement.config;

import com.group2.InterviewManagement.services.OfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@EnableScheduling
public class SchedulerConfig {

    private final OfferService offerService;

    @Autowired
    public SchedulerConfig(OfferService offerService) {
        this.offerService = offerService;
    }

    @Scheduled(cron = "0 0 9 * * ?") // At 08:00 AM every day
    @Transactional
    public void sendDailyReminders() {
        offerService.sendReminders();
    }
}
