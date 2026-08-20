package com.kh.workflow.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

	// BCrypotPasswordEncoder 를 빈으로 등록해주는 메소드
	@Bean
	public BCryptPasswordEncoder bCryptPasswordEncoder() {
		
		return new BCryptPasswordEncoder();
	}
	
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) {
		
		return http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
				   .csrf(csrf -> csrf.disable())
				   .build();
	}
	
}