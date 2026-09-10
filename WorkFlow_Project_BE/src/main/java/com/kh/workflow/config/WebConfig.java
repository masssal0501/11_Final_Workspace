package com.kh.workflow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 비용·정산(Amount) 증빙 파일(영수증) 정적 리소스 서빙 설정.
 *
 * BUG-XXX 수정: AmountController.createAmount()가 업로드된 증빙 파일을
 * app.upload.receipts-dir(운영: /opt/workflow/uploads/receipts/, 로컬: C:/upload/receipts/)
 * 아래에 실제로 저장하고, DB에는 "/upload/receipts/{changeName}" 형태의 filePath를
 * 그대로 기록해두고 있었다. 그런데 이 경로를 실제로 HTTP로 서빙해주는
 * ResourceHandler/Controller가 프로젝트 어디에도 존재하지 않아, 업로드는 성공해도
 * 업로드된 파일을 화면에서 다시 조회/다운로드하는 것이 불가능한(항상 404) 상태였다.
 *
 * 이 설정으로 "/upload/receipts/**" 요청을 실제 저장 디렉터리(file 시스템 경로)로
 * 매핑해 서빙되도록 한다. DB 스키마, API 응답 구조(filePath 형식)는 전혀 변경하지 않았다
 * - 이미 저장되어 있던 filePath 값 그대로 접근 가능해지는 것뿐이다.
 *
 * (참고: Hub 이미지 업로드(FileRenamePolicy.saveFile, "/resources/upload/hub/")는
 * HttpServletRequest.getRealPath()에 의존하는 별개의 저장 방식이라 실제 저장 위치가
 * 배포 환경마다 달라질 수 있어, 이번 세션에서는 원인만 규명하고 손대지 않았다.
 * BUG 목록 참고.)
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.receipts-dir:C:/upload/receipts/}")
    private String receiptsDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String location = receiptsDir.endsWith("/")
                ? receiptsDir
                : receiptsDir + "/";

        registry
                .addResourceHandler("/upload/receipts/**")
                .addResourceLocations("file:" + location);
    }
}
