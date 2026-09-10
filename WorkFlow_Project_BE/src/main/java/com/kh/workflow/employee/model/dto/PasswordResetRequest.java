package com.kh.workflow.employee.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "비밀번호 재설정 인증번호 요청")
public class PasswordResetRequest {

    @Schema(
        description = "직원 ID",
        example = "hong123"
    )
    private String empId;

    @Schema(
        description = "직원 이메일",
        example = "hong@example.com"
    )
    private String email;
}
