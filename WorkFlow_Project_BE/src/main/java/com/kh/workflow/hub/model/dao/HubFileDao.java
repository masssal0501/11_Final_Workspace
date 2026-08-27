package com.kh.workflow.hub.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.hub.model.vo.HubFile;

public interface HubFileDao extends JpaRepository<HubFile, Integer> {

	// 특정 hubNo의 파일 중 fileNos 목록에 '없'는 레코드만 삭제
	void deleteByHubHubNoAndHubfileNoNotIn(int hubNo, List<Integer> fileNos);

	// 특정 hubNo의 파일 전체 삭제 (모두 삭제 시)
    void deleteByHubHubNo(int hubNo);

	List<HubFile> findByHubHubNoOrderByHubfileNoAsc(int hubNo);
}