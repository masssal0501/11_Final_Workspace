package com.kh.workflow.place.model.service;

import java.util.List;

import com.kh.workflow.hub.model.vo.Hub;

import com.kh.workflow.hub.model.vo.HubFile;

public interface PlaceService {

    List<Hub> selectPlaceList(
            int cpage,
            String type,
            String region,
            String subRegion
    );

    Hub selectPlace(int hubNo);

    Hub insertPlace(Hub h);

    HubFile insertPlaceFile(HubFile hubFieile);

    Hub updatePlace(Hub h);

    int deletePlace(int hubNo);

    HubFile updatePlaceFile(HubFile hubFile);

}