import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import "../styles/WorkcationDetail.css";

function WorkcationDetailComponent() {

    //실행구문

    //return  구문
    return (
        <div className="insert-area">
            <h2>워케이션 신청</h2>
            <form action="">
                <div className="insert-btn">
                    <button type="button">
                        신청
                    </button>
                </div>
                <table className="workcation-insert" style={{ tableLayout: "fixed" }}>
                    <thead>
                        <tr>
                            <th style={{ width: "120px" }}>신청기간</th>
                            <td style={{ width: "px" }}>1</td>
                            <th style={{ width: "120px" }}>신청인원</th>
                            <td>
                                <textarea></textarea>
                            </td>
                        </tr>
                        <tr>
                            <th>근무 목적</th>
                            <td>1</td>
                            <th>지역</th>
                            <td>
                                <select className="">                                    
                                    <option value=""></option>
                                </select>
                                <select className="">
                                    <option value=""></option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>숙소</th>
                            <td colSpan={2}>
                                <select className="">
                                    <option value=""></option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>오피스</th>
                            <td colSpan={2}>
                                 <select className="">
                                    <option value=""></option>
                                </select>
                            </td>
                        </tr>
                    </thead>
                    <tbody>

                    </tbody>
                </table>
            </form>
        </div>
    )
}

export default WorkcationDetailComponent;