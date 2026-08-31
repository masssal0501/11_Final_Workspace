package com.kh.workflow.amount.controller;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
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
import com.kh.workflow.common.model.vo.PageInfo;

@RestController
@RequestMapping("/api/v1/amounts")
@CrossOrigin(
    originPatterns = "*",
    allowCredentials = "true"
)
public class AmountController {

    private final AmountService amountService;

    public AmountController(AmountService amountService) {
        this.amountService = amountService;
    }


    // ============================================================
    // 1. 전체 비용 신청 목록 + 페이징
    //
    // GET /api/v1/amounts?page=1
    // ============================================================
    @GetMapping
    public ResponseEntity<?> getAmountList(
            @RequestParam(
                value = "page",
                defaultValue = "1"
            )
            int page) {

        try {

            int boardLimit = 10;
            int pageLimit = 5;

            if (page < 1) {
                page = 1;
            }

            int listCount =
                    amountService.getAmountListCount();

            PageInfo pi =
                    new PageInfo(
                        listCount,
                        page,
                        pageLimit,
                        boardLimit
                    );

            List<Amount> list =
                    amountService.selectAmountList(pi);

            Map<String, Object> result =
                    createPagingResult(
                        list,
                        pi
                    );

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                        "비용 목록 조회 실패: "
                        + e.getMessage()
                    );
        }
    }


    // ============================================================
    // 2. 비용 정산 신청
    //
    // POST /api/v1/amounts
    //
    // multipart/form-data
    // ============================================================
    @PostMapping
    public ResponseEntity<?> createAmount(
            @ModelAttribute Amount amount,
            @RequestParam(
                value = "file",
                required = false
            )
            MultipartFile[] files) {

        try {

            /*
             * ----------------------------------------------------
             * amount 기본값
             * ----------------------------------------------------
             */

            if (amount.getStatus() == null) {
                amount.setStatus("R");
            }

            /*
             * ----------------------------------------------------
             * 첨부파일 처리
             *
             * Amount.File
             *   ├─ filePath
             *   ├─ originName
             *   ├─ changeName
             *   ├─ status
             *   └─ amountNo
             * ----------------------------------------------------
             */

            List<Amount.File> amountFileList =
                    new ArrayList<>();

            if (files != null) {

                String uploadDir =
                        "C:/upload/receipts/";

                File dir =
                        new File(uploadDir);

                if (!dir.exists()) {
                    dir.mkdirs();
                }

                for (MultipartFile file : files) {

                    if (
                        file == null
                        || file.isEmpty()
                    ) {
                        continue;
                    }

                    String originalFilename =
                            file.getOriginalFilename();

                    if (
                        originalFilename == null
                        || originalFilename.isBlank()
                    ) {
                        continue;
                    }

                    String savedFilename =
                            UUID.randomUUID()
                            + "_"
                            + originalFilename;

                    File savedFile =
                            new File(
                                uploadDir
                                + savedFilename
                            );

                    file.transferTo(savedFile);

                    Amount.File fileVo =
                            new Amount.File();

                    fileVo.setOriginName(
                            originalFilename
                    );

                    fileVo.setChangeName(
                            savedFilename
                    );

                    fileVo.setFilePath(
                            "/upload/receipts/"
                            + savedFilename
                    );

                    /*
                     * Y = 사용
                     */
                    fileVo.setStatus("Y");

                    amountFileList.add(fileVo);
                }
            }

            amount.setFileList(
                    amountFileList
            );


            /*
             * ----------------------------------------------------
             * Service에서
             *
             * 1. amount INSERT
             * 2. amount_item INSERT
             * 3. amount_list INSERT
             * 4. amount_file INSERT
             *
             * 처리
             * ----------------------------------------------------
             */
            amountService.insertAmount(amount);


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(amount);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                        "비용 신청 실패: "
                        + e.getMessage()
                    );
        }
    }


    // ============================================================
    // 3. 비용 상세 조회
    //
    // GET /api/v1/amounts/{amountNo}
    // ============================================================
    @GetMapping("/{amountNo}")
    public ResponseEntity<?> getAmountById(
            @PathVariable("amountNo")
            int amountNo) {

        try {

            Amount amount =
                    amountService.selectAmountById(
                        amountNo
                    );

            if (amount == null) {

                return ResponseEntity
                        .status(
                            HttpStatus.NOT_FOUND
                        )
                        .body(
                            "해당 비용 정산 내역을 찾을 수 없습니다."
                        );
            }

            return ResponseEntity.ok(amount);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                        "상세 조회 실패: "
                        + e.getMessage()
                    );
        }
    }


    // ============================================================
    // 4. 워케이션별 비용 신청 목록 + 페이징
    //
    // GET
    // /api/v1/amounts/workcation/{workcationNo}?page=1
    // ============================================================
    @GetMapping("/workcation/{workcationNo}")
    public ResponseEntity<?> getAmountListByWorkcation(
            @PathVariable("workcationNo")
            int workcationNo,

            @RequestParam(
                value = "page",
                defaultValue = "1"
            )
            int page) {

        try {

            int boardLimit = 10;
            int pageLimit = 5;

            if (page < 1) {
                page = 1;
            }

            int listCount =
                    amountService
                    .getAmountCountByWorkcationNo(
                        workcationNo
                    );

            PageInfo pi =
                    new PageInfo(
                        listCount,
                        page,
                        pageLimit,
                        boardLimit
                    );

            List<Amount> list =
                    amountService
                    .selectAmountListByWorkcationNo(
                        workcationNo,
                        pi
                    );

            Map<String, Object> result =
                    createPagingResult(
                        list,
                        pi
                    );

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                        "비용 목록 조회 실패: "
                        + e.getMessage()
                    );
        }
    }


    // ============================================================
    // 5. 비용 신청 수정
    //
    // PUT /api/v1/amounts/{amountNo}
    //
    // multipart/form-data
    // ============================================================
    @PutMapping("/{amountNo}")
    public ResponseEntity<?> updateAmount(
            @PathVariable("amountNo")
            int amountNo,

            @ModelAttribute Amount amount,

            @RequestParam(
                value = "file",
                required = false
            )
            MultipartFile[] files) {

        try {

            amount.setAmountNo(amountNo);

            /*
             * 새로운 첨부파일만 Service에 전달
             */
            List<MultipartFile> uploadFiles =
                    new ArrayList<>();

            if (files != null) {

                for (MultipartFile file : files) {

                    if (
                        file != null
                        && !file.isEmpty()
                    ) {
                        uploadFiles.add(file);
                    }
                }
            }

            amountService.updateAmount(
                    amount,
                    uploadFiles
            );

            return ResponseEntity.ok(
                "비용 신청이 수정되었습니다."
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(
                        HttpStatus.BAD_REQUEST
                    )
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                        "수정 중 오류 발생: "
                        + e.getMessage()
                    );
        }
    }


    // ============================================================
    // 6. 비용 신청 취소
    //
    // PATCH /api/v1/amounts/{amountNo}/cancel
    // ============================================================
    @PatchMapping("/{amountNo}/cancel")
    public ResponseEntity<?> cancelAmount(
            @PathVariable("amountNo")
            int amountNo) {

        try {

            int result =
                    amountService.cancelAmount(
                        amountNo
                    );

            if (result > 0) {

                return ResponseEntity.ok(
                    "비용 신청이 취소되었습니다."
                );
            }

            return ResponseEntity
                    .status(
                        HttpStatus.BAD_REQUEST
                    )
                    .body(
                        "취소할 수 없는 비용 신청입니다."
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(
                        HttpStatus.BAD_REQUEST
                    )
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                        "취소 중 오류 발생: "
                        + e.getMessage()
                    );
        }
    }


    // ============================================================
    // 7. 비용 결재 상태 변경
    //
    // PATCH
    // /api/v1/amounts/{amountNo}/approval
    //
    // amount
    // └─ amount_no
    //
    // amount_list
    // └─ amount_no
    //
    // 현재 DB 구조상 지원금은 1건
    // ============================================================
    @PatchMapping("/{amountNo}/approval")
    public ResponseEntity<?> updateApproval(

            @PathVariable("amountNo")
            int amountNo,

            @RequestParam("status")
            String status,

            @RequestParam(
                value = "approvedAmount",
                defaultValue = "0"
            )
            int approvedAmount,

            @RequestParam(
                value = "comment",
                required = false
            )
            String comment,

            @RequestParam(
                value = "sponsorName",
                required = false
            )
            String sponsorName,

            @RequestParam(
                value = "sponsorAmount",
                defaultValue = "0"
            )
            int sponsorAmount,

            @RequestParam(
                value = "sponsorStatus",
                required = false
            )
            String sponsorStatus,

            @RequestParam(
                value = "remark",
                required = false
            )
            String remark) {

        try {

            /*
             * 상태값 검증
             */
            if (
                status == null
                || !isValidAmountStatus(status)
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                            "잘못된 비용 결재 상태입니다."
                        );
            }


            /*
             * 승인(A)이 아닌 경우
             * 승인금액이 음수가 되지 않도록 처리
             */
            if (approvedAmount < 0) {
                approvedAmount = 0;
            }


            /*
             * 지원금 금액 검증
             */
            if (sponsorAmount < 0) {
                sponsorAmount = 0;
            }


            amountService.updateApprovalWithSponsor(
                amountNo,
                status,
                approvedAmount,
                comment,
                sponsorName,
                sponsorAmount,
                sponsorStatus,
                remark
            );


            return ResponseEntity.ok(
                "결재 상태가 변경되었습니다."
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                        "결재 처리 중 오류 발생: "
                        + e.getMessage()
                    );
        }
    }


    // ============================================================
    // 8. 통계
    //
    // GET /api/v1/amounts/statistics
    // ============================================================
    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {

        try {

            Map<String, Object> statisticsData =
                    amountService.getFullStatistics();

            return ResponseEntity.ok(
                    statisticsData
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                        "통계 조회 실패: "
                        + e.getMessage()
                    );
        }
    }


    // ============================================================
    // 9. 페이징 응답 생성
    //
    // 전체 목록 / 워케이션별 목록 공통
    // ============================================================
    private Map<String, Object> createPagingResult(
            List<Amount> list,
            PageInfo pi) {

        Map<String, Object> result =
                new HashMap<>();

        result.put(
                "list",
                list
        );

        result.put(
                "page",
                pi.getCurrentPage()
        );

        result.put(
                "pageLimit",
                pi.getPageLimit()
        );

        result.put(
                "boardLimit",
                pi.getBoardLimit()
        );

        result.put(
                "limit",
                pi.getBoardLimit()
        );

        result.put(
                "listCount",
                pi.getListCount()
        );

        result.put(
                "maxPage",
                pi.getMaxPage()
        );

        result.put(
                "startPage",
                pi.getStartPage()
        );

        result.put(
                "endPage",
                pi.getEndPage()
        );

        return result;
    }


    // ============================================================
    // 10. Amount 상태값 검증
    //
    // A = 승인
    // C = 취소
    // H = 보류
    // J = 반려
    // R = 검토
    // ============================================================
    private boolean isValidAmountStatus(
            String status) {

        return
            "A".equals(status)
            || "C".equals(status)
            || "H".equals(status)
            || "J".equals(status)
            || "R".equals(status);
    }

}

