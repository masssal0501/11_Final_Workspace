package com.kh.workflow.employee.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.config.jwt.JwtUtil;
import com.kh.workflow.employee.model.dao.EmployeeDao;
import com.kh.workflow.employee.model.dto.ChangePasswordRequest;
import com.kh.workflow.employee.model.dto.EmployeeCreateRequest;
import com.kh.workflow.employee.model.dto.EmployeeCreateResponse;
import com.kh.workflow.employee.model.dto.EmployeeResponse;
import com.kh.workflow.employee.model.dto.EmployeeUpdateRequest;
import com.kh.workflow.employee.model.dto.LoginRequest;
import com.kh.workflow.employee.model.dto.LoginResponse;
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.mail.MailService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeServiceImpl implements EmployeeService{

	@Autowired
	private EmployeeDao employeeDao;
	
	private final PasswordEncoder passwordEncoder;

    private final TemporaryPasswordGenerator passwordGenerator;

    private final MailService mailService;
	
    private final JwtUtil jwtUtil;
    
    // =========================================================
    // USR-001
    // 계정 등록
    // =========================================================

    @Override
    @Transactional
    public EmployeeCreateResponse createEmployee(EmployeeCreateRequest request) {
    	
    	// 사번(로그인 아이디) 중복 확인
        if (employeeDao.existsByEmpId(
                request.getEmpId()
        )) {

            throw new IllegalArgumentException(
                    "이미 등록된 사번입니다."
            );
        }


        // 이메일 중복 확인
        if (request.getEmail() != null
                && employeeDao.existsByEmail(
                        request.getEmail()
                )) {

            throw new IllegalArgumentException(
                    "이미 등록된 이메일입니다."
            );
        }


        // 임시 비밀번호 생성
        String temporaryPassword =
                passwordGenerator.generate(10);


        // BCrypt 암호화
        String encodedPassword =
                passwordEncoder.encode(
                        temporaryPassword
                );
        
    	
        // 1. Request DTO → Entity
        Employee employee = new Employee();

        employee.setEmpId(request.getEmpId());
        employee.setEmpPwd(encodedPassword);
        employee.setEmpName(request.getEmpName());
        employee.setPhone(request.getPhone());
        employee.setEmail(request.getEmail());
        employee.setAddress(request.getAddress());
        employee.setDepId(request.getDepId());
        employee.setAuthCode(request.getAuthCode());
        employee.setJobCode(request.getJobCode());

        // 2. 디버깅
        System.out.println("===== 직원 등록 데이터 =====");
        System.out.println("empId    : " + employee.getEmpId());
        System.out.println("empName  : " + employee.getEmpName());
        System.out.println("depId    : " + employee.getDepId());
        System.out.println("authCode : " + employee.getAuthCode());
        System.out.println("jobCode  : " + employee.getJobCode());
        System.out.println("password  : " + temporaryPassword);
        System.out.println("===========================");

        // 3. Entity 저장
        Employee savedEmployee = employeeDao.save(employee);

        // 임시 비밀번호 이메일 발송
        if (savedEmployee.getEmail() != null) {

            mailService.sendTemporaryPassword(
                    savedEmployee.getEmail(),
                    savedEmployee.getEmpName(),
                    savedEmployee.getEmpId(),
                    temporaryPassword
            );
        }
        
        // 4. Response DTO 반환
        return new EmployeeCreateResponse(
                savedEmployee.getEmpNo(),
                savedEmployee.getEmpId(),
                savedEmployee.getEmpName()
        );
    }
    
    /*
    @Override
    @Transactional
    public EmployeeCreateResponse createEmployee(
            EmployeeCreateRequest request
    ) {

        // 사번(로그인 아이디) 중복 확인
        if (employeeDao.existsByEmpId(
                request.getEmpId()
        )) {

            throw new IllegalArgumentException(
                    "이미 등록된 사번입니다."
            );
        }


        // 이메일 중복 확인
        if (request.getEmail() != null
                && employeeDao.existsByEmail(
                        request.getEmail()
                )) {

            throw new IllegalArgumentException(
                    "이미 등록된 이메일입니다."
            );
        }


        // 임시 비밀번호 생성
        String temporaryPassword =
                passwordGenerator.generate(10);


        // BCrypt 암호화
        String encodedPassword =
                passwordEncoder.encode(
                        temporaryPassword
                );


        // Employee Entity 생성
        Employee employee =
                Employee.builder()
                        .empId(request.getEmpId())
                        .empPwd(encodedPassword)
                        .empName(request.getEmpName())
                        .phone(request.getPhone())
                        .email(request.getEmail())
                        .address(request.getAddress())
                        .status("Y")
                        .pwChgRequired(true)
                        .depId(request.getDepId())
                        .authCode(request.getAuthCode())
                        .jobCode(request.getJobCode())
                        .build();

        System.out.println("===== 직원 등록 데이터 =====");
        System.out.println("empId    : " + employee.getEmpId());
        System.out.println("empName  : " + employee.getEmpName());
        System.out.println("depId    : " + employee.getDepId());
        System.out.println("authCode : " + employee.getAuthCode());
        System.out.println("jobCode  : " + employee.getJobCode());
        System.out.println("===========================");

        // DB 저장
        Employee savedEmployee =
        		employeeDao.save(employee);


        // 임시 비밀번호 이메일 발송
        if (savedEmployee.getEmail() != null) {

            mailService.sendTemporaryPassword(
                    savedEmployee.getEmail(),
                    savedEmployee.getEmpName(),
                    savedEmployee.getEmpId(),
                    temporaryPassword
            );
        }
    }
    
    */
    
    @Override
    public boolean checkEmpIdDuplicate (String empId) {
    	
    	return employeeDao.existsByEmpId(empId);
    }


    // =========================================================
    // USR-002
    // 사용자 로그인
    // =========================================================

    @Override
    public LoginResponse login(LoginRequest request) {
    	System.out.println("====== 진짜 해시값: " + passwordEncoder.encode("1234") + " ======");
        Employee employee =
        		employeeDao.findByEmpId(request.getEmpId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "아이디 또는 비밀번호가 올바르지 않습니다."
                                )
                        );


        // 계정 상태 확인
        if (!"Y".equals(employee.getStatus())) {

            throw new IllegalStateException(
                    "현재 사용할 수 없는 계정입니다."
            );
        }


        // 비밀번호 확인
        if (!passwordEncoder.matches(
        		request.getPassword(),
                employee.getEmpPwd()
        )) {

            throw new IllegalArgumentException(
                    "아이디 또는 비밀번호가 올바르지 않습니다."
            );
        }


        // JWT 생성
        String accessToken = jwtUtil.generateToken(
                employee.getEmpId(),
                employee.getAuthCode(),
                employee.getEmpNo()
        );

        return new LoginResponse(
                accessToken,
                employee.getEmpNo(),
                employee.getEmpId(),
                employee.getEmpName(),
                employee.getAuthCode(),
                employee.getDepId(),
                employee.getJobCode(),
                employee.getPwChgRequired()
        );
    }


    // =========================================================
    // USR-003
    // 사용자 로그아웃
    // =========================================================

    @Override
    public void logout(
            Integer empNo
    ) {

        /*
         * JWT 방식에서는 서버에서 별도의 세션 삭제가
         * 필요하지 않을 수 있음.
         *
         * 현재는 서비스 메서드만 정의하고
         * 실제 로그아웃 처리는 Security/JWT 구조에 맞춰 구현.
         */
    }


    // =========================================================
    // USR-004
    // 비밀번호 재설정
    // =========================================================

    @Override
    @Transactional
    public void changePassword(
    		String empId, ChangePasswordRequest request
    ) {

        Employee employee =
                employeeDao.findByEmpId(empId)
                .orElseThrow(() ->
                    new IllegalArgumentException(
                        "사용자를 찾을 수 없습니다."
                    )
                );

        // 현재 비밀번호 검증
        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                employee.getEmpPwd()
        )) {

            throw new IllegalArgumentException(
                "현재 비밀번호가 일치하지 않습니다."
            );
        }

        // 새 비밀번호 암호화
        String encodedPassword =
                passwordEncoder.encode(
                    request.getNewPassword()
                );

        employee.setEmpPwd(encodedPassword);

        // 비밀번호 변경 필요 상태 해제
        employee.setPwChgRequired(false);

        employeeDao.save(employee);
    }
    
