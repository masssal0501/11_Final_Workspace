# PROJECT_STATUS.md

> **문서 역할**: 이 문서는 "도메인별 상세 구현 상태"를 기록한다. 전체 요약(Executive Summary)/우선순위 로드맵/최종 시연 시나리오/TOP 10 문제는 `PROJECT_FINAL_STATUS.md`(2026-09-10, 14차 작업)를 참조할 것.

마지막 갱신: 2026-09-10 (16차 작업 — WorkFlow ERP 전체 화면 UI/UX 구조 개선 완료: `common.css`의 `wf-container`/`wf-page-header`/`wf-badge`/`wf-state` 등 디자인 시스템을 전 도메인(사용자/공지/워케이션/업무/예약/비용·정산/대시보드)에 일관 적용, 크래시 버그 1건(`HubItemComponent`)·라우팅 경로 오류 3건(hub↔place 간 `navigate()` 불일치) 추가 발견·수정)

## 기술 스택 확정 상태

| 영역 | 현재 | 목표 |
|---|---|---|
| Backend Persistence | **JPA 통일 완료** (MyBatis 실사용 코드 0건, STEP 7 참조) | 완료 |
| Backend 컴파일 | ✅ `mvn compile`/`mvn package` BUILD SUCCESS (로컬 + GitHub Actions 러너 양쪽 확인) | 유지 |
| DB 기준 | `SQL/WorkFlow_Script.sql` (사용자 확정) | ✅ Entity 정렬 완료 + **AWS RDS에 실제 스키마 초기화 완료(22개 테이블)** |
| Frontend | React 19 + Vite 8 + Axios + React Router 7 | ✅ `npm run build` 로컬/CI 양쪽 정상 |
| 배포/CI-CD | ✅ **AWS EC2+RDS 실배포 완료, GitHub Actions CI/CD 파이프라인 실가동 검증 완료**(`Deploy` 브랜치 push → 자동 빌드·배포 성공, 2026-09-09) | 완료 — 다음은 기능 검증 |

## 도메인별 구현 상태

