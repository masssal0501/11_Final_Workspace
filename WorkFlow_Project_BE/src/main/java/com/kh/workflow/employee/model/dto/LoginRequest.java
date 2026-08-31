package com.kh.workflow.employee.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    private String empId;

    private String password;
}