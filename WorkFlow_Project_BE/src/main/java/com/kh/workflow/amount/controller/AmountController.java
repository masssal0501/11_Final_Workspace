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
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class AmountController {

    private final AmountService amountService;

    public AmountController(AmountService amountService) {
        this.amountService = amountService;
    }


    /**
     * ============================================================
     * 비용 정산 전체 목록 조회 + 페이징
     *
     * GET /api/v1/amounts?page=1
     * ============================================================
     */
    @GetMapping
    public ResponseEntity<?> getAmountList(
            @RequestParam(value = "page", defaultValue = "1") int page) {

        try {

            // 한 페이지에 보여줄 게시글 수
            int boardLimit = 10;

            // 하단에 보여줄 페이지 버튼 수
            int pageLimit = 5;

            // 잘못된 페이지 방지
            if (page < 1) {
                page = 1;
            }

            // 전체 비용 신청 개수
            int listCount =
                    amountService.getAmountListCount();

            // PageInfo 생성
            PageInfo pi = new PageInfo(
                    listCount,
                    page,
                    pageLimit,
                    boardLimit
            );

            // 현재 페이지 목록 조회
            List<Amount> list =
                    amountService.selectAmountList(pi);

            // React로 전달할 데이터
            Map<String, Object> result =
                    new HashMap<>();

            result.put("list", list);

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

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                        "비용 목록 조회 실패: "
                        + e.getMessage()
                    );
        }
    }


    /**
     * ============================================================
     * 비용 정산 신청
     *
     * POST /api/v1/amounts
     * ============================================================
     */
    @PostMapping
    public ResponseEntity<?> createAmount(
            @ModelAttribute Amount amount,
            @RequestParam(
                value = "file",
                required = false
            )
            MultipartFile file) {

        try {

            // 첨부파일 처리
            if (file != null && !file.isEmpty()) {

                String uploadDir =
                        "C:/upload/receipts/";

                File dir =
                        new File(uploadDir);

                if (!dir.exists()) {
                    dir.mkdirs();
                }

                String originalFilename =
                        file.getOriginalFilename();

                String savedFilename =
                        UUID.randomUUID()
                        + "_"
                        + originalFilename;

                file.transferTo(
                    new File(
                        uploadDir
                        + savedFilename
                    )
                );


                // 파일 VO 생성
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


                List<Amount.File> fileList =
                        new ArrayList<>();

                fileList.add(fileVo);

                amount.setFileList(fileList);
            }


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


    /**
     * ============================================================
     * 비용 단건 상세 조회
     *
     * GET /api/v1/amounts/{amountNo}
     * ============================================================
     */
    @GetMapping("/{amountNo}")
    public ResponseEntity<?> getAmountById(
            @PathVariable("amountNo") int amountNo) {

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


    /**
     * ============================================================
     * 특정 워케이션의 비용 신청 목록 + 페이징
     *
     * GET /api/v1/amounts/workcation/{workcationNo}?page=1
     * ============================================================
     */
    @GetMapping("/workcation/{workcationNo}")
    public ResponseEntity<?> getAmountListByWorkcation(
            @PathVariable("workcationNo") int workcationNo,
            @RequestParam(
                value = "page",
                defaultValue = "1"
            )
            int page) {

        try {

            // 페이지당 게시글 수
            int boardLimit = 10;

            // 페이지 버튼 수
            int pageLimit = 5;

            if (page < 1) {
                page = 1;
            }


            // 해당 워케이션 전체 개수
            int listCount =
                    amountService
                    .getAmountCountByWorkcationNo(
                        workcationNo
                    );


            // PageInfo 생성
            PageInfo pi =
                    new PageInfo(
                        listCount,
                        page,
                        pageLimit,
                        boardLimit
                    );


            // 현재 페이지 목록
            List<Amount> list =
                    amountService
                    .selectAmountListByWorkcationNo(
                        workcationNo,
                        pi
                    );


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


    /**
     * ============================================================
     * 비용 정산 신청 수정
     *
     * PUT /api/v1/amounts/{amountNo}
     * ============================================================
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

            amount.setAmountNo(amountNo);


            List<MultipartFile> fileList =
                    new ArrayList<>();


            if (files != null) {

                for (MultipartFile file : files) {

                    if (
                        file != null
                        && !file.isEmpty()
                    ) {

                        fileList.add(file);
                    }
                }
            }


            amountService.updateAmount(
                    amount,
                    fileList
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


    /**
     * ============================================================
     * 비용 신청 취소
     *
     * PATCH /api/v1/amounts/{amountNo}/cancel
     * ============================================================
     */
    @PatchMapping("/{amountNo}/cancel")
    public ResponseEntity<?> cancelAmount(
            @PathVariable("amountNo") int amountNo) {

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
                    .body("취소 실패");

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
                        "취소 중 오류 발생"
                    );
        }
    }


    /**
     * ============================================================
     * 비용 결재 상태 변경
     *
     * PATCH /api/v1/amounts/{amountNo}/approval
     * ============================================================
     */
    @PatchMapping("/{amountNo}/approval")
    public ResponseEntity<Void> updateApproval(
            @PathVariable("amountNo") int amountNo,
            @RequestParam("status") String status,
            @RequestParam("approvedAmount") int approvedAmount,
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


        return ResponseEntity
                .ok()
                .build();
    }


    /**
     * ============================================================
     * 통계 데이터
     *
     * GET /api/v1/amounts/statistics
     * ============================================================
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {

        try {

            Map<String, Object> statisticsData =
                    amountService.getFullStatistics();

            return ResponseEntity.ok(
                    statisticsData
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }

}