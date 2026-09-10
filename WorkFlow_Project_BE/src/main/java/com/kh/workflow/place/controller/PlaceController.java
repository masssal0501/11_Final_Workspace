package com.kh.workflow.place.controller;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.common.model.vo.PageInfo;
import com.kh.workflow.common.template.FileRenamePolicy;
import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.hub.model.vo.HubFile;
import com.kh.workflow.place.model.service.PlaceService;

import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "거점(장소) 관리", description = "워케이션 거점(장소) 등록, 목록/상세 조회, 수정, 종료 관련 API (등록·수정·종료는 ADMIN 권한 필요)")
@RestController
@RequestMapping("/place")
public class PlaceController {

    @Autowired
    private PlaceService placeService;

    @Autowired
    private FileRenamePolicy fileRenamePolicy;


    @Operation(summary = "거점(장소) 등록", description = "워케이션 거점(장소) 정보를 등록합니다. 대표 이미지 파일을 함께 업로드할 수 있으며, ADMIN 권한을 가진 로그인 사용자만 호출할 수 있습니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "등록 처리 결과(success/fail) 반환"),
        @ApiResponse(responseCode = "403", description = "ADMIN 권한이 아닌 경우", content = @Content)
    })
    @SecurityRequirement(name = "JWT")
 // 장소 등록
    @PostMapping
    public ResponseEntity<String> insertPlace(
            @Parameter(description = "등록할 거점(장소) 정보(JSON)", required = true)
            @RequestPart("place") Hub h,
            @Parameter(description = "거점 대표 이미지 파일(선택)")
            @RequestPart(value = "file", required = false) MultipartFile file,
            HttpSession session) {

        // 기본 상태 설정
        if (h.getHubStatus() == null || h.getHubStatus().isBlank()) {
            h.setHubStatus("OPEN");
        }

        Hub insertPlace = placeService.insertPlace(h);

        if (insertPlace != null
                && file != null
                && !file.isEmpty()) {

            String changeName =
                    fileRenamePolicy.saveFile(
                            file,
                            session,
                            "/resources/upload/hub/"
                    );

            HubFile hubFile = new HubFile();

            hubFile.setHub(insertPlace);
            hubFile.setFilePath("/resources/upload/hub");
            hubFile.setOriginName(file.getOriginalFilename());
            hubFile.setChangeName(changeName);

            placeService.insertPlaceFile(hubFile);
        }

        String message =
                (insertPlace != null)
                ? "success"
                : "fail";

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(message);
    }


    @Operation(summary = "거점(장소) 목록 조회", description = "키워드/유형/지역/세부지역 조건으로 거점(장소) 목록을 페이징 조회합니다. 로그인 없이 누구나 조회할 수 있습니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    // 장소 목록 조회 + 페이징
    @GetMapping
    public ResponseEntity<Map<String, Object>> selectPlaceList(
            @Parameter(description = "조회할 페이지 번호(1부터 시작)", example = "1")
            @RequestParam(value = "cpage", defaultValue = "1") int cpage,
            @Parameter(description = "검색 키워드(장소명 등, 선택)", example = "제주")
            @RequestParam(value = "keyword", required = false) String keyword,
            @Parameter(description = "거점 유형 필터(선택)", example = "카페")
            @RequestParam(value = "type", required = false) String type,
            @Parameter(description = "지역 필터(선택)", example = "제주도")
            @RequestParam(value = "region", required = false) String region,
            @Parameter(description = "세부 지역 필터(선택)", example = "서귀포시")
            @RequestParam(value = "subRegion", required = false) String subRegion) {

        ArrayList<Hub> list =
                new ArrayList<>(
                        placeService.selectPlaceList(
                                cpage,
                                keyword,
                                type,
                                region,
                                subRegion
                        )
                );

        PageInfo pageInfo =
                placeService.getPlacePageInfo(
                        cpage,
                        keyword,
                        type,
                        region,
                        subRegion
                );

        Map<String, Object> map =
                new HashMap<>();

        map.put("list", list);
        map.put("pageInfo", pageInfo);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(map);
    }


    @Operation(summary = "거점(장소) 상세 조회", description = "거점(장소) 번호로 상세 정보를 조회합니다. 로그인 없이 누구나 조회할 수 있습니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    // 장소 상세 조회
    @GetMapping("/{hubNo}")
    public ResponseEntity<Hub> selectPlace(
            @Parameter(description = "조회할 거점(장소) 번호", example = "1", required = true)
            @PathVariable int hubNo) {

        Hub h = placeService.selectPlace(hubNo);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(h);
    }


    @Operation(summary = "거점(장소) 수정", description = "거점(장소) 정보를 수정합니다. 대표 이미지 파일을 새로 업로드할 수 있으며, ADMIN 권한을 가진 로그인 사용자만 호출할 수 있습니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "수정 처리 결과(success/fail) 반환"),
        @ApiResponse(responseCode = "403", description = "ADMIN 권한이 아닌 경우", content = @Content)
    })
    @SecurityRequirement(name = "JWT")
    // 장소 수정
    @PutMapping("/{hubNo}")
    public ResponseEntity<String> updatePlace(
            @Parameter(description = "수정할 거점(장소) 번호", example = "1", required = true)
            @PathVariable int hubNo,
            @Parameter(description = "수정할 거점(장소) 정보(JSON)", required = true)
            @RequestPart("place") Hub h,
            @Parameter(description = "새로 등록할 대표 이미지 파일(선택)")
            @RequestPart(value = "file", required = false) MultipartFile file,
            HttpSession session) {

        h.setHubNo(hubNo);

        Hub updatePlace =
                placeService.updatePlace(h);

        if (updatePlace != null
                && file != null
                && !file.isEmpty()) {

            String changeName =
                    fileRenamePolicy.saveFile(
                            file,
                            session,
                            "/resources/upload/hub/"
                    );

            HubFile hubFile = new HubFile();

            hubFile.setHub(updatePlace);
            hubFile.setFilePath("/resources/upload/hub");
            hubFile.setOriginName(file.getOriginalFilename());
            hubFile.setChangeName(changeName);

            placeService.updatePlaceFile(hubFile);
        }

        String message =
                (updatePlace != null)
                ? "success"
                : "fail";

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(message);
    }


    @Operation(summary = "거점(장소) 종료", description = "거점(장소)을 종료(운영 상태 변경) 처리합니다. 실제 레코드를 삭제하지 않고 상태를 변경하며, ADMIN 권한을 가진 로그인 사용자만 호출할 수 있습니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "종료 처리 결과(success/fail) 반환"),
        @ApiResponse(responseCode = "403", description = "ADMIN 권한이 아닌 경우", content = @Content)
    })
    @SecurityRequirement(name = "JWT")
    // 장소 종료
    @DeleteMapping("/{hubNo}")
    public ResponseEntity<String> deletePlace(
            @Parameter(description = "종료할 거점(장소) 번호", example = "1", required = true)
            @PathVariable int hubNo) {

    	
        int result =
                placeService.deletePlace(hubNo);

        String message =
                (result > 0)
                ? "success"
                : "fail";

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(message);
    }
}