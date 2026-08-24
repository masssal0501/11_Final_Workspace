package com.kh.workflow.amount.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.amount.vo.Amount;

public interface AmountService {

    int insertAmount(Amount amount);

    Amount selectAmountById(int amountNo);

    List<Amount> selectAmountListByWorkcationNo(int workcationNo);

    int updateApprovalStatus(Amount amount);

    // 📌 컨트롤러와 일치하도록 파일 매개변수 추가
    void updateAmount(
            Amount amount,
            List<MultipartFile> files
        );

    int cancelAmount(int amountNo);
    
    void updateApprovalWithSponsor(int amountNo, String status, int approvedAmount, String comment, 
            String sponsorName, int sponsorAmount, String sponsorStatus, String remark);

    Map<String, Object> getFullStatistics();
}