package com.kh.workflow.employee.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "비밀번호 변경 요청")
public class ChangePasswordRequest {

    @Schema(
        description = "현재 비밀번호",
        example = "currentPassword123!",
        format = "password"
    )
    private String currentPassword;

    @Schema(
        description = "새 비밀번호",
        example = "newPassword123!",
        format = "password"
    )
    private String newPassword;
}