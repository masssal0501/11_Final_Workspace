package com.kh.workflow.amount.dao;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.kh.workflow.amount.model.vo.Amount;

@Repository
public interface AmountDao extends JpaRepository<Amount, Integer> {
    // 워케이션 번호로 비용 신청 내역 조회 등 필요에 따라 확장 가능
    List<Amount> findByWorkcationNo(Integer workcationNo);
}