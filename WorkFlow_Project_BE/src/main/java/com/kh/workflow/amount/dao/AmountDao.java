package com.kh.workflow.amount.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.kh.workflow.amount.vo.Amount;
import com.kh.workflow.common.model.vo.PageInfo;

@Mapper
public interface AmountDao {

    int insertAmount(Amount amount);

    int insertAmountItem(Amount.Item item);

    int insertAmountSponsor(Amount.Sponsor sponsor);

    int insertAmountFile(Amount.File file);

    Amount selectAmountById(@Param("amountNo") int amountNo);

    int getAmountListCount();

    List<Amount> selectAmountList(@Param("pi") PageInfo pi);

    int selectAmountCountByWorkcationNo(
        @Param("workcationNo") int workcationNo
    );

    List<Amount> selectAmountListByWorkcationNo(
        @Param("workcationNo") int workcationNo,
        @Param("pi") PageInfo pi
    );

    List<Amount.Item> selectAmountItemsByAmountNo(
        @Param("amountNo") int amountNo
    );

    List<Amount.Sponsor> selectSponsorsByAmountNo(
        @Param("amountNo") int amountNo
    );

    List<Amount.File> selectAmountFilesByAmountNo(
        @Param("amountNo") int amountNo
    );

    int updateAmount(Amount amount);

    // 항목별 회사 지원금 수정
    int updateItemCompanySupport(
        @Param("itemNo") int itemNo,
        @Param("amountNo") int amountNo,
        @Param("amount") int amount
    );

    int updateApprovalStatus(Amount amount);

    int deleteFile(
        @Param("amountattachmentNo") int amountattachmentNo
    );

    int cancelAmount(
        @Param("amountNo") int amountNo
    );

    int deleteAmountItemsByAmountNo(
        @Param("amountNo") int amountNo
    );

    int deleteAmountSponsorsByAmountNo(
        @Param("amountNo") int amountNo
    );

    Map<String, Object> getStatisticsSummary();

    List<Map<String, Object>> getDeptStatistics();

    List<Map<String, Object>> getMonthlyStatistics();

    List<Map<String, Object>> getItemStatistics();
}

