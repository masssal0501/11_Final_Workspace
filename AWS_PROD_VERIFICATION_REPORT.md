# WorkFlow ERP — AWS 운영 서버 종합 검증 보고서

- 작성일: 2026-09-10
- 대상 서버: **http://3.87.158.173** (AWS EC2, Nginx + Spring Boot 8006 + RDS MySQL)
- 기준 커밋: `6743fc9`(main, 이번 세션 시작 시점의 배포 반영 커밋), 배포 워크플로우 run `34411532625` SUCCESS
- 검증 브랜치: `docs/step1-6-project-audit` (로컬 커밋만 수행, Deploy 브랜치 push 없음)
- 검증 방식: HTTP API 직접 호출(curl, 실제 JWT 발급받아 사용) + 브라우저 자동화(Claude Browser)로 실제 화면 조작
- **한계**: 이 세션은 EC2에 SSH로 직접 접속할 수 없다. Nginx/Backend 프로세스 상태, 디스크 상의 실제 업로드 파일 존재 여부는 HTTP 응답을 통해서만 간접 확인했다. RDS에도 직접 접속하지 않았고, 모든 DB 반영 여부는 API 응답(GET 재조회)을 통해서만 간접 검증했다.

---

## 1. 현재 AWS 서버 상태

| 항목 | 상태 | 근거 |
|---|---|---|
| Nginx (80포트, React 정적 파일 서빙) | 🟢 정상 | `http://3.87.158.173/` 접속 시 React 앱 정상 로드 확인 |
| Nginx `/workflow/**` → Spring Boot 프록시 | 🟢 정상 | `curl http://3.87.158.173/workflow/employees/login` 정상 응답 |
| Nginx SPA fallback (새로고침/직접 URL) | 🟢 정상 | `/admin/invalid`, `/employee/invalid`, 임의 경로 모두 HTTP 200 + index.html 반환 확인(curl) |
| Backend(Spring Boot, 8006, context-path `/workflow`) | 🟢 정상 | 로그인/CRUD API 다수 정상 응답 |
| RDS MySQL 연결 | 🟢 정상(간접) | 로그인, 목록 조회, 신규 데이터 생성 후 재조회 모두 일치 |
| Swagger UI / OpenAPI | 🟢 정상 | `http://3.87.158.173/workflow/swagger-ui/index.html` 접속 확인(이전 세션 확인 사항, 이번 세션 재확인 안 함 — 시간 관계상 URL 재접속만 생략, 배포 자체가 이 커밋 기준이라 유효하다고 판단) |

---

## 2. Frontend 상태

- React 19 / Vite / React Router / Axios 구조 확인. 인증 상태는 Zustand가 아니라 `localStorage`(accessToken, user) + React state로 관리됨(코드베이스 사실과 일치, 실제로 `Object.keys(localStorage)` 확인 결과 `accessToken`, `user` 두 키만 존재).
- 권한별 메뉴 노출(`Header.jsx`)을 실제 로그인 계정으로 확인:
  - STAFF(staff01) 로그인 시 "직원 관리", "승인 관리" 메뉴 자체가 보이지 않음 — 🟢 정상
  - MANAGER(manager01) 로그인 시 "승인 관리"는 보이나 "직원 관리"는 안 보임 — 🟢 정상
  - ADMIN 로그인 시 전체 메뉴 노출 — 🟢 정상
- 권한별 라우트 가드(`App.jsx`): ADMIN 전용 라우트(`/employee/*`, `/admin/statistics` 등)가 `loginUser.authCode === "ADMIN"` 조건부로만 등록되고, catch-all(`<Route path="*" element={<ErrorPage/>}/>`)이 있어 STAFF/MANAGER가 URL을 직접 입력해도 빈 화면이 아니라 에러 페이지로 이동 — 🟢 정상 (실제 브라우저로 staff01 로그인 후 `/employee/list` 직접 접근하여 확인)
- 빌드 상태: 이번 세션에서는 재빌드하지 않음(프런트엔드 코드 변경 없음, 이전 세션 13차/16차에서 `npm run build` PASS 확인된 것을 근거로 인용 — 🔵 이번 세션 직접 실행은 아님).

---

## 3. Backend 상태

- Spring Boot 4.1.0 / Java 21, MVC 컨트롤러 12개(Employee/Hub/Place/Reservation/Approval/Workcation/Amount/Notice/Survey/Attendance/Dashboard/AI) 확인.
- MyBatis 잔존 없음(이전 세션에 JPA로 전환 완료된 것 재확인 — `mvnw.cmd -o compile` 정상 BUILD SUCCESS).
- **이번 세션에 발견한 구조적 문제**: 프로젝트 전체에 `@ControllerAdvice`/`@RestControllerAdvice` 기반 전역 예외 처리기가 단 하나도 없었다. Service 계층은 "대상 없음"과 "잘못된 입력값"을 구분하지 않고 전부 `IllegalArgumentException`으로 던지는데(113곳), 이를 받아 처리하는 곳이 없어 전부 HTTP 500으로 떨어지고 있었다. → **BUG-001로 기록, 이번 세션에 수정함**(4절 이후 상세).
- `mvnw.cmd -o compile -DskipTests` 로컬 오프라인 빌드 — 이번 세션에서 수정한 6개 파일 포함하여 **BUILD SUCCESS** 확인.

---

## 4. Database 상태 (간접 검증)

- employee/department/authorization/workcation_info/approval/work(task)/hub/reservation/amount/settlement(support)/notice 테이블 존재 및 데이터 정상 확인(API 응답 기준).
- 실제 신규 데이터 생성 → 재조회 일치 확인(모두 이번 세션에 직접 수행):
  - `workcation_info`: 신규 워케이션 신청(workcationNo=8) INSERT → 승인(UPDATE approverState W→A) → 재조회 일치
  - `work`(task): 업무계획 INSERT(taskNo=7) → 진행률/상태 UPDATE(0%→100%, N→Y) → 재조회 일치
  - `attendance`: 출근(IN)/퇴근(OUT) INSERT(attendanceNo=15,16) → 재조회 일치
  - `amount`/`amount_file`: 비용 신청 + 증빙파일 INSERT(amountNo=6) → 결재 상태 UPDATE(R→A) → 재조회 일치
  - `support`(지원금): INSERT(supportNo=2, PAID) → 재조회 일치
