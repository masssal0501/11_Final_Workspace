package com.kh.workflow.common.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

/**
 * 전역 예외 처리기.
 *
 * 이 프로젝트 전반의 Service 계층은 "대상을 찾을 수 없음" 오류와
 * "잘못된 입력값" 오류를 구분하지 않고 전부 {@link IllegalArgumentException}으로
 * 던지고 있고, 지금까지 이를 처리하는 @ControllerAdvice가 전혀 없어
 * 두 경우 모두 Spring Boot 기본 에러 처리로 흘러가 HTTP 500(Internal Server Error)이
 * 반환되고 있었다.
 *
 * (예: GET /employees/{존재하지 않는 empNo} → 실제로는 404가 되어야 하는데 500 반환)
 *
 * 기존 메시지 관례상 "대상을 찾을 수 없음" 계열 예외는 전부
 * "존재하지 않는" 또는 "찾을 수 없" 문구를 메시지에 포함하고 있으므로,
 * 이 문구 포함 여부로 404 / 400을 구분한다.
 *
 * 응답 JSON 형태는 기존 Spring Boot 기본 에러 응답과 동일한 필드
 * (timestamp/status/error/message/path)를 유지하여 기존 프런트엔드의
 * 에러 처리 로직(및 Axios interceptor)과 호환되도록 한다. API 응답 구조나
 * 정상 응답 DTO는 전혀 변경하지 않는다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String[] NOT_FOUND_KEYWORDS = {
        "존재하지 않는",
        "찾을 수 없"
    };

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
            IllegalArgumentException ex,
            WebRequest request
    ) {

        String message = ex.getMessage() == null ? "잘못된 요청입니다." : ex.getMessage();

        HttpStatus status = isNotFoundMessage(message)
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;

        return ResponseEntity
                .status(status)
                .body(buildBody(status, message, request));
    }

    private boolean isNotFoundMessage(String message) {

        for (String keyword : NOT_FOUND_KEYWORDS) {
            if (message.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    private Map<String, Object> buildBody(
            HttpStatus status,
            String message,
            WebRequest request
    ) {

        Map<String, Object> body = new LinkedHashMap<>();

        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("path", extractPath(request));

        return body;
    }

    private String extractPath(WebRequest request) {

        String description = request.getDescription(false);

        if (description.startsWith("uri=")) {
            return description.substring(4);
        }

        return description;
    }
}
