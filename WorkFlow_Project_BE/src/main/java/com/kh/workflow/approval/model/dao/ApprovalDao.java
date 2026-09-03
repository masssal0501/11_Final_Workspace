package com.kh.workflow.approval.model.dao;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface ApprovalDao {

	Page<WorkcationInfo> findAll(Pageable pageable);

	WorkcationInfo findByWorkcationNo(int workcationNo);

}
