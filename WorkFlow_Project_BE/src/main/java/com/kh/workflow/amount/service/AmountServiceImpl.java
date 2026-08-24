package com.kh.workflow.amount.service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.amount.dao.AmountDao;
import com.kh.workflow.amount.vo.Amount;

@Service
public class AmountServiceImpl implements AmountService {

    private final AmountDao amountDao;

    // =========================================================
    // 파일 저장 경로
    // =========================================================

    private static final String UPLOAD_DIR =
            "C:/upload/receipts/";

    private static final String FILE_PATH =
            "/upload/receipts/";


    // =========================================================
    // 생성자
    // =========================================================

    public AmountServiceImpl(AmountDao amountDao) {
        this.amountDao = amountDao;
    }


    // =========================================================
    // 비용 신청 등록
    //
    // Amount
    //  ├─ Item
    //  │   └─ Sponsor
    //  └─ File 여러 개
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int insertAmount(Amount amount) {

        try {

            // -------------------------------------------------
            // 1. 비용 신청 등록
            // -------------------------------------------------

            int amountResult =
                    amountDao.insertAmount(amount);

            if (amountResult <= 0) {

                throw new IllegalArgumentException(
                        "비용 신청 등록에 실패했습니다."
                );
            }


            // -------------------------------------------------
            // 2. 비용 상세 항목 등록
            // -------------------------------------------------

            if (amount.getItemList() != null) {

                for (Amount.Item item :
                        amount.getItemList()) {

                    // 부모 amount 번호 설정
                    item.setAmountNo(
                            amount.getAmountNo()
                    );


                    int itemResult =
                            amountDao.insertAmountItem(
                                    item
                            );


                    if (itemResult <= 0) {

                        throw new IllegalArgumentException(
                                "비용 상세 항목 등록에 실패했습니다."
                        );
                    }


                    // -------------------------------------------------
                    // 3. 지원금 등록
                    // -------------------------------------------------

                    if (item.getSponsorList() != null) {

                        for (Amount.Sponsor sponsor :
                                item.getSponsorList()) {

                            sponsor.setItemNo(
                                    item.getItemNo()
                            );


                            int sponsorResult =
                                    amountDao.insertAmountSponsor(
                                            sponsor
                                    );


                            if (sponsorResult <= 0) {

                                throw new IllegalArgumentException(
                                        "지원금 등록에 실패했습니다."
                                );
                            }
                        }
                    }
                }
            }


            // =================================================
            // 4. 첨부파일 등록
            //
            // Controller에서 이미 실제 파일을 저장하고
            // Amount.fileList에 VO를 넣어준 상태
            // =================================================

            if (amount.getFileList() != null) {

                for (Amount.File file :
                        amount.getFileList()) {

                    file.setAmountNo(
                            amount.getAmountNo()
                    );


                    int fileResult =
                            amountDao.insertAmountFile(
                                    file
                            );


                    if (fileResult <= 0) {

                        throw new IllegalArgumentException(
                                "첨부파일 정보 등록에 실패했습니다."
                        );
                    }
                }
            }


            return amountResult;

        } catch (IllegalArgumentException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException(
                    "비용 신청 등록 중 오류가 발생했습니다.",
                    e
            );
        }
    }


    // =========================================================
    // 비용 상세 조회
    // =========================================================

