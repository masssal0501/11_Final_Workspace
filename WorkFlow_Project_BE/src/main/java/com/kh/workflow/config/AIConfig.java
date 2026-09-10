package com.kh.workflow.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AIConfig {

	// spring.ai.model.chat=google-genai(운영)일 때만 빈을 생성한다.
	// 로컬 등 GEMINI_API_KEY가 없는 환경(기본값 "none")에서는 ChatClient.Builder 자체가
	// 존재하지 않으므로, 이 조건 없이 무조건 빈을 만들려 하면 기동이 실패한다.
	@Bean
	@ConditionalOnProperty(name = "spring.ai.model.chat", havingValue = "google-genai")
	public ChatClient chatClient(ChatClient.Builder builder) {

		return builder.build();
	}
}