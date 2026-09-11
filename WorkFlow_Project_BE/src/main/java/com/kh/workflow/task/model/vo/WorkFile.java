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
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

// BUG: 엔티티가 SQL/WorkFlow_Script.sql의 실제 work_file 테이블과 일치하지 않아
// 조회 시 "Unknown column" 500 오류가 발생했다(PK가 taskfile_no가 아닌 workfile_no,
// created_at/file_size 컬럼 없음, work_no가 아닌 task_no로 task 테이블을 참조).
// 실제 DB 스키마에 맞춰 엔티티를 수정한다(스키마 자체는 변경하지 않음).
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
    @Column(name = "workfile_no")
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

    @Schema(description = "첨부파일 수정일시")
    @Column(
        name = "updated_at",
        columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    )
    private LocalDateTime createdAt;

    // DB에 file_size 컬럼이 없어 영속되지 않는다. 업로드 응답 한 번에만 필요하므로
    // 요청 처리 중 메모리 상에서만 유지되는 값으로 둔다(재조회 시에는 채워지지 않음).
    @Schema(description = "파일용량(업로드 응답 전용, DB에 저장되지 않음)")
    @Transient
    private Long fileSize;

    @Schema(
        description = "상태",
        allowableValues = {"Y", "N"},
        defaultValue = "Y"
    )
    @Column(
        name = "status",
        columnDefinition = "VARCHAR(1) DEFAULT 'Y'"
    )
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_no", nullable = false)
    private Task task;
}