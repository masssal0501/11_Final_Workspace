package com.kh.workflow.place.controller;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.place.model.service.PlaceService;
import com.kh.workflow.place.model.vo.Place;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;

@CrossOrigin
@RestController
public class PlaceController {

    @Value("${jwt.secret}")
    private String secretKey;

    @Autowired
    private PlaceService placeService;


    // 지역 정보 목록 조회
    @GetMapping("/places")
    public ResponseEntity<ArrayList<Place>> selectPlaceList() {

        ArrayList<Place> list =
                new ArrayList<>(placeService.selectPlaceList());

        return ResponseEntity.status(HttpStatus.OK)
                             .body(list);
    }


    // 지역 정보 등록
    @PostMapping("/places")
    public ResponseEntity<String> insertPlace(
            @RequestPart("place") Place p,
            @RequestPart(value = "file", required = false) MultipartFile file,
            HttpServletRequest request) {

        // Authorization 헤더 가져오기
        String authHeader = request.getHeader("Authorization");

        // Bearer 토큰 확인
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body("unauthorized");
        }

        String jwtTokenString = authHeader.substring(7);

        // Secret Key 생성
        Key key = Keys.hmacShaKeyFor(
                secretKey.getBytes(StandardCharsets.UTF_8)
        );

        // JWT 파싱
        Claims claims = Jwts.parserBuilder()
                            .setSigningKey(key)
                            .build()
                            .parseClaimsJws(jwtTokenString)
                            .getBody();

        // 로그인한 사용자 ID
        String userId = claims.getSubject();

        System.out.println("등록 요청 사용자 : " + userId);

        // 기본 상태 설정
        if (p.getHubStatus() == null || p.getHubStatus().isBlank()) {
            p.setHubStatus("OPEN");
        }

        // 장소 정보 등록
        Place insertPlace = placeService.insertPlace(p, file);

        String message =
                (insertPlace != null)
                ? "success"
                : "fail";

        return ResponseEntity.status(HttpStatus.OK)
                             .body(message);
    }


    // 지역 정보 상세 조회
    @GetMapping("/places/{hubNo}")
    public ResponseEntity<Place> selectPlace(
            @PathVariable int hubNo) {

        Place p = placeService.selectPlace(hubNo);

        return ResponseEntity.status(HttpStatus.OK)
                             .body(p);
    }


    // 지역 정보 수정
    @PutMapping("/places/{hubNo}")
    public ResponseEntity<String> updatePlace(
            @PathVariable int hubNo,
            @RequestPart("place") Place p,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        // URL의 hubNo를 기준으로 수정
        p.setHubNo(hubNo);

        Place updatePlace = placeService.updatePlace(p, file);

        String message =
                (updatePlace != null)
                ? "success"
                : "fail";

        return ResponseEntity.status(HttpStatus.OK)
                             .body(message);
    }


    // 지역 정보 삭제
    @DeleteMapping("/places/{hubNo}")
    public ResponseEntity<String> deletePlace(
            @PathVariable int hubNo) {

        int result = placeService.deletePlace(hubNo);

        String message =
                (result > 0)
                ? "success"
                : "fail";

        return ResponseEntity.status(HttpStatus.OK)
                             .body(message);
    }

}