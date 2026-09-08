# API_STATUS.md

마지막 갱신: 2026-09-09

상태 기호: ✅ 정상 동작 확인 / 🔴 확실히 실패 / ⚠️ 동작하나 이슈 있음 / ⛔ 미구현
(2026-09-09부터 일부 항목은 코드 리뷰가 아니라 실제 로컬 MySQL + 격리된 백엔드 인스턴스에 대한 실제 HTTP 요청으로 검증됨 — 해당 항목에 "실제 테스트" 표기)

> ⚠️ **애플리케이션 전역에 영향을 준 버그 (2026-09-09 발견 및 수정)**: `SecurityConfig`에 `/error` 경로가 permitAll로 열려있지 않아, 컨트롤러에서 예외가 발생할 때마다(로그인 실패, 유효성 검증 실패, 존재하지 않는 리소스 조회 등 어떤 이유든) 실제 상태코드/에러 메시지 대신 **항상 빈 본문의 403**이 반환되고 있었다. 서블릿 컨테이너가 예외를 `/error`로 forward하는데 이 경로가 인증을 요구해 익명 요청이 거부되면서 벌어진 문제. 이 문서의 이전 버전에서 "✅ 정상"으로 표시했던 항목들도 실제로는 에러 케이스에서 전부 이 버그의 영향을 받고 있었을 것으로 추정된다(성공 케이스 자체는 영향 없음). `/error`를 permitAll에 추가해 해결 완료.

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
| `POST /approval/{no}` (반려) | ⚠️ | 역할 검사 없음(STAFF도 호출 가능) — 보안 갭 |

**Frontend 라우팅 갭**: 위 API들은 모두 정상 호출 가능하지만 `App.jsx`가 승인 관련 라우트(`/approval/*`)를 `authCode==="ADMIN"` 블록에만 배치해 부서장(MANAGER)은 화면 자체에 도달할 방법이 없음. README 권한표 위반 — 수정 후보 1순위.

## amount (`/api/v1/amounts`) ↔ `amountApi.js`

| Method/Path | 상태 | 비고 |
|---|---|---|
| `GET /api/v1/amounts` | ✅ **(2026-09-09 수정 완료)** | 이전엔 `AmountServiceImpl.selectAmountList`가 스텁(`return null`) → NPE → 500이었음. `AmountDao.findAllByOrderByCreatedAtDescAmountNoDesc`에 연결해 해결 |
| `POST /api/v1/amounts` | ✅ **(2026-09-09 수정 및 실제 테스트 완료)** | `AmountForm.jsx`를 FormData 조립 방식으로 재작성(`amountApi.insertAmount` 사용). 로컬 MySQL에 연결한 백엔드로 실제 multipart 요청을 보내 `201 Created` + `amount`/`amount_item`/`amount_list`/`amount_file` 4개 테이블 저장까지 직접 확인. 이 과정에서 Jackson 순환참조(`Amount`↔`AmountItem`/`AmountFile`/`SupportList`) 버그와 `SupportList` 테이블명 오류를 추가로 발견해 함께 수정 |
| `GET /api/v1/amounts/{no}` | ✅ **(2026-09-09 순환참조 버그 수정 확인)** | 실제 요청으로 재확인 — 수정 전에는 `Amount`↔자식 엔티티 간 Jackson 순환참조로 응답이 무한에 가깝게 폭주했음(`@JsonIgnore` 추가로 해결) |
| `GET /api/v1/amounts/workcation/{no}` | ✅ **(2026-09-09 수정 완료)** | 동일한 스텁 문제, `findByWorkcationNoOrderByCreatedAtDescAmountNoDesc`에 연결해 해결 |
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
| `POST /hubs/send` (AI 챗봇) | ✅ **(2026-09-09 수정 완료)** | 전역 `chatHistory` 필드를 요청 단위 지역 변수로 변경, 사용자 간 대화 혼입 버그 해결 |
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
| `WorkFlow_Project_BE/.../amount/model/vo/AmountSupport.java` + `AmountSupportDao.java` | ✅ **삭제 완료(2026-09-09)** | 참조 0건 확인 후 삭제, DB_DESIGN.md 확인 필요 항목 2 참조 |
