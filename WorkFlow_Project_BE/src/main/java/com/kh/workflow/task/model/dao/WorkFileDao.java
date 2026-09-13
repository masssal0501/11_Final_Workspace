package com.kh.workflow.task.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.task.model.vo.WorkFile;

public interface WorkFileDao
        extends JpaRepository<WorkFile, Integer> {

	// BUG: WorkFile은 work_no가 아니라 task_no로 task 테이블을 참조한다(실제 work_file 스키마 기준).
	List<WorkFile> findByTaskTaskNo(Integer taskNo);
	
}