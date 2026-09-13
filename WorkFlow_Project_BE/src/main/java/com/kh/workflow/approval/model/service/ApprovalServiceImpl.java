package com.kh.workflow.approval.model.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.kh.workflow.approval.model.dao.ApprovalDao;
import com.kh.workflow.employee.model.dao.EmployeeDao;
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

@Service
public class ApprovalServiceImpl implements ApprovalService {

    @Autowired
    private ApprovalDao approvalDao;

    @Autowired
    private EmployeeDao employeeDao;

    // BUG-004: 신청자/승인자를 "부서코드-직원명"이 아니라 "부서명-직원명"으로 표시하기 위해
    // 이미 있는 EmployeeDao.selectDepTitle(depId)로 부서명을 조회해 응답 전용 Transient
    // 필드(Employee.depTitle)에 채워 넣는다. DB 스키마/엔티티 매핑은 변경하지 않는다.
    private void fillDepTitle(Employee employee) {

        if (employee == null || employee.getDepId() == null) {
            return;
        }

        employee.setDepTitle(employeeDao.selectDepTitle(employee.getDepId()));
    }

    // 승인 이력 목록 조회
    @Override
    public Page<WorkcationInfo> selectApprovalList(
    		String authCode,
    		Integer empNo,
    		String depId,
            String searchType,
            String keyword,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        Page<WorkcationInfo> page = approvalDao.searchApprovalHistory(
        		authCode,
        		empNo,
        		depId,
                searchType,
                keyword,
                startDate,
                endDate,
                pageable
        );

        // BUG-01: 상세 조회(selectApproval)에만 부서명 채우기가 적용되어 있어 목록
        // 화면(승인 이력)에는 신청자/승인자 부서가 여전히 코드로만 내려가고 있었다.
        page.getContent().forEach(w -> {
            fillDepTitle(w.getEmployee());
            fillDepTitle(w.getApprover());
        });

        return page;
    }

    // 승인 이력 상세 조회
    @Override
    public WorkcationInfo selectApproval(int workcationNo) {

        WorkcationInfo workcationInfo = approvalDao.findApprovalDetail(workcationNo);

        if (workcationInfo != null) {
            fillDepTitle(workcationInfo.getEmployee());
            fillDepTitle(workcationInfo.getApprover());
        }

        return workcationInfo;
    }

    // 승인 대기 상세 조회 (상태 제한 없음)
    @Override
    public WorkcationInfo selectApprovalQueueDetail(int workcationNo) {

        WorkcationInfo workcationInfo = approvalDao.findApprovalQueueDetail(workcationNo);

        if (workcationInfo != null) {
            fillDepTitle(workcationInfo.getEmployee());
            fillDepTitle(workcationInfo.getApprover());
        }

        return workcationInfo;
    }

    // 반려 처리
    @Override
    public WorkcationInfo rejectApproval(WorkcationInfo w) {

        return approvalDao.save(w);
    }

    // 승인 대기 목록 조회
    @Override
    public Page<WorkcationInfo> selectApprovalQueueList(
    		String authCode,
    		Integer empNo,
    		String depId,    		
            String status,
            String searchType,
            String keyword,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        // BUG-NEW: TODO-N03에서 추가된 최종완료("D") 상태가 이 제외 목록에 반영되지 않아
        // 이미 모든 처리가 끝난 건이 승인 대기 목록에 계속 남아 보이던 문제.
        Page<WorkcationInfo> page = approvalDao.searchApprovalQueue(
        		authCode,
        		empNo,
        		depId,
                List.of("A", "C", "J", "D"),
                status,
                searchType,
                keyword,
                startDate,
                endDate,
                pageable
        );

        // BUG-01: 승인 대기 목록도 이력 목록과 동일하게 부서명을 채워서 내려준다.
        page.getContent().forEach(w -> {
            fillDepTitle(w.getEmployee());
            fillDepTitle(w.getApprover());
        });

        return page;
    }

}