| 도메인 | Backend | Frontend | DB 정합성 | 비고 |
|---|---|---|---|---|
| 로그인/인증/JWT | ✅ 동작 | ✅ 동작 | ✅ | 1순위, 안정적 |
| 직원 관리 | ✅ 대부분 동작 | ✅ 대부분 동작 | ✅ | `POST /employees` 자가입 시 `authCode` 직접 전달 가능(권한상승 위험), 아이디/비번 찾기만 미구현 |
| 아이디/비밀번호 찾기 | ✅ **(2026-09-09 구현 완료)** `verification` 테이블 기반 2단계 인증코드 플로우(`POST /employees/password/reset/request`, `/verify`) 신규 구현 | ✅ **(2026-09-09)** `FindPWForm.jsx` 2단계 UI로 재작성, `employeeApi.js`의 `findEmployeeId`가 실제로 `POST /employees/findId`를 호출하도록 수정 | ✅ `verification` 테이블 그대로 사용 | 실제 DB/이메일 연동 테스트는 아직 못함(로컬 DB/SMTP 미구성) |
| 워케이션 신청/조회/수정/삭제 | ✅ 동작(단, 소유권 검사 없이 아무나 타인 워케이션 수정/삭제 가능) | ✅ 동작 | ⚠️ `approver_state` 기본값 이슈, **[확인 필요] 항목 1** | 2순위 |
| 워케이션 승인(부서장/관리자) | ✅ Backend는 MANAGER 허용 | ✅ **(2026-09-09 수정 완료)** 승인 라우트(App.jsx)를 ADMIN 전용→ADMIN·MANAGER 공용으로 변경, Header.jsx에 "승인 관리" 메뉴 신규 추가(+ 기존에 죽어있던 메뉴 role 필터링 로직도 함께 활성화, `rolse` 오타 수정) | ✅ | README 권한표(부서장=승인 가능)와 일치하도록 수정 완료 |
| 워케이션 취소 | ⚠️ `approver_state='C'` 하나로만 처리, 별도 취소사유/이력 없음 | ⚠️ 동일 | 상태값 자체는 SQL에 존재 | README 8번 섹션의 "취소요청→상급자검토" 별도 플로우는 없음. 별도 테이블 필요 여부는 향후 판단 (지금은 저비용으로 기존 구조 활용 가능해 보임) |
| 업무/업무진행(Task) | ✅ **(2026-09-09 STEP 9, 근본 해결)** `work_plan` 텍스트 파싱으로 매번 가짜 ID를 만들던 구조를 실제 `Work`/`Task` 로우 생성·조회로 재작성, `updateTask` 100% 시 `status='Y'` 자동 갱신 | ✅ **(2026-09-09 STEP 9)** `/workcation/mylist`, `/workcation/mydetail/:no` 라우팅 신규 추가, `saveTaskProgress` FormData 전송 버그 수정, 실제 브라우저 UI로 저장 검증 | ✅ (Task/TaskHistory는 SQL과 완전 일치) | **완료** — 실제 UI 클릭으로 진행률 40%→100% 저장·이력 반영 확인 |
| 출퇴근 인증(Attendance) | ✅ **(2026-09-09 STEP 9, 신규 구현)** `POST /attendance/check` — 소유권/승인상태/중복출근·퇴근 서버 검증, 지각여부 서버 계산 | ✅ **(2026-09-09 STEP 9)** `LocationCheckModal`을 실제 API에 연동(기존엔 alert()만 하는 목업) | ✅ 신규 테이블 `attendance` 추가 | **완료** — GPS 위치 인증 기반 출퇴근 기록, 응답에 사원 비밀번호 해시가 노출되던 보안 버그도 발견 즉시 수정 |
| 업무 첨부파일 | ⛔ `TaskFile` 엔티티가 잘못된 테이블/FK를 가리키는 고아 코드 | ⛔ 없음 | 🔴 **[확인 필요] 항목 3** | 후순위 |
| 거점(Hub) | ✅ 동작 (단, `/hubs/**` 전체 인증 없이 열려있음) | ✅ 동작 | ✅ | 보안 갭 있음 |
| 장소(Place) | ✅ 동작 (Hub 엔티티 재사용, ROLE_ADMIN 체크 있음) | ✅ 동작 | ✅ | `hub`와 중복 설계, 정리 필요성은 낮은 우선순위 |
| AI 추천 챗봇 | ✅ **(2026-09-09 수정 완료)** 전역 `chatHistory` 필드를 요청 단위 지역 변수로 변경 — 사용자 간 대화 혼입 버그 해결(단, 이번 대화 내에서의 멀티턴 문맥 기억 기능은 없음. 필요하면 별도 세션 저장 설계 필요) | ✅ 동작 | N/A | |
| 예약(Reservation) | ⚠️ 대부분 동작, `getAvailableFacilities`만 스텁 | ✅ 동작 | **[확인 필요] 항목 4** | |
| 비용 신청/승인/정산 | ✅ **(2026-09-09)** 목록조회 스텁 해결 + Entity를 SQL에 정렬 + `/error` 보안 버그 수정 + Jackson 순환참조 버그 수정, **실제 로컬 DB로 전체 흐름 end-to-end 검증 완료**. **(STEP 11)** `AdminAmountPage.jsx`의 죽은 `workcationNo={1}` prop 제거 | ✅ **(2026-09-09)** `AmountForm.jsx` FormData 방식으로 재작성, 실제 API 테스트로 정상 저장/파일첨부/itemList/supportList 바인딩 전부 확인 | ✅ 완료 | 4순위 — **완료**. ⚠️ **STEP 9 추가 발견**: BUG-012(`AmountForm`이 `?workcationNo=` 쿼리스트링을 안 읽어 STAFF가 실제 화면에서 비용신청 자체를 제출 못했음)/BUG-013(ADMIN 승인·반려·보류가 JSON 바디로 전송되는데 백엔드는 `@RequestParam`만 받아 항상 400) 둘 다 수정 완료, 실제 승인/반려 클릭 경로로 재검증 |
| 지원금(지자체) | ✅ **(2026-09-09)** 여러 지원처(1:N) 구조로 확정, `amount_list` SQL 재설계 완료(Java 코드는 원래도 1:N 구조라 무변경) | ✅ UI는 있음 | ✅ 완료 | |
| 공지사항 | ✅ **(2026-09-09 STEP 7 완료)** MyBatis→JPA 전환, isAdmin 버그 근본 해결, 대시보드 연동 포함 실제 DB로 전체 흐름 검증 | ✅ **(2026-09-09)** 관리자 등록/수정/삭제 버튼이 잘못된 로그인 정보 저장소를 참조해 실제 관리자도 클릭 불가였던 버그 발견·수정 | ✅ 완료 | 5순위 — **완료**. 조회수 증가·첨부파일은 원래도 미구현이었고 이번에도 그대로 포팅(결정 대기) |
| 대시보드(관리자/부서장/사원) | ✅ 동작 (Notice 조회 위해 MyBatis 의존 — Notice 전환 시 영향받음). **(STEP 11)** ADMIN `totalCost` 음수 계산 버그, `waitingList` 중복 표시 버그 수정 | ✅ 동작. **(STEP 11)** `ManagerComponent.jsx` 정산대기목록 `approverState`→`status` 필드 오류 수정 | ✅ | 6순위 |
| 설문(Survey) | ✅ **(2026-09-09 STEP 9, TODO-001 신규 구현)** `SurveyController`(`/survey/questions`, `/survey/status/{no}`, `POST /survey`) + Service/DAO 3종 신규. `question_order` 매핑 누락 수정, `SurveyAnswer.score`를 `Integer`로 변경(TEXT형 답변이 평균 만족도 통계를 왜곡하던 문제 예방) | ✅ **(2026-09-09 STEP 9)** `surveyApi.js`, `SurveyForm.jsx`, `/survey/:workcationNo` 라우트, 만족도조사 작성 버튼 신규 | ✅ 완료 | **완료** — Entity만 있고 Controller/Service/DAO/Frontend가 전혀 없던 상태에서 신규 구현, 실제 제출→통계 반영까지 검증 |

