package com.kh.workflow.employee.model.vo;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name="department") // 실제 MySQL 테이블명
@DynamicInsert
@DynamicUpdate
@NoArgsConstructor
@Setter
@Getter
@ToString
public class Department {
    @Id
    @Column(name="dep_id", length = 2) // 실제 컬럼명
    private String depId;

    @Column(name="dep_title")
    private String depTitle;
}
