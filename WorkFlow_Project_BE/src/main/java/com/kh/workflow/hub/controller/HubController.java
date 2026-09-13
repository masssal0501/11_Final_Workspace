package com.kh.workflow.hub.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;

@Tag(name="Hub API", description="거점 조회/작성/수정/삭제 관련 API")
// CORS는 SecurityConfig에서 중앙 관리 (기본 @CrossOrigin은 모든 origin을 허용해 제거함)
@RestController
public class HubController {

	@Autowired
	private HubService hubService;

	@Autowired
	private FileRenamePolicy fileRenamePolicy;

	// GEMINI_API_KEY가 없는 환경(AIConfig 참조)에서는 이 빈이 아예 존재하지 않으므로
	// required=false로 받아 null을 허용하고, sendMessage()에서 명시적으로 처리한다.
	@Autowired(required = false)
	private ChatClient chatClient;

	/**
     * 거점 목록 조회 (페이징)
     * @param currentPage 현재 페이지 번호 (기본값: 1)
     * @return 거점 목록 및 페이징 정보가 담긴 Map
     */
	@Operation(summary="거점 목록 조회 (페이징)", description="페이지 번호 (cpage) 에 해당하는 거점 목록을 조회합니다.\n\n응답 : {list : 거점 목록, pi : 페이지정보}")
	@ApiResponse(responseCode="200", description="조회 성공", content=@Content(mediaType="application/json",
		 		  examples=@ExampleObject(value="""
		 		  				{
		 		  					"list" : [{
		 		  						"description" : "wifi 가능",
		 		  						"hubAddress" : "제주특별자치도 서귀포시 중문관광로72번길 35",
		 		  						"hubFileList" : [{
		 		  							"changeName" : "2026082718260636772.png",
		 		  							"filePath" : "/resources/upload/hub",
		 		  							"hubfileNo" : 32,
		 		  							"originName" : "WorkFlow_Project.png",
		 		  							"status" : "Y",
		 		  							"updatedAt" : "2026-08-27T18:26:06"
		 		  						}],
		 		  						"hubName" : "디어먼데이 제주 롯데호텔점",
		 		  						"hubNo" : 4,
		 		  						"hubStatus" : "OPEN",
		 		  						"hubType": 1,
		 		  						"mainRegion" : "제주",
		 		  						"maxCapacity" : 50,
		 		  						"phone" : "1533-5213",
		 		  						"price" : 100000,
		 		  						"subRegion" : "서귀포시"
		 		  					}, {
		 		  						"description" : "전좌석 모니터",
		 		  						"hubAddress" : "강원특별자치도 춘천시 남산면 방하리 198-1",
		 		  						"hubFileList" : [{
		 		  							"changeName" : "2026082718470241031.png",
		 		  							"filePath" : "/resources/upload/hub",
		 		  							"hubfileNo" : 34,
		 		  							"originName" : "WorkFlow_Project.png",
		 		  							"status" : "Y",
		 		  							"updatedAt" : "2026-08-27T18:47:02"
		 		  						}],
		 		  						"hubName" : "디어먼데이 춘천남이섬 호텔정관루점",
		 		  						"hubNo" : 3,
		 		  						"hubStatus" : "OPEN",
		 		  						"hubType": 2,
		 		  						"mainRegion" : "강원",
		 		  						"maxCapacity" : 12,
		 		  						"phone" : "010-1234-5678",
		 		  						"price" : 100000,
		 		  						"subRegion" : "춘천시"
		 		  					}],
		 		  					"pi" : {
		 		  						"listCount" : 42,
		 		  						"currentPage" : 1,
		 		  						"pageLimit" : 5,
		 		  						"boardLimit" : 5,
		 		  						"maxPage" : 9,
		 		  						"startPage" : 1,
		 		  						"endPage" : 5
		 		  					}
		 		  				}
		 		  		""")))
	@SecurityRequirement(name="JWT")
	@GetMapping("/hubs")
	public ResponseEntity<HashMap<String, Object>> selectHubList(
			@RequestParam(value="cpage", defaultValue="1") int currentPage) {
		
		int boardLimit = 10;
		int pageLimit = 10;
		
		Pageable pageable = PageRequest.of(currentPage - 1, boardLimit);

		Page<Hub> page = hubService.selectHubList(pageable, List.of(1, 2));
		
		List<Hub> list = page.getContent();
		long listCount = page.getTotalElements();
		
		PageInfo pi = Pagination.getPageInfo((int)listCount, currentPage, pageLimit, boardLimit);
		
		HashMap<String, Object> hm = new HashMap<>();
		hm.put("list", list);
		hm.put("pi", pi);
		
		return ResponseEntity.status(HttpStatus.OK).body(hm);
	}
	
