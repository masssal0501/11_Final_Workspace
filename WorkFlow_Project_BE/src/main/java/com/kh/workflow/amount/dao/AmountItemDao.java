package com.kh.workflow.amount.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.amount.model.vo.AmountItem;

public interface AmountItemDao extends JpaRepository<AmountItem, Integer> {

	List<AmountItem> findByAmount_AmountNo(Integer amountNo);

    // 👈 삭제 쿼리 동작을 위해 어노테이션 필수
    @Modifying
    @Transactional
    void deleteByAmount_AmountNo(Integer amountNo);
}
