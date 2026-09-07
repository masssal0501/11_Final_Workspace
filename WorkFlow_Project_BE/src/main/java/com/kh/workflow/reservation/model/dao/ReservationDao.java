package com.kh.workflow.reservation.model.dao;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.reservation.model.vo.Reservation;

public interface ReservationDao extends JpaRepository<Reservation, Integer>{

	List<Reservation> findByWorkcationNo(Integer workcationNo);
	
	  // =========================================================
    // 예약 가능 여부 확인
    // =========================================================

    @Query("""
        SELECT COUNT(r)
        FROM Reservation r
        WHERE r.hubNo = :hubNo
          AND r.rsvStatus = 'N'
          AND r.rsvStart < :rsvEnd
          AND r.rsvEnd > :rsvStart
    """)
    long countOverlappingReservation(
            @Param("hubNo") Integer hubNo,
            @Param("rsvStart") LocalDateTime rsvStart,
            @Param("rsvEnd") LocalDateTime rsvEnd
    );


    // =========================================================
    // 예약 가능 일정 조회
    // =========================================================

    @Query("""
        SELECT r
        FROM Reservation r
        WHERE r.hubNo = :hubNo
          AND r.rsvStatus = 'N'
          AND r.rsvStart < :rsvEnd
          AND r.rsvEnd > :rsvStart
        ORDER BY r.rsvStart
    """)
    List<Reservation> findSchedules(
            @Param("hubNo") Integer hubNo,
            @Param("rsvStart") LocalDateTime rsvStart,
            @Param("rsvEnd") LocalDateTime rsvEnd
    );


    // =========================================================
    // 워케이션별 예약 조회
    // =========================================================

    List<Reservation> findByWorkcationNoOrderByRsvStartDesc(
            Integer workcationNo
    );


    // =========================================================
    // 거점별 예약 조회
    // =========================================================

    List<Reservation> findByHubNoOrderByRsvStartDesc(
            Integer hubNo
    );


    // =========================================================
    // 수정 시 예약 중복 확인
    // 자기 자신의 예약은 제외
    // =========================================================

    @Query("""
        SELECT COUNT(r)
        FROM Reservation r
        WHERE r.hubNo = :hubNo
          AND r.rsvNo <> :rsvNo
          AND r.rsvStatus = 'N'
          AND r.rsvStart < :rsvEnd
          AND r.rsvEnd > :rsvStart
    """)
    long countOverlappingReservationForUpdate(
            @Param("rsvNo") Integer rsvNo,
            @Param("hubNo") Integer hubNo,
            @Param("rsvStart") LocalDateTime rsvStart,
            @Param("rsvEnd") LocalDateTime rsvEnd
    );


}
