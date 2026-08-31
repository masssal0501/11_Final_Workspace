package com.kh.workflow.employee.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeRoleUpdateRequest {

    private String authCode;

    private String depId;

    private String jobCode;
}