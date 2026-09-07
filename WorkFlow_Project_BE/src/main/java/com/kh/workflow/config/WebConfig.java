package com.kh.workflow.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // .allowedOrigins("*") // ❌ 제거
                .allowedOriginPatterns("*") // ⭕ allowedOriginPatterns 사용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }


    // =========================================================
    // 업로드 이미지 경로 매핑
    // =========================================================
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 브라우저에서 /resources/** 로 요청했을 때 
        // 프로젝트 내부 src/main/webapp/resources/ 폴더를 바라보도록 설정
        registry.addResourceHandler("/resources/**")
                .addResourceLocations("file:src/main/webapp/resources/")
                .setCachePeriod(3600);
    }

}