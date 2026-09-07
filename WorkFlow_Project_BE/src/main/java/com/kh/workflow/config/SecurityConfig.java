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
                        
                        // 장소 관련 API
                        .requestMatchers(
                                "/place/**"
                        ).permitAll()
                        
                        .requestMatchers(
                        		"/hubs/**"
                		).permitAll()

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

                        
                        // 통계페이지 추후 관리자로 수정
                        .requestMatchers(
                        	    HttpMethod.GET,
                        	    "/api/v1/amounts/statistics"
                        	).permitAll()
                        
                        
                        .requestMatchers(
                        	    HttpMethod.GET,
                        	    "/api/v1/amounts/workcation/**"
                        	).permitAll()
                        
                        
                        .requestMatchers(
                        	    HttpMethod.GET,
                        	    "/api/v1/amounts"
                        	).permitAll()
                        // 관리자 정산 추후 권한 수정
                        .requestMatchers(
                        	    HttpMethod.GET,
                        	    "/api/v1/amounts/admin/cost/list"
                        	).permitAll()
                        
                        .requestMatchers(
                        	    HttpMethod.GET,
                        	    "/api/v1/amounts/cost/detail/**"
                        	).permitAll()
                        
                        .requestMatchers(
                        	    HttpMethod.GET,
                        	    "/api/v1/amounts/*"
                        	).permitAll()
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