package com.kh.workflow.approval.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
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


    // =========================================================
    // 승인 이력 목록 조회
    // =========================================================
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> selectApprovalList(

            @RequestParam(
                    value = "cpage",
                    defaultValue = "1"
            )
            int currentPage,

            @RequestParam(
                    value = "startDate",
                    required = false
            )
            String startDate,

            @RequestParam(
                    value = "endDate",
                    required = false
            )
            String endDate,

            @RequestParam(
                    value = "searchType",
                    required = false
            )
            String searchType,

            @RequestParam(
                    value = "keyword",
                    required = false
            )
            String keyword
    ) {

        Pageable pageable =
                PageRequest.of(
                        currentPage - 1,
                        10
                );


        // 검색 날짜 변환
        LocalDateTime startDateTime = null;
        LocalDateTime endDateTime = null;

        if (startDate != null && !startDate.isEmpty()
                && endDate != null && !endDate.isEmpty()) {

            startDateTime =
                    LocalDate.parse(startDate)
                             .atStartOfDay();

            endDateTime =
                    LocalDate.parse(endDate)
                             .plusDays(1)
                             .atStartOfDay();
        }


        // 승인 이력 조회
        Page<WorkcationInfo> pageResult =
                approvalService.selectApprovalList(
                        searchType,
                        keyword,
                        startDateTime,
                        endDateTime,
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


    // =========================================================
    // 승인 대기 목록 조회
    // =========================================================
    @GetMapping("/queue")
    public ResponseEntity<Map<String, Object>> selectApprovalQueueList(

            @RequestParam(
                    value = "cpage",
                    defaultValue = "1"
            )
            int currentPage,

            @RequestParam(
                    value = "startDate",
                    required = false
            )
            String startDate,

            @RequestParam(
                    value = "endDate",
                    required = false
            )
            String endDate,

            @RequestParam(
                    value = "searchType",
                    required = false
            )
            String searchType,

            @RequestParam(
                    value = "keyword",
                    required = false
            )
            String keyword,

            @RequestParam(
                    value = "status",
                    required = false
            )
            String status
    ) {

        Pageable pageable =
                PageRequest.of(
                        currentPage - 1,
                        10
                );


        // 검색 날짜 변환
        LocalDateTime startDateTime = null;
        LocalDateTime endDateTime = null;

        if (startDate != null && !startDate.isEmpty()
                && endDate != null && !endDate.isEmpty()) {

            startDateTime =
                    LocalDate.parse(startDate)
                             .atStartOfDay();

            endDateTime =
                    LocalDate.parse(endDate)
                             .plusDays(1)
                             .atStartOfDay();
        }


        // 승인 대기 목록 조회
        Page<WorkcationInfo> pageResult =
                approvalService.selectApprovalQueueList(
                        status,
                        searchType,
                        keyword,
                        startDateTime,
                        endDateTime,
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


    // =========================================================
    // 승인 이력 상세 조회
    // =========================================================
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


    // =========================================================
    // 반려 기능
    // =========================================================
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