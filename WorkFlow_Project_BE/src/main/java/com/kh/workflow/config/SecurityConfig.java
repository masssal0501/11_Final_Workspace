package com.kh.workflow.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
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

import com.kh.workflow.config.jwt.JwtAccessDeniedHandler;
import com.kh.workflow.config.jwt.JwtAuthenticationEntryPoint;
import com.kh.workflow.config.jwt.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    // Production에서는 CORS_ALLOWED_ORIGINS 환경변수로 실제 도메인/EC2 접속 주소를 지정한다.
    // 콤마로 여러 origin을 구분할 수 있다. (와일드카드 "*"는 credentials 허용 시 사용 불가하며,
    // 이 프로젝트에서는 의도적으로 지원하지 않는다 - 반드시 명시적인 origin 목록을 사용할 것)
    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

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
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
            JwtAccessDeniedHandler jwtAccessDeniedHandler
    ) throws Exception {

        return http

        		.cors(cors -> cors.configurationSource(corsConfigurationSource()))

        		// BUG-XXX: 커스텀 AuthenticationEntryPoint/AccessDeniedHandler가 없어
        		// formLogin/httpBasic 미사용 상태의 기본 폴백(Http403ForbiddenEntryPoint)이
        		// 인증 실패(JWT 없음/만료)에도 그대로 쓰이며 항상 403만 내려가던 문제를 해결.
        		// 인증 실패 -> 401(JwtAuthenticationEntryPoint), 인가 실패(권한 부족) -> 403(JwtAccessDeniedHandler)
        		.exceptionHandling(exception -> exception
        				.authenticationEntryPoint(jwtAuthenticationEntryPoint)
        				.accessDeniedHandler(jwtAccessDeniedHandler)
        		)


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
                        // context-path(/workflow)는 DispatcherServlet 진입 전에 이미 제거된 상태로
                        // Security 필터 체인에 도달하므로, matcher에는 context-path를 붙이지 않는다.
                        // (실제 요청 http://localhost:8006/workflow/swagger-ui/index.html 이
                        //  Security 관점에서는 "/swagger-ui/index.html"로 보임 - 실행 후 직접 검증 완료)
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/v3/api-docs"
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

        // 환경변수(CORS_ALLOWED_ORIGINS)로 주입되는 허용 origin 목록
        // (로컬 개발 기본값: http://localhost:5173)
        configuration.setAllowedOrigins(
                Arrays.stream(allowedOrigins.split(","))
                        .map(String::trim)
                        .filter(origin -> !origin.isBlank())
                        .toList()
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