## 보안 점검 상태 (지침 10번)

| 항목 | 상태 |
|---|---|
| JWT 발급/검증 | ✅ 정상 동작 (`JwtUtil`, `JwtAuthenticationFilter`) |
| Role 기반 URL 인가 | ⚠️ 여전히 컨트롤러별 수동 체크(`place`)와 `SecurityConfig` 매처가 혼재하지만, 아래 5개 항목은 전부 `SecurityConfig` 레벨로 통일·정리 완료(`@PreAuthorize`는 여전히 미사용) |
| `/hubs/**` | ✅ **(2026-09-09 수정 및 실제 요청으로 검증 완료)** `GET`=인증 필요, `POST /hubs/send`(AI챗봇)=인증 필요, `POST/PUT/DELETE`(등록·수정·삭제)=`ADMIN` 전용으로 분리 |
| `/api/v1/amounts/**` GET | ✅ **(2026-09-09 수정 및 검증 완료)** 전체 `authenticated()`로 전환(role 제한 없음 — STAFF/MANAGER/ADMIN 모두 조회 가능) |
| `POST /employees` (직원 등록) | ✅ **(2026-09-09 수정 및 검증 완료)** `hasRole("ADMIN")`으로 전환. `WorkFlow_Script.sql` 시드 관리자 계정이 이미 있어 별도 부트스트랩 불필요 |
| `POST /approval/{workcationNo}` (반려) | ✅ **(2026-09-09 수정 및 검증 완료)** `hasAnyRole("ADMIN","MANAGER")`로 전환, STAFF는 403 |
| CORS | ✅ **(2026-09-09 정리 완료)** 중복·미사용이던 `WebConfig.java`(와일드카드 CORS, 다른 곳에서 참조 없음 확인 후 삭제) 제거, `SecurityConfig`의 CORS 설정만 유지. 실제 OPTIONS preflight/GET 요청으로 허용 오리진(`localhost:5173`)은 정상 통과, 비허용 오리진은 CORS 헤더 없이 차단됨을 확인 |
| `/error` 경로 인증 | 🔴→✅ **(2026-09-09 발견 및 수정)** `/error`가 permitAll이 아니어서 컨트롤러 예외 발생 시 실제 상태코드/메시지 대신 항상 빈 본문의 403이 반환되던 버그. 애플리케이션 전역 에러 응답에 영향 — permitAll 추가로 해결 |
| 인증 실패(401) vs 인가 실패(403) 구분 | 🔴→✅ **(2026-09-10 발견 및 수정)** 커스텀 `AuthenticationEntryPoint`/`AccessDeniedHandler`가 전혀 등록되어 있지 않아 Spring Security 기본 폴백(`Http403ForbiddenEntryPoint`)이 "JWT 없음/만료/위조"와 "권한 부족"을 구분 없이 전부 403으로 응답하던 버그. `JwtAuthenticationEntryPoint`(401)/`JwtAccessDeniedHandler`(403) 신규 추가 + `SecurityConfig.exceptionHandling()`에 연결해 해결. 실제 curl 요청으로 무토큰/위조토큰=401, STAFF의 ADMIN 전용 API 호출=403, 정상 인증=200을 각각 확인 |

**실제 검증 방법**: 로컬 MySQL에 STAFF/MANAGER/ADMIN 역할별 테스트 계정을 직접 시드(SQL)한 뒤 각각 실제 로그인 → JWT 발급 → 위 5개 항목의 엔드포인트를 전부 무인증/STAFF/MANAGER/ADMIN 4가지 조합으로 실제 호출해 상태코드를 확인(무인증은 전부 403, STAFF는 관리자 전용 엔드포인트에서 전부 403, MANAGER는 승인/반려까지만 통과, ADMIN은 전부 보안 계층 통과). 검증 후 테스트 계정은 삭제.

> 보안 정책 변경은 지침 10번대로 README 역할 정의(EMPLOYEE/MANAGER/ADMIN)를 기준으로 정리할 예정이며, 실제 변경 전 각 API별 접근 가능 역할표를 별도로 작성해 사용자 확인을 받을 예정.

