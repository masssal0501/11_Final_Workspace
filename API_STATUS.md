# API_STATUS.md

> **문서 역할**: 이 문서는 "API 엔드포인트별 상태"를 기록한다. 도메인 전체 현황표/로드맵/시연 시나리오는 `PROJECT_FINAL_STATUS.md`(2026-09-10) 참조.

마지막 갱신: 2026-09-09 (STEP 10 — 운영 배포 준비 시점. STEP 9에서 attendance/survey API 신규 검증 포함)

상태 기호: ✅ 정상 동작 확인 / 🔴 확실히 실패 / ⚠️ 동작하나 이슈 있음 / ⛔ 미구현
(2026-09-09부터 일부 항목은 코드 리뷰가 아니라 실제 로컬 MySQL + 격리된 백엔드 인스턴스에 대한 실제 HTTP 요청으로 검증됨 — 해당 항목에 "실제 테스트" 표기)

> ⚠️ **애플리케이션 전역에 영향을 준 버그 (2026-09-09 발견 및 수정)**: `SecurityConfig`에 `/error` 경로가 permitAll로 열려있지 않아, 컨트롤러에서 예외가 발생할 때마다(로그인 실패, 유효성 검증 실패, 존재하지 않는 리소스 조회 등 어떤 이유든) 실제 상태코드/에러 메시지 대신 **항상 빈 본문의 403**이 반환되고 있었다. 서블릿 컨테이너가 예외를 `/error`로 forward하는데 이 경로가 인증을 요구해 익명 요청이 거부되면서 벌어진 문제. 이 문서의 이전 버전에서 "✅ 정상"으로 표시했던 항목들도 실제로는 에러 케이스에서 전부 이 버그의 영향을 받고 있었을 것으로 추정된다(성공 케이스 자체는 영향 없음). `/error`를 permitAll에 추가해 해결 완료.

## employee (`/employees`) ↔ `employeeApi.js`

| Method/Path | Frontend 호출 | 상태 | 비고 |
|---|---|---|---|
| `POST /employees` | `createEmployee` | ✅ | **(2026-09-09 수정 완료)** `hasRole("ADMIN")`로 전환 — 실제 토큰 테스트로 STAFF/MANAGER 403, ADMIN 통과 확인. 프론트 `EmployeeEnrollFormComponent`는 이미 관리자 메뉴 하위에서만 쓰이므로 영향 없음 |
| `GET /employees/checkId` | `checkEmpIdDuplicate` | ✅ | |
| `POST /employees/login` | `login` | ✅ | |
| `POST /employees/logout` | `logout` | ✅ | 서버측 로직은 no-op(JWT라 세션 정리 불필요, 의도된 설계) |
| `PUT /employees/password` | `changePassword` | ✅ | |
| `GET /employees/{empNo}` | `getEmployee` | ✅ | |
| `PUT /employees/{empNo}` | `updateEmployee` | ✅ | |
| `PATCH /employees/{empNo}/status` | `updateEmployeeStatus` | ✅ | ADMIN 역할 제한 정상 |
| `GET /employees` | `getEmployeeList` | ✅ | |
| `POST /employees/findId` | `findEmployeeId` | ✅ **(2026-09-09 수정 완료)** | 원래 백엔드는 정상 구현되어 있었음 — `employeeApi.js`의 `findEmployeeId`가 인자를 무시하고 `GET /employees`를 호출하던 것이 버그였고, 이를 `POST /employees/findId` 호출로 수정 |
| `PATCH /employees/{empNo}/role` | `updateEmployeeRole` | ✅ | ADMIN 역할 제한 정상 |
| `POST /employees/password/reset/request` (신규) | `requestPasswordReset` | ✅ **(2026-09-09 신규 구현)** | empId+email 확인 후 `verification` 테이블에 6자리 인증번호 저장(5분 유효), 이메일 발송. `permitAll` |
| `POST /employees/password/reset/verify` (신규) | `verifyPasswordResetCode` | ✅ **(2026-09-09 신규 구현)** | 인증번호 확인 → 임시 비밀번호 발급/저장/이메일 발송(`pwChgRequired=true`). `permitAll` |

## workcation (`/workcation`) ↔ `WorkcationApi.js`

