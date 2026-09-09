package com.kh.workflow.config.jwt;

import java.io.IOException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 인가 실패(Authorization) 핸들러.
 *
 * 인증은 정상적으로 됐지만(SecurityContext에 Authentication 존재) 요청한 리소스에 대한
 * 권한(Role)이 부족한 경우에만 ExceptionTranslationFilter가 이 핸들러를 호출한다.
 * (예: STAFF/MANAGER 계정으로 ADMIN 전용 API를 호출하는 경우)
 *
 * JwtAuthenticationEntryPoint(401 - 인증 실패/JWT 만료)와 명확히 구분되는 응답(403)을 내려줘야
 * 프론트엔드가 "자동 로그아웃"과 "에러 페이지 이동"을 올바르게 분기할 수 있다.
 */
@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException {

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");

        response.getWriter().write(
                "{\"status\":403,\"error\":\"Forbidden\","
                + "\"message\":\"해당 리소스에 접근할 권한이 없습니다.\"}"
        );
    }
}