    @Override
    public Amount selectAmountById(int amountNo) {

        Amount amount =
                amountDao.selectAmountById(
                        amountNo
                );


        if (amount == null) {
            return null;
        }


        // -------------------------------------------------
        // 비용 상세 항목
        // -------------------------------------------------

        List<Amount.Item> itemList =
                amountDao.selectAmountItemsByAmountNo(
                        amountNo
                );


        if (itemList == null) {

            itemList =
                    new ArrayList<>();
        }


        // -------------------------------------------------
        // 각 항목별 지원금 조회
        // -------------------------------------------------

        for (Amount.Item item :
                itemList) {

            List<Amount.Sponsor> sponsorList =
                    amountDao.selectSponsorsByItemNo(
                            item.getItemNo()
                    );


            if (sponsorList == null) {

                sponsorList =
                        new ArrayList<>();
            }


            item.setSponsorList(
                    sponsorList
            );
        }


        amount.setItemList(
                itemList
        );


        // -------------------------------------------------
        // 첨부파일 조회
        // -------------------------------------------------

        List<Amount.File> fileList =
                amountDao.selectAmountFilesByAmountNo(
                        amountNo
                );


        if (fileList == null) {

            fileList =
                    new ArrayList<>();
        }


        amount.setFileList(
                fileList
        );


        return amount;
    }


    // =========================================================
    // 워케이션별 비용 신청 목록
    // =========================================================

    @Override
    public List<Amount> selectAmountListByWorkcationNo(
            int workcationNo) {

        List<Amount> list =
                amountDao.selectAmountListByWorkcationNo(
                        workcationNo
                );


        if (list == null) {

            return new ArrayList<>();
        }


        return list;
    }


    // =========================================================
    // 결재 상태 변경
    //
    // A = 승인
    // H = 보류
    // J = 반려
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int updateApprovalStatus(
            Amount amount) {

        try {

            // -------------------------------------------------
            // 기본 검증
            // -------------------------------------------------

            if (amount == null) {

                throw new IllegalArgumentException(
                        "결재 정보가 없습니다."
                );
            }


            if (amount.getAmountNo() <= 0) {

                throw new IllegalArgumentException(
                        "잘못된 비용 신청 번호입니다."
                );
            }


            String status =
                    amount.getStatus();


            if (!"A".equals(status) &&
                !"H".equals(status) &&
                !"J".equals(status)) {

                throw new IllegalArgumentException(
                        "잘못된 결재 상태입니다."
                );
            }


            // -------------------------------------------------
            // 승인 금액 음수 방지
            // -------------------------------------------------

            if (amount.getApprovedAmount() < 0) {

                throw new IllegalArgumentException(
                        "승인 금액은 0원 이상이어야 합니다."
                );
            }


            // -------------------------------------------------
            // DB 상태 변경
            // -------------------------------------------------

            int result =
                    amountDao.updateApprovalStatus(
                            amount
                    );


            if (result <= 0) {

                throw new IllegalArgumentException(
                        "결재 상태 변경에 실패했습니다."
                );
            }


            return result;

        } catch (IllegalArgumentException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException(
                    "결재 상태 변경 중 오류가 발생했습니다.",
                    e
            );
        }
    }


