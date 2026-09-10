package com.kh.workflow.notice.dao;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.notice.vo.Notice;

public interface NoticeRepository extends JpaRepository<Notice, Integer> {

    // =========================================================
    // 목록/검색 (기존 notice-mapper.xml의 selectNoticeList/selectNoticeCount 대체)
    //
    // notice_status != 'UNVISIBLE' 조건과
    // "IMPORTANT 먼저, 그 다음 최신순" 정렬은 기존 MyBatis 쿼리와 동일
    // =========================================================

    @Query("""
        SELECT n FROM Notice n
        WHERE n.noticeStatus <> 'UNVISIBLE'
        ORDER BY CASE WHEN n.noticeStatus = 'IMPORTANT' THEN 0 ELSE 1 END, n.createdAt DESC
    """)
    Page<Notice> findAllVisible(Pageable pageable);

    @Query("""
        SELECT n FROM Notice n
        WHERE n.noticeStatus <> 'UNVISIBLE'
          AND n.noticeTitle LIKE CONCAT('%', :keyword, '%')
        ORDER BY CASE WHEN n.noticeStatus = 'IMPORTANT' THEN 0 ELSE 1 END, n.createdAt DESC
    """)
    Page<Notice> findByTitleVisible(@Param("keyword") String keyword, Pageable pageable);

    @Query("""
        SELECT n FROM Notice n
        WHERE n.noticeStatus <> 'UNVISIBLE'
          AND n.noticeContent LIKE CONCAT('%', :keyword, '%')
        ORDER BY CASE WHEN n.noticeStatus = 'IMPORTANT' THEN 0 ELSE 1 END, n.createdAt DESC
    """)
    Page<Notice> findByContentVisible(@Param("keyword") String keyword, Pageable pageable);

    // employee는 emp_no plain FK라 관계매핑이 없어 ad-hoc JOIN ON으로 처리
    @Query("""
        SELECT n FROM Notice n JOIN Employee e ON n.empNo = e.empNo
        WHERE n.noticeStatus <> 'UNVISIBLE'
          AND e.empName LIKE CONCAT('%', :keyword, '%')
        ORDER BY CASE WHEN n.noticeStatus = 'IMPORTANT' THEN 0 ELSE 1 END, n.createdAt DESC
    """)
    Page<Notice> findByWriterVisible(@Param("keyword") String keyword, Pageable pageable);

    @Query("""
        SELECT n FROM Notice n
        WHERE n.noticeStatus <> 'UNVISIBLE'
          AND (
              n.noticeTitle LIKE CONCAT('%', :keyword, '%')
              OR n.noticeContent LIKE CONCAT('%', :keyword, '%')
          )
        ORDER BY CASE WHEN n.noticeStatus = 'IMPORTANT' THEN 0 ELSE 1 END, n.createdAt DESC
    """)
    Page<Notice> findByTitleOrContentVisible(@Param("keyword") String keyword, Pageable pageable);
}