## 완료된 작업 (WORK_LOG.md에 상세 기록)

- 2026-09-09 (1차): `WorkcationServiceImpl.taskHistoryDao` `@Autowired` 누락 수정 → `PUT /workcation/task/{taskNo}` NPE 해결
- 2026-09-09 (2차, STEP 6 나머지): DB_DESIGN.md [확인 필요] 항목 1,2,5,6 결정 반영(SQL+Entity), `AmountServiceImpl` 목록조회 스텁 2건 구현, `HubController` 전역 chatHistory 버그 수정, `verification` 기반 아이디/비밀번호 찾기 기능 신규 구현(백엔드+프론트), `employeeApi.js`의 `findEmployeeId` 오류 수정 — 매 단계 `mvn compile` BUILD SUCCESS 확인
- 2026-09-09 (8차, STEP 8 실행): AWS 리소스 실제 생성(사용자) + RDS 초기화(22개 테이블 확인) + EC2 최초 수동 배포 + GitHub Actions CI/CD 파이프라인 4가지 버그 수정 후 실가동 검증 완료 — 상세는 WORK_LOG.md 참조
- 2026-09-09 (9차, STEP 9): 워케이션 전체 라이프사이클(신청→승인→업무수행→정산→만족도조사) 실제 UI/API/DB 검증. 업무 진행률 기능 근본 재구현(가짜 ID 문제), 출퇴근 위치인증(attendance) 신규 구현(+응답의 비밀번호 해시 노출 보안버그 즉시 수정), 만족도조사(TODO-001) 신규 구현, ADMIN 정산승인이 UI로는 한 번도 성공한 적 없었음을 발견해 수정(BUG-012/013), 대시보드 500 에러(직원이 워케이션 2건 이상 보유 시) 수정 — 상세는 WORK_LOG.md 9차 작업 참조
- 2026-09-09 (10차): 운영 배포 준비 — `attendance` 테이블 DROP 누락 버그 수정, 운영 RDS용 별도 마이그레이션(`migration_add_attendance.sql`) + 시연용 2주치 더미데이터(`dummy_data.sql`) 작성 및 로컬 검증, `deploy.yml`에 DB 반영 스텝 임시 추가, ERD Cloud 스냅샷을 실제 export 형식(JSON)에 맞춰 재작성 — 상세는 WORK_LOG.md 10차 작업 참조. **`Deploy` 브랜치 push는 권한 정책으로 에이전트가 직접 실행하지 못해 사용자 실행 대기 중**
- 2026-09-09 (11차): STEP 9에서 발견해 미뤄뒀던 낮은 우선순위 버그 4건 수정 — ADMIN 대시보드 `totalCost` 음수 계산(`AmountDao.selectTotalCost()`의 JOIN 카티션 곱 + 이중 차감 버그), `waitingList` 중복 표시(`WorkcationDao.adminSelectWaitingList()`에 DISTINCT 누락), `ManagerComponent.jsx` 정산대기목록이 존재하지 않는 `approverState` 필드를 참조하던 버그(`status === 'R'`로 수정), `AdminAmountPage.jsx`의 죽은 `workcationNo={1}` prop 제거 — 로컬 MySQL 실데이터 + 실제 API 호출로 수정 전/후 값을 직접 대조 검증. 상세는 WORK_LOG.md 11차 작업 참조
- 2026-09-09 (13차): Swagger/OpenAPI 문서화 전체 적용 완료 — 상세는 WORK_LOG.md 13차 작업 참조
- 2026-09-10 (14차): WorkFlow ERP 종합 현황 문서(`PROJECT_FINAL_STATUS.md`) 신규 작성 — 상세는 WORK_LOG.md 14차 작업 참조
- 2026-09-10 (15차): 잘못된 경로/권한없는 URL 직접 접근 처리 + JWT 만료 자동 로그아웃 버그 수정 — Backend에 커스텀 `AuthenticationEntryPoint`(401)/`AccessDeniedHandler`(403) 신규 추가로 인증 실패와 인가 실패를 상태코드로 구분, `App.jsx`에 catch-all Route(`path="*"`) 추가로 존재하지 않는 URL/권한없는 URL 직접 접근 시 기존 `ErrorPage`로 이동, `axiosInstance.js`에 401(자동 로그아웃)/403(에러 페이지 이동) 응답 인터셉터 + JWT `exp` 클레임 기반 15초 주기 선제 만료 확인 추가. 로컬 백엔드(JWT 만료시간을 테스트 동안만 20초로 단축, 종료 후 원복) + 실제 브라우저(Claude Browser)로 8개 필수 테스트 시나리오 전부 실제 재현·검증. 상세는 WORK_LOG.md 15차 작업 참조
- 2026-09-10 (16차): WorkFlow ERP 전체 화면 UI/UX 구조 개선(이전 세션 rate-limit 중단 작업 이어받아 완료) — 이전 세션이 남긴 38개 파일(amount/dashboard/employee/notice/reservation/workcation/approval)에 이어 `taskboard`(업무 관리)/`hub`(거점)/`place`(지역 정보)/`pages/amount/StatisticsPage`(정산)/`survey`(만족도 조사) 5개 도메인 18개 파일에 `wf-container`/`wf-page-header`/`wf-badge`/`wf-state` 등 기확립된 디자인 시스템 컨벤션을 동일하게 적용. 구조 개선 중 실제 브라우저 검증으로 `HubItemComponent.jsx`의 화면 전체 크래시 버그(빈 이미지 배열 미방어)와 hub↔place 간 `navigate()` 경로 불일치 3건(`App.jsx`의 실제 라우트 `/workflow/place/**`와 불일치)을 발견해 함께 수정. `PlaceDetail.jsx`/`PlaceEdit.jsx`가 존재하지 않는 `localStorage.getItem("role")` 키를 참조해 지역 정보 수정 기능이 ADMIN 포함 전원 접근 불가 상태인 것도 발견했으나 권한 로직 변경은 범위 밖으로 판단해 TODO로만 기록. `npm run build` 최종 PASS. 상세는 WORK_LOG.md 16차 작업 참조

