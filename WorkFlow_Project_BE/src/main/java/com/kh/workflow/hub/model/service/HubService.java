package com.kh.workflow.hub.model.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.hub.model.vo.HubFile;

public interface HubService {

	Page<Hub> selectHubList(Pageable pageable);

	Hub insertHub(Hub hub, List<HubFile> fileList);
	
}
