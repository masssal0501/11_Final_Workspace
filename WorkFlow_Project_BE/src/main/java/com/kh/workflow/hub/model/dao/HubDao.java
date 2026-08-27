package com.kh.workflow.hub.model.dao;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.hub.model.vo.Hub;

public interface HubDao extends JpaRepository<Hub, Integer> {
	@EntityGraph(attributePaths = {"hubFileList"})
	Page<Hub> findAllByOrderByHubNoDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"hubFileList"})
    Page<Hub> findAll(Pageable pageable);
    
    @EntityGraph(attributePaths = {"hubFileList"})
    @Query("SELECT h FROM Hub h WHERE " +
            "(:mainRegion IS NULL OR :mainRegion = '' OR h.mainRegion = :mainRegion) AND " +
            "(:subRegion IS NULL OR :subRegion = '' OR h.subRegion = :subRegion) AND " +
            "(h.hubType IN :hubTypes) AND " +
            "(:keyword IS NULL OR :keyword = '' OR h.hubName LIKE %:keyword%) " +
            "ORDER BY h.hubNo DESC")
     Page<Hub> searchHubList(
         Pageable pageable,
         @Param("mainRegion") String mainRegion,
         @Param("subRegion") String subRegion,
         @Param("hubTypes") List<Integer> hubTypes,
         @Param("keyword") String keyword
     );}