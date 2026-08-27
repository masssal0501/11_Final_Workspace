package com.kh.workflow.hub.model.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.hub.model.vo.HubFile;

import jakarta.servlet.http.HttpSession;

public interface HubService {

	Page<Hub> selectHubList(Pageable pageable, List<Integer> hubTypes);

	Hub insertHub(Hub hub, List<HubFile> fileList);

	Page<Hub> searchHubList(Pageable pageable, String mainRegion, String subRegion, List<Integer> hubTypes, String keyword);

	Hub selectHub(int hubNo);

	int deleteHub(int hubNo);

	Double selectAvgScore(int hubNo);

	Hub updateHub(int hubNo, Hub hubData, List<Integer> fileNos, List<MultipartFile> upfiles,
			List<Integer> upfileIndexes, HttpSession session);
	
}
