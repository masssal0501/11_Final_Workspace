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
    // 파일 설정
    // =========================================================

    private static final String UPLOAD_DIR =
            "C:/upload/receipts/";

    private static final String FILE_PATH =
            "/upload/receipts/";

    private static final long MAX_FILE_SIZE =
            10L * 1024L * 1024L;

    private static final String[] ALLOWED_EXTENSIONS = {
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp"
    };


    // =========================================================
    // 생성자
    // =========================================================

    public AmountServiceImpl(AmountDao amountDao) {
        this.amountDao = amountDao;
    }


    // =========================================================
    // 1. 전체 비용 신청 개수
    // =========================================================

    @Override
    public int getAmountListCount() {

        return amountDao.getAmountListCount();
    }


    // =========================================================
    // 2. 전체 비용 신청 목록
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
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int insertAmount(Amount amount) {

        if (amount == null) {
            throw new IllegalArgumentException(
                    "비용 신청 정보가 없습니다."
            );
        }

        // ---------------------------------------------------------
        // amount 기본값 및 검증
        // ---------------------------------------------------------

        if (amount.getStatus() == null
                || amount.getStatus().isBlank()) {

            amount.setStatus("R");
        }

        if (!isValidAmountStatus(amount.getStatus())) {
            throw new IllegalArgumentException(
                    "잘못된 비용 신청 상태입니다."
            );
        }

        if (amount.getRequestedAmount() == null
                || amount.getRequestedAmount() < 0) {

            throw new IllegalArgumentException(
                    "신청 금액이 올바르지 않습니다."
            );
        }

        if (amount.getWorkcationNo() == null
                || amount.getWorkcationNo() <= 0) {

            throw new IllegalArgumentException(
                    "워케이션 번호가 올바르지 않습니다."
            );
        }

        // ---------------------------------------------------------
        // amount 등록
        // ---------------------------------------------------------

        int result =
                amountDao.insertAmount(amount);

        if (result <= 0) {
            throw new IllegalArgumentException(
                    "비용 신청 등록에 실패했습니다."
            );
        }

        if (amount.getAmountNo() == null
                || amount.getAmountNo() <= 0) {

            throw new IllegalArgumentException(
                    "비용 신청 번호가 생성되지 않았습니다."
            );
        }

        int amountNo = amount.getAmountNo();


        // =========================================================
        // amount_item 등록
        // =========================================================

        if (amount.getItemList() != null) {

            for (Amount.Item item :
                    amount.getItemList()) {

                if (item == null) {
                    continue;
                }

                if (item.getAmount() == null
                        || item.getAmount() < 0) {

                    throw new IllegalArgumentException(
                            "비용 항목 금액이 올바르지 않습니다."
                    );
                }

                /*
                 * DB:
                 * amountamountitem_type
                 *
                 * S 숙박
                 * T 교통
                 * E 체험
                 * F 식비
                 * V 차량
                 * O 기타
                 */
                String itemType =
                        item.getAmountamountitemType();

                if (itemType == null
                        || itemType.isBlank()) {

                    throw new IllegalArgumentException(
                            "비용 항목 유형이 없습니다."
                    );
                }

                item.setAmountNo(amountNo);

                if (item.getItemDate() == null) {
                    item.setItemDate(new java.util.Date());
                }

                if (item.getItemApproved() == null
                        || item.getItemApproved().isBlank()) {

                    item.setItemApproved("R");
                }

                int itemResult =
                        amountDao.insertAmountItem(item);

                if (itemResult <= 0) {
                    throw new IllegalArgumentException(
                            "비용 상세 항목 등록에 실패했습니다."
                    );
                }
            }
        }


        // =========================================================
        // amount_list 등록
        //
        // DB:
        // amount_no = PK
        // item_no   = NOT NULL FK
        //
        // 따라서 Sponsor는 1개만 등록
        // =========================================================

        Amount.Sponsor sponsor =
                amount.getSponsor();

        if (sponsor != null) {

            sponsor.setAmountNo(amountNo);

            if (sponsor.getAmount() == null) {
                sponsor.setAmount(0);
            }

            if (sponsor.getAmount() < 0) {
                throw new IllegalArgumentException(
                        "지원금은 0원 이상이어야 합니다."
                );
            }

            if (sponsor.getItemNo() == null
                    || sponsor.getItemNo() <= 0) {

                throw new IllegalArgumentException(
                        "지원금에 연결할 비용 항목 번호가 없습니다."
                );
            }

            if (sponsor.getStatus() == null
                    || sponsor.getStatus().isBlank()) {

                sponsor.setStatus("UNPAID");
            }

            if (sponsor.getPaymentDate() == null) {
                sponsor.setPaymentDate(new java.util.Date());
            }

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


        // =========================================================
        // amount_file 등록
        // =========================================================

        if (amount.getFileList() != null) {

            for (Amount.File file :
                    amount.getFileList()) {

                if (file == null) {
                    continue;
                }

                file.setAmountNo(amountNo);

                if (file.getStatus() == null
                        || file.getStatus().isBlank()) {

                    file.setStatus("Y");
                }

                int fileResult =
                        amountDao.insertAmountFile(file);

                if (fileResult <= 0) {
                    throw new IllegalArgumentException(
                            "첨부파일 등록에 실패했습니다."
                    );
                }
            }
        }

        return result;
    }


    // =========================================================
    // 4. 비용 상세 조회
    // =========================================================

    @Override
    public Amount selectAmountById(int amountNo) {

        if (amountNo <= 0) {
            return null;
        }

        Amount amount =
                amountDao.selectAmountById(amountNo);

        if (amount == null) {
            return null;
        }

        /*
         * amountResultMap의 nested select를 사용하는 경우에도
         * 명시적으로 조회해 주면 DAO 단독 호출에도 대응 가능.
         */

        // ---------------------------------------------------------
        // amount_item
        // ---------------------------------------------------------

        List<Amount.Item> itemList =
                amountDao.selectAmountItemsByAmountNo(
                        amountNo
                );

        amount.setItemList(
                itemList != null
                        ? itemList
                        : new ArrayList<>()
        );


        // ---------------------------------------------------------
        // amount_list : 1:1
        // ---------------------------------------------------------

        Amount.Sponsor sponsor =
                amountDao.selectSponsorByAmountNo(
                        amountNo
                );

        amount.setSponsor(sponsor);


        // ---------------------------------------------------------
        // amount_file
        // ---------------------------------------------------------

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
    // 5. 워케이션별 비용 신청 개수
    // =========================================================

    @Override
    public int getAmountCountByWorkcationNo(
            int workcationNo) {

        if (workcationNo <= 0) {
            return 0;
        }

        return amountDao.selectAmountCountByWorkcationNo(
                workcationNo
        );
    }


    // =========================================================
    // 6. 워케이션별 비용 신청 목록
    // =========================================================

    @Override
    public List<Amount> selectAmountListByWorkcationNo(
            int workcationNo,
            PageInfo pi) {

        if (workcationNo <= 0
                || pi == null) {

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
    // 7. 비용 결재 상태 변경
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int updateApprovalStatus(
            int amountNo,
            String status,
            int approvedAmount,
            String comment) {

        if (amountNo <= 0) {
            throw new IllegalArgumentException(
                    "잘못된 비용 신청 번호입니다."
            );
        }

        if (!isValidApprovalStatus(status)) {
            throw new IllegalArgumentException(
                    "잘못된 결재 상태입니다."
            );
        }

        if (approvedAmount < 0) {
            throw new IllegalArgumentException(
                    "승인 금액은 0원 이상이어야 합니다."
            );
        }

        Amount existingAmount =
                amountDao.selectAmountById(amountNo);

        if (existingAmount == null) {
            throw new IllegalArgumentException(
                    "존재하지 않는 비용 신청입니다."
            );
        }

        if ("C".equals(existingAmount.getStatus())) {
            throw new IllegalArgumentException(
                    "취소된 비용 신청은 결재할 수 없습니다."
            );
        }

        Amount amount =
                new Amount();

        amount.setAmountNo(amountNo);
        amount.setStatus(status);
        amount.setApprovedAmount(approvedAmount);
        amount.setAmountComment(comment);

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
    }


    // =========================================================
    // 8. 비용 신청 수정
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

            if (amount.getAmountNo() == null
                    || amount.getAmountNo() <= 0) {

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

            if ("A".equals(existingAmount.getStatus())) {
                throw new IllegalArgumentException(
                        "이미 승인된 비용 신청은 수정할 수 없습니다."
                );
            }

            if ("C".equals(existingAmount.getStatus())) {
                throw new IllegalArgumentException(
                        "취소된 비용 신청은 수정할 수 없습니다."
                );
            }


            // -----------------------------------------------------
            // 기존 값 유지
            // -----------------------------------------------------

            if (amount.getStatus() == null
                    || amount.getStatus().isBlank()) {

                amount.setStatus(
                        existingAmount.getStatus()
                );
            }

            if (!isValidAmountStatus(amount.getStatus())) {
                throw new IllegalArgumentException(
                        "잘못된 비용 신청 상태입니다."
                );
            }

            if (amount.getWorkcationNo() == null) {
                amount.setWorkcationNo(
                        existingAmount.getWorkcationNo()
                );
            }

            if (amount.getRequestedAmount() == null) {
                amount.setRequestedAmount(
                        existingAmount.getRequestedAmount()
                );
            }

            if (amount.getRequestedAmount() < 0) {
                throw new IllegalArgumentException(
                        "신청 금액은 0원 이상이어야 합니다."
                );
            }


            // -----------------------------------------------------
            // amount 수정
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


            // =====================================================
            // 기존 amount_item 삭제
            // =====================================================

            amountDao.deleteAmountItemsByAmountNo(
                    amountNo
            );


            // =====================================================
            // amount_item 재등록
            // =====================================================

            if (amount.getItemList() != null) {

                for (Amount.Item item :
                        amount.getItemList()) {

                    if (item == null) {
                        continue;
                    }

                    if (item.getAmount() == null
                            || item.getAmount() < 0) {

                        throw new IllegalArgumentException(
                                "비용 항목 금액이 올바르지 않습니다."
                        );
                    }

                    String itemType =
                            item.getAmountamountitemType();

                    if (itemType == null
                            || itemType.isBlank()) {

                        throw new IllegalArgumentException(
                                "비용 항목 유형이 없습니다."
                        );
                    }

                    item.setAmountNo(amountNo);

                    if (item.getItemDate() == null) {
                        item.setItemDate(new java.util.Date());
                    }

                    if (item.getItemApproved() == null
                            || item.getItemApproved().isBlank()) {

                        item.setItemApproved("R");
                    }

                    int itemResult =
                            amountDao.insertAmountItem(
                                    item
                            );

                    if (itemResult <= 0) {
                        throw new IllegalArgumentException(
                                "비용 항목 수정에 실패했습니다."
                        );
                    }
                }
            }


            // =====================================================
            // amount_list 수정
            //
            // 현재 DB에서는 amount_no가 PK이므로
            // 기존 sponsor를 삭제 후 1개만 재등록
            // =====================================================

            amountDao.deleteAmountSponsorsByAmountNo(
                    amountNo
            );

            Amount.Sponsor sponsor =
                    amount.getSponsor();

            if (sponsor != null) {

                sponsor.setAmountNo(amountNo);

                if (sponsor.getAmount() == null) {
                    sponsor.setAmount(0);
                }

                if (sponsor.getAmount() < 0) {
                    throw new IllegalArgumentException(
                            "지원금은 0원 이상이어야 합니다."
                    );
                }

                if (sponsor.getItemNo() == null
                        || sponsor.getItemNo() <= 0) {

                    throw new IllegalArgumentException(
                            "지원금에 연결할 비용 항목 번호가 없습니다."
                    );
                }

                if (sponsor.getStatus() == null
                        || sponsor.getStatus().isBlank()) {

                    sponsor.setStatus("UNPAID");
                }

                if (sponsor.getPaymentDate() == null) {
                    sponsor.setPaymentDate(
                            new java.util.Date()
                    );
                }

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


            // =====================================================
            // 새 파일 저장
            // =====================================================

            saveNewFiles(
                    amountNo,
                    files,
                    savedFiles
            );

        } catch (IllegalArgumentException e) {

            deleteSavedFiles(savedFiles);
            throw e;

        } catch (IOException e) {

            deleteSavedFiles(savedFiles);

            throw new RuntimeException(
                    "첨부파일 처리 중 오류가 발생했습니다.",
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
    // 9. 항목별 회사 지원금 수정
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int updateItemCompanySupport(
            int itemNo,
            int amountNo,
            int amount) {

        if (itemNo <= 0) {
            throw new IllegalArgumentException(
                    "잘못된 항목 번호입니다."
            );
        }

        if (amountNo <= 0) {
            throw new IllegalArgumentException(
                    "잘못된 비용 신청 번호입니다."
            );
        }

        if (amount < 0) {
            throw new IllegalArgumentException(
                    "회사 지원금은 0원 이상이어야 합니다."
            );
        }

        Amount existingAmount =
                amountDao.selectAmountById(
                        amountNo
                );

        if (existingAmount == null) {
            throw new IllegalArgumentException(
                    "존재하지 않는 비용 신청입니다."
            );
        }

        if ("C".equals(existingAmount.getStatus())) {
            throw new IllegalArgumentException(
                    "취소된 비용 신청은 회사 지원금을 수정할 수 없습니다."
            );
        }

        int result =
                amountDao.updateItemCompanySupport(
                        itemNo,
                        amountNo,
                        amount
                );

        if (result <= 0) {
            throw new IllegalArgumentException(
                    "항목별 회사 지원금 수정에 실패했습니다."
            );
        }

        return result;
    }


    // =========================================================
    // 10. 첨부파일 삭제
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
    // 11. 비용 신청 취소
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int cancelAmount(int amountNo) {

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
    }


    // =========================================================
    // 12. 결재 + 지원금 처리
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateApprovalWithSponsor(
            int amountNo,
            String status,
            int approvedAmount,
            String comment,
            Amount.Sponsor sponsor) {

        if (amountNo <= 0) {
            throw new IllegalArgumentException(
                    "잘못된 비용 신청 번호입니다."
            );
        }

        if (!isValidApprovalStatus(status)) {
            throw new IllegalArgumentException(
                    "잘못된 결재 상태입니다."
            );
        }

        if (approvedAmount < 0) {
            throw new IllegalArgumentException(
                    "승인 금액은 0원 이상이어야 합니다."
            );
        }

        Amount existingAmount =
                amountDao.selectAmountById(
                        amountNo
                );

        if (existingAmount == null) {
            throw new IllegalArgumentException(
                    "존재하지 않는 비용 신청입니다."
            );
        }

        if ("C".equals(existingAmount.getStatus())) {
            throw new IllegalArgumentException(
                    "취소된 비용 신청은 결재할 수 없습니다."
            );
        }


        // =========================================================
        // amount 결재 상태 변경
        // =========================================================

        Amount amount =
                new Amount();

        amount.setAmountNo(amountNo);
        amount.setStatus(status);
        amount.setApprovedAmount(approvedAmount);
        amount.setAmountComment(comment);

        int result =
                amountDao.updateApprovalStatus(
                        amount
                );

        if (result <= 0) {
            throw new IllegalArgumentException(
                    "결재 처리에 실패했습니다."
            );
        }


        // =========================================================
        // 승인일 때만 Sponsor 처리
        // =========================================================

        if ("A".equals(status)
                && sponsor != null) {

            sponsor.setAmountNo(amountNo);

            if (sponsor.getAmount() == null) {
                sponsor.setAmount(0);
            }

            if (sponsor.getAmount() < 0) {
                throw new IllegalArgumentException(
                        "지원금은 0원 이상이어야 합니다."
                );
            }

            if (sponsor.getItemNo() == null
                    || sponsor.getItemNo() <= 0) {

                throw new IllegalArgumentException(
                        "지원금에 연결할 비용 항목 번호가 없습니다."
                );
            }

            if (sponsor.getStatus() == null
                    || sponsor.getStatus().isBlank()) {

                sponsor.setStatus("UNPAID");
            }

            if (sponsor.getPaymentDate() == null) {
                sponsor.setPaymentDate(
                        new java.util.Date()
                );
            }


            /*
             * amount_list.amount_no가 PK이므로
             * 기존 데이터가 있다면 INSERT하면 PK 중복 발생.
             *
             * 따라서 기존 Sponsor 존재 여부 확인 후
             * 없을 때만 INSERT.
             */
            Amount.Sponsor existingSponsor =
                    amountDao.selectSponsorByAmountNo(
                            amountNo
                    );

            if (existingSponsor == null) {

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


    // =========================================================
    // 13. 전체 통계
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


    // =========================================================
    // 14. 새 파일 저장
    // =========================================================

    private void saveNewFiles(
            int amountNo,
            List<MultipartFile> files,
            List<String> savedFiles)
            throws IOException {

        if (files == null
                || files.isEmpty()) {

            return;
        }

        File uploadDir =
                new File(UPLOAD_DIR);

        if (!uploadDir.exists()) {

            if (!uploadDir.mkdirs()
                    && !uploadDir.exists()) {

                throw new IOException(
                        "첨부파일 저장 폴더를 생성할 수 없습니다."
                );
            }
        }


        for (MultipartFile multipartFile :
                files) {

            if (multipartFile == null
                    || multipartFile.isEmpty()) {

                continue;
            }

            // -----------------------------------------------------
            // 파일 크기
            // -----------------------------------------------------

            if (multipartFile.getSize()
                    > MAX_FILE_SIZE) {

                throw new IllegalArgumentException(
                        "이미지 파일은 10MB 이하만 업로드할 수 있습니다."
                );
            }


            // -----------------------------------------------------
            // 원본 파일명
            // -----------------------------------------------------

            String originalFilename =
                    multipartFile.getOriginalFilename();

            if (originalFilename == null
                    || originalFilename.isBlank()) {

                continue;
            }

            // 경로 조작 방지
            originalFilename =
                    new File(
                            originalFilename
                    ).getName();


            // -----------------------------------------------------
            // 확장자 검사
            // -----------------------------------------------------

            if (!isAllowedImage(
                    originalFilename)) {

                throw new IllegalArgumentException(
                        "이미지 파일만 업로드할 수 있습니다. "
                        + "(jpg, jpeg, png, gif, webp)"
                );
            }


            // -----------------------------------------------------
            // 저장 파일명
            // -----------------------------------------------------

            String changeName =
                    UUID.randomUUID()
                            + "_"
                            + originalFilename;

            File destination =
                    new File(
                            uploadDir,
                            changeName
                    );


            // -----------------------------------------------------
            // 실제 파일 저장
            // -----------------------------------------------------

            multipartFile.transferTo(
                    destination
            );

            savedFiles.add(
                    destination.getAbsolutePath()
            );


            // -----------------------------------------------------
            // amount_file VO
            // -----------------------------------------------------

            Amount.File file =
                    new Amount.File();

            file.setAmountNo(amountNo);

            file.setOriginName(
                    originalFilename
            );

            file.setChangeName(
                    changeName
            );

            file.setFilePath(
                    FILE_PATH + changeName
            );

            file.setStatus("Y");


            // -----------------------------------------------------
            // DB 등록
            // -----------------------------------------------------

            int result =
                    amountDao.insertAmountFile(
                            file
                    );

            if (result <= 0) {

                throw new IllegalArgumentException(
                        "첨부파일 DB 등록에 실패했습니다."
                );
            }
        }
    }


    // =========================================================
    // 15. 이미지 확장자 검사
    // =========================================================

    private boolean isAllowedImage(
            String filename) {

        if (filename == null) {
            return false;
        }

        int index =
                filename.lastIndexOf(".");

        if (index < 0
                || index == filename.length() - 1) {

            return false;
        }

        String extension =
                filename
                        .substring(index + 1)
                        .toLowerCase();

        for (String allowed :
                ALLOWED_EXTENSIONS) {

            if (allowed.equals(extension)) {
                return true;
            }
        }

        return false;
    }


    // =========================================================
    // 16. 저장된 실제 파일 삭제
    // =========================================================

    private void deleteSavedFiles(
            List<String> savedFiles) {

        if (savedFiles == null
                || savedFiles.isEmpty()) {

            return;
        }

        for (String path :
                savedFiles) {

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
                // 파일 삭제 실패는 원래 예외를 유지
            }
        }
    }


    // =========================================================
    // 17. Amount 상태 검사
    // =========================================================

    private boolean isValidAmountStatus(
            String status) {

        return "A".equals(status)
                || "C".equals(status)
                || "H".equals(status)
                || "J".equals(status)
                || "R".equals(status);
    }


    // =========================================================
    // 18. 결재 상태 검사
    // =========================================================

    private boolean isValidApprovalStatus(
            String status) {

        return "A".equals(status)
                || "H".equals(status)
                || "J".equals(status);
    }
}

