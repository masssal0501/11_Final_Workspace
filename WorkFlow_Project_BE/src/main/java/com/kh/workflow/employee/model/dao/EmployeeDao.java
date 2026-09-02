package com.kh.workflow.employee.model.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.employee.model.vo.Employee;

public interface EmployeeDao
        extends JpaRepository<Employee, Integer> {

    boolean existsByEmpId(String empId);

    boolean existsByEmail(String email);
    
    Optional<Employee> findByEmpId(String empId);

    // 부서명 조회
    @Query("""
    		SELECT d.depTitle
    		  FROM Department d
    		 WHERE d.depId = :depId 
    		""")
	String selectDepTitle(@Param("depId")String depId);
    
    
}
