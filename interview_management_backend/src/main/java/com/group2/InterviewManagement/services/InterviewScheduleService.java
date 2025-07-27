package com.group2.InterviewManagement.services;

import com.group2.InterviewManagement.dto.InterviewScheduleDTO;
import com.group2.InterviewManagement.dto.InterviewTitleDTO;
import com.group2.InterviewManagement.models.InterviewSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface InterviewScheduleService {
    List<InterviewScheduleDTO> getAllInterviewSchedules();
    List<InterviewTitleDTO> getInterviewTitle();
    boolean createInterviewSchedule (InterviewScheduleDTO interviewScheduleDTO);
    InterviewScheduleDTO parseInterviewToInterviewDTO(InterviewSchedule interviewSchedule);
    Page<InterviewSchedule> findInterviewSchedules(String keyword, String status, String interviewer, Pageable pageable);
    InterviewScheduleDTO findInterviewScheduleById(int id);
    InterviewScheduleDTO updateInterviewSchedule(int id,InterviewScheduleDTO interviewScheduleDTO);

    InterviewScheduleDTO editSchedule(int id,InterviewScheduleDTO interviewScheduleDTO);

   InterviewScheduleDTO  cancelInterviewSchedule(int id);
    boolean sendInterviewNotifications(int interviewScheduleId);
    void sendInterviewNotificationsForDate();
    void sendNotifications24HoursAfterMeeting();


    Page<InterviewSchedule> findInterviewSchedulesInterviewer(Integer interviewerId, String keyword, String status, Pageable pageable);
}