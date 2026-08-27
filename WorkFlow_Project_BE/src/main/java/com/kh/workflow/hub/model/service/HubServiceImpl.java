package com.kh.workflow.hub.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.hub.model.dao.HubDao;
import com.kh.workflow.hub.model.dao.HubFileDao;
import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.hub.model.vo.HubFile;

@Service
public class HubServiceImpl implements HubService {

	@Autowired
	private HubDao hubDao;

	@Autowired
	private HubFileDao hubFileDao;

	public Page<Hub> selectHubList(Pageable pageable) {

		return hubDao.findAllByOrderByHubNoDesc(pageable);
	}

	@Transactional
	@Override
	public Hub insertHub(Hub hub, List<HubFile> fileList) {

		Hub savedHub = hubDao.save(hub);

		if (fileList != null && !fileList.isEmpty()) {
			for (HubFile file : fileList) {
				file.setHub(savedHub);
				hubFileDao.save(file);
			}
		}

		return savedHub;
	}

	@Override
	public Page<Hub> searchHubList(Pageable pageable, String mainRegion, String subRegion, List<Integer> hubTypes,
			String keyword) {

		return hubDao.searchHubList(pageable, mainRegion, subRegion, hubTypes, keyword);
	}

	@Override
	public List<String> selectMainRegion() {

		return hubDao.findDistinctMainRegion();
	}

	@Override
	public List<String> selectSubRegion(String mainRegion) {

		return hubDao.findDistinctSubRegionsByMainRegion(mainRegion);
	}
}