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

    // =========================================================
    // 파일 설정
    // =========================================================

    private static final long MAX_FILE_SIZE =
            10L * 1024L * 1024L;

    private static final List<String> ALLOWED_EXTENSIONS =
            List.of(
                    "jpg",
                    "jpeg",
                    "png",
                    "gif",
                    "webp"
            );

    private static final List<String> ALLOWED_CONTENT_TYPES =
            List.of(
                    "image/jpeg",
                    "image/png",
                    "image/gif",
                    "image/webp"
            );

    private static final String UPLOAD_DIR =
            "C:/upload/receipts/";

    private static final String FILE_PATH =
            "/upload/receipts/";


    public AmountController(AmountService amountService) {
        this.amountService = amountService;
    }


    // =========================================================
    // 1. 전체 비용 신청 목록
    //
    // GET /api/v1/amounts?page=1
    // =========================================================

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

            return ResponseEntity.ok(
                    createPagingResult(list, pi)
            );

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


    // =========================================================
    // 2. 비용 신청 등록
    //
    // POST /api/v1/amounts
    //
    // multipart/form-data
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createAmount(
            @ModelAttribute Amount amount,

            @RequestParam(
                    value = "file",
                    required = false
            )
            MultipartFile[] files) {

        List<String> savedFiles =
                new ArrayList<>();

        try {

            // -------------------------------------------------
            // 기본 상태
            // -------------------------------------------------

            if (amount.getStatus() == null
                    || amount.getStatus().isBlank()) {

                amount.setStatus("R");
            }


            // -------------------------------------------------
            // 파일 처리
            // -------------------------------------------------

            List<Amount.File> fileList =
                    new ArrayList<>();

            if (files != null) {

                for (MultipartFile file : files) {

                    if (file == null
                            || file.isEmpty()) {

                        continue;
                    }

                    validateFile(file);

                    String originalFilename =
                            file.getOriginalFilename();

                    originalFilename =
                            new File(
                                    originalFilename
                            ).getName();

                    String changeName =
                            UUID.randomUUID()
                            + "_"
                            + originalFilename;

                    File uploadDir =
                            new File(UPLOAD_DIR);

                    if (!uploadDir.exists()) {

                        if (!uploadDir.mkdirs()
                                && !uploadDir.exists()) {

                            throw new IllegalArgumentException(
                                    "파일 저장 폴더를 생성할 수 없습니다."
                            );
                        }
                    }

                    File destination =
                            new File(
                                    uploadDir,
                                    changeName
                            );

                    file.transferTo(destination);

                    savedFiles.add(
                            destination.getAbsolutePath()
                    );

                    Amount.File fileVo =
                            new Amount.File();

                    fileVo.setOriginName(
                            originalFilename
                    );

                    fileVo.setChangeName(
                            changeName
                    );

                    fileVo.setFilePath(
                            FILE_PATH + changeName
                    );

                    fileVo.setStatus("Y");

                    fileList.add(fileVo);
                }
            }

            amount.setFileList(fileList);


            // -------------------------------------------------
            // Service
            // -------------------------------------------------

            amountService.insertAmount(amount);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(amount);

        } catch (IllegalArgumentException e) {

            deleteSavedFiles(savedFiles);

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            deleteSavedFiles(savedFiles);

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


    // =========================================================
    // 3. 비용 상세 조회
    //
    // GET /api/v1/amounts/{amountNo}
    // =========================================================

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
                        .status(HttpStatus.NOT_FOUND)
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


    // =========================================================
    // 4. 워케이션별 비용 신청 목록
    //
    // GET /api/v1/amounts/workcation/{workcationNo}?page=1
    // =========================================================

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

            return ResponseEntity.ok(
                    createPagingResult(list, pi)
            );

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


    // =========================================================
    // 5. 비용 신청 수정
    //
    // PUT /api/v1/amounts/{amountNo}
    // =========================================================

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

            List<MultipartFile> uploadFiles =
                    validateFiles(files);

            amountService.updateAmount(
                    amount,
                    uploadFiles
            );

            return ResponseEntity.ok(
                    "비용 신청이 수정되었습니다."
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
                            "수정 중 오류 발생: "
                            + e.getMessage()
                    );
        }
    }


    // =========================================================
    // 6. 비용 신청 취소
    //
    // PATCH /api/v1/amounts/{amountNo}/cancel
    // =========================================================

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
                    .badRequest()
                    .body(
                            "취소할 수 없는 비용 신청입니다."
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
                            "취소 중 오류가 발생했습니다: "
                            + e.getMessage()
                    );
        }
    }


    // =========================================================
    // 7. 비용 결재 상태 변경
    //
    // PATCH /api/v1/amounts/{amountNo}/approval
    //
    // Service와 동일한 파라미터 구조
    // =========================================================

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
            String comment) {

        try {

            if (!isValidApprovalStatus(status)) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "잘못된 비용 결재 상태입니다."
                        );
            }

            if (approvedAmount < 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "승인 금액은 0원 이상이어야 합니다."
                        );
            }

            int result =
                    amountService.updateApprovalStatus(
                            amountNo,
                            status,
                            approvedAmount,
                            comment
                    );

            if (result <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "결재 상태 변경에 실패했습니다."
                        );
            }

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


    // =========================================================
    // 8. 결재 + 지원금
    //
    // PATCH /api/v1/amounts/{amountNo}/approval/sponsor
    //
    // VO
    // Amount
    // └─ sponsor : Sponsor
    // =========================================================

    @PatchMapping("/{amountNo}/approval/sponsor")
    public ResponseEntity<?> updateApprovalWithSponsor(
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
            String remark,

            @RequestParam(
                    value = "paymentDate",
                    required = false
            )
            String paymentDate,

            @RequestParam(
                    value = "itemNo",
                    required = false
            )
            Integer itemNo) {

        try {

            if (!isValidApprovalStatus(status)) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "잘못된 비용 결재 상태입니다."
                        );
            }

            if (approvedAmount < 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "승인 금액은 0원 이상이어야 합니다."
                        );
            }

            if (sponsorAmount < 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "지원금은 0원 이상이어야 합니다."
                        );
            }

            Amount.Sponsor sponsor =
                    new Amount.Sponsor();

            sponsor.setAmountNo(amountNo);
            sponsor.setSponsorName(sponsorName);
            sponsor.setAmount(sponsorAmount);
            sponsor.setStatus(
                    sponsorStatus == null
                            || sponsorStatus.isBlank()
                            ? "UNPAID"
                            : sponsorStatus
            );
            sponsor.setRemark(remark);
            sponsor.setItemNo(itemNo);

            /*
             * paymentDate가 필요하면
             * 실제 날짜 형식에 맞춰 변환하여 설정
             *
             * 현재 Controller에서는 String으로 받았으므로
             * 변환 로직을 추가하지 않고 null 처리
             */

            amountService.updateApprovalWithSponsor(
                    amountNo,
                    status,
                    approvedAmount,
                    comment,
                    sponsor
            );

            return ResponseEntity.ok(
                    "결재 및 지원금 처리가 완료되었습니다."
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
                            "결재 및 지원금 처리 중 오류 발생: "
                            + e.getMessage()
                    );
        }
    }


    // =========================================================
    // 9. 통계
    //
    // GET /api/v1/amounts/statistics
    // =========================================================

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


    // =========================================================
    // 10. 첨부파일 삭제
    //
    // DELETE API가 아니라 기존 PATCH/POST 구조에 맞춰
    // 별도 호출 가능
    // =========================================================

    @PatchMapping("/file/{amountattachmentNo}/delete")
    public ResponseEntity<?> deleteFile(
            @PathVariable("amountattachmentNo")
            int amountattachmentNo) {

        try {

            int result =
                    amountService.deleteFile(
                            amountattachmentNo
                    );

            if (result <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "파일 삭제에 실패했습니다."
                        );
            }

            return ResponseEntity.ok(
                    "파일이 삭제되었습니다."
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
                            "파일 삭제 중 오류 발생: "
                            + e.getMessage()
                    );
        }
    }


    // =========================================================
    // 11. 파일 검증
    // =========================================================

    private void validateFile(
            MultipartFile file) {

        if (file.getSize() > MAX_FILE_SIZE) {

            throw new IllegalArgumentException(
                    "파일 하나당 최대 10MB까지 업로드할 수 있습니다."
            );
        }

        String contentType =
                file.getContentType();

        if (contentType == null
                || !ALLOWED_CONTENT_TYPES.contains(
                        contentType.toLowerCase()
                )) {

            throw new IllegalArgumentException(
                    "jpg, jpeg, png, gif, webp 이미지만 업로드할 수 있습니다."
            );
        }

        String originalFilename =
                file.getOriginalFilename();

        if (originalFilename == null
                || originalFilename.isBlank()) {

            throw new IllegalArgumentException(
                    "파일명이 올바르지 않습니다."
            );
        }

        String extension =
                getExtension(originalFilename);

        if (extension == null
                || !ALLOWED_EXTENSIONS.contains(
                        extension.toLowerCase()
                )) {

            throw new IllegalArgumentException(
                    "jpg, jpeg, png, gif, webp 이미지만 업로드할 수 있습니다."
            );
        }
    }


    // =========================================================
    // 12. 파일 목록 검증
    // =========================================================

    private List<MultipartFile> validateFiles(
            MultipartFile[] files) {

        List<MultipartFile> result =
                new ArrayList<>();

        if (files == null) {
            return result;
        }

        for (MultipartFile file : files) {

            if (file == null
                    || file.isEmpty()) {

                continue;
            }

            validateFile(file);

            result.add(file);
        }

        return result;
    }


    // =========================================================
    // 13. 페이징 응답
    // =========================================================

    private Map<String, Object> createPagingResult(
            List<Amount> list,
            PageInfo pi) {

        Map<String, Object> result =
                new HashMap<>();

        result.put("list", list);
        result.put("page", pi.getCurrentPage());
        result.put("pageLimit", pi.getPageLimit());
        result.put("boardLimit", pi.getBoardLimit());
        result.put("limit", pi.getBoardLimit());
        result.put("listCount", pi.getListCount());
        result.put("maxPage", pi.getMaxPage());
        result.put("startPage", pi.getStartPage());
        result.put("endPage", pi.getEndPage());

        return result;
    }


    // =========================================================
    // 14. 결재 상태
    // =========================================================

    private boolean isValidApprovalStatus(
            String status) {

        return "A".equals(status)
                || "H".equals(status)
                || "J".equals(status);
    }


    // =========================================================
    // 15. 확장자 추출
    // =========================================================

    private String getExtension(
            String filename) {

        if (filename == null
                || filename.isBlank()) {

            return null;
        }

        int index =
                filename.lastIndexOf(".");

        if (index < 0
                || index == filename.length() - 1) {

            return null;
        }

        return filename
                .substring(index + 1)
                .toLowerCase();
    }


    // =========================================================
    // 16. 저장 실패 파일 삭제
    // =========================================================

    private void deleteSavedFiles(
            List<String> savedFiles) {

        if (savedFiles == null
                || savedFiles.isEmpty()) {

            return;
        }

        for (String path : savedFiles) {

            if (path == null
                    || path.isBlank()) {

                continue;
            }

            try {

                File file =
                        new File(path);

                if (file.exists()) {
                    file.delete();
                }

            } catch (Exception ignored) {
                // 정리 실패는 무시
            }
        }
    }
}

