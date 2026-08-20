package com.kh.workflow.amount.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper; // 📌 이 임포트가 필요합니다.

import com.kh.workflow.amount.vo.Amount;

@Mapper // 📌 이 어노테이션을 반드시 추가해야 MyBatis가 DAO를 Bean으로 인식합니다.
public interface AmountDao {

    int insertAmount(Amount amount);
    int insertAmountItem(Amount.Item item);
    int insertAmountSponsor(Amount.Sponsor sponsor);
    int insertAmountFile(Amount.File file);

    Amount selectAmountById(int amountNo);
    List<Amount> selectAmountListByWorkcationNo(int workcationNo);

    int updateAmount(Amount amount);
    int updateApprovalStatus(Amount amount);
    
    int deleteFile(int amountattachmentNo); 

    int cancelAmount(int amountNo);
    
    Integer findFirstItemNoByAmountNo(int amountNo);
    int upsertAmountSponsor(Amount.Sponsor sponsor);
    Map<String, Object> getStatisticsSummary();
    List<Map<String, Object>> getDeptStatistics();
    List<Map<String, Object>> getMonthlyStatistics();
}