## 신규 확인 필요 항목 (이번 세션에서 새로 발견)

### 항목 7. `AmountForm.jsx` ↔ `POST /api/v1/amounts` 요청 포맷 불일치 — ✅ 해결 완료 (2026-09-09, A안)

**현재**
- 기존 구조: `AmountForm.jsx`는 중첩 객체(`itemList` 배열, `sponsor` 객체 등)를 가진 JSON을 `amountApi.createAmount(requestData)`로 보내려 함(해당 함수 자체가 없어 즉시 실패)
- 백엔드 `AmountController.createAmount`: `@ModelAttribute Amount amount` + `@RequestParam MultipartFile[] file`로 바인딩하는 `multipart/form-data` 방식을 기대(중첩 컬렉션은 `@ModelAttribute`로 자연스럽게 받기 어려움)
- `amountApi.js`의 기존 `insertAmount(formData)`는 `FormData` 객체를 그대로 전달하는 형태로 이미 작성되어 있음(즉, 백엔드 방식에 맞춰 작성된 함수가 이미 있음)

**충돌/문제**
단순히 `AmountForm.jsx`에서 `createAmount` 호출을 `insertAmount` 호출로 바꾸는 것만으로는 해결되지 않는다 — `requestData`(JSON, 중첩 객체)를 `FormData`(flat 필드 + 파일 파트)로 다시 조립하는 로직이 필요하고, `itemList`/`sponsor`처럼 중첩된 배열·객체를 `@ModelAttribute`가 인식하도록 폼 필드명 규칙(`itemList[0].itemType` 등)을 맞추거나, 아니면 백엔드를 JSON 수신 방식(`@RequestBody` + `@RequestPart`)으로 바꿔야 한다.

**선택지**
A. 프론트를 백엔드에 맞춤 — `AmountForm.jsx`의 제출 로직을 `FormData` 조립 방식으로 재작성(`itemList`/`sponsor`를 flat 필드로 풀어서 append)
B. 백엔드를 프론트에 맞춤 — `AmountController.createAmount`를 JSON 본문(`@RequestBody`) + 파일은 별도 `@RequestPart`로 받는 방식으로 변경(API 계약 변경)

**추천**: A
**이유**: 백엔드 API 계약을 바꾸면 `updateAmount`(PUT)도 동일 패턴이라 함께 바꿔야 하고 Swagger 문서/다른 클라이언트에도 영향이 크다. 반면 A는 프론트 한 파일(`AmountForm.jsx`)의 제출 로직만 다시 짜면 되고, 이미 정상 동작하는 `insertAmount`/`updateAmount`(`amountApi.js`)와 백엔드 컨트롤러 계약을 그대로 재사용할 수 있다.

**현재 가능한 작업**: 위 결정이 나기 전까지는 손대지 않음(자료/결정 필요). 나머지 비용신청 관련 기능(조회/승인/취소/통계)은 이미 정상 동작.

#### 처리 결과 (A안 적용)

`AmountForm.jsx`를 `FormData` 조립 방식으로 재작성하고, **실제로 로컬 MySQL(`SQL/WorkFlow_Script.sql`로 신규 구축)에 연결된 백엔드 인스턴스에 실제 HTTP 요청을 보내 end-to-end로 검증**했다 (JWT 로그인 → multipart 요청 → DB row까지 직접 SELECT로 확인). 이 과정에서 계획에 없던 버그 4건을 추가로 발견해 함께 수정했다:

