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
    //
    // amount
    //  ├─ amount
    //  ├─ amount_item
    //  ├─ amount_list
    //  └─ amount_file
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
        // 기본 상태
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

        // ---------------------------------------------------------
        // 신청 금액
        // ---------------------------------------------------------

        if (amount.getRequestedAmount() == null
                || amount.getRequestedAmount() < 0) {

            throw new IllegalArgumentException(
                    "신청 금액이 올바르지 않습니다."
            );
        }

        // ---------------------------------------------------------
        // 워케이션 번호
        // ---------------------------------------------------------

        if (amount.getWorkcationNo() == null
                || amount.getWorkcationNo() <= 0) {

            throw new IllegalArgumentException(
                    "워케이션 번호가 올바르지 않습니다."
            );
        }

        // =========================================================
        // 1. amount INSERT
        // =========================================================

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

        int amountNo =
                amount.getAmountNo();

        // =========================================================
        // 2. amount_item INSERT
        //
        // amount_item.amount
        // = 항목별 회사 지원금
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

                if (item.getItemType() == null
                        || item.getItemType().isBlank()) {

                    throw new IllegalArgumentException(
                            "비용 항목 유형이 없습니다."
                    );
                }

                item.setAmountNo(amountNo);

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
        // 3. amount_list INSERT
        //
        // 주의:
        // amount_list.amount
        // = 지자체 지원금
        //
        // 외부 목록에서 가져온 지원금이 들어오는 경우
        // 해당 데이터를 그대로 저장하고,
        // itemNo를 통해 항목에 연결한다.
        // =========================================================

        if (amount.getSponsorList() != null) {

            for (Amount.Sponsor sponsor :
                    amount.getSponsorList()) {

                if (sponsor == null) {
                    continue;
                }

                sponsor.setAmountNo(amountNo);

                if (sponsor.getAmount() == null) {
                    sponsor.setAmount(0);
                }

                if (sponsor.getAmount() < 0) {

                    throw new IllegalArgumentException(
                            "지원금은 0원 이상이어야 합니다."
                    );
                }

                if (sponsor.getStatus() == null
                        || sponsor.getStatus().isBlank()) {

                    sponsor.setStatus("UNPAID");
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
        }

        // =========================================================
        // 4. amount_file INSERT
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
        // amount_list
        // ---------------------------------------------------------

        List<Amount.Sponsor> sponsorList =
                amountDao.selectSponsorsByAmountNo(
                        amountNo
                );

        amount.setSponsorList(
                sponsorList != null
                        ? sponsorList
                        : new ArrayList<>()
        );

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

        // ---------------------------------------------------------
        // 기존 신청 확인
        // ---------------------------------------------------------

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

        // ---------------------------------------------------------
        // 결재 정보
        // ---------------------------------------------------------

        Amount amount =
                new Amount();

        amount.setAmountNo(amountNo);
        amount.setStatus(status);
        amount.setApprovedAmount(approvedAmount);
        amount.setAmountComment(comment);

        // ---------------------------------------------------------
        // UPDATE
        // ---------------------------------------------------------

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

            // =====================================================
            // 기존 amount 확인
            // =====================================================

            Amount existingAmount =
                    amountDao.selectAmountById(
                            amountNo
                    );

            if (existingAmount == null) {

                throw new IllegalArgumentException(
                        "존재하지 않는 비용 신청입니다."
                );
            }

            // =====================================================
            // 수정 가능 상태
            // =====================================================

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

            // =====================================================
            // 기존 값 유지
            // =====================================================

            if (amount.getStatus() == null
                    || amount.getStatus().isBlank()) {

                amount.setStatus(
                        existingAmount.getStatus()
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

            // =====================================================
            // 1. amount UPDATE
            // =====================================================

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
            // 2. 기존 amount_item 삭제
            // =====================================================

            amountDao.deleteAmountItemsByAmountNo(
                    amountNo
            );

            // =====================================================
            // 3. 새로운 amount_item 등록
            //
            // amount_item.amount
            // = 회사 지원금
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

                    if (item.getItemType() == null
                            || item.getItemType().isBlank()) {

                        throw new IllegalArgumentException(
                                "비용 항목 유형이 없습니다."
                        );
                    }

                    item.setAmountNo(amountNo);

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
            // 4. amount_list 처리
            //
            // ★ 여기서는 지자체 지원금 데이터를 삭제하지 않는다.
            //
            // 지자체 지원금은 외부 목록에서 가져오는 데이터이므로
            // 비용 신청 수정 과정에서 기존 데이터를
            // DELETE → INSERT 하면 안 된다.
            //
            // 나중에 별도의 "지자체 지원금 적용" 기능에서
            // itemNo 연결만 처리한다.
            // =====================================================

            // amount_list는 여기서 건드리지 않음.


            // =====================================================
            // 5. 새 파일 처리
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
    //
    // amount_item.amount
    // = 항목별 회사 지원금
    //
    // amount_list.amount
    // = 지자체 지원금
    // → 여기서는 수정하지 않음
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

        // =========================================================
        // 비용 신청 존재 여부 확인
        // =========================================================

        Amount existingAmount =
                amountDao.selectAmountById(
                        amountNo
                );

        if (existingAmount == null) {

            throw new IllegalArgumentException(
                    "존재하지 않는 비용 신청입니다."
            );
        }

        // =========================================================
        // 승인/취소 상태 확인
        // =========================================================

        if ("C".equals(existingAmount.getStatus())) {

            throw new IllegalArgumentException(
                    "취소된 비용 신청은 회사 지원금을 수정할 수 없습니다."
            );
        }

        // =========================================================
        // amount_item.amount UPDATE
        //
        // WHERE amount_no까지 확인하여
        // 다른 비용 신청의 item을 수정하지 못하도록 한다.
        // =========================================================

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
    // 12. 결재 + 지원금
    //
    // 현재 구조 유지
    //
    // 주의:
    // 지자체 지원금이 외부 목록에서 들어오는 최종 구조에서는
    // 이 메서드에서 직접 amount_list를 생성하는 부분을
    // 추후 별도의 "지원금 적용" 로직으로 분리하는 것이 좋다.
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

        // =========================================================
        // 기존 amount 확인
        // =========================================================

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
        // amount 결재 처리
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
        // 승인(A)인 경우
        //
        // 현재 기존 기능과의 호환을 위해 sponsor 등록은 유지.
        //
        // 단, 향후 외부 지자체 지원금 목록을 사용하는 구조가
        // 완성되면 이 부분은 별도의 적용 기능으로 분리한다.
        // =========================================================

        if ("A".equals(status)) {

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

                if (sponsor.getStatus() == null
                        || sponsor.getStatus().isBlank()) {

                    sponsor.setStatus("UNPAID");
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
                    "정산 통계 조회 중 오류가 발생했습니다()",
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

            originalFilename =
                    new File(
                            originalFilename
                    ).getName();

            // -----------------------------------------------------
            // 확장자 검사
            // -----------------------------------------------------

            if (!isAllowedImage(
                    originalFilename
            )) {

                throw new IllegalArgumentException(
                        "이미지 파일만 업로드할 수 있습니다. "
                        + "(jpg, jpeg, png, gif, webp)"
                );
            }

            // -----------------------------------------------------
            // UUID 파일명
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
            // Amount.File 생성
            // -----------------------------------------------------

            Amount.File file =
                    new Amount.File();

            file.setAmountNo(amountNo);
            file.setOriginName(originalFilename);
            file.setChangeName(changeName);
            file.setFilePath(
                    FILE_PATH + changeName
            );
            file.setStatus("Y");

            // -----------------------------------------------------
            // DB INSERT
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

                // 기존 예외 유지
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
    //
    // A : 승인
    // H : 보류
    // J : 반려
    // =========================================================

    private boolean isValidApprovalStatus(
            String status) {

        return "A".equals(status)
                || "H".equals(status)
                || "J".equals(status);
    }
}

