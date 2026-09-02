package com.kh.workflow.amount.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.kh.workflow.amount.vo.Amount;
import com.kh.workflow.common.model.vo.PageInfo;
import com.kh.workflow.dashboard.model.dto.ChartDataDto;

@Mapper
public interface AmountDao {

    int insertAmount(Amount amount);

    int insertAmountItem(Amount.Item item);

    int insertAmountSponsor(Amount.Sponsor sponsor);

    int insertAmountFile(Amount.File file);

    Amount selectAmountById(int amountNo);
    
    int getAmountListCount();

 // 전체 목록 조회 (페이징)
    List<Amount> selectAmountList(@Param("pi") PageInfo pi);

    // 전체 개수
    int getAmountCountByWorkcationNo(
            @Param("workcationNo") int workcationNo
    );

    // 페이징 목록
    List<Amount> selectAmountListByWorkcationNo(
            @Param("workcationNo") int workcationNo,
            @Param("pi") PageInfo pi
    );

    List<Amount.Item> selectAmountItemsByAmountNo(int amountNo);

    List<Amount.Sponsor> selectSponsorsByAmountNo(int amountNo);

    List<Amount.File> selectAmountFilesByAmountNo(int amountNo);

    int updateAmount(Amount amount);

    int updateApprovalStatus(Amount amount);

    int deleteFile(int amountattachmentNo);

    int cancelAmount(int amountNo);

    int deleteAmountItemsByAmountNo(int amountNo);

    int deleteAmountSponsorsByAmountNo(int amountNo);

    Map<String, Object> getStatisticsSummary();

    List<Map<String, Object>> getDeptStatistics();

    List<Map<String, Object>> getMonthlyStatistics();

    List<Map<String, Object>> getItemStatistics();

    // 관리자 대시보드
    // (이번달)예산 소진율
	int adminSelectBudgetExhaustionRate();

	// 회사 부담금
	int selectTotalBudget();

	// 보유 지원금
	int selectSupportFund();

	// 총 비용
	int selectTotalCost();
	
	// 총 예산 대비 집행률
	int selectBudgetData();

	// 항목별 지출 비중
	List<ChartDataDto> selectCategoryData();

	// 부서별 사용 예산
	List<ChartDataDto> selectDeptData();

	// 부서장 대시보드
	// (부서)예산 소진율
	int managerSelectBudgetExhaustionRate(String depId);
}