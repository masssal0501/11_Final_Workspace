package com.kh.workflow.ex;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table

@DynamicInsert
@DynamicUpdate

@NoArgsConstructor
@Setter
@Getter
@ToString
public class VO {
	
	@Schema(description="게시글 번호 (자동생성)", example ="1", accessMode=Schema.AccessMode.READ_ONLY)
	@Id
	@Column(name="EMP_NO")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Integer emp_no; //사원번호

	
	

}
