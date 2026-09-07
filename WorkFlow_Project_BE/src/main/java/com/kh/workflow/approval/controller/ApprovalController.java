package com.kh.workflow.approval.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import com.kh.workflow.approval.model.service.ApprovalService;
import com.kh.workflow.common.model.vo.PageInfo;
import com.kh.workflow.common.template.Pagination;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

import jakarta.servlet.http.HttpSession;

@CrossOrigin
@RestController
@RequestMapping("/approval")
public class ApprovalController {

    @Autowired
    private ApprovalService approvalService;


    // 승인 이력 목록 조회
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> selectApprovalList(
            @RequestParam(
                    value = "cpage",
                    defaultValue = "1"
            )
            int currentPage) {


        /*
         * 한 페이지 게시글 수 : 10개
         *
         * PageRequest의 페이지 번호는 0부터 시작하기 때문에
         * currentPage - 1
         */
        Pageable pageable =
                PageRequest.of(
                        currentPage - 1,
                        10
                );


        // 승인 완료(A)된 데이터만 조회
        Page<WorkcationInfo> pageResult =
                approvalService.selectApprovalList(
                        pageable
                );


        /*
         * 전체 승인 이력 개수
         */
        int listCount =
                (int) pageResult.getTotalElements();


        /*
         * 공통 Pagination 사용
         *
         * pageLimit = 5
         * boardLimit = 10
         */
        PageInfo pageInfo =
                Pagination.getPageInfo(
                        listCount,
                        currentPage,
                        5,
                        10
                );


        /*
         * 프론트에 전달할 데이터
         */
        Map<String, Object> map =
                new HashMap<>();


        // 현재 페이지의 승인 이력 목록
        map.put(
                "list",
                pageResult.getContent()
        );


        // 공통 페이지 정보
        map.put(
                "pageInfo",
                pageInfo
        );


        return ResponseEntity
                .status(HttpStatus.OK)
                .body(map);
    }
    
 // 승인 대기 목록 조회
    @GetMapping("/queue")
    public ResponseEntity<Map<String, Object>> selectApprovalQueueList(
            @RequestParam(
                    value = "cpage",
                    defaultValue = "1"
            )
            int currentPage) {

        Pageable pageable =
                PageRequest.of(
                        currentPage - 1,
                        10
                );

        // 승인 대기(W) 데이터 조회
        Page<WorkcationInfo> pageResult =
                approvalService.selectApprovalQueueList(
                        pageable
                );

        int listCount =
                (int) pageResult.getTotalElements();

        PageInfo pageInfo =
                Pagination.getPageInfo(
                        listCount,
                        currentPage,
                        5,
                        10
                );

        Map<String, Object> map =
                new HashMap<>();

        map.put(
                "list",
                pageResult.getContent()
        );

        map.put(
                "pageInfo",
                pageInfo
        );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(map);
    }


    // 승인 이력 상세 조회
    @GetMapping("/{workcationNo}")
    public ResponseEntity<WorkcationInfo> selectApproval(
            @PathVariable int workcationNo) {

        WorkcationInfo w =
                approvalService.selectApproval(
                        workcationNo
                );


        return ResponseEntity
                .status(HttpStatus.OK)
                .body(w);
    }


    // 반려 기능
    @PostMapping("/{workcationNo}")
    public ResponseEntity<String> rejectApproval(
            @PathVariable int workcationNo,
            @RequestPart("workcation") WorkcationInfo w,
            HttpSession session) {


        w.setWorkcationNo(workcationNo);


        WorkcationInfo rejectApproval =
                approvalService.rejectApproval(w);


        String message =
                (rejectApproval != null)
                ? "success"
                : "fail";


        return ResponseEntity
                .status(HttpStatus.OK)
                .body(message);
    }

}