    // =========================================================
    // 비용 신청 수정
    //
    // - 기존 비용 정보 수정
    // - 기존 Item 삭제 후 재등록
    // - 기존 첨부파일 유지
    // - 새 파일 여러 개 추가
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateAmount(
            Amount amount,
            List<MultipartFile> files) {

        // -----------------------------------------------------
        // 이번 요청에서 실제 디스크에 저장된 파일
        //
        // DB 등록 실패 시 다시 삭제하기 위해 사용
        // -----------------------------------------------------

        List<String> savedFiles =
                new ArrayList<>();


        try {

            // =================================================
            // 1. 기본 검증
            // =================================================

            if (amount == null) {

                throw new IllegalArgumentException(
                        "수정할 비용 정보가 없습니다."
                );
            }


            int amountNo =
                    amount.getAmountNo();


            if (amountNo <= 0) {

                throw new IllegalArgumentException(
                        "잘못된 비용 신청 번호입니다."
                );
            }


            // =================================================
            // 2. 기존 데이터 확인
            // =================================================

            Amount existingAmount =
                    amountDao.selectAmountById(
                            amountNo
                    );


            if (existingAmount == null) {

                throw new IllegalArgumentException(
                        "존재하지 않는 비용 신청입니다."
                );
            }


            // =================================================
            // 3. 기본 Amount 수정
            // =================================================

            int amountResult =
                    amountDao.updateAmount(
                            amount
                    );


            if (amountResult <= 0) {

                throw new IllegalArgumentException(
                        "비용 신청 수정에 실패했습니다."
                );
            }


            // =================================================
            // 4. 기존 Item 삭제
            // =================================================

            amountDao.deleteAmountItemsByAmountNo(
                    amountNo
            );


            // =================================================
            // 5. Item 재등록
            // =================================================

            if (amount.getItemList() != null) {

                for (Amount.Item item :
                        amount.getItemList()) {

                    item.setAmountNo(
                            amountNo
                    );


                    int itemResult =
                            amountDao.insertAmountItem(
                                    item
                            );


                    if (itemResult <= 0) {

                        throw new IllegalArgumentException(
                                "비용 상세 항목 수정에 실패했습니다."
                        );
                    }


                    // -------------------------------------------------
                    // 지원금 재등록
                    // -------------------------------------------------

                    if (item.getSponsorList() != null) {

                        for (Amount.Sponsor sponsor :
                                item.getSponsorList()) {

                            sponsor.setItemNo(
                                    item.getItemNo()
                            );


                            int sponsorResult =
                                    amountDao.insertAmountSponsor(
                                            sponsor
                                    );


                            if (sponsorResult <= 0) {

                                throw new IllegalArgumentException(
                                        "지원금 수정에 실패했습니다."
                                );
                            }
                        }
                    }
                }
            }


            // =================================================
            // 6. 새 첨부파일 처리
            //
            // files가 없으면 기존 파일 그대로 유지
            // =================================================

            if (files != null &&
                !files.isEmpty()) {


                // -------------------------------------------------
                // 업로드 폴더 생성
                // -------------------------------------------------

                File uploadDir =
                        new File(
                                UPLOAD_DIR
                        );


                if (!uploadDir.exists()) {

                    boolean created =
                            uploadDir.mkdirs();


                    if (!created &&
                        !uploadDir.exists()) {

                        throw new IOException(
                                "첨부파일 저장 폴더를 생성할 수 없습니다."
                        );
                    }
                }


                // -------------------------------------------------
                // 여러 파일 반복
                // -------------------------------------------------

                for (MultipartFile multipartFile :
                        files) {


                    // 빈 파일 무시
                    if (multipartFile == null ||
                        multipartFile.isEmpty()) {

                        continue;
                    }


                    // -------------------------------------------------
                    // 원본 파일명
                    // -------------------------------------------------

                    String originalFilename =
                            multipartFile
                                    .getOriginalFilename();


                    if (originalFilename == null ||
                        originalFilename.trim().isEmpty()) {

                        continue;
                    }


                    // -------------------------------------------------
                    // 경로 조작 방지
                    // -------------------------------------------------

                    originalFilename =
                            new File(
                                    originalFilename
                            ).getName();


                    // -------------------------------------------------
                    // 저장 파일명
                    // -------------------------------------------------

                    String savedFilename =
                            UUID.randomUUID()
                                    .toString()
                                    + "_"
                                    + originalFilename;


                    // -------------------------------------------------
                    // 실제 저장 위치
                    // -------------------------------------------------

                    File destination =
                            new File(
                                    uploadDir,
                                    savedFilename
                            );


                    // =================================================
                    // 실제 파일 저장
                    // =================================================

                    try {

                        multipartFile.transferTo(
                                destination
                        );

                    } catch (IOException e) {

                        throw new IOException(
                                "파일 저장에 실패했습니다: "
                                + originalFilename,
                                e
                        );

                    } catch (IllegalStateException e) {

                        throw new IllegalStateException(
                                "파일 저장 상태가 올바르지 않습니다: "
                                + originalFilename,
                                e
                        );
                    }


                    // -------------------------------------------------
                    // 저장 성공한 파일 기록
                    // -------------------------------------------------

                    savedFiles.add(
                            destination.getAbsolutePath()
                    );


                    // =================================================
                    // DB 파일 VO 생성
                    // =================================================

                    Amount.File file =
                            new Amount.File();


                    file.setAmountNo(
                            amountNo
                    );


                    file.setOriginName(
                            originalFilename
                    );


                    file.setChangeName(
                            savedFilename
                    );


                    file.setFilePath(
                            FILE_PATH +
                            savedFilename
                    );


                    // =================================================
                    // DB 파일 정보 등록
                    // =================================================

                    int fileResult =
                            amountDao.insertAmountFile(
                                    file
                            );


                    if (fileResult <= 0) {

                        throw new IllegalArgumentException(
                                "첨부파일 DB 등록에 실패했습니다: "
                                + originalFilename
                        );
                    }
                }
            }


        } catch (IllegalArgumentException e) {

            // -----------------------------------------------------
            // 비즈니스 예외
            // -----------------------------------------------------

            deleteSavedFiles(
                    savedFiles
            );

            throw e;


        } catch (IOException e) {

            // -----------------------------------------------------
            // 파일 입출력 예외
            // -----------------------------------------------------

            deleteSavedFiles(
                    savedFiles
            );

            throw new RuntimeException(
                    "첨부파일 처리 중 오류가 발생했습니다: "
                    + e.getMessage(),
                    e
            );


        } catch (Exception e) {

            // -----------------------------------------------------
            // 기타 예외
            // -----------------------------------------------------

            deleteSavedFiles(
                    savedFiles
            );

            throw new RuntimeException(
                    "비용 신청 수정 중 오류가 발생했습니다.",
                    e
            );
        }
    }


