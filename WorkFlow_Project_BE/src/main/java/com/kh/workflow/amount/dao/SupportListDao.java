package com.kh.workflow.amount.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.amount.model.vo.SupportList;

public interface SupportListDao extends JpaRepository<SupportList, Integer> {

	@Modifying
	@Transactional
	@Query("DELETE FROM SupportList s WHERE s.amount.amountNo = :amountNo")
	void deleteByAmount_AmountNo(Integer amountNo);

	List<SupportList> findByAmount_AmountNo(Integer amountNo);

}
