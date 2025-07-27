package com.group2.InterviewManagement.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Nationalized;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Interview_Schedule")
public class InterviewSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private int scheduleId;

    @Column(name = "schedule_title", nullable = false)
    @Nationalized
    private String scheduleTitle;

    @Column(name = "location")
    @Nationalized
    private String location;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(name = "schedule_date", nullable = false)
    private LocalDate scheduleDate;

    @Column(name = "schedule_from", nullable = false)
    private LocalTime scheduleFrom;

    @Column(name = "schedule_to", nullable = false)
    private LocalTime scheduleTo;

    @Column(name = "note", length = 500)
    @Nationalized
    private String note;

    @Column(name = "meeting_id", columnDefinition = "VARCHAR(255) DEFAULT 'N/A' ")
    private String meetingId;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Column(name = "interview_schedule_status",nullable = false)
    @Nationalized
    private String interviewScheduleStatus;

    @Column(name = "interview_schedule_result",nullable = false)
    @Nationalized
    private String interviewScheduleResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_owner_id",referencedColumnName = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_InterviewSchedule_User")
    )
    @JsonBackReference
    private User recruiter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false,
        foreignKey = @ForeignKey(name = "FK_InterviewSchedule_Candidate")
    )
    @JsonBackReference
    private Candidate candidate;

    @OneToMany(mappedBy = "interviewSchedule", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<InterviewScheduleInterviewer> interviewScheduleInterviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_InterviewSchedule_Job")
    )
    @JsonBackReference
    private Job job;

    @OneToOne(mappedBy = "interviewSchedule")
    @JsonBackReference
    private Offer offer;
}
