package com.kh.workflow.amount.dao;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.amount.model.vo.Amount;
import com.kh.workflow.amount.model.vo.AmountFile;
import com.kh.workflow.amount.model.vo.AmountItem;
import com.kh.workflow.amount.model.vo.SupportList;
import com.kh.workflow.dashboard.model.dto.BalanceListDto;
import com.kh.workflow.dashboard.model.dto.ChartDataDto;

public interface AmountDao
        extends JpaRepository<Amount, Integer> {


    // =========================================================
    // amount
    // =========================================================

    // 전체 비용 신청 개수
    // JpaRepository.count() 사용


    // 전체 비용 신청 목록
    Page<Amount> findAllByOrderByCreatedAtDescAmountNoDesc(
            Pageable pageable
    );


    // 워케이션별 비용 신청 개수
    long countByWorkcationNo(
            Integer workcationNo
    );


    // 워케이션별 비용 신청 목록
    Page<Amount> findByWorkcationNoOrderByCreatedAtDescAmountNoDesc(
            Integer workcationNo,
            Pageable pageable
    );


    // 최근 비용 신청
    Amount findTopByOrderByAmountNoDesc();


    // =========================================================
    // 비용 수정
    // =========================================================

    @Modifying
    @Query("""
        UPDATE Amount a
        SET
            a.amountComment = :amountComment,
            a.updatedAt = CURRENT_TIMESTAMP
        WHERE a.amountNo = :amountNo
    """)
    int updateAmount(
            @Param("amountNo") int amountNo,
            @Param("amountComment") String amountComment
    );


    // =========================================================
    // 결재 상태 변경
    // =========================================================

    @Modifying
    @Query("""
        UPDATE Amount a
        SET
            a.status = :status,
            a.approvedAmount = :approvedAmount,
            a.amountComment = :amountComment,
            a.approvedAt =
                CASE
                    WHEN :status = 'A'
                    THEN CURRENT_TIMESTAMP
                    ELSE a.approvedAt
                END,
            a.updatedAt = CURRENT_TIMESTAMP
        WHERE a.amountNo = :amountNo
    """)
    int updateApprovalStatus(
            @Param("amountNo") int amountNo,
            @Param("status") String status,
            @Param("approvedAmount") int approvedAmount,
            @Param("amountComment") String amountComment
    );


    // =========================================================
    // 비용 신청 취소
    // =========================================================

    @Modifying
    @Query("""
        UPDATE Amount a
        SET
            a.status = 'C',
            a.updatedAt = CURRENT_TIMESTAMP
        WHERE a.amountNo = :amountNo
          AND a.status NOT IN ('A', 'J', 'C')
    """)
    int cancelAmount(
            @Param("amountNo") int amountNo
    );


    // =========================================================
    // amount_item
    // =========================================================

    List<AmountItem>
    findByAmount_AmountNoOrderByItemNoAsc(
            Integer amountNo
    );


    @Modifying
    @Query("""
        UPDATE AmountItem ai
        SET ai.itemAmount = :amount
        WHERE ai.itemNo = :itemNo
          AND ai.amount.amountNo = :amountNo
    """)
    int updateItemCompanySupport(
            @Param("itemNo") int itemNo,
            @Param("amountNo") int amountNo,
            @Param("amount") int amount
    );


    @Modifying
    @Query("""
        DELETE FROM AmountItem ai
        WHERE ai.amount.amountNo = :amountNo
    """)
    int deleteAmountItemsByAmountNo(
            @Param("amountNo") int amountNo
    );


    // =========================================================
    // support_list
    // =========================================================

    List<SupportList>
    findByAmount_AmountNoOrderBySupportNoAsc(
            Integer amountNo
    );


    @Modifying
    @Query("""
        DELETE FROM SupportList sl
        WHERE sl.amount.amountNo = :amountNo
    """)
    int deleteAmountSponsorsByAmountNo(
            @Param("amountNo") int amountNo
    );


    // =========================================================
    // amount_file
    // =========================================================

    List<AmountFile>
    findByAmount_AmountNoAndStatusOrderByAmountFileNoAsc(
            Integer amountNo,
            String status
    );


    @Modifying
    @Query("""
        DELETE FROM AmountFile af
        WHERE af.amountFileNo = :amountFileNo
    """)
    int deleteFile(
            @Param("amountFileNo") int amountFileNo
    );


    // =========================================================
    // Statistics
    // =========================================================

    @Query("""
        SELECT new map(
            COUNT(a.amountNo) as totalCount,
            COALESCE(SUM(a.approvedAmount), 0) as totalApprovedAmount
        )
        FROM Amount a
    """)
    Map<String, Object> getStatisticsSummary();
    
    /* =====================================================================
	 * 1. 관리자 대시보드 관련 메서드
	 * ===================================================================== */
	
	/**
	 * [관리자] 이번 달 전사 예산 소진율 조회
	 * 
	 * @return int 예산 소진 백분율 값
	 */
	int adminSelectBudgetExhaustionRate();

	/**
	 * [관리자] 전사 워케이션 관련 회사 부담금 총액 조회
	 * 
	 * @return int 회사 부담금 합계
	 */
	int selectTotalBudget();

	/**
	 * [관리자] 현재 보유 중인 지원금 잔액 조회
	 * 
	 * @return int 지원금 잔액
	 */
	int selectSupportFund();

	/**
	 * [관리자] 발생한 총 비용 조회
	 * 
	 * @return int 총 비용 합계
	 */
	int selectTotalCost();
	
	/**
	 * [관리자] 총 예산 대비 집행률 데이터 조회
	 * 
	 * @return int 예산 집행률 백분율 값
	 */
	int selectBudgetData();

	/**
	 * [관리자] 지출 항목별(숙박, 교통, 식비 등) 지출 비중 통계 조회 (차트용)
	 * 
	 * @return List<ChartDataDto> 항목별 지출 비중 데이터 목록
	 */
	List<ChartDataDto> selectCategoryData();

	/**
	 * [관리자] 부서별 사용 예산 현황 통계 조회 (차트용)
	 * 
	 * @return List<ChartDataDto> 부서별 예산 사용량 데이터 목록
	 */
	List<ChartDataDto> selectDeptData();

	/* =====================================================================
	 * 2. 부서장 대시보드 관련 메서드
	 * ===================================================================== */
	
	/**
	 * [부서장] 특정 부서의 예산 소진율 조회
	 * 
	 * @param depId 부서 아이디
	 * @return int 부서 예산 소진 백분율 값
	 */
	int managerSelectBudgetExhaustionRate(String depId);

	/**
	 * [부서장] 특정 부서의 정산 대기 목록 조회
	 * 
	 * @param depId 부서 아이디
	 * @return List<BalanceListDto> 부서원들의 정산 대기 내역 리스트
	 */
	List<BalanceListDto> selectBalanceList(String depId);

	/* =====================================================================
	 * 3. 사원 대시보드 관련 메서드
	 * ===================================================================== */
	
	/**
	 * [사원] 특정 사원에게 남은 지원금액 조회
	 * 
	 * @param empNo 사원 번호
	 * @return int 남은 지원금 잔액
	 */
	int selectAmountSupport(int empNo);

	/**
	 * [사원] 특정 사원이 현재까지 사용한 비용 총액 조회
	 * 
	 * @param empNo 사원 번호
	 * @return int 사용 비용 합계
	 */
	int selectUseAmount(int empNo);

}