	/**
     * 거점 검색 조회 (페이징)
     */
	@Operation(summary="거점 검색 조회 (페이징)", description="지역(mainRegion), 상세지역(subRegion), 시설 유형(hubType), 키워드 (keyword), 페이지 번호 (cpage) 에 해당하는 거점 목록을 조회합니다.\n\n응답 : {list : 거점 목록, pi : 페이지 정보}")
	@ApiResponse(responseCode="200", description="조회 성공",
	content=@Content(mediaType="application/json",
			examples=@ExampleObject(value="""
				{
					"list" : [{
						"description" : "wifi 가능",
						"hubAddress" : "제주특별자치도 서귀포시 중문관광로72번길 35",
						"hubFileList" : [{
							"changeName" : "2026082718260636772.png",
							"filePath" : "/resources/upload/hub",
							"hubfileNo" : 32,
							"originName" : "WorkFlow_Project.png",
							"status" : "Y",
							"updatedAt" : "2026-08-27T18:26:06"
						}],
						"hubName" : "디어먼데이 제주 롯데호텔점",
						"hubNo" : 4,
						"hubStatus" : "OPEN",
						"hubType": 1,
						"mainRegion" : "제주",
						"maxCapacity" : 50,
						"phone" : "1533-5213",
						"price" : 100000,
						"subRegion" : "서귀포시"
					}, {
						"description" : "전좌석 모니터",
						"hubAddress" : "강원특별자치도 춘천시 남산면 방하리 198-1",
						"hubFileList" : [{
							"changeName" : "2026082718470241031.png",
							"filePath" : "/resources/upload/hub",
							"hubfileNo" : 34,
							"originName" : "WorkFlow_Project.png",
							"status" : "Y",
							"updatedAt" : "2026-08-27T18:47:02"
						}],
						"hubName" : "디어먼데이 춘천남이섬 호텔정관루점",
						"hubNo" : 3,
						"hubStatus" : "OPEN",
						"hubType": 2,
						"mainRegion" : "강원",
						"maxCapacity" : 12,
						"phone" : "010-1234-5678",
						"price" : 100000,
						"subRegion" : "춘천시"
					}],
					"pi" : {
						"listCount" : 42,
						"currentPage" : 1,
						"pageLimit" : 5,
						"boardLimit" : 5,
						"maxPage" : 9,
						"startPage" : 1,
						"endPage" : 5
					}
				}
		""")))
	@SecurityRequirement(name="JWT")
	@GetMapping("/hubs/search")
	public ResponseEntity<HashMap<String, Object>> searchHubList(
			@Parameter(description="검색할 페이지 번호", example="1") @RequestParam(value="cpage", defaultValue="1") int currentPage,
			@Parameter(description="검색할 지역(대분류)", example="제주") String mainRegion,
			@Parameter(description="검색할 상세 지역(소분류)", example="서귀포시") String subRegion,
			@Parameter(description="거점 시설 유형 코드(숫자 문자열, 예: 1=숙소, 2=공유오피스). 숫자로 변환할 수 없으면 전체(1,2)로 검색", example="1") String hubType,
			@Parameter(description="거점명/주소 등에 대한 검색 키워드", example="롯데호텔") String keyword) {
		
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
		
		PageInfo pi = Pagination.getPageInfo((int)searchCount, currentPage, pageLimit, boardLimit);
		
		HashMap<String, Object> hm = new HashMap<>();
		hm.put("list", list);
		hm.put("pi", pi);
		
		return ResponseEntity.status(HttpStatus.OK).body(hm);
	}
	
