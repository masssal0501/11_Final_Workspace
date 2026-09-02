package com.kh.workflow.reservation.model.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReservationUpdateRequest {

    private LocalDateTime rsvStart;

    private LocalDateTime rsvEnd;

    private Integer userCapacity;
}