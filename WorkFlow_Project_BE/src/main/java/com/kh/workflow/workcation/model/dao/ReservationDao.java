package com.kh.workflow.workcation.model.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kh.workflow.workcation.model.vo.Reservation;

public interface ReservationDao extends JpaRepository<Reservation, Integer>{

}
