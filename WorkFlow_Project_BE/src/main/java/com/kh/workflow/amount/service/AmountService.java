package com.kh.workflow.amount.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.amount.vo.Amount;
import com.kh.workflow.common.model.vo.PageInfo;

public interface AmountService {

    // =========================================================
    // 1. 전체 비용 신청 개수
    // =========================================================

    int getAmountListCount();


    // =========================================================
    // 2. 전체 비용 신청 목록
    // =========================================================

    List<Amount> selectAmountList(PageInfo pi);


    // =========================================================
    // 3. 비용 신청 등록
    //
    // Amount
    // ├─ amount
    // ├─ itemList      → amount_item
    // ├─ sponsorList   → amount_list
    // └─ fileList      → amount_file
    //
    // Controller에서 MultipartFile을 처리한 후
    // Amount.File 형태로 fileList에 전달
    // =========================================================

    int insertAmount(Amount amount);


    // =========================================================
    // 4. 비용 상세 조회
    //
    // amount
    // ├─ itemList
    // ├─ sponsorList
    // └─ fileList
    // =========================================================

    Amount selectAmountById(int amountNo);


    // =========================================================
    // 5. 워케이션별 비용 신청 개수
    // =========================================================

    int getAmountCountByWorkcationNo(int workcationNo);


    // =========================================================
    // 6. 워케이션별 비용 신청 목록
    // =========================================================

    List<Amount> selectAmountListByWorkcationNo(
            int workcationNo,
            PageInfo pi
    );


    // =========================================================
    // 7. 비용 결재 상태 변경
    //
    // status
    // ├─ A : 승인
    // ├─ H : 보류
    // └─ J : 반려
    //
    // approvedAmount → 최종 승인 금액
    // comment        → 결재 의견
    // =========================================================

    int updateApprovalStatus(
            int amountNo,
            String status,
            int approvedAmount,
            String comment
    );


    // =========================================================
    // 8. 비용 신청 수정
    //
    // amount
    // ├─ amount
    // ├─ itemList
    // └─ sponsorList
    //
    // files
    // └─ 새로 추가되는 MultipartFile
    //
    // 기존 DB 파일은 삭제하지 않고
    // 새 파일만 amount_file에 추가
    // =========================================================

    void updateAmount(
            Amount amount,
            List<MultipartFile> files
    );


    // =========================================================
    // 9. 첨부파일 삭제
    //
    // amount_file.amountattachment_no 기준
    //
    // 실제 구현에서는 DB status = N 처리
    // =========================================================

    int deleteFile(int amountattachmentNo);


    // =========================================================
    // 10. 비용 신청 취소
    //
    // amount.status = C
    // =========================================================

    int cancelAmount(int amountNo);


    // =========================================================
    // 11. 결재 + 지원금 처리
    //
    // amount
    // └─ sponsor → amount_list 1건
    //
    // status = A인 경우 지원금 등록
    //
    // Sponsor
    // ├─ sponsorName
    // ├─ amount
    // ├─ paymentDate
    // ├─ status
    // ├─ remark
    // └─ itemNo
    // =========================================================

    void updateApprovalWithSponsor(
            int amountNo,
            String status,
            int approvedAmount,
            String comment,
            Amount.Sponsor sponsor
    );


    // =========================================================
    // 12. 전체 통계
    //
    // 반환 Map
    // ├─ summary
    // ├─ deptStatistics
    // ├─ monthlyStatistics
    // └─ itemStatistics
    // =========================================================

    Map<String, Object> getFullStatistics();

}

