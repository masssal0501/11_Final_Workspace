package com.kh.workflow.employee.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.workflow.employee.model.dto.EmployeeCreateRequest;
import com.kh.workflow.employee.model.dto.EmployeeCreateResponse;
import com.kh.workflow.employee.model.dto.EmployeeResponse;
import com.kh.workflow.employee.model.dto.EmployeeUpdateRequest;
import com.kh.workflow.employee.model.service.EmployeeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;


    // USR-001
    @PostMapping
    public ResponseEntity<EmployeeCreateResponse> createEmployee(
            @RequestBody EmployeeCreateRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(employeeService.createEmployee(request));
    }


    // 아이디 중복 검사
    @GetMapping("/checkId")
    public ResponseEntity<Boolean> checkEmpId(
            @RequestParam String empId
    ) {

        boolean duplicated =
                employeeService.checkEmpIdDuplicate(empId);

        return ResponseEntity.ok(duplicated);
    }


    // USR-002
    @PostMapping("/login")
    public ResponseEntity<EmployeeResponse> login(
            @RequestParam String empId,
            @RequestParam String empPwd
    ) {

        return ResponseEntity.ok(
                employeeService.login(empId, empPwd)
        );
    }


    // USR-005
    @GetMapping("/{empNo}")
    public ResponseEntity<EmployeeResponse> getEmployee(
            @PathVariable Integer empNo
    ) {

        return ResponseEntity.ok(
                employeeService.getEmployee(empNo)
        );
    }


    // USR-006
    @PutMapping("/{empNo}")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable Integer empNo,
            @RequestBody EmployeeUpdateRequest request
    ) {

        return ResponseEntity.ok(
                employeeService.updateEmployee(
                        empNo,
                        request
                )
        );
    }


    // USR-007
    @PatchMapping("/{empNo}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Integer empNo,
            @RequestParam String status
    ) {

        employeeService.updateEmployeeStatus(
                empNo,
                status
        );

        return ResponseEntity.noContent().build();
    }


    // USR-008
    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getEmployeeList() {

        return ResponseEntity.ok(
                employeeService.getEmployeeList()
        );
    }


    // USR-011
    @PatchMapping("/{empNo}/role")
    public ResponseEntity<Void> updateRole(
            @PathVariable Integer empNo,
            @RequestParam String authCode
    ) {

        employeeService.updateEmployeeRole(
                empNo,
                authCode
        );

        return ResponseEntity.noContent().build();
    }
}