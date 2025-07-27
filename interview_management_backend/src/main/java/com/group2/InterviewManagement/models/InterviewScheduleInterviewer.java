package com.group2.InterviewManagement.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.group2.InterviewManagement.models.key.KeyInterviewScheduleInterviewer;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Interview_Schedule_Interviewer")
public class InterviewScheduleInterviewer {
    @EmbeddedId
    private KeyInterviewScheduleInterviewer keyInterviewScheduleInterviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_InterviewScheduleInterviewer_InterviewSchedule")
    )
    @MapsId(value = "scheduleId")
    @JsonBackReference
    private InterviewSchedule interviewSchedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_InterviewScheduleInterviewer_User")
    )
    @MapsId(value = "userId")
    @JsonBackReference
    private User interviewer;
}
