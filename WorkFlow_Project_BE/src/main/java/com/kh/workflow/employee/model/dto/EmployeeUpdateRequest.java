package com.kh.workflow.employee.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "직원 정보 수정 요청")
public class EmployeeUpdateRequest {

    @Schema(
        description = "직원 이름",
        example = "홍길동"
    )
    private String empName;

    @Schema(
        description = "전화번호",
        example = "010-1234-5678"
    )
    private String phone;

    @Schema(
        description = "이메일",
        example = "hong@example.com"
    )
    private String email;

    @Schema(
        description = "주소",
        example = "서울특별시 중구 세종대로 110"
    )
    private String address;
}