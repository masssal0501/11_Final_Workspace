package com.kh.workflow.workcation.model.vo;

import java.time.LocalDateTime;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.kh.workflow.place.model.vo.Place;

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
@Table(name="RESERVATION")

@DynamicInsert
@DynamicUpdate

@NoArgsConstructor
@Setter
@Getter
@ToString
public class Reservation {

	@Id
	@Column(name="rsv_no")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Integer rsvNo;
	
	@Column(name="rsv_start", nullable=false)
	private LocalDateTime rsvStart;
	
	@Column(name="rsv_end", nullable=false)
	private LocalDateTime rsvEnd;
	
	@Column(name="rsv_status", columnDefinition = "VARCHAR(1) DEFAULT 'N'")
	private String rsvStatus;
	
	@Column(name="user_capacity")
	private Integer userCapacity;
	
	@JoinColumn(name="workcation_no", nullable=false)
	@ManyToOne()
	private Workcation workcation;
	
	@JoinColumn(name="hub_no", nullable=false)
	@ManyToOne(fetch = FetchType.LAZY)
	private Place hub;
}
