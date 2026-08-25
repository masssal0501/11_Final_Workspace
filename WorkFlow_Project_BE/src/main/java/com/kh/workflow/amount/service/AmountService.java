package com.kh.workflow.amount.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.amount.vo.Amount;

public interface AmountService {

    // =========================================================
    // 1. 정산 신청
    // =========================================================

    /**
     * 정산 신청 등록
     *
     * amount
     * ├── amount_item
     * ├── amount_list
     * └── amount_file
     */
    int insertAmount(Amount amount);


    // =========================================================
    // 2. 정산 상세 조회
    // =========================================================

    /**
     * amount_no 기준 정산 상세 조회
     *
     * amount
     * ├── itemList
     * ├── sponsorList
     * └── fileList
     */
    Amount selectAmountById(int amountNo);


    // =========================================================
    // 3. 워케이션별 정산 목록 조회
    // =========================================================

    /**
     * workcation_no 기준 정산 목록 조회
     */
    List<Amount> selectAmountListByWorkcationNo(int workcationNo);


    // =========================================================
    // 4. 결재 상태 변경
    // =========================================================

    /**
     * 정산 결재 상태 변경
     *
     * A : 승인
     * C : 취소
     * H : 보류
     * J : 반려
     * R : 검토
     */
    int updateApprovalStatus(Amount amount);


    // =========================================================
    // 5. 정산 수정
    // =========================================================

    /**
     * 정산 정보 및 첨부파일 수정
     *
     * amount
     * ├── amount 기본 정보
     * ├── itemList
     * ├── sponsorList
     * └── fileList
     *
     * files
     * └── 새로 업로드할 첨부파일
     */
    void updateAmount(
            Amount amount,
            List<MultipartFile> files
    );


    // =========================================================
    // 6. 정산 취소
    // =========================================================

    /**
     * amount.status = C
     */
    int cancelAmount(int amountNo);


    // =========================================================
    // 7. 승인 + 지급/후원 정보 처리
    // =========================================================

    /**
     * 정산 승인과 동시에 amount_list 등록/수정
     *
     * amount
     * └── amount_list
     *      ├── sponsor_name
     *      ├── amount
     *      ├── status
     *      └── remark
     */
    void updateApprovalWithSponsor(
            int amountNo,
            String status,
            int approvedAmount,
            String comment,
            String sponsorName,
            int sponsorAmount,
            String sponsorStatus,
            String remark
    );


    // =========================================================
    // 8. 정산 통계
    // =========================================================

    /**
     * 전체 정산 통계 조회
     *
     * 예:
     * - 전체 정산 건수
     * - 신청 금액
     * - 승인 금액
     * - 승인 건수
     * - 검토 건수
     * - 반려 건수
     * - 취소 건수
     * - 미지급 금액
     * - 지급 금액
     */
    Map<String, Object> getFullStatistics();

}