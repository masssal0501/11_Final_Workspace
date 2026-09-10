package com.kh.workflow.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

/**
 * Swagger(OpenAPI 3) 문서 기본 설정.
 *
 * - server.servlet.context-path=/workflow, server.port=8006 이므로
 *   실제 Swagger UI 접속 주소는 http://localhost:8006/workflow/swagger-ui/index.html,
 *   OpenAPI JSON은 http://localhost:8006/workflow/v3/api-docs 이다.
 *   (springdoc은 context-path를 자동으로 반영하므로 이 클래스에서 별도로 처리할 필요는 없다.)
 * - JWT Bearer 인증 방식을 "JWT"라는 이름의 SecurityScheme으로 등록해,
 *   Swagger UI 우측 상단 Authorize 버튼에서 토큰을 입력할 수 있도록 한다.
 *   (각 컨트롤러의 @SecurityRequirement(name = "JWT")가 이 이름을 참조한다.)
 */
@Configuration
public class SwaggerConfig {

    private static final String JWT_SCHEME_NAME = "JWT";

    @Bean
    public OpenAPI workflowOpenAPI() {

        Server localServer = new Server()
                .url("http://localhost:8006/workflow")
                .description("로컬 개발 서버");

        SecurityScheme jwtScheme = new SecurityScheme()
                .name(JWT_SCHEME_NAME)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .description("로그인(POST /employees/login) 성공 후 발급받은 JWT를 "
                        + "\"Bearer {token}\" 형식으로 입력합니다. 예: Bearer eyJhbGciOiJIUzI1NiJ9...");

        return new OpenAPI()
                .info(new Info()
                        .title("WorkFlow ERP API")
                        .version("1.0.0")
                        .description(
                                "WorkFlow ERP의 사용자 관리, 공지사항, 워케이션 신청, 승인, 업무, 거점, 예약, "
                                        + "비용/정산, 여행/지역정보, 대시보드, 만족도조사, 출퇴근 인증 기능을 제공하는 REST API 문서입니다.\n\n"
                                        + "인증이 필요한 API는 우측 상단 Authorize 버튼을 눌러 "
                                        + "POST /employees/login으로 발급받은 JWT를 \"Bearer {token}\" 형식으로 입력한 뒤 호출하세요.")
                        .contact(new Contact()
                                .name("Workness Team")
                                .url("https://github.com/masssal0501/11_Final_Workspace"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://github.com/masssal0501/11_Final_Workspace/blob/main/LICENSE")))
                .servers(List.of(localServer))
                .components(new Components()
                        .addSecuritySchemes(JWT_SCHEME_NAME, jwtScheme));
    }
}