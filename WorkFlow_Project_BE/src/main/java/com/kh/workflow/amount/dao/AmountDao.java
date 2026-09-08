package com.kh.workflow.amount.dao;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.amount.model.vo.Amount;
import com.kh.workflow.amount.model.vo.AmountFile;
import com.kh.workflow.amount.model.vo.AmountItem;
import com.kh.workflow.amount.model.vo.SupportList;

public interface AmountDao
        extends JpaRepository<Amount, Integer> {


    // =========================================================
    // amount
    // =========================================================

    // 전체 비용 신청 개수
    // JpaRepository.count() 사용


    // 전체 비용 신청 목록
    Page<Amount> findAllByOrderByCreatedAtDescAmountNoDesc(
            Pageable pageable
    );


    // 워케이션별 비용 신청 개수
    long countByWorkcationNo(
            Integer workcationNo
    );


    // 워케이션별 비용 신청 목록
    Page<Amount> findByWorkcationNoOrderByCreatedAtDescAmountNoDesc(
            Integer workcationNo,
            Pageable pageable
    );


    // 최근 비용 신청
    Amount findTopByOrderByAmountNoDesc();


    // =========================================================
    // 비용 수정
    // =========================================================

    @Modifying
    @Query("""
        UPDATE Amount a
        SET
            a.amountComment = :amountComment,
            a.updatedAt = CURRENT_TIMESTAMP
        WHERE a.amountNo = :amountNo
    """)
    int updateAmount(
            @Param("amountNo") int amountNo,
            @Param("amountComment") String amountComment
    );


    // =========================================================
    // 결재 상태 변경
    // =========================================================

    @Modifying
    @Query("""
        UPDATE Amount a
        SET
            a.status = :status,
            a.approvedAmount = :approvedAmount,
            a.amountComment = :amountComment,
            a.approvedAt =
                CASE
                    WHEN :status = 'A'
                    THEN CURRENT_TIMESTAMP
                    ELSE a.approvedAt
                END,
            a.updatedAt = CURRENT_TIMESTAMP
        WHERE a.amountNo = :amountNo
    """)
    int updateApprovalStatus(
            @Param("amountNo") int amountNo,
            @Param("status") String status,
            @Param("approvedAmount") int approvedAmount,
            @Param("amountComment") String amountComment
    );


    // =========================================================
    // 비용 신청 취소
    // =========================================================

    @Modifying
    @Query("""
        UPDATE Amount a
        SET
            a.status = 'C',
            a.updatedAt = CURRENT_TIMESTAMP
        WHERE a.amountNo = :amountNo
          AND a.status NOT IN ('A', 'J', 'C')
    """)
    int cancelAmount(
            @Param("amountNo") int amountNo
    );


    // =========================================================
    // amount_item
    // =========================================================

    List<AmountItem>
    findByAmount_AmountNoOrderByItemNoAsc(
            Integer amountNo
    );


    @Modifying
    @Query("""
        UPDATE AmountItem ai
        SET ai.itemAmount = :amount
        WHERE ai.itemNo = :itemNo
          AND ai.amount.amountNo = :amountNo
    """)
    int updateItemCompanySupport(
            @Param("itemNo") int itemNo,
            @Param("amountNo") int amountNo,
            @Param("amount") int amount
    );


    @Modifying
    @Query("""
        DELETE FROM AmountItem ai
        WHERE ai.amount.amountNo = :amountNo
    """)
    int deleteAmountItemsByAmountNo(
            @Param("amountNo") int amountNo
    );


    // =========================================================
    // support_list
    // =========================================================

    List<SupportList>
    findByAmount_AmountNoOrderBySupportNoAsc(
            Integer amountNo
    );


    @Modifying
    @Query("""
        DELETE FROM SupportList sl
        WHERE sl.amount.amountNo = :amountNo
    """)
    int deleteAmountSponsorsByAmountNo(
            @Param("amountNo") int amountNo
    );


    // =========================================================
    // amount_file
    // =========================================================

    List<AmountFile>
    findByAmount_AmountNoAndStatusOrderByAmountFileNoAsc(
            Integer amountNo,
            String status
    );


    @Modifying
    @Query("""
        DELETE FROM AmountFile af
        WHERE af.amountFileNo = :amountFileNo
    """)
    int deleteFile(
            @Param("amountFileNo") int amountFileNo
    );


    // =========================================================
    // Statistics
    // =========================================================

    @Query("""
        SELECT new map(
            COUNT(a.amountNo) as totalCount,
            COALESCE(SUM(a.approvedAmount), 0) as totalApprovedAmount
        )
        FROM Amount a
    """)
    Map<String, Object> getStatisticsSummary();

}