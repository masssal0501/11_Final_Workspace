package com.kh.workflow.reservation.service;

import java.time.LocalDateTime;
import java.util.List;

import com.kh.workflow.reservation.model.dto.ReservationCreateRequest;
import com.kh.workflow.reservation.model.dto.ReservationUpdateRequest;
import com.kh.workflow.reservation.model.vo.Reservation;

public interface ReservationService {


    // =========================================================
    // RSV-001
    // 예약 가능 시설 조회
    // =========================================================

    List<?> getAvailableFacilities(
            Integer hubNo,
            LocalDateTime rsvStart,
            LocalDateTime rsvEnd
    );


    // =========================================================
    // RSV-002
    // 예약 가능 일정 조회
    // =========================================================

    List<Reservation> getAvailableSchedules(
            Integer hubNo,
            LocalDateTime rsvStart,
            LocalDateTime rsvEnd
    );


    // =========================================================
    // RSV-003
    // 예약 신청
    // =========================================================

    Reservation createReservation(
            ReservationCreateRequest request
    );


    // =========================================================
    // RSV-004
    // 예약 상세 조회
    // =========================================================

    Reservation getReservationDetail(
            Integer rsvNo
    );


    // =========================================================
    // RSV-005
    // 예약 수정
    // =========================================================

    Reservation updateReservation(
            Integer rsvNo,
            ReservationUpdateRequest request
    );


    // =========================================================
    // RSV-006
    // 예약 취소
    // =========================================================

    void cancelReservation(
            Integer rsvNo
    );
    
    //
    List<Reservation> getReservationsByWorkcation(
            Integer workcationNo
    );
}