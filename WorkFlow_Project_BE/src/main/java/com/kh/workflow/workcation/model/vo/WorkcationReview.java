package com.kh.workflow.workcation.model.vo;

import java.time.LocalDateTime;

import org.hibernate.annotations.DynamicInsert;

import com.kh.workflow.employee.model.vo.Employee;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

// TODO-N02: 만족도 조사(workcation_survey/survey_answer)와는 별개의 "워케이션 후기" 기능.
// 워케이션당 1건, 별점+후기글+사진(선택)으로 구성된다.
@Entity
@Table(name = "workcation_review")

@DynamicInsert

@NoArgsConstructor
@Setter
@Getter
@ToString
public class WorkcationReview {

    @Schema(description = "후기번호", accessMode = Schema.AccessMode.READ_ONLY)
    @Id
    @Column(name = "review_no")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer reviewNo;

    @Schema(description = "별점(1~5)", requiredMode = Schema.RequiredMode.REQUIRED)
    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Schema(description = "후기 내용", requiredMode = Schema.RequiredMode.REQUIRED)
    @Column(name = "content", length = 500, nullable = false)
    private String content;

    @Schema(description = "사진 저장 경로(선택)")
    @Column(name = "photo_path", length = 500)
    private String photoPath;

    @Schema(description = "사진 원본 파일명")
    @Column(name = "photo_origin_name", length = 255)
    private String photoOriginName;

    @Schema(description = "사진 저장 파일명")
    @Column(name = "photo_change_name", length = 255)
    private String photoChangeName;

    @Schema(description = "작성일시", accessMode = Schema.AccessMode.READ_ONLY)
    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Schema(description = "워케이션 정보", requiredMode = Schema.RequiredMode.REQUIRED)
    @OneToOne
    @JoinColumn(name = "workcation_no", nullable = false)
    private WorkcationInfo workcation;

    @Schema(description = "작성자(사원)", requiredMode = Schema.RequiredMode.REQUIRED)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_no", nullable = false)
    private Employee employee;
}
