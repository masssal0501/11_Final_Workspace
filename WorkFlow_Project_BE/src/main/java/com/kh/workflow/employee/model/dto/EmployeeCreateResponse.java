package com.kh.workflow.employee.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmployeeCreateResponse {
	
	private Integer empNo;
	
	private String empId;
	
	private String empName;

}
