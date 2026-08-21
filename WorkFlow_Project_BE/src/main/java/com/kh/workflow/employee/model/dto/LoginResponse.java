package com.kh.workflow.employee.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    private String accessToken;

    private Integer empNo;

    private String empId;

    private String empName;

    private String authCode;

    private String depId;

    private String jobCode;
}