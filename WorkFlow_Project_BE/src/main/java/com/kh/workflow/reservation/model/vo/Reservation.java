package com.kh.workflow.reservation.model.vo;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reservation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    // =========================================================
    // 예약 번호
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rsv_no")
    private Integer rsvNo;


    // =========================================================
    // 예약 시작일시
    // =========================================================

    @Column(name = "rsv_start", nullable = false)
    private LocalDateTime rsvStart;


    // =========================================================
    // 예약 종료일시
    // =========================================================

    @Column(name = "rsv_end", nullable = false)
    private LocalDateTime rsvEnd;


    // =========================================================
    // 예약 상태
    // N : 예약
    // C : 취소
    // Y : 완료
    // =========================================================

    @Column(name = "rsv_status", nullable = false)
    private String rsvStatus;


    // =========================================================
    // 이용 인원
    // =========================================================

    @Column(name = "user_capacity")
    private Integer userCapacity;


    // =========================================================
    // 워케이션 번호
    // =========================================================

    @Column(name = "workcation_no", nullable = false)
    private Integer workcationNo;


    // =========================================================
    // 거점 번호
    // =========================================================

    @Column(name = "hub_no", nullable = false)
    private Integer hubNo;
}