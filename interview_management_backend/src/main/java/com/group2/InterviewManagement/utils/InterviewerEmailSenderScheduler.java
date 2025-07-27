package com.group2.InterviewManagement.utils;

import com.group2.InterviewManagement.services.InterviewScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class InterviewerEmailSenderScheduler {

    private final InterviewScheduleService interviewScheduleService;

    @Autowired
    public InterviewerEmailSenderScheduler(InterviewScheduleService interviewScheduleService) {
        this.interviewScheduleService = interviewScheduleService;
    }
    @Scheduled(cron = "0 0 8 * * ?") // Runs at 8:00 AM every day
    public void sendDailyInterviewNotifications() {
        interviewScheduleService.sendInterviewNotificationsForDate();
    }
//    @Scheduled(fixedRate = 86400000) // Runs every day (86400000 milliseconds = 1 day)
//    public void sendInterviewResultReminders() {
//        interviewScheduleService.sendNotifications24HoursAfterMeeting();
//    }

    @Scheduled(cron = "0 0 9 * * ?") // Runs at 9:00 AM every day
    public void sendInterviewResultReminders() {
        interviewScheduleService.sendNotifications24HoursAfterMeeting();
    }
}