    // =========================================================
    // 저장 실패 시 실제 파일 삭제
    // =========================================================

    private void deleteSavedFiles(
            List<String> savedFiles) {

        if (savedFiles == null ||
            savedFiles.isEmpty()) {

            return;
        }


        for (String path :
                savedFiles) {

            if (path == null ||
                path.trim().isEmpty()) {

                continue;
            }


            try {

                File file =
                        new File(path);


                if (file.exists()) {

                    boolean deleted =
                            file.delete();


                    if (!deleted) {

                        System.err.println(
                                "파일 삭제 실패: "
                                + path
                        );
                    }
                }

            } catch (Exception e) {

                System.err.println(
                        "파일 정리 중 오류: "
                        + path
                );

                e.printStackTrace();
            }
        }
    }


    // =========================================================
    // 비용 신청 취소
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int cancelAmount(
            int amountNo) {

        try {

            Amount amount =
                    amountDao.selectAmountById(
                            amountNo
                    );


            if (amount == null) {

                throw new IllegalArgumentException(
                        "존재하지 않는 비용 신청입니다."
                );
            }


            // -------------------------------------------------
            // 이미 승인된 건
            // -------------------------------------------------

            if ("A".equals(
                    amount.getStatus())) {

                throw new IllegalArgumentException(
                        "이미 승인된 비용 신청은 취소할 수 없습니다."
                );
            }


            // -------------------------------------------------
            // 이미 반려된 건
            // -------------------------------------------------

            if ("J".equals(
                    amount.getStatus())) {

                throw new IllegalArgumentException(
                        "이미 반려된 비용 신청입니다."
                );
            }


            // -------------------------------------------------
            // 이미 취소된 건
            // -------------------------------------------------

            if ("C".equals(
                    amount.getStatus())) {

                throw new IllegalArgumentException(
                        "이미 취소된 비용 신청입니다."
                );
            }


            int result =
                    amountDao.cancelAmount(
                            amountNo
                    );


            if (result <= 0) {

                throw new IllegalArgumentException(
                        "비용 신청 취소에 실패했습니다."
                );
            }


            return result;

        } catch (IllegalArgumentException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException(
                    "비용 신청 취소 중 오류가 발생했습니다.",
                    e
            );
        }
    }


