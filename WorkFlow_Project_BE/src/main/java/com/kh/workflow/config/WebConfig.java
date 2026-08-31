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

        registry.addResourceHandler("/resources/upload/hub/**")
                .addResourceLocations(
                    "file:/Users/macbookpro/MyWorkspace/11_Final_Workspace/WorkFlow_Project_BE/src/main/webapp/resources/upload/hub/"
                )
                .setCachePeriod(3600);
    }

}