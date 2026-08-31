package com.kh.workflow.employee.model.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EmployeeResponse {

    private Integer empNo;

    private String empId;

    private String empName;

    private String phone;

    private String email;

    private String address;

    private LocalDateTime joinAt;

    private LocalDateTime endAt;

    private String status;

    private Boolean pwChgRequired;

    private String depId;

    private String authCode;

    private String jobCode;
}