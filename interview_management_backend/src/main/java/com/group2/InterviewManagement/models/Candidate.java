package com.group2.InterviewManagement.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Candidate")
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "candidate_id")
    private int candidateId;

    @Column(name = "full_name", nullable = false)
    @Nationalized
    private String fullName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "gender", nullable = false)
    private boolean gender;

    @Column(name = "phone_number",columnDefinition = "varchar(255) character set utf8 not null DEFAULT 'N/A' ")
    private String phoneNumber;

    @Column(name = "address", columnDefinition = "varchar(255) character set utf8 not null DEFAULT 'N/A' ")
    private String address;

    @Column(name = "dob")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dob;

    @Column(name = "candidate_status", nullable = false)
    private String candidateStatus;

    @Column(name = " cv_attachment", columnDefinition = "TEXT" )
    private String cvAttachment;

    @Column(name = "position", nullable = false)
    private String position;

    @Column(name = "skills", nullable = false)
    private String skills;

    @Column(name = "year_of_experience", columnDefinition = "varchar(255) character set utf8 not null DEFAULT 'N/A' ")
    private String yearOfExperience;

    @Column(name = "highest_level", nullable = false)
    private String highest_level;

    @Column(name = "note", columnDefinition = "varchar(500) character set utf8 not null DEFAULT 'N/A' ")
    private String note;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Column(name = "update_at", nullable = false)
    private LocalDate updateAt;

    @Column(name = "create_at", nullable = false)
    private LocalDate createAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", referencedColumnName = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_Candidate_User_Recruiter")
    )
    @JsonBackReference
    private User recruiter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_id", referencedColumnName = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_Candidate_User_Update_By")
    )
    @JsonBackReference
    private User updater;

    @OneToMany(mappedBy = "candidate", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<InterviewSchedule> interviewSchedules;

    @OneToOne(mappedBy = "candidate", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonBackReference
    private Offer offer;
    @PrePersist
    @PreUpdate
    private void prePersistOrUpdate() {
//        if (this.phoneNumber == null || this.phoneNumber.isEmpty()) {
//            this.phoneNumber = "N/A";
//        }
//        if (this.address == null || this.address.isEmpty()) {
//            this.address = "N/A";
//        }
//        if (this.yearOfExperience == null || this.yearOfExperience.isEmpty()) {
//            this.yearOfExperience = "N/A";
//        }
//        if (this.note == null || this.note.isEmpty()) {
//            this.note = "N/A";
//        }
    }
}