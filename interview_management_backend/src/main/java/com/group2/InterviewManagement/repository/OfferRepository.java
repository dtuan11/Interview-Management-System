package com.group2.InterviewManagement.repository;

import com.group2.InterviewManagement.dto.OfferResponse.ViewOfferResponse;
import com.group2.InterviewManagement.models.Offer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Integer> {
    @Query("SELECT new com.group2.InterviewManagement.dto.OfferResponse.ViewOfferResponse(" +
            "o.offerId, " +
            "o.candidate.fullName, " +
            "o.candidate.email, " +
            "o.approveByManager.fullName, " +
            "o.approveByManager.username, " +
            "o.recruiterOwner.username, " +
            "o.department, " +
            "o.note, " +
            "o.offerStatus) " +
            "FROM Offer o " +
            "WHERE o.isActive = true " +
            "ORDER BY o.createAt desc")
    Page<ViewOfferResponse> viewOffer(Pageable pageable);

    @Query("SELECT new com.group2.InterviewManagement.dto.OfferResponse.ViewOfferResponse(" +
            "o.offerId," +
            "o.candidate.fullName," +
            "o.candidate.email," +
            "o.approveByManager.fullName," +
            "o.approveByManager.username, " +
            "o.recruiterOwner.username, " +
            "o.department," +
            "o.note," +
            "o.offerStatus)" +
            "FROM Offer o WHERE " +
            "(:department IS NULL OR o.department = :department) AND " +
            "(:status IS NULL OR o.offerStatus = :status) AND " +
            "(:search IS NULL OR " +
            "o.candidate.fullName LIKE %:search% OR " +
            "o.candidate.email LIKE %:search% OR " +
            "o.approveByManager.fullName LIKE %:search% OR " +
            "o.note LIKE %:search%" +
            ") AND " +
            "o.isActive = true " +
            "ORDER BY o.createAt desc")
    Page<ViewOfferResponse> searchOffers(@Param("search") String search,
                                         @Param("department") String department,
                                         @Param("status") String status,
                                         Pageable pageable);
    Offer findByOfferId(Integer offerId);

    @Query("SELECT u.username FROM Offer o " +
            "JOIN o.interviewSchedule isch " +
            "JOIN InterviewScheduleInterviewer ischi ON isch.scheduleId = ischi.keyInterviewScheduleInterviewer.scheduleId " +
            "JOIN User u ON ischi.keyInterviewScheduleInterviewer.userId = u.userId " +
            "WHERE o.offerId = :offerId")
    List<String> listInterviewByOfferId(@Param("offerId") int offerId);

    List<Offer> findByDueDateAndOfferStatus(LocalDate dueDate, String status);
    @Query("SELECT o FROM Offer o WHERE o.contractStart>=:contractStart AND o.contractEnd<=:contractEnd")
    List<Offer> exportExcel(LocalDate contractStart, LocalDate contractEnd);
    @Query("SELECT CASE WHEN COUNT(o)>0 THEN TRUE ELSE FALSE END FROM Offer o WHERE o.candidate.candidateId=:candidateId")
    boolean existsByCandidateId(int candidateId);
    @Query("SELECT CASE WHEN COUNT(o)>0 THEN TRUE ELSE FALSE END FROM Offer o WHERE o.interviewSchedule.scheduleId=:scheduleId")
    boolean existsByScheduleId(int scheduleId);
    @Query("SELECT CASE WHEN COUNT(o)>0 THEN TRUE ELSE FALSE END FROM Offer o WHERE o.candidate.candidateId=:candidateId AND o.offerId!=:offerId")
    boolean existsEditByCandidateId(int candidateId,int offerId);
    @Query("SELECT CASE WHEN COUNT(o)>0 THEN TRUE ELSE FALSE END FROM Offer o WHERE o.interviewSchedule.scheduleId=:scheduleId AND o.offerId!=:offerId")
    boolean existsEditByScheduleId(int scheduleId, int offerId);

}