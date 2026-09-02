package com.kh.workflow.reservation.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.kh.workflow.reservation.model.dto.ReservationCreateRequest;
import com.kh.workflow.reservation.model.dto.ReservationUpdateRequest;
import com.kh.workflow.reservation.model.vo.Reservation;
import com.kh.workflow.reservation.service.ReservationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;


    // =========================================================
    // RSV-001
    // 예약 가능 시설 조회
    // =========================================================

    @GetMapping("/facilities")
    public ResponseEntity<?> getAvailableFacilities(
            @RequestParam Integer hubNo,
            @RequestParam LocalDateTime rsvStart,
            @RequestParam LocalDateTime rsvEnd) {

        return ResponseEntity.ok(
                reservationService.getAvailableFacilities(
                        hubNo,
                        rsvStart,
                        rsvEnd
                )
        );
    }


    // =========================================================
    // RSV-002
    // 예약 가능 일정 조회
    // =========================================================

    @GetMapping("/schedules")
    public ResponseEntity<List<Reservation>>
    getAvailableSchedules(
            @RequestParam Integer hubNo,
            @RequestParam LocalDateTime rsvStart,
            @RequestParam LocalDateTime rsvEnd) {

        return ResponseEntity.ok(
                reservationService.getAvailableSchedules(
                        hubNo,
                        rsvStart,
                        rsvEnd
                )
        );
    }


    // =========================================================
    // RSV-003
    // 예약 신청
    // =========================================================

    @PostMapping
    public ResponseEntity<Reservation> createReservation(
            @RequestBody ReservationCreateRequest request) {

        return ResponseEntity.ok(
                reservationService.createReservation(request)
        );
    }


    // =========================================================
    // RSV-004
    // 예약 상세 조회
    // =========================================================

    @GetMapping("/{rsvNo}")
    public ResponseEntity<Reservation> getReservationDetail(
            @PathVariable Integer rsvNo) {

        return ResponseEntity.ok(
                reservationService.getReservationDetail(rsvNo)
        );
    }


    // =========================================================
    // RSV-005
    // 예약 수정
    // =========================================================

    @PutMapping("/{rsvNo}")
    public ResponseEntity<Reservation> updateReservation(
            @PathVariable Integer rsvNo,
            @RequestBody ReservationUpdateRequest request) {

        return ResponseEntity.ok(
                reservationService.updateReservation(
                        rsvNo,
                        request
                )
        );
    }


    // =========================================================
    // RSV-006
    // 예약 취소
    // =========================================================

    @PatchMapping("/{rsvNo}/cancel")
    public ResponseEntity<Void> cancelReservation(
            @PathVariable Integer rsvNo) {

        reservationService.cancelReservation(rsvNo);

        return ResponseEntity.noContent().build();
    }
}