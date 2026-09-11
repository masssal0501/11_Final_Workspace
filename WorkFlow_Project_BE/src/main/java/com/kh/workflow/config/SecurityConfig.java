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
                     // 장소 조회
                        .requestMatchers(
                                HttpMethod.GET,
                                "/place/**"
                        ).permitAll()

                        // 장소 등록 - 관리자만
                        .requestMatchers(
                                HttpMethod.POST,
                                "/place"
                        ).hasRole("ADMIN")

                        // 장소 수정 - 관리자만
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/place/**"
                        ).hasRole("ADMIN")

                        // 장소 삭제 - 관리자만
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/place/**"
                        ).hasRole("ADMIN")

                        // BUG-XXX 수정: 업로드된 비용 증빙(영수증) 이미지 정적 서빙 경로.
                        // WebConfig에서 실제 파일 시스템 디렉터리(app.upload.receipts-dir)로
                        // 매핑해준다. <img src="...">로 직접 요청되므로(Authorization 헤더를
                        // 실을 수 없음) 기존 "/resources/**"(Hub 이미지)와 동일하게 인증 없이
                        // 조회 가능하도록 허용한다 - 파일명이 업로드 시 UUID로 치환되어
                        // 추측이 어렵다는 점도 기존 Hub 이미지 서빙과 동일한 전제.
                        .requestMatchers(
                                "/upload/receipts/**"
                        ).permitAll()

                        // TODO-N02: 워케이션 후기 사진 정적 서빙 - <img src="...">로 직접
                        // 요청되므로(Authorization 헤더를 실을 수 없음) 영수증 이미지와 동일하게
                        // 인증 없이 조회 가능하도록 허용한다(파일명이 UUID라 추측 어려움)
                        .requestMatchers(
                                "/upload/reviews/**"
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

	                    // 업무 상태 변경 - 관리자만
	                    .requestMatchers(
	                    		HttpMethod.PATCH,
	                    		"/task/*/status"
	                    		).hasRole("ADMIN")

	                    // 업무 관리 - 관리자/부서장만
	                    .requestMatchers("/task/**")
	                    .hasAnyRole("MANAGER", "ADMIN")

	                 // 승인 관련 API - 관리자 및 매니저만
	                    .requestMatchers(
	                            "/approval/**"
	                    ).hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(
                            "/employees/password"
                        ).authenticated()


                        // KS PR 병합 중 발견: GET /api/v1/amounts(전체 목록, 관리자 전용
                        // AdminAmount.jsx에서만 호출)가 다른 사람의 정산 데이터를 전부
                        // 반환하는데도 authenticated()만 걸려 있어 STAFF/MANAGER도 직접
                        // API를 호출하면 전체 목록을 볼 수 있었다. /api/v1/amounts/**보다
                        // 먼저 선언해 이 정확한 경로만 ADMIN 전용으로 좁힌다
                        // (Spring Security는 먼저 선언된 규칙을 우선 적용).
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/amounts"
                        ).hasRole("ADMIN")

                        // 비용 조회 - 로그인 사용자(STAFF/MANAGER/ADMIN)면 누구나
                        .requestMatchers(
                        	    HttpMethod.GET,
                        	    "/api/v1/amounts/**"
                        	).authenticated()

                        // BUG-XXX 수정: AmountController의 결재/지원금 처리 API에는
                        // 원래 MANAGER/ADMIN 등 결재 권한에 대한 별도 검증이 전혀 없어
                        // (Swagger 설명에도 명시되어 있던 기존 알려진 문제) STAFF 계정이
                        // 본인 정산 신청을 스스로 승인 처리할 수 있는 상태였다.
                        // 최소 수정으로 결재 상태 변경/지원금 처리 API만 권한을 제한한다
                        // (본인 신청 취소(/cancel) 등 다른 API는 기존 그대로 유지).
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/v1/amounts/*/approval"
                        ).hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/v1/amounts/*/approval/sponsor"
                        ).hasRole("ADMIN")

                        // BUG-N06: 항목별 회사 지원금(company-support) 처리 API에 역할 검증이
                        // 전혀 없어 STAFF도 호출할 수 있었다. 같은 성격의 /approval/sponsor와
                        // 동일하게 관리자 전용으로 제한한다.
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/v1/amounts/*/items/*/company-support"
                        ).hasRole("ADMIN")

                        // 워케이션 반려 - 관리자/부서장만 (GET /approval/queue와 동일 정책, STAFF 차단)
                        .requestMatchers(
                                HttpMethod.POST,
                                "/approval/*"
                        ).hasAnyRole("ADMIN", "MANAGER")

                     // 공지사항
                        // BUG-N07: 기존에는 /api/v1/notice/** 전체(POST/PUT/DELETE 포함)가
                        // permitAll이었고 등록/수정/삭제의 실제 관리자 검증은
                        // NoticeController 내부의 수동 isAdmin() 체크 하나에만 의존하고 있었다.
                        // 이 프로젝트의 다른 관리자 전용 리소스(직원/거점/업무상태 등)와 동일하게
                        // Security 레벨에서도 명확히 ADMIN을 요구하도록 조회/쓰기를 분리한다.
                        // (NoticeController의 기존 isAdmin() 체크는 이중 방어로 그대로 유지)
                        // 기존의 "/api/v1/notice/insert/", "/api/v1/notice/update/**" permitAll
                        // 규칙은 실제 컨트롤러 경로(POST /api/v1/notice, PUT /{noticeNo})와
                        // 매칭되지 않는 죽은 규칙이라 함께 정리한다.
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/notice/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/notice"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/v1/notice/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/v1/notice/**"
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