package com.kh.workflow.amount.controller;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
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

import com.kh.workflow.amount.model.service.AmountService;
import com.kh.workflow.amount.model.vo.Amount;
import com.kh.workflow.amount.model.vo.AmountFile;
import com.kh.workflow.amount.model.vo.SupportList;
import com.kh.workflow.employee.model.dao.EmployeeDao;
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.workcation.model.dao.WorkcationDao;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

// CORS는 SecurityConfig에서 app.cors.allowed-origins 기준으로 중앙 관리한다
// (기존 originPatterns="*" + allowCredentials="true" 조합은 사실상 모든 origin을
//  자격증명 포함으로 허용하는 것과 같아 production 배포 기준에 맞지 않아 제거함)
@RestController
@RequestMapping("/api/v1/amounts")
@Tag(
        name = "비용/정산 관리",
        description = "워케이션 참여에 따른 비용(정산) 신청 등록/조회/수정/취소, 결재 및 지원금 처리, 첨부파일 관리를 담당하는 API"
)
public class AmountController {

    private final AmountService amountService;
    private final EmployeeDao employeeDao;
    private final WorkcationDao workcationDao;


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

    // 운영 환경에서는 APP_UPLOAD_RECEIPTS_DIR 환경변수로 실제 저장 경로를 지정한다.
    // (기본값은 로컬 개발용 Windows 경로 - 기존 동작 유지)
    @Value("${app.upload.receipts-dir:C:/upload/receipts/}")
    private String UPLOAD_DIR;

    private static final String FILE_PATH =
            "/upload/receipts/";


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


    // =========================================================
    // 1. 전체 비용 신청 목록
    //
    // GET /api/v1/amounts?page=1
    // =========================================================

