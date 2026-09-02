package com.kh.workflow.workcation.model.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.workcation.model.vo.Reservation;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface ReservationDao extends JpaRepository<Reservation, Integer>{

	Reservation findByWorkcation(WorkcationInfo workcation);

}