- **DB 직접 접속(RDS)은 하지 않았음** — 위 모든 확인은 API 응답의 재조회로만 검증한 간접 검증임을 명시.

---

## 5. Nginx 상태

- 정적 파일 서빙, `/workflow/**` 프록시, SPA fallback 모두 정상(1절 표 참고).
- 실행 여부/설정 파일 자체는 SSH 불가로 직접 확인 못 함 — HTTP 응답으로만 간접 추정.

---

## 6. 인증/JWT 상태

| 시나리오 | 결과 | 근거 |
|---|---|---|
| 정상 로그인 → JWT 발급 | 🟢 PASS | admin/staff01/manager01 전원 로그인 성공, accessToken 수령 |
| 정상 JWT로 API 호출 | 🟢 PASS | 다수 API 정상 응답 |
| 토큰 없이 보호된 API 호출 | 🟢 PASS(401) | `GET /employees` → 401 `{"status":401,...}` |
| 위조/무효 토큰으로 API 호출 | 🟢 PASS(401) | `Authorization: Bearer garbage.invalid.token` → 401 |
| 권한은 있으나 role 부족(403) | 🟢 PASS(403) | STAFF 토큰으로 `POST /hubs` → 403 `{"status":403,"error":"Forbidden",...}` (이번 세션에 신규 재현 완료 — 배경 정보의 미확인 항목이었음) |
| 로그아웃 → localStorage 초기화 → 로그인 페이지 이동 | 🟢 PASS | 브라우저로 실제 로그아웃 클릭 → `accessToken`/`user` 키 삭제, `/login` 화면 확인 |
| 만료/무효 JWT로 API 요청 → 401 → Axios interceptor → localStorage 초기화 → 로그인 페이지 이동 | 🟢 PASS | 브라우저에서 `localStorage.accessToken`을 `invalid.expired.token`으로 강제 변경 후 보호된 페이지(`/approval/queue/list`) 접근 → 자동으로 로그인 페이지로 이동, `Object.keys(localStorage)` 결과 `[]`(완전 초기화) 확인 |

---

## 7. 권한 상태

### 7-1. 정상 동작 확인(직접 API 호출로 검증)

| 시도 | 기대 결과 | 실제 결과 |
|---|---|---|
| STAFF 토큰 → `POST /hubs`(거점 등록, ADMIN 전용) | 403 | 🟢 403 |
| MANAGER 토큰 → `PATCH /employees/2/role`(권한 변경, ADMIN 전용) | 403 | 🟢 403 |
| MANAGER 토큰 → `POST /employees`(직원 등록, ADMIN 전용) | 403 | 🟢 403 |
| MANAGER 토큰 → `DELETE /hubs/1`(거점 삭제, ADMIN 전용) | 403 | 🟢 403 |
| STAFF 브라우저 직접 URL → `/employee/list` | 접근 차단 | 🟢 ErrorPage로 이동(빈 화면 아님) |
| STAFF 브라우저 직접 URL → `/approval/queue/list` | 접근 차단 | 🟢 ErrorPage로 이동 |
| 익명(비로그인) → `POST /api/v1/notice`(공지 등록) | 차단 | 🟢 컨트롤러 내부 수동 인증 체크로 401 "로그인이 필요합니다." (SecurityConfig에는 `permitAll`로 되어 있어 URL 레벨 설정만 보면 위험해 보였으나, 실제 호출로 검증한 결과 컨트롤러 코드가 이중으로 막고 있어 실사용상 안전함을 확인 — "코드만 보고 판단 금지, 실제 호출로 검증"의 사례) |
| STAFF 토큰 → `POST /api/v1/notice` | 차단 | 🟢 403 "관리자만 공지사항을 등록할 수 있습니다." |

### 7-2. 이번 세션에 새로 발견한 문제

- 🔴 **BUG-006 (수정함)**: `PATCH /api/v1/amounts/{amountNo}/approval`, `.../approval/sponsor`(비용 결재/지원금 처리)에 **권한 검증이 전혀 없었음**(Swagger 설명에 "MANAGER/ADMIN 등 결재 권한에 대한 별도 검증 로직은 존재하지 않습니다"라고 이미 스스로 문서화되어 있던 상태). 실제로 STAFF 토큰으로 본인이 신청한 정산 건을 스스로 승인 처리하는 데 성공함(자세한 내용 10절).
- 🟡 **BUG-008 (분류만 함, 수정 안 함 — 지시사항에 따름)**: `GET /employees`(전체 직원 목록)에 권한 제한이 전혀 없어 STAFF 토큰으로도 전 직원의 주소/전화번호/이메일 등 개인정보가 그대로 노출됨. `Header.jsx`에서 "직원 관리" 메뉴가 명시적으로 `roles: ["ADMIN"]`으로 제한되어 있고, `App.jsx` 라우트도 ADMIN 조건부로만 등록되어 있어 **원래 설계 의도는 ADMIN 전용이 명백**함. 즉 이것은 "의도된 설계"가 아니라 **백엔드 권한 검증 누락 버그**로 분류함. (10절 BUG-008 상세, 이번 세션에는 수정하지 않고 분류/기록만 함 — 사용자 지시에 따름)
- 🔴 **BUG-004 (수정함)**: `GET /approval/{workcationNo}`, `GET /approval/list` 등 `WorkcationInfo`에 중첩된 `Employee` 엔티티를 그대로 직렬화하는 응답에서 **BCrypt 비밀번호 해시가 그대로 노출**되고 있었음.

---

## 8. 핵심 DEMO 시나리오 결과

실제로 새 워케이션 신청(workcationNo=8, "검증용 워케이션 신청(자동화 테스트)")을 생성해 끝까지 진행했다.

