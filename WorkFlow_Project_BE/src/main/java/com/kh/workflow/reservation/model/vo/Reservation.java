package com.kh.workflow.reservation.model.vo;

import java.time.LocalDateTime;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="RESERVATION")

@DynamicInsert
@DynamicUpdate

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

    @Column(name = "rsv_status", nullable = false, columnDefinition = "VARCHAR(1) DEFAULT 'N'")
    private String rsvStatus;


    // =========================================================
    // 이용 인원
    // =========================================================

    @Column(name = "user_capacity")
    private Integer userCapacity;


    // =========================================================
    // 워케이션 번호
    // =========================================================

    @JoinColumn(name = "workcation_no", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private WorkcationInfo workcation;


    // =========================================================
    // 거점 번호
    // =========================================================

    @JoinColumn(name = "hub_no", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private Hub hub;
}