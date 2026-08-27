package com.kh.workflow.hub.model.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.common.template.FileRenamePolicy;
import com.kh.workflow.hub.model.dao.HubDao;
import com.kh.workflow.hub.model.dao.HubFileDao;
import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.hub.model.vo.HubFile;

import jakarta.servlet.http.HttpSession;

@Service
public class HubServiceImpl implements HubService {

	@Autowired
	private HubDao hubDao;

	@Autowired
	private HubFileDao hubFileDao;
	
	public Page<Hub> selectHubList(Pageable pageable, List<Integer> hubTypes) {
		
		return hubDao.findByHubTypeInOrderByHubNoDesc(pageable, hubTypes);
	}

	@Transactional
	@Override
	public Hub insertHub(Hub hub, List<HubFile> fileList) {
		
		Hub insertHub = hubDao.save(hub);
		
		if(fileList != null && !fileList.isEmpty()) {
			for (HubFile file : fileList) {
				file.setHub(insertHub);
				hubFileDao.save(file);
			}
		}
		
		return insertHub;
	}

	@Override
	public Page<Hub> searchHubList(Pageable pageable, String mainRegion, String subRegion, List<Integer> hubTypes,
			String keyword) {
		
		return hubDao.searchHubList(pageable, mainRegion, subRegion, hubTypes, keyword);
	}

	@Override
	public Hub selectHub(int hubNo) {
		
		return hubDao.findById(hubNo).orElse(null);
	}

	@Transactional
	@Override
	public int deleteHub(int hubNo) {
		
		return hubDao.deleteHub(hubNo);
	}

	@Override
	public Double selectAvgScore(int hubNo) {
		
		return hubDao.selectAvgScore(hubNo);
	}

	@Transactional
	@Override
	public Hub updateHub(int hubNo, Hub hubData, List<Integer> fileNos, 
	                       List<MultipartFile> upfiles, List<Integer> upfileIndexes, 
	                       HttpSession session) {
	    
	    // 1. 거점 정보 조회 및 수정
	    Hub hub = hubDao.findById(hubNo)
	            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 거점입니다."));
	    
	    hub.setMaxCapacity(hubData.getMaxCapacity());
	    hub.setHubStatus(hubData.getHubStatus());
	    hub.setHubType(hubData.getHubType());
	    hub.setHubAddress(hubData.getHubAddress());
	    hub.setMainRegion(hubData.getMainRegion());
	    hub.setSubRegion(hubData.getSubRegion());
	    hub.setPhone(hubData.getPhone());
	    hub.setHubName(hubData.getHubName());
	    hub.setDescription(hubData.getDescription());
	    hub.setPrice(hubData.getPrice());

	    // 2. 기존 파일 및 업로드 파일 맵핑
	    Map<Integer, HubFile> existingMap = new HashMap<>();
	    List<HubFile> existingFiles = hubFileDao.findByHubHubNoOrderByHubfileNoAsc(hubNo);
	    for (int i = 0; i < existingFiles.size(); i++) existingMap.put(i, existingFiles.get(i));

	    Map<Integer, MultipartFile> uploadMap = new HashMap<>();
	    if (upfiles != null && upfileIndexes != null) {
	        for (int i = 0; i < upfiles.size(); i++) {
	            if (!upfiles.get(i).isEmpty()) uploadMap.put(upfileIndexes.get(i), upfiles.get(i));
	        }
	    }

	    Set<Integer> keptNos = fileNos != null ? new HashSet<>(fileNos) : new HashSet<>();
	    hubFileDao.deleteAll(existingFiles); // 기존 파일 싹 비우고 슬롯 순서대로 재저장

	    // 3. 슬롯 0~2번 순회 처리
	    for (int i = 0; i <= 2; i++) {
	        MultipartFile file = uploadMap.get(i);
	        
	        if (file != null) {
	            String changeName = FileRenamePolicy.saveFile(file, session, "/resources/upload/hub/");
	            hubFileDao.save(HubFile.builder().hub(hub).filePath("/resources/upload/hub")
	                    .originName(file.getOriginalFilename()).changeName(changeName).build());
	        } else if (existingMap.containsKey(i) && keptNos.contains(existingMap.get(i).getHubfileNo())) {
	            HubFile old = existingMap.get(i);
	            hubFileDao.save(HubFile.builder().hub(hub).filePath(old.getFilePath()) // 엔티티 필드 직접 접근 또는 get 사용
	                    .originName(old.getOriginName()).changeName(old.getChangeName()).build());
	        }
	    }

	    return hub;
	}
}