    @Operation(
            summary = "비용 신청 목록 조회",
            description = "전체 비용 신청 내역을 등록일 최신순으로 페이지 단위로 조회합니다. "
                    + "프론트엔드에서 1부터 시작하는 page 값을 전달하면 내부적으로 0부터 시작하는 "
                    + "Spring Data Pageable로 변환하여 조회하며, 1 미만의 값이 전달되면 1로 보정합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "비용 신청 목록 조회 성공"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "비용 목록 조회 중 서버 오류 발생"
            )
    })
    @SecurityRequirement(name = "JWT")
    @GetMapping
    public ResponseEntity<?> getAmountList(

            @Parameter(
                    description = "조회할 페이지 번호(1부터 시작, 1 미만이면 1로 보정됨)",
                    example = "1"
            )
            @RequestParam(
                    value = "page",
                    defaultValue = "1"
            )
            int page) {

        try {

            if (page < 1) {
                page = 1;
            }

            int boardLimit = 10;

            /*
             * JPA Pageable은 0부터 시작하므로
             * React에서 받는 page(1부터 시작)를
             * -1 해서 전달한다.
             */
            Pageable pageable =
                    PageRequest.of(
                            page - 1,
                            boardLimit
                    );

            Page<Amount> amountPage =
                    amountService.selectAmountList(
                            pageable
                    );

            return ResponseEntity.ok(
                    createPagingResult(amountPage)
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
    // 2. 비용 신청 등록
    //
    // POST /api/v1/amounts
    //
    // multipart/form-data
    // =========================================================

    @Operation(
            summary = "비용 신청 등록",
            description = "워케이션 참여자가 사용한 비용을 신청 등록합니다. multipart/form-data 형식으로 "
                    + "비용 정보와 함께 증빙 이미지 파일(jpg, jpeg, png, gif, webp, 파일당 최대 10MB)을 "
                    + "첨부할 수 있으며, 상태값을 지정하지 않으면 기본값 'R'(검토)로 등록되고 신청일/등록일도 "
                    + "자동으로 채워집니다. 파일 저장 후 DB 저장에 실패하면 이미 저장된 파일을 삭제합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "비용 신청 등록 성공",
                    content = @Content(
                            schema = @Schema(implementation = Amount.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "비용 신청 정보 누락, 첨부파일 형식/용량 오류 또는 등록 실패"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "비용 신청 처리 중 서버 오류 발생"
            )
    })
    @SecurityRequirement(name = "JWT")
    @PostMapping
    public ResponseEntity<?> createAmount(

            @Parameter(
                    description = "등록할 비용 신청 정보(신청 금액, 워케이션 번호, 비용 항목 등)"
            )
            @ModelAttribute Amount amount,

            @Parameter(
                    description = "증빙 첨부 파일 목록(jpg, jpeg, png, gif, webp, 파일당 최대 10MB)"
            )
            @RequestParam(
                    value = "file",
                    required = false
            )
            MultipartFile[] files) {

        List<String> savedFiles =
                new ArrayList<>();

        try {

            if (amount == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "비용 신청 정보가 없습니다."
                        );
            }


            // -------------------------------------------------
            // 기본 상태
            // -------------------------------------------------

            if (amount.getStatus() == null
                    || amount.getStatus().isBlank()) {

                amount.setStatus("R");
            }


            // -------------------------------------------------
            // 기본 일자
            // -------------------------------------------------

            if (amount.getRequestedAt() == null) {

                amount.setRequestedAt(
                        LocalDateTime.now()
                );
            }

            if (amount.getCreatedAt() == null) {

                amount.setCreatedAt(
                        LocalDateTime.now()
                );
            }


            // -------------------------------------------------
            // 파일 처리
            // -------------------------------------------------

            List<AmountFile> fileList =
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


                    // -------------------------------------------------
                    // AmountFile
                    // -------------------------------------------------

                    AmountFile fileVo =
                            new AmountFile();

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


            amount.setAmountFile(fileList);


            // -------------------------------------------------
            // Service
            // -------------------------------------------------

            int result =
                    amountService.insertAmount(
                            amount
                    );


            if (result <= 0) {

                deleteSavedFiles(savedFiles);

                return ResponseEntity
                        .badRequest()
                        .body(
                                "비용 신청 등록에 실패했습니다."
                        );
            }


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

    @Operation(
            summary = "비용 신청 상세 조회",
            description = "비용 신청 번호(amountNo)로 비용 항목, 지원금 내역, 첨부파일을 포함한 "
                    + "비용 신청 상세 정보를 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "비용 신청 상세 조회 성공",
                    content = @Content(
                            schema = @Schema(implementation = Amount.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 비용 신청 번호"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "해당 비용 정산 내역을 찾을 수 없음"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "상세 조회 중 서버 오류 발생"
            )
    })
    @SecurityRequirement(name = "JWT")
    @GetMapping("/{amountNo}")
    public ResponseEntity<?> getAmountById(

            @Parameter(
                    description = "조회할 비용 신청 번호",
                    example = "1001"
            )
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


            checkAmountAccess(amount, authentication);


            return ResponseEntity.ok(amount);


        } catch (AccessDeniedException e) {

            throw e;

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

    @Operation(
            summary = "워케이션별 비용 신청 목록 조회",
            description = "특정 워케이션(workcationNo)에 속한 비용 신청 내역을 등록일 최신순으로 "
                    + "페이지 단위로 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "워케이션별 비용 신청 목록 조회 성공"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 워케이션 번호"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "비용 목록 조회 중 서버 오류 발생"
            )
    })
    @SecurityRequirement(name = "JWT")
    @GetMapping("/workcation/{workcationNo}")
    public ResponseEntity<?> getAmountListByWorkcation(

            @Parameter(
                    description = "조회할 워케이션 번호",
                    example = "1"
            )
            @PathVariable("workcationNo")
            int workcationNo,

            @Parameter(
                    description = "조회할 페이지 번호(1부터 시작, 1 미만이면 1로 보정됨)",
                    example = "1"
            )
            @RequestParam(
                    value = "page",
                    defaultValue = "1"
            )
            int page,

            Authentication authentication) {

        try {

            if (workcationNo <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "잘못된 워케이션 번호입니다."
                        );
            }


            // BUG-N10: 소유권 검증 - amountNo가 아닌 workcationNo를 직접 받는
            // 경로라 amountNo 없이도 워케이션 소유자를 바로 확인할 수 있다.
            {
                Employee loginEmployee = employeeDao.findByEmpId(authentication.getName())
                        .orElseThrow(() -> new AccessDeniedException("로그인 사용자 정보를 찾을 수 없습니다."));

                if (!"ADMIN".equals(loginEmployee.getAuthCode())) {

                    WorkcationInfo workcation = workcationDao.findById(workcationNo).orElse(null);

                    boolean isOwner = workcation != null
                            && workcation.getEmployee() != null
                            && workcation.getEmployee().getEmpNo().equals(loginEmployee.getEmpNo());

                    if (!isOwner) {
                        throw new AccessDeniedException("본인이 신청한 워케이션의 정산만 조회할 수 있습니다.");
                    }
                }
            }


            if (page < 1) {
                page = 1;
            }


            int boardLimit = 10;


            Pageable pageable =
                    PageRequest.of(
                            page - 1,
                            boardLimit
                    );


            Page<Amount> amountPage =
                    amountService
                    .selectAmountListByWorkcationNo(
                            workcationNo,
                            pageable
                    );


            return ResponseEntity.ok(
                    createPagingResult(amountPage)
            );


        } catch (AccessDeniedException e) {

            throw e;

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

    @Operation(
            summary = "비용 신청 수정",
            description = "이미 등록된 비용 신청의 금액, 비용 항목, 지원금 내역을 수정하고 새 증빙 "
                    + "파일(jpg, jpeg, png, gif, webp, 파일당 최대 10MB)을 기존 파일에 추가로 첨부할 수 "
                    + "있습니다. 이미 승인(A)되었거나 취소(C)된 비용 신청은 수정할 수 없습니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "비용 신청 수정 성공"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 비용 신청 번호, 수정 정보 누락, 이미 승인/취소된 신청, "
                            + "또는 첨부파일 형식/용량 오류"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "수정할 비용 신청을 찾을 수 없음"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "수정 중 서버 오류 발생"
            )
    })
    @SecurityRequirement(name = "JWT")
    @PutMapping("/{amountNo}")
    public ResponseEntity<?> updateAmount(

            @Parameter(
                    description = "수정할 비용 신청 번호",
                    example = "1001"
            )
            @PathVariable("amountNo")
            int amountNo,

            @Parameter(
                    description = "수정할 비용 신청 정보"
            )
            @ModelAttribute Amount amount,

            @Parameter(
                    description = "새로 추가할 증빙 첨부 파일 목록(jpg, jpeg, png, gif, webp, 파일당 최대 10MB)"
            )
            @RequestParam(
                    value = "file",
                    required = false
            )
            MultipartFile[] files,

            Authentication authentication) {

        List<String> savedFiles =
                new ArrayList<>();

        try {

            if (amountNo <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "잘못된 비용 신청 번호입니다."
                        );
            }


            if (amount == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "수정할 비용 정보가 없습니다."
                        );
            }


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


            // -------------------------------------------------
            // 파일 검증
            // -------------------------------------------------

            List<MultipartFile> uploadFiles =
                    validateFiles(files);


            // -------------------------------------------------
            // Service
            // -------------------------------------------------

            amountService.updateAmount(
                    amount,
                    uploadFiles,
                    loginEmployee
            );


            return ResponseEntity.ok(
                    "비용 신청이 수정되었습니다."
            );


        } catch (IllegalArgumentException e) {

            deleteSavedFiles(savedFiles);

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());


        } catch (AccessDeniedException e) {

            // BUG-N03: ExceptionTranslationFilter가 AccessDeniedException을 403으로
            // 변환하도록 그대로 다시 던진다 (아래 catch(Exception)에서 500으로 감싸면 안 됨).
            deleteSavedFiles(savedFiles);
            throw e;


        } catch (Exception e) {

            deleteSavedFiles(savedFiles);

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

    @Operation(
            summary = "비용 신청 취소",
            description = "비용 신청 번호(amountNo)에 해당하는 비용 신청의 상태를 취소('C')로 변경합니다. "
                    + "이미 승인(A), 반려(J), 취소(C) 상태인 비용 신청은 취소할 수 없습니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "비용 신청 취소 성공"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 비용 신청 번호이거나, 이미 승인/반려/취소되어 취소할 수 없는 신청"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "취소 처리 중 서버 오류 발생"
            )
    })
    @SecurityRequirement(name = "JWT")
    @PatchMapping("/{amountNo}/cancel")
    public ResponseEntity<?> cancelAmount(

            @Parameter(
                    description = "취소할 비용 신청 번호",
                    example = "1001"
            )
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


        } catch (AccessDeniedException e) {

            throw e;


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
    // =========================================================

    @Operation(
            summary = "비용 결재 상태 변경",
            description = "비용 신청 번호(amountNo)의 결재 상태를 승인(A)/보류(H)/반려(J) 중 하나로 "
                    + "변경하고 승인 금액과 결재 코멘트를 기록합니다. 취소(C)된 비용 신청은 결재할 수 "
                    + "없습니다. 이 API는 로그인한 사용자라면 누구나 호출할 수 있으며, 컨트롤러/서비스 "
                    + "어디에도 MANAGER/ADMIN 등 결재 권한에 대한 별도 검증 로직은 존재하지 않습니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "결재 상태 변경 성공"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 비용 신청 번호, 잘못된 결재 상태, 음수 승인 금액, "
                            + "취소된 신청이거나 결재 처리 실패"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "결재 처리 중 서버 오류 발생"
            )
    })
    @SecurityRequirement(name = "JWT")
    @PatchMapping("/{amountNo}/approval")
    public ResponseEntity<?> updateApproval(

            @Parameter(
                    description = "결재할 비용 신청 번호",
                    example = "1001"
            )
            @PathVariable("amountNo")
            int amountNo,

            @Parameter(
                    description = "변경할 결재 상태(A: 승인, H: 보류, J: 반려)",
                    example = "A"
            )
            @RequestParam("status")
            String status,

            @Parameter(
                    description = "승인 금액(0원 이상)",
                    example = "50000"
            )
            @RequestParam(
                    value = "approvedAmount",
                    defaultValue = "0"
            )
            int approvedAmount,

            @Parameter(
                    description = "결재 코멘트",
                    example = "영수증 확인 후 승인 처리합니다."
            )
            @RequestParam(
                    value = "comment",
                    required = false
            )
            String comment) {

        try {

            if (amountNo <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "잘못된 비용 신청 번호입니다."
                        );
            }


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
            String paymentDate) {

        try {

            if (amountNo <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "잘못된 비용 신청 번호입니다."
                        );
            }


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


            // -------------------------------------------------
            // SupportList
            // -------------------------------------------------

            SupportList support =
                    new SupportList();


            support.setSponsorName(
                    sponsorName
            );


            support.setRequestAmount(
                    sponsorAmount
            );


            support.setApprovedAmount(
                    sponsorAmount
            );


            support.setStatus(
                    sponsorStatus == null
                            || sponsorStatus.isBlank()
                            ? "UNPAID"
                            : sponsorStatus
            );


            support.setRemark(
                    remark
            );


            support.setTransportSupported("N");

            support.setOtherSupported("N");


            // -------------------------------------------------
            // 지급일
            // -------------------------------------------------

            if (paymentDate != null
                    && !paymentDate.isBlank()) {

                support.setPaymentDate(
                        parsePaymentDate(
                                paymentDate
                        )
                );

            } else {

                support.setPaymentDate(
                        LocalDateTime.now()
                );
            }


            // -------------------------------------------------
            // Service
            // -------------------------------------------------

            amountService.updateApprovalWithSponsor(
                    amountNo,
                    status,
                    approvedAmount,
                    comment,
                    support
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
    // 9. 항목별 회사 지원금 수정
    // =========================================================

    @PatchMapping(
            "/{amountNo}/items/{itemNo}/company-support"
    )
    public ResponseEntity<?> updateItemCompanySupport(

            @PathVariable("amountNo")
            int amountNo,

            @PathVariable("itemNo")
            int itemNo,

            @RequestParam("amount")
            int amount) {

        try {

            if (amountNo <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "잘못된 비용 신청 번호입니다."
                        );
            }


            if (itemNo <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "잘못된 비용 항목 번호입니다."
                        );
            }


            if (amount < 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "회사 지원금은 0원 이상이어야 합니다."
                        );
            }


            int result =
                    amountService.updateItemCompanySupport(
                            itemNo,
                            amountNo,
                            amount
                    );


            if (result <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "회사 지원금 수정에 실패했습니다."
                        );
            }


            return ResponseEntity.ok(
                    "항목별 회사 지원금이 수정되었습니다."
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
                            "회사 지원금 수정 중 오류가 발생했습니다: "
                            + e.getMessage()
                    );
        }
    }


    // =========================================================
    // 10. 통계
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
    // 11. 첨부파일 삭제
    // =========================================================

    @PatchMapping(
            "/file/{amountFileNo}/delete"
    )
    public ResponseEntity<?> deleteFile(

            @PathVariable("amountFileNo")
            int amountFileNo) {

        try {

            if (amountFileNo <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "잘못된 파일 번호입니다."
                        );
            }


            int result =
                    amountService.deleteFile(
                            amountFileNo
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
                            "파일 삭제 중 오류가 발생했습니다: "
                            + e.getMessage()
                    );
        }
    }


    // =========================================================
    // 파일 검증
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
                getExtension(
                        originalFilename
                );


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
    // 파일 목록 검증
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
    // JPA Page → 기존 프론트 응답 형식
    // =========================================================

    private Map<String, Object> createPagingResult(
            Page<Amount> amountPage) {

        Map<String, Object> result =
                new HashMap<>();


        result.put(
                "list",
                amountPage.getContent()
        );


        /*
         * 프론트에서 기존 page 기반으로
         * 사용하고 있으므로 1부터 시작하도록 반환
         */
        result.put(
                "page",
                amountPage.getNumber() + 1
        );


        result.put(
                "limit",
                amountPage.getSize()
        );


        result.put(
                "boardLimit",
                amountPage.getSize()
        );


        result.put(
                "listCount",
                amountPage.getTotalElements()
        );


        result.put(
                "maxPage",
                amountPage.getTotalPages()
        );


        /*
         * 기존 PageInfo와 동일한 형태를
         * 최대한 유지
         */

        int currentPage =
                amountPage.getNumber() + 1;

        int pageLimit = 5;

        int startPage =
                ((currentPage - 1) / pageLimit)
                * pageLimit
                + 1;

        int endPage =
                Math.min(
                        startPage + pageLimit - 1,
                        amountPage.getTotalPages()
                );


        result.put(
                "pageLimit",
                pageLimit
        );

        result.put(
                "startPage",
                startPage
        );

        result.put(
                "endPage",
                endPage
        );


        return result;
    }


    // =========================================================
    // 결재 상태 검증
    // =========================================================

    private boolean isValidApprovalStatus(
            String status) {

        return "A".equals(status)
                || "H".equals(status)
                || "J".equals(status);
    }


    // =========================================================
    // paymentDate 변환
    // =========================================================

    private LocalDateTime parsePaymentDate(
            String paymentDate) {

        DateTimeFormatter[] formatters = {

                DateTimeFormatter.ofPattern(
                        "yyyy-MM-dd HH:mm:ss"
                ),

                DateTimeFormatter.ofPattern(
                        "yyyy-MM-dd'T'HH:mm"
                ),

                DateTimeFormatter.ofPattern(
                        "yyyy-MM-dd'T'HH:mm:ss"
                )
        };


        for (DateTimeFormatter formatter :
                formatters) {

            try {

                return LocalDateTime.parse(
                        paymentDate,
                        formatter
                );

            } catch (DateTimeParseException ignored) {

            }
        }


        // yyyy-MM-dd
        try {

            return LocalDate
                    .parse(
                            paymentDate,
                            DateTimeFormatter.ofPattern(
                                    "yyyy-MM-dd"
                            )
                    )
                    .atStartOfDay();

        } catch (DateTimeParseException ignored) {

        }


        throw new IllegalArgumentException(
                "지급일 형식이 올바르지 않습니다."
        );
    }


    // =========================================================
    // 확장자 추출
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
    // 저장 실패 파일 삭제
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

            }
        }
    }
}