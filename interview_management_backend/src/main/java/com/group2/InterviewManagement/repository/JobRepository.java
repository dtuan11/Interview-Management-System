package com.group2.InterviewManagement.repository;

import com.group2.InterviewManagement.models.Job;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Integer> {
    @Query("SELECT j FROM Job j " +
            "WHERE (:jobTitle IS NULL OR LOWER(j.jobTitle) LIKE LOWER(CONCAT('%', :jobTitle, '%'))) " +
            "AND (:jobStatus IS NULL OR j.jobStatus = :jobStatus) " +
            "AND j.isActive = 1 " +
            "ORDER BY j.jobId DESC")
    Page<Job> findByJobTitleAndJobStatus(@Param("jobTitle") String jobTitle,
                                         @Param("jobStatus") String jobStatus,
                                         Pageable pageable);

    @Query("SELECT j FROM Job j " +
            "WHERE j.isActive = 1 " +
            "ORDER BY j.createAt DESC, " +
            "CASE j.jobStatus " +
            "  WHEN 'Open' THEN 1 " +
            "  WHEN 'Draft' THEN 2 " +
            "  WHEN 'Closed' THEN 3 " +
            "  ELSE 4 END, " +
            "j.startDate ASC, " +
            "j.jobTitle ASC")
    Page<Job> findAllSortedByCreationDateStatusAndStartDate(Pageable pageable);

    List<Job> findByJobStatusAndIsActive(String status, int isActive);

    Job findByJobIdAndIsActive(int jobId, int isActive);

    List<Job> findByJobStatusAndStartDateLessThanEqualAndIsActive(String status, LocalDate date, int isActive);

    List<Job> findByJobStatusAndEndDateLessThanAndIsActive(String status, LocalDate date, int isActive);
}