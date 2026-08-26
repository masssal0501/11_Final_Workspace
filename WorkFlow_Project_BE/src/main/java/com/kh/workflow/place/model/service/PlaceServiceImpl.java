package com.kh.workflow.place.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.place.model.dao.PlaceDao;
import com.kh.workflow.place.model.vo.Place;

@Service
public class PlaceServiceImpl implements PlaceService {

	@Autowired
	private PlaceDao placeDao;
	
	/*@Transactional(readOnly=true)
	@Override
	public List<Place> selectPlaceList() {
		return placeDao.findByStatusOrderByHubNoDesc("Y");
	}

	@Transactional(readOnly=true)
	@Override
	public Place selectPlace(int hubNo) {
		return placeDao.findByHubNoAndStatus(hubNo, "Y");
	}*/

	@Transactional
	@Override
	public Place insertPlace(Place p) {
		return placeDao.save(p);
	}

	@Transactional
	@Override
	public Place updatePlace(Place p) {
		return placeDao.save(p);
	}
/*
	@Transactional
	@Override
	public int deletePlace(int hubNo) {
		return placeDao.deletePlace(hubNo);
	}*/

	@Override
	public List<Place> selectPlaceList() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Place selectPlace(int hubNo) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public int deletePlace(int hubNo) {
		// TODO Auto-generated method stub
		return 0;
	}

}