	/**
     * AI 챗봇 메시지 전송 및 응답 처리
     */
	@Operation(summary="AI 여행 추천 챗봇 메시지 전송", description="사용자의 질문(메시지)을 DB에 등록된 실제 거점 데이터를 참고하는 Gemini 기반 AI에게 전달하고, 강원/제주/부산 워케이션 장소·일정 추천 답변을 받습니다.")
	@ApiResponses({
		@ApiResponse(responseCode="200", description="AI 응답 본문(text/plain) 반환"),
		@ApiResponse(responseCode="503", description="GEMINI_API_KEY 미설정 등으로 AI 챗봇 기능을 사용할 수 없는 경우")
	})
	@SecurityRequirement(name="JWT")
	@PostMapping("/hubs/send")
	public ResponseEntity<String> sendMessage(
			@Parameter(description="AI에게 보낼 사용자 메시지(순수 텍스트)", example="제주도 워케이션 일정 추천해줘", required=true)
			@RequestBody String message) {

		if (chatClient == null) {
			return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
					.body("AI 챗봇 기능을 사용할 수 없습니다. (GEMINI_API_KEY 미설정)");
		}

        List<Hub> hubList = hubService.selectAIHubList();
        
        StringBuilder dbHubInfo = new StringBuilder();
        for (Hub hub : hubList) {
            dbHubInfo.append(String.format("- 거점이름: %s, 시설 유형: %d 지역: %s, 상세지역: %s, 상세설명: %s, 거점 주소: %s, 전화번호: %s, 최대수용인원: %d, 기본 이용요금: %d, 운영상태: %s\n", 
                hub.getHubName(), hub.getHubType(), hub.getMainRegion(), hub.getSubRegion(), hub.getDescription(), hub.getHubAddress(), hub.getPhone(), hub.getMaxCapacity(), hub.getPrice(), hub.getHubStatus()));
        }
        
        // 동적 시스템 프롬프트 작성 (기본 규칙 + DB 실시간 데이터)
        String dynamicSystemPrompt = String.format("""
                [역할]
                너는 강원도, 제주도, 부산광역시의 장소 및 일정 추천 해주는 AI야.

                [답변 대상]
                - 워케이션을 떠나고 싶은 회사원들

                [현재 DB에 등록된 실제 거점 데이터 목록]
                %s
        		(시설 유형 => 1:공유오피스 2:숙소 3:체험프로그램 4: 맛집 5: 관광지)
                
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
				- 반드시 제공된 DB 데이터만을 기준으로 추천해
				- 운영 상태가 OPEN이 아닌 장소는 추천하지마
                """, dbHubInfo.toString());

		// 요청마다 새로 생성 - 사용자 간 대화 내용이 서로 섞이지 않도록 컨트롤러 필드가 아닌 지역 변수로 유지
		List<Message> chatHistory = new ArrayList<>();

		chatHistory.add(new UserMessage(message));

		String reply = chatClient.prompt().system(dynamicSystemPrompt).messages(chatHistory).call().content();

		return ResponseEntity.status(HttpStatus.OK).body(reply);
	}
	
