package com.kh.workflow.hub.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.workflow.common.model.vo.PageInfo;
import com.kh.workflow.common.template.Pagination;
import com.kh.workflow.hub.model.service.HubService;
import com.kh.workflow.hub.model.vo.Hub;

import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name="Hub API", description="거점 조회/작성/수정/삭제 관련 API")
@CrossOrigin
@RestController
public class HubController {

	@Autowired
	private HubService hubService;
	
	@Autowired
	private ChatClient chatClient;
	
	private ArrayList<Message> chatHistory = new ArrayList<>();
	
	@GetMapping("/hubs")
	public ResponseEntity<HashMap<String, Object>> selectHubList(
			@RequestParam(value="cpage", defaultValue="1") int currentPage) {
		
		int boardLimit = 10;
		int pageLimit = 10;
		
		Pageable pageable = PageRequest.of(currentPage - 1, 10);
		
		Page<Hub> page = hubService.selectHubList(pageable);
		
		List<Hub> list = page.getContent();
		
		long listCount = page.getTotalElements();
		
		PageInfo pi = Pagination.getPageInfo((int)listCount, currentPage,
													pageLimit, boardLimit);
		
		HashMap<String, Object> hm = new HashMap<>();
		
		hm.put("list", list);
		hm.put("pi", pi);
		
		return ResponseEntity.status(HttpStatus.OK)
							 .body(hm);
	}
	
	@GetMapping("/hubs/search")
	public ResponseEntity<HashMap<String, Object>> searchBoardList(
			@RequestParam(value="cpage", defaultValue="1") int currentPage,
			String regionName, int hubType, String keyword) {
		
		return null;
	}
	
	@PostMapping("/hubs/send")
	public String sendMessage(@RequestBody String message) {
		
		chatHistory.add(new UserMessage(message));
		
		String reply = chatClient.prompt().messages(chatHistory).call().content();
		
		chatHistory.add(new AssistantMessage(reply));
		
		return reply;
		
	}
}