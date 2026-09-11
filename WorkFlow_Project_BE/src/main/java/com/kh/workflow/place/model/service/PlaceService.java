package com.kh.workflow.place.model.service;

import java.util.List;

import com.kh.workflow.common.model.vo.PageInfo;
import com.kh.workflow.hub.model.vo.Hub;
import com.kh.workflow.hub.model.vo.HubFile;
import com.kh.workflow.place.model.dto.PlaceDto;

public interface PlaceService {

    List<Hub> selectPlaceList(
            int cpage,
            String keyword,
            String type,
            String region,
            String subRegion
    );

    PageInfo getPlacePageInfo(
            int cpage,
            String keyword,
            String type,
            String region,
            String subRegion
    );

    // 상세조회는 장소 정보 + 평균 평점을 DTO로 반환
    PlaceDto selectPlace(int hubNo);

    Hub insertPlace(Hub h);

    HubFile insertPlaceFile(HubFile hubFile);

    Hub updatePlace(Hub h);

    int deletePlace(int hubNo);

    HubFile updatePlaceFile(HubFile hubFile);
}