package com.kh.workflow.config.jwt;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorization =
                request.getHeader("Authorization");

        System.out.println("요청 URI : " + request.getRequestURI());
        System.out.println("Authorization : " + authorization);

        if (authorization == null ||
            !authorization.startsWith("Bearer ")) {

            System.out.println("Bearer 토큰 없음");

            filterChain.doFilter(request, response);
            return;
        }

        String token =
                authorization.substring(7);

        System.out.println("토큰 검증 시작");

        if (jwtUtil.validateToken(token)) {

            System.out.println("토큰 검증 성공");

            String empId =
                    jwtUtil.getEmpId(token);

            String authCode =
                    jwtUtil.getAuthCode(token);

            System.out.println("empId : " + empId);
            System.out.println("authCode : " + authCode);

            SimpleGrantedAuthority authority =
                    new SimpleGrantedAuthority(
                            "ROLE_" + authCode
                    );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            empId,
                            null,
                            java.util.List.of(authority)
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            System.out.println("SecurityContext 인증 등록 완료");

        } else {

            System.out.println("토큰 검증 실패");
        }

        filterChain.doFilter(request, response);
    }
}