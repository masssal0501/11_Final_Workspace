package com.kh.workflow.task.model.vo;

import java.time.LocalDateTime;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;

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
@Table(name = "work")

@DynamicInsert
@DynamicUpdate

@NoArgsConstructor
@Setter
@Getter
@ToString
public class Work {

    @Id
    @Column(name = "work_no")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer workNo; // 근무 번호


    @Schema(
        description = "근무 제출시간",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    @Column(
        name = "submitted_at",
        nullable = false,
        columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    )
    private LocalDateTime submittedAt;


    @Schema(
        description = "근무 수정시간",
        accessMode = Schema.AccessMode.READ_ONLY
    )
    @Column(
        name = "updated_at",
        columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    )
    private LocalDateTime updatedAt;


    @Schema(
        description = "워케이션 번호",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @JoinColumn(
        name = "workcation_no",
        nullable = false
    )
    @ManyToOne(fetch = FetchType.LAZY)
    private WorkcationInfo workcation;
}