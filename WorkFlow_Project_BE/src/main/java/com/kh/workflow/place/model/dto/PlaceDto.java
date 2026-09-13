package com.kh.workflow.place.model.dto;

import java.util.List;

import com.kh.workflow.hub.model.vo.HubFile;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PlaceDto {

    private int hubNo;
    private String mainRegion;
    private String subRegion;
    private String hubName;
    private String hubAddress;
    private String phone;
    private String description;
    private int hubType;
    private String hubStatus;

    private List<HubFile> hubFileList;

    // 계산된 평균 평점
    private Double averageRating;
}