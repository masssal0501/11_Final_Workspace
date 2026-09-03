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
    // amount
    // =========================================================

    int insertAmount(Amount amount);

    Amount selectAmountById(@Param("amountNo") int amountNo);

    int getAmountListCount();

    List<Amount> selectAmountList(
        @Param("pi") PageInfo pi
    );

    int selectAmountCountByWorkcationNo(
        @Param("workcationNo") int workcationNo
    );

    List<Amount> selectAmountListByWorkcationNo(
        @Param("workcationNo") int workcationNo,
        @Param("pi") PageInfo pi
    );

    int updateAmount(Amount amount);

    int updateApprovalStatus(Amount amount);

    int cancelAmount(
        @Param("amountNo") int amountNo
    );


    // =========================================================
    // amount_item
    // =========================================================

    int insertAmountItem(Amount.Item item);

    List<Amount.Item> selectAmountItemsByAmountNo(
        @Param("amountNo") int amountNo
    );

    int updateItemCompanySupport(
        @Param("itemNo") int itemNo,
        @Param("amountNo") int amountNo,
        @Param("amount") int amount
    );

    int deleteAmountItemsByAmountNo(
        @Param("amountNo") int amountNo
    );


    // =========================================================
    // amount_list
    // DB 기준 : amount_no가 PK이므로 Amount : Sponsor = 1 : 1
    // =========================================================

    int insertAmountSponsor(Amount.Sponsor sponsor);

    Amount.Sponsor selectSponsorByAmountNo(
        @Param("amountNo") int amountNo
    );

    int deleteAmountSponsorsByAmountNo(
        @Param("amountNo") int amountNo
    );


    // =========================================================
    // amount_file
    // =========================================================

    int insertAmountFile(Amount.File file);

    List<Amount.File> selectAmountFilesByAmountNo(
        @Param("amountNo") int amountNo
    );

    int deleteFile(
        @Param("amountattachmentNo") int amountattachmentNo
    );


    // =========================================================
    // Statistics
    // =========================================================

    Map<String, Object> getStatisticsSummary();

    List<Map<String, Object>> getDeptStatistics();

    List<Map<String, Object>> getMonthlyStatistics();

    List<Map<String, Object>> getItemStatistics();

}