| Method/Path | 상태 | 비고 |
|---|---|---|
| `GET /workcation/list` | ✅ | |
| `GET /workcation/mylist` | ✅ | |
| `GET /workcation/mydetail/{no}` | ✅ | 소유권 검사(emp_no 일치) 있음 |
| `GET /workcation/hub/list`, `/hub/mainRegion`, `/hub/subRegion` | ✅ | `hub` 모듈의 동일 기능 스텁을 대신 처리 중(중복 설계) |
| `POST /workcation/hub/enrollForm` | ✅ | |
| `GET /workcation/amount/supportInfo` | ✅ | |
| `GET /workcation/detail/{no}` | ⚠️ | 소유권/역할 검사 없음 — 아무나 임의 workcationNo 조회 가능 |
| `PUT update/{no}` (경로에 선행 `/` 누락) | ⚠️ | 매핑 경로 오타 가능성, `WorkcationApi.js`는 `/workflow/workcation/update/{no}`로 호출 — 실제 Spring 매핑과 일치하는지 재확인 필요 |
| `DELETE /workcation/delete/{no}` | ⚠️ | 소유권/역할 검사 없음 |
| `PUT /workcation/task/{taskNo}` | ✅ **(2026-09-09 수정 완료)** | `taskHistoryDao` DI 누락으로 100% NPE였던 것을 `@Autowired` 추가로 해결 |

> `WorkcationApi.js`는 프로젝트에서 유일하게 중앙 `axiosInstance`를 쓰지 않고 raw axios + 수동 Bearer 헤더를 쓰는 파일 — 핵심 기능이라 우선순위 높게 통일 권장.

## approval (`/approval`) ↔ `ApprovalApi.js`

| Method/Path | 상태 | 비고 |
|---|---|---|
| `GET /approval/list` | ✅ | |
| `GET /approval/{no}` | ✅ | |
| `GET /approval/queue` | ✅ | STAFF 차단 정상 |
| `GET /approval/queue/{no}` | ✅ | |
| `POST /approval/{no}` (반려) | ✅ **(2026-09-09 수정 완료)** | `hasAnyRole("ADMIN","MANAGER")`로 전환 — 실제 토큰 테스트로 STAFF 403, MANAGER/ADMIN 보안계층 통과 확인 |

**Frontend 라우팅 갭**: 위 API들은 모두 정상 호출 가능하지만 `App.jsx`가 승인 관련 라우트(`/approval/*`)를 `authCode==="ADMIN"` 블록에만 배치해 부서장(MANAGER)은 화면 자체에 도달할 방법이 없음. README 권한표 위반 — 수정 후보 1순위.

## amount (`/api/v1/amounts`) ↔ `amountApi.js`

