package com.kh.workflow.task.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.task.model.vo.Task;

public interface TaskDao extends JpaRepository<Task, Integer>{

	List<Task> findByWorkWorkNo(Integer workNo);
}
