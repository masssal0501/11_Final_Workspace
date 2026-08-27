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

		Page<Hub> page = hubService.selectHubList(pageable, List.of(1, 2));
		
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
		
		Pageable pageable = Pageable.unpaged();
        Page<Hub> hubPage = hubService.selectHubList(pageable, List.of(1, 2)); // 예시 타입 목록
        List<Hub> hubList = hubPage.getContent();
        
        StringBuilder dbHubInfo = new StringBuilder();
        for (Hub hub : hubList) {
            dbHubInfo.append(String.format("- 거점명: %s, 지역: %s, 상세지역: %s, 상세설명: %s, 거점 주소: %s, 전화번호: %s, 최대수용인원: %d, 기본 이용요금: %d, 운영상태: %s\n", 
                hub.getHubName(), hub.getMainRegion(), hub.getSubRegion(), hub.getDescription(), hub.getHubAddress(), hub.getPhone(), hub.getMaxCapacity(), hub.getPrice(), hub.getHubStatus()));
        }
        
        // 동적 시스템 프롬프트 작성 (기본 규칙 + DB 실시간 데이터)
        String dynamicSystemPrompt = String.format("""
                [역할]
                너는 강원도, 제주도, 부산광역시의 장소 및 일정 추천 해주는 AI야.
                
                [답변 대상]
                - 워케이션을 떠나고 싶은 회사원들
                
                [현재 DB에 등록된 실제 거점 데이터 목록]
                %s
                
                [답변 형식]
				1. 상대가 지역을 언급하면 해당 지역을 고르고 지역을 언급하지 않았다면 강원도, 제주도, 부산광역시 중에서 하나를 골라줘
				2. 그 다음에 반드시 위 [현재 DB에 등록된 실제 거점 데이터]에 있는 내용을 기반으로 상대가 숙소, 공유오피스, 체험프로그램, 맛집, 관광지 중 하나를 언급했으면 언급한 곳만 추천해주고 언급이 없다면 그곳에 있는 숙소와 공유오피스, 체험프로그램, 맛집, 관광지를 추천해줘
				3. 일정을 추천해 달라고 하면 워케이션 일정을 추천해줘
				
				[형식 규칙]
				- 답변은 한국어로 작성해
				- 답변은 반드시 존댓말로 해줘
				
				[제약사항]
				- 강원도, 제주도, 부산광역시가 아닌 곳을 추천해달라고 하면 "강원도, 제주도, 부산광역시만 추천 가능합니다" 라고 답변해
				- 너의 역할과 관련 없는 질문에는 "저는 장소 및 일정 추천 해주는 AI 입니다. 다른 질문을 해주세요" 라고 답변해
				- 확실하지 않은 내용은 추측하지 마
                """, dbHubInfo.toString());
        
		chatHistory.add(new UserMessage(message));
		
		String reply = chatClient.prompt().system(dynamicSystemPrompt).messages(chatHistory).call().content();
		
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
	
	// 메인지역 드롭에 따른 목록 조회
		@GetMapping("/hub/mainRegion")
		public ResponseEntity<List<String>> getMainRegions() {
			List<String> mainRegion = hubService.selectMainRegion();
			return ResponseEntity.ok(mainRegion);
		}

		// 상세지역 드롭에 따른 목록 조회
		@GetMapping("/hub/subRegion")
		public ResponseEntity<List<String>> getSubRegions(@RequestParam String mainRegion) {
			List<String> subRegion = hubService.selectSubRegion(mainRegion);
			return ResponseEntity.ok(subRegion);
		}
}