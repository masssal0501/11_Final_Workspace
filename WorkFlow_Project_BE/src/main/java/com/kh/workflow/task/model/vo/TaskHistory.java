package com.kh.workflow.task.model.vo;

import java.time.LocalDateTime;

import org.hibernate.annotations.DynamicInsert;

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
@Table(name = "task_history")

@DynamicInsert

@NoArgsConstructor
@Setter
@Getter
@ToString
public class TaskHistory {

    @Id
    @Column(name = "history_no")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer historyNo;


    @Schema(
        description = "업무 리포트 제목",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @Column(
        name = "history_title",
        length = 200,
        nullable = false
    )
    private String historyTitle;


    @Schema(
        description = "업무 리포트 내용",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @Column(
        name = "history_content",
        length = 1000,
        nullable = false
    )
    private String historyContent;


    @Schema(
        description = "해당 시점 진행률",
        defaultValue = "0"
    )
    @Column(
        name = "progress",
        nullable = false
    )
    private Integer progress;


    @Schema(
        description = "활동 작성시간",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    @Column(
        name = "created_at",
        columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    )
    private LocalDateTime createdAt;


    @Schema(
        description = "업무 번호",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @JoinColumn(
        name = "task_no",
        nullable = false
    )
    @ManyToOne(fetch = FetchType.LAZY)
    private Task task;
}