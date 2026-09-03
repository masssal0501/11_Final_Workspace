package com.kh.workflow.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI workflowOpenAPI() {

        return new OpenAPI()
                .info(new Info()
                        .title("WorkFlow API")
                        .version("0.0.1")
                        .description("WorkFlow API 명세서"));
    }
}