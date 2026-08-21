package com.kh.workflow.amount.service;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.amount.dao.AmountDao;
import com.kh.workflow.amount.vo.Amount;

@Service
public class AmountServiceImpl implements AmountService {

    private final AmountDao amountDao;

    public AmountServiceImpl(AmountDao amountDao) {
        this.amountDao = amountDao;
    }

    @Override
    @Transactional
    public int insertAmount(Amount amount) {
        if (amount.getStatus() == null || amount.getStatus().trim().isEmpty()) {
            amount.setStatus("R");
        }

        int result = amountDao.insertAmount(amount);
        int generatedAmountNo = amount.getAmountNo();

        if (result <= 0 || generatedAmountNo <= 0) {
            throw new RuntimeException("비용 기본 정보 등록 실패");
        }

        if (amount.getItemList() != null && !amount.getItemList().isEmpty()) {
            for (Amount.Item item : amount.getItemList()) {
                item.setAmountNo(generatedAmountNo);
                amountDao.insertAmountItem(item);

                if (item.getSponsorList() != null && !item.getSponsorList().isEmpty()) {
                    for (Amount.Sponsor sponsor : item.getSponsorList()) {
                        sponsor.setAmountNo(generatedAmountNo);
                        sponsor.setItemNo(item.getItemNo());
                        amountDao.insertAmountSponsor(sponsor);
                    }
                }
            }
        }

        if (amount.getFileList() != null && !amount.getFileList().isEmpty()) {
            for (Amount.File file : amount.getFileList()) {
                file.setAmountNo(generatedAmountNo);
                amountDao.insertAmountFile(file);
            }
        }

        return result;
    }

    @Override
    public Amount selectAmountById(int amountNo) {
        // resultMap이 조인된 쿼리 결과를 보고 itemList, fileList 등을 알아서 매핑해서 채워줍니다!
        return amountDao.selectAmountById(amountNo);
    }

    @Override
    public List<Amount> selectAmountListByWorkcationNo(int workcationNo) {
        return amountDao.selectAmountListByWorkcationNo(workcationNo);
    }

    @Override
    @Transactional
    public int updateApprovalStatus(Amount amount) {
        Amount existingAmount = amountDao.selectAmountById(amount.getAmountNo());
        if (existingAmount == null) {
            throw new IllegalArgumentException("존재하지 않는 비용 신청 건입니다. (amountNo: " + amount.getAmountNo() + ")");
        }

        if (amount.getApprovedAmount() != null) {
            if (amount.getApprovedAmount() > existingAmount.getRequestedAmount()) {
                throw new IllegalArgumentException(
                    "승인 금액(" + String.format("%,d", amount.getApprovedAmount()) + "원)은 신청 금액(" 
                    + String.format("%,d", existingAmount.getRequestedAmount()) + "원)을 초과할 수 없습니다."
                );
            }
        }

        return amountDao.updateApprovalStatus(amount);
    }

    @Override
    @Transactional
    public void updateAmount(Amount amount, MultipartFile file) {
        // 1. 기존 데이터 조회 및 검증
        Amount existing = amountDao.selectAmountById(amount.getAmountNo());
        if (existing == null) {
            throw new IllegalArgumentException("존재하지 않는 비용 신청 건입니다.");
        }

        if ("A".equals(existing.getStatus()) || "J".equals(existing.getStatus()) || "C".equals(existing.getStatus())) {
            throw new IllegalArgumentException("승인, 반려 또는 취소된 신청 건은 수정할 수 없습니다.");
        }

        // 2. 파일 수정 로직 (기존 유지)
        if (file != null && !file.isEmpty()) {
            if (existing.getFileList() != null && !existing.getFileList().isEmpty()) {
                for (Amount.File f : existing.getFileList()) {
                    File targetFile = new File("C:/upload/receipts/" + f.getChangeName());
                    if (targetFile.exists()) {
                        targetFile.delete();
                    }
                    amountDao.deleteFile(f.getAmountattachmentNo()); 
                }
            }

            try {
                String uploadDir = "C:/upload/receipts/";
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();

                String originalFilename = file.getOriginalFilename();
                String savedFilename = UUID.randomUUID().toString() + "_" + originalFilename;
                
                File destFile = new File(uploadDir + savedFilename);
                file.transferTo(destFile);

                Amount.File newFile = new Amount.File();
                newFile.setAmountNo(amount.getAmountNo());
                newFile.setOriginName(originalFilename);
                newFile.setChangeName(savedFilename);
                newFile.setFilePath("/upload/receipts/" + savedFilename);

                amountDao.insertAmountFile(newFile);
            } catch (Exception e) {
                throw new RuntimeException("파일 수정 중 오류가 발생했습니다: " + e.getMessage());
            }
        }

        // 3. 메인 비용 정보 업데이트
        amountDao.updateAmount(amount);

        // 📌 4. 상세 항목(itemList) 수정 반영: 기존 항목 삭제 후 새로 등록
        amountDao.deleteAmountItemsByAmountNo(amount.getAmountNo());

        if (amount.getItemList() != null && !amount.getItemList().isEmpty()) {
            for (Amount.Item item : amount.getItemList()) {
                item.setAmountNo(amount.getAmountNo());
                amountDao.insertAmountItem(item);
                
                // 지원금 리스트가 있다면 함께 처리
                if (item.getSponsorList() != null && !item.getSponsorList().isEmpty()) {
                    for (Amount.Sponsor sponsor : item.getSponsorList()) {
                        sponsor.setAmountNo(amount.getAmountNo());
                        sponsor.setItemNo(item.getItemNo());
                        amountDao.insertAmountSponsor(sponsor);
                    }
                }
            }
        }
    }

