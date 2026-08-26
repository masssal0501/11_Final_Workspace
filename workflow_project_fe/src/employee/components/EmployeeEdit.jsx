import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function EmployeeEdit() {

    return(
        <div className="enrollForm">
            <h2>직원 정보 수정</h2>

            <form>

                <table>
                    <tbody>
                        <tr>
                            <th>아이디</th>
                            <td>
                                <div className="idInputGroup">
                                    <input type="text" name="empId" disabled/>
                                </div>
                            </td>
                            <th>입사일</th>
                            <td></td>
                        </tr>
                        <tr>
                            <th>이름</th>
                            <td><input type="text" name="empName"/></td>
                            <th>직책</th>
                            <td>
                                <select name="authCode" >
                                    <option value="" disabled hidden selected>선택</option>
                                    <option value="STAFF">평사원</option>
                                    <option value="MANAGER">부서장</option>
                                    <option value="ADMIN">관리자</option>
                                </select>
                            </td>
                            
                        </tr>
                        <tr>
                            <th>연락처</th>
                            <td>
                                <input
                                    type="tel"
                                    className="tel"
                                    name="phone1"
                                    maxLength={3}
                                />&nbsp;-&nbsp;
                                <input
                                    type="tel"
                                    className="tel"
                                    name="phone2"
                                    maxLength={4}
                                />&nbsp;-&nbsp;
                                <input
                                    type="tel"
                                    className="tel"
                                    name="phone3"
                                    maxLength={4}
                                />
                            </td>
                            <th>부서</th>
                            <td>
                                <select name="depId">
                                    <option value="" disabled hidden selected>선택</option>
                                    <option value="D1">기획</option>
                                    <option value="D2">디자인</option>
                                    <option value="D3">FE 개발</option>
                                    <option value="D4">BE 개발</option>
                                    <option value="D5">데이터</option>
                                    <option value="D6">QA</option>
                                </select>
                            </td>
                            
                        </tr>
                        <tr>
                            <th>이메일</th>
                            <td>
                                <input type="email" name="email"/>
                            </td>
                            <th>직위</th>
                            <td>
                                <select name="jobCode" id="jobCode">
                                    <option value="" disabled hidden selected>선택</option>
                                    <option value="J1">사원</option>
                                    <option value="J2">대리</option>
                                    <option value="J3">과장</option>
                                    <option value="J4">차장</option>
                                    <option value="J5">부장</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>주소</th>
                            <td colSpan={3}>
                                <input type="text" name="address" />
                            </td>
                        </tr>
                        <tr>
                            <th>상태</th>
                            <td colSpan={3}>
                                <input type="radio" id="active" name="status" value="apple"/>
                                <label htmlFor="active">재직</label>

                                <input type="radio" id="inactive" name="status" value="banana"/>
                                <label htmlFor="inactive">퇴사</label>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button type="button">돌아가기</button>
                <button type="submit">
                    확인
                </button>

            </form>

            
        </div>   
    )
}

export default EmployeeEdit;