| STEP | 내용 | 결과 | 비고 |
|---|---|---|---|
| STEP1 | ADMIN 로그인 → 부서/사용자/거점/공지 확인 | 🟢 PASS | 대시보드, 직원 목록(6명, 3개 부서), 거점 목록(4개) 브라우저로 직접 확인 |
| STEP2 | STAFF 로그인 → 대시보드 → 거점목록 → 워케이션 신청(기간/거점/업무계획) → 제출 | 🟢 PASS | 브라우저로 실제 폼 입력·제출, workcationNo=8 생성, approverState="W" DB 반영 확인 |
| STEP2-예약 | 워케이션 중 시설 예약 신청 | 🔴 **당초 완전히 작동 불가 → 이번 세션에 백엔드 수정(로컬 커밋, 재배포 필요)** | 상세 BUG-002 |
| STEP3 | MANAGER 로그인 → 승인대기 확인 → 상세 확인 → 승인 | 🟢 PASS | 브라우저로 실제 승인 처리, approverState W→A, approver=manager01, approvetAt 서버 시각 기록 확인 |
| STEP4 | ADMIN 최종승인/확정 | 🟡 PARTIAL(구조상 별도 확정 단계 없음) | `WorkcationInfo`에는 `approverState`(A/C/H/J/R/W) 외 별도의 "확정" 상태 필드가 없음. `POST /approval/*`는 ADMIN·MANAGER 모두 승인 권한이 있어, MANAGER 승인 = 사실상 최종 승인으로 동작함. ADMIN은 승인 이력(`GET /approval/list`)에서 조직 전체 건을 조회할 수 있음(실제 확인). 즉 "ADMIN만의 별도 확정 액션"은 현재 구현에 없음 — 시연 스크립트와 실제 구현의 상태 모델이 다르다는 점을 시연 전 확인 필요 |
| STEP5 | STAFF/MANAGER 재로그인 → 업무시작 → 출퇴근 → Task 상태변경 → 업무보고 | 🟢 PASS | 출근(IN)/퇴근(OUT) API 성공(attendanceNo 15,16), Task 진행률 0%→100%, status N→Y 확인 |
| STEP6 | 비용등록 → 증빙등록(파일 업로드) → 정산신청 | 🟡 PARTIAL | 비용 신청 자체(REQUEST, amountNo=6)와 파일 업로드 API 호출은 성공(200), 그러나 업로드된 파일을 **다시 조회하면 404**(BUG-005, 수정함 — 재배포 필요) |
| STEP7 | MANAGER → 업무결과확인 → 완료확인 | 🟢 PASS | `GET /approval/list`로 조직 승인 이력 조회 성공(listCount=4) |
| STEP8 | ADMIN → 정산승인/반려 → 지원금 처리 | 🟢 PASS(기능 자체는 동작) / 🔴 (권한 검증 누락, BUG-006 수정함) | 결재 상태 R→A, 지원금 등록(PAID) 정상 반영 확인. 단 STAFF도 동일 API로 자가 승인이 가능했던 점은 심각한 버그로 별도 기록 |
| STEP9 | STAFF → 워케이션 이력 → 만족도조사 | 🔵 **재확인 필요(미완료)** | 신규 생성한 workcationNo=8은 종료일이 2026-10-09(미래)라 서버 로직상("워케이션 종료 후 작성 가능") 설문 제출 불가. 기존 완료건(workcationNo=2)은 이미 이전 세션에 설문이 제출된 상태(`submitted:true`)라 재제출 테스트 불가. **이번 세션에는 실제 신규 제출을 실행하지 못했음** — 설문 조회 API(`GET /survey/questions`, `GET /survey/status/{workcationNo}`) 자체는 정상 응답하는 것만 확인함 |

**요약**: 신청→승인→출퇴근→업무진행→정산신청→정산승인/지원금까지 이어지는 핵심 라이프사이클은 실제 서버에서 상태값 변화까지 포함하여 정상 동작 확인. 다만 (1) 시설 예약 기능은 완전히 고장나 있었고, (2) 증빙파일은 업로드 후 조회가 불가능했고, (3) 정산 승인에 권한 검증이 없었다는 3가지 실질적 결함을 발견 — 모두 이번 세션에 원인 규명 후 최소 수정하여 로컬 커밋 완료(재배포 필요).

---

## 9. 기능명세서 대비 구현률

- 이전 세션과 동일하게 **별도의 "기능명세서" 문서는 저장소 어디에도 존재하지 않음**을 재확인(`*기능명세*`, `*spec*.md` 패턴으로 재검색, 결과 없음).
- 대신 기존 `PROJECT_FINAL_STATUS.md`/`API_STATUS.md`/`DB_DESIGN.md`/`WORK_LOG.md`가 사실상 기능명세서 역할을 하고 있으며, 이번 세션에서 실제로 재현·검증한 API들의 URL/파라미터는 해당 문서 및 Swagger 문서 기재 내용과 일치함을 확인.

---

## 10. BUG 목록

### BUG-001 (P0, 수정 완료)
- **기능**: 존재하지 않는 리소스 조회 시 에러 처리 전반
- **발생 위치**: 전역(`@ControllerAdvice` 부재). 대표 사례: `GET /employees/{존재하지 않는 empNo}`
- **재현 방법**: `curl .../workflow/employees/999999999` (유효한 토큰 사용)
- **기대 결과**: HTTP 404
- **실제 결과(수정 전)**: HTTP 500 `{"message":"존재하지 않는 사용자입니다.", ...}`
- **원인**: 프로젝트 전체에 전역 예외 처리기가 없어, Service 계층이 던지는 `IllegalArgumentException`(대상 없음/입력값 오류 구분 없이 113곳에서 공용으로 사용)이 Spring Boot 기본 에러 처리로 흘러가 전부 500 처리됨.
- **수정 여부**: ✅ 수정함 — `com/kh/workflow/common/exception/GlobalExceptionHandler.java` 신규 작성(`@RestControllerAdvice`). 메시지에 "존재하지 않는"/"찾을 수 없" 포함 시 404, 그 외는 400으로 매핑. 기존 에러 응답 JSON 형태(timestamp/status/error/message/path)는 그대로 유지해 프런트엔드 호환성 확보.
- **중요도**: P0 (전 API 공통 영향, Swagger 문서에 이미 404가 명시된 곳들과 실제 동작이 불일치했음)
- **재검증 결과**: 로컬 컴파일 BUILD SUCCESS. **운영 서버 재배포 전이라 실제 서버 재검증은 못함** — 재배포 필요.

