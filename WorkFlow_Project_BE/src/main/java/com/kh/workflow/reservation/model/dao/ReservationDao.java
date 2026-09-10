package com.kh.workflow.reservation.model.dao;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.reservation.model.vo.Reservation;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface ReservationDao
        extends JpaRepository<Reservation, Integer> {

    // =========================================================
    // 워케이션별 예약 조회
    // =========================================================

    List<Reservation> findByWorkcationOrderByRsvStartDesc(
            WorkcationInfo workcation
    );


    // 워케이션 번호(PK)로 예약 조회
    // (Nam_Final 쪽 WorkcationServiceImpl이 workcationNo(Integer)만 들고 조회하던
    //  findByWorkcationNo()를, Reservation이 WorkcationInfo 연관관계로 바뀐
    //  origin/main 매핑에 맞춰 연관 프로퍼티 탐색 방식으로 대체한 것)
    List<Reservation> findByWorkcationWorkcationNo(Integer workcationNo);


    // =========================================================
    // 예약 중복 확인
    //
    // Reservation
    // └─ hub
    //     └─ hubNo
    // =========================================================

    @Query("""
        SELECT COUNT(r)
        FROM Reservation r
        WHERE r.hub.hubNo = :hubNo
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
        WHERE r.hub.hubNo = :hubNo
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
    // 거점별 예약 조회
    // =========================================================

    List<Reservation> findByHubOrderByRsvStartDesc(
            com.kh.workflow.hub.model.vo.Hub hub
    );


    // =========================================================
    // 수정 시 예약 중복 확인
    // 자기 자신의 예약은 제외
    // =========================================================

    @Query("""
        SELECT COUNT(r)
        FROM Reservation r
        WHERE r.hub.hubNo = :hubNo
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

    @Query("SELECT w FROM WorkcationInfo w WHERE w.workcationNo = :workcationNo")
	WorkcationInfo findWorkcationByNo(@Param("workcationNo") Integer workcationNo);

	@Query("SELECT h FROM Hub h WHERE h.hubNo = :hubNo")
	Hub findHubByNo(@Param("hubNo") Integer hubNo);


	List<Reservation> findByWorkcation(WorkcationInfo workcation);
}
