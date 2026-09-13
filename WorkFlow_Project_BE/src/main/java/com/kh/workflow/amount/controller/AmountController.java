package com.kh.workflow.amount.controller;

import java.beans.PropertyEditorSupport;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.amount.model.service.AmountService;
import com.kh.workflow.amount.model.vo.Amount;
import com.kh.workflow.amount.model.vo.SupportList;
import com.kh.workflow.employee.model.dao.EmployeeDao;
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.workcation.model.dao.WorkcationDao;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

@RestController
@RequestMapping("/api/v1/amounts")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class AmountController {

    private final AmountService amountService;
    private final EmployeeDao employeeDao;
    private final WorkcationDao workcationDao;

    public AmountController(AmountService amountService, EmployeeDao employeeDao, WorkcationDao workcationDao) {
        this.amountService = amountService;
        this.employeeDao = employeeDao;
        this.workcationDao = workcationDao;
    }

    // BUG-N08/BUG-N10: 조회(GET)·취소(cancel) API에 소유권 검증이 없어 로그인만
    // 하면 타인의 정산 신청을 열람·취소할 수 있었다. BUG-N03(수정 API)에 적용한
    // 것과 동일한 정책 - amount는 workcationNo만 갖고 있어(연관관계 없음)
    // WorkcationInfo를 통해 신청자(empNo)를 조회한다. STAFF/MANAGER는 본인이
    // 신청한 정산만, ADMIN은 전체 접근 가능.
    private void checkAmountAccess(Amount amount, Authentication authentication) {

        Employee loginEmployee = employeeDao.findByEmpId(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("로그인 사용자 정보를 찾을 수 없습니다."));

        if ("ADMIN".equals(loginEmployee.getAuthCode())) {
            return;
        }

        WorkcationInfo workcation = amount.getWorkcationNo() != null
                ? workcationDao.findById(amount.getWorkcationNo()).orElse(null)
                : null;

        boolean isOwner = workcation != null
                && workcation.getEmployee() != null
                && workcation.getEmployee().getEmpNo().equals(loginEmployee.getEmpNo());

        if (!isOwner) {
            throw new AccessDeniedException("본인이 신청한 정산만 접근할 수 있습니다.");
        }
    }

    // BUG-10: 부서장 대시보드의 "정산 대기 목록"에서 부서원의 정산 상세로 클릭해
    // 들어갈 수 있어야 한다. 위 checkAmountAccess(취소 등 상태를 바꾸는 작업에 사용)는
    // 그대로 본인 소유만 허용하고, "조회"에 한해서만 MANAGER에게 자신과 같은 부서
    // (depId) 소속 신청자의 정산 열람 권한을 추가로 허용한다(다른 부서는 여전히 차단,
    // 취소 등 변경 권한까지 넓히지는 않는다).
    private void checkAmountViewAccess(Amount amount, Authentication authentication) {

        Employee loginEmployee = employeeDao.findByEmpId(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("로그인 사용자 정보를 찾을 수 없습니다."));

        if ("ADMIN".equals(loginEmployee.getAuthCode())) {
            return;
        }

        WorkcationInfo workcation = amount.getWorkcationNo() != null
                ? workcationDao.findById(amount.getWorkcationNo()).orElse(null)
                : null;

        boolean isOwner = workcation != null
                && workcation.getEmployee() != null
                && workcation.getEmployee().getEmpNo().equals(loginEmployee.getEmpNo());

        boolean isManagerOfSameDept = "MANAGER".equals(loginEmployee.getAuthCode())
                && workcation != null
                && workcation.getEmployee() != null
                && workcation.getEmployee().getDepId() != null
                && workcation.getEmployee().getDepId().equals(loginEmployee.getDepId());

        if (!isOwner && !isManagerOfSameDept) {
            throw new AccessDeniedException("본인이 신청했거나 소속 부서원이 신청한 정산만 조회할 수 있습니다.");
        }
    }

    // =========================================================
    // ★ 날짜 문자열 바인딩 커스텀 처리
    // =========================================================

    @InitBinder
    public void initBinder(WebDataBinder binder) {

        binder.registerCustomEditor(
            LocalDateTime.class,
            new PropertyEditorSupport() {

                @Override
                public void setAsText(String text) {

                    if (text == null || text.isBlank()) {
                        setValue(null);
                        return;
                    }

                    try {
                        setValue(LocalDateTime.parse(text));

                    } catch (DateTimeParseException e) {
                        setValue(LocalDate.parse(text).atStartOfDay());
                    }
                }
            }
        );
    }

    // =========================================================
    // 관리자 - 전체 비용 신청 목록 (페이지네이션)
    //
    // GET /api/v1/amounts
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getAmountList(
            org.springframework.data.domain.Pageable pageable) {

        try {

            return ResponseEntity.ok(
                    amountService.selectAmountList(pageable)
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("비용 신청 목록 조회 중 오류가 발생했습니다.");
        }
    }

    // =========================================================
    // 비용 정산 신청
    //
    // POST /api/v1/amounts
    // =========================================================
    @PostMapping
    public ResponseEntity<?> createAmount(
            @ModelAttribute Amount amount,
            @RequestParam(value = "file", required = false)
            MultipartFile[] files) {

        try {

            amount.setAmountNo(null);
            amount.setStatus("R");

            if (amount.getApprovedAmount() == null) {
                amount.setApprovedAmount(0);
            }

            int result =
                    amountService.insertAmount(amount, files);

            if (result <= 0) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("비용 신청에 실패했습니다.");
            }

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(amount);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("비용 신청 중 오류가 발생했습니다: "
                            + e.getMessage());
        }
    }

    // =========================================================
    // 내 비용 신청 목록
    // =========================================================

    @GetMapping("/my")
    public ResponseEntity<?> getMyAmountList(
            org.springframework.data.domain.Pageable pageable,
            Authentication authentication) {

        try {

            if (authentication == null ||
                !authentication.isAuthenticated()) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }

            return ResponseEntity.ok(
                    amountService.selectMyAmountList(
                            pageable,
                            authentication
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("내 비용 목록 조회 중 오류가 발생했습니다.");
        }
    }

    // =========================================================
    // 비용 단건 조회
    // =========================================================

    @GetMapping("/{amountNo}")
    public ResponseEntity<?> getAmountById(
            @PathVariable("amountNo") Integer amountNo,
            Authentication authentication) {

        try {

            Amount amount =
                    amountService.selectAmountById(amountNo);

            if (amount == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("해당 비용 정산 내역을 찾을 수 없습니다.");
            }

            checkAmountViewAccess(amount, authentication);

            return ResponseEntity.ok(amount);

        } catch (AccessDeniedException e) {

            throw e;

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("비용 상세 조회 중 오류가 발생했습니다.");
        }
    }

    // =========================================================
    // 비용 신청 수정
    //
    // PUT /api/v1/amounts/{amountNo}
    //
    // BUG-N10: 이전에 존재하던 워케이션별 비용 목록 조회
    // (GET /api/v1/amounts/workcation/{workcationNo})는 프런트엔드가
    // 더 이상 사용하지 않는(AmountList.jsx만 참조하며 그 컴포넌트 자체가
    // 라우팅되지 않는 고아 코드) 기존 엔드포인트라 새 /my 기반 흐름으로
    // 대체되면서 함께 정리했다 - 남겨두면 검증되지 않은 죽은 코드가 된다.
    // =========================================================

    @PutMapping("/{amountNo}")
    public ResponseEntity<?> updateAmount(
            @PathVariable("amountNo") int amountNo,
            @ModelAttribute Amount amount,
            @RequestParam(value = "file", required = false)
            MultipartFile[] files,
            Authentication authentication) {

        try {

            amount.setAmountNo(amountNo);

            // -------------------------------------------------
            // 기존 비용 확인
            // -------------------------------------------------

            Amount existingAmount =
                    amountService.selectAmountById(
                            amountNo
                    );


            if (existingAmount == null) {

                return ResponseEntity
                        .status(
                                HttpStatus.NOT_FOUND
                        )
                        .body(
                                "수정할 비용 신청을 찾을 수 없습니다."
                        );
            }


            // -------------------------------------------------
            // BUG-N03: 로그인 사용자 조회 (Service 계층 소유권 검증용)
            // -------------------------------------------------

            Employee loginEmployee =
                    employeeDao.findByEmpId(
                            authentication.getName()
                    ).orElse(null);


            amountService.updateAmount(
                    amount,
                    files == null
                            ? List.of()
                            : List.of(files),
                    loginEmployee
            );

            return ResponseEntity.ok(
                    "비용 신청이 수정되었습니다."
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());

        } catch (AccessDeniedException e) {

            // BUG-N03: ExceptionTranslationFilter가 AccessDeniedException을 403으로
            // 변환하도록 그대로 다시 던진다 (아래 catch(Exception)에서 500으로 감싸면 안 됨).
            throw e;

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("비용 수정 중 오류가 발생했습니다: "
                            + e.getMessage());
        }
    }

    // =========================================================
    // 비용 신청 취소
    // =========================================================

    @PatchMapping("/{amountNo}/cancel")
    public ResponseEntity<?> cancelAmount(
            @PathVariable("amountNo")
            int amountNo,
            Authentication authentication) {

        try {

            if (amountNo <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "잘못된 비용 신청 번호입니다."
                        );
            }


            // BUG-N08: 소유권 검증 없이 누구나 타인의 정산 신청을 취소할 수 있었다.
            Amount existingAmount = amountService.selectAmountById(amountNo);

            if (existingAmount == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "존재하지 않는 비용 신청입니다."
                        );
            }

            checkAmountAccess(existingAmount, authentication);


            int result =
                    amountService.cancelAmount(amountNo);

            if (result > 0) {

                return ResponseEntity.ok(
                        "비용 신청이 취소되었습니다."
                );
            }

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("취소할 수 없는 비용 신청입니다.");

        } catch (AccessDeniedException e) {

            throw e;


        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("비용 신청 취소 중 오류가 발생했습니다.");
        }
    }

    // =========================================================
    // 결재 상태 변경
    // =========================================================

    @PatchMapping("/{amountNo}/approval")
    public ResponseEntity<?> updateApproval(
            @PathVariable("amountNo") int amountNo,
            @RequestParam("status") String status,
            @RequestParam("approvedAmount") int approvedAmount,
            @RequestParam(value = "comment", required = false) String comment,
            @RequestParam(value = "sponsorName", required = false) String sponsorName,
            @RequestParam(value = "sponsorAmount", defaultValue = "0") int sponsorAmount,
            @RequestParam(value = "sponsorStatus", required = false) String sponsorStatus,
            @RequestParam(value = "remark", required = false) String remark,
            @RequestBody(required = false) Map<String, Object> body) {

        try {

            SupportList sponsor = null;

            if (sponsorName != null && !sponsorName.trim().isEmpty()) {
                sponsor = new SupportList();
                sponsor.setSponsorName(sponsorName);
                sponsor.setRequestAmount(sponsorAmount);
                sponsor.setApprovedAmount(sponsorAmount);
                sponsor.setStatus(sponsorStatus == null ? "UNPAID" : sponsorStatus);
                sponsor.setRemark(remark);
                sponsor.setTransportSupported("N");
                sponsor.setOtherSupported("N");
            }

            // itemSupports 파싱
            List<Map<String, Object>> itemSupports = new ArrayList<>();

            if (body != null && body.get("itemSupports") instanceof List<?> rawList) {
                for (Object o : rawList) {
                    if (o instanceof Map<?, ?> m) {
                        Map<String, Object> item = new HashMap<>();
                        item.put("itemNo", m.get("itemNo"));
                        item.put("amount", m.get("amount"));
                        itemSupports.add(item);
                    }
                }
            }

            amountService.updateApprovalWithSponsor(
                    amountNo, status, approvedAmount, comment, sponsor, itemSupports
            );

            return ResponseEntity.ok().build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("결재 처리 중 오류가 발생했습니다.");
        }
    }
    
    
 // =========================================================
 // 항목별 회사 지원금 저장 (승인 전 임시 저장용)
 //
 // PATCH /api/v1/amounts/item/{itemNo}/support
 // =========================================================

 @PatchMapping("/item/{itemNo}/support")
 public ResponseEntity<?> updateItemSupport(
         @PathVariable int itemNo,
         @RequestParam int amountNo,
         @RequestParam int amount) {

     try {

         amountService.updateItemCompanySupport(
                 itemNo,
                 amountNo,
                 amount
         );

         return ResponseEntity.ok("회사 지원금이 저장되었습니다.");

     } catch (IllegalArgumentException e) {

         return ResponseEntity
                 .status(HttpStatus.BAD_REQUEST)
                 .body(e.getMessage());

     } catch (Exception e) {

         e.printStackTrace();

         return ResponseEntity
                 .status(HttpStatus.INTERNAL_SERVER_ERROR)
                 .body("회사 지원금 저장 중 오류가 발생했습니다.");
     }
 }

    // =========================================================
    // 항목별 회사 지원금 수정
    //
    // BUG-N06: 역할 검증이 전혀 없어 STAFF도 회사 지원금 처리를 호출할 수
    // 있었다. SecurityConfig에 이미 이 경로(PATCH .../items/*/company-support)를
    // ADMIN 전용으로 제한하는 규칙이 있는데, 이번 병합에서 KS 브랜치의
    // 컨트롤러가 이 엔드포인트 자체를 빠뜨려 그 보안 규칙이 아무 경로도
    // 막지 못하는 죽은 규칙이 될 뻔했다 - Service 메서드는 남아있어 그대로
    // 되살린다.
    // =========================================================

    @PatchMapping("/{amountNo}/items/{itemNo}/company-support")
    public ResponseEntity<?> updateItemCompanySupport(
            @PathVariable("amountNo") int amountNo,
            @PathVariable("itemNo") int itemNo,
            @RequestParam("amount") int amount) {

        try {

            int result =
                    amountService.updateItemCompanySupport(
                            itemNo,
                            amountNo,
                            amount
                    );

            if (result > 0) {
                return ResponseEntity.ok(
                        "항목별 회사 지원금이 수정되었습니다."
                );
            }

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("회사 지원금 수정에 실패했습니다.");

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("회사 지원금 수정 중 오류가 발생했습니다.");
        }
    }

    // =========================================================
    // 파일 삭제
    // =========================================================

    @DeleteMapping("/file/{amountFileNo}/delete")
    public ResponseEntity<?> deleteFile(
            @PathVariable int amountFileNo) {

        try {

            int result =
                    amountService.deleteFile(amountFileNo);

            if (result > 0) {
                return ResponseEntity.ok(
                        "파일이 삭제되었습니다."
                );
            }

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("파일 삭제에 실패했습니다.");

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("파일 삭제 중 오류가 발생했습니다.");
        }
    }

    // =========================================================
    // 통계
    // =========================================================

    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {

        try {

            Map<String, Object> statistics =
                    amountService.getFullStatistics();

            return ResponseEntity.ok(statistics);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("통계 조회 중 오류가 발생했습니다.");
        }
    }
}