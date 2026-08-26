package com.kh.workflow.workcation.model.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.workcation.model.dao.WorkcationDao;
import com.kh.workflow.workcation.model.vo.Workcation;

@Service
public class WorkcationServiceImpl implements WorkcationService {

	@Autowired
	private WorkcationDao workcationDao; // 선언만 해두고 실제 호출은 하지 않음

	@Override
	public Page<Workcation> selectWorkcationList(Pageable pageable) {
		
		// DB를 타지 않고 순수 더미 데이터 생성
		List<Workcation> dummyList = new ArrayList<>();
		
		// 1번 더미
		Workcation w1 = new Workcation();
		w1.setWorkcationNo(1);
		w1.setWorkcationTitle("부산 해변 오피스 체험");
		w1.setCreatedAt(LocalDateTime.now());
		w1.setApproverState("A"); // 승인
		
		Employee emp1 = new Employee();
		emp1.setEmpName("김철수");
		w1.setEmployee(emp1);
		
		dummyList.add(w1);
		
		// 2번 더미
		Workcation w2 = new Workcation();
		w2.setWorkcationNo(2);
		w2.setWorkcationTitle("강원도 산장 워크숍");
		w2.setCreatedAt(LocalDateTime.now());
		w2.setApproverState("H"); // 보류
		
		Employee emp2 = new Employee();
		emp2.setEmpName("이영희");
		w2.setEmployee(emp2);
		
		dummyList.add(w2);

		// 페이징 객체로 변환하여 반환
		return new PageImpl<>(dummyList, pageable, dummyList.size());
	}
}