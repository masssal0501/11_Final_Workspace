package com.kh.workflow.place.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.place.model.dao.PlaceDao;
import com.kh.workflow.place.model.vo.Place;

@Service
public class PlaceServiceImpl implements PlaceService {

    @Autowired
    private PlaceDao placeDao;
    
    @Autowired
    private HubFileDao hubFileDao;

    @Transactional(readOnly = true)
    @Override
    public List<Place> selectPlaceList() {
        return placeDao.findByHubStatusOrderByHubNoDesc("OPEN");
    }

    @Transactional(readOnly = true)
    @Override
    public Place selectPlace(int hubNo) {
        return placeDao.findByHubNoAndHubStatus(hubNo, "OPEN");
    }

    @Transactional
    @Override
    public Place insertPlace(Place p, MultipartFile file) {

        // 장소 정보 저장
        Place savedPlace = placeDao.save(p);

        // 사진이 있으면 파일 저장
        if (file != null && !file.isEmpty()) {

            HubFile hubFile = new HubFile();

            // 파일 저장 처리
            // filePath
            // originName
            // changeName
            // hub 연결

            hubFile.setHub(savedPlace);

            hubFileDao.save(hubFile);
        }

        return savedPlace;
    }
    @Transactional
    @Override
    public Place updatePlace(Place p, MultipartFile file) {

        Place savedPlace = placeDao.save(p);

        if (file != null && !file.isEmpty()) {

            HubFile hubFile = new HubFile();

            // 새 파일 저장 처리

            hubFile.setHub(savedPlace);

            hubFileDao.save(hubFile);
        }

        return savedPlace;
    }

    @Transactional
    @Override
    public int deletePlace(int hubNo) {
        return placeDao.deletePlace(hubNo);
    }

}