package com.kh.workflow.review.model.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.workcation.model.dao.WorkcationDao;
import com.kh.workflow.workcation.model.dao.WorkcationReviewDao;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;
import com.kh.workflow.workcation.model.vo.WorkcationReview;

import lombok.RequiredArgsConstructor;

// TODO-N02: 만족도 조사(SurveyServiceImpl)와 동일한 원칙(본인 소유/승인 완료/종료 후/1회만)으로
// 별점+후기글+사진(선택)을 저장하는 워케이션 후기 기능.
@Service
@RequiredArgsConstructor
public class WorkcationReviewServiceImpl implements WorkcationReviewService {

    private final WorkcationReviewDao workcationReviewDao;

    private final WorkcationDao workcationDao;

    // 운영 환경에서는 APP_UPLOAD_REVIEWS_DIR 환경변수로 실제 저장 경로를 지정한다.
    // (Hub 썸네일 버그의 교훈 - System.getenv() 대신 Spring @Value로 프로필별 기본값을 사용해
    // 운영 서버에 별도 환경변수를 추가하지 않아도 application-prod.properties 기본값으로 동작한다)
    @Value("${app.upload.reviews-dir:C:/upload/reviews/}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 10L * 1024L * 1024L;

    private static final List<String> ALLOWED_EXTENSIONS = List.of("jpg", "jpeg", "png", "gif", "webp");


    @Override
    public Map<String, Object> getReviewStatus(int empNo, Integer workcationNo) {

        WorkcationInfo workcation = workcationDao.findById(workcationNo)
                .orElseThrow(() -> new IllegalArgumentException("해당 워케이션 정보를 찾을 수 없습니다. 번호: " + workcationNo));

        Map<String, Object> status = new HashMap<>();

        if (workcation.getEmployee() == null || workcation.getEmployee().getEmpNo() == null
                || workcation.getEmployee().getEmpNo() != empNo) {
            status.put("available", false);
            status.put("submitted", false);
            status.put("message", "본인의 워케이션에 대해서만 후기를 작성할 수 있습니다.");
            return status;
        }

        boolean submitted = workcationReviewDao.existsByWorkcationWorkcationNo(workcationNo);
        status.put("submitted", submitted);

        if (submitted) {
            status.put("available", false);
            status.put("message", "이미 후기를 작성하셨습니다.");
            return status;
        }

        if (!"A".equals(workcation.getApproverState())) {
            status.put("available", false);
            status.put("message", "승인된 워케이션만 후기를 작성할 수 있습니다.");
            return status;
        }

        if (workcation.getEndAt() == null || LocalDateTime.now().isBefore(workcation.getEndAt())) {
            status.put("available", false);
            status.put("message", "워케이션 종료 후 후기를 작성할 수 있습니다.");
            return status;
        }

        status.put("available", true);
        status.put("message", "");
        return status;
    }

    @Override
    public WorkcationReview getReview(Integer workcationNo) {
        return workcationReviewDao.findByWorkcationWorkcationNo(workcationNo).orElse(null);
    }

    @Override
    public List<WorkcationReview> getMyReviews(int empNo) {
        return workcationReviewDao.findByEmployeeEmpNoOrderByCreatedAtDesc(empNo);
    }

    @Override
    @Transactional
    public WorkcationReview submitReview(int empNo, Integer workcationNo, Integer rating, String content,
            MultipartFile photo) {

        WorkcationInfo workcation = workcationDao.findById(workcationNo)
                .orElseThrow(() -> new IllegalArgumentException("해당 워케이션 정보를 찾을 수 없습니다. 번호: " + workcationNo));

        if (workcation.getEmployee() == null || workcation.getEmployee().getEmpNo() == null
                || workcation.getEmployee().getEmpNo() != empNo) {
            throw new IllegalArgumentException("본인의 워케이션에 대해서만 후기를 작성할 수 있습니다.");
        }

        if (!"A".equals(workcation.getApproverState())) {
            throw new IllegalArgumentException("승인된 워케이션만 후기를 작성할 수 있습니다.");
        }

        if (workcation.getEndAt() == null || LocalDateTime.now().isBefore(workcation.getEndAt())) {
            throw new IllegalArgumentException("워케이션 종료 후 후기를 작성할 수 있습니다.");
        }

        if (workcationReviewDao.existsByWorkcationWorkcationNo(workcationNo)) {
            throw new IllegalArgumentException("이미 후기를 작성하셨습니다.");
        }

        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("별점은 1~5 사이로 입력해 주세요.");
        }

        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("후기 내용을 입력해 주세요.");
        }

        WorkcationReview review = new WorkcationReview();
        review.setWorkcation(workcation);
        review.setEmployee(workcation.getEmployee());
        review.setRating(rating);
        review.setContent(content.trim());
        review.setCreatedAt(LocalDateTime.now());

        if (photo != null && !photo.isEmpty()) {
            savePhoto(review, photo);
        }

        return workcationReviewDao.save(review);
    }

    private void savePhoto(WorkcationReview review, MultipartFile photo) {

        if (photo.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("사진은 10MB 이하만 업로드할 수 있습니다.");
        }

        String originalFilename = photo.getOriginalFilename();

        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("파일명이 올바르지 않습니다.");
        }

        originalFilename = new File(originalFilename).getName();

        String extension = getExtension(originalFilename);

        if (extension == null || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("jpg, jpeg, png, gif, webp 이미지만 업로드할 수 있습니다.");
        }

        String changeName = UUID.randomUUID() + "_" + originalFilename;

        String saveDir = uploadDir.endsWith("/") ? uploadDir : uploadDir + "/";

        File dir = new File(saveDir);

        if (!dir.exists() && !dir.mkdirs() && !dir.exists()) {
            throw new IllegalArgumentException("사진 저장 폴더를 생성할 수 없습니다: " + saveDir);
        }

        try {
            photo.transferTo(new File(saveDir, changeName));
        } catch (IOException e) {
            throw new RuntimeException("사진 저장에 실패했습니다.", e);
        }

        review.setPhotoOriginName(originalFilename);
        review.setPhotoChangeName(changeName);
        review.setPhotoPath("/upload/reviews/" + changeName);
    }

    private String getExtension(String filename) {

        int index = filename.lastIndexOf(".");

        if (index < 0 || index == filename.length() - 1) {
            return null;
        }

        return filename.substring(index + 1).toLowerCase();
    }
}
