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
    // ├─ itemList  → amount_item (1:N)
    // ├─ sponsor   → amount_list (1:1)
    // └─ fileList  → amount_file (1:N)
    //
    // 현재 DB의 amount_list.amount_no가 PK이므로
    // 하나의 amount에는 Sponsor 1건만 등록 가능
    // =========================================================
    int insertAmount(Amount amount);


    // =========================================================
    // 4. 비용 상세 조회
    //
    // amount
    // ├─ itemList → amount_item (1:N)
    // ├─ sponsor  → amount_list (1:1)
    // └─ fileList → amount_file (1:N)
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
    // approvedAmount
    // → 최종 승인 금액
    //
    // comment
    // → 결재 의견
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
    // └─ sponsor
    //
    // files
    // └─ 새로 추가되는 MultipartFile
    //
    // 기존 DB 파일은 삭제하지 않고
    // 새 파일만 amount_file에 추가
    //
    // 주의:
    // amount_list.item_no가 amount_item을 참조하므로
    // item을 재등록하는 경우 sponsor.itemNo도
    // 새 itemNo에 맞춰 처리해야 함
    // =========================================================
    void updateAmount(
            Amount amount,
            List<MultipartFile> files
    );


    // =========================================================
    // 9. 항목별 회사 지원금 수정
    //
    // amount_item.amount
    // = 해당 항목의 회사 지원금
    //
    // amount_list.amount
    // = 지자체 지원금
    //
    // 여기서는 amount_list.amount를 수정하지 않음
    // =========================================================
    int updateItemCompanySupport(
            int itemNo,
            int amountNo,
            int amount
    );


    // =========================================================
    // 10. 첨부파일 삭제
    //
    // amount_file.amountattachment_no 기준
    // =========================================================
    int deleteFile(int amountattachmentNo);


    // =========================================================
    // 11. 비용 신청 취소
    //
    // amount.status = C
    // =========================================================
    int cancelAmount(int amountNo);


    // =========================================================
    // 12. 결재 + 지원금 처리
    //
    // status
    // ├─ A : 승인
    // ├─ H : 보류
    // └─ J : 반려
    //
    // 승인(A) 처리 시
    // sponsor가 전달되면 amount_list에 등록
    //
    // sponsor
    // → amount_list 1건
    //
    // sponsor.itemNo
    // → 해당 지자체 지원금이 적용될 amount_item
    //
    // 현재 DB 구조상 amount_list.amount_no가 PK이므로
    // 하나의 amount에는 Sponsor 1건만 존재
    // =========================================================
    void updateApprovalWithSponsor(
            int amountNo,
            String status,
            int approvedAmount,
            String comment,
            Amount.Sponsor sponsor
    );


    // =========================================================
    // 13. 전체 통계
    //
    // 반환 Map
    // ├─ summary
    // ├─ deptStatistics
    // ├─ monthlyStatistics
    // └─ itemStatistics
    // =========================================================
    Map<String, Object> getFullStatistics();

}

