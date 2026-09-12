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

@RestController
@RequestMapping("/api/v1/amounts")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class AmountController {

    private final AmountService amountService;

    public AmountController(AmountService amountService) {
        this.amountService = amountService;
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
            org.springframework.security.core.Authentication authentication) {

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
            @PathVariable("amountNo") Integer amountNo) {

        try {

            Amount amount =
                    amountService.selectAmountById(amountNo);

            if (amount == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("해당 비용 정산 내역을 찾을 수 없습니다.");
            }

            return ResponseEntity.ok(amount);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("비용 상세 조회 중 오류가 발생했습니다.");
        }
    }

    // =========================================================
    // 비용 수정
    // =========================================================

    @PutMapping("/{amountNo}")
    public ResponseEntity<?> updateAmount(
            @PathVariable("amountNo") int amountNo,
            @ModelAttribute Amount amount,
            @RequestParam(value = "file", required = false)
            MultipartFile[] files) {

        try {

            amount.setAmountNo(amountNo);

            amountService.updateAmount(
                    amount,
                    files == null
                            ? List.of()
                            : List.of(files)
            );

            return ResponseEntity.ok(
                    "비용 신청이 수정되었습니다."
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());

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
            @PathVariable("amountNo") int amountNo) {

        try {

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