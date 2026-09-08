package com.kh.workflow.reservation.service;

import java.time.LocalDateTime;
import java.util.List;

import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.reservation.model.dto.ReservationCreateRequest;
import com.kh.workflow.reservation.model.dto.ReservationUpdateRequest;
import com.kh.workflow.reservation.model.vo.Reservation;

public interface ReservationService {

    // =========================================================
    // RSV-001
    // 예약 가능 시설 조회
    //
    // 특정 시간대에 예약 가능한 거점(시설)을 조회한다.
    // =========================================================
    List<Hub> getAvailableFacilities(
            LocalDateTime rsvStart,
            LocalDateTime rsvEnd
    );


    // =========================================================
    // RSV-002
    // 예약 가능 일정 조회
    //
    // 특정 거점에서 해당 시간대에 예약 가능한 일정을 조회한다.
    // =========================================================
    List<Reservation> getAvailableSchedules(
            Integer hubNo,
            LocalDateTime rsvStart,
            LocalDateTime rsvEnd
    );


    // =========================================================
    // RSV-003
    // 예약 신청
    //
    // 예약 생성에 필요한 정보는 DTO로 전달받는다.
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
    //
    // 실제 데이터를 삭제하지 않고
    // rsvStatus를 C(취소)로 변경한다.
    // =========================================================
    void cancelReservation(
            Integer rsvNo
    );


    // =========================================================
    // 워케이션별 예약 조회
    //
    // 특정 워케이션에 등록된 예약 목록을 조회한다.
    // =========================================================
    List<Reservation> getReservationsByWorkcation(
            Integer workcationNo
    );

}
