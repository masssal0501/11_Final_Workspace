package com.kh.workflow.amount.model.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.amount.dao.AmountDao;
import com.kh.workflow.amount.model.vo.Amount;
import com.kh.workflow.amount.model.vo.AmountFile;
import com.kh.workflow.amount.model.vo.AmountItem;
import com.kh.workflow.amount.model.vo.SupportList;
import com.kh.workflow.common.model.vo.PageInfo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AmountServiceImpl implements AmountService {

    private final AmountDao amountDao;


    // =========================================================
    // 파일 설정
    // =========================================================

    // 운영 환경에서는 APP_UPLOAD_RECEIPTS_DIR 환경변수로 실제 저장 경로를 지정한다.
    @Value("${app.upload.receipts-dir:C:/upload/receipts/}")
    private String UPLOAD_DIR;

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
        // 등록일시 및 신청일시
        // ---------------------------------------------------------

        if (amount.getCreatedAt() == null) {
            amount.setCreatedAt(LocalDateTime.now());
        }

        if (amount.getRequestedAt() == null) {
            amount.setRequestedAt(LocalDateTime.now());
        }


        // ---------------------------------------------------------
        // 양방향 연관관계 설정
        // ---------------------------------------------------------

        if (amount.getItemList() != null) {

            for (AmountItem item :
                    amount.getItemList()) {

                if (item != null) {
                    item.setAmount(amount);
                }
            }
        }

        if (amount.getSupportList() != null) {

            for (SupportList support :
                    amount.getSupportList()) {

                if (support != null) {
                    support.setAmount(amount);
                }
            }
        }

        if (amount.getAmountFile() != null) {

            for (AmountFile file :
                    amount.getAmountFile()) {

                if (file != null) {
                    file.setAmount(amount);
                }
            }
        }


        // ---------------------------------------------------------
        // JPA Cascade.ALL을 이용한 일괄 저장
        // ---------------------------------------------------------

        amountDao.save(amount);

        return 1;
    }


    // =========================================================
    // 4. 비용 상세 조회
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Amount selectAmountById(int amountNo) {

        if (amountNo <= 0) {
            return null;
        }

        Amount amount =
                amountDao.findById(amountNo)
                        .orElse(null);

        if (amount == null) {
            return null;
        }

        /*
         * JPA 연관관계를 통해 하위 데이터를 조회한다.
         *
         * Amount
         *  ├── itemList
         *  ├── supportList
         *  └── amountFile
         */

        amount.getItemList().size();
        amount.getSupportList().size();
        amount.getAmountFile().size();

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
                amountDao.findById(amountNo)
                        .orElse(null);

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

        existingAmount.setStatus(status);
        existingAmount.setApprovedAmount(approvedAmount);
        existingAmount.setAmountComment(comment);
        existingAmount.setApprovedAt(
                LocalDateTime.now()
        );

        amountDao.save(existingAmount);

        return 1;
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
                    amountDao.findById(amountNo)
                            .orElse(null);

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
            // 기존 Entity 값에 수정 내용 반영
            // -----------------------------------------------------

            existingAmount.setRequestedAmount(
                    amount.getRequestedAmount()
            );

            existingAmount.setAmountComment(
                    amount.getAmountComment()
            );

            existingAmount.setWorkcationNo(
                    amount.getWorkcationNo()
            );

            existingAmount.setStatus(
                    amount.getStatus()
            );

            existingAmount.setUpdatedAt(
                    LocalDateTime.now()
            );


            // =====================================================
            // 기존 amount_item 삭제
            // =====================================================

            existingAmount.getItemList().clear();


            // =====================================================
            // amount_item 재등록
            // =====================================================

            if (amount.getItemList() != null) {

                for (AmountItem item :
                        amount.getItemList()) {

                    if (item == null) {
                        continue;
                    }

                    if (item.getItemAmount() == null
                            || item.getItemAmount() < 0) {

                        throw new IllegalArgumentException(
                                "비용 항목 금액이 올바르지 않습니다."
                        );
                    }

                    if (item.getItemType() == null
                            || item.getItemType().isBlank()) {

                        throw new IllegalArgumentException(
                                "비용 항목 유형이 없습니다."
                        );
                    }

                    item.setAmount(existingAmount);

                    if (item.getItemDate() == null) {
                        item.setItemDate(
                                LocalDateTime.now()
                        );
                    }

                    existingAmount.addItem(item);
                }
            }


            // =====================================================
            // 기존 support_list 삭제
            // =====================================================

            existingAmount.getSupportList().clear();


            // =====================================================
            // support_list 재등록
            // =====================================================

            if (amount.getSupportList() != null) {

                for (SupportList support :
                        amount.getSupportList()) {

                    if (support == null) {
                        continue;
                    }

                    support.setAmount(
                            existingAmount
                    );

                    existingAmount.addSupport(
                            support
                    );
                }
            }


            // =====================================================
            // 새 파일 저장
            // =====================================================

            saveNewFiles(
                    existingAmount,
                    files,
                    savedFiles
            );


            // =====================================================
            // 저장
            // =====================================================

            amountDao.save(existingAmount);

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
                    "비용 신청 수정 중 오류가 발생했습니다",
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
                amountDao.findById(amountNo)
                        .orElse(null);

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

        amount.setStatus("C");
        amount.setUpdatedAt(
                LocalDateTime.now()
        );

        amountDao.save(amount);

        return 1;
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
            SupportList sponsor) {

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

        Amount amount =
                amountDao.findById(amountNo)
                        .orElse(null);

        if (amount == null) {
            throw new IllegalArgumentException(
                    "존재하지 않는 비용 신청입니다."
            );
        }

        if ("C".equals(amount.getStatus())) {
            throw new IllegalArgumentException(
                    "취소된 비용 신청은 결재할 수 없습니다."
            );
        }


        // =========================================================
        // amount 결재 상태 변경
        // =========================================================

        amount.setStatus(status);
        amount.setApprovedAmount(approvedAmount);
        amount.setAmountComment(comment);
        amount.setApprovedAt(
                LocalDateTime.now()
        );


        // =========================================================
        // 승인일 때만 SupportList 처리
        // =========================================================

        if ("A".equals(status)
                && sponsor != null) {

            sponsor.setAmount(amount);

            if (sponsor.getRequestAmount() == null
                    || sponsor.getRequestAmount() < 0) {

                throw new IllegalArgumentException(
                        "지원금 신청 금액이 올바르지 않습니다."
                );
            }

            if (sponsor.getApprovedAmount() == null
                    || sponsor.getApprovedAmount() < 0) {

                throw new IllegalArgumentException(
                        "지원금 승인 금액이 올바르지 않습니다."
                );
            }

            if (sponsor.getStatus() == null
                    || sponsor.getStatus().isBlank()) {

                sponsor.setStatus("UNPAID");
            }

            amount.getSupportList().clear();
            amount.addSupport(sponsor);
        }

        amountDao.save(amount);
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
            Amount amount,
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
            // AmountFile Entity
            // -----------------------------------------------------

            AmountFile amountFile =
                    new AmountFile();

            amountFile.setAmount(
                    amount
            );

            amountFile.setOriginName(
                    originalFilename
            );

            amountFile.setChangeName(
                    changeName
            );

            amountFile.setFilePath(
                    FILE_PATH + changeName
            );

            amountFile.setStatus("Y");

            amount.addAmountFile(
                    amountFile
            );
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


    @Override
    public List<Amount> selectAmountList() {
        return amountDao.findAll();
    }

    @Override
    public Amount selectAmountById(Integer amountNo) {
        return amountDao.findById(amountNo)
                .orElseThrow(() -> new IllegalArgumentException(
                        "해당 비용 신청 내역이 존재하지 않습니다. ID: " + amountNo
                ));
    }


	@Override
	public int insertAmount(Amount amount, MultipartFile[] files) {
		// TODO Auto-generated method stub
		return 0;
	}


	@Override
	public Page<Amount> selectAmountList(Pageable pageable) {
		return amountDao.findAllByOrderByCreatedAtDescAmountNoDesc(pageable);
	}


	@Override
	public Page<Amount> selectAmountListByWorkcationNo(int workcationNo, Pageable pageable) {
		return amountDao.findByWorkcationNoOrderByCreatedAtDescAmountNoDesc(workcationNo, pageable);
	}
}
