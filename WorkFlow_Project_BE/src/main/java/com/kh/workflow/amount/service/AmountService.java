package com.kh.workflow.amount.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.amount.vo.Amount;
import com.kh.workflow.common.model.vo.PageInfo;

public interface AmountService {

    // 전체 게시글 개수 조회
    int getAmountListCount();

    // 비용 신청 등록
    int insertAmount(Amount amount);

    // 비용 상세 조회
    Amount selectAmountById(int amountNo);

    // 워케이션 번호 기준 전체 개수 조회
    int getAmountCountByWorkcationNo(int workcationNo);

    // 워케이션 번호 기준 페이징 목록 조회
    List<Amount> selectAmountListByWorkcationNo(
            int workcationNo,
            PageInfo pi
    );

    // 전체 목록 조회 (페이징 객체 기준)
    List<Amount> selectAmountList(PageInfo pi);

    // 결재 상태 변경
    int updateApprovalStatus(Amount amount);

    // 비용 신청 수정
    void updateAmount(
            Amount amount,
            List<MultipartFile> files
    );

    // 개별 파일 삭제
    int deleteFile(int amountattachmentNo);

    // 비용 신청 취소
    int cancelAmount(int amountNo);

    // 승인 및 지원금 동시 처리
    void updateApprovalWithSponsor(
            int amountNo,
            String status,
            int approvedAmount,
            String comment,
            String sponsorName,
            int sponsorAmount,
            String sponsorStatus,
            String remark
    );

    // 전체 통계 조회
    Map<String, Object> getFullStatistics();
}