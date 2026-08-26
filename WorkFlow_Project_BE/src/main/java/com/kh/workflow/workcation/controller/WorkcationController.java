package com.kh.workflow.workcation.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.workflow.workcation.model.service.WorkcationService;

@CrossOrigin
@RestController
@RequestMapping("/workcation")
public class WorkcationController {
	
	@Autowired
	private WorkcationService workcationService;
	
	
	

}
