package com.kh.workflow.task.model.dao;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.task.model.vo.Task;
import com.kh.workflow.task.model.vo.TaskHistory;

public interface TaskDao extends JpaRepository<Task, Integer> {

    List<Task> findByWorkWorkNo(Integer workNo);

    Page<Task> findAllByOrderByTaskNoDesc(Pageable pageable);

    Page<Task> findByTaskTitleContainingOrderByTaskNoDesc(String keyword, Pageable pageable);
    
}