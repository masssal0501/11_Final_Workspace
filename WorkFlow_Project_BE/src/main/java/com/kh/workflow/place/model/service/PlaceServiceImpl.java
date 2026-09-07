package com.kh.workflow.place.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.common.model.vo.PageInfo;
import com.kh.workflow.common.template.Pagination;
import com.kh.workflow.hub.model.dao.HubFileDao;
import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.hub.model.vo.HubFile;

import com.kh.workflow.place.model.dao.PlaceDao;

@Service
public class PlaceServiceImpl implements PlaceService {

    @Autowired
    private PlaceDao placeDao;

    @Autowired
    private HubFileDao hubFileDao;


    // =========================================================
    // 장소 목록 조회
    // - keyword, type, region, subRegion 조건으로 검색
    // - 한 페이지에 10개의 장소 조회
    // =========================================================
    @Transactional(readOnly = true)
    @Override
    public List<Hub> selectPlaceList(
            int cpage,
            String keyword,
            String type,
            String region,
            String subRegion) {

        // 검색어가 없으면 null 처리
        String searchKeyword =
                (keyword == null || keyword.isBlank())
                ? null
                : keyword;

        // 장소 유형이 없으면 null 처리
        Integer searchType =
                (type == null || type.isBlank())
                ? null
                : Integer.parseInt(type);

        // 지역이 없으면 null 처리
        String searchRegion =
                (region == null || region.isBlank())
                ? null
                : region;

        // 세부 지역이 없으면 null 처리
        String searchSubRegion =
                (subRegion == null || subRegion.isBlank())
                ? null
                : subRegion;


        // 한 페이지에 10개
        // PageInfo와 동일하게 사용
        Pageable pageable =
                PageRequest.of(cpage - 1, 10);


        return placeDao.selectFilteredPlaceList(
                searchKeyword,
                searchType,
                searchRegion,
                searchSubRegion,
                pageable
        );
    }


    // =========================================================
    // 장소 페이지 정보
    // - 검색 조건에 맞는 전체 장소 개수 조회
    // - 검색 결과에 맞춰 페이지 수 계산
    // =========================================================
    @Transactional(readOnly = true)
    @Override
    public PageInfo getPlacePageInfo(
            int cpage,
            String keyword,
            String type,
            String region,
            String subRegion) {

        // 검색어가 없으면 null 처리
        String searchKeyword =
                (keyword == null || keyword.isBlank())
                ? null
                : keyword;

        // 장소 유형이 없으면 null 처리
        Integer searchType =
                (type == null || type.isBlank())
                ? null
                : Integer.parseInt(type);

        // 지역이 없으면 null 처리
        String searchRegion =
                (region == null || region.isBlank())
                ? null
                : region;

        // 세부 지역이 없으면 null 처리
        String searchSubRegion =
                (subRegion == null || subRegion.isBlank())
                ? null
                : subRegion;


        // 검색 조건에 맞는 전체 장소 개수
        int listCount =
                placeDao.selectPlaceCount(
                        searchKeyword,
                        searchType,
                        searchRegion,
                        searchSubRegion
                );


        // 페이지 버튼 5개
        // 한 페이지 게시글 10개
        return Pagination.getPageInfo(
                listCount,
                cpage,
                5,
                10
        );
    }


    // =========================================================
    // 특정 장소 조회
    // =========================================================
    @Transactional(readOnly = true)
    @Override
    public Hub selectPlace(int hubNo) {

        return placeDao.findByHubNo(hubNo);
    }


    // =========================================================
    // 장소 등록
    // =========================================================
    @Transactional
    @Override
    public Hub insertPlace(Hub h) {

        return placeDao.save(h);
    }


    // =========================================================
    // 장소 파일 등록
    // =========================================================
    @Transactional
    @Override
    public HubFile insertPlaceFile(HubFile hubFile) {

        return hubFileDao.save(hubFile);
    }


    // =========================================================
    // 장소 수정
    // =========================================================
    @Transactional
    @Override
    public Hub updatePlace(Hub h) {

        return placeDao.save(h);
    }


    // =========================================================
    // 장소 종료
    // =========================================================
    @Transactional
    @Override
    public int deletePlace(int hubNo) {

        return placeDao.deletePlace(hubNo);
    }


    // =========================================================
    // 장소 파일 수정
    // - 기존 파일을 N 처리
    // - 새 파일을 Y 상태로 저장
    // =========================================================
    @Transactional
    @Override
    public HubFile updatePlaceFile(HubFile hubFile) {

        int hubNo =
                hubFile.getHub().getHubNo();

        HubFile existingFile =
                hubFileDao.findFirstByHub_HubNoAndStatusOrderByHubfileNoDesc(
                        hubNo,
                        "Y"
                );

        if (existingFile != null) {

            existingFile.setStatus("N");

            hubFileDao.save(existingFile);
        }

        hubFile.setStatus("Y");

        return hubFileDao.save(hubFile);
    }
}