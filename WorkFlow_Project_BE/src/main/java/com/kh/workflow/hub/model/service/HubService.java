package com.kh.workflow.hub.model.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.hub.model.vo.HubFile;

import jakarta.servlet.http.HttpSession;

/**
 * 거점(Hub) 관련 비즈니스 로직을 처리하는 서비스 인터페이스
 */
public interface HubService {

	/**
     * 거점 목록 조회 (페이징 및 유형 필터링)
     * 
     * @param pageable 페이징 정보 (페이지 번호, 데이터 수 등)
     * @param hubTypes 조회할 거점 시설 유형 목록 (예: 1=숙소, 2=공유오피스)
     * @return 페이징 처리된 거점 목록
     */
	Page<Hub> selectHubList(Pageable pageable, List<Integer> hubTypes);

	/**
     * 신규 거점 등록
     * 
     * @param hub 등록할 거점의 기본 정보
     * @param fileList 업로드 처리 후 생성된 거점 첨부파일 정보 목록
     * @return 등록 완료된 거점 객체 (실패 시 null)
     */
	Hub insertHub(Hub hub, List<HubFile> fileList);

	/**
     * 거점 검색 조회 (다중 조건 및 페이징)
     * 
     * @param pageable 페이징 정보
     * @param mainRegion 시/도 단위 메인 지역명 (예: "제주", "강원" / 없을 경우 null)
     * @param subRegion 시/군/구 단위 상세 지역명 (없을 경우 null)
     * @param hubTypes 검색할 거점 시설 유형 목록
     * @param keyword 검색어 (거점명 또는 설명 등에 포함된 키워드)
     * @return 검색 조건이 적용된 페이징 처리된 거점 목록
     */
	Page<Hub> searchHubList(Pageable pageable, String mainRegion, String subRegion, List<Integer> hubTypes, String keyword);

	/**
     * 특정 거점 상세 정보 조회
     * 
     * @param hubNo 상세 조회할 거점의 식별 번호
     * @return 조회된 거점 정보 객체
     */
	Hub selectHub(int hubNo);

	/**
     * 거점 운영 중단 (삭제 처리)
     * 
     * @param hubNo 운영 상태를 중단(CLOSED)으로 변경할 거점 번호
     * @return DB 업데이트 성공 행의 개수 (1 이상이면 성공, 0이면 실패)
     */
	int deleteHub(int hubNo);

	/**
     * 특정 거점의 평균 평점 조회
     * 
     * @param hubNo 평균 평점을 조회할 거점 번호
     * @return 해당 거점의 평균 평점 (리뷰가 없을 경우 null 또는 0.0)
     */
	Double selectAvgScore(int hubNo);

	List<String> selectMainRegion();

	List<String> selectSubRegion(String mainRegion);
	/**
     * 거점 정보 및 첨부파일 수정
     * 
     * @param hubNo 수정할 거점의 식별 번호
     * @param hubData 폼으로부터 전달받은 수정할 거점 기본 정보
     * @param fileNos 유지하거나 수정 대상인 기존 첨부파일 번호 목록
     * @param upfiles 새롭게 추가/수정 업로드된 첨부파일 목록
     * @param upfileIndexes 새로 업로드된 파일들이 매핑될 인덱스 순서 목록
     * @param session 파일 저장을 위한 실제 서버 경로를 얻어오기 위해 사용하는 세션 객체
     * @return 수정이 완료된 거점 객체 (실패 시 null)
     */
	Hub updateHub(int hubNo, Hub hubData, List<Integer> fileNos, List<MultipartFile> upfiles,
			List<Integer> upfileIndexes, HttpSession session);

	/**
     * 거점 목록 조회 (AI 전용)
     * @return 거점& 여행/지역정보 목록
     */
	List<Hub> selectAIHubList();
	
}
