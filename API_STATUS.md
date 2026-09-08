# API_STATUS.md

마지막 갱신: 2026-09-09

상태 기호: ✅ 정상 동작 확인(코드 리뷰 기준, 실서버 미기동) / 🔴 확실히 실패(코드상 확정) / ⚠️ 동작하나 이슈 있음 / ⛔ 미구현

## employee (`/employees`) ↔ `employeeApi.js`

| Method/Path | Frontend 호출 | 상태 | 비고 |
|---|---|---|---|
| `POST /employees` | `createEmployee` | ✅ | `permitAll` — 보안 갭(authCode 직접 전달 가능) |
| `GET /employees/checkId` | `checkEmpIdDuplicate` | ✅ | |
| `POST /employees/login` | `login` | ✅ | |
| `POST /employees/logout` | `logout` | ✅ | 서버측 로직은 no-op(JWT라 세션 정리 불필요, 의도된 설계) |
| `PUT /employees/password` | `changePassword` | ✅ | |
| `GET /employees/{empNo}` | `getEmployee` | ✅ | |
| `PUT /employees/{empNo}` | `updateEmployee` | ✅ | |
| `PATCH /employees/{empNo}/status` | `updateEmployeeStatus` | ✅ | ADMIN 역할 제한 정상 |
| `GET /employees` | `getEmployeeList` | ✅ | |
| `POST /employees/findId` | (없음, `findEmployeeId`가 대신 `GET /employees` 호출) | 🔴 | **아이디 찾기 기능 자체가 백엔드 실제 엔드포인트와 연결 안 됨** — `employeeApi.js`의 `findEmployeeId`가 인자 무시하고 전체 목록 조회로 대체됨 |
| `PATCH /employees/{empNo}/role` | `updateEmployeeRole` | ✅ | ADMIN 역할 제한 정상 |
| (없음) | `FindPWForm.jsx` 버튼 | ⛔ | 백엔드 엔드포인트 자체가 없음(`verification`/메일 발송 로직 미연결) |

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
| `PUT /workcation/task/{taskNo}` | ✅ **(2026-09-09 수정 완료)** | 이전엔 `taskHistoryDao` DI 누락으로 100% NPE, `@Autowired` 추가로 해결 |

> `WorkcationApi.js`는 프로젝트에서 유일하게 중앙 `axiosInstance`를 쓰지 않고 raw axios + 수동 Bearer 헤더를 쓰는 파일 — 핵심 기능이라 우선순위 높게 통일 권장.

## approval (`/approval`) ↔ `ApprovalApi.js`

| Method/Path | 상태 | 비고 |
|---|---|---|
| `GET /approval/list` | ✅ | |
| `GET /approval/{no}` | ✅ | |
| `GET /approval/queue` | ✅ | STAFF 차단 정상 |
| `GET /approval/queue/{no}` | ✅ | |
| `POST /approval/{no}` (반려) | ⚠️ | 역할 검사 없음(STAFF도 호출 가능) — 보안 갭 |

**Frontend 라우팅 갭**: 위 API들은 모두 정상 호출 가능하지만 `App.jsx`가 승인 관련 라우트(`/approval/*`)를 `authCode==="ADMIN"` 블록에만 배치해 부서장(MANAGER)은 화면 자체에 도달할 방법이 없음. README 권한표 위반 — 수정 후보 1순위.

## amount (`/api/v1/amounts`) ↔ `amountApi.js`

| Method/Path | 상태 | 비고 |
|---|---|---|
| `GET /api/v1/amounts` | 🔴 | `AmountServiceImpl.selectAmountList`가 스텁(`return null`) → NPE → 500 |
| `POST /api/v1/amounts` | ⚠️ | 백엔드는 `insertAmount`도 스텁(`return 0`) — 정상 생성 안 됨. 프론트도 `createAmount` 함수 자체가 없어 이중으로 깨짐 |
| `GET /api/v1/amounts/{no}` | ✅ | |
| `GET /api/v1/amounts/workcation/{no}` | 🔴 | 동일하게 스텁 → 500 |
| `PUT /api/v1/amounts/{no}` | 미확인 | |
| `PATCH /api/v1/amounts/{no}/cancel` | ✅ | |
| `PATCH /api/v1/amounts/{no}/approval` | ✅ | |
| `PATCH /api/v1/amounts/{no}/approval/sponsor` | ⚠️ | DB_DESIGN.md [확인 필요] 항목 5(SupportList 구조) 영향권 |
| `PATCH /api/v1/amounts/{no}/items/{itemNo}/company-support` | ✅ | |
| `GET /api/v1/amounts/statistics` | ✅ | |
| `PATCH .../file/{fileNo}/delete` | ✅ | 프론트 `deleteFile`은 다른 URL 패턴(`/files/{fileNo}`)로 호출 — 경로 재확인 필요 |

**전부 `permitAll`** — 보안 갭.

## notice (`/api/v1/notice`) ↔ `noticeApi.js`

| Method/Path | 상태 | 비고 |
|---|---|---|
| `GET /api/v1/notice` | ✅ | |
| `GET /api/v1/notice/{no}` | ✅ | |
| `POST /api/v1/notice` | 🔴 | `isAdmin()` MyBatis 매퍼ID 불일치로 항상 500 |
| `PUT /api/v1/notice/{no}` | 🔴 | 동일 |
| `DELETE /api/v1/notice/{no}` | 🔴 | 동일 |

→ STEP 7(Notice JPA 전환)에서 근본 해결 예정(단순 오타 패치로 끝내지 않음 — DB_DESIGN.md 참조).

## hub (`/hubs`) ↔ `hubApi.js`

| Method/Path | 상태 | 비고 |
|---|---|---|
| `GET /hubs`, `/hubs/search` | ✅ | |
| `POST /hubs/send` (AI 챗봇) | ⚠️ | 전역 `chatHistory` 필드로 사용자 간 대화 혼입 버그 |
| `POST /hubs`, `PUT /hubs/{no}`, `DELETE /hubs/{no}` | 🔴 보안 | 인증 없이 호출 가능(`permitAll` + 컨트롤러 레벨 권한체크 없음) |
| `GET /hubs/{no}` | ✅ | |

## place (`/place`) ↔ `placeApi.js`

| Method/Path | 상태 | 비고 |
|---|---|---|
| 전체 CRUD | ✅ | `ROLE_ADMIN` 체크 정상(컨트롤러 레벨) |

## reservation (`/reservations`) ↔ `reservationApi.js`

| Method/Path | 상태 | 비고 |
|---|---|---|
| `GET /reservations/facilities` | 🔴 | 항상 빈 리스트(스텁), `Facility` 개념 자체 미설계 — DB_DESIGN.md 확인 필요 항목 4 |
| 나머지 CRUD | ✅ | |

## task — Backend Controller 자체 없음, Frontend 더미데이터

`taskApi.js` 파일 없음, `TaskListComponent.jsx`/`TaskDetailComponent.jsx` 전부 더미데이터. 실제 업무 관리는 `WorkcationApi.js`의 `saveTaskProgress`(`PUT /workcation/task/{taskNo}`) 하나로만 부분 연결.

## dashboard (`/dashboard`) ↔ `dashboardApi.js`

전 구간 ✅ 정상 동작 확인(코드 리뷰 기준). 단, Notice 관련 위젯이 MyBatis(`NoticeDao.selectNoticeList`)에 의존하므로 STEP 7 진행 시 회귀테스트 필요.

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
| `WorkFlow_Project_BE/.../amount/model/vo/AmountSupport.java` + `AmountSupportDao.java` | 고아 | DB_DESIGN.md 확인 필요 항목 2 참조 |
