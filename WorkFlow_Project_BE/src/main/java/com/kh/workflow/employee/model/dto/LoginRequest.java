package com.kh.workflow.employee.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "로그인 요청")
public class LoginRequest {

    @Schema(
        description = "직원 로그인 ID",
        example = "hong123"
    )
    private String empId;

    @Schema(
        description = "비밀번호",
        example = "password123!",
        format = "password"
    )
    private String password;
}