    // =========================================================
    // 승인 + 지원금 처리
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateApprovalWithSponsor(
            int amountNo,
            String status,
            int approvedAmount,
            String comment,
            String sponsorName,
            int sponsorAmount,
            String sponsorStatus,
            String remark) {

        try {

            // =================================================
            // 1. 기본 검증
            // =================================================

            if (amountNo <= 0) {

                throw new IllegalArgumentException(
                        "잘못된 비용 신청 번호입니다."
                );
            }


            if (!"A".equals(status) &&
                !"H".equals(status) &&
                !"J".equals(status)) {

                throw new IllegalArgumentException(
                        "잘못된 결재 상태입니다."
                );
            }


            if (approvedAmount < 0) {

                throw new IllegalArgumentException(
                        "승인 금액은 0원 이상이어야 합니다."
                );
            }


            if (sponsorAmount < 0) {

                throw new IllegalArgumentException(
                        "지원금은 0원 이상이어야 합니다."
                );
            }


            // =================================================
            // 2. 승인 상태 변경
            // =================================================

            Amount amount =
                    new Amount();


            amount.setAmountNo(
                    amountNo
            );


            amount.setStatus(
                    status
            );


            amount.setApprovedAmount(
                    approvedAmount
            );


            amount.setAmountComment(
                    comment
            );


            int result =
                    amountDao.updateApprovalStatus(
                            amount
                    );


            if (result <= 0) {

                throw new IllegalArgumentException(
                        "결재 처리에 실패했습니다."
                );
            }


            // =================================================
            // 3. 승인일 경우 지원금 처리
            // =================================================

            if ("A".equals(status) &&
                sponsorAmount > 0) {


                Integer itemNo =
                        amountDao.findFirstItemNoByAmountNo(
                                amountNo
                        );


                if (itemNo == null) {

                    throw new IllegalArgumentException(
                            "지원금을 등록할 비용 항목을 찾을 수 없습니다."
                    );
                }


                Amount.Sponsor sponsor =
                        new Amount.Sponsor();


                sponsor.setItemNo(
                        itemNo
                );


                sponsor.setSponsorName(
                        sponsorName
                );


                sponsor.setAmount(
                        sponsorAmount
                );


                sponsor.setStatus(
                        sponsorStatus
                );


                sponsor.setRemark(
                        remark
                );


                int sponsorResult =
                        amountDao.upsertAmountSponsor(
                                sponsor
                        );


                if (sponsorResult <= 0) {

                    throw new IllegalArgumentException(
                            "지원금 등록에 실패했습니다."
                    );
                }
            }


        } catch (IllegalArgumentException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException(
                    "결재 및 지원금 처리 중 오류가 발생했습니다.",
                    e
            );
        }
    }


    // =========================================================
    // 통계
    // =========================================================

    @Override
    public Map<String, Object> getFullStatistics() {

        try {

            Map<String, Object> result =
                    new HashMap<>();


            // -------------------------------------------------
            // 전체 요약
            // -------------------------------------------------

            result.put(
                    "summary",
                    amountDao.getStatisticsSummary()
            );


            // -------------------------------------------------
            // 부서별
            // -------------------------------------------------

            result.put(
                    "deptStatistics",
                    amountDao.getDeptStatistics()
            );


            // -------------------------------------------------
            // 월별
            // -------------------------------------------------

            result.put(
                    "monthlyStatistics",
                    amountDao.getMonthlyStatistics()
            );


            // -------------------------------------------------
            // 항목별
            // -------------------------------------------------

            result.put(
                    "itemStatistics",
                    amountDao.getItemStatistics()
            );


            return result;

        } catch (Exception e) {

            throw new RuntimeException(
                    "정산 통계 조회 중 오류가 발생했습니다.",
                    e
            );
        }
    }
}