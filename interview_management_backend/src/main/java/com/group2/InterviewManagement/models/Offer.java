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

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Offer")
public class Offer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "offer_id")
    private int offerId;

    @Column(name = "position", nullable = false)
    private String position;

    @Column(name = "contract_type", nullable = false)
    private String contractType;

    @Column(name = "level", nullable = false)
    private String level;

    @Column(name = "department", nullable = false)
    private String department;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(name = "contract_start", nullable = false)
    private LocalDate contractStart;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(name = "contract_end", nullable = false)
    private LocalDate contractEnd;

    @Column(name = "basic_salary", nullable = false, columnDefinition = "DECIMAL(18,2)")
    private double basicSalary;

    @Column(name = "note")
    @Nationalized
    private String note;

    @Column(name = "reason_reject")
    @Nationalized
    private String reasonReject;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Column(name = "offer_status", nullable = false)
    private String offerStatus;

    @Column(name = "update_at", nullable = false)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate updateAt;

    @Column(name = "create_at", nullable = false)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate createAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_id", referencedColumnName = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_Offer_User_Update_By")
    )
    @JsonBackReference
    private User updateBy; // recruiter, admin, manager

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_owner_id", referencedColumnName = "user_id", nullable = false,
        foreignKey = @ForeignKey(name = "FK_Offer_User_Recruiter")
    )
    @JsonBackReference
    private User recruiterOwner; //role recruiter

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id")
    @JsonBackReference
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approve_by_manager_id", referencedColumnName = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_Offer_User_Manager")
    )
    @JsonBackReference
    private User approveByManager; //role Manager

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "schedule_id")
    @JsonBackReference
    private InterviewSchedule interviewSchedule;



}
