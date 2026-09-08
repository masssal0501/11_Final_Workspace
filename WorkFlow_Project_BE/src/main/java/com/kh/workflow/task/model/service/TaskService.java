package com.kh.workflow.task.model.service;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TaskService {

	Page<Map<String, Object>> selectTaskList(String condition, String keyword, Pageable pageable);

	Map<String, Object> selectTaskDetail(Integer taskNo);

	Page<Map<String, Object>> selectTaskBoardList(String keyword, Pageable pageable);

	Map<String, Object> selectWorkcationTasks(Integer workcationNo);
}