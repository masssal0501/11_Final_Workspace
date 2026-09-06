package com.kh.workflow.workcation.model.service;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface WorkcationService {

    Page<Map<String, Object>> selectWorkcationList(
            Map<String, Object> paraMap,
            Pageable pageable
    );

    void insertWorkcationEnrollForm(
            Map<String, Object> paramMap
    );

    void insertWorkcation(
            WorkcationInfo workcartion
    );

    Map<String, Object> getAmountSupportInfo();

    Map<String, Object> getWorkcationDetail(
            Integer workcationNo
    );

    void deleteWorkcation(
            Integer workcationNo
    );

    void updateWorkcation(
            Integer workcationNo,
            Map<String, Object> updateData
    );

    // 내 워케이션 목록
    Page<Map<String, Object>> selectMyWorkcationList(
            Map<String, Object> paramMap,
            Pageable pageable
    );

    // 내 워케이션 상세
    Map<String, Object> getMyWorkcationDetail(
            Integer workcationNo,
            int empNo
    );
}
