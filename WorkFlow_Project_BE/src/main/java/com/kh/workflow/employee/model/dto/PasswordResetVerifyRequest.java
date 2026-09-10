package com.kh.workflow.employee.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "비밀번호 재설정 인증번호 확인")
public class PasswordResetVerifyRequest {

    @Schema(
        description = "직원 ID",
        example = "hong123"
    )
    private String empId;

    @Schema(
        description = "이메일로 발송된 인증번호",
        example = "482913"
    )
    private String verificationCode;
}