1. **`SecurityConfig`에 `/error` 경로가 permitAll로 열려있지 않아, 컨트롤러에서 예외가 발생하면 실제 상태코드/메시지 대신 항상 빈 본문의 403이 반환됨.** 서블릿 컨테이너가 예외 발생 시 내부적으로 `GET /error`로 forward하는데, 이 경로가 `.anyRequest().authenticated()`에 걸려 익명 요청이 거부되면서 진짜 오류(400/401/404/500 등)가 전부 403으로 뒤덮임. **로그인 실패, 유효성 검증 실패 등 애플리케이션 전역의 모든 에러 응답에 영향을 미치는 심각한 버그**였음 — `/error`를 permitAll에 추가해 해결.
2. **`Amount`/`AmountItem`/`AmountFile`/`SupportList`의 양방향 연관관계에 Jackson 순환참조 방지 처리가 없어, `Amount`를 JSON으로 직접 반환하는 모든 엔드포인트(`POST /api/v1/amounts`, `GET /api/v1/amounts/{no}`, `GET /api/v1/amounts`, `GET /api/v1/amounts/workcation/{no}` 등)가 사실상 무한 순환 직렬화를 일으킴.** 실제 테스트에서 응답 본문이 수십만 자 이상으로 폭주하는 것을 확인. `AmountItem`/`AmountFile`/`SupportList`의 `amount`(부모 참조) 필드에 `@JsonIgnore` 추가로 해결.
3. **`SupportList.java`의 `@Table`이 항목 5(SupportList 1:N 확정) 처리 시 `amount_list`로 바꾸는 것을 빠뜨려 여전히 존재하지 않는 `support_list`를 가리키고 있었음** — 실제 요청을 보내보고 나서야 `Table 'workflow.support_list' doesn't exist` 오류로 발견. `@Table(name = "amount_list")`로 수정.
4. **`AmountDetail.jsx`/`StatisticsPage.jsx`가 서버 응답의 실제 필드명(`itemType`, `itemAmount`)이 아니라 예전 스키마 시절 필드명(`amountamountitemType`, `amount`)을 읽고 있어 비용 항목 유형/금액 표시가 계속 깨져 있었음** (같은 근본 원인이 read 경로에도 남아있던 사례) — 실제 필드명으로 수정.

#### 검증 결과 (사용자 체크리스트 기준)
- Backend compile: **PASS**
- Frontend build (`npm run build`): **PASS** (경고만 있음, 청크 크기 관련 — 기능과 무관)
- 실제 비용신청 API 요청 테스트: **PASS** — 로컬 MySQL(`workflow` 스키마, `WorkFlow_Script.sql`로 신규 구축) + 별도 격리된 백엔드 인스턴스에 대해 JWT 로그인 후 `POST /api/v1/amounts`에 `AmountForm.jsx`가 실제로 보낼 것과 동일한 구조의 multipart 요청 전송 → `201 Created`, 깨끗한 JSON 응답 확인
- 정상 저장 여부: **PASS** — `amount`/`amount_item`/`amount_list`/`amount_file` 4개 테이블에 직접 SELECT로 FK까지 일치하는 row 확인 후 테스트 데이터 정리
- 파일 첨부 여부: **PASS** — PNG 테스트 파일이 `amount_file`에 정상 저장, `origin_name`/`change_name`/`status` 모두 일치
- itemList 정상 바인딩 여부: **PASS** — `itemList[0].itemType`/`itemAmount`/`itemDate`/`itemDescription` 모두 Spring의 인덱스 표기법으로 정상 바인딩됨
- sponsor(supportList) 정상 바인딩 여부: **PASS** — `supportList[0].*` 필드 전부 정상 바인딩, 신규 1:N 구조로 저장됨

> 참고: 로컬 MySQL이 이미 `localhost:3306`에 떠 있었고(`root`/`mysql`), `workflow` 스키마가 아직 없어서 `SQL/WorkFlow_Script.sql`로 새로 만들었습니다(기존 데이터 없음, 파괴적 작업 아님). 검증은 사용자가 이미 IDE로 띄워둔 8006 인스턴스를 건드리지 않기 위해 별도 포트(8007)의 격리된 인스턴스로 진행했고, 테스트로 만든 임시 직원/비용신청 데이터는 검증 후 삭제했습니다. 스키마 자체는 로컬 개발에 필요하므로 남겨두었습니다.

### 항목 8~12. 백엔드 보안 정책 정리 — ✅ 전부 해결 완료 (2026-09-09, A안)

