package com.group2.InterviewManagement.repository;

import com.group2.InterviewManagement.models.InterviewSchedule;
import com.group2.InterviewManagement.models.InterviewScheduleInterviewer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewScheduleInterviewerRepository extends JpaRepository<InterviewScheduleInterviewer, Integer> {
    void deleteByInterviewSchedule(InterviewSchedule interviewSchedule);
}
