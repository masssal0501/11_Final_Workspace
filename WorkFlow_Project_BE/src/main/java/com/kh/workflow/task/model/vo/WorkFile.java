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
@Table(name = "work_file")
@DynamicInsert
@DynamicUpdate
@NoArgsConstructor
@Setter
@Getter
@ToString
public class WorkFile {

    @Id
    @Column(name = "taskfile_no")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer taskFileNo;

    @Schema(description = "파일경로")
    @Column(name = "file_path", length = 500)
    private String filePath;

    @Schema(description = "원본 파일명")
    @Column(name = "origin_name", length = 255, nullable = false)
    private String originName;

    @Schema(description = "변경된 파일명")
    @Column(name = "change_name", length = 255, nullable = false)
    private String changeName;

    @Schema(description = "첨부파일 등록일시")
    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Schema(description = "파일용량")
    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Schema(description = "상태")
    @Column(name = "status", columnDefinition = "VARCHAR(1) DEFAULT 'Y'")
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_no", nullable = false)
    private Work work;
}