| Method/Path | 상태 | 비고 |
|---|---|---|
| `GET /api/v1/amounts` | ✅ **(2026-09-09 수정 완료)** | 이전엔 `AmountServiceImpl.selectAmountList`가 스텁(`return null`) → NPE → 500이었음. `AmountDao.findAllByOrderByCreatedAtDescAmountNoDesc`에 연결해 해결 |
| `POST /api/v1/amounts` | ✅ **(2026-09-09 수정 및 실제 테스트 완료)** | `AmountForm.jsx`를 FormData 조립 방식으로 재작성(`amountApi.insertAmount` 사용). 로컬 MySQL에 연결한 백엔드로 실제 multipart 요청을 보내 `201 Created` + `amount`/`amount_item`/`amount_list`/`amount_file` 4개 테이블 저장까지 직접 확인. 이 과정에서 Jackson 순환참조(`Amount`↔`AmountItem`/`AmountFile`/`SupportList`) 버그와 `SupportList` 테이블명 오류를 추가로 발견해 함께 수정. **⚠️→✅ STEP 9 추가 발견(BUG-012)**: 백엔드는 정상인데 프론트의 "새 비용 신청" 버튼이 `/cost/apply?workcationNo=...`로 이동해도 `AmountForm`이 그 쿼리스트링을 읽지 않아 `workcationNo`가 항상 `undefined` — STAFF가 실제 화면에서는 이 엔드포인트를 단 한 번도 성공적으로 호출할 수 없었음. `useSearchParams`로 읽도록 수정 |
| `GET /api/v1/amounts/{no}` | ✅ **(2026-09-09 순환참조 버그 수정 확인)** | 실제 요청으로 재확인 — 수정 전에는 `Amount`↔자식 엔티티 간 Jackson 순환참조로 응답이 무한에 가깝게 폭주했음(`@JsonIgnore` 추가로 해결) |
| `GET /api/v1/amounts/workcation/{no}` | ✅ **(2026-09-09 수정 완료)** | 동일한 스텁 문제, `findByWorkcationNoOrderByCreatedAtDescAmountNoDesc`에 연결해 해결 |
| `PUT /api/v1/amounts/{no}` | 미확인 | |
| `PATCH /api/v1/amounts/{no}/cancel` | ✅ | |
| `PATCH /api/v1/amounts/{no}/approval` | ✅ **(2026-09-09 STEP 9, BUG-013 수정)** | ADMIN이 승인/반려/보류를 클릭해도 항상 400으로 실패하던 문제 — 프론트(`amountApi.js`)가 JSON 바디로 `axios.patch`를 보내는데 백엔드는 `@RequestParam`(쿼리 파라미터)만 받고 있었음(필드명도 `amountComment`↔`comment`로 불일치). 쿼리 파라미터 전송 + 필드명 일치로 수정, 실제 승인(150,000원)/반려 클릭 경로로 재검증 |
| `PATCH /api/v1/amounts/{no}/approval/sponsor` | ⚠️ | DB_DESIGN.md [확인 필요] 항목 5(SupportList 구조) 영향권 |
| `PATCH /api/v1/amounts/{no}/items/{itemNo}/company-support` | ✅ | |
| `GET /api/v1/amounts/statistics` | ✅ | |
| `PATCH .../file/{fileNo}/delete` | ✅ | 프론트 `deleteFile`은 다른 URL 패턴(`/files/{fileNo}`)로 호출 — 경로 재확인 필요 |

**(2026-09-09)** GET 전체 `authenticated()`로 전환 완료 — 실제 STAFF/MANAGER/ADMIN 토큰으로 200 확인, 무인증은 403 확인.

## notice (`/api/v1/notice`) ↔ `noticeApi.js`

| Method/Path | 상태 | 비고 |
|---|---|---|
| `GET /api/v1/notice` | ✅ | 실제 검색(제목/내용/작성자/제목+내용)·페이징·IMPORTANT 우선정렬까지 실제 DB로 확인 |
| `GET /api/v1/notice/{no}` | ✅ | 존재하지 않는 번호는 404 확인 |
| `POST /api/v1/notice` | ✅ **(2026-09-09 STEP 7에서 근본 해결)** | JPA 전환하며 `isAdmin()`을 `EmployeeDao` 기반으로 재구현 — STAFF 403, ADMIN 201 실제 확인 |
| `PUT /api/v1/notice/{no}` | ✅ **(2026-09-09)** | STAFF 403, ADMIN 200 실제 확인 |
| `DELETE /api/v1/notice/{no}` | ✅ **(2026-09-09)** | STAFF 403, ADMIN 200 + 삭제 후 404 확인, 존재하지 않는 번호 삭제 시 400 확인 |

MyBatis(`NoticeDao`, `notice-mapper.xml`) 완전 제거, `NoticeController`/`noticeApi.js`는 코드 변경 없이 그대로 동작(Service 인터페이스를 유지한 채 내부만 JPA로 교체).

## hub (`/hubs`) ↔ `hubApi.js`

| Method/Path | 상태 | 비고 |
|---|---|---|
| `GET /hubs`, `/hubs/search` | ✅ | |
| `POST /hubs/send` (AI 챗봇) | ✅ **(2026-09-09 수정 완료)** | 전역 `chatHistory` 필드를 요청 단위 지역 변수로 변경, 사용자 간 대화 혼입 버그 해결 |
| `POST /hubs`, `PUT /hubs/{no}`, `DELETE /hubs/{no}` | ✅ **(2026-09-09 수정 완료)** `hasRole("ADMIN")`로 전환, 실제 STAFF/MANAGER/ADMIN 토큰으로 테스트해 정상 차단/허용 확인 |
| `GET /hubs/{no}` | ✅ | |

