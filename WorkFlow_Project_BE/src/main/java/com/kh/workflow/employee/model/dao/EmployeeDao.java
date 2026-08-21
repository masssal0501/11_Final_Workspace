package com.kh.workflow.employee.model.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.employee.model.vo.Employee;

public interface EmployeeDao
        extends JpaRepository<Employee, Integer> {

    boolean existsByEmpId(String empId);

    boolean existsByEmail(String email);
    
    Optional<Employee> findByEmpId(String empId);
}
