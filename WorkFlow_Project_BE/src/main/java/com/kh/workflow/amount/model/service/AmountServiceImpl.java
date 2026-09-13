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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.amount.dao.AmountDao;
import com.kh.workflow.amount.model.vo.Amount;
import com.kh.workflow.amount.model.vo.AmountFile;
import com.kh.workflow.amount.model.vo.AmountItem;
import com.kh.workflow.amount.model.vo.SupportList;
import com.kh.workflow.common.model.vo.PageInfo;
import com.kh.workflow.employee.model.dao.EmployeeDao;
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.workcation.model.dao.WorkcationDao;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AmountServiceImpl implements AmountService {

    private final AmountDao amountDao;
    private final EmployeeDao employeeDao;
    private final WorkcationDao workcationDao;


    // =========================================================
    // 파일 설정
    // =========================================================

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
    @Transactional(readOnly = true)
    public List<Amount> selectAmountList(PageInfo pi) {

        if (pi == null) {
            return new ArrayList<>();
        }

        List<Amount> list =
                amountDao.selectAmountList(pi);

        if (list == null) {
            return new ArrayList<>();
        }

        /*
         * 관리자 목록에서도
         *
         * amount_item
         * amount_list
         * amount_file
         *
         * 데이터를 같이 조회한다.
         */
        for (Amount amount : list) {

            initializeChildData(amount);
        }

        return list;
    }


    // =========================================================
    // 3. 비용 신청 등록
    // =========================================================
    //
    // 신청자가 입력하는 것은
    //
    // - 신청금액
    // - 비용항목
    // - 영수증
    //
    // 뿐이다.
    //
    // 지자체 지원금(amount_list)은
    // 신청 단계에서 절대 저장하지 않는다.
    //
    // workcationNo 역시 Form에서 받지 않고
    // JWT → Employee → WorkcationInfo로 서버가 결정한다.
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
        // 로그인 사용자 확인
        // ---------------------------------------------------------

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new IllegalArgumentException(
                    "로그인 사용자 정보를 확인할 수 없습니다."
            );
        }


        String empId =
                authentication.getName();


        if (empId == null
                || empId.isBlank()) {

            throw new IllegalArgumentException(
                    "로그인 사용자 사원 ID를 확인할 수 없습니다."
            );
        }


        // ---------------------------------------------------------
        // empId → Employee
        // ---------------------------------------------------------

        Employee employee =
                employeeDao.findByEmpId(empId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "로그인한 사원 정보를 찾을 수 없습니다."
                                )
                        );


        Integer empNo =
                employee.getEmpNo();


        if (empNo == null
                || empNo <= 0) {

            throw new IllegalArgumentException(
                    "로그인한 사원의 사원번호가 올바르지 않습니다."
            );
        }


        // ---------------------------------------------------------
        // 해당 직원의 워케이션 조회
        // ---------------------------------------------------------

        Page<WorkcationInfo> workcationPage =
                workcationDao.findByEmployeeEmpNo(
                        empNo,
                        Pageable.unpaged()
                );


        List<WorkcationInfo> workcationList =
                workcationPage.getContent();


        if (workcationList == null
                || workcationList.isEmpty()) {

            throw new IllegalArgumentException(
                    "등록된 워케이션 정보가 없습니다."
            );
        }


        // ---------------------------------------------------------
        // 현재 신청 가능한 워케이션 찾기
        //
        // 승인 상태 A
        // 시작일 <= 현재
        // 종료일 >= 현재
        // ---------------------------------------------------------

        LocalDateTime now =
                LocalDateTime.now();


        WorkcationInfo targetWorkcation =
                workcationList.stream()
                        .filter(w ->
                                w != null
                                && "A".equals(
                                        w.getApproverState()
                                )
                        )
                        .filter(w ->
                                w.getStartAt() != null
                                && w.getEndAt() != null
                        )
                        .filter(w ->
                                !now.isBefore(
                                        w.getStartAt()
                                )
                                && !now.isAfter(
                                        w.getEndAt()
                                )
                        )
                        .findFirst()
                        .orElse(null);


        if (targetWorkcation == null) {

            throw new IllegalArgumentException(
                    "현재 진행 중인 승인된 워케이션이 없습니다."
            );
        }


        // ---------------------------------------------------------
        // 서버에서 workcationNo 설정
        // ---------------------------------------------------------

        amount.setWorkcationNo(
                targetWorkcation.getWorkcationNo()
        );


        // ---------------------------------------------------------
        // 상태
        // ---------------------------------------------------------

        amount.setStatus("R");


        // ---------------------------------------------------------
        // 신청금액
        // ---------------------------------------------------------

        if (amount.getRequestedAmount() == null
                || amount.getRequestedAmount() <= 0) {

            throw new IllegalArgumentException(
                    "신청 금액은 0원보다 커야 합니다."
            );
        }


        // ---------------------------------------------------------
        // 비용 항목
        // ---------------------------------------------------------

        if (amount.getItemList() == null
                || amount.getItemList().isEmpty()) {

            throw new IllegalArgumentException(
                    "비용 항목을 최소 1개 이상 입력해주세요."
            );
        }


        for (AmountItem item :
                amount.getItemList()) {

            if (item == null) {
                continue;
            }


            if (item.getItemType() == null
                    || item.getItemType().isBlank()) {

                throw new IllegalArgumentException(
                        "비용 항목 유형이 없습니다."
                );
            }


            if (item.getItemAmount() == null
                    || item.getItemAmount() <= 0) {

                throw new IllegalArgumentException(
                        "비용 항목 금액이 올바르지 않습니다."
                );
            }


         // insertAmount(Amount amount) 안
            if (item.getItemDate() == null) {
                item.setItemDate(now);   // .toLocalDate() 제거, 원래대로
            }


            /*
             * 신청자가 보낸 itemNo는 사용하지 않는다.
             * DB에서 새 번호가 생성되도록 한다.
             */
            item.setItemNo(null);

            item.setAmount(amount);
        }


        // ---------------------------------------------------------
        // 신청일시
        // ---------------------------------------------------------

        if (amount.getCreatedAt() == null) {

            amount.setCreatedAt(now);
        }


        if (amount.getRequestedAt() == null) {

            amount.setRequestedAt(now);
        }


        // ---------------------------------------------------------
        // 승인 정보 초기화
        // ---------------------------------------------------------

        amount.setApprovedAmount(0);
        amount.setApprovedAt(null);


        // =========================================================
        // ★ 중요
        // 지자체 지원금은 신청 단계에서 저장하지 않는다.
        // =========================================================

        amount.setSupportList(
                new ArrayList<>()
        );


        // ---------------------------------------------------------
        // 파일
        // ---------------------------------------------------------

        if (amount.getAmountFile() == null) {

            amount.setAmountFile(
                    new ArrayList<>()
            );

        } else {

            for (AmountFile file :
                    amount.getAmountFile()) {

                if (file != null) {
                    file.setAmount(amount);
                }
            }
        }


        // ---------------------------------------------------------
        // 저장
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
         * LAZY 연관관계를 트랜잭션 안에서 초기화한다.
         *
         * amount_list
         *       ↓
         * supportList
         *
         * DB의 지자체지원금이 여기서 조회된다.
         */
        initializeChildData(amount);


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
    @Transactional(readOnly = true)
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


        if (list == null) {
            return new ArrayList<>();
        }


        for (Amount amount : list) {

            initializeChildData(amount);
        }


        return list;
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
        // 보류 / 반려 사유 필수
        // ---------------------------------------------------------

        if (("H".equals(status)
                || "J".equals(status))
                && (comment == null
                || comment.isBlank())) {

            throw new IllegalArgumentException(
                    "보류 또는 반려 처리 시 사유를 입력해주세요."
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


        if ("C".equals(
                existingAmount.getStatus())) {

            throw new IllegalArgumentException(
                    "취소된 비용 신청은 결재할 수 없습니다."
            );
        }


        existingAmount.setStatus(status);

        existingAmount.setApprovedAmount(
                approvedAmount
        );

        existingAmount.setAmountComment(
                comment
        );


        if ("A".equals(status)) {

            existingAmount.setApprovedAt(
                    LocalDateTime.now()
            );
        }


        existingAmount.setUpdatedAt(
                LocalDateTime.now()
        );


        amountDao.save(existingAmount);

        return 1;
    }


    // =========================================================
    // 8. 비용 신청 수정
    // =========================================================
    //
    // ★ 지자체지원금은 수정하지 않는다.
    //
    // 기존 amount_list는 DB에 있는 그대로 유지한다.
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateAmount(
            Amount amount,
            List<MultipartFile> files,
            Employee loginEmployee) {

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
            // 기존 데이터
            // -----------------------------------------------------

            Amount existingAmount =
                    amountDao.findById(amountNo)
                            .orElse(null);


            if (existingAmount == null) {

                throw new IllegalArgumentException(
                        "존재하지 않는 비용 신청입니다."
                );
            }


            // -----------------------------------------------------
            // BUG-N03: 소유권 검증 - STAFF/MANAGER는 본인이 신청한 정산만 수정 가능,
            // ADMIN은 전체 수정 가능. amount는 workcationNo만 갖고 있어(연관관계 없음)
            // WorkcationInfo를 통해 신청자(empNo)를 조회한다.
            // -----------------------------------------------------

            if (loginEmployee != null
                    && !"ADMIN".equals(loginEmployee.getAuthCode())) {

                WorkcationInfo workcation =
                        workcationDao.findById(
                                existingAmount.getWorkcationNo()
                        ).orElse(null);

                boolean isOwner =
                        workcation != null
                        && workcation.getEmployee() != null
                        && workcation.getEmployee().getEmpNo()
                                .equals(loginEmployee.getEmpNo());

                if (!isOwner) {
                    throw new AccessDeniedException(
                            "본인이 신청한 정산만 수정할 수 있습니다."
                    );
                }
            }

            if ("A".equals(
                    existingAmount.getStatus())) {

                throw new IllegalArgumentException(
                        "이미 승인된 비용 신청은 수정할 수 없습니다."
                );
            }


            if ("C".equals(
                    existingAmount.getStatus())) {

                throw new IllegalArgumentException(
                        "취소된 비용 신청은 수정할 수 없습니다."
                );
            }


            // -----------------------------------------------------
            // 신청금액
            // -----------------------------------------------------

            if (amount.getRequestedAmount() == null
                    || amount.getRequestedAmount() <= 0) {

                throw new IllegalArgumentException(
                        "신청 금액은 0원보다 커야 합니다."
                );
            }


            // -----------------------------------------------------
            // 비용 항목
            // -----------------------------------------------------

            if (amount.getItemList() == null
                    || amount.getItemList().isEmpty()) {

                throw new IllegalArgumentException(
                        "비용 항목을 최소 1개 이상 입력해주세요."
                );
            }


            // -----------------------------------------------------
            // Amount 수정
            // -----------------------------------------------------

            existingAmount.setRequestedAmount(
                    amount.getRequestedAmount()
            );

            existingAmount.setAmountComment(
                    amount.getAmountComment()
            );

            existingAmount.setUpdatedAt(
                    LocalDateTime.now()
            );


            /*
             * 상태와 workcationNo는
             * 기존 DB 값을 유지한다.
             */
            existingAmount.setStatus(
                    existingAmount.getStatus()
            );

            existingAmount.setWorkcationNo(
                    existingAmount.getWorkcationNo()
            );


            // =====================================================
            // 기존 amount_item 삭제
            // =====================================================

            existingAmount.getItemList().clear();


            // =====================================================
            // amount_item 재등록
            // =====================================================

            for (AmountItem item :
                    amount.getItemList()) {

                if (item == null) {
                    continue;
                }


                if (item.getItemType() == null
                        || item.getItemType().isBlank()) {

                    throw new IllegalArgumentException(
                            "비용 항목 유형이 없습니다."
                    );
                }


                if (item.getItemAmount() == null
                        || item.getItemAmount() <= 0) {

                    throw new IllegalArgumentException(
                            "비용 항목 금액이 올바르지 않습니다."
                    );
                }


             // updateAmount(...) 안
                if (item.getItemDate() == null) {
                    item.setItemDate(LocalDateTime.now());   // .toLocalDate() 제거, 원래대로
                }


                // 새 항목으로 저장
                item.setItemNo(null);

                item.setAmount(
                        existingAmount
                );


                existingAmount.addItem(
                        item
                );
            }


            // =====================================================
            // ★ supportList는 절대 수정하지 않는다.
            // =====================================================
            //
            // 기존 코드의
            //
            // existingAmount.getSupportList().clear();
            //
            // 삭제
            //
            // amount_list의 DB 데이터 유지
            // =====================================================


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

            amountDao.save(
                    existingAmount
            );


        } catch (IllegalArgumentException e) {

            deleteSavedFiles(
                    savedFiles
            );

            throw e;

        } catch (AccessDeniedException e) {

            // BUG-N03: Spring Security의 ExceptionTranslationFilter가 AccessDeniedException
            // 타입 자체를 잡아 403으로 변환하므로, 아래 catch(Exception)에서 RuntimeException으로
            // 감싸버리면 403이 아닌 500으로 응답이 나가게 된다. 그대로 다시 던진다.
            deleteSavedFiles(savedFiles);
            throw e;

        } catch (IOException e) {

            deleteSavedFiles(
                    savedFiles
            );

            throw new RuntimeException(
                    "첨부파일 처리 중 오류가 발생했습니다.",
                    e
            );


        } catch (Exception e) {

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
    public int cancelAmount(
            int amountNo) {

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
    // 12. 관리자 결재 + 지자체 지원금 처리
    // =========================================================
    //
    // 이 메서드에서만 SupportList를 등록/수정한다.
    //
    // 신청 Form과 완전히 분리된 관리자 기능이다.
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateApprovalWithSponsor(
            int amountNo,
            String status,
            int approvedAmount,
            String comment,
            SupportList sponsor,
            List<Map<String, Object>> itemSupports) {

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
        // H / J 사유 필수
        // ---------------------------------------------------------

        if (("H".equals(status)
                || "J".equals(status))
                && (comment == null
                || comment.isBlank())) {

            throw new IllegalArgumentException(
                    "보류 또는 반려 처리 시 사유를 입력해주세요."
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


        if ("C".equals(
                amount.getStatus())) {

            throw new IllegalArgumentException(
                    "취소된 비용 신청은 결재할 수 없습니다."
            );
        }


        // ---------------------------------------------------------
        // Amount 결재 정보
        // ---------------------------------------------------------

        amount.setStatus(status);

        amount.setApprovedAmount(
                approvedAmount
        );

        amount.setAmountComment(
                comment
        );


        if ("A".equals(status)) {

            amount.setApprovedAt(
                    LocalDateTime.now()
            );
        }


        amount.setUpdatedAt(
                LocalDateTime.now()
        );


        // =========================================================
        // 승인 + 지자체 지원금
        // =========================================================

        if ("A".equals(status)
                && sponsor != null) {

            validateSupportList(sponsor);


            sponsor.setAmount(amount);


            /*
             * 관리자가 기존 지자체 지원금을 수정하는 경우
             * 기존 데이터를 제거하고 새 값으로 저장한다.
             *
             * 신청 Form에서는 절대 호출되지 않는다.
             */
            amount.getSupportList().clear();


            amount.addSupport(
                    sponsor
            );
        }


        // ---------------------------------------------------------
        // 저장
        // ---------------------------------------------------------

        amountDao.save(amount);


        // =========================================================
        // ★ 승인 시 항목별 회사 지원금(amount_item.item_approved_amount) 반영
        //
        // 통계(부서별/월별/항목별)가 ai.itemApprovedAmount를 집계하는데
        // 이 값이 채워지지 않으면 승인해도 통계가 0으로만 나오는 원인이 된다.
        // =========================================================

        if ("A".equals(status)
                && itemSupports != null
                && !itemSupports.isEmpty()) {

            for (Map<String, Object> row : itemSupports) {

                if (row == null) {
                    continue;
                }

                Object itemNoObj = row.get("itemNo");
                Object amountObj = row.get("amount");

                if (itemNoObj == null) {
                    continue;
                }

                int itemNo;
                int itemAmount;

                try {

                    itemNo = Integer.parseInt(
                            itemNoObj.toString()
                    );

                    itemAmount = amountObj != null
                            ? Integer.parseInt(amountObj.toString())
                            : 0;

                } catch (NumberFormatException e) {

                    continue;
                }

                if (itemAmount < 0) {

                    throw new IllegalArgumentException(
                            "항목별 회사 지원금은 0원 이상이어야 합니다."
                    );
                }

                amountDao.updateItemCompanySupport(
                        itemNo,
                        amountNo,
                        itemAmount
                );
            }
        }
    }
 // =========================================================
 // 13. 전체 통계
 // =========================================================

 @Override
 public Map<String, Object> getFullStatistics() {

     try {

         Map<String, Object> result = new HashMap<>();

         // -----------------------------------------------------
         // 1. 요약 통계
         // -----------------------------------------------------

         result.put(
                 "summary",
                 amountDao.getStatisticsSummary()
         );


         // -----------------------------------------------------
         // 2. 부서별 통계
         // -----------------------------------------------------

         List<Object[]> deptRows =
                 amountDao.getDeptStatistics();

         List<Map<String, Object>> deptList =
                 new ArrayList<>();

         for (Object[] row : deptRows) {

             Map<String, Object> map = new HashMap<>();

             map.put("departmentName", row[0]);
             map.put("approvedAmount", row[1]);

             deptList.add(map);
         }

         result.put("deptStatistics", deptList);


         // -----------------------------------------------------
         // 3. 월별 통계
         // -----------------------------------------------------

         List<Object[]> monthRows =
                 amountDao.getMonthlyStatistics();

         List<Map<String, Object>> monthList =
                 new ArrayList<>();

         for (Object[] row : monthRows) {

             Map<String, Object> map = new HashMap<>();

             map.put(
                     "month",
                     row[0] != null ? row[0].toString() : ""
             );
             map.put("approvedAmount", row[1]);

             monthList.add(map);
         }

         result.put("monthlyStatistics", monthList);


         // -----------------------------------------------------
         // 4. 항목별 통계
         // -----------------------------------------------------

         List<Object[]> itemRows =
                 amountDao.getItemStatistics();

         List<Map<String, Object>> itemList =
                 new ArrayList<>();

         for (Object[] row : itemRows) {

             Map<String, Object> map = new HashMap<>();

             map.put("itemType", row[0]);
             map.put("itemCount", row[1]);
             map.put("requestedAmount", row[2]);
             map.put("approvedAmount", row[3]);

             itemList.add(map);
         }

         result.put("itemStatistics", itemList);


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
            // 확장자
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
            // 실제 저장
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

                // 원래 예외를 유지한다.
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


    // =========================================================
    // 19. 전체 Amount 목록
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Amount> selectAmountList() {

        List<Amount> list =
                amountDao.findAll();


        for (Amount amount :
                list) {

            initializeChildData(amount);
        }


        return list;
    }


    // =========================================================
    // 20. 비용 상세 조회 Integer 버전
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Amount selectAmountById(
            Integer amountNo) {

        if (amountNo == null
                || amountNo <= 0) {

            throw new IllegalArgumentException(
                    "잘못된 비용 신청 번호입니다."
            );
        }


        Amount amount =
                amountDao.findById(amountNo)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "해당 비용 신청 내역이 존재하지 않습니다. ID: "
                                        + amountNo
                                )
                        );


        initializeChildData(amount);


        return amount;
    }


    // =========================================================
    // 21. 비용 신청 등록 + 파일
    // =========================================================
    //
    // Controller에서 이 overload를 사용하는 경우를 대비한다.
    //
    // 지자체 지원금은 여기에서도 저장하지 않는다.
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int insertAmount(
            Amount amount,
            MultipartFile[] files) {

        List<String> savedFiles =
                new ArrayList<>();


        try {

            // -----------------------------------------------------
            // 파일 먼저 Entity에 연결
            // -----------------------------------------------------

            amount.setAmountFile(
                    new ArrayList<>()
            );


            if (files != null) {

                List<MultipartFile> fileList =
                        new ArrayList<>();


                for (MultipartFile file :
                        files) {

                    if (file != null
                            && !file.isEmpty()) {

                        fileList.add(file);
                    }
                }


                if (!fileList.isEmpty()) {

                    /*
                     * insertAmount(Amount) 내부에서
                     * 실제 파일 Entity를 처리할 수 있도록
                     * 직접 저장한다.
                     */
                    saveNewFiles(
                            amount,
                            fileList,
                            savedFiles
                    );
                }
            }


            return insertAmount(amount);


        } catch (IllegalArgumentException e) {

            deleteSavedFiles(
                    savedFiles
            );

            throw e;


        } catch (IOException e) {

            deleteSavedFiles(
                    savedFiles
            );

            throw new RuntimeException(
                    "첨부파일 처리 중 오류가 발생했습니다.",
                    e
            );


        } catch (Exception e) {

            deleteSavedFiles(
                    savedFiles
            );

            throw new RuntimeException(
                    "비용 신청 등록 중 오류가 발생했습니다.",
                    e
            );
        }
    }


    // =========================================================
    // 22. 관리자 전체 목록 Pageable
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<Amount> selectAmountList(
            Pageable pageable) {

        Page<Amount> page =
                amountDao
                        .findAllByOrderByCreatedAtDescAmountNoDesc(
                                pageable
                        );


        /*
         * 페이지 안의 각 Amount에 대해
         * amount_list까지 초기화한다.
         */
        for (Amount amount :
                page.getContent()) {

            initializeChildData(amount);
        }


        return page;
    }


    // =========================================================
    // 23. 워케이션별 Pageable 목록
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<Amount> selectAmountListByWorkcationNo(
            int workcationNo,
            Pageable pageable) {

        Page<Amount> page =
                amountDao
                        .findByWorkcationNoOrderByCreatedAtDescAmountNoDesc(
                                workcationNo,
                                pageable
                        );


        for (Amount amount :
                page.getContent()) {

            initializeChildData(amount);
        }


        return page;
    }


    // =========================================================
    // 24. 로그인 사용자 비용 신청 목록
    // =========================================================
    //
    // JWT
    //  ↓
    // empId
    //  ↓
    // Employee
    //  ↓
    // empNo
    //  ↓
    // WorkcationInfo
    //  ↓
    // workcationNo 목록
    //  ↓
    // Amount
    //
    // URL에 workcationNo를 받지 않는다.
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Page<Amount> selectMyAmountList(
            Pageable pageable,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new IllegalArgumentException(
                    "로그인 사용자 정보를 확인할 수 없습니다."
            );
        }


        // ---------------------------------------------------------
        // JWT empId
        // ---------------------------------------------------------

        String empId =
                authentication.getName();


        if (empId == null
                || empId.isBlank()) {

            throw new IllegalArgumentException(
                    "로그인 사용자 사원 ID를 확인할 수 없습니다."
            );
        }


        // ---------------------------------------------------------
        // empId → Employee
        // ---------------------------------------------------------

        Employee employee =
                employeeDao.findByEmpId(empId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "로그인한 사원 정보를 찾을 수 없습니다."
                                )
                        );


        Integer empNo =
                employee.getEmpNo();


        if (empNo == null
                || empNo <= 0) {

            throw new IllegalArgumentException(
                    "로그인한 사원의 사원번호가 올바르지 않습니다."
            );
        }


        // ---------------------------------------------------------
        // 직원의 워케이션
        // ---------------------------------------------------------

        Page<WorkcationInfo> workcationPage =
                workcationDao.findByEmployeeEmpNo(
                        empNo,
                        Pageable.unpaged()
                );


        List<Integer> workcationNos =
                workcationPage.getContent()
                        .stream()
                        .filter(w -> w != null)
                        .map(WorkcationInfo::getWorkcationNo)
                        .filter(no ->
                                no != null
                                && no > 0
                        )
                        .toList();


        // ---------------------------------------------------------
        // 워케이션이 없으면 빈 페이지
        // ---------------------------------------------------------

        if (workcationNos.isEmpty()) {

            return Page.empty(pageable);
        }


        // ---------------------------------------------------------
        // 로그인 사용자의 Amount
        // ---------------------------------------------------------

        Page<Amount> page =
                amountDao
                        .findByWorkcationNoInOrderByCreatedAtDescAmountNoDesc(
                                workcationNos,
                                pageable
                        );


        // ---------------------------------------------------------
        // ★ amount_list 포함 하위 데이터 초기화
        // ---------------------------------------------------------

        for (Amount amount :
                page.getContent()) {

            initializeChildData(amount);
        }


        return page;
    }


    // =========================================================
    // 25. Amount 하위 데이터 조회
    // =========================================================
    //
    // ★ 핵심 메서드
    //
    // DB:
    //
    // amount
    //   ↓
    // amount_item
    // amount_list
    // amount_file
    //
    // 를 JPA LAZY 관계를 통해 조회한다.
    //
    // 지자체지원금은 여기서 DB에서 가져온다.
    // =========================================================

    private void initializeChildData(
            Amount amount) {

        if (amount == null) {
            return;
        }


        /*
         * amount_item
         */
        if (amount.getItemList() != null) {

            amount.getItemList().size();
        }


        /*
         * amount_list
         *
         * ★ 지자체 지원금 DB 조회
         */
        if (amount.getSupportList() != null) {

            amount.getSupportList().size();
        }


        /*
         * amount_file
         */
        if (amount.getAmountFile() != null) {

            amount.getAmountFile().size();
        }
    }


    // =========================================================
    // 26. SupportList 관리자 입력값 검증
    // =========================================================

    private void validateSupportList(
            SupportList sponsor) {

        // ---------------------------------------------------------
        // 기관명
        // ---------------------------------------------------------

        if (sponsor.getSponsorName() == null
                || sponsor.getSponsorName().isBlank()) {

            throw new IllegalArgumentException(
                    "지원 기관명을 입력해주세요."
            );
        }


        // ---------------------------------------------------------
        // 신청금액
        // ---------------------------------------------------------

        if (sponsor.getRequestAmount() == null
                || sponsor.getRequestAmount() < 0) {

            throw new IllegalArgumentException(
                    "지자체 지원금 신청 금액이 올바르지 않습니다."
            );
        }


        // ---------------------------------------------------------
        // 승인금액
        // ---------------------------------------------------------

        if (sponsor.getApprovedAmount() == null
                || sponsor.getApprovedAmount() < 0) {

            throw new IllegalArgumentException(
                    "지자체 지원금 승인 금액이 올바르지 않습니다."
            );
        }


        // ---------------------------------------------------------
        // 승인금액은 신청금액보다 클 수 없음
        // ---------------------------------------------------------

        if (sponsor.getApprovedAmount()
                > sponsor.getRequestAmount()) {

            throw new IllegalArgumentException(
                    "지자체 지원금 승인 금액은 신청 금액보다 클 수 없습니다."
            );
        }


        // ---------------------------------------------------------
        // 지급일
        // ---------------------------------------------------------

        if (sponsor.getPaymentDate() == null) {

            /*
             * DB 컬럼이 nullable=false이므로
             * 관리자가 입력하지 않은 경우 현재 시각 사용
             */
            sponsor.setPaymentDate(
                    LocalDateTime.now()
            );
        }


        // ---------------------------------------------------------
        // 상태
        // ---------------------------------------------------------

        if (sponsor.getStatus() == null
                || sponsor.getStatus().isBlank()) {

            sponsor.setStatus("UNPAID");
        }


        // ---------------------------------------------------------
        // 교통비 지원 여부
        // ---------------------------------------------------------

        if (sponsor.getTransportSupported() == null
                || sponsor.getTransportSupported().isBlank()) {

            sponsor.setTransportSupported("N");
        }


        // ---------------------------------------------------------
        // 기타 지원 여부
        // ---------------------------------------------------------

        if (sponsor.getOtherSupported() == null
                || sponsor.getOtherSupported().isBlank()) {

            sponsor.setOtherSupported("N");
        }
    }
}