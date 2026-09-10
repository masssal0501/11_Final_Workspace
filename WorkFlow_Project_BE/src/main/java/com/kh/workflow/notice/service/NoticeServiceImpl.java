package com.kh.workflow.notice.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.employee.model.dao.EmployeeDao;
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.notice.dao.NoticeRepository;
import com.kh.workflow.notice.vo.Notice;

@Service
public class NoticeServiceImpl implements NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private EmployeeDao employeeDao;


    // =========================================================
    // 검색/페이징 공통 처리
    //
    // map: offset, limit, condition(title/content/writer/그 외=제목+내용), keyword
    // 기존 notice-mapper.xml의 <choose> 조건 분기를 그대로 반영
    // =========================================================

    private Page<Notice> searchPage(Map<String, Object> map) {

        int offset = ((Number) map.get("offset")).intValue();
        int limit = ((Number) map.get("limit")).intValue();
        String condition = (String) map.get("condition");
        String keyword = (String) map.get("keyword");

        // offset은 (page - 1) * limit 형태로 컨트롤러에서 계산되어 넘어오므로
        // Pageable의 page 번호로 되돌리기 위해 다시 나눔
        int pageNumber = limit > 0 ? offset / limit : 0;
        Pageable pageable = PageRequest.of(pageNumber, limit);

        if (keyword == null || keyword.isBlank()) {
            return noticeRepository.findAllVisible(pageable);
        }

        if ("title".equals(condition)) {
            return noticeRepository.findByTitleVisible(keyword, pageable);
        }

        if ("content".equals(condition)) {
            return noticeRepository.findByContentVisible(keyword, pageable);
        }

        if ("writer".equals(condition)) {
            return noticeRepository.findByWriterVisible(keyword, pageable);
        }

        return noticeRepository.findByTitleOrContentVisible(keyword, pageable);
    }


    // 목록 조회 결과에 작성자 이름(emp_name)을 채워넣음
    // (emp_no가 관계매핑이 아닌 plain FK라 서비스 계층에서 일괄 조회 후 매핑)
    private void attachEmpNames(List<Notice> list) {

        if (list.isEmpty()) {
            return;
        }

        Set<Integer> empNos =
                list.stream()
                        .map(Notice::getEmpNo)
                        .collect(Collectors.toSet());

        Map<Integer, String> empNoToName =
                employeeDao.findAllById(empNos)
                        .stream()
                        .collect(Collectors.toMap(
                                Employee::getEmpNo,
                                Employee::getEmpName
                        ));

        list.forEach(n ->
                n.setEmpName(empNoToName.get(n.getEmpNo()))
        );
    }


    // =========================================================
    // 공지사항 총 개수 조회
    // =========================================================

    @Override
    public int selectNoticeCount(Map<String, Object> map) {

        return (int) searchPage(map).getTotalElements();
    }


    // =========================================================
    // 공지사항 목록 조회
    // =========================================================

    @Override
    public ArrayList<Notice> selectNoticeList(Map<String, Object> map) {

        List<Notice> list = searchPage(map).getContent();

        attachEmpNames(list);

        return new ArrayList<>(list);
    }


    // =========================================================
    // 공지사항 상세 조회
    // =========================================================

    @Override
    public Notice selectNotice(int noticeNo) {

        Notice notice =
                noticeRepository.findById(noticeNo)
                        .orElse(null);

        if (notice != null) {

            employeeDao.findById(notice.getEmpNo())
                    .ifPresent(e ->
                            notice.setEmpName(e.getEmpName())
                    );
        }

        return notice;
    }


    // =========================================================
    // 공지사항 등록
    // =========================================================

    @Transactional
    @Override
    public int insertNotice(Notice n) {

        n.setCreatedAt(LocalDateTime.now());

        if (n.getViewCount() == null) {
            n.setViewCount(0);
        }

        noticeRepository.save(n);

        return 1;
    }


    // =========================================================
    // 공지사항 수정
    // =========================================================

    @Transactional
    @Override
    public int updateNotice(Notice n) {

        Notice existing =
                noticeRepository.findById(n.getNoticeNo())
                        .orElse(null);

        if (existing == null) {
            return 0;
        }

        existing.setNoticeTitle(n.getNoticeTitle());
        existing.setNoticeContent(n.getNoticeContent());
        existing.setNoticeStatus(n.getNoticeStatus());

        noticeRepository.save(existing);

        return 1;
    }


    // =========================================================
    // 공지사항 삭제
    // =========================================================

    @Transactional
    @Override
    public int deleteNotice(int noticeNo) {

        if (!noticeRepository.existsById(noticeNo)) {
            return 0;
        }

        noticeRepository.deleteById(noticeNo);

        return 1;
    }


    // =========================================================
    // 로그인 ID로 사원번호 조회
    // =========================================================

    @Override
    public Integer selectEmpNoByLoginId(String loginId) {

        return employeeDao.findByEmpId(loginId)
                .map(Employee::getEmpNo)
                .orElse(null);
    }


    // =========================================================
    // 관리자 권한 확인
    //
    // employee.auth_code = 'ADMIN'
    //
    // 기존 MyBatis 구현은 NoticeDao.isAdmin()이 존재하지 않는
    // statement id("noticeMapper.isAdmin")를 호출해 항상 예외가 발생했던
    // 버그가 있었음(실제 정의는 selectIsAdminByLoginId) - JPA 전환하면서
    // EmployeeDao 기반의 직접 조회로 교체해 근본적으로 해결
    // =========================================================

    @Override
    public boolean isAdmin(String loginId) {

        return employeeDao.findByEmpId(loginId)
                .map(e -> "ADMIN".equals(e.getAuthCode()))
                .orElse(false);
    }

}
