package com.kh.workflow.place.controller;

import java.util.ArrayList;

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

import com.kh.workflow.common.template.FileRenamePolicy;
import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.hub.model.vo.HubFile;
import com.kh.workflow.place.model.service.PlaceService;

import jakarta.servlet.http.HttpSession;



@RestController
@RequestMapping("/place")
public class PlaceController {

    @Autowired
    private PlaceService placeService;


    // =========================================================
    // 지역 정보 등록
    // POST /workflow/place
    // =========================================================
    @PostMapping
    public ResponseEntity<String> insertPlace(
            @RequestPart("place") Hub h,
            @RequestPart(value = "file", required = false) MultipartFile file,
            HttpSession session) {

        // 기본 상태 설정
        if (h.getHubStatus() == null || h.getHubStatus().isBlank()) {
            h.setHubStatus("OPEN");
        }

        // 지역 정보 등록
        Hub insertPlace = placeService.insertPlace(h);
        
        if(insertPlace != null && file != null&& !file.isEmpty()) {
        	
        	String changeName = FileRenamePolicy.saveFile(file, session, "/resources/upload/hub/");
        	
        
        
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


    // =========================================================
    // 지역 정보 목록 조회
    // GET /workflow/place
    // =========================================================
    @GetMapping
    public ResponseEntity<ArrayList<Hub>> selectPlaceList(
            @RequestParam(value = "cpage", defaultValue = "1") int cpage,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "subRegion", required = false) String subRegion) {

        ArrayList<Hub> list =
                new ArrayList<>(
                        placeService.selectPlaceList(
                                cpage,
                                type,
                                region,
                                subRegion
                        )
                );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(list);
    }


    // =========================================================
    // 지역 정보 상세 조회
    // GET /workflow/place/{hubNo}
    // =========================================================
    @GetMapping("/{hubNo}")
    public ResponseEntity<Hub> selectPlace(
            @PathVariable int hubNo) {

        Hub h = placeService.selectPlace(hubNo);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(h);
    }


    // =========================================================
    // 지역 정보 수정
    // PUT /workflow/place/{hubNo}
    // =========================================================
    @PutMapping("/{hubNo}")
    public ResponseEntity<String> updatePlace(
            @PathVariable int hubNo,
            @RequestPart("place") Hub h,
            @RequestPart(value = "file", required = false) MultipartFile file,
            HttpSession session) {

        // URL의 hubNo를 기준으로 수정
        h.setHubNo(hubNo);

        Hub updatePlace = placeService.updatePlace(h);

        if(updatePlace != null && file != null && !file.isEmpty()) {
        	String changeName = FileRenamePolicy.saveFile(file, session, "/resources/upload/hub/");
        	
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


    // =========================================================
    // 지역 정보 삭제
    // DELETE /workflow/place/{hubNo}
    // =========================================================
    @DeleteMapping("/{hubNo}")
    public ResponseEntity<String> deletePlace(
            @PathVariable int hubNo) {

        int result = placeService.deletePlace(hubNo);

        String message =
                (result > 0)
                ? "success"
                : "fail";

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(message);
    }

}