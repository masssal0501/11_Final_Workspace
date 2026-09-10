package com.kh.workflow.task.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.task.model.vo.WorkFile;

public interface WorkFileDao
        extends JpaRepository<WorkFile, Integer> {

    List<WorkFile> findByTaskTaskNo(Integer taskNo);
}