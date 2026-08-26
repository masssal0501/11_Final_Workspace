package com.kh.workflow.place.model.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.kh.workflow.place.model.vo.Place;


public interface PlaceService {
	
	List<Place> selectPlaceList();
	
	Place selectPlace(int hubNo);
	
	Place insertPlace(Place p);
	
	Place updatePlace(Place p);
	
	int deletePlace(int hubNo);

}