`/hubs/**`, `POST /employees`, `POST /approval/{workcationNo}`, `/api/v1/amounts/**` GET, `WebConfig` CORS 중복 — 5개 항목 전부 A안 채택, `SecurityConfig.java` 수정 및 `WebConfig.java` 삭제로 반영. 상세 내용은 "보안 점검 상태" 표 및 `WORK_LOG.md` 5차 작업 참조. **로컬 MySQL에 STAFF/MANAGER/ADMIN 역할별 테스트 계정을 직접 시드해 4가지 인증 조합(무인증/STAFF/MANAGER/ADMIN) × 8개 엔드포인트를 실제로 호출해 전부 의도한 상태코드가 나오는지 확인**했고, CORS(허용/비허용 오리진) 및 Frontend build도 함께 검증함.

## 다음 단계

- DB_DESIGN.md [확인 필요] 항목 1,2,5,6 → 처리 완료
- **신규 항목 7**(AmountForm 요청 포맷) → ✅ 처리 완료 (A안, 실제 API 테스트로 검증)
- DB_DESIGN.md [확인 필요] 항목 3(TaskFile), 4의 facility 부분 → 계속 보류 중, 필요 시점에 재논의
- **신규 항목 8~12**(보안 정책 5건) → ✅ 처리 완료 (A안, 실제 4-역할 조합 테스트로 검증)
- **STEP 6 전체 완료**
- **STEP 7(Notice MyBatis→JPA 전환) 완료** — 실제 DB로 목록/상세/검색/등록/수정/삭제/권한/대시보드 연동까지 전부 검증, MyBatis 파일(`NoticeDao.java`, `notice-mapper.xml`) 삭제 완료. `mybatis-spring-boot-starter` 의존성/`mybatis.*` 설정 자체는 아직 pom.xml/application.properties에 남아있음(요청 범위 밖이라 유지, 필요 시 별도 정리 가능)
- **신규 확인 필요**: 조회수 증가 미구현, 첨부파일 미구현(둘 다 이번 전환 이전부터 없던 기능, 그대로 포팅함) — 완성 여부 결정 필요
- **STEP 8(AWS CI/CD 준비 + 실배포) 완료** — 설정 준비뿐 아니라 **AWS 리소스(EC2/RDS/S3/IAM)를 사용자가 실제로 생성**했고, RDS에 `SQL/WorkFlow_Script.sql` 초기화(22개 테이블 확인) 완료, EC2에 Nginx/systemd 구성 후 최초 수동 배포 성공, **GitHub Actions CI/CD 파이프라인을 실제로 여러 차례 구동해 발견된 4가지 버그(워크플로 `secrets`/`if:` 표현식 오류, `mvnw` 실행권한 누락, GitHub Secret에 예시 placeholder 값이 잘못 등록됨, SSM `--parameters` 인코딩으로 인한 개행 손상)를 모두 수정하고 `Deploy` 브랜치 push → 전체 파이프라인 자동 성공까지 확인**(상세: WORK_LOG.md 8차 작업). 최초 수동 배포 과정에서 `dashboardApi.js`/`hubApi.js`의 배포환경 API 경로 중복 버그(운영에서만 드러남)도 발견·수정(PR #13, 커밋 `9b71b7f`)
- **STEP 9(전체 라이프사이클 실제 검증) 완료** — 로컬 환경에서 신청부터 만족도조사까지 전 구간을 실제 UI/API/DB로 검증, 그 과정에서 발견한 모든 버그(BUG-009~013 포함) 수정 완료. 상세는 WORK_LOG.md 9차 작업 참조
- **STEP 10(운영 배포 준비 + 실배포) 완료** — `Deploy` 브랜치 push 완료, GitHub Actions 파이프라인 2회 연속 `Success` 확인(attendance 테이블 마이그레이션 + 2주치 더미데이터가 실제 운영 RDS에 반영됨). 배포 확인 후 `deploy.yml`의 DB 마이그레이션 스텝은 원상복구(제거) 완료
- **STEP 11(STEP 9 발견 낮은 우선순위 버그 4건 수정) 완료** — ADMIN 대시보드 `totalCost` 음수 계산, `waitingList` 중복 표시, `ManagerComponent.jsx` 정산대기목록 `approverState`→`status` 필드 오류, `AdminAmountPage.jsx`의 죽은 `workcationNo={1}` prop 전부 수정 및 로컬 MySQL 실데이터 + 실제 API 호출로 검증 완료. 상세는 WORK_LOG.md 11차 작업 참조
- **STEP 12(CSS 통일 세션 미룬 버그 4건 + 신규 리포트 1건, 총 5건) 완료** — `PlaceList.jsx` `useNavigate` import 누락, `ApprovalHistoryDetail.jsx` 정의되지 않은 setter 호출, `TaskStatusBadge.jsx`의 `getStatusInfoByProgress` 전역 `window.status` 참조 버그 수정. 미사용 디렉터리/파일 3건(`src/login/`, `src/placeinfo/`, `ApprovalQueueDetail.css`) 재확인 후 삭제. **신규 리포트**: `EmployeeEdit.jsx`(관리자 직원 정보 수정 화면)가 데이터 조회/저장 로직이 아예 없는 미구현 스텁이었던 것을 `EmployeeDetail.jsx` 패턴대로 실제 구현(조회/수정/역할·상태 변경/연락처 3분할 처리, 부서·직위는 백엔드 API 부재로 조회전용 처리). 검증 중 `employeeApi.js`의 `updateEmployeeRole` 요청 포맷 불일치(쿼리파라미터→JSON 본문) 및 백엔드 `depId`/`jobCode` 강제 덮어쓰기 문제를 실제 API 응답으로 추가 발견해 프론트 쪽에서 우회 수정. 로컬 MySQL + 격리된 백엔드 인스턴스(포트 8007) + 실제 브라우저로 전체 플로우 end-to-end 검증. 상세는 WORK_LOG.md 12차 작업 참조
- **STEP 13(Swagger/OpenAPI 문서화) 완료** — `SwaggerConfig`/`SecurityConfig`의 Swagger 관련 설정(JWT SecurityScheme, `/swagger-ui/**`·`/v3/api-docs/**` permitAll)이 이전 세션에서 이미 정상 완료되어 있음을 확인, 나머지 `NoticeController`/`PlaceController`/`ReservationController`/`WorkcationController`(총 29개 API)에 `@Tag`/`@Operation`/`@Parameter`/`@ApiResponses`/`@SecurityRequirement(name="JWT")` 문서화 완료. 실제 로컬 기동 후 `GET /workflow/swagger-ui/index.html`·`GET /workflow/v3/api-docs` 200 확인(59 paths/74 operations/11 태그), JWT 로그인 후 6개 핵심 도메인 GET API(직원/공지사항/거점/워케이션/승인/비용) 전부 200 확인. 남은 TODO였던 두 건(영문 태그 통일, 401/403 미분리)은 STEP 15에서 401/403 분리는 해결됨. 상세는 WORK_LOG.md 13차 작업 참조
- **STEP 14(WorkFlow ERP 종합 현황 문서화) 완료** — `PROJECT_FINAL_STATUS.md` 신규 작성(Executive Summary/우선순위 로드맵/최종 시연 시나리오/TOP 10 문제 등). 상세는 WORK_LOG.md 14차 작업 참조
- **STEP 15(잘못된 경로/권한없는 URL 접근 + JWT 만료 자동 로그아웃) 완료** — Frontend Route Guard(catch-all) + Backend Security(401/403 분리, `AuthenticationEntryPoint`/`AccessDeniedHandler` 신규) 양쪽 모두에서 방어, 실제 브라우저로 Test 1~8 전부 검증(+ 403은 로그아웃시키지 않고 에러 페이지로만 이동하는 것도 별도 확인). 상세는 WORK_LOG.md 15차 작업 참조
- **STEP 16(WorkFlow ERP 전체 화면 UI/UX 구조 개선) 완료** — 이전 세션 rate-limit 중단분(38개 파일)을 이어받아 `taskboard`/`hub`/`place`/`StatisticsPage`/`survey` 5개 도메인 18개 파일에 기확립된 `wf-*` 디자인 시스템 적용. 구조 개선 중 크래시 버그(`HubItemComponent.jsx`)와 라우팅 경로 오류 3건을 실제 브라우저 검증으로 발견·수정. `localStorage.getItem("role")` 권한 버그는 범위 밖으로 판단해 TODO 기록. 상세는 WORK_LOG.md 16차 작업 참조
- **다음 최우선 작업**: EC2/RDS 실배포 환경에서 위에서 로컬로 검증한 전체 플로우(신청→승인→업무수행→정산→만족도조사)를 실제 배포된 화면으로 재검증 — 아직 미실행. STEP 15에서 만든 Nginx 배포용 fallback/401·403 처리도 실배포 환경 재검증 필요(로컬에서는 확인 완료). 추가로 STEP 16에서 발견한 `PlaceDetail.jsx`/`PlaceEdit.jsx`의 `localStorage.getItem("role")` 권한 버그 수정 여부 결정 필요
- 낮은 우선순위 미해결 버그(신규 발견, STEP 11에서 함께 손대지 않음): `WorkcationDao.managerSelectWaitingList()`에 `adminSelectWaitingList()`와 동일한 JOIN 중복 버그 존재(부서장 대시보드 승인대기목록도 예약 2건 이상인 워케이션은 중복 표시될 수 있음) — 이번 버그 리포트 범위 밖이라 미수정
- 다음 작업 후보(우선순위 낮음): Kakao Maps JS 키 발급/적용, `WorkcationItemComponent.jsx` 지역 드롭다운 경로 버그 수정, `FileRenamePolicy.java`의 `getRealPath()` 리스크 해소, Gemini API 키 회전(git 히스토리 노출분)
