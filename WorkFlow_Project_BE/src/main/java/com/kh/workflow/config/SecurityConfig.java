package com.kh.workflow.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.kh.workflow.config.jwt.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    // 비밀번호 암호화
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Spring Security 설정
//    @Bean
//    public SecurityFilterChain securityFilterChain(
//            HttpSecurity http
//    ) throws Exception {
//
//        http
//            // CORS 활성화
//            .cors(cors -> {})
//
//            // CSRF 비활성화
//            .csrf(csrf -> csrf.disable())
//
//            // 현재는 모든 요청 허용
//            .authorizeHttpRequests(auth ->
//                auth.anyRequest().permitAll()
//            );
//
//        return http.build();
//    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) throws Exception {

        return http

                .cors(cors -> {})

                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // CORS Preflight
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // 로그인
                        .requestMatchers(
                                HttpMethod.POST,
                                "/employees/login"
                        ).permitAll()
                        
                        // 로그아웃
                        .requestMatchers(
                    	    HttpMethod.POST,
                    	    "/employees/logout"
                    	).permitAll()

                        // 아이디 중복 확인
                        .requestMatchers(
                                "/employees/checkId"
                        ).permitAll()

                        // 직원 등록
                        .requestMatchers(
                                HttpMethod.POST,
                                "/employees"
                        ).permitAll()
                        
                        .requestMatchers(
                            "/employees/password"
                        ).authenticated()
                        
	                     // 관리자 - 계정 상태 변경
	                    .requestMatchers(
	                            HttpMethod.PATCH,
	                            "/employees/*/status"
	                    ).hasRole("ADMIN")
	
	                    // 관리자 - 역할 / 부서 / 직위 변경
	                    .requestMatchers(
	                            HttpMethod.PATCH,
	                            "/employees/*/role"
	                    ).hasRole("ADMIN")
                        

                        // 나머지는 JWT 필요
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .build();
    }

    // CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // React 개발 서버
        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        // 허용 HTTP Method
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        // 허용 Header
        configuration.setAllowedHeaders(
                List.of("*")
        );

        // 쿠키/인증정보 허용
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}