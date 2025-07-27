package com.group2.InterviewManagement.repository;

import com.group2.InterviewManagement.dto.CandidateNameDTO;
import com.group2.InterviewManagement.models.Candidate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Integer> {
    //    List<Candidate> findAll();
    Candidate getByCandidateId(int id);

    List<Candidate> findAllByIsActiveIsTrue();

    @Query("SELECT c FROM Candidate c "
            + "JOIN c.recruiter r "
            + "WHERE c.isActive = :isActive AND "
            + " LOWER(c.candidateStatus) LIKE LOWER(CONCAT('%', :status, '%')) AND "
            + "(  LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(c.phoneNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(c.position) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(r.username) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
            + "ORDER BY "
            + "CASE "
            + "WHEN c.candidateStatus = 'Waiting for interview' THEN 1 "
            + "WHEN c.candidateStatus = 'Waiting for approval' THEN 2 "
            + "WHEN c.candidateStatus = 'Waiting for response' THEN 3 "
            + "WHEN c.candidateStatus = 'Open' THEN 4 "
            + "WHEN c.candidateStatus = 'Passed Interview' THEN 5 "
            + "WHEN c.candidateStatus = 'Approved Offer' THEN 6 "
            + "WHEN c.candidateStatus = 'Rejected Offer' THEN 7 "
            + "WHEN c.candidateStatus = 'Accepted offer' THEN 8 "
            + "WHEN c.candidateStatus = 'Declined offer' THEN 9 "
            + "WHEN c.candidateStatus = 'Cancelled offer' THEN 10 "
            + "WHEN c.candidateStatus = 'Failed interview' THEN 11 "
            + "WHEN c.candidateStatus = 'Cancelled interview' THEN 12 "
            + "WHEN c.candidateStatus = 'Banned' THEN 13 "
            + "ELSE 14 END, "
            + "c.createAt DESC")
    Page<Candidate> findCandidateAndPaging(@Param("keyword") String keyword,
                                           @Param("status") String status,
                                           @Param("isActive") boolean isActive,
                                           Pageable pageable);

    List<Candidate> findAllByCandidateStatus(String open);

    Candidate findByEmail(String candidateName);
    @Query("SELECT c.candidateId FROM Candidate c WHERE c.email = :email")
    Integer findCandidateIdByEmail(@Param("email") String email);
    @Query("SELECT NEW com.group2.InterviewManagement.dto.CandidateNameDTO(" +
            "c.candidateId," +
            "c.fullName," +
            "c.email," +
            "c.position," +
            "i.scheduleId," +
            "i.scheduleTitle," +
            "i.note," +
            "j.jobLevel," +
            "u.userId," +
            "u.fullName," +
            "u.username)"+
            "FROM Candidate c " +
            "JOIN InterviewSchedule i " +
            "ON c.candidateId=i.candidate.candidateId " +
            "JOIN Job j " +
            "ON i.job.jobId=j.jobId " +
            "JOIN User u " +
            "ON c.recruiter.userId = u.userId " +
            "WHERE c.candidateStatus!= :candidateStatus " +
            "AND i.interviewScheduleResult='Passed'" +
            "AND c.candidateId " +
            "NOT IN (SELECT o.candidate.candidateId FROM Offer o)")
    List<CandidateNameDTO> getAllCandidate(String candidateStatus);
    @Modifying
    @Transactional
    @Query("UPDATE Candidate c SET c.candidateStatus = :status WHERE c.candidateId = :id")
    void updateCandidateStatus(@Param("id") int id, @Param("status") String status);

    boolean existsCandidateByEmail(String email);


    boolean existsCandidateByEmailAndIsActiveIsTrue(String email);
    boolean existsCandidateByPhoneNumberAndIsActiveIsTrue(String phoneNumber);
}