**🔴→✅ [2026-09-09, STEP 8 배포 중 발견] 배포환경 전용 API 경로 중복 버그**: `dashboard` 섹션과 동일한 원인(`hubApi.js`의 자체 `BASE_URL`을 axios 요청에도 그대로 사용)으로 프로덕션에서 `/workflow/workflow/hubs/...` 형태의 404가 발생. `<img src>` 조립용 절대경로 `BASE_URL`(export 유지)과 axios 요청 전용 상대경로 `RELATIVE_PATH`(신규)를 분리해 해결, EC2 재배포 후 실제 로그(`journalctl`)로 `/workflow/hubs/{no}` 정상 인증·응답 확인(PR #13, 커밋 `9b71b7f`).

## place (`/place`) ↔ `placeApi.js`

| Method/Path | 상태 | 비고 |
|---|---|---|
| 전체 CRUD | ✅ | `ROLE_ADMIN` 체크 정상(컨트롤러 레벨) |

## reservation (`/reservations`) ↔ `reservationApi.js`

| Method/Path | 상태 | 비고 |
|---|---|---|
| `GET /reservations/facilities` | 🔴 | 항상 빈 리스트(스텁), `Facility` 개념 자체 미설계 — DB_DESIGN.md 확인 필요 항목 4 |
| 나머지 CRUD | ✅ | |

## task — Backend Controller 자체 없음(Workcation쪽에 붙어있음), "업무 게시판" Frontend는 더미데이터

`taskApi.js` 파일 없음, `TaskListComponent.jsx`/`TaskDetailComponent.jsx`(독립된 "업무 게시판" 메뉴) 전부 더미데이터 — 미해결.

**✅ (2026-09-09 STEP 9) "내 워케이션" 경로는 실제로 완전히 동작함**: `PUT /workcation/task/{taskNo}`(`WorkcationApi.js`의 `saveTaskProgress`) + `GET /workcation/mydetail/{no}`가 실제 `Work`/`Task` 데이터를 다룬다. 이전에는 `work_plan` 텍스트를 매 요청마다 파싱해 요청마다 바뀌는 가짜 ID를 만들어 저장 자체가 불가능했던 것을, 신청 시점에 실제 `Work`/`Task` 로우를 생성하도록 근본 수정. `saveTaskProgress`가 `FormData`를 만들어놓고 실제로는 JSON 전송하던 버그도 함께 수정. `/workcation/mylist`, `/workcation/mydetail/:no` 라우팅 자체가 `App.jsx`에 빠져있던 것도 추가(BUG-009). 실제 브라우저로 로그인→업무 등록→진행률 저장→완료 처리까지 검증.

## attendance (`/attendance`) ↔ `dashboard/api/attendanceApi.js` — 신규 (2026-09-09 STEP 9)

| Method/Path | 상태 | 비고 |
|---|---|---|
| `POST /attendance/check` | ✅ **신규 구현 및 실제 테스트 완료** | 출퇴근 위치 인증 기록 저장. 본인 소유 워케이션 여부, 승인 상태(`A`), IN 없이 OUT 시도(또는 중복 IN) 서버 검증, 지각 여부(9:10 기준) 서버 계산·저장. `LocationCheckModal.jsx`(GPS/Haversine 거리/Kakao 지도는 기존에 이미 완성)를 실제로 호출하도록 `StaffComponent.jsx` 재작성(기존엔 `alert()`만 하는 완전한 목업). 첫 실제 테스트에서 응답에 사원 비밀번호 해시가 노출되는 보안 버그(`@JsonIgnore` 누락)를 발견해 즉시 수정. 로그인→출근→중복출근 거부→퇴근→대시보드 상태 토글까지 실제 API로 검증 |

## survey (`/survey`) ↔ `survey/api/surveyApi.js` — 신규 (2026-09-09 STEP 9, TODO-001)

| Method/Path | 상태 | 비고 |
|---|---|---|
| `GET /survey/questions` | ✅ **신규 구현** | `question_order` 기준 정렬된 질문 목록(SCORE 4개 + TEXT 1개) |
| `GET /survey/status/{workcationNo}` | ✅ **신규 구현** | 본인 소유 여부/승인 상태/워케이션 종료 여부/기작성 여부를 확인해 작성 가능 여부(`available`)와 안내 메시지 반환 |
| `POST /survey` | ✅ **신규 구현 및 실제 테스트 완료** | 제출 시 위 4가지 조건 전부 재검증 + 모든 질문에 대한 답변 강제. 실제 제출 → DB 저장 확인 → 재조회 시 "이미 작성하셨습니다" 확인 → 중복 제출 서버 차단 확인 → ADMIN 대시보드 `avgSatisfaction` 통계 반영 확인 |

`SurveyQuestion`의 `question_order` 매핑 누락, `SurveyAnswer.score`가 primitive `int`라 TEXT형 답변까지 0점으로 잡혀 평균 만족도 통계를 왜곡할 수 있었던 잠재 버그를 함께 수정(`Integer`로 변경). 기존에 이미 있던 두 통계 쿼리(`HubDao.selectAvgScore`는 `answerValue`, `WorkcationDao.selectAvgSatisfaction`은 `score` 컬럼 참조)가 서로 다른 컬럼을 쓰고 있어, SCORE형 제출 시 두 컬럼에 동시 저장하도록 구현.

## dashboard (`/dashboard`) ↔ `dashboardApi.js`

전 구간 ✅ 정상 동작 확인. Notice 관련 위젯은 STEP 7에서 JPA 기반 `NoticeService`로 교체 완료(회귀 없음, 실제 `/dashboard/admin` 호출로 확인).

- **🔴→✅ [2026-09-09, STEP 8 배포 중 발견] 배포환경 전용 API 경로 중복 버그**: `dashboardApi.js`가 자체 `BASE_URL`을 `${API_BASE_URL}/dashboard`(절대/상대경로 모두 가능한 형태)로 만들어 `axiosInstance`(이미 `baseURL`을 가짐)에 전달 — 로컬 개발 기본값이 항상 절대 URL(`http://localhost:8006/workflow`)이라 axios가 그대로 이 URL을 우선 사용해 로컬에서는 드러나지 않았으나, 프로덕션 빌드에서 `VITE_API_BASE_URL=/workflow`(상대경로)를 쓰자 axios가 `baseURL`과 요청 URL을 그대로 이어붙여 `GET /workflow/workflow/dashboard/admin`(404)이 발생함. 실제 EC2 배포본에 로그인해 대시보드 로딩 실패로 재현·발견. `BASE_URL`을 상대경로(`/dashboard`)로 단순화해 해결, EC2 재배포 후 정상 로딩 확인(PR #13, 커밋 `9b71b7f`).

---

## Frontend 죽은 코드/고아 파일 (삭제 후보, 지침 14번에 따라 삭제 전 사용자 보고)

| 경로 | 상태 | 근거 |
|---|---|---|
| `workflow_project_fe/src/login/` | 고아 + 내부 깨짐 | 어디서도 import 안 됨, `../api/employeeApi` 참조하지만 해당 경로에 api 폴더 자체가 없음 |
| `workflow_project_fe/src/placeinfo/` | 고아 | 어디서도 import 안 됨, `placeinfoApi.js`는 포트 8001(오탈자)로 하드코딩 |
| `workflow_project_fe/src/place/api/recoApi.js` | 고아 | 파일 내용 0바이트, 아무도 import 안 함 |
| `workflow_project_fe/src/Amount/components/AmountPage.jsx` | 고아 추정 | App.jsx는 `pages/amount/AmountPage.jsx`(동명이인, 다른 파일)를 사용 |
| `workflow_project_fe/src/workcation/components/approval/components/ApprovalQueueDetail.jsx` | 고아 + 내부 깨짐 | 라우팅 안 됨, `../api/WorkcationApi` 참조하지만 해당 폴더엔 `ApprovalApi.js`만 존재 |
| `WorkFlow_Project_BE/src/main/java/com/kh/workflow/ai/*` (Controller/Service/VO) | 빈 스켈레톤 | 실제 AI 기능은 `HubController`에 구현되어 있고 이 패키지는 사용 안 됨 |
| `WorkFlow_Project_BE/.../task/model/service/TaskService.java` | 빈 클래스 | `@Service` 없음, 필드/메서드 없음, 아무도 참조 안 함 |
| `WorkFlow_Project_BE/.../amount/model/vo/AmountSupport.java` + `AmountSupportDao.java` | ✅ **삭제 완료(2026-09-09)** | 참조 0건 확인 후 삭제, DB_DESIGN.md 확인 필요 항목 2 참조 |
