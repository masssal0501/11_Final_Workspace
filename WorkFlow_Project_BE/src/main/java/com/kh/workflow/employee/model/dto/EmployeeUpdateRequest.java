package com.kh.workflow.employee.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeUpdateRequest {

    private String empName;

    private String phone;

    private String email;

    private String address;
}
