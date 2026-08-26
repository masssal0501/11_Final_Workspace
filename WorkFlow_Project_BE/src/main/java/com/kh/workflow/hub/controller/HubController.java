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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.common.model.vo.PageInfo;
import com.kh.workflow.common.template.FileRenamePolicy;
import com.kh.workflow.common.template.Pagination;
import com.kh.workflow.hub.model.service.HubService;
import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.hub.model.vo.HubFile;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;

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
		
		Pageable pageable = PageRequest.of(currentPage - 1, boardLimit);
		
		List<Integer> hubTypes = List.of(1, 2);
		
		Page<Hub> page = hubService.selectHubList(pageable, hubTypes);
		
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
			String mainRegion, String subRegion, String hubType, String keyword) {
		
		int boardLimit = 10;
		int pageLimit = 10;
		
		Pageable pageable = PageRequest.of(currentPage - 1, boardLimit);
		
		List<Integer> hubTypes;
		try {
            hubTypes = List.of(Integer.parseInt(hubType.trim()));
        } catch (NumberFormatException e) {
            hubTypes = List.of(1, 2); // 숫자 변환 실패 시 기본 전체 검색
        }
		Page<Hub> page = hubService.searchHubList(pageable, mainRegion, subRegion, hubTypes, keyword);
		
		List<Hub> list = page.getContent();
		
		long searchCount = page.getTotalElements();
		
		PageInfo pi = Pagination.getPageInfo((int)searchCount, currentPage,
													pageLimit, boardLimit);
		
		HashMap<String, Object> hm = new HashMap<>();
		
		hm.put("list", list);
		hm.put("pi", pi);
		
		return ResponseEntity.status(HttpStatus.OK)
							 .body(hm);
	}
	
	@PostMapping("/hubs/send")
	public ResponseEntity<String> sendMessage(@RequestBody String message) {
		
		chatHistory.add(new UserMessage(message));
		
		String reply = chatClient.prompt().messages(chatHistory).call().content();
		
		chatHistory.add(new AssistantMessage(reply));
		
		return ResponseEntity.status(HttpStatus.OK)
							 .body(reply);
	}
	
	@PostMapping("/hubs")
	public ResponseEntity<String> insertHub(Hub hub, @RequestPart(value = "upfile", required = false) List<MultipartFile> upfiles, HttpSession session) {
		
		List<HubFile> fileList = new ArrayList<>();
		
		if(upfiles != null && !upfiles.isEmpty()) {
			for (MultipartFile file : upfiles) {
				if(file != null && !file.isEmpty()) {
					String changeName = FileRenamePolicy.saveFile(file, session, "/resources/upload/hub/");
					
					HubFile hf = new HubFile();
					hf.setFilePath("/resources/upload/hub");
					hf.setOriginName(file.getOriginalFilename());
					hf.setChangeName(changeName);
					
					fileList.add(hf);
				}
			}
		}
		
		Hub insertHub = hubService.insertHub(hub, fileList);
		
		String message = (insertHub != null) ? "success" : "fail";		 
		 
		return ResponseEntity.status(HttpStatus.OK)
						     .body(message);
	}
	
	@GetMapping("/hubs/{hubNo}")
	public ResponseEntity<HashMap<String, Object>> selectHub(@PathVariable int hubNo) {
		
		Hub h = hubService.selectHub(hubNo);
		
		Double avgScore = hubService.selectAvgScore(hubNo);
		
		HashMap<String, Object> hm = new HashMap<>();
		
		hm.put("hub", h);
		hm.put("avgScore", avgScore);
		
		return ResponseEntity.status(HttpStatus.OK)
							 .body(hm);
	}
	
	@DeleteMapping("/hubs/{hubNo}")
	public ResponseEntity<String> deleteHub(@PathVariable int hubNo) {
		
		int result = hubService.deleteHub(hubNo);
		
		System.out.println(result);
		
		String message = (result > 0) ? "success" : "fail";
		
		return ResponseEntity.status(HttpStatus.OK)
					  		 .body(message);

	}
}