### BUG-002 (P0, 수정 완료)
- **기능**: 시설/거점 예약 신청("예약 신청" 화면, `/reservations/enroll`)
- **발생 위치**: `ReservationController`(백엔드), `reservationApi.js`/`ReservationEnrollComponent.jsx`(프런트엔드)
- **재현 방법**: 브라우저에서 STAFF로 로그인 → `/reservations/enroll` → 지역/기간 입력 → "예약 가능한 거점 조회" 클릭
- **기대 결과**: 조건에 맞는 거점 목록 표시
- **실제 결과(수정 전)**: 항상 실패. 실제 호출된 `GET /reservations/hubs?...`가 백엔드에 아예 존재하지 않는 엔드포인트라 `GET /reservations/{rsvNo}` 라우트에 `"hubs"`가 rsvNo로 매칭 시도되어 `400 Bad Request: Failed to convert value of type 'String' to required type 'Integer'; For input string: "hubs"` 반환. 즉 이 화면을 통한 예약 신청은 **한 번도 성공할 수 없는 상태**였음.
- **원인**: 프런트엔드(`reservationApi.js`)는 `GET /reservations/hubs`(지역 기반 거점 검색)를 호출하도록 작성되어 있으나, 백엔드에는 대응하는 엔드포인트가 없음. 참고로 `ReservationScheduleComponent.jsx`가 `hubNo` 쿼리 파라미터를 붙여 `/reservations/enroll?hubNo=...`로 이동시키는 코드도 있었으나, `ReservationEnrollComponent.jsx`는 쿼리 파라미터를 전혀 읽지 않아 이 경로도 죽은 코드였음.
- **수정 여부**: ✅ 수정함 — `ReservationController`에 `GET /reservations/hubs` 엔드포인트 신규 추가. 기존 `HubController`/`HubService.searchHubList`를 재사용해 지역(대분류/소분류) 조건에 맞는 거점 후보를 반환하도록 구현(시간대별 예약 가능 여부까지 완전히 필터링하지는 않음 — 실제 이중예약 방지는 기존처럼 `POST /reservations` 시점에 `countOverlappingReservation()`으로 이미 검증되고 있어 안전함).
- **중요도**: P0 (핵심 시연 시나리오 STEP2의 "예약" 단계가 100% 실패하는 상태였음)
- **재검증 결과**: 로컬 컴파일 BUILD SUCCESS. 이 엔드포인트가 재사용하는 `HubService.searchHubList`에 **별도의 NULL 비교 버그(BUG-003)** 가 있어 함께 수정하지 않으면 여전히 빈 목록만 반환되었을 것 — BUG-003도 같이 수정함으로써 실질적으로 동작하도록 처리. **재배포 필요, 재배포 후 실제 브라우저로 재확인 권장**.

### BUG-003 (P1, 수정 완료)
- **기능**: 거점 검색(`GET /hubs/search`) — 관리자 거점 목록의 지역/이름 필터, 및 BUG-002가 재사용하는 예약용 거점 조회
- **발생 위치**: `HubDao.searchHubList()` (JPQL)
- **재현 방법**: `curl .../workflow/hubs/search?mainRegion=제주도&subRegion=제주시&hubType=1` (실제 hubNo=3 "제주 스마트오피스"가 이 조건에 정확히 일치하는 데이터로 존재함을 `GET /hubs`로 먼저 확인)
- **기대 결과**: hubNo=3 반환
- **실제 결과(수정 전)**: `listCount:0` (키워드 없이 호출한 모든 조합에서 항상 0건). 동일 조건에 `keyword=스마트`를 추가하면 정상적으로 hubNo=3이 반환되는 것으로 원인 확정.
- **원인**: JPQL이 `h.hubName LIKE %:keyword%` 형태였는데, `keyword`가 `null`이면 SQL 3치 논리에 의해 이 조건이 항상 UNKNOWN이 되어 **전체 WHERE절이 무조건 거짓**이 됨. 즉 검색어를 입력하지 않고 지역만으로 필터링하려는, 실제로 가장 흔히 쓰이는 사용 패턴에서 결과가 항상 0건이었음.
- **수정 여부**: ✅ 수정함 — `mainRegion`/`subRegion`/`keyword` 각각에 대해 `(:param IS NULL OR :param = '' OR h.컬럼 LIKE %:param%)` 가드 추가. 조건이 실제로 주어졌을 때의 매칭 동작은 기존과 동일.
- **중요도**: P1 (관리자 거점 검색 필터, 예약 화면 거점 선택 둘 다에 영향을 주는 이미 배포되어 있던 기존 기능의 버그)
- **재검증 결과**: 로컬 컴파일 BUILD SUCCESS. **재배포 필요**.

### BUG-004 (P0, 수정 완료)
- **기능**: 전 API 공통 — `Employee` 엔티티가 중첩되어 직렬화되는 모든 응답(예: `GET /approval/{workcationNo}`, `GET /approval/list`)
- **발생 위치**: `Employee.java` (`empPwd` 필드)
- **재현 방법**: `curl .../workflow/approval/8` (ADMIN 토큰)
- **기대 결과**: 비밀번호 관련 필드는 응답에 포함되지 않아야 함
- **실제 결과(수정 전)**: 응답 JSON에 `"empPwd":"$2b$10$..."` (BCrypt 해시)가 신청자·결재자 정보 양쪽에 그대로 포함됨
- **원인**: `WorkcationInfo` 등 다른 엔티티들이 DTO 변환 없이 `Employee` 엔티티를 그대로 중첩 반환하고 있고, `Employee`에는 직렬화 제외 설정이 전혀 없었음
- **수정 여부**: ✅ 수정함 — `Employee.empPwd`에 `@JsonIgnore` 추가. 로그인 등 서버 내부 로직은 필드를 그대로 사용하며 영향 없음, JSON 응답에서만 제외됨.
- **중요도**: P0 (해시라 하더라도 비밀번호 관련 데이터가 다수의 API 응답에 광범위하게 노출되고 있었음 — 오프라인 크래킹 시도의 단서가 될 수 있음)
- **재검증 결과**: 로컬 컴파일 BUILD SUCCESS. **재배포 필요**.

