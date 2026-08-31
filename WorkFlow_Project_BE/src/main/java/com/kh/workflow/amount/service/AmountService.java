package com.kh.workflow.amount.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.amount.vo.Amount;
import com.kh.workflow.common.model.vo.PageInfo;

public interface AmountService {

    // =========================================================
    // 1. 전체 비용 신청 개수 조회
    // =========================================================

    int getAmountListCount();


    // =========================================================
    // 2. 전체 비용 신청 목록 조회
    // =========================================================

    List<Amount> selectAmountList(PageInfo pi);


    // =========================================================
    // 3. 비용 신청 등록
    // =========================================================

    int insertAmount(Amount amount);


    // =========================================================
    // 4. 비용 상세 조회
    //
    // Amount
    //  ├─ itemList
    //  ├─ sponsor
    //  └─ fileList
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
    // 7. 결재 상태 변경
    // =========================================================

    int updateApprovalStatus(Amount amount);


    // =========================================================
    // 8. 비용 신청 수정
    // =========================================================

    void updateAmount(
            Amount amount,
            List<MultipartFile> files
    );


    // =========================================================
    // 9. 개별 첨부파일 삭제
    // =========================================================

    int deleteFile(int amountattachmentNo);


    // =========================================================
    // 10. 비용 신청 취소
    // =========================================================

    int cancelAmount(int amountNo);


    // =========================================================
    // 11. 결재 + 지원금 처리
    //
    // amount_list는 amount_no를 PK로 사용하므로
    // 하나의 amount에 하나의 Sponsor만 연결
    // =========================================================

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
    // 12. 전체 통계
    // =========================================================

    Map<String, Object> getFullStatistics();

}

