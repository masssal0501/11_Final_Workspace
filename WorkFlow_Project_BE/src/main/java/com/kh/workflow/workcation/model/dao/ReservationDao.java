package com.kh.workflow.workcation.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.workcation.model.vo.Reservation;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

public interface ReservationDao extends JpaRepository<Reservation, Integer>{

	List<Reservation> findByWorkcation(WorkcationInfo workcation);

}
