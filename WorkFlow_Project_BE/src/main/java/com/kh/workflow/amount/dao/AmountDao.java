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
import com.kh.workflow.common.model.vo.PageInfo;
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

    @Query("SELECT ai FROM AmountItem ai WHERE ai.amount.amountNo = :amountNo ORDER BY ai.itemNo ASC")
    List<AmountItem>
    findByAmount_AmountNoOrderByItemNoAsc(
    		@Param("amountNo") Integer amountNo
    );


    @Modifying
    @Query("""
        UPDATE AmountItem ai
        SET ai.itemApprovedAmount = :amount
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

    @Query("SELECT sl FROM SupportList sl WHERE sl.amount.amountNo = :amountNo ORDER BY sl.supportNo ASC")List<SupportList>
    findByAmount_AmountNoOrderBySupportNoAsc(
    		@Param("amountNo") Integer amountNo
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

    @Query("SELECT af FROM AmountFile af WHERE af.amount.amountNo = :amountNo AND af.status = :status ORDER BY af.amountFileNo ASC")
    List<AmountFile>
    findByAmount_AmountNoAndStatusOrderByAmountFileNoAsc(
    		@Param("amountNo") Integer amountNo,
    		@Param("status") String status
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

    // ★ 요약 통계 - 상태별 건수, 총 신청/승인 금액까지 포함하도록 확장
    @Query("""
        SELECT new map(
            COUNT(a.amountNo) as totalCount,
            COALESCE(SUM(a.requestedAmount), 0) as totalRequestedAmount,
            COALESCE(SUM(a.approvedAmount), 0) as totalApprovedAmount,
            SUM(CASE WHEN a.status = 'R' THEN 1 ELSE 0 END) as reviewCount,
            SUM(CASE WHEN a.status = 'A' THEN 1 ELSE 0 END) as approvedCount,
            SUM(CASE WHEN a.status = 'H' THEN 1 ELSE 0 END) as holdCount,
            SUM(CASE WHEN a.status = 'J' THEN 1 ELSE 0 END) as rejectedCount,
            SUM(CASE WHEN a.status = 'C' THEN 1 ELSE 0 END) as cancelledCount
        )
        FROM Amount a
    """)
    Map<String, Object> getStatisticsSummary();
    
    /* =====================================================================
	 * 1. 관리자 대시보드 관련 메서드
	 * ===================================================================== */
	
	// BUG-02: 아래 3개 통계(관리자 예산 소진율/회사 부담금/보유 지원금)는 원래
	// "FROM Amount a JOIN AmountItem ai ... JOIN SupportList sl ..." 형태로
	// 비용 신청 1건에 딸린 항목(1:N)과 지원처(1:N)를 동시에 JOIN하고 있었다.
	// 항목이 2개, 지원처가 2개인 신청 1건은 이 JOIN만으로 4행(카티션 곱)이 되어
	// SUM(ai.itemAmount), SUM(sl.approvedAmount), SUM(a.approvedAmount)가 모두
	// 실제보다 몇 배씩 부풀려졌다. "항목 합계"와 "지원처 승인 합계"는 서로 무관한
	// 별도의 1:N 관계이므로, 절대 함께 JOIN하지 않고 각각 독립적으로 집계한 뒤
	// 애플리케이션에서 뺄셈/백분율을 계산한다.
	//
	// 통계 정의:
	// - "총 회사 지원금"(selectTotalBudget) = 처리 중인(H/R/W) 신청들의 (항목 금액 합 - 지원처 승인 합)
	//   = 회사가 최종적으로 부담해야 할 순수 비용
	// - "보유 지원금"(selectSupportFund) = 처리 중인(H/R/W) 신청들의 지원처 승인 합
	//   (기존 코드는 지원처 금액이 아니라 Amount.approvedAmount(전체 승인 금액,
	//   대부분 아직 승인 전이라 0)을 잘못 집계해 위 총액과 무관한 값이 나오고 있었다)
	// 즉 두 지표는 "같은 처리 중 신청 집합"을 서로 다른 관점(회사 부담분 vs 지원처 부담분)으로
	// 보여주는 것이라 인위적으로 같게 맞추지 않는다.

	/**
	 * 처리 중(H/R/W) 비용 신청들의 항목 금액(itemAmount) 합계 - JOIN 없이 AmountItem/Amount만 사용
	 */
    @Query("""
            SELECT COALESCE(SUM(ai.itemAmount), 0)
            FROM AmountItem ai
            JOIN ai.amount a
            WHERE a.status IN ('H', 'R', 'W')
        """)
	int sumPendingItemAmount();

	/**
	 * [관리자] 현재 보유 중인 지원금 잔액 조회
	 * 처리 중(H/R/W) 비용 신청들에 대해 지원처가 승인한 지원 금액(SupportList.approvedAmount) 합계
	 *
	 * @return int 지원금 잔액
	 */
    @Query("""
            SELECT COALESCE(SUM(sl.approvedAmount), 0)
            FROM SupportList sl
            JOIN sl.amount a
            WHERE a.status IN ('H', 'R', 'W')
        """)
	int selectSupportFund();

	/**
	 * 처리 중(H/R/W) 비용 신청들의 신청 금액(Amount.approvedAmount) 합계 - JOIN 없이 Amount만 사용
	 */
    @Query("""
            SELECT COALESCE(SUM(a.approvedAmount), 0)
            FROM Amount a
            WHERE a.status IN ('H', 'R', 'W')
        """)
	int sumPendingApprovedAmount();

	/**
	 * [관리자] 전사 워케이션 관련 회사 부담금 총액 조회
	 *
	 * @return int 회사 부담금 합계
	 */
	default int selectTotalBudget() {
		return sumPendingItemAmount() - selectSupportFund();
	}

	/**
	 * 이번 달 승인 완료(A)된 비용 신청들의 항목 금액 합계
	 */
    @Query("""
            SELECT COALESCE(SUM(ai.itemAmount), 0)
            FROM AmountItem ai
            JOIN ai.amount a
            WHERE a.status = 'A'
              AND MONTH(CURRENT_DATE) = MONTH(a.approvedAt)
        """)
	int sumThisMonthItemAmount();

	/**
	 * 이번 달 승인 완료(A)된 비용 신청들의 지원처 승인 금액 합계
	 */
    @Query("""
            SELECT COALESCE(SUM(sl.approvedAmount), 0)
            FROM SupportList sl
            JOIN sl.amount a
            WHERE a.status = 'A'
              AND MONTH(CURRENT_DATE) = MONTH(a.approvedAt)
        """)
	int sumThisMonthSponsorApproved();

	/**
	 * 이번 달 승인 완료(A)된 비용 신청들의 신청 승인 금액 합계
	 */
    @Query("""
            SELECT COALESCE(SUM(a.approvedAmount), 0)
            FROM Amount a
            WHERE a.status = 'A'
              AND MONTH(CURRENT_DATE) = MONTH(a.approvedAt)
        """)
	int sumThisMonthApprovedAmount();

	/**
	 * [관리자] 이번 달 전사 예산 소진율 조회
	 *
	 * @return int 예산 소진 백분율 값
	 */
	default int adminSelectBudgetExhaustionRate() {
		int approvedTotal = sumThisMonthApprovedAmount();
		if (approvedTotal == 0) {
			return 0;
		}
		long netCost = (long) sumThisMonthItemAmount() - sumThisMonthSponsorApproved();
		return (int) ((netCost * 100) / approvedTotal);
	}

	/**
	 * [관리자] 발생한 총 비용 조회
	 *
	 * 기존 쿼리는 AmountItem/SupportList를 각각 JOIN해 항목 수 x 지원처 수만큼
	 * 행이 곱해지는 카티션 곱 위에서 a.approvedAmount(비용 신청 1건당 값)를
	 * 행마다 중복 차감하고 있어(추가로 sl.approvedAmount까지 또 차감) 실제 비용보다
	 * 훨씬 큰 음수가 나오는 버그가 있었다. 게다가 INNER JOIN 특성상 지원처가
	 * 하나도 없는 승인 건은 아예 집계에서 빠지는 문제도 있었다.
	 * "발생한 총 비용"은 비용 신청 1건당 최종 승인된 금액(amount.approved_amount,
	 * 스키마 주석상 '최종 승인된 비용')의 합으로 충분하므로 JOIN 없이 계산한다.
	 *
	 * @return int 총 비용 합계
	 */
    @Query("""
            SELECT COALESCE(SUM(a.approvedAmount), 0)
            FROM Amount a
            WHERE a.status = 'A'
        """)
	int selectTotalCost();
	
	/**
	 * [관리자] 총 예산 대비 집행률 데이터 조회
	 * 처리 중(H/R/W) 신청들의 (항목 금액 합 - 지원처 승인 합) / 신청 승인 금액 합 * 100
	 * (BUG-02: 카티션 곱 없이 sumPendingItemAmount/selectSupportFund/sumPendingApprovedAmount로 분리 집계)
	 *
	 * @return int 예산 집행률 백분율 값
	 */
	default int selectBudgetData() {
		int approvedTotal = sumPendingApprovedAmount();
		if (approvedTotal == 0) {
			return 0;
		}
		long netCost = (long) sumPendingItemAmount() - selectSupportFund();
		return (int) ((netCost * 100) / approvedTotal);
	}

	/**
	 * [관리자] 지출 항목별(숙박, 교통, 식비 등) 지출 비중 통계 조회 (차트용)
	 * 
	 * @return List<ChartDataDto> 항목별 지출 비중 데이터 목록
	 */
    @Query("""
            SELECT new com.kh.workflow.dashboard.model.dto.ChartDataDto(
                CASE WHEN ai.itemType = 'S' THEN '숙박'
                     WHEN ai.itemType = 'T' THEN '교통'
                     WHEN ai.itemType = 'E' THEN '체험'
                     WHEN ai.itemType = 'F' THEN '식비'
                     WHEN ai.itemType = 'V' THEN '차량'
                     WHEN ai.itemType = 'O' THEN '기타'
                ELSE '' END type,
                COALESCE(SUM(ai.itemAmount), 0)
            )
              FROM AmountItem ai
              JOIN Amount a ON ai.amount = a
             WHERE a.status = 'A'
               AND ai.itemType IN ('S', 'T', 'E', 'F', 'V', 'O')
             GROUP BY type
        """)
	List<ChartDataDto> selectCategoryData();

	/**
	 * [관리자] 부서별 사용 예산 현황 통계 조회 (차트용)
	 * 
	 * @return List<ChartDataDto> 부서별 예산 사용량 데이터 목록
	 */
    @Query("""
            SELECT new com.kh.workflow.dashboard.model.dto.ChartDataDto(
                d.depTitle,
                COALESCE(SUM(ai.itemAmount), 0)
            )
            FROM AmountItem ai
            JOIN Amount a ON a = ai.amount
            JOIN WorkcationInfo w ON w.workcationNo = a.workcationNo
            JOIN Employee e ON w.employee = e
            JOIN Department d ON d.depId = e.depId
            WHERE a.status = 'A'
            GROUP BY d.depTitle
        """)
	List<ChartDataDto> selectDeptData();

	/* =====================================================================
	 * 2. 부서장 대시보드 관련 메서드
	 * ===================================================================== */
	
	/**
	 * 특정 부서의 승인 완료(A) 비용 신청들의 항목 금액 합계
	 */
    @Query("""
            SELECT COALESCE(SUM(ai.itemAmount), 0)
            FROM AmountItem ai
            JOIN ai.amount a
            JOIN WorkcationInfo w ON a.workcationNo = w.workcationNo
            JOIN Employee e ON w.employee = e
            WHERE e.depId = :depId
              AND a.status = 'A'
        """)
	int sumDeptItemAmount(@Param("depId") String depId);

	/**
	 * 특정 부서의 승인 완료(A) 비용 신청들의 지원처 승인 금액 합계
	 */
    @Query("""
            SELECT COALESCE(SUM(sl.approvedAmount), 0)
            FROM SupportList sl
            JOIN sl.amount a
            JOIN WorkcationInfo w ON a.workcationNo = w.workcationNo
            JOIN Employee e ON w.employee = e
            WHERE e.depId = :depId
              AND a.status = 'A'
        """)
	int sumDeptSponsorApproved(@Param("depId") String depId);

	/**
	 * 특정 부서의 승인 완료(A) 비용 신청들의 신청 승인 금액 합계
	 */
    @Query("""
            SELECT COALESCE(SUM(a.approvedAmount), 0)
            FROM Amount a
            JOIN WorkcationInfo w ON a.workcationNo = w.workcationNo
            JOIN Employee e ON w.employee = e
            WHERE e.depId = :depId
              AND a.status = 'A'
        """)
	int sumDeptApprovedAmount(@Param("depId") String depId);

	/**
	 * [부서장] 특정 부서의 예산 소진율 조회
	 * (BUG-02: 관리자 통계와 동일하게 카티션 곱 없이 분리 집계)
	 *
	 * @param depId 부서 아이디
	 * @return int 부서 예산 소진 백분율 값
	 */
	default int managerSelectBudgetExhaustionRate(String depId) {
		int approvedTotal = sumDeptApprovedAmount(depId);
		if (approvedTotal == 0) {
			return 0;
		}
		long netCost = (long) sumDeptItemAmount(depId) - sumDeptSponsorApproved(depId);
		return (int) ((netCost * 100) / approvedTotal);
	}

	// BUG-10: 부서장 대시보드 "정산 대기 목록" - 기존에는 화면에 위젯 자체가 없어
	// (관련 DTO였던 BalanceListDto가 실제 사용처 없이 죽은 코드로만 존재해 지난
	// 정리 작업에서 삭제됨) 실제로는 아무 정산 데이터도 보여주지 못하고 있었다.
	// 최종 처리(승인 A/취소 C/반려 J)되지 않아 부서장의 확인이 필요한 상태(검토 R,
	// 보류 H)의 비용 신청만, 로그인한 부서장의 부서(depId)로 정확히 스코프를 좁혀 조회한다.
	@Query("""
			SELECT NEW com.kh.workflow.dashboard.model.dto.SettlementWaitingDto(
				a.amountNo,
				e.empNo,
				e.empName,
				a.requestedAmount,
				a.status,
				a.requestedAt
			)
			  FROM Amount a
			  JOIN a.workcationInfo w
			  JOIN w.employee e
			 WHERE e.depId = :depId
			   AND a.status IN ('R', 'H')
			 ORDER BY a.requestedAt DESC
			""")
	List<com.kh.workflow.dashboard.model.dto.SettlementWaitingDto> managerSelectSettlementWaitingList(
			@Param("depId") String depId);

	/* =====================================================================
	 * 3. 사원 대시보드 관련 메서드
	 * ===================================================================== */
	
	/**
	 * [사원] 특정 사원에게 남은 지원금액 조회
	 * 
	 * @param empNo 사원 번호
	 * @return int 남은 지원금 잔액
	 */
    @Query("""
            SELECT COALESCE(SUM(a.approvedAmount), 0)
            FROM Amount a
            JOIN WorkcationInfo w ON a.workcationNo = w.workcationNo
            JOIN Employee e ON w.employee = e
            WHERE e.empNo = :empNo
              AND a.status = 'A'
        """)
	int selectAmountSupport(int empNo);

	/**
	 * [사원] 특정 사원이 현재까지 사용한 비용 총액 조회
	 * 
	 * @param empNo 사원 번호
	 * @return int 사용 비용 합계
	 */
    @Query("""
            SELECT COALESCE(SUM(ai.itemAmount), 0)
            FROM Amount a
            JOIN AmountItem ai ON ai.amount = a
            JOIN WorkcationInfo w ON a.workcationNo = w.workcationNo
            JOIN Employee e ON w.employee = e
            WHERE e.empNo = :empNo
              AND a.status = 'A'
        """)
	int selectUseAmount(int empNo);

    @Query("SELECT COUNT(a) FROM Amount a")
	int getAmountListCount();

	@Query("SELECT a FROM Amount a")
	List<Amount> selectAmountList(PageInfo pi);

	@Query("SELECT COUNT(a) FROM Amount a WHERE a.workcationNo = :workcationNo")
	int selectAmountCountByWorkcationNo(@Param("workcationNo") int workcationNo);

	@Query("""
		    SELECT a
		    FROM Amount a
		    WHERE a.workcationNo = :workcationNo
		""")
	List<Amount> selectAmountListByWorkcationNo(@Param("workcationNo") int workcationNo, PageInfo pi);

	// ★ 부서별 통계 - 승인된 항목의 회사 지원금(itemApprovedAmount) 기준, Object[] 반환으로 변경
	@Query("""
		SELECT d.depTitle, COALESCE(SUM(ai.itemApprovedAmount), 0)
          FROM Amount a
          JOIN WorkcationInfo w ON a.workcationNo = w.workcationNo 
          JOIN AmountItem ai ON ai.amount = a
          JOIN Employee e ON w.employee = e
          JOIN Department d ON e.depId = d.depId
         WHERE a.status = 'A'
         GROUP BY d.depTitle
           """)
	List<Object[]> getDeptStatistics();

	// ★ 월별 통계 - 승인일(approvedAt) 기준 월별 회사 지원금 합계, Object[] 반환으로 변경
	@Query("""
		SELECT FUNCTION('MONTH', a.approvedAt), COALESCE(SUM(ai.itemApprovedAmount), 0)
          FROM Amount a
          JOIN AmountItem ai ON ai.amount = a
         WHERE a.status = 'A'
         GROUP BY FUNCTION('MONTH', a.approvedAt)
         """)
	List<Object[]> getMonthlyStatistics();

	
	// ★ 항목별 통계 - 승인된 비용 신청 건만 집계
	@Query("""
	    SELECT ai.itemType,
	           COUNT(ai),
	           COALESCE(SUM(ai.itemAmount), 0),
	           COALESCE(SUM(ai.itemApprovedAmount), 0)
	      FROM AmountItem ai
	     WHERE ai.amount.status = 'A'
	     GROUP BY ai.itemType
	        """)
	List<Object[]> getItemStatistics();

	List<Amount> findByWorkcationNo(Integer workcationNo);
	Page<Amount> findByWorkcationNoInOrderByCreatedAtDescAmountNoDesc(
	        List<Integer> workcationNos,
	        Pageable pageable
	);
}