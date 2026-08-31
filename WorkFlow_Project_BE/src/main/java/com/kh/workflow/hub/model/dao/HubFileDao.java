package com.kh.workflow.hub.model.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.hub.model.vo.HubFile;

public interface HubFileDao extends JpaRepository<HubFile, Integer> {

    HubFile findFirstByHub_HubNoAndStatusOrderByHubfileNoDesc(
            int hubNo,
            String status
    );


}