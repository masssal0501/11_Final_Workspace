package com.kh.workflow.amount.controller;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.amount.service.AmountService;
import com.kh.workflow.amount.vo.Amount;

@RestController
@RequestMapping("/api/v1/amounts")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class AmountController {

    private final AmountService amountService;

    public AmountController(AmountService amountService) {
        this.amountService = amountService;
    }

    /**
     * 비용 정산 신청 (FormData + 파일 첨부 처리)
     * POST /api/v1/amounts
     */
    @PostMapping
    public ResponseEntity<?> createAmount(
            @ModelAttribute Amount amount,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            // 1. 첨부파일이 존재하는 경우 디스크 저장 및 Amount.File 객체 세팅
            if (file != null && !file.isEmpty()) {
                String uploadDir = "C:/upload/receipts/"; // 파일이 저장될 물리 경로
                File dir = new File(uploadDir);
                if (!dir.exists()) {
                    dir.mkdirs();
                }

                String originalFilename = file.getOriginalFilename();
                String savedFilename = UUID.randomUUID().toString() + "_" + originalFilename;

                // 서버 디스크에 파일 저장
                file.transferTo(new File(uploadDir + savedFilename));

                // 2. Amount.File 객체 생성 및 필드값 세팅
                // (※ 사용 중이신 Amount.File VO의 Setter 메서드명으로 맞추어 작성해주세요)
                Amount.File fileVo = new Amount.File();
                fileVo.setOriginName(originalFilename); 
                fileVo.setChangeName(savedFilename);
                fileVo.setFilePath("/upload/receipts/" + savedFilename);

                List<Amount.File> fileList = new ArrayList<>();
                fileList.add(fileVo);

                // amount 객체 내 fileList에 저장 -> ServiceImpl에서 amount.getFileList()로 DB 저장함
                amount.setFileList(fileList);
            }

            // 3. 기존 Service 메서드 호출 (인자 1개)
            amountService.insertAmount(amount);

            return ResponseEntity.status(HttpStatus.CREATED).body(amount);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("비용 신청 실패: " + e.getMessage());
        }
    }

    /**
     * 비용 단건 상세 조회
     * GET /api/v1/amounts/{amountNo}
     */
    @GetMapping("/{amountNo}")
    public ResponseEntity<?> getAmountById(@PathVariable("amountNo") int amountNo) {
        Amount amount = amountService.selectAmountById(amountNo);
        if (amount == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 비용 정산 내역을 찾을 수 없습니다.");
        }
        return ResponseEntity.ok(amount);
    }

    /**
     * 특정 워케이션의 비용 신청 목록 조회
     * GET /api/v1/amounts/workcation/{workcationNo}
     */
    @GetMapping("/workcation/{workcationNo}")
    public ResponseEntity<List<Amount>> getAmountListByWorkcation(@PathVariable("workcationNo") int workcationNo) {
        List<Amount> list = amountService.selectAmountListByWorkcationNo(workcationNo);
        return ResponseEntity.ok(list);
    }

    /**
     * 비용 결재 상태 변경 (승인 / 반려 / 보류)
     * PATCH /api/v1/amounts/{amountNo}/approval?status=A&approvedAmount=10000&comment=ddd
     */
   

    
    /**
     * 비용 정산 신청 수정 (FormData + 파일 첨부 처리)
     * PUT /api/v1/amounts/{amountNo}
     */
    @PutMapping("/{amountNo}")
    public ResponseEntity<?> updateAmount(
            @PathVariable("amountNo") int amountNo,
            @ModelAttribute Amount amount,

            @RequestParam(
                value = "file",
                required = false
            )
            MultipartFile[] files) {

        try {

            // amountNo 설정
            amount.setAmountNo(amountNo);

            // MultipartFile[] → List<MultipartFile>
            List<MultipartFile> fileList = new ArrayList<>();

            if (files != null) {

                for (MultipartFile file : files) {

                    if (file != null && !file.isEmpty()) {
                        fileList.add(file);
                    }
                }
            }

            // 서비스 호출
            amountService.updateAmount(
                amount,
                fileList
            );

            return ResponseEntity.ok(
                "비용 신청이 수정되었습니다."
            );

        } catch (IllegalArgumentException e) {

            // 잘못된 요청
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());

        } catch (Exception e) {

            // 서버 오류
            e.printStackTrace();

            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                    "수정 중 오류 발생: "
                    + e.getMessage()
                );
        }
    }

    /**
     * 비용 정산 신청 취소
     * PATCH /api/v1/amounts/{amountNo}/cancel
     */
    @PatchMapping("/{amountNo}/cancel")
    public ResponseEntity<?> cancelAmount(@PathVariable("amountNo") int amountNo) {
        try {
            int result = amountService.cancelAmount(amountNo);
            if (result > 0) {
                return ResponseEntity.ok("비용 신청이 취소되었습니다.");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("취소 실패");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("취소 중 오류 발생");
        }
    }
    
    @PatchMapping("/{amountNo}/approval")
    public ResponseEntity<Void> updateApproval(
            @PathVariable("amountNo") int amountNo,
            @RequestParam("status") String status,
            @RequestParam("approvedAmount") int approvedAmount,
            @RequestParam(value = "comment", required = false) String comment,
            @RequestParam(value = "sponsorName", required = false) String sponsorName,
            @RequestParam(value = "sponsorAmount", defaultValue = "0") int sponsorAmount,
            @RequestParam(value = "sponsorStatus", required = false) String sponsorStatus,
            @RequestParam(value = "remark", required = false) String remark) {

        // 지원금 정보와 함께 승인 처리 서비스 호출
        amountService.updateApprovalWithSponsor(
            amountNo, status, approvedAmount, comment, 
            sponsorName, sponsorAmount, sponsorStatus, remark
        );

        return ResponseEntity.ok().build();
    }
    
    
 // 📌 [신규 추가] 통계 데이터 조회 API
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        try {
            Map<String, Object> statisticsData = amountService.getFullStatistics();
            return ResponseEntity.ok(statisticsData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}