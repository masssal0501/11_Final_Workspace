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
    
    Optional<Employee> findByEmpNameAndEmail(
            String empName,
            String email
    );

    /**
	 * [부서장] 부서 아이디(depId)를 기반으로 해당 부서의 부서명(depTitle) 조회
	 * 
	 * @param depId 조회할 부서의 아이디
	 * @return String 부서명
	 */
    @Query("""
    		SELECT d.depTitle
    		  FROM Department d
    		 WHERE d.depId = :depId 
    		""")
	String selectDepTitle(@Param("depId")String depId);
    
    
}
