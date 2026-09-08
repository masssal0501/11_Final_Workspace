package com.kh.workflow.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
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
   
    
    /**
     * 정적 리소스(Static Resources) 경로에 대해 Spring Security 인증 예외 처리 설정
     * 
     * @return WebSecurityCustomizer 객체
     */
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
                .requestMatchers("/resources/**");
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) throws Exception {

        return http

        		.cors(cors -> cors.configurationSource(corsConfigurationSource()))


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

                        // 에러 페이지 - 예외 발생 시 서블릿 컨테이너가 내부적으로
                        // /error 로 재요청(forward)하는데, 이 경로가 인증을 요구하면
                        // 실제 오류 응답(4xx/5xx + 메시지) 대신 빈 본문의 403이 반환됨
                        .requestMatchers(
                                "/error"
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

                        // 직원 등록 - 관리자 전용 (USR-001: 관리자 계정 등록)
                        .requestMatchers(
                                HttpMethod.POST,
                                "/employees"
                        ).hasRole("ADMIN")
                        
                        // Swagger UI 및 API 문서화 경로 허용
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                            ).permitAll()
                        
                        .requestMatchers(
                            "/employees/password"
                        ).authenticated()
                        
                        // 계정 ID 찾기
                        .requestMatchers(
                    	    HttpMethod.POST,
                    	    "/employees/findId"
                    	).permitAll()

                        // 비밀번호 찾기 (인증번호 발송/확인)
                        .requestMatchers(
                    	    HttpMethod.POST,
                    	    "/employees/password/reset/request",
                    	    "/employees/password/reset/verify"
                    	).permitAll()
                        
                        // 장소 관련 API
                        .requestMatchers(
                                "/place/**"
                        ).permitAll()
                        
                        // 거점 조회 - 로그인 사용자면 누구나
                        .requestMatchers(
                                HttpMethod.GET,
                                "/hubs/**"
                        ).authenticated()

                        // AI 여행 추천 챗봇 - 로그인 사용자면 누구나
                        .requestMatchers(
                                HttpMethod.POST,
                                "/hubs/send"
                        ).authenticated()

                        // 거점 등록/수정/삭제 - 관리자 전용
                        .requestMatchers(
                                HttpMethod.POST,
                                "/hubs"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/hubs/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/hubs/**"
                        ).hasRole("ADMIN")

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
	                    
	                    .requestMatchers(	                    	    
	                    	    "/workcation/**" // 워케이션 관련 조회 경로를 열어주어야 하는 경우
	                    	).authenticated()

	                    // swagger
	                    .requestMatchers(
                        		"/swagger-ui/**",
	                    		"/v3/api-docs/**"
                		).permitAll()
	                    
                        .requestMatchers(
                            "/employees/password"
                        ).authenticated()


                        // 비용 조회 - 로그인 사용자(STAFF/MANAGER/ADMIN)면 누구나
                        .requestMatchers(
                        	    HttpMethod.GET,
                        	    "/api/v1/amounts/**"
                        	).authenticated()

                        // 워케이션 반려 - 관리자/부서장만 (GET /approval/queue와 동일 정책, STAFF 차단)
                        .requestMatchers(
                                HttpMethod.POST,
                                "/approval/*"
                        ).hasAnyRole("ADMIN", "MANAGER")

                     // 공지사항
                        .requestMatchers(
                            "/api/v1/notice/**"
                        ).permitAll()
                        
                        .requestMatchers(
                                "/api/v1/notice/insert/"
                            ).permitAll()
                        .requestMatchers(
                                "/api/v1/notice/update/**"
                            ).permitAll()
                        
                       
            
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