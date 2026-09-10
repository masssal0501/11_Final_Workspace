package com.kh.workflow.employee.model.service;

import java.util.List;

import com.kh.workflow.employee.model.dto.ChangePasswordRequest;
import com.kh.workflow.employee.model.dto.EmployeeCreateRequest;
import com.kh.workflow.employee.model.dto.EmployeeCreateResponse;
import com.kh.workflow.employee.model.dto.EmployeeResponse;
import com.kh.workflow.employee.model.dto.EmployeeRoleUpdateRequest;
import com.kh.workflow.employee.model.dto.EmployeeUpdateRequest;
import com.kh.workflow.employee.model.dto.FindIdRequest;
import com.kh.workflow.employee.model.dto.FindIdResponse;
import com.kh.workflow.employee.model.dto.LoginRequest;
import com.kh.workflow.employee.model.dto.LoginResponse;
import com.kh.workflow.employee.model.dto.PasswordResetRequest;
import com.kh.workflow.employee.model.dto.PasswordResetVerifyRequest;

public interface EmployeeService {

	/*
     * USR-001
     * 관리자 계정 등록
     */
    EmployeeCreateResponse createEmployee(
            EmployeeCreateRequest request
    );
    
    // 아이디 중복 확인
    boolean checkEmpIdDuplicate(String empId);


    /*
     * USR-002
     * 사용자 로그인
     */
    LoginResponse login(LoginRequest request);


    /*
     * USR-003
     * 사용자 로그아웃
     */
    void logout(
            Integer empNo
    );


    /*
     * USR-004
     * 비밀번호 재설정
     */
    void changePassword(
    	    String empId,
    	    ChangePasswordRequest request
    	);


    /*
     * USR-005
     * 마이페이지
     */
    EmployeeResponse getMyInfo(
            Integer empNo
    );


    /*
     * USR-006
     * 사용자 정보 수정
     */
    EmployeeResponse updateEmployee(
            Integer empNo,
            EmployeeUpdateRequest request
    );


    /*
     * USR-007
     * 계정 상태 변경
     */
    void updateEmployeeStatus(
            Integer empNo,
            String status
    );


    /*
     * USR-008
     * 계정 목록 조회
     */
    List<EmployeeResponse> getEmployeeList();
    
    //
    FindIdResponse findEmployeeId(
            FindIdRequest request
    );


    /*
     * USR-010
     * 계정 상세 조회
     */
    EmployeeResponse getEmployee(
            Integer empNo
    );


    /*
     * USR-011
     * 사원 역할 변경
     */
    void updateEmployeeRole(
            Integer empNo,
            EmployeeRoleUpdateRequest request
    );


    /*
     * 비밀번호 찾기 - 1단계
     * 인증번호 발송
     */
    void requestPasswordReset(
            PasswordResetRequest request
    );


    /*
     * 비밀번호 찾기 - 2단계
     * 인증번호 확인 후 임시 비밀번호 발급
     */
    void verifyPasswordResetCode(
            PasswordResetVerifyRequest request
    );

}