//    @Override
//    @Transactional
//    public void resetPassword(
//            Integer empNo
//    ) {
//
//        Employee employee =
//        		employeeDao.findById(empNo)
//                        .orElseThrow(() ->
//                                new IllegalArgumentException(
//                                        "존재하지 않는 사용자입니다."
//                                )
//                        );
//
//
//        // 새로운 임시 비밀번호 생성
//        String temporaryPassword =
//                passwordGenerator.generate(10);
//
//
//        // BCrypt 암호화
//        String encodedPassword =
//                passwordEncoder.encode(
//                        temporaryPassword
//                );
//
//
//        employee.setEmpPwd(encodedPassword);
//
//        employee.setPwChgRequired(true);
//
//
//        // 이메일 발송
//        if (employee.getEmail() != null) {
//
//            mailService.sendTemporaryPassword(
//                    employee.getEmail(),
//                    employee.getEmpName(),
//                    employee.getEmpId(),
//                    temporaryPassword
//            );
//        }
//    }


    // =========================================================
    // USR-005
    // 마이페이지
    // =========================================================

    @Override
    public EmployeeResponse getMyInfo(
            Integer empNo
    ) {

        Employee employee =
        		employeeDao.findById(empNo)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "존재하지 않는 사용자입니다."
                                )
                        );

        return convertToResponse(employee);
    }


    // =========================================================
    // USR-006
    // 사용자 정보 수정
    // =========================================================

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(
            Integer empNo,
            EmployeeUpdateRequest request
    ) {

        Employee employee =
        		employeeDao.findById(empNo)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "존재하지 않는 사용자입니다."
                                )
                        );


        employee.setEmpName(
                request.getEmpName()
        );

        employee.setPhone(
                request.getPhone()
        );

        employee.setEmail(
                request.getEmail()
        );

        employee.setAddress(
                request.getAddress()
        );


        return convertToResponse(employee);
    }


    // =========================================================
    // USR-007
    // 계정 상태 변경
    // =========================================================

    @Override
    @Transactional
    public void updateEmployeeStatus(
            Integer empNo,
            String status
    ) {

        Employee employee =
        		employeeDao.findById(empNo)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "존재하지 않는 사용자입니다."
                                )
                        );


        employee.setStatus(status);
    }


    // =========================================================
    // USR-008
    // 계정 목록 조회
    // =========================================================

    @Override
    public List<EmployeeResponse> getEmployeeList() {

        return employeeDao.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =========================================================
    // USR-010
    // 계정 상세 조회
    // =========================================================

    @Override
    public EmployeeResponse getEmployee(
            Integer empNo
    ) {

        Employee employee =
        		employeeDao.findById(empNo)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "존재하지 않는 사용자입니다."
                                )
                        );

        return convertToResponse(employee);
    }


    // =========================================================
    // USR-011
    // 사원 역할 변경
    // =========================================================

    @Override
    @Transactional
    public void updateEmployeeRole(
            Integer empNo,
            String authCode
    ) {

        Employee employee =
        		employeeDao.findById(empNo)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "존재하지 않는 사용자입니다."
                                )
                        );


        employee.setAuthCode(authCode);
    }


    // =========================================================
    // Entity → DTO 변환
    // =========================================================

    private EmployeeResponse convertToResponse(
            Employee employee
    ) {

        return EmployeeResponse.builder()
                .empNo(employee.getEmpNo())
                .empId(employee.getEmpId())
                .empName(employee.getEmpName())
                .phone(employee.getPhone())
                .email(employee.getEmail())
                .address(employee.getAddress())
                .joinAt(employee.getJoinAt())
                .endAt(employee.getEndAt())
                .status(employee.getStatus())
                .pwChgRequired(
                        employee.getPwChgRequired()
                )
                .depId(employee.getDepId())
                .authCode(employee.getAuthCode())
                .jobCode(employee.getJobCode())
                .build();
    }

}
