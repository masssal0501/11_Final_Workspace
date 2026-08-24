package com.kh.workflow.hub.model.dao;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.hub.model.vo.Hub;

public interface HubDao extends JpaRepository<Hub, Integer> {
	@EntityGraph(attributePaths = {"hubFileList"})
	Page<Hub> findAllByOrderByHubNoDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"hubFileList"})
    Page<Hub> findAll(Pageable pageable);
}