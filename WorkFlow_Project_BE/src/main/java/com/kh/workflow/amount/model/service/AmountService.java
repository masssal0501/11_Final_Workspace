package com.kh.workflow.amount.model.service;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.amount.model.vo.Amount;
import com.kh.workflow.amount.model.vo.SupportList;
import com.kh.workflow.common.model.vo.PageInfo;
import com.kh.workflow.employee.model.vo.Employee;

public interface AmountService {

    // =========================================================
    // 1. 전체 비용 신청 목록
    // =========================================================

    List<Amount> selectAmountList();


    // =========================================================
    // 2. 전체 비용 신청 개수
    // =========================================================

    int getAmountListCount();


    // =========================================================
    // 3. 전체 비용 신청 목록
    // =========================================================

    List<Amount> selectAmountList(PageInfo pi);


    // =========================================================
    // 4. 비용 상세 조회
    // =========================================================

    Amount selectAmountById(int amountNo);


    // =========================================================
    // 5. 비용 신청 등록
    // =========================================================

    int insertAmount(Amount amount);


    // =========================================================
    // 6. 워케이션별 비용 신청 개수
    // =========================================================

    int getAmountCountByWorkcationNo(
            int workcationNo
    );


    // =========================================================
    // 7. 워케이션별 비용 신청 목록
    // =========================================================

    List<Amount> selectAmountListByWorkcationNo(
            int workcationNo,
            PageInfo pi
    );


    // =========================================================
    // 8. 비용 신청 수정
    // =========================================================

    // BUG-N03: 소유권 검증 없이 누구나 타인의 정산 신청을 수정할 수 있던 문제 수정.
    // loginEmployee를 받아 STAFF/MANAGER는 본인이 신청한 정산만, ADMIN은 전체 수정 가능하도록
    // Service 계층에서 검증한다(Controller의 URL 레벨 차단과 별개로 Service 내부에서도 확인).
    void updateAmount(
            Amount amount,
            List<MultipartFile> files,
            Employee loginEmployee
    );


    // =========================================================
    // 9. 비용 결재 상태 변경
    // =========================================================

    int updateApprovalStatus(
            int amountNo,
            String status,
            int approvedAmount,
            String comment
    );


    // =========================================================
    // 10. 항목별 회사 지원금 수정
    // =========================================================

    int updateItemCompanySupport(
            int itemNo,
            int amountNo,
            int amount
    );


    // =========================================================
    // 11. 첨부파일 삭제
    // =========================================================

    int deleteFile(
            int amountFileNo
    );


    // =========================================================
    // 12. 비용 신청 취소
    // =========================================================

    int cancelAmount(
            int amountNo
    );


    // =========================================================
    // 13. 결재 + 지원금
    // =========================================================

    void updateApprovalWithSponsor(
            int amountNo,
            String status,
            int approvedAmount,
            String comment,
            SupportList sponsor
    );


    // =========================================================
    // 14. 통계
    // =========================================================

    Map<String, Object> getFullStatistics();


	Page<Amount> selectAmountList(Pageable pageable);


	int insertAmount(Amount amount, MultipartFile[] files);


	Page<Amount> selectAmountListByWorkcationNo(int workcationNo, Pageable pageable);


	Amount selectAmountById(Integer amountNo);

}