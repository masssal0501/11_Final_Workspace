package com.kh.workflow.task.model.vo;

import java.time.LocalDateTime;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "task")

@DynamicInsert
@DynamicUpdate

@NoArgsConstructor
@Setter
@Getter
@ToString
public class Task {

    @Id
    @Column(name = "task_no")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer taskNo; // 업무 번호


    @Schema(
        description = "업무 제목",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @Column(
        name = "task_title",
        length = 200,
        nullable = false
    )
    private String taskTitle;


    @Schema(
        description = "업무 내용",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @Column(
        name = "task_content",
        length = 300,
        nullable = false
    )
    private String taskContent;


    @Schema(
        description = "업무 시작시간",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @Column(
        name = "tasktime_at",
        nullable = false
    )
    private LocalDateTime tasktimeAt;


    @Schema(
        description = "업무 종료시간",
        requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    @Column(name = "taskend_at")
    private LocalDateTime taskendAt;


    @Schema(
        description = "업무 진행률",
        allowableValues = {
            "0", "5", "10", "15", "20",
            "25", "30", "35", "40", "45",
            "50", "55", "60", "65", "70",
            "75", "80", "85", "90", "95",
            "100"
        },
        defaultValue = "0"
    )
    @Column(
        name = "progress",
        nullable = false,
        columnDefinition = "INT DEFAULT 0"
    )
    private Integer progress;


    @Schema(
        description = "업무 상태",
        defaultValue = "N"
    )
    @Column(
        name = "status",
        length = 1,
        columnDefinition = "VARCHAR(1) DEFAULT 'N'"
    )
    private String status;


    @Schema(
        description = "근무 번호",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @JoinColumn(
        name = "work_no",
        nullable = false
    )
    @ManyToOne(fetch = FetchType.LAZY)
    private Work work;
}