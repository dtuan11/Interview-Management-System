package com.group2.InterviewManagement.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;


import java.sql.Date;
import java.text.ParseException;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.List;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "User")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private int userId;

    @Column(name = "username")
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    @Nationalized
    private String fullName;

    @Column(name = "address", nullable = false)
    @Nationalized
    private String address;

    @Column(name = "phone_number", columnDefinition = "varchar(255) character set utf8 not null DEFAULT ' ' ")
    @Nationalized
    private String phoneNumber;

    @Column(name = "email", nullable = false, unique =  true)
    private String email;

    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "gender", nullable = false)
    private boolean gender;

    @Column(name = "note")
    @Nationalized
    private String note;

    @Version
    @Column(name = "version")
    private int version;

    @Column(name = "dob", nullable = false)
    private LocalDate dob;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @OneToMany(mappedBy = "recruiter", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<Candidate> listCandidateOwn;

    @OneToMany(mappedBy = "updater", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<Candidate> listCandidateUpdated;

    @OneToMany(mappedBy = "updateBy", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<Job> jobs;

    @OneToMany(mappedBy = "recruiterOwner", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<Offer> offers;

    @OneToMany(mappedBy = "approveByManager", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<Offer> offerlist;

    @OneToMany(mappedBy = "interviewer", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<InterviewScheduleInterviewer> interviewScheduleInterviewers;

    @OneToMany(mappedBy = "recruiter", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<InterviewSchedule> interviewSchedules;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<RoleUser> roleUsers;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<PasswordReset> passwordResets;


}