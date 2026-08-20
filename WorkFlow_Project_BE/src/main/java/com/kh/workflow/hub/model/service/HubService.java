package com.kh.workflow.hub.model.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.kh.workflow.hub.model.dao.HubDao;
import com.kh.workflow.hub.model.vo.Hub;

@Service
public class HubService {

	@Autowired
	private HubDao hubDao;

	public Page<Hub> selectHubList(Pageable pageable) {
		
		return hubDao.findAllByOrderByHubNoDesc(pageable);
	}
	
}