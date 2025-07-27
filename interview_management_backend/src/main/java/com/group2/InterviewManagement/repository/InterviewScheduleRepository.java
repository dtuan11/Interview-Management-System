package com.group2.InterviewManagement.repository;

import com.group2.InterviewManagement.dto.InterviewScheduleDTO;
import com.group2.InterviewManagement.dto.InterviewTitleDTO;
import com.group2.InterviewManagement.models.Candidate;
import com.group2.InterviewManagement.models.InterviewSchedule;
import com.group2.InterviewManagement.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewScheduleRepository extends JpaRepository<InterviewSchedule, Integer> {

    @Query("SELECT ins FROM InterviewSchedule ins " +
            "JOIN ins.recruiter r " +
            "JOIN ins.candidate c " +
            "JOIN ins.job j " +
            "JOIN ins.interviewScheduleInterviewer isi " +
            "JOIN isi.interviewer i " +
            "WHERE " +
//            "ins.isActive = true AND " +
//            "j.isActive=1 and j.jobStatus ='Open' AND"+
            "(:status IS NULL OR LOWER(ins.interviewScheduleStatus) LIKE LOWER(CONCAT('%', :status, '%'))) " +
            "AND (:interviewer IS NULL OR LOWER(i.fullName) LIKE LOWER(CONCAT('%', :interviewer, '%'))) " +
            "AND (" +
            "LOWER(ins.interviewScheduleResult) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(ins.scheduleTitle) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(r.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(j.jobTitle) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
            "OR LOWER(i.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))" +
            "GROUP BY ins.scheduleId " +
            "ORDER BY " +
            "CASE " +
            "WHEN ins.interviewScheduleStatus = 'New' THEN 1 " +
            "WHEN ins.interviewScheduleStatus = 'Invited' THEN 2 " +
            "WHEN ins.interviewScheduleStatus = 'Interviewed' THEN 3 " +
            "WHEN ins.interviewScheduleStatus = 'Cancelled' THEN 4 " +
            "ELSE 5 END, " +
            "ins.scheduleDate DESC")
    Page<InterviewSchedule> findInterviewSchedules(@Param("keyword") String keyword,
                                                   @Param("status") String status,
                                                   @Param("interviewer") String interviewer,
                                                   Pageable pageable);

    @Query("SELECT i FROM InterviewSchedule i WHERE i.scheduleTitle=:title")
    InterviewSchedule findByTitle(String title);
    @Query("SELECT i FROM InterviewSchedule i WHERE i.scheduleId=:id")
    InterviewSchedule findById(int id);

    @Query("SELECT new com.group2.InterviewManagement.dto.InterviewTitleDTO(" +
            "i.scheduleId, " +
            "i.scheduleTitle, " +
            "i.note) " +
            "FROM InterviewSchedule i " +
            "WHERE i.scheduleId NOT IN (" +
            "SELECT o.interviewSchedule.scheduleId " +
            "FROM Offer o " +
            "WHERE o.interviewSchedule.scheduleId IS NOT NULL)")
    List<InterviewTitleDTO> getInterviewTitle();

    InterviewSchedule findByScheduleId(Integer scheduleId);

    List<InterviewSchedule> findByScheduleDate(LocalDate date);

    List<InterviewSchedule> findByScheduleDateAndInterviewScheduleStatusNot(LocalDate yesterday, String displayName);

    List<InterviewSchedule> findByScheduleDateLessThanEqual(LocalDate date);

    @Query("SELECT ins FROM InterviewSchedule ins " +
            "JOIN ins.recruiter r " +
            "JOIN ins.candidate c " +
            "JOIN ins.job j " +
            "JOIN ins.interviewScheduleInterviewer isi " +
            "JOIN isi.interviewer i " +
            "WHERE " +
            "i.userId = :interviewerId AND " +
            "(:status IS NULL OR LOWER(ins.interviewScheduleStatus) LIKE LOWER(CONCAT('%', :status, '%'))) " +
            "AND (" +
            "LOWER(ins.interviewScheduleResult) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(ins.scheduleTitle) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(r.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(j.jobTitle) LIKE LOWER(CONCAT('%', :keyword, '%')))" +
            "GROUP BY ins.scheduleId " +
            "ORDER BY " +
            "CASE " +
            "WHEN ins.interviewScheduleStatus = 'New' THEN 1 " +
            "WHEN ins.interviewScheduleStatus = 'Invited' THEN 2 " +
            "WHEN ins.interviewScheduleStatus = 'Interviewed' THEN 3 " +
            "WHEN ins.interviewScheduleStatus = 'Cancelled' THEN 4 " +
            "ELSE 5 END, " +
            "ins.scheduleDate DESC")
    Page<InterviewSchedule> findInterviewSchedulesForInterviewer(@Param("interviewerId") Integer interviewerId,
            @Param("keyword") String keyword,
            @Param("status") String status,
            Pageable pageable);

}