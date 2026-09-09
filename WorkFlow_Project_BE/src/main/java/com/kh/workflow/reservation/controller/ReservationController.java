package com.kh.workflow.reservation.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.kh.workflow.hub.model.service.HubService;
import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.reservation.model.dto.ReservationCreateRequest;
import com.kh.workflow.reservation.model.dto.ReservationUpdateRequest;
import com.kh.workflow.reservation.model.vo.Reservation;
import com.kh.workflow.reservation.service.ReservationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;

@Tag(name = "예약 관리", description = "거점 시설/일정 예약 가능 여부 조회, 예약 신청, 조회, 수정, 취소 관련 API (인증된 사용자만 이용 가능)")
@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    private final HubService hubService;


    // =========================================================
    // BUG-XXX 수정: 예약 신청 화면(프런트엔드 ReservationEnrollComponent)이
    // 호출하는 GET /reservations/hubs 엔드포인트가 기존에 아예 존재하지 않아
    // "03. 거점 선택" 단계에서 항상 400 오류가 발생하며 예약 신청 자체가
    // 불가능했던 문제를 해결하기 위해 추가한 엔드포인트.
    //
    // 기존 HubController(/hubs/search)와 동일한 HubService.searchHubList를
    // 재사용해 지역(대분류/소분류) 조건에 맞는 거점 후보 목록을 반환한다.
    // (시간대별 예약 가능 여부까지 걸러내는 완전한 필터링은 하지 않음 -
    // 실제 시간 중복 여부는 기존 로직대로 예약 신청(POST /reservations)
    // 시점에 ReservationServiceImpl.createReservation()에서 이미
    // countOverlappingReservation()으로 검증되고 있으므로, 이중 예약 자체는
    // 이 변경 이전에도 이후에도 방지된다.)
    // =========================================================

    @Operation(summary = "예약용 거점 목록 조회", description = "지역(대분류/소분류) 조건에 맞는 예약 신청용 거점 후보 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패(JWT 없음/만료)", content = @Content)
    })
    @SecurityRequirement(name = "JWT")
    @GetMapping("/hubs")
    public ResponseEntity<List<Hub>> getHubsForReservation(
            @Parameter(description = "검색할 지역(대분류)", example = "제주")
            @RequestParam(required = false) String mainRegion,
            @Parameter(description = "검색할 상세 지역(소분류)", example = "서귀포시")
            @RequestParam(required = false) String subRegion,
            @Parameter(description = "거점 시설 유형 코드(숫자 문자열, 예: 1=숙소, 2=공유오피스). 생략하거나 숫자가 아니면 전체(1,2) 검색")
            @RequestParam(required = false) String hubType,
            @Parameter(description = "예약 조회 시작 일시(참고용, 현재는 지역 조건으로만 필터링)", example = "2026-10-05T09:00:00")
            @RequestParam(required = false) LocalDateTime rsvStart,
            @Parameter(description = "예약 조회 종료 일시(참고용, 현재는 지역 조건으로만 필터링)", example = "2026-10-09T18:00:00")
            @RequestParam(required = false) LocalDateTime rsvEnd) {

        List<Integer> hubTypes;

        try {
            hubTypes = List.of(Integer.parseInt(hubType.trim()));
        } catch (Exception e) {
            hubTypes = List.of(1, 2);
        }

        Pageable pageable = PageRequest.of(0, 100);

        Page<Hub> page = hubService.searchHubList(
                pageable,
                mainRegion,
                subRegion,
                hubTypes,
                null
        );

        return ResponseEntity.ok(page.getContent());
    }


    // =========================================================
    // RSV-001
    // 예약 가능 시설 조회
    // =========================================================

    @Operation(summary = "예약 가능 시설 조회", description = "지정한 거점과 기간(rsvStart~rsvEnd)에 예약 가능한 시설 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패(JWT 없음/만료)", content = @Content)
    })
    @SecurityRequirement(name = "JWT")
    @GetMapping("/facilities")
    public ResponseEntity<?> getAvailableFacilities(
            @Parameter(description = "예약 대상 거점 번호", example = "1", required = true)
            @RequestParam Integer hubNo,
            @Parameter(description = "예약 조회 시작 일시", example = "2026-09-10T09:00:00", required = true)
            @RequestParam LocalDateTime rsvStart,
            @Parameter(description = "예약 조회 종료 일시", example = "2026-09-10T18:00:00", required = true)
            @RequestParam LocalDateTime rsvEnd) {

        return ResponseEntity.ok(
                reservationService.getAvailableFacilities(
                        rsvStart,
                        rsvEnd
                )
        );
    }


    // =========================================================
    // RSV-002
    // 예약 가능 일정 조회
    // =========================================================

    @Operation(summary = "예약 가능 일정 조회", description = "지정한 거점과 기간(rsvStart~rsvEnd)에 이미 예약된 일정 목록을 조회해 예약 가능 시간대를 판단할 수 있도록 합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패(JWT 없음/만료)", content = @Content)
    })
    @SecurityRequirement(name = "JWT")
    @GetMapping("/schedules")
    public ResponseEntity<List<Reservation>>
    getAvailableSchedules(
            @Parameter(description = "조회 대상 거점 번호", example = "1", required = true)
            @RequestParam Integer hubNo,
            @Parameter(description = "예약 조회 시작 일시", example = "2026-09-10T09:00:00", required = true)
            @RequestParam LocalDateTime rsvStart,
            @Parameter(description = "예약 조회 종료 일시", example = "2026-09-10T18:00:00", required = true)
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

    @Operation(summary = "예약 신청", description = "거점 시설에 대한 새 예약을 신청합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "신청 성공, 생성된 예약 정보 반환"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청(일정 중복 등)", content = @Content),
        @ApiResponse(responseCode = "401", description = "인증 실패(JWT 없음/만료)", content = @Content)
    })
    @SecurityRequirement(name = "JWT")
    @PostMapping
    public ResponseEntity<Reservation> createReservation(
            @Parameter(description = "예약 신청 정보(거점, 시설, 기간 등)", required = true)
            @RequestBody ReservationCreateRequest request) {

        return ResponseEntity.ok(
                reservationService.createReservation(request)
        );
    }


    // =========================================================
    // RSV-004
    // 예약 상세 조회
    // =========================================================

    @Operation(summary = "예약 상세 조회", description = "예약 번호로 예약 상세 정보를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패(JWT 없음/만료)", content = @Content),
        @ApiResponse(responseCode = "404", description = "해당 번호의 예약이 존재하지 않음", content = @Content)
    })
    @SecurityRequirement(name = "JWT")
    @GetMapping("/{rsvNo}")
    public ResponseEntity<Reservation> getReservationDetail(
            @Parameter(description = "조회할 예약 번호", example = "1", required = true)
            @PathVariable Integer rsvNo) {

        return ResponseEntity.ok(
                reservationService.getReservationDetail(rsvNo)
        );
    }


    // =========================================================
    // RSV-005
    // 예약 수정
    // =========================================================

    @Operation(summary = "예약 수정", description = "기존 예약의 일정/시설 등 정보를 수정합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "수정 성공, 수정된 예약 정보 반환"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청(일정 중복 등)", content = @Content),
        @ApiResponse(responseCode = "401", description = "인증 실패(JWT 없음/만료)", content = @Content),
        @ApiResponse(responseCode = "404", description = "해당 번호의 예약이 존재하지 않음", content = @Content)
    })
    @SecurityRequirement(name = "JWT")
    @PutMapping("/{rsvNo}")
    public ResponseEntity<Reservation> updateReservation(
            @Parameter(description = "수정할 예약 번호", example = "1", required = true)
            @PathVariable Integer rsvNo,
            @Parameter(description = "수정할 예약 정보", required = true)
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

    @Operation(summary = "예약 취소", description = "본인이 신청한 예약을 취소 처리합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "취소 성공(본문 없음)"),
        @ApiResponse(responseCode = "401", description = "인증 실패(JWT 없음/만료)", content = @Content),
        @ApiResponse(responseCode = "404", description = "해당 번호의 예약이 존재하지 않음", content = @Content)
    })
    @SecurityRequirement(name = "JWT")
    @PatchMapping("/{rsvNo}/cancel")
    public ResponseEntity<Void> cancelReservation(
            @Parameter(description = "취소할 예약 번호", example = "1", required = true)
            @PathVariable Integer rsvNo) {

        reservationService.cancelReservation(rsvNo);

        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "워케이션별 예약 목록 조회", description = "특정 워케이션 신청 건에 연결된 예약 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패(JWT 없음/만료)", content = @Content)
    })
    @SecurityRequirement(name = "JWT")
    @GetMapping("/workcation/{workcationNo}")
    public ResponseEntity<List<Reservation>>
    getReservationsByWorkcation(
            @Parameter(description = "조회할 워케이션 번호", example = "1", required = true)
            @PathVariable Integer workcationNo) {

        return ResponseEntity.ok(
            reservationService
                .getReservationsByWorkcation(workcationNo)
        );
    }
}