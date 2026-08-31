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
import com.kh.workflow.common.model.vo.PageInfo;

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
    // 생성자 주입
    // =========================================================

    public AmountServiceImpl(AmountDao amountDao) {
        this.amountDao = amountDao;
    }


    // =========================================================
    // 1. 전체 비용 신청 개수 조회
    // =========================================================

    @Override
    public int getAmountListCount() {

        return amountDao.getAmountListCount();
    }


    // =========================================================
    // 2. 전체 비용 신청 목록 조회
    // =========================================================

    @Override
    public List<Amount> selectAmountList(PageInfo pi) {

        if (pi == null) {
            return new ArrayList<>();
        }

        List<Amount> list =
                amountDao.selectAmountList(pi);

        return list != null
                ? list
                : new ArrayList<>();
    }


    // =========================================================
    // 3. 비용 신청 등록
    //
    // amount
    //   ↓
    // amount_item N건
    //   ↓
    // amount_list 1건
    //   ↓
    // amount_file N건
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int insertAmount(Amount amount) {

        try {

            if (amount == null) {

                throw new IllegalArgumentException(
                        "비용 신청 정보가 없습니다."
                );
            }


            // -----------------------------------------------------
            // 1. amount 등록
            // -----------------------------------------------------

            if (amount.getStatus() == null) {
                amount.setStatus("R");
            }

            int amountResult =
                    amountDao.insertAmount(amount);

            if (amountResult <= 0) {

                throw new IllegalArgumentException(
                        "비용 신청 등록에 실패했습니다."
                );
            }


            // -----------------------------------------------------
            // 생성된 amount_no 확인
            // -----------------------------------------------------

            if (
                amount.getAmountNo() == null
                || amount.getAmountNo() <= 0
            ) {

                throw new IllegalArgumentException(
                        "비용 신청 번호가 생성되지 않았습니다."
                );
            }

            int amountNo =
                    amount.getAmountNo();


            // -----------------------------------------------------
            // 2. amount_item 등록
            // -----------------------------------------------------

            if (amount.getItemList() != null) {

                for (Amount.Item item :
                        amount.getItemList()) {

                    if (item == null) {
                        continue;
                    }

                    /*
                     * 부모 amount_no 설정
                     */
                    item.setAmountNo(amountNo);

                    int itemResult =
                            amountDao.insertAmountItem(item);

                    if (itemResult <= 0) {

                        throw new IllegalArgumentException(
                                "비용 상세 항목 등록에 실패했습니다."
                        );
                    }
                }
            }


            // -----------------------------------------------------
            // 3. amount_list 등록
            //
            // 현재 DB:
            // amount_list.amount_no = PRIMARY KEY
            //
            // 따라서 Sponsor는 1건만 등록
            // -----------------------------------------------------

            Amount.Sponsor sponsor =
                    amount.getSponsor();

            if (sponsor != null) {

                sponsor.setAmountNo(amountNo);

                /*
                 * amount_list는 amount_no가 PK이므로
                 * 하나의 amount에 하나의 sponsor만 등록
                 */
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


            // -----------------------------------------------------
            // 4. amount_file 등록
            // -----------------------------------------------------

            if (amount.getFileList() != null) {

                for (Amount.File file :
                        amount.getFileList()) {

                    if (file == null) {
                        continue;
                    }

                    file.setAmountNo(amountNo);

                    /*
                     * 상태값이 없으면 사용 상태로 저장
                     */
                    if (file.getStatus() == null) {
                        file.setStatus("Y");
                    }

                    int fileResult =
                            amountDao.insertAmountFile(file);

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
    // 4. 비용 상세 조회
    //
    // amount
    // ├─ itemList
    // ├─ sponsor
    // └─ fileList
    // =========================================================

    @Override
    public Amount selectAmountById(int amountNo) {

        if (amountNo <= 0) {
            return null;
        }


        // -----------------------------------------------------
        // amount 기본 정보
        // -----------------------------------------------------

        Amount amount =
                amountDao.selectAmountById(amountNo);

        if (amount == null) {
            return null;
        }


        // -----------------------------------------------------
        // amount_item
        // -----------------------------------------------------

        List<Amount.Item> itemList =
                amountDao.selectAmountItemsByAmountNo(
                        amountNo
                );

        amount.setItemList(
                itemList != null
                        ? itemList
                        : new ArrayList<>()
        );


        // -----------------------------------------------------
        // amount_list
        //
        // 현재 DB는 amount_no PK → 1건
        // -----------------------------------------------------

        Amount.Sponsor sponsor =
                amountDao.selectSponsorByAmountNo(amountNo);

        amount.setSponsor(sponsor);

        // -----------------------------------------------------
        // amount_file
        // -----------------------------------------------------

        List<Amount.File> fileList =
                amountDao.selectAmountFilesByAmountNo(
                        amountNo
                );

        amount.setFileList(
                fileList != null
                        ? fileList
                        : new ArrayList<>()
        );


        return amount;
    }


    // =========================================================
    // 5-1. 워케이션별 비용 신청 전체 개수
    // =========================================================

    @Override
    public int getAmountCountByWorkcationNo(
            int workcationNo) {

        if (workcationNo <= 0) {
            return 0;
        }

        return amountDao.getAmountCountByWorkcationNo(
                workcationNo
        );
    }


    // =========================================================
    // 5-2. 워케이션별 비용 신청 목록
    // =========================================================

    @Override
    public List<Amount> selectAmountListByWorkcationNo(
            int workcationNo,
            PageInfo pi) {

        if (
            workcationNo <= 0
            || pi == null
        ) {

            return new ArrayList<>();
        }

        List<Amount> list =
                amountDao.selectAmountListByWorkcationNo(
                        workcationNo,
                        pi
                );

        return list != null
                ? list
                : new ArrayList<>();
    }


    // =========================================================
    // 6. 결재 상태 변경
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int updateApprovalStatus(Amount amount) {

        try {

            if (amount == null) {

                throw new IllegalArgumentException(
                        "결재 정보가 없습니다."
                );
            }


            if (
                amount.getAmountNo() == null
                || amount.getAmountNo() <= 0
            ) {

                throw new IllegalArgumentException(
                        "잘못된 비용 신청 번호입니다."
                );
            }


            String status =
                    amount.getStatus();


            /*
             * 결재 단계에서 허용하는 상태
             *
             * A = 승인
             * H = 보류
             * J = 반려
             */
            if (
                !"A".equals(status)
                && !"H".equals(status)
                && !"J".equals(status)
            ) {

                throw new IllegalArgumentException(
                        "잘못된 결재 상태입니다."
                );
            }


            if (amount.getApprovedAmount() == null) {
                amount.setApprovedAmount(0);
            }


            if (amount.getApprovedAmount() < 0) {

                throw new IllegalArgumentException(
                        "승인 금액은 0원 이상이어야 합니다."
                );
            }


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
    // 7. 비용 신청 수정
    //
    // amount
    // ├─ itemList → 기존 삭제 후 재등록
    // ├─ sponsor  → 기존 삭제 후 1건 재등록
    // └─ file     → 새 파일 추가
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateAmount(
            Amount amount,
            List<MultipartFile> files) {

        List<String> savedFiles =
                new ArrayList<>();

        try {

            if (amount == null) {

                throw new IllegalArgumentException(
                        "수정할 비용 정보가 없습니다."
                );
            }


            if (
                amount.getAmountNo() == null
                || amount.getAmountNo() <= 0
            ) {

                throw new IllegalArgumentException(
                        "잘못된 비용 신청 번호입니다."
                );
            }


            int amountNo =
                    amount.getAmountNo();


            // -----------------------------------------------------
            // 기존 데이터 확인
            // -----------------------------------------------------

            Amount existingAmount =
                    amountDao.selectAmountById(
                            amountNo
                    );

            if (existingAmount == null) {

                throw new IllegalArgumentException(
                        "존재하지 않는 비용 신청입니다."
                );
            }


            // -----------------------------------------------------
            // 1. amount 수정
            // -----------------------------------------------------

            int amountResult =
                    amountDao.updateAmount(
                            amount
                    );

            if (amountResult <= 0) {

                throw new IllegalArgumentException(
                        "비용 신청 수정에 실패했습니다."
                );
            }


            // -----------------------------------------------------
            // 2. 기존 amount_item 삭제
            // -----------------------------------------------------

            amountDao.deleteAmountItemsByAmountNo(
                    amountNo
            );


            // -----------------------------------------------------
            // 새로운 amount_item 등록
            // -----------------------------------------------------

            if (amount.getItemList() != null) {

                for (Amount.Item item :
                        amount.getItemList()) {

                    if (item == null) {
                        continue;
                    }

                    item.setAmountNo(amountNo);

                    int itemResult =
                            amountDao.insertAmountItem(
                                    item
                            );

                    if (itemResult <= 0) {

                        throw new IllegalArgumentException(
                                "비용 상세 항목 수정에 실패했습니다."
                        );
                    }
                }
            }


            // -----------------------------------------------------
            // 3. 기존 amount_list 삭제
            // -----------------------------------------------------

            amountDao.deleteAmountSponsorsByAmountNo(
                    amountNo
            );


            // -----------------------------------------------------
            // 새로운 Sponsor 1건 등록
            // -----------------------------------------------------

            Amount.Sponsor sponsor =
                    amount.getSponsor();

            if (sponsor != null) {

                sponsor.setAmountNo(amountNo);

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


            // -----------------------------------------------------
            // 4. 새 첨부파일 처리
            // -----------------------------------------------------

            if (
                files != null
                && !files.isEmpty()
            ) {

                File uploadDir =
                        new File(UPLOAD_DIR);


                if (!uploadDir.exists()) {

                    boolean created =
                            uploadDir.mkdirs();

                    if (
                        !created
                        && !uploadDir.exists()
                    ) {

                        throw new IOException(
                                "첨부파일 저장 폴더를 생성할 수 없습니다."
                        );
                    }
                }


                for (
                    MultipartFile multipartFile :
                    files
                ) {

                    if (
                        multipartFile == null
                        || multipartFile.isEmpty()
                    ) {

                        continue;
                    }


                    String originalFilename =
                            multipartFile
                            .getOriginalFilename();


                    if (
                        originalFilename == null
                        || originalFilename
                            .trim()
                            .isEmpty()
                    ) {

                        continue;
                    }


                    /*
                     * 경로 조작 방지
                     */
                    originalFilename =
                            new File(
                                originalFilename
                            ).getName();


                    String savedFilename =
                            UUID.randomUUID()
                            + "_"
                            + originalFilename;


                    File destination =
                            new File(
                                uploadDir,
                                savedFilename
                            );


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
                    }


                    savedFiles.add(
                            destination.getAbsolutePath()
                    );


                    Amount.File file =
                            new Amount.File();


                    file.setAmountNo(amountNo);

                    file.setOriginName(
                            originalFilename
                    );

                    file.setChangeName(
                            savedFilename
                    );

                    file.setFilePath(
                            FILE_PATH
                            + savedFilename
                    );

                    file.setStatus("Y");


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

            deleteSavedFiles(savedFiles);

            throw e;

        } catch (IOException e) {

            deleteSavedFiles(savedFiles);

            throw new RuntimeException(
                    "첨부파일 처리 중 오류가 발생했습니다: "
                    + e.getMessage(),
                    e
            );

        } catch (Exception e) {

            deleteSavedFiles(savedFiles);

            throw new RuntimeException(
                    "비용 신청 수정 중 오류가 발생했습니다.",
                    e
            );
        }
    }


    // =========================================================
    // 8. 개별 파일 삭제
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int deleteFile(
            int amountattachmentNo) {

        if (amountattachmentNo <= 0) {

            throw new IllegalArgumentException(
                    "잘못된 파일 번호입니다."
            );
        }


        int result =
                amountDao.deleteFile(
                        amountattachmentNo
                );


        if (result <= 0) {

            throw new IllegalArgumentException(
                    "파일 삭제에 실패했습니다."
            );
        }


        return result;
    }


    // =========================================================
    // 9. 저장 실패 시 실제 파일 삭제
    // =========================================================

    private void deleteSavedFiles(
            List<String> savedFiles) {

        if (
            savedFiles == null
            || savedFiles.isEmpty()
        ) {

            return;
        }


        for (String path : savedFiles) {

            if (
                path == null
                || path.trim().isEmpty()
            ) {

                continue;
            }


            try {

                File file =
                        new File(path);

                if (file.exists()) {
                    file.delete();
                }

            } catch (Exception ignored) {

                // 정리 작업은 계속 진행
            }
        }
    }


    // =========================================================
    // 10. 비용 신청 취소
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int cancelAmount(
            int amountNo) {

        try {

            if (amountNo <= 0) {

                throw new IllegalArgumentException(
                        "잘못된 비용 신청 번호입니다."
                );
            }


            Amount amount =
                    amountDao.selectAmountById(
                            amountNo
                    );


            if (amount == null) {

                throw new IllegalArgumentException(
                        "존재하지 않는 비용 신청입니다."
                );
            }


            String status =
                    amount.getStatus();


            if ("A".equals(status)) {

                throw new IllegalArgumentException(
                        "이미 승인된 비용 신청은 취소할 수 없습니다."
                );
            }


            if ("J".equals(status)) {

                throw new IllegalArgumentException(
                        "이미 반려된 비용 신청입니다."
                );
            }


            if ("C".equals(status)) {

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
    // 11. 승인 + 지원금 처리
    //
    // amount
    // └─ amount_no
    //      │
    //      └── amount_list
    //            └─ amount_no PK
    //
    // 따라서 Sponsor는 1건만 존재
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

            // -----------------------------------------------------
            // 기본 검증
            // -----------------------------------------------------

            if (amountNo <= 0) {

                throw new IllegalArgumentException(
                        "잘못된 비용 신청 번호입니다."
                );
            }


            if (
                !"A".equals(status)
                && !"H".equals(status)
                && !"J".equals(status)
            ) {

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


            // -----------------------------------------------------
            // 기존 amount 확인
            // -----------------------------------------------------

            Amount existingAmount =
                    amountDao.selectAmountById(
                            amountNo
                    );


            if (existingAmount == null) {

                throw new IllegalArgumentException(
                        "존재하지 않는 비용 신청입니다."
                );
            }


            // -----------------------------------------------------
            // 결재 상태 변경
            // -----------------------------------------------------

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


            // -----------------------------------------------------
            // 승인(A)일 경우 지원금 처리
            // -----------------------------------------------------

            if ("A".equals(status)) {

                /*
                 * 기존 지원금 삭제
                 *
                 * amount_list.amount_no가 PK이므로
                 * 기존 데이터가 있으면 먼저 삭제
                 */
                amountDao
                    .deleteAmountSponsorsByAmountNo(
                        amountNo
                    );


                /*
                 * 지원금이 실제로 있는 경우만 INSERT
                 */
                if (sponsorAmount > 0) {

                    Amount.Sponsor sponsor =
                            new Amount.Sponsor();


                    sponsor.setAmountNo(
                            amountNo
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
    // 12. 전체 통계
    // =========================================================

    @Override
    public Map<String, Object> getFullStatistics() {

        try {

            Map<String, Object> result =
                    new HashMap<>();


            result.put(
                    "summary",
                    amountDao.getStatisticsSummary()
            );


            result.put(
                    "deptStatistics",
                    amountDao.getDeptStatistics()
            );


            result.put(
                    "monthlyStatistics",
                    amountDao.getMonthlyStatistics()
            );


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

