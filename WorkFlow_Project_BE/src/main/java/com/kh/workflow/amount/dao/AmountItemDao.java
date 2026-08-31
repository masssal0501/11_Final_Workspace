package com.kh.workflow.amount.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.amount.model.vo.AmountItem;

public interface AmountItemDao extends JpaRepository<AmountItem, Integer> {

}
