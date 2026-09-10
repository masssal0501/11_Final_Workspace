package com.kh.workflow.employee.model.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.employee.model.vo.Verification;

public interface VerificationDao
        extends JpaRepository<Verification, Integer> {

    Optional<Verification> findTopByEmployee_EmpNoAndVerificationCodeOrderByCreatedAtDesc(
            Integer empNo,
            String verificationCode
    );
}
