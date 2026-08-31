package com.kh.workflow.amount.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.workflow.amount.model.service.AmountService;
import com.kh.workflow.amount.model.vo.Amount;

@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
@RestController
@RequestMapping("/amount")
public class AmountController {

    @Autowired
    private AmountService amountService;

    // 비용 신청 전체 목록 조회
    @GetMapping("/list")
    public ResponseEntity<List<Amount>> selectAmountList() {
        List<Amount> list = amountService.selectAmountList();
        return ResponseEntity.ok(list);
    }

    // 비용 신청 상세 조회
    @GetMapping("/{amountNo}")
    public ResponseEntity<Amount> selectAmountDetail(@PathVariable Integer amountNo) {
        Amount amount = amountService.selectAmountById(amountNo);
        return ResponseEntity.ok(amount);
    }

    // 비용 신청 등록 (항목, 지원금 내역, 파일 목록 포함)
    @PostMapping("/enroll")
    public ResponseEntity<String> insertAmount(@RequestBody Amount amount) {
        amountService.insertAmount(amount);
        return ResponseEntity.ok("비용 신청이 성공적으로 완료되었습니다.");
    }
}