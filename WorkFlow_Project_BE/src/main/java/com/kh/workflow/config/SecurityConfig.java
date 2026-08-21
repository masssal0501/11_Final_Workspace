package com.kh.workflow.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {
	
	// BCryptPasswordEncoder 를 빈으로 등록해주는 메소드
    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
	
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) {
		
		return http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
				   .csrf(csrf -> csrf.disable())
				   .build();
	}
    
    /*
	@Bean
	public SecurityFilterChain securityFilterChain(
	        HttpSecurity http
	) throws Exception {

	    http
        .cors(cors -> {})

        .csrf(csrf -> csrf.disable())

        .authorizeHttpRequests(auth -> auth

            // CORS Preflight
            .requestMatchers(HttpMethod.OPTIONS, "/**")
            .permitAll()

            // 로그인
            .requestMatchers("/employees/login")
            .permitAll()

            // 아이디 중복 확인
            .requestMatchers("/employees/checkId")
            .permitAll()

            // 계정 등록
            .requestMatchers(HttpMethod.POST, "/employees")
            .permitAll() // 추후 권한 설정

            .anyRequest()
            .authenticated()
        );

	    return http.build();
	}
	*/
	
	@Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

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

        configuration.setAllowedHeaders(
                List.of("*")
        );

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
