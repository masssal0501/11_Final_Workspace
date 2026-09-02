package com.kh.workflow.amount.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.kh.workflow.amount.vo.Amount;
import com.kh.workflow.common.model.vo.PageInfo;

@Mapper
public interface AmountDao {

    // =========================================================
    // 1. 비용 신청 등록
    //
    // amount 테이블
    //
    // INSERT 후 generated key를 Amount.amountNo에 저장
    // =========================================================

    int insertAmount(
            Amount amount
    );


    // =========================================================
    // 2. 비용 상세 항목 등록
    //
    // amount_item 테이블
    //
    // Amount.Item
    // ├─ itemNo
    // ├─ amount
    // ├─ itemType
    // ├─ itemDate
    // ├─ itemApproved
    // ├─ itemDescription
    // └─ amountNo
    //
    // DB 컬럼
    // item_type이 아니라 amountamountitem_type
    // =========================================================

    int insertAmountItem(
            Amount.Item item
    );


    // =========================================================
    // 3. 지원금 등록
    //
    // amount_list 테이블
    //
    // Amount.Sponsor
    // ├─ amountListNo
    // ├─ amountNo
    // ├─ sponsorName
    // ├─ amount
    // ├─ paymentDate
    // ├─ status
    // ├─ remark
    // └─ itemNo
    // =========================================================

    int insertAmountSponsor(
            Amount.Sponsor sponsor
    );


    // =========================================================
    // 4. 첨부파일 등록
    //
    // amount_file 테이블
    // =========================================================

    int insertAmountFile(
            Amount.File file
    );


    // =========================================================
    // 5. 비용 단건 조회
    //
    // amount 테이블
    // =========================================================

    Amount selectAmountById(
            @Param("amountNo") int amountNo
    );


    // =========================================================
    // 6. 전체 비용 신청 개수
    // =========================================================

    int getAmountListCount();


    // =========================================================
    // 7. 전체 비용 신청 목록
    //
    // PageInfo
    // └─ pagination
    // =========================================================

    List<Amount> selectAmountList(
            @Param("pi") PageInfo pi
    );


    // =========================================================
    // 8. 워케이션별 비용 신청 개수
    // =========================================================

    int selectAmountCountByWorkcationNo(
            @Param("workcationNo") int workcationNo
    );


    // =========================================================
    // 9. 워케이션별 비용 신청 목록
    // =========================================================

    List<Amount> selectAmountListByWorkcationNo(
            @Param("workcationNo") int workcationNo,
            @Param("pi") PageInfo pi
    );


    // =========================================================
    // 10. 비용 상세 항목 조회
    //
    // amount_item.amount_no 기준
    // =========================================================

    List<Amount.Item> selectAmountItemsByAmountNo(
            @Param("amountNo") int amountNo
    );


    // =========================================================
    // 11. 지원금 조회
    //
    // amount : amount_list = 1 : N
    //
    // amount_list.amount_no 기준
    // =========================================================

    List<Amount.Sponsor> selectSponsorsByAmountNo(
            @Param("amountNo") int amountNo
    );


    // =========================================================
    // 12. 첨부파일 조회
    //
    // amount_file.amount_no 기준
    // =========================================================

    List<Amount.File> selectAmountFilesByAmountNo(
            @Param("amountNo") int amountNo
    );


    // =========================================================
    // 13. 비용 신청 수정
    //
    // amount 테이블 수정
    // =========================================================

    int updateAmount(
            Amount amount
    );


    // =========================================================
    // 14. 결재 상태 변경
    //
    // status
    // ├─ A : 승인
    // ├─ H : 보류
    // └─ J : 반려
    //
    // approvedAmount
    // amountComment
    // approvedAt
    // updatedAt
    // =========================================================

    int updateApprovalStatus(
            Amount amount
    );


    // =========================================================
    // 15. 첨부파일 삭제
    //
    // amount_file.amountattachment_no 기준
    //
    // 실제 파일 삭제가 아니라
    // DB status = N 처리하는 방식
    // =========================================================

    int deleteFile(
            @Param("amountattachmentNo") int amountattachmentNo
    );


    // =========================================================
    // 16. 비용 신청 취소
    //
    // amount.status = C
    // =========================================================

    int cancelAmount(
            @Param("amountNo") int amountNo
    );


    // =========================================================
    // 17. 기존 비용 상세 항목 전체 삭제
    //
    // amount_item.amount_no 기준
    //
    // 주의:
    // amount_list.item_no가 amount_item을 FK로 참조하므로
    // 지원금 삭제 후 호출해야 함
    // =========================================================

    int deleteAmountItemsByAmountNo(
            @Param("amountNo") int amountNo
    );


    // =========================================================
    // 18. 기존 지원금 전체 삭제
    //
    // amount_list.amount_no 기준
    //
    // amount_item 삭제 전에 먼저 실행
    // =========================================================

    int deleteAmountSponsorsByAmountNo(
            @Param("amountNo") int amountNo
    );


    // =========================================================
    // 19. 전체 통계
    //
    // summary
    // =========================================================

    Map<String, Object> getStatisticsSummary();


    // =========================================================
    // 20. 부서별 통계
    // =========================================================

    List<Map<String, Object>> getDeptStatistics();


    // =========================================================
    // 21. 월별 통계
    // =========================================================

    List<Map<String, Object>> getMonthlyStatistics();


    // =========================================================
    // 22. 비용 항목별 통계
    //
    // amount_item.amountamountitem_type 기준
    //
    // S = 숙박
    // T = 교통
    // E = 체험
    // F = 식비
    // V = 차량
    // O = 기타
    // =========================================================

    List<Map<String, Object>> getItemStatistics();

}