### BUG-005 (P1, 부분 수정)
- **기능**: 비용 증빙(영수증) 파일 업로드 후 조회/다운로드
- **발생 위치**: 업로드는 `AmountController.createAmount()`(정상), 조회는 서빙 설정 부재
- **재현 방법**: 실제로 `POST /api/v1/amounts`에 파일 첨부하여 업로드(amountNo=6, 응답에 `filePath:"/upload/receipts/xxx.png"` 정상 기록) → 이후 해당 URL로 GET 시도
- **기대 결과**: 업로드된 이미지 반환
- **실제 결과(수정 전)**: 어떤 경로 조합으로도 HTTP 404. 프로젝트 전체에 `WebMvcConfigurer`/`addResourceHandlers` 설정이 전무하여, 업로드 디렉터리(`app.upload.receipts-dir`, 운영 `/opt/workflow/uploads/receipts/`)를 HTTP로 서빙해주는 경로가 아예 없었음.
- **원인**: 파일을 실제로 저장하는 로직만 있고, 저장된 파일을 다시 꺼내오는 정적 리소스 매핑이 구현되어 있지 않았음.
- **수정 여부**: ✅ 증빙(영수증) 파일에 대해서만 수정함 — `WebConfig.java` 신규 작성(`/upload/receipts/**` → `app.upload.receipts-dir` 파일시스템 경로 매핑) + `SecurityConfig`에 해당 경로 `permitAll` 추가(이미지가 `<img src>`로 직접 로드되어 Authorization 헤더를 실을 수 없으므로 기존 `/resources/**`(Hub 이미지)와 동일한 방식 적용, 파일명이 업로드 시 UUID로 치환되어 추측이 어려움).
- **추가로 발견한 별개 문제(BUG-007 참고)**: 같은 방식으로 확인한 결과 **Hub(거점) 이미지도 동일하게 404** — 다만 원인(저장 위치)이 달라 이번 세션에는 손대지 않고 별도 BUG로만 기록함.
- **중요도**: P1 (시연 항목 9 "파일 업로드→조회" 자체가 불가능했던 실질적 기능 결함)
- **재검증 결과**: 로컬 컴파일 BUILD SUCCESS. **재배포 필요, 재배포 후 실제 파일 업로드→조회 재확인 필수**(SSH로 디스크 파일 존재 자체는 여전히 확인 불가하므로 HTTP 응답으로만 간접 검증 가능).

### BUG-006 (P0, 수정 완료) — 가장 심각한 발견
- **기능**: 비용 정산 결재(`PATCH /api/v1/amounts/{amountNo}/approval`, `.../approval/sponsor`)
- **발생 위치**: `SecurityConfig`(권한 제한 매처 부재), 컨트롤러 코드에도 별도 권한 체크 없음(Swagger 설명에 이미 "MANAGER/ADMIN 등 결재 권한에 대한 별도 검증 로직은 존재하지 않습니다"라고 스스로 명시되어 있었음)
- **재현 방법**: STAFF(staff01) 토큰으로 본인이 신청한 정산 건(amountNo=6, 신청 금액 200,000원)에 대해 직접 `PATCH .../approval?status=A&approvedAmount=200000` 호출
- **기대 결과**: 403 Forbidden(MANAGER/ADMIN만 결재 가능해야 함)
- **실제 결과(수정 전)**: **200 OK, "결재 상태가 변경되었습니다."** — 본인 신청 건을 스스로 승인 처리하는 데 성공. 실제로 DB에도 `status:"A"`, `approvedAmount:200000`, `approvedAt` 기록됨을 재조회로 확인.
- **원인**: `SecurityConfig`에 `/api/v1/amounts/**`는 GET에 대해서만 `authenticated()` 매처가 있었고, PATCH(결재)에 대한 별도 권한 매처가 전혀 없어 `.anyRequest().authenticated()`로 흘러가 로그인만 되어 있으면 누구나 호출 가능했음.
- **수정 여부**: ✅ 수정함 — `SecurityConfig`에 `PATCH /api/v1/amounts/*/approval`(ADMIN, MANAGER만 허용), `PATCH /api/v1/amounts/*/approval/sponsor`(ADMIN만 허용) 매처 추가. 본인 신청 취소(`/cancel`) 등 다른 API는 기존 그대로 유지.
- **중요도**: **P0** (실제 금전적 지급과 직결되는 정산 승인 과정의 인가 우회 — ERP 시스템에서 가장 치명적인 유형의 버그)
- **재검증 결과**: 로컬 컴파일 BUILD SUCCESS. **재배포 필요, 재배포 후 STAFF 토큰으로 동일 재현 시도 → 403 확인 필수**.

