package com.kh.workflow.hub.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.hub.model.vo.HubFile;

/**
 * 워케이션 거점 첨부파일(HubFile) 데이터 접근을 위한 Spring Data JPA Repository 인터페이스
 */
public interface HubFileDao extends JpaRepository<HubFile, Integer> {

	/**
     * 특정 거점(hubNo)에 속한 첨부파일 목록을 첨부파일 번호 오름차순으로 조회
     * 
     * @param hubNo 거점 식별 번호
     * @return 해당 거점의 첨부파일 엔티티 목록
     */
	List<HubFile> findByHubHubNoOrderByHubfileNoAsc(int hubNo);
}