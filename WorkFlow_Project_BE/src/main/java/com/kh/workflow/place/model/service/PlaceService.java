package com.kh.workflow.place.model.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.place.model.vo.Place;

public interface PlaceService {
	
	List<Place> selectPlaceList();
	
	Place selectPlace(int hubNo);
	
	Place insertPlace(Place p, MultipartFile file);
	
	Place updatePlace(Place p, MultipartFile file);
	
	int deletePlace(int hubNo);

}
