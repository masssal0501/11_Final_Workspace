import React, { useState } from "react";
import Calendar from "react-calendar"

//달력 기본 스타일
import "react-calendar/dist/Calendar.css";

import "../styles/WorkcationSchedule.css";
import "../styles/CustomCalendar.css"

function WorkcationScheduleComponent({ onClose }) {

    //선택된 날짜를 저장할 상태
    const [selectedDate, setSelectedDate] = useState(new Date());

    //날짜 선택시 실행 할 함수
    const handleDateChange = (newDate) =>{
        setSelectedDate(newDate);
        console.log("선택한 날짜: ", newDate);
    }

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
                        calendarType="gregory"/>
                    </div>

                    {/**일정 목록 */}
                    <div className="schedule-content">
                        {/**팀/부서 일정 */}
                        <div className="schedule-style">
                            <div className="schedule-header">{/*부서명코드*/}부 일정</div>
                            <div className="schedule-list">
                                <p>[직급] 이름 일정 {selectedDate.toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/**나의 일정 */}
                        <div className="mySchedule-style">
                            <div className="mySchedule-header">나의 일정</div>
                            <div className="mySchedule-list">
                             <p>[직급] 이름 일정 0000-00-00</p>
                             </div>
                        </div>                 
                    </div>
                </div>
            </div>          
        </div>
    )
}

export default WorkcationScheduleComponent;