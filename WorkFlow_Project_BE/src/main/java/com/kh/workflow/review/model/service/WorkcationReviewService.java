package com.kh.workflow.review.model.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.workcation.model.vo.WorkcationReview;

public interface WorkcationReviewService {

    // 작성 가능 여부(본인 소유 / 승인 완료 / 종료 여부 / 기작성 여부) - 만족도 조사와 동일한 원칙
    Map<String, Object> getReviewStatus(int empNo, Integer workcationNo);

    // 워케이션 후기 조회(없으면 null)
    WorkcationReview getReview(Integer workcationNo);

    // 내가 작성한 후기 목록
    List<WorkcationReview> getMyReviews(int empNo);

    // 후기 제출
    WorkcationReview submitReview(int empNo, Integer workcationNo, Integer rating, String content, MultipartFile photo);
}
