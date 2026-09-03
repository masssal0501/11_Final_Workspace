package com.kh.workflow.amount.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.amount.model.vo.AmountItem;

public interface AmountItemDao extends JpaRepository<AmountItem, Integer> {

	void deleteByAmount_AmountNo(Integer amountNo);

	List<AmountItem> findByAmount_AmountNo(Integer integer);

}
