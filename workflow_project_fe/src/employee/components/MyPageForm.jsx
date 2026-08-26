import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function MyPageForm() {

    return(
        <div className="enrollForm">
            <h2>마이 페이지</h2>

            <form>

                <table>
                    <tbody>
                        <tr>
                            <th>아이디</th>
                            <td>
                                <div className="idInputGroup">
                                    <input type="text" name="empId"/>
                                </div>
                            </td>
                            <th>입사일</th>
                            <td>2026-08-08</td>
                        </tr>
                        <tr>
                            <th>이름</th>
                            <td><input type="text" name="empName"/></td>
                            <th>직책</th>
                            <td>

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

                            </td>
                            
                        </tr>
                        <tr>
                            <th>이메일</th>
                            <td>
                                <input type="email" name="email"/>
                            </td>
                            <th>직위</th>
                            <td>

                            </td>
                        </tr>
                        <tr>
                            <th>주소</th>
                            <td colSpan={3}>
                                <input type="text" name="address" />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button type="button">돌아가기</button>
                <button type="button" className="btnPrimary">
                    <Link to="update">정보 수정</Link>    
                </button>

            </form>

            
        </div>   
    )
}

export default MyPageForm;