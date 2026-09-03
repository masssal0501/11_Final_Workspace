package com.kh.workflow.employee.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Schema(description = "직원 ID 찾기 응답")
public class FindIdResponse {

    @Schema(
        description = "마스킹된 직원 ID",
        example = "hon***"
    )
    private String maskedEmpId;
}