package com.kh.workflow.amount.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.amount.model.vo.Amount;

public interface AmountSupportDao extends JpaRepository<Amount, Integer> {

}