	/**
     * 거점 등록 (첨부파일 가능)
     * - @RequestPart를 제거하고 객체로 바로 받아 프론트엔드의 폼 데이터(FormData) 전송 방식과 호환되도록 수정함
     */
	@Operation(summary="거점 등록 (첨부파일 가능)", description="거점을 등록합니다.")
	@SecurityRequirement(name="JWT")
	@PostMapping(value="/hubs", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> insertHub(Hub hub, @RequestPart(value = "upfile", required = false) List<MultipartFile> upfiles, HttpSession session) {
		
		List<HubFile> fileList = new ArrayList<>();
		
		if(upfiles != null && !upfiles.isEmpty()) {
			for (MultipartFile file : upfiles) {
				if(file != null && !file.isEmpty()) {
					String changeName = fileRenamePolicy.saveFile(file, session, "/resources/upload/hub/");
					
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
		 
		return ResponseEntity.status(HttpStatus.OK).body(message);
	}
	
	/**
     * 거점 상세 조회
     */
	@Operation(summary="거점 상세 조회", description="hubNo 로 한 거점의 상세 정보를 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode="200", description="조회 성공"),
		@ApiResponse(responseCode="200 (null)", description="해당 번호의 거점이 없을 경우 body 가 null 로 응답됨")
	})
	@SecurityRequirement(name="JWT")
	@GetMapping("/hubs/{hubNo}")
	public ResponseEntity<HashMap<String, Object>> selectHub(@Parameter(description="조회할 거점의 번호", example="1", required=true)
															 @PathVariable int hubNo) {
		
		Hub h = hubService.selectHub(hubNo);
		Double avgScore = hubService.selectAvgScore(hubNo);
		
		HashMap<String, Object> hm = new HashMap<>();
		hm.put("hub", h);
		hm.put("avgScore", avgScore);
		
		return ResponseEntity.status(HttpStatus.OK).body(hm);
	}
	
	/**
     * 거점 운영 중단 (상태 CLOSED 변경)
     */
	@Operation(summary="거점 운영 중단", description="거점 운영 상태를 중단(CLOSED) 로 변경 합니다.")
	@ApiResponses({
		@ApiResponse(responseCode="200", description="요청 처리 완료 (body 로 성공/실패 구분)", 
					 content=@Content(mediaType="text/plain", 
							 		  examples= {
							 				  @ExampleObject(name="중단 성공", value="success"),
							 				  @ExampleObject(name="중단 실패", value="fail")
							 		  }))
	})
	@SecurityRequirement(name="JWT")
	@DeleteMapping("/hubs/{hubNo}")
	public ResponseEntity<String> deleteHub(@PathVariable int hubNo) {
		
		int result = hubService.deleteHub(hubNo);
		
		System.out.println(result);
		
		String message = (result > 0) ? "success" : "fail";
		
		return ResponseEntity.status(HttpStatus.OK).body(message);
	}
	
	/**
     * 거점 정보 수정 (첨부파일 수정 가능)
     */
	@Operation(summary="거점 정보 수정 (첨부파일 수정 가능)", description="거점을 수정합니다.")
	@ApiResponses({
		@ApiResponse(responseCode="200", description="요청 처리 완료 (body 로 성공/실패 구분)",
					 content=@Content(mediaType="text/plain",
							 		  examples= {
							 				  @ExampleObject(name="수정 성공", value="success"),
							 				  @ExampleObject(name="수정 실패", value="fail")
							 		  }))
	})
	@SecurityRequirement(name="JWT")
	@PutMapping(value="/hubs/{hubNo}", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> updateHub(
			@Parameter(description="수정할 거점의 번호", example="1", required=true) @PathVariable int hubNo,
	        Hub hub, // 거점 기본 정보 폼 데이터 매핑
	        @RequestParam(required = false) List<Integer> fileNos,
	        @RequestParam(required = false) List<MultipartFile> upfiles,
	        @RequestParam(required = false) List<Integer> upfileIndexes,
	        HttpSession session) {
	    
	        Hub updateHub = hubService.updateHub(hubNo, hub, fileNos, upfiles, upfileIndexes, session);
	        
	        String message = (updateHub != null) ? "success" : "fail";
	        
	        return ResponseEntity.status(HttpStatus.OK).body(message);
	}
	// 메인지역 드롭에 따른 목록 조회
//		@GetMapping("/hub/mainRegion")
//		public ResponseEntity<List<String>> getMainRegions() {
//			List<String> mainRegion = hubService.selectMainRegion();
//			return ResponseEntity.ok(mainRegion);
//		}
//
//		// 상세지역 드롭에 따른 목록 조회
//		@GetMapping("/hub/subRegion")
//		public ResponseEntity<List<String>> getSubRegions(@RequestParam String mainRegion) {
//			List<String> subRegion = hubService.selectSubRegion(mainRegion);
//			return ResponseEntity.ok(subRegion);
//		}
}