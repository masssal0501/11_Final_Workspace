package com.kh.workflow.amount.model.service;

import java.util.List;
import com.kh.workflow.amount.model.vo.Amount;

public interface AmountService {
    List<Amount> selectAmountList();
    Amount selectAmountById(Integer amountNo);
    void insertAmount(Amount amount);
}