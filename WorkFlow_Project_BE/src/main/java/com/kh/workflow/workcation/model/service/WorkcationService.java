package com.kh.workflow.workcation.model.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface WorkcationService {

	Page<Map<String, Object>> selectWorkcationList(Map<String, Object> paraMap, Pageable pageable);

	void insertWorkcationEnrollForm(Map<String, Object> paramMap);

	void insertWorkcation(WorkcationInfo workcartion);

	Map<String, Object> getAmountSupportInfo();

	Map<String, Object> getWorkcationDetail(Integer workcationNo);

	void deleteWorkcation(Integer workcationNo);

	void updateWorkcation(Integer workcationNo, Map<String, Object> updateData);

	// 내 워케이션 목록
	Page<Map<String, Object>> selectMyWorkcationList(Map<String, Object> paramMap, Pageable pageable);

	// 내 워케이션 상세
	Map<String, Object> getMyWorkcationDetail(Integer workcationNo, int empNo);

	void updateTask(Integer taskNo, Integer progress, String title, String content, MultipartFile file);

	Map<String, Object> getWorkcationSchedule(LocalDate date, int empNo);

	void uploadWorkFile(Integer workcationNo, MultipartFile file);

	void deleteWorkFile(Integer taskFileNo);
	// TODO-N03: 워케이션 최종 완료 처리(MANAGER/ADMIN 전용, 전체 업무 완료 후)
	void completeWorkcation(Integer workcationNo, Employee loginEmployee);

}