    @Override
    @Transactional
    public int cancelAmount(int amountNo) {
        Amount existing = amountDao.selectAmountById(amountNo);
        if (existing == null) {
            throw new IllegalArgumentException("존재하지 않는 비용 신청 건입니다.");
        }
        if ("A".equals(existing.getStatus())) {
            throw new IllegalArgumentException("이미 승인된 비용 신청 건은 취소할 수 없습니다.");
        }
        
        existing.setStatus("C");
        return amountDao.updateApprovalStatus(existing);
    }
    
    @Transactional
    public void updateApprovalWithSponsor(int amountNo, String status, int approvedAmount, String comment, 
                                          String sponsorName, int sponsorAmount, String sponsorStatus, String remark) {
        // 1. 기존 amount 상태 및 승인금액 업데이트
        Amount amount = new Amount();
        amount.setAmountNo(amountNo);
        amount.setStatus(status);
        amount.setApprovedAmount(approvedAmount);
        amount.setAmountComment(comment);
        amountDao.updateApprovalStatus(amount);

        // 2. '승인(A)' 상태일 때 지원금 처리
        if ("A".equals(status)) {
            // 📌 지원금 기관명이 있거나 금액이 입력된 경우에만 처리 (0원 허용 또는 선택적 입력)
            if (sponsorName != null && !sponsorName.trim().isEmpty()) {
                Integer itemNo = amountDao.findFirstItemNoByAmountNo(amountNo); 

                if (itemNo != null) {
                    Amount.Sponsor sponsor = new Amount.Sponsor();
                    sponsor.setAmountNo(amountNo);
                    sponsor.setItemNo(itemNo);
                    sponsor.setSponsorName(sponsorName);
                    sponsor.setAmount(sponsorAmount); // 0원도 허용
                    sponsor.setStatus(sponsorStatus != null ? sponsorStatus : "UNPAID");
                    sponsor.setRemark(remark);
                    
                    // MyBatis 쿼리로 INSERT 또는 DUPLICATE KEY UPDATE 처리
                    amountDao.upsertAmountSponsor(sponsor);
                }
            }
        }
    }
    
 // 📌 [신규 추가] 통계 데이터 통합 조회 서비스
    @Override
    public Map<String, Object> getFullStatistics() {
        Map<String, Object> response = new HashMap<>();
        
        // 1. 요약 데이터 (총 승인금액, 평균 등)
        Map<String, Object> summary = amountDao.getStatisticsSummary();
        if (summary != null) {
            response.putAll(summary);
        }
        
        // 2. 부서별 사용 금액 데이터 (List)
        response.put("deptData", amountDao.getDeptStatistics());
        
        // 3. 월별 참가 현황 데이터 (List)
        response.put("monthlyData", amountDao.getMonthlyStatistics());
        
        // (참고) 항목별 지출 데이터는 현재 항목 테이블 구조에 맞춰 추후 추가 가능
        response.put("itemData", amountDao.getItemStatistics());

        return response;
    }
}