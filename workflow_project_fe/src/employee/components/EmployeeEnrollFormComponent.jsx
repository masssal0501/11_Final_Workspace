import "../styles/EmployeeEnrollFormComponent.css";

function EmployeeEnrollFormComponent() {
    // 숫자만 입력되도록 제한하는 함수
    const handleNumberOnly = (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    };

    return(
        <div className="enrollForm">
            <h2>직원 등록</h2>

            <table>
                <tbody>
                    <tr>
                        <th>아이디</th>
                        <td>
                            <div className="idInputGroup">
                                <input type="text" />
                                <button type="button">중복확인</button>
                            </div>
                        </td>
                        <th>직책</th>
                        <td>
                            <select name="role" id="role">
                                <option value="staff">평사원</option>
                                <option value="manager">부서장</option>
                                <option value="admin">관리자</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th>이름</th>
                        <td><input type="text" name="name" id="name" /></td>
                        <th>부서</th>
                        <td>
                            <select name="department" id="department">
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
                        <th>연락처</th>
                        <td>
                            <input
                                type="tel"
                                className="tel"
                                maxLength={3}
                                onInput={handleNumberOnly}
                            />&nbsp;-&nbsp;
                            <input
                                type="tel"
                                className="tel"
                                maxLength={4}
                                onInput={handleNumberOnly}
                            />&nbsp;-&nbsp;
                            <input
                                type="tel"
                                className="tel"
                                maxLength={4}
                                onInput={handleNumberOnly}
                            />
                        </td>
                        <th>직위</th>
                        <td>
                            <select name="job" id="job">
                                <option value="J1">사원</option>
                                <option value="J2">대리</option>
                                <option value="J3">과장</option>
                                <option value="J4">차장</option>
                                <option value="J5">부장</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th>이메일</th>
                        <td colSpan={3}>
                            <input type="email" name="email" id="email" />
                        </td>
                    </tr>
                    <tr>
                        <th>주소</th>
                        <td colSpan={3}>
                            <input type="text" name="address" id="address" />
                        </td>
                    </tr>
                </tbody>
            </table>
            <button type="button">돌아가기</button>
            <button type="submit">계정 생성</button>
        </div>   
    );
}

export default EmployeeEnrollFormComponent;