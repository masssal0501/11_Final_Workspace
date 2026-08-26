package com.kh.workflow.employee.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeCreateRequest {

	private String empId;
	
	private String empName;
	
	private String phone;
	
	private String email;
	
	private String address;
	
	private String depId;
	
	private String authCode;
	
	private String jobCode;
}
