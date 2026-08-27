package com.kh.workflow.place.model.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.place.model.vo.Place;

public interface PlaceService {
	
	List<Hub> selectPlaceList(int cpage, String type, String region, String subRegion);
	
	Hub selectPlace(int hubNo);
	
	Hub insertPlace(Hub h, MultipartFile file);
	
	Hub updatePlace(Hub h, MultipartFile file);
	
	int deletePlace(int hubNo);

}
