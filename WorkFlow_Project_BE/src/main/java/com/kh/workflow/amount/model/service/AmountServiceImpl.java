package com.kh.workflow.amount.model.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.amount.dao.AmountDao;
import com.kh.workflow.amount.model.vo.Amount;

@Service
public class AmountServiceImpl implements AmountService {

    @Autowired
    private AmountDao amountDao;

    @Override
    public List<Amount> selectAmountList() {
        return amountDao.findAll();
    }

    @Override
    public Amount selectAmountById(Integer amountNo) {
        return amountDao.findById(amountNo)
                .orElseThrow(() -> new IllegalArgumentException("해당 비용 신청 내역이 존재하지 않습니다. ID: " + amountNo));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void insertAmount(Amount amount) {
        if (amount == null) {
            throw new IllegalArgumentException("비용 신청 데이터가 없습니다.");
        }

        // 등록일시 및 초기 상태 세팅 (필요시 조정)
        if (amount.getCreatedAt() == null) {
            amount.setCreatedAt(LocalDateTime.now());
        }
        if (amount.getRequestedAt() == null) {
            amount.setRequestedAt(LocalDateTime.now());
        }
        if (amount.getStatus() == null) {
            amount.setStatus("W"); // 대기 상태 등 기본값
        }

        // 양방향 연관관계 편의 메서드: 하위 엔티티들에 부모(Amount) 객체 참조 연결
        if (amount.getItemList() != null) {
            amount.getItemList().forEach(item -> item.setAmount(amount));
        }
        if (amount.getSupportList() != null) {
            amount.getSupportList().forEach(support -> support.setAmount(amount));
        }
        if (amount.getAmountFile() != null) {
            amount.getAmountFile().forEach(file -> file.setAmount(amount));
        }

        amountDao.save(amount); // Cascade.ALL 설정으로 연관된 Item, Support, File이 한 번에 저장됨
    }
}