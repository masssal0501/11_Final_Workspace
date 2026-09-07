import React, { useState } from "react";
import Calendar from "react-calendar"

import { getWorkcationSchedule } from "../api/WorkcationApi";

//달력 기본 스타일
import "react-calendar/dist/Calendar.css";

import "../styles/WorkcationSchedule.css";
import "../styles/CustomCalendar.css"

function WorkcationScheduleComponent({ onClose }) {

    const [mySchedule, setMySchedule] = useState([]);
    const [departmentSchedule, setDepartmentSchedule] = useState([]);

    //선택된 날짜를 저장할 상태
    const [selectedDate, setSelectedDate] = useState(new Date());  

    //날짜 선택시 실행 할 함수
    const handleDateChange = async (newDate) => {

    setSelectedDate(newDate);

    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");

    const date = `${year}-${month}-${day}`;

    try {

        const data = await getWorkcationSchedule(date);

        console.log("워케이션 일정 : ", data);

        const myList = Array.isArray(data?.mySchedule)
            ? data.mySchedule
            : [];

        const deptList = Array.isArray(data?.departmentSchedule)
            ? data.departmentSchedule
            : [];

        setMySchedule(myList);
        setDepartmentSchedule(deptList);

    } catch (error) {

        console.error("워케이션 일정 조회 실패 : ", error);

        setMySchedule([]);
        setDepartmentSchedule([]);
    }
};

    //실행구문

    //return 구문
    return (

        <div
            className="modal-overlay"
            onClick={onClose}>

            {/**모달 내부 */}
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>일정관리</h2>
                </div>

                {/**모달 달력+일정 */}
                <div className="calender-schedule">

                    {/**달력 */}
                    <div className="calender-content">
                        {/**달력 라이브러리 영역 */}
                        <Calendar
                            onChange={handleDateChange}
                            value={selectedDate}
                            calendarType="gregory" />
                    </div>

                    {/**일정 목록 */}
                    <div className="schedule-content">

                        {/**팀/부서 일정 */}
                        <div className="schedule-style">
                            <div className="schedule-header">{/*부서명코드*/}부 일정</div>
                            <div className="schedule-list">
                                {departmentSchedule.length === 0 ? (
                                    <p>등록된 일정이 없습니다.</p>
                                ) : (
                                    departmentSchedule.map((item) => (
                                        <p key={item.workcationNo}>
                                            [{item.jobName}] {item.empName}{" "}
                                            {formatScheduleDate(item.startAt)}
                                            {" ~ "}
                                            {formatScheduleDate(item.endAt)}
                                        </p>
                                    ))
                                )}

                            </div>
                        </div>

                        {/**나의 일정 */}
                        <div className="mySchedule-style">
                            <div className="mySchedule-header">나의 일정</div>
                            <div className="schedule-list">
                                {mySchedule.length === 0 ? (
                                    <p>등록된 일정이 없습니다.</p>
                                ) : (
                                    mySchedule.map((item) => (
                                        <p key={item.workcationNo}>
                                            [{item.jobName}] {item.empName}{" "}
                                            {formatScheduleDate(item.startAt)}
                                            {" ~ "}
                                            {formatScheduleDate(item.endAt)}
                                        </p>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WorkcationScheduleComponent;