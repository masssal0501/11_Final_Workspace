package com.kh.workflow.attendance.model.vo;

import java.time.LocalDateTime;

import org.hibernate.annotations.DynamicInsert;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.hub.model.vo.Hub;
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
@Table(name = "attendance")

@DynamicInsert

@NoArgsConstructor
@Setter
@Getter
@ToString
public class Attendance {

	@Id
	@Column(name = "attendance_no")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer attendanceNo;

	@Schema(description = "IN 출근, OUT 퇴근", allowableValues = { "IN", "OUT" })
	@Column(name = "check_type", length = 3, nullable = false)
	private String checkType;

	@Column(name = "checked_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime checkedAt;

	@Column(name = "latitude", nullable = false)
	private Double latitude;

	@Column(name = "longitude", nullable = false)
	private Double longitude;

	@Column(name = "distance_m", nullable = false)
	private Integer distanceM;

	@Schema(description = "Y 지각, N 정상", allowableValues = { "Y", "N" }, defaultValue = "N")
	@Column(name = "is_late", length = 1, columnDefinition = "VARCHAR(1) DEFAULT 'N'")
	private String isLate;

	// 응답에 직원 비밀번호 해시 등 민감정보가 포함된 전체 연관 엔티티가 그대로
	// 직렬화되지 않도록 JsonIgnore 처리(Amount/Notice 등과 동일한 프로젝트 컨벤션).
	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "workcation_no", nullable = false)
	private WorkcationInfo workcation;

	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "emp_no", nullable = false)
	private Employee employee;

	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "hub_no", nullable = false)
	private Hub hub;
}
