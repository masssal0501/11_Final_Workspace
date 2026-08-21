package com.kh.workflow.amount.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.kh.workflow.amount.vo.Amount;

@Mapper
public interface AmountDao {

    int insertAmount(Amount amount);
    int insertAmountItem(Amount.Item item);
    int insertAmountSponsor(Amount.Sponsor sponsor);
    int insertAmountFile(Amount.File file);

    Amount selectAmountById(int amountNo);
    List<Amount> selectAmountListByWorkcationNo(int workcationNo);

    // 📌 [추가] 상세 항목 및 첨부파일 조회 메서드
    List<Amount.Item> selectAmountItemsByAmountNo(int amountNo);
    List<Amount.Sponsor> selectSponsorsByItemNo(int itemNo);
    List<Amount.File> selectAmountFilesByAmountNo(int amountNo);

    int updateAmount(Amount amount);
    int updateApprovalStatus(Amount amount);
    
    int deleteFile(int amountattachmentNo); 

    int cancelAmount(int amountNo);
    
    Integer findFirstItemNoByAmountNo(int amountNo);
    int upsertAmountSponsor(Amount.Sponsor sponsor);
    Map<String, Object> getStatisticsSummary();
    List<Map<String, Object>> getDeptStatistics();
    List<Map<String, Object>> getMonthlyStatistics();
    
    int deleteAmountItemsByAmountNo(int amountNo);
    List<Map<String, Object>> getItemStatistics();
}