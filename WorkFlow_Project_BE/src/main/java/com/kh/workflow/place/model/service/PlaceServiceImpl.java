package com.kh.workflow.place.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
    @Override
    public List<Hub> selectPlaceList(
            int cpage,
            String type,
            String region,
            String subRegion) {

        Integer searchType =
                (type == null || type.isBlank())
                ? null
                : Integer.parseInt(type);

        String searchRegion =
                (region == null || region.isBlank())
                ? null
                : region;

        String searchSubRegion =
                (subRegion == null || subRegion.isBlank())
                ? null
                : subRegion;

        return placeDao.selectFilteredPlaceList(
                searchType,
                searchRegion,
                searchSubRegion
        );
    }

    @Transactional(readOnly = true)
    @Override
    public Hub selectPlace(int hubNo) {
        return placeDao.findByHubNo(hubNo);
    }

    @Transactional
    @Override
    public Hub insertPlace(Hub h) {
        return placeDao.save(h);
    }
    
    @Transactional
    @Override
    public HubFile insertPlaceFile(HubFile hubFile) {
        return hubFileDao.save(hubFile);
    }

    @Transactional
    @Override
    public Hub updatePlace(Hub h) {
        return placeDao.save(h);
    }

    @Transactional
    @Override
    public int deletePlace(int hubNo) {
        return placeDao.deletePlace(hubNo);
    }

	@Override
	public HubFile updatePlaceFile(HubFile hubFile) {
		return hubFileDao.save(hubFile);
	}

}
