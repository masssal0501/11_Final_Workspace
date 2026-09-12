package com.kh.workflow.amount.model.vo;

import java.time.LocalDateTime;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
@Table(name = "amount_file")

@DynamicInsert
@DynamicUpdate

@NoArgsConstructor
@Getter
@Setter
@ToString(exclude = "amount")
public class AmountFile {

    @Schema(description = "첨부파일 번호", accessMode = Schema.AccessMode.READ_ONLY)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "amountfile_no")
    private Integer amountFileNo;

    @Schema(description = "파일경로")
    @Column(name = "file_path", length = 500)
    private String filePath;

    @Schema(description = "원본 파일명", requiredMode = Schema.RequiredMode.REQUIRED)
    @Column(name = "origin_name", length = 225, nullable = false)
    private String originName;

    @Schema(description = "수정된 파일명", requiredMode = Schema.RequiredMode.REQUIRED)
    @Column(name = "change_name", length = 225, nullable = false)
    private String changeName;

    @Schema(description = "첨부파일 등록일", accessMode = Schema.AccessMode.READ_ONLY)
    @Column(
        name = "created_at",
        columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    )
    private LocalDateTime createdAt;

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

    @Schema(description = "비용번호", hidden = true)
    @JsonIgnore
    @JoinColumn(name = "amount_no", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private Amount amount;
}