package com.kh.workflow.config.jwt;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 인증 실패(Authentication) 진입점.
 *
 * 이 프로젝트는 커스텀 AuthenticationEntryPoint/AccessDeniedHandler가 전혀 등록되어 있지 않아
 * formLogin/httpBasic도 쓰지 않는 상태에서는 Spring Security의 기본 폴백인
 * Http403ForbiddenEntryPoint가 "인증 자체가 안 된 요청"에도 그대로 사용되고 있었다.
 * 그 결과 (1) JWT가 없거나 만료/위조된 요청과 (2) 인증은 됐지만 권한이 부족한 요청이
 * 구분 없이 전부 403으로 응답되어, 프론트엔드가 "로그아웃해야 하는 상황(401)"과
 * "에러 페이지로 보내야 하는 상황(403)"을 구분할 방법이 없었다.
 *
 * ExceptionTranslationFilter는 인증되지 않은(또는 익명) 요청에 한해 이 EntryPoint를 호출하므로,
 * 이 클래스는 정확히 "JWT 없음 / JWT 만료 / JWT 위조" 상황에서만 호출된다.
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");

        response.getWriter().write(
                "{\"status\":401,\"error\":\"Unauthorized\","
                + "\"message\":\"인증이 필요합니다. 로그인이 만료되었거나 유효하지 않은 토큰입니다.\"}"
        );
    }
}