### BUG-007 (P1, 미수정 — 원인만 규명, BUG 기록만)
- **기능**: 거점(Hub) 이미지 업로드/조회
- **발생 위치**: `FileRenamePolicy.saveFile()` (`HubController`가 사용)
- **재현 방법**: `GET /hubs`로 확인한 실제 hubNo=1의 이미지(`filePath:"/resources/upload/hub"`, `changeName:"2026090902272894240.jpeg"`)를 `curl http://3.87.158.173/workflow/resources/upload/hub/2026090902272894240.jpeg`로 요청
- **기대 결과**: 이미지 반환
- **실제 결과**: HTTP 404 (BUG-005와 동일 증상)
- **원인 추정**: `FileRenamePolicy.saveFile()`이 `HttpSession.getServletContext().getRealPath(path)`로 저장 경로를 구하는데, 이는 전통적인 WAR 배포(Tomcat이 앱을 디스크에 풀어놓는 방식)에서만 안정적으로 동작하는 낡은 API다. 이 프로젝트처럼 Spring Boot가 실행 가능한 JAR(내장 Tomcat)로 배포되는 경우 `getRealPath()`는 `null`을 반환하거나 재시작할 때마다 바뀌는 임시 디렉터리를 반환할 수 있어, 파일이 어디에 저장되는지 배포 환경에 따라 달라지고 안정적으로 서빙할 수 없는 구조다.
- **수정하지 않은 이유**: BUG-005(증빙파일)는 `app.upload.receipts-dir`라는 명시적 절대경로 설정이 있어 안전하게 고칠 수 있었으나, Hub 이미지는 실제 운영 서버(EC2)에서 파일이 정확히 어느 경로에 쓰이고 있는지 SSH 없이는 확정할 수 없다. 잘못 추정한 경로로 리소스 핸들러를 연결하면 오히려 "그럴듯하게 보이지만 여전히 작동 안 함" 상태를 만들 위험이 있어, 이번 세션에서는 원인 규명까지만 하고 코드를 변경하지 않았다.
- **중요도**: P1 (거점 상세/목록 화면의 이미지 미리보기 기능 결함이나, 핵심 승인/정산 흐름 자체를 막지는 않음)
- **권장 조치**: 운영 서버 SSH 접근이 가능한 사람이 실제 `getRealPath()` 반환값(또는 톰캣 work 디렉터리)을 확인한 뒤, BUG-005와 동일한 방식(`app.upload.hub-dir` 같은 명시적 절대경로 설정 + `WebConfig` 리소스 핸들러)으로 통일하는 리팩토링을 별도 작업으로 진행 권장.

### BUG-008 (P1, 분류만 함 — 지시사항에 따라 미수정)
- **기능**: 전체 직원 목록 조회(`GET /employees`)
- **발생 위치**: `SecurityConfig`(권한 제한 매처 부재)
- **재현 방법**: STAFF(staff01) 토큰으로 `GET /employees` 호출
- **기대 결과**(프런트엔드 설계 의도 기준): ADMIN만 조회 가능해야 함(`Header.jsx`의 "직원 관리" 메뉴가 `roles: ["ADMIN"]`, `App.jsx` 라우트도 ADMIN 조건부)
- **실제 결과**: 200 OK — STAFF도 전체 직원 6명의 주소/전화번호/이메일 등 개인정보를 포함한 목록을 그대로 조회 가능
- **분류 판단**: `SecurityConfig`에는 `POST /employees`(등록), `PATCH /employees/*/status`, `PATCH /employees/*/role`만 ADMIN 전용으로 명시되어 있고 `GET /employees`(목록)는 별도 제한이 없어 `.anyRequest().authenticated()`로 흘러감. 프런트엔드가 이 메뉴/라우트를 ADMIN 전용으로 명확히 설계해 놓은 것과 명백히 불일치하므로 **"의도된 설계"가 아니라 백엔드 권한 검증 누락 버그로 분류**한다.
- **수정 여부**: ❌ 수정하지 않음(사용자 지시에 따라 분류·기록만 수행). 수정 시 `SecurityConfig`에 `GET /employees`(정확히 이 경로, `/employees/{empNo}`가 아님)를 `hasRole("ADMIN")`으로 제한하는 매처를 `.anyRequest()` 이전에 추가하면 된다.
- **중요도**: P1 (개인정보 대량 노출이지만 사내 인증된 사용자 간의 노출이라 외부 유출 위험은 BUG-004/006보다 낮음)

### BUG-009 (기존 발견, 이번 세션 재확인만 함 — 미수정)
- **기능**: MANAGER용 승인대기 목록 조회
- **발생 위치**: `WorkcationDao.managerSelectWaitingList()`
- **내용**: 14차 작업(이전 세션)에서 이미 발견된 `SELECT DISTINCT` 누락으로 인한 중복 행 버그. Admin판은 이전에 수정되었으나 Manager판은 미수정 상태로 남아있다고 문서에 기록되어 있었음(`WORK_LOG.md` 14차 항목).
- **이번 세션 재확인**: 코드를 다시 열람해 동일 상태임을 확인. 단, 실제 브라우저로 manager01 승인대기 목록 조회 시 항목이 1건뿐이라 중복이 재현되지는 않음(데이터가 적어 증상이 드러나지 않은 것일 뿐, 근본 원인은 미해결). 이번 세션 범위 밖으로 판단해 코드는 수정하지 않음.
- **중요도**: P2(핵심 흐름을 막지 않으며, 데이터가 많아지는 시나리오에서만 드러남)

### UI-001 (P2, 미수정)
- **페이지**: 승인 및 반려 화면(`ApprovalReject.jsx`, `/approval/reject/:workcationNo`)
- **문제**: "워케이션 장소"/"주소" 필드가 항상 빈 칸으로 표시됨(실제 브라우저로 workcationNo=8 승인 처리 화면에서 확인). 업무계획 텍스트는 정상 표시됨.
- **개선 방향**: 상세 조회 API(`GET /approval/queue/{workcationNo}`) 응답에 거점명/주소 필드가 포함되어 있는지 확인 후 프런트엔드 바인딩 보완 필요.
- **중요도**: P2 (승인 처리 자체(상태 변경)는 정상 동작하므로 핵심 흐름을 막지 않음, 승인자가 참고 정보를 못 보는 UX 문제)
- **시연 영향**: 낮음 — 굳이 이 필드를 확대해서 보여주지 않으면 시연 중 드러나지 않음.

---

## 11. TODO 목록

### TODO-001
- **기능**: 워케이션 신청 STEP4 "ADMIN 최종승인/확정" 단계
- **현재 상태**: 구현되지 않음(별도의 확정 상태 필드 없음, MANAGER 승인 = 사실상 최종 승인)
- **왜 미완성**: 애초에 상태 모델 설계 자체가 "승인(A) 하나"로 끝나도록 되어 있고, 시연 스크립트가 상정하는 "승인대기→승인→확정" 3단계 모델과 다름
- **중요도**: P2
- **시연 영향**: 시연 스크립트를 "MANAGER 승인 = 최종 승인"으로 수정해서 진행하면 문제 없음. 별도 확정 버튼을 굳이 보여주려 하면 존재하지 않아 시연이 막힘.
- **나중에 구현해도 되는 이유**: 현재도 승인 권한이 있는 담당자(MANAGER/ADMIN)가 승인하면 그걸로 업무 흐름이 끊기지 않고 이어짐 — 실사용에 지장 없음.
- **예상 작업량**: 상태 필드 추가(스키마 변경 수반) + 관련 화면 다수 수정 필요 — 중~대

