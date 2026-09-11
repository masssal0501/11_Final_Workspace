package com.kh.workflow.task.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.task.model.vo.TaskHistory;

public interface TaskHistoryDao extends JpaRepository<TaskHistory, Integer>{

	List<TaskHistory> findByTaskTaskNoOrderByCreatedAtDesc(Integer taskNo);
	
	

}
