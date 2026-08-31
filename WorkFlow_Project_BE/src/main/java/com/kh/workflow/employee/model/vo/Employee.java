package com.kh.workflow.employee.model.vo;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "employee",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_employee_id",
            columnNames = "emp_id"
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "emp_no")
    private Integer empNo;

    @Column(
        name = "emp_id",
        nullable = false,
        length = 20
    )
    private String empId;

    @Column(
        name = "emp_pwd",
        nullable = false,
        length = 100
    )
    private String empPwd;

    @Column(
        name = "emp_name",
        nullable = false,
        length = 20
    )
    private String empName;

    @Column(
        name = "phone",
        length = 13
    )
    private String phone;

    @Column(
        name = "email",
        length = 100
    )
    private String email;

    @Column(
        name = "address",
        length = 300
    )
    private String address;

    @Column(
        name = "join_at",
        nullable = false,
        updatable = false
    )
    private LocalDateTime joinAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Column(
        name = "status",
        nullable = false,
        length = 1
    )
    @Builder.Default
    private String status = "Y";

    @Column(
        name = "pw_chg_required",
        nullable = false
    )
    @Builder.Default
    private Boolean pwChgRequired = true;

    @Column(
        name = "dep_id",
        nullable = false,
        length = 2
    )
    private String depId;

    @Column(
        name = "auth_code",
        nullable = false,
        length = 20
    )
    private String authCode;

    @Column(
        name = "job_code",
        nullable = false,
        length = 20
    )
    private String jobCode;


    @PrePersist
    protected void onCreate() {

        if (joinAt == null) {
            joinAt = LocalDateTime.now();
        }
    }
}
