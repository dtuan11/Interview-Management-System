package com.group2.InterviewManagement.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Job")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_id")
    private Integer jobId;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(name = "start_date", nullable = false)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @Column(name = "job_skills", nullable = false)
    private String jobSkills;

    @Column(name = "job_benefit", nullable = false)
    private String jobBenefit;

    @Column(name = "salary_range_from", columnDefinition = "DECIMAL(18,2) DEFAULT 0.00")
    private double salaryRangeFrom;

    @Column(name = "salary_range_to", nullable = false, columnDefinition = "DECIMAL(18,2)")
    private double salaryRangeTo;

    @Column(name = "working_address", nullable = false)
    private String workingAddress;

    @Column(name = "job_description", length = 500)
    @Nationalized
    private String jobDescription;

    @Column(name = "job_status", nullable = false)
    private String jobStatus;

    @Column(name = "job_level", nullable = false)
    private String jobLevel;

    @Column(name = "create_at", nullable = false)
    private LocalDate createAt;

    @Column(name = "update_at", nullable = false)
    private LocalDate updateAt;

    @Column(name = "is_active", nullable = false)
    private int isActive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_id", referencedColumnName = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_Job_User")
    )
    @JsonBackReference
    private User updateBy;

    @OneToMany(mappedBy = "job", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<InterviewSchedule> list;


}
