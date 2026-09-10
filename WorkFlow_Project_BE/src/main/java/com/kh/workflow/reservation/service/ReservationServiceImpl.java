package com.kh.workflow.reservation.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.reservation.model.dao.ReservationDao;
import com.kh.workflow.reservation.model.dto.ReservationCreateRequest;
import com.kh.workflow.reservation.model.dto.ReservationUpdateRequest;
import com.kh.workflow.reservation.model.vo.Reservation;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationServiceImpl implements ReservationService {

    private final ReservationDao reservationDao;


    // =========================================================
    // RSV-001
    // 예약 가능 시설 조회
    // =========================================================

    @Override
    public List<Hub> getAvailableFacilities(
            LocalDateTime rsvStart,
            LocalDateTime rsvEnd) {

        validateReservationTime(rsvStart, rsvEnd);

        /*
         * 현재 Reservation 테이블에는
         * 시설 정보가 없기 때문에
         * Hub / Facility 테이블과 연결해서 구현해야 함.
         *
         * 현재 Reservation 엔티티에서는
         * Hub와의 연관관계만 존재하므로
         * 실제 시설 조회는 Facility 엔티티 구조 확인 후 구현한다.
         */

        return List.of();
    }


    // =========================================================
    // RSV-002
    // 예약 가능 일정 조회
    // =========================================================

    @Override
    public List<Reservation> getAvailableSchedules(
            Integer hubNo,
            LocalDateTime rsvStart,
            LocalDateTime rsvEnd) {

        validateReservationTime(rsvStart, rsvEnd);

        return reservationDao.findSchedules(
                hubNo,
                rsvStart,
                rsvEnd
        );
    }


    // =========================================================
    // RSV-003
    // 예약 신청
    // =========================================================

    @Override
    @Transactional
    public Reservation createReservation(
            ReservationCreateRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "예약 신청 정보가 없습니다."
            );
        }

        validateReservationTime(
                request.getRsvStart(),
                request.getRsvEnd()
        );


        // 예약 중복 확인
        long overlapCount =
                reservationDao.countOverlappingReservation(
                        request.getHubNo(),
                        request.getRsvStart(),
                        request.getRsvEnd()
                );

        if (overlapCount > 0) {
            throw new IllegalStateException(
                    "해당 시간에는 이미 예약이 존재합니다."
            );
        }


        /*
         * Reservation의 workcation 필드는
         * WorkcationInfo 객체를 참조한다.
         *
         * 따라서 workcationNo를 그대로 넣을 수 없고
         * WorkcationInfo 객체를 조회해야 한다.
         */
        WorkcationInfo workcation =
                reservationDao.findWorkcationByNo(
                        request.getWorkcationNo()
                );

        if (workcation == null) {
            throw new IllegalArgumentException(
                    "해당 워케이션 정보를 찾을 수 없습니다."
            );
        }


        /*
         * Reservation의 hub 필드 역시
         * Hub 객체를 참조한다.
         */
        Hub hub =
                reservationDao.findHubByNo(
                        request.getHubNo()
                );

        if (hub == null) {
            throw new IllegalArgumentException(
                    "해당 거점 정보를 찾을 수 없습니다."
            );
        }


        Reservation reservation = Reservation.builder()
                .rsvStart(request.getRsvStart())
                .rsvEnd(request.getRsvEnd())
                .rsvStatus("N")
                .userCapacity(request.getUserCapacity())
                .workcation(workcation)
                .hub(hub)
                .build();

        return reservationDao.save(reservation);
    }


    // =========================================================
    // RSV-004
    // 예약 상세 조회
    // =========================================================

    @Override
    public Reservation getReservationDetail(
            Integer rsvNo) {

        if (rsvNo == null) {
            throw new IllegalArgumentException(
                    "예약 번호가 없습니다."
            );
        }

        return reservationDao.findById(rsvNo)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "예약 정보를 찾을 수 없습니다."
                        )
                );
    }


    // =========================================================
    // RSV-005
    // 예약 수정
    // =========================================================

    @Override
    @Transactional
    public Reservation updateReservation(
            Integer rsvNo,
            ReservationUpdateRequest request) {

        if (rsvNo == null) {
            throw new IllegalArgumentException(
                    "예약 번호가 없습니다."
            );
        }

        if (request == null) {
            throw new IllegalArgumentException(
                    "예약 수정 정보가 없습니다."
            );
        }


        Reservation reservation =
                reservationDao.findById(rsvNo)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "예약 정보를 찾을 수 없습니다."
                                )
                        );


        // 취소된 예약 수정 방지
        if ("C".equals(reservation.getRsvStatus())) {
            throw new IllegalStateException(
                    "취소된 예약은 수정할 수 없습니다."
            );
        }


        // 완료된 예약 수정 방지
        if ("Y".equals(reservation.getRsvStatus())) {
            throw new IllegalStateException(
                    "완료된 예약은 수정할 수 없습니다."
            );
        }


        validateReservationTime(
                request.getRsvStart(),
                request.getRsvEnd()
        );


        // 자기 자신을 제외한 중복 예약 검사
        long overlapCount =
                reservationDao.countOverlappingReservationForUpdate(
                        rsvNo,
                        reservation.getHub().getHubNo(),
                        request.getRsvStart(),
                        request.getRsvEnd()
                );

        if (overlapCount > 0) {
            throw new IllegalStateException(
                    "해당 시간에는 이미 예약이 존재합니다."
            );
        }


        reservation.setRsvStart(
                request.getRsvStart()
        );

        reservation.setRsvEnd(
                request.getRsvEnd()
        );

        reservation.setUserCapacity(
                request.getUserCapacity()
        );

        return reservation;
    }


    // =========================================================
    // RSV-006
    // 예약 취소
    // =========================================================

    @Override
    @Transactional
    public void cancelReservation(
            Integer rsvNo) {

        if (rsvNo == null) {
            throw new IllegalArgumentException(
                    "예약 번호가 없습니다."
            );
        }


        Reservation reservation =
                reservationDao.findById(rsvNo)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "예약 정보를 찾을 수 없습니다."
                                )
                        );


        if ("C".equals(reservation.getRsvStatus())) {
            throw new IllegalStateException(
                    "이미 취소된 예약입니다."
            );
        }


        if ("Y".equals(reservation.getRsvStatus())) {
            throw new IllegalStateException(
                    "완료된 예약은 취소할 수 없습니다."
            );
        }


        reservation.setRsvStatus("C");
    }


    // =========================================================
    // 워케이션별 예약 조회
    // =========================================================

    @Override
    public List<Reservation> getReservationsByWorkcation(
            Integer workcationNo) {

        if (workcationNo == null) {
            throw new IllegalArgumentException(
                    "워케이션 번호가 없습니다."
            );
        }

        WorkcationInfo workcation =
                reservationDao.findWorkcationByNo(
                        workcationNo
                );

        if (workcation == null) {
            throw new IllegalArgumentException(
                    "해당 워케이션 정보를 찾을 수 없습니다."
            );
        }

        return reservationDao
                .findByWorkcationOrderByRsvStartDesc(
                        workcation
                );
    }


    // =========================================================
    // 예약 시간 검증
    // =========================================================

    private void validateReservationTime(
            LocalDateTime rsvStart,
            LocalDateTime rsvEnd) {

        if (rsvStart == null || rsvEnd == null) {
            throw new IllegalArgumentException(
                    "예약 시작 및 종료 시간을 입력해주세요."
            );
        }

        if (!rsvStart.isBefore(rsvEnd)) {
            throw new IllegalArgumentException(
                    "예약 종료 시간은 시작 시간보다 이후여야 합니다."
            );
        }
    }
}