### TODO-002
- **기능**: 만족도 조사(Survey) 실제 신규 제출 흐름
- **현재 상태**: API(`GET /survey/questions`, `GET /survey/status`, `POST /survey`)는 존재하고 조회는 정상이나, 이번 세션에는 "이미 완료됐고 아직 미제출인" 워케이션 건이 없어 실제 신규 제출은 재검증하지 못함(🔵)
- **왜 미완성**: 검증 환경(오늘 날짜 2026-09-09) 기준으로 마침 조건에 맞는 데이터가 없었을 뿐, 기능 자체의 결함 정황은 없음
- **중요도**: P2
- **시연 영향**: 시연 당일 이미 종료일이 지난 워케이션 건으로 시연하면 문제없이 동작할 가능성이 높음(이전 세션에 workcationNo=2로 이미 성공 이력 있음) — 단, 이번 세션에서 직접 재현하지 못했으므로 시연 리허설 시 반드시 사전 확인 권장
- **나중에 구현해도 되는 이유**: 이미 과거에 정상 동작 이력이 있고 로직도 명확함
- **예상 작업량**: 없음(재검증만 필요)

### TODO-003
- **기능**: Hub(거점) 데이터의 `mainRegion` 값 불일치("제주" vs "제주도")
- **현재 상태**: hubNo=1은 `mainRegion:"제주"`, hubNo=3,4는 `mainRegion:"제주도"`로 동일 지역인데 표기가 다름
- **왜 미완성**: 더미 데이터 입력 시점의 표기 불일치로 추정, 기능 오류라기보다 데이터 정합성 문제
- **중요도**: P2
- **시연 영향**: 워케이션 신청/예약 화면에서 "제주도"로 검색하면 hubNo=1(디어먼데이 제주 롯데호텔점)이 누락될 수 있음 — 시연 시 지역 필터 대신 직접 목록에서 선택하면 회피 가능
- **나중에 구현해도 되는 이유**: 코드 버그가 아니라 데이터 정정 사안이라 SQL 한 줄로 해결 가능하고 긴급하지 않음
- **예상 작업량**: 소(UPDATE 쿼리 1건)

### TODO-004
- **기능**: BUG-007(Hub 이미지 서빙) 근본 수정
- **현재 상태**: 원인 규명만 완료, 미수정
- **왜 미완성**: SSH 접근 없이 실제 파일 저장 위치를 확정할 수 없어 이번 세션 범위에서 안전하게 수정 불가
- **중요도**: P1
- **시연 영향**: 거점 목록/상세 화면에서 이미지가 깨져 보임(사진 없이도 텍스트 정보로 시연은 가능)
- **나중에 구현해도 되는 이유**: 핵심 워크플로우(신청→승인→정산)와 무관, 시각적 요소일 뿐
- **예상 작업량**: 중(SSH로 실제 경로 확인 + `FileRenamePolicy` 리팩토링 + `WebConfig` 추가)

### TODO-005
- **기능**: BUG-008(GET /employees 권한 제한) 실제 수정
- **현재 상태**: 분류만 완료, 미수정(사용자 지시)
- **중요도**: P1
- **시연 영향**: 없음(오히려 지금 상태가 "모든 직원이 서로 조회 가능"해서 데모 중 문제로 드러나지 않을 수도 있음)
- **나중에 구현해도 되는 이유**: 사용자가 직접 판단하도록 보고서에만 기록하라는 명시적 지시였음
- **예상 작업량**: 소(`SecurityConfig`에 매처 1줄 추가)

---

## 12. UI 목록

- **UI-001**: 10절 참고(승인 화면 장소/주소 필드 미표시, P2)

---

## 13. P0/P1/P2/P3 우선순위 정리

### 🔴 P0 — 지금 반드시 수정 (이번 세션에 전부 수정 완료, 재배포 필요)
1. BUG-001 — 존재하지 않는 리소스 조회 시 500 반환(전역 예외처리 부재)
2. BUG-002 — 시설 예약 신청 기능 완전 작동 불가
3. BUG-004 — 비밀번호 해시(BCrypt) API 응답 노출
4. BUG-006 — 정산 결재 API 권한 검증 전무(STAFF 자가승인 가능)

### 🟠 P1 — 핵심 기능 보완 (일부 수정, 일부 분류만)
1. BUG-003 — 거점 검색 NULL 비교 버그 (수정 완료)
2. BUG-005 — 증빙파일 업로드 후 조회 불가 (증빙파일은 수정 완료, Hub 이미지는 TODO-004로 이월)
3. BUG-008 — GET /employees 권한 누락 (분류만, 수정은 사용자 판단에 위임)

### 🟡 P2 — 시간 여유 있으면
1. BUG-009 — Manager 승인대기 목록 중복 가능성(SELECT DISTINCT 누락)
2. UI-001 — 승인 화면 장소/주소 미표시
3. TODO-001 — ADMIN 별도 확정 단계 부재
4. TODO-002 — 만족도조사 재검증
5. TODO-003 — Hub mainRegion 데이터 정합성

### ⚪ P3 — 지금 안 해도 됨
- (이번 세션 범위에서는 별도 P3 항목 없음 — 발견된 문제들이 대부분 핵심 흐름과 직간접적으로 연관되어 있었음)

---

## 14. 실제 서버에서 수정한 내용 (이번 세션, 로컬 커밋만 — Deploy 미push)

