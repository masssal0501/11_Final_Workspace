package com.kh.workflow.task.model.vo;

import java.time.LocalDateTime;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name="task")

@DynamicInsert
@DynamicUpdate

@NoArgsConstructor
@Setter
@Getter
@ToString
public class Task {
	
	@Schema(description="업무 번호", example="1", accessMode=Schema.AccessMode.READ_ONLY)
	@Id
	@Column(name="task_no")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int taskNo;
	
	@Schema(description="업무 제목", requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="task_title", length=200, nullable=false)
	private String taskTitle;
	
	@Schema(description="업무 내용", requiredMode=Schema.RequiredMode.REQUIRED)
	@Column(name="task_content", length=300, nullable=false)
	private String taskContent;
	
	@Schema(description="업무 시간", accessMode=Schema.AccessMode.READ_ONLY)
	@Column(name="tasktime_at", nullable=false, columnDefinition="TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime tasktimeAt;
	
	@Schema(description="업무 종료", accessMode=Schema.AccessMode.READ_ONLY)
	@Column(name="taskend_at", columnDefinition="TIMESTAMP")
	private LocalDateTime taskendAt;
	
	@Schema(description="상태")
	@Column(name="status", length=1, columnDefinition="DEFAULT 'N'")
	private String status;
	
	@Schema(description="근무 정보 (Work 객체)")
	@ManyToOne
	@JoinColumn(name="work_no", nullable=false)
	private Work work;
}