| 파일 | 변경 내용 |
|---|---|
| `WorkFlow_Project_BE/.../common/exception/GlobalExceptionHandler.java` (신규) | 전역 예외 처리기 추가, IllegalArgumentException을 메시지 내용에 따라 404/400으로 매핑(BUG-001) |
| `WorkFlow_Project_BE/.../reservation/controller/ReservationController.java` | `GET /reservations/hubs` 엔드포인트 신규 추가(BUG-002) |
| `WorkFlow_Project_BE/.../hub/model/dao/HubDao.java` | `searchHubList` JPQL의 NULL 비교 버그 수정(BUG-003) |
| `WorkFlow_Project_BE/.../employee/model/vo/Employee.java` | `empPwd` 필드에 `@JsonIgnore` 추가(BUG-004) |
| `WorkFlow_Project_BE/.../config/WebConfig.java` (신규) | 증빙파일 정적 리소스 서빙 설정 추가(BUG-005) |
| `WorkFlow_Project_BE/.../config/SecurityConfig.java` | 증빙파일 경로 permitAll 추가(BUG-005) + 정산 결재/지원금 API 권한 제한 추가(BUG-006) |

- 모든 변경 후 `mvnw.cmd -o compile -DskipTests` **BUILD SUCCESS** 확인.
- Deploy 브랜치 또는 어떤 원격 브랜치에도 push하지 않았음 — **재배포는 사용자가 직접 판단하여 진행 필요**.

---

## 15. 실제 서버 재검증 결과

- 위 6개 수정 사항은 **로컬 브랜치(`docs/step1-6-project-audit`)에만 커밋되어 있고, 운영 서버(3.87.158.173)에는 아직 반영되지 않음.**
- 따라서 이번 세션에서 발견한 버그들은 **"운영 서버에서 재현 완료(수정 전 상태)"까지만 검증되었고, "수정 후 운영 서버에서 재검증"은 재배포 이후에 별도로 필요**하다.
- 재배포 후 반드시 재확인해야 할 항목(우선순위 순):
  1. STAFF 토큰으로 `PATCH /api/v1/amounts/{amountNo}/approval` 재시도 → 403 확인 (BUG-006)
  2. `GET /employees/999999999` → 404 확인 (BUG-001)
  3. 브라우저로 예약 신청 화면(`/reservations/enroll`) 실제 진행 → 거점 목록이 뜨는지 확인 (BUG-002/003)
  4. `GET /approval/{workcationNo}` 응답에 `empPwd` 필드가 사라졌는지 확인 (BUG-004)
  5. 새로 업로드한 증빙파일 URL로 실제 이미지가 열리는지 확인 (BUG-005)

---

## 16. 최종 DEMO READY 여부

## 🟡 DEMO READY WITH CONDITIONS

**근거**:
- 핵심 라이프사이클(STAFF 신청 → MANAGER 승인 → 출퇴근 → 업무진행 → 정산신청 → ADMIN 정산승인/지원금)은 실제 서버에서 상태값 변화까지 포함해 정상 동작을 확인했다 — 이 부분만 놓고 보면 시연 가능.
- 그러나 (1) 발견된 P0급 버그(BUG-006, 정산 자가승인) 및 BUG-001/002/004는 **아직 운영 서버에 반영되지 않은 상태**이며, (2) 시연 스크립트가 상정하는 "예약" 단계와 "ADMIN 별도 확정" 단계는 현재 구현과 정확히 일치하지 않는다.
- **조건**: ① 이번 세션에서 만든 6개 수정 커밋을 재배포할 것, ② 시연 스크립트에서 "예약" 단계는 재배포 후 반드시 리허설로 재확인할 것, ③ "ADMIN 최종확정" 단계는 스크립트를 "MANAGER/ADMIN 승인 = 최종"으로 수정해서 진행할 것, ④ 만족도조사는 이미 종료된 과거 워케이션 건으로 시연할 것.

---

## 17. 앞으로 남은 작업 순서

1. 이번 세션의 6개 로컬 커밋을 검토 후 Deploy 브랜치로 병합·재배포
2. 재배포 후 15절의 5개 항목 재검증
3. BUG-007(Hub 이미지 서빙) — SSH 접근 가능한 담당자가 실제 저장 경로 확인 후 근본 수정
4. BUG-008(GET /employees 권한) — 수정 여부 사용자 최종 판단 후 조치
5. BUG-009(Manager 승인대기 중복) — 데이터가 많아지기 전에 `SELECT DISTINCT` 추가
6. TODO-003(Hub 지역명 데이터 정합성) — SQL로 일괄 정정
7. 시연 리허설: 예약 기능, 만족도조사, ADMIN 확정 단계 시나리오를 실제 구현에 맞게 최종 점검

---

## FINAL STATUS

- **전체 기능 판정 건수**: 🟢 PASS 다수(핵심 라이프사이클 전 단계), 🟡 PARTIAL 3건(STEP4/STEP6/STEP8 권한), 🔴 ERROR(수정 전 기준) 6건, ⚪ TODO 5건, 🔵 UI 1건
- **우선순위별 건수**: 🔴 P0 4건(모두 수정 완료, 재배포 대기) / 🟠 P1 3건(2건 수정 완료, 1건 분류만) / 🟡 P2 5건(미수정, 목록화) / ⚪ P3 0건
- **DEMO READY 여부**: 🟡 **DEMO READY WITH CONDITIONS** (재배포 + 시연 스크립트 3곳 조정 전제)
- **가장 먼저 해야 할 작업 3가지**:
  1. 이번 세션 수정 6건 재배포 (특히 BUG-006 정산 자가승인은 실사용 중에도 위험)
  2. 재배포 후 15절 재검증 체크리스트 실행
  3. 시연 스크립트에서 "예약"/"ADMIN 확정"/"만족도조사" 3개 단계를 실제 구현에 맞게 조정
- **지금 안 해도 되는 작업 3가지**:
  1. BUG-007(Hub 이미지) 근본 수정 — 시각적 요소일 뿐, SSH 접근 확보 후 진행
  2. TODO-001(ADMIN 별도 확정 상태 추가) — 스키마 변경 필요, 현재도 업무 흐름은 끊기지 않음
  3. TODO-003(Hub 지역명 데이터 정정) — 급하지 않은 데이터 정합성 이슈
