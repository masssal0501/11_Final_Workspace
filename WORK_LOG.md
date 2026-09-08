# WORK_LOG.md

## 2026-09-09

### [작업 완료]

#### 작업 내용
- STEP 1~5: 프로젝트 전체 재분석(README, `SQL/WorkFlow_Script.sql` 원문 전체, Backend 전 모듈, Frontend 전 모듈) 및 `PROJECT_STATUS.md` / `DB_DESIGN.md` / `API_STATUS.md` 신규 작성
- STEP 4: MyBatis 사용 영역 전체 검색 완료 — `NoticeDao`, `NoticeServiceImpl`, `DashboardServiceImpl` 3개 파일로 범위 확정
- STEP 6: `WorkcationServiceImpl`의 `TaskHistoryDao` 필드에 `@Autowired` 누락 수정 (명확한 DI 버그, DB/API 계약 변경 없음)

#### 수정 이유
- `PUT /workcation/task/{taskNo}`(업무 진행률 저장) 호출 시 `taskHistoryDao`가 `null`로 남아 매 요청마다 `NullPointerException` 발생 확인(코드 리뷰로 확정). 순수 Spring 의존성 주입 누락이며 스키마/API 계약/권한 정책과 무관해 사용자 확인 없이 즉시 수정.

#### 변경 파일
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/workcation/model/service/WorkcationServiceImpl.java` (58번째 줄 `@Autowired` 추가)
- 신규: `PROJECT_STATUS.md`, `DB_DESIGN.md`, `API_STATUS.md`, `WORK_LOG.md` (본 파일)

#### 검증
- Backend compile: **PASS** (`./mvnw -o compile -DskipTests`, target/classes 강제 재생성 후 재확인, 98 source files, BUILD SUCCESS)
- Frontend build: 미실행 (`node_modules` 미설치 상태 확인, 설치 여부 사용자 확인 후 진행 예정)
- API test: 미실행 (서버 미기동, DB 미연결 상태 — 로컬 DB가 아직 구축되지 않음)

#### 현재 상태
- 백엔드 소스는 컴파일 가능한 정상 상태(원래도 컴파일 오류는 없었음 — 문제는 런타임 로직 버그들)
- `SQL/WorkFlow_Script.sql`을 DB 기준으로 확정하고 실제 Entity와 정밀 대조 완료. Amount/AmountItem/AmountFile/SupportList/TaskFile/SurveyQuestion/WorkcationInfo.approverState에서 총 6건의 구조적 불일치 확인(`DB_DESIGN.md`의 [확인 필요] 항목 1~6)
- 이전 서브에이전트 조사 단계에서 "task_history 테이블 없음", "task.progress 컬럼 없음"으로 잘못 보고되었던 부분을 `WorkFlow_Script.sql` 원문 직접 재확인으로 정정함 — 두 테이블/컬럼 모두 실제로는 존재하며 Entity와 완전히 일치함

#### 남은 문제
- DB_DESIGN.md [확인 필요] 항목 1~6 (사용자 답변 대기)
- Amount 목록조회 2종 500 오류(스텁 미구현) — Amount 테이블명 확정(항목 2) 후 처리 예정
- Notice 관리자 CRUD 3종 500 오류 — STEP 7(Notice MyBatis→JPA 전체 전환)에서 근본 해결 예정
- Hub AI 챗봇 전역 상태 공유 버그 — 스키마/API 무관, 다음 작업으로 즉시 착수 가능
- 부서장(MANAGER) 승인 화면 프론트 라우팅 누락 — README 권한표와 불일치, 스키마 무관, 다음 작업 후보
- `/hubs/**`, `/api/v1/amounts/**` 등 보안 정책 정리 — 역할별 접근표 작성 후 사용자 확인 예정
- Frontend `node_modules` 미설치 — 빌드 검증 아직 미실시

#### 사용자 확인 필요
- **있음** — `DB_DESIGN.md`의 [확인 필요] 항목 1~6 (Amount/AmountSupport 테이블 통합, SupportList 카디널리티, TaskFile 재설계 여부, facility/verification 신규 구현 범위, amount_file file_size 컬럼 추가 여부, approver_state 기본값)

---

## 2026-09-09 (2차 작업 — STEP 6 나머지)

### [작업 완료]

#### 작업 내용
사용자가 [확인 필요] 항목 1~6에 대해 전부 결정을 내려주어 다음을 반영:

1. `SQL/WorkFlow_Script.sql`: `workcation_info.approver_state` 기본값 `'R'`→`'W'` 변경(코멘트에 W 추가)
2. `SQL/WorkFlow_Script.sql`: `amount_list` 테이블을 1:N(별도 auto-increment PK `support_no`, `request_amount`/`approved_amount` 분리, `transport_supported`/`other_supported` 추가, `item_no` FK 제거)로 재설계, 인덱스 `idx_amount_list_amount` 추가
3. `Amount.java`: `@Table`을 `amount_support`→`amount`로 수정
4. `AmountSupport.java`/`AmountSupportDao.java`: 코드베이스 전체 참조 재확인(0건, 기존 grep 매치는 무관한 메서드명과의 우연한 문자열 일치였음 확인) 후 삭제
5. `AmountItem.java`: `itemAmount`의 `@Column`을 `item_amount`→`amount`로 수정(Java 필드명은 유지), SQL에 있던 `item_approved`/`item_approved_amount` 필드 신규 추가
6. `AmountFile.java`: PK `@Column`을 `amountfile_no`→`amountattachment_no`, 타임스탬프를 `created_at`→`updated_at`으로 수정(Java 필드명 모두 유지), `origin_name`/`change_name` 길이 255→225로 조정, `fileSize` 필드 삭제
7. `AmountServiceImpl.java`/`AmountController.java`: 삭제된 `fileSize`를 설정하던 2곳(`setFileSize(...)`) 제거
8. `AmountServiceImpl.java`: `selectAmountList(Pageable)`/`selectAmountListByWorkcationNo(int, Pageable)` 스텁(`return null`)을 `AmountDao`의 기존 JPA 메서드에 연결
9. `HubController.java`: 컨트롤러 필드였던 `chatHistory`(전역 공유, 사용자 간 대화 혼입 버그)를 `sendMessage()` 메서드 지역 변수로 변경, 미사용 `AssistantMessage` import 제거
10. 신규 구현 — `verification` 테이블 기반 아이디/비밀번호 찾기:
    - `Verification.java`(Entity), `VerificationDao.java`(Repository)
    - `PasswordResetRequest.java`, `PasswordResetVerifyRequest.java`(DTO)
    - `EmployeeService`/`EmployeeServiceImpl`: `requestPasswordReset`(인증번호 발송), `verifyPasswordResetCode`(인증번호 확인+임시비밀번호 발급) 구현
    - `MailService.java`: `sendVerificationCode(...)` 메서드 추가
    - `EmployeeController.java`: `POST /employees/password/reset/request`, `POST /employees/password/reset/verify` 신규 엔드포인트
    - `SecurityConfig.java`: 위 두 엔드포인트 `permitAll` 추가
    - Frontend: `employeeApi.js`에 `requestPasswordReset`/`verifyPasswordResetCode` 추가, **`findEmployeeId`의 실제 버그(인자 무시하고 `GET /employees` 호출)를 `POST /employees/findId` 호출로 수정**(원래 백엔드 `findId` 자체는 정상 구현되어 있었음 — 확인 후 발견), `FindPWForm.jsx`를 2단계(정보입력→인증번호확인) UI로 재작성(기존엔 버튼 핸들러 자체가 없는 정적 화면)

#### 수정 이유
사용자가 명시적으로 결정한 6개 항목을 반영했고, 그 결정을 실제로 적용하는 과정에서 원래 6개 항목에 포함되지 않았던 `amount_item`/`amount_file`의 컬럼명 불일치도 "SQL이 최종 기준"이라는 동일 원칙으로 함께 정리(항목 2, 6과 같은 성격의 문제라 판단, PROJECT_STATUS.md/DB_DESIGN.md에 그 근거를 명시). `AmountServiceImpl` 스텁, `HubController` 전역 상태 버그는 스키마/API 계약과 무관한 "명확한 버그"라 사용자 지시("나머지 스키마와 무관하게 명확한 버그 수정은 계속 진행해도 된다")에 따라 함께 처리.

#### 변경 파일
**SQL**
- `SQL/WorkFlow_Script.sql`

**Backend (수정)**
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/amount/model/vo/Amount.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/amount/model/vo/AmountItem.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/amount/model/vo/AmountFile.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/amount/model/service/AmountServiceImpl.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/amount/controller/AmountController.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/hub/controller/HubController.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/employee/model/dao/EmployeeDao.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/employee/model/service/EmployeeService.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/employee/model/service/EmployeeServiceImpl.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/employee/controller/EmployeeController.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/mail/MailService.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/config/SecurityConfig.java`

**Backend (신규)**
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/employee/model/vo/Verification.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/employee/model/dao/VerificationDao.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/employee/model/dto/PasswordResetRequest.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/employee/model/dto/PasswordResetVerifyRequest.java`

**Backend (삭제)**
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/amount/model/vo/AmountSupport.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/amount/dao/AmountSupportDao.java`

**Frontend (수정)**
- `workflow_project_fe/src/employee/api/employeeApi.js`
- `workflow_project_fe/src/employee/components/FindPWForm.jsx`

**문서**
- `PROJECT_STATUS.md`, `DB_DESIGN.md`, `API_STATUS.md`, `WORK_LOG.md`(본 파일)

#### 검증
- Backend compile: **PASS** (`./mvnw -o compile -DskipTests`, target/classes 강제 재생성하며 4단계에 걸쳐 재확인 — Amount 계열 변경 후 96개 소스, HubController 수정 후 96개, verification 기능 추가 후 100개 소스 모두 BUILD SUCCESS)
- Frontend build: 미실행 (`node_modules` 미설치 상태 지속, 설치 여부 사용자 확인 필요)
- API/DB 실연동 테스트: 미실행 (로컬 MySQL 미구축, SMTP 자격증명 미설정 — `verification` 이메일 발송 경로는 코드 리뷰 수준에서만 검증됨)

#### 현재 상태
- STEP 6에서 파악된 명확한 백엔드 버그(Amount 목록조회 2건, Task 진행률저장 NPE, Hub AI챗봇 전역상태, 아이디/비밀번호찾기 미구현)는 모두 해결
- DB_DESIGN.md [확인 필요] 항목 1,2,5,6 → 반영 완료, 항목 3(TaskFile)·4의 facility 부분은 계속 보류
- Amount/AmountItem/AmountFile Entity가 `SQL/WorkFlow_Script.sql`과 완전히 일치하도록 정렬됨

#### 남은 문제
- **신규 발견**: `AmountForm.jsx`의 비용신청 제출 기능은 여전히 깨져 있음 — `amountApi.createAmount` 함수가 없는 것뿐 아니라, 프론트가 만드는 JSON 요청 구조 자체가 백엔드의 `multipart/form-data` 바인딩 방식과 근본적으로 다름(PROJECT_STATUS.md 신규 항목 7로 기록, 결정 대기)
- Notice 관리자 CRUD 3종 500 오류 — STEP 7(Notice MyBatis→JPA 전체 전환)에서 처리 예정
- 부서장(MANAGER) 승인 화면 프론트 라우팅 누락 — 아직 미착수
- `/hubs/**`, `/api/v1/amounts/**` 등 보안 정책 정리 — 아직 미착수
- Frontend `node_modules` 미설치, 로컬 DB 미구축 — 실동작 검증 전부 보류 상태

#### 사용자 확인 필요
- **있음** — PROJECT_STATUS.md 신규 [확인 필요] 항목 7 (`AmountForm.jsx` ↔ 백엔드 요청 포맷을 어느 쪽에 맞출지)
- 그 외 결정 대기 없는 항목(부서장 승인 라우팅, 보안 정책 정리, STEP 7 Notice 전환)은 계속 진행 가능

---

## 2026-09-09 (3차 작업 — 항목 7 A안 적용 + 실제 API 검증)

### [작업 완료]

#### 작업 내용
사용자가 항목 7을 A안(프론트를 FormData 조립 방식으로 수정, 백엔드 계약 유지)으로 확정. 이를 구현하고 **로컬 MySQL에 실제로 `SQL/WorkFlow_Script.sql` 스키마를 구축한 뒤, JWT 로그인부터 실제 HTTP 요청, DB row 확인까지 end-to-end로 검증**했다. 이 과정에서 계획에 없던 버그 5건을 추가로 발견해 함께 수정했다.

1. **로컬 MySQL(`localhost:3306`, `root`/`mysql`) 확인** — 이미 서버는 떠 있었으나 `workflow` 스키마 자체가 존재하지 않아, `SQL/WorkFlow_Script.sql`을 그대로 실행해 신규 구축(기존 데이터 없어 파괴적 작업 아님)
2. **사용자가 이미 IDE로 띄워둔 8006 포트의 백엔드 인스턴스는 건드리지 않고**, 동일 클래스패스로 별도 포트(8007)에 격리된 테스트 인스턴스를 직접 `java` 명령으로 실행해 코드 변경사항을 즉시 반영·재기동하며 검증
3. **`AmountForm.jsx` 재작성**: 내부 상태 필드명 `amountamountitemType`(예전 스키마 잔재) → `itemType`으로 정리, `handleSubmit`을 JSON `requestData` 대신 `FormData` 조립 방식으로 전면 재작성 — `itemList[i].필드명`/`supportList[0].필드명` 형태의 Spring 인덱스 표기법으로 `@ModelAttribute` 바인딩에 맞춤. 응답에서 `amountNo`를 추출하도록 `onSuccess` 콜백도 수정
4. **`amountApi.js`**: `insertAmount`/`updateAmount`가 `Content-Type: multipart/form-data`를 boundary 없이 직접 지정해 요청이 깨지던 문제 발견 — `Content-Type: undefined`로 변경해 axios/브라우저가 boundary 포함 헤더를 자동 설정하도록 수정
5. **[신규 발견] `SecurityConfig`의 `/error` 미포함 버그**: 실제 로그인 테스트 중 `permitAll`로 선언된 `/employees/login`조차 403이 반환되는 것을 발견 → Spring Security DEBUG 로그로 원인 추적 → 컨트롤러 예외 발생 시 서블릿의 내부 `/error` forward가 인증 요구 규칙에 걸려 실제 오류 대신 빈 403이 반환되는 것이었음. `/error`를 permitAll에 추가해 해결 (애플리케이션 전역 에러 응답에 영향을 준 심각한 버그)
6. **[신규 발견] Jackson 순환참조 버그**: 위 버그를 고친 뒤 실제 비용신청 API를 테스트하자 응답 본문이 수십만 자로 폭주 — `Amount`↔`AmountItem`/`AmountFile`/`SupportList`의 양방향 연관관계에 순환참조 방지 처리가 없었던 것이 원인. 세 자식 엔티티의 `amount`(부모 역참조) 필드에 `@JsonIgnore` 추가로 해결. `Amount`를 반환하는 모든 엔드포인트(`POST/GET /api/v1/amounts`, `GET .../workcation/{no}`)에 영향
7. **[신규 발견] `SupportList.java` 테이블명 오류**: 위 버그를 고친 뒤 재테스트하자 `Table 'workflow.support_list' doesn't exist` — 지난 세션에서 결정 5(SupportList 1:N)를 반영할 때 SQL의 `amount_list` 테이블 구조는 재설계했지만 `SupportList.java`의 `@Table` 자체를 `support_list`→`amount_list`로 바꾸는 것을 빠뜨렸음(오탈자성 실수, 실제 요청을 보내보고 나서야 발견). `@Table(name="amount_list")`로 수정
8. **[신규 발견] `AmountDetail.jsx`/`StatisticsPage.jsx` 필드명 오류**: 실제 API 응답 필드명(`itemType`, `itemAmount`)을 확인하는 과정에서, 두 화면이 예전 스키마 시절 필드명(`amountamountitemType`, `item.amount`)을 읽고 있어 비용 항목 유형/금액 표시가 항상 깨져 있었던 것을 발견 — 실제 필드명으로 일괄 수정

#### 수정 이유
사용자가 명시적으로 요청한 검증 체크리스트(정상 저장/파일첨부/itemList·sponsor 바인딩 등)를 코드 리뷰만으로는 확인할 수 없다고 판단해, 실제 로컬 환경에서 end-to-end 테스트를 수행했다. 그 과정에서 드러난 버그들은 전부 "예상과 다르게 동작함을 실제로 관찰"해서 발견한 것이며, 전부 명확한 버그 수정(스키마/API 계약 변경 아님)이라 사용자 확인 없이 바로 수정했다.

#### 변경 파일
**Backend**
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/config/SecurityConfig.java` (`/error` permitAll 추가)
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/amount/model/vo/SupportList.java` (`@Table` 수정, `@JsonIgnore` 추가)
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/amount/model/vo/AmountItem.java` (`@JsonIgnore` 추가)
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/amount/model/vo/AmountFile.java` (`@JsonIgnore` 추가)

**Frontend**
- `workflow_project_fe/src/Amount/components/AmountForm.jsx` (FormData 재작성, 필드명 정리)
- `workflow_project_fe/src/Amount/api/amountApi.js` (Content-Type 수정)
- `workflow_project_fe/src/Amount/components/AmountDetail.jsx` (필드명 수정)
- `workflow_project_fe/src/pages/amount/StatisticsPage.jsx` (필드명 수정)

**문서**: `PROJECT_STATUS.md`, `DB_DESIGN.md`, `API_STATUS.md`, `WORK_LOG.md`(본 파일)

**로컬 환경 (git 추적 대상 아님)**: 로컬 MySQL `workflow` 스키마를 `SQL/WorkFlow_Script.sql`로 신규 구축(유지 — 로컬 개발에 필요). 테스트로 생성한 임시 직원(`claudetest01`)과 비용신청(`amount_no=3`) 데이터는 검증 후 삭제 완료.

#### 검증
- Backend compile: **PASS** (`mvn -o compile`, 강제 재컴파일)
- Frontend build: **PASS** (`npm run build`, 청크 크기 경고만 있음)
- 실제 API 요청 테스트: **PASS** — JWT 로그인 → `POST /api/v1/amounts` multipart 요청(itemList 1건 + supportList 1건 + 파일 1건) → `201 Created`, 정상 크기(883바이트)의 깨끗한 JSON 응답
- 정상 저장 여부: **PASS** — `amount`/`amount_item`/`amount_list`/`amount_file` 4개 테이블에 직접 SELECT로 확인, FK(`amount_no`) 전부 일치
- 파일 첨부 여부: **PASS** — `amount_file`에 origin_name/change_name/status 정상 저장
- itemList 바인딩: **PASS** — `itemType`/`itemAmount`/`itemDate`/`itemDescription` 전부 정상
- supportList(sponsor) 바인딩: **PASS** — `sponsorName`/`requestAmount`/`approvedAmount`/`paymentDate`/`status`/`remark`/`transportSupported`/`otherSupported` 전부 정상, 새 1:N 구조로 저장 확인
- `GET /api/v1/amounts/{no}`, `GET /api/v1/amounts/workcation/{no}?page=1` 재검증: **PASS** (순환참조 버그 수정 후 정상 크기 응답 확인)

#### 현재 상태
- PROJECT_STATUS.md 신규 항목 7 해결 완료. 비용신청(Amount) 기능은 신청→저장→조회 흐름이 실제 DB로 검증된 상태
- Notice, 부서장 승인 라우팅, 보안 정책 정리 등은 아직 미착수

#### 남은 문제
- `StatisticsPage.jsx`의 월별/부서별/항목별 통계(`item.amount ?? item.AMOUNT` 등 다중 fallback 패턴)는 `AmountDao`의 `getMonthlyStatistics()`/`getDeptStatistics()`/`getItemStatistics()`가 타입 없는 raw `Object`(JPQL tuple)를 반환하는 구조라 실제 직렬화 형태가 불확실함 — 이번 작업 범위 밖이라 손대지 않았으나, 통계 화면 자체가 깨져 있을 가능성이 있어 별도 확인이 필요할 수 있음
- Notice 관리자 CRUD 3종 500 오류 — STEP 7에서 처리 예정
- 부서장 승인 화면 라우팅, `/hubs`·`/api/v1/amounts` 보안 정책 정리 — 미착수

#### 사용자 확인 필요
- **없음** — 이번 작업분은 전부 명확한 버그 수정으로 판단해 바로 처리함. STEP 7(Notice MyBatis→JPA)로 진행 가능

---

## 2026-09-09 (4차 작업 — STEP 6 나머지: 부서장 승인 라우팅)

### [작업 완료]

#### 작업 내용
- `App.jsx`: `/approval/reject/:workcationNo`, `/approval/history`, `/approval/history/detail/:workcationNo`, `/approval/queue/list` 라우트를 `authCode === "ADMIN"` 전용 블록에서 분리해 `authCode === "ADMIN" || authCode === "MANAGER"` 조건으로 이동. 백엔드 `ApprovalController`는 원래부터 STAFF만 차단하고 MANAGER를 허용하고 있어, 프론트만 뒤늦게 맞춘 것.
- 승인 관련 4개 컴포넌트(`ApprovalQueueList`, `ApprovalReject`, `ApprovalHistoryList`, `ApprovalHistoryDetail`)를 확인한 결과 ADMIN 전용을 가정하는 하드코딩이 없어(전부 서버가 역할별로 스코프된 데이터를 내려주는 구조) 라우트만 열어도 안전하게 동작함을 확인.
- **[신규 발견]** `Header.jsx`의 내비게이션 메뉴가 `roles`/`children` 필드를 정의해두고도 실제 렌더링에서 전혀 사용하지 않고 있었음(모든 로그인 사용자에게 전체 메뉴가 그대로 노출되고, 하위 메뉴는 아예 렌더링되지 않음) — 라우트를 열어도 부서장이 실제로 찾아갈 메뉴 링크가 없었던 것. `menus.map()` 앞에 `roles` 기반 `.filter()`를 추가해 역할별 메뉴 노출을 실제로 동작하게 하고, "승인 관리"(ADMIN/MANAGER) 메뉴를 신규 추가. 겸사겸사 인접해 있던 `rolse` 오타(`roles`여야 함)도 수정.

#### 수정 이유
README 권한표("워케이션 승인 = 부서장 ✅")와 백엔드 코드가 이미 일치시켜둔 정책을 프론트엔드 라우팅만 반영하지 못하고 있던 명확한 버그. 메뉴 필터링 활성화는 라우트를 열어도 실제로 화면에 도달할 방법이 없다면 무의미하다고 판단해 같은 작업 단위로 함께 처리.

#### 변경 파일
- `workflow_project_fe/src/App.jsx`
- `workflow_project_fe/src/common/components/Header.jsx`

#### 검증
- Frontend build: **PASS** (`npm run build`)
- 백엔드/DB 변경 없음(프론트 전용 변경)

#### 현재 상태
- 부서장이 승인 대기 목록/이력 화면에 도달할 수 있는 라우트와 메뉴 링크 모두 마련됨

#### 남은 문제
- 메뉴 역할 필터링을 이번에 활성화하면서, 기존에 `roles` 없이(=모든 역할에 노출) 정의돼 있던 메뉴들의 노출 범위는 그대로 유지됨 — 예를 들어 "업무 관리"/"공지사항" 등은 원래도 role 제한이 없었으므로 동작 변화 없음. 다만 이 활성화로 인해 이전에는(버그로 인해) 모든 사용자에게 보이던 "직원 관리" 메뉴가 이제 ADMIN에게만 보이도록 **정상화**됨 — 의도된 개선이지만 사용자 눈에 띄는 변화이므로 기록.
- `/hubs/**`, `/api/v1/amounts/**` 등 백엔드 보안 정책 정리는 아직 미착수 — 별도로 확인 필요 항목을 정리해 보고 예정

---

## 2026-09-09 (5차 작업 — STEP 6 나머지: 보안 정책 정리, 항목 8~12)

### [작업 완료]

#### 작업 내용
사용자가 항목 8~12를 전부 A안으로 확정. `SecurityConfig.java`를 다음과 같이 수정:

1. **`/hubs/**`**: `permitAll` 일괄 제거 → `GET`은 `authenticated()`, `POST /hubs/send`(AI챗봇)는 `authenticated()`(모든 로그인 사용자), `POST /hubs`·`PUT /hubs/**`·`DELETE /hubs/**`(등록/수정/삭제)는 `hasRole("ADMIN")`으로 세분화
2. **`POST /employees`**: `permitAll` → `hasRole("ADMIN")`
3. **`POST /approval/*`**(반려): 신규 규칙 추가, `hasAnyRole("ADMIN","MANAGER")` (`GET /approval/queue`의 기존 컨트롤러 내부 STAFF 차단 정책과 동일한 효과를 보안 설정 레벨에도 반영)
4. **`GET /api/v1/amounts/**`**: 6개로 흩어져 있던 개별 `permitAll` 매처를 `authenticated()` 하나로 통합(동일 정책, 정리)
5. **`WebConfig.java`**: 전체 코드베이스에서 참조 여부 재검색(자기 자신 외 0건) 후 삭제

#### 수정 이유
사용자가 명시한 정책(README 역할 정의, 프론트가 이미 전제하던 관리자 전용 정책과 백엔드를 일치)을 그대로 반영. API URL/DTO/DB/Entity/JWT 구조/비즈니스 로직은 전혀 건드리지 않음(SecurityConfig의 접근 제어 규칙만 수정).

#### 변경 파일
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/config/SecurityConfig.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/config/WebConfig.java` (삭제)

#### 검증 (사용자 체크리스트 전체 실제 테스트로 확인)
- Backend compile: **PASS**
- 로컬 MySQL에 STAFF/MANAGER/ADMIN 역할별 테스트 계정을 SQL로 직접 시드(`POST /employees`가 이제 ADMIN 전용이라 API로는 부트스트랩 불가) → 각각 실제 로그인해 JWT 획득
- **무인증 호출**: `/hubs`, `/hubs/send`, `/hubs`(POST), `/hubs/1`(PUT/DELETE), `/api/v1/amounts`, `/employees`(POST), `/approval/1`(POST) 전부 **403** 확인
- **STAFF 호출**: `GET /hubs`=200, `POST /hubs/send`=400(보안 통과, 바디 누락으로 인한 정상적인 검증 실패), `POST/PUT/DELETE /hubs`=403, `GET /api/v1/amounts`=200, `POST /employees`=403, `POST /approval/1`=403 — 전부 기대대로
- **MANAGER 호출**: `GET /hubs`=200, `POST /hubs`=403(관리자 전용 유지 확인), `GET /api/v1/amounts`=200, `POST /employees`=403, `POST /approval/1`=500(보안 통과 후 비즈니스 로직에서 실패 — 403이 아님을 확인해 보안계층 통과를 검증)
- **ADMIN 호출**: `GET /hubs`=200, `POST/PUT /hubs`=415(보안 통과, multipart 바디 미전송으로 인한 정상적인 미디어타입 오류), `DELETE /hubs/999999`=200, `GET /api/v1/amounts`=200, `POST /employees`=400(보안 통과, 필수값 누락), `POST /approval/1`=500(보안 통과) — 전부 기대대로
- **CORS**: `Origin: http://localhost:5173`(허용) → preflight/실제 요청 모두 `Access-Control-Allow-Origin` 정상 반환. `Origin: http://evil.example.com`(비허용) → 403, CORS 허용 헤더 없음 확인. `WebConfig.java` 삭제가 CORS 동작에 영향 없음을 확인
- Frontend build: **PASS** (`npm run build`) — 백엔드 계약 자체는 안 바꿨고 앱이 항상 로그인 후에만 이 API들을 호출하므로 프론트 동작에 영향 없음
- 테스트로 만든 STAFF/MANAGER/ADMIN 계정은 검증 후 전부 삭제, 격리된 테스트 백엔드 인스턴스도 종료(사용자의 8006 인스턴스는 미접촉)

#### 현재 상태
- DB_DESIGN.md/PROJECT_STATUS.md [확인 필요] 항목 8~12 전부 반영 완료
- STEP 6에서 파악된 항목 전부(라우팅 복구 포함) 처리 완료

#### 남은 문제
- Role 기반 인가가 여전히 `SecurityConfig` 매처와 컨트롤러 내부 수동 체크(`place`, `notice` 등)에 혼재 — `@PreAuthorize` 등으로 통일하는 것은 더 큰 리팩토링이라 이번 범위 밖
- `StatisticsPage.jsx` 통계 데이터 형태 불확실 이슈는 여전히 미확인 상태

#### 사용자 확인 필요
- **없음** — STEP 6 전체 항목 처리 완료. STEP 7(Notice MyBatis→JPA)로 진행 가능

---

## 2026-09-09 (6차 작업 — STEP 7: Notice MyBatis → JPA 전환)

### [작업 완료]

#### 작업 내용
Notice 전체 구조(Entity/DTO/Controller/Service/DAO/mapper.xml/파일업로드/Security/Frontend API/화면/SQL)를 먼저 전부 읽고 분석한 뒤 JPA로 전환:

1. **`Notice.java`**: 순수 POJO → `@Entity`. `emp_no`는 관계매핑 대신 plain FK 컬럼 + `@Transient empName`(서비스에서 채움) 유지(Amount 계열과 동일 컨벤션). `createdAt`을 `java.sql.Timestamp`→`LocalDateTime`으로 정규화(코드베이스 컨벤션 통일, JSON은 여전히 ISO-8601이라 프론트 영향 없음). `fileList`(`@OneToMany`)는 응답 형태 유지를 위해 구조만 추가.
2. **`NoticeFile.java`**: 순수 POJO → `@Entity`, `Notice`에 대한 `@ManyToOne` + `@JsonIgnore`(Amount 계열과 동일하게 순환참조 방지).
3. **`NoticeRepository.java`**(신규, `notice.dao` 패키지): `JpaRepository<Notice,Integer>` + 목록/검색용 `@Query` 5개(전체/제목/내용/작성자/제목+내용, 전부 `notice_status <> 'UNVISIBLE'` + IMPORTANT 우선 정렬 유지). Spring Data derived query로 표현 불가능한 조건부 정렬(CASE WHEN)만 JPQL `@Query`로 처리 — 우선순위 원칙대로 가장 단순한 방식 사용.
4. **`NoticeServiceImpl.java`**: 내부 구현을 `NoticeRepository`+`EmployeeDao` 기반으로 재작성. **`NoticeService` 인터페이스는 시그니처 하나도 바꾸지 않아 `NoticeController.java`는 코드 변경이 전혀 필요 없었음.** `isAdmin()`/`selectEmpNoByLoginId()`는 `EmployeeDao.findByEmpId()` 기반으로 재구현 — 기존 MyBatis 매퍼 ID 불일치 버그(`noticeMapper.isAdmin` vs 실제 정의 `selectIsAdminByLoginId`)가 원천적으로 해결됨.
5. **`DashboardServiceImpl.java`**: `NoticeDao`+`SqlSessionTemplate` 필드를 `NoticeService`로 교체, 3개 호출부(admin/manager/staff 대시보드) 수정.
6. **[신규 발견, Notice 모듈 자체 파일이라 범위 내로 판단해 수정]** `NoticeDetail.jsx`/`NoticeInsert.jsx`/`NoticeList.jsx`가 앱 전역 로그인 저장 방식(`localStorage`의 `user.authCode`)이 아니라 아무 데서도 설정되지 않는 `sessionStorage`의 `loginMember.role==='S'`를 참조하고 있어, **실제 관리자로 로그인해도 공지 등록/수정/삭제가 전혀 동작하지 않던 버그**를 발견 — `localStorage`/`authCode==='ADMIN'` 기준으로 통일. `NoticeDetail.jsx`의 `handleUpdate`가 주석 처리된 채로 JSX에서 참조되고 있던 것도 복원.
7. **검증 완료 후** `NoticeDao.java`(MyBatis), `notice-mapper.xml` 삭제(참조 0건 재확인 후).

#### 수정 이유
사용자가 명시한 진행 순서(분석 → JPA 구현 → 동일 동작 확인 → 참조 0건 재확인 → 삭제)를 그대로 따름. 프론트 관리자 권한 버그는 "일반 사용자 권한"/"관리자 권한" 실제 검증이라는 완료 조건을 충족하려면 반드시 고쳐야 했던 항목(Notice 모듈 자체 파일, 스키마/API 계약과 무관한 순수 버그).

#### 변경 파일
**Backend (수정)**: `Notice.java`, `NoticeFile.java`, `NoticeServiceImpl.java`, `DashboardServiceImpl.java`
**Backend (신규)**: `NoticeRepository.java`
**Backend (삭제)**: `NoticeDao.java`, `notice-mapper.xml`
**Frontend (수정)**: `NoticeDetail.jsx`, `NoticeInsert.jsx`, `NoticeList.jsx`
**문서**: `PROJECT_STATUS.md`, `DB_DESIGN.md`, `API_STATUS.md`, `WORK_LOG.md`(본 파일)

#### 검증 (전부 실제 로컬 DB + 격리된 백엔드 인스턴스로 실제 API 호출)
- Backend compile: **PASS**(JPA 전환 직후, MyBatis 파일 삭제 후 각각 재확인)
- Frontend build: **PASS**(`npm run build`, 프론트 수정 후·최종 각각 재확인)
- STAFF/ADMIN 테스트 계정을 SQL로 시드해 실제 로그인 → JWT 획득 후:
  - 목록 조회(빈 목록/검색어 없음) PASS
  - 등록: STAFF 403 확인 → ADMIN 201 확인(각각 실제 DB row 생성 확인)
  - 검색: 제목/내용/작성자 조건 전부 실제 키워드로 확인, UNVISIBLE 공지는 검색에서도 제외됨을 확인
  - 목록 정렬: IMPORTANT 우선 + 최신순 확인
  - 상세 조회: 정상 필드 + 존재하지 않는 번호 404 확인
  - 수정: STAFF 403 → ADMIN 200, 실제 반영 확인(제목/내용/상태만 변경되고 작성일/작성자는 유지되는 것까지 원본 SQL 동작과 일치)
  - 삭제: STAFF 403 → ADMIN 200 → 삭제 후 404 확인, 존재하지 않는 번호 삭제 시 400 확인
  - **대시보드 연동**: `/dashboard/admin` 실제 호출로 `noticeData`가 정상 반환됨을 확인(DashboardServiceImpl 수정이 실제로 동작함을 검증)
  - MyBatis 파일 삭제 후 위 전체 흐름 재검증 — 전부 동일하게 PASS
- 참조 검색: `NoticeDao`/`notice-mapper.xml`/`noticeMapper` 전체 코드베이스 재검색 결과 자기 자신 외 0건 확인 후 삭제
- 테스트 계정/데이터는 매 검증 후 삭제, 격리된 테스트 인스턴스도 종료(사용자의 8006 인스턴스는 미접촉)

#### 현재 상태
- Notice 기능이 100% JPA 기반으로 동작하며, 기존 API URL/Request/Response 구조는 전혀 변경되지 않음
- 이전부터 있던 관리자 확인 로직 버그(글쓰기 3종 500 에러)가 근본적으로 해결됨
- 실제 관리자로도 등록/수정/삭제가 안 되던 프론트 버그도 함께 해결되어 기능이 실사용 가능한 상태가 됨

#### 남은 문제
- 조회수(view_count) 증가 로직 미구현 — 원래도 없던 기능, 이번에도 추가하지 않고 그대로 포팅(결정 필요 시 별도 작업)
- 공지사항 첨부파일 저장 로직 미구현 — 원래도 없던 기능(controller가 파일을 받기만 하고 저장 안 함), `NoticeFile` 엔티티/관계는 구조만 준비됨(결정 필요 시 별도 작업)
- `mybatis-spring-boot-starter` 의존성, `application.properties`의 `mybatis.*` 설정은 아직 미제거(요청 범위 밖으로 판단해 유지)
- `/api/v1/notice/**`의 SecurityConfig `permitAll` 정책은 이번 작업 범위가 아니라 그대로 둠(관리자 확인은 여전히 컨트롤러 내부 `isAdmin()` 체크로만 이루어짐)

#### 사용자 확인 필요
- **있음** — 조회수 증가, 첨부파일 기능을 이번에 추가로 구현할지 여부만 결정 필요. 그 외에는 STEP 7 완료.

---

## 2026-09-09 (7차 작업 — STEP 8: AWS CI/CD 준비)

### [작업 완료]

#### 작업 내용
AWS 리소스는 생성하지 않고, 배포 가능한 상태를 만들기 위한 설정/코드만 준비. 분석 과정에서 발견한 배포 차단 요소(하드코딩된 시크릿·CORS·업로드 경로·API URL)를 함께 정리.

**1. 분석 결과 (실제 코드 기준)**
- Backend: `./mvnw clean package -DskipTests` → `target/WorkFlow_Project_BE-0.0.1-SNAPSHOT.jar` (실제로 `mvn package` 실행해 92.8MB 실행 가능 JAR 생성까지 확인)
- Frontend: `npm ci && npm run build` → `dist/`
- context-path=`/workflow`, port=`8006` (기존 설정 유지)
- 하드코딩된 시크릿 발견: DB 비밀번호, **Gemini API 키(실제 유효해 보이는 값이 git에 커밋되어 있었음)**, JWT secret
- CORS 설정이 `SecurityConfig` 하나가 아니라 **5개 컨트롤러**(`AmountController`, `WorkcationController`, `DashboardController`, `ApprovalController`, `HubController`)에 개별 `@CrossOrigin`으로 흩어져 있었고, 그중 3개는 사실상 와일드카드(`*`) 허용 — SecurityConfig의 제한적 CORS를 무력화할 수 있는 상태였음
- 파일 업로드 경로가 `C:/upload/receipts/`로 하드코딩(Windows 전용, Linux EC2에서 그대로 쓰면 안 됨)
- 프론트 API base URL이 `axiosInstance.js`(공용) 외에 `dashboardApi.js`/`hubApi.js`가 각자 `http://localhost:8006/workflow`를 하드코딩해 axiosInstance의 baseURL을 무시하고 있었음(절대경로 URL은 baseURL을 덮어씀), `WorkcationItemComponent.jsx`도 별도로 하드코딩
- Kakao Maps 키가 `App.jsx`에 하드코딩
- `.github/workflows`, Docker 관련 파일, 기존 AWS 설정 전부 없음(신규 구축)

**2. Backend 수정**
- `application.properties`: 시크릿 전부 `${ENV_VAR:로컬기본값}` 형태로 전환(DB 비밀번호/JWT secret/Gemini 키). 사용되지 않던 `file.upload-dir` 속성 삭제(코드에서 참조하는 곳이 없던 죽은 설정)
- `application-prod.properties`(신규): `SPRING_PROFILES_ACTIVE=prod`로 활성화되는 운영 프로필. 시크릿에 기본값을 두지 않아 환경변수 누락 시 조용히 로컬값으로 뜨는 사고를 방지
- `SecurityConfig.java`: CORS 허용 origin을 `app.cors.allowed-origins` 프로퍼티(콤마 구분, 환경변수 `CORS_ALLOWED_ORIGINS`)로 외부화
- `AmountController`/`WorkcationController`/`DashboardController`/`ApprovalController`/`HubController`: 개별 `@CrossOrigin`(3개는 사실상 와일드카드) 전부 제거, `SecurityConfig` 하나로 중앙화
- `AmountController`/`AmountServiceImpl`: `UPLOAD_DIR` 하드코딩 → `@Value("${app.upload.receipts-dir:...}")`로 전환(환경변수: `APP_UPLOAD_RECEIPTS_DIR`)

**3. Frontend 수정**
- `axiosInstance.js`, `dashboardApi.js`, `hubApi.js`, `WorkcationItemComponent.jsx`: 하드코딩된 `http://localhost:8006/workflow`를 `import.meta.env.VITE_API_BASE_URL`(로컬 기본값 유지)로 전환. 실제 빌드 시 env 주입이 번들에 정상 반영되는지 직접 빌드해 확인
- `App.jsx`: Kakao 키를 `import.meta.env.VITE_KAKAO_APP_KEY`로 전환
- `.env.example`(신규): 로컬 개발용 환경변수 템플릿

**4. 배포 설정 파일 (신규)**
- `.github/workflows/deploy.yml`: `Deploy` 브랜치 push 트리거, JDK21+Maven 빌드 → Node22+npm 빌드 → **AWS Access Key/Secret Key 인증(OIDC 미사용)** → S3에 산출물 업로드 → **AWS SSM(RunShellScript)으로 EC2에서 배포 스크립트 실행(SSH 미사용)** → SSM 명령 결과 검증(stdout/stderr 로그 출력, 실패 시 파이프라인 실패 처리) → (선택) 외부 스모크 테스트
- `deploy/scripts/remote-deploy.sh`: EC2에서 실제로 실행되는 배포 로직(S3에서 JAR/프론트 다운로드 → systemd 재시작 → 헬스체크 → Nginx 정적파일 교체 → reload → 최종 확인)
- `deploy/nginx/workflow.conf`: `/` → React 정적파일(SPA 폴백 포함), `/workflow/**` → `127.0.0.1:8006` 프록시
- `deploy/systemd/workflow.service`: `EnvironmentFile=/etc/workflow/workflow.env` + `SPRING_PROFILES_ACTIVE=prod`로 기동
- `deploy/workflow.env.example`: EC2에 올릴 실제 환경변수 파일의 템플릿(값은 비워둠)
- `.gitignore`: `.env*`, `application-local.properties`, `workflow.env`, AWS 자격증명/키 파일 등 추가(템플릿 파일들은 예외 처리)

**5. 검증**
- Backend: `mvn compile` PASS, **`mvn package -DskipTests`까지 실제로 실행해 실행 가능 JAR 생성 확인**(로컬 오프라인 캐시에 없는 surefire 플러그인은 온라인으로 재시도해 정상 해결됨 - CI는 항상 온라인이라 문제 없음)
- Frontend: `npm run build` PASS, **`VITE_API_BASE_URL`/`VITE_KAKAO_APP_KEY`를 실제로 주입해 빌드한 뒤 번들 파일을 직접 grep해 주입값이 반영되고 기존 하드코딩된 실제 Kakao 키는 그 빌드에 전혀 남지 않음을 확인**
- `.github/workflows/deploy.yml`: `js-yaml`로 파싱해 문법 오류 없음을 확인
- `deploy/scripts/remote-deploy.sh`: `bash -n`으로 문법 검사 통과
- AWS 리소스는 생성/삭제하지 않음(요청대로)

#### 수정 이유
"AWS 배포 가능한 상태를 만드는 것을 최우선"으로 하되, 실제로 배포하면 곧바로 깨질 게 확실한 요소(하드코딩된 시크릿, 와일드카드에 가까운 CORS, Windows 전용 업로드 경로, localhost 하드코딩 API URL)는 "배포 준비"의 일부로 판단해 함께 정리함. MyBatis 잔존 설정은 지시대로 손대지 않음.

#### 변경 파일
**Backend (수정)**: `application.properties`, `SecurityConfig.java`, `AmountController.java`, `AmountServiceImpl.java`, `WorkcationController.java`, `DashboardController.java`, `ApprovalController.java`, `HubController.java`
**Backend (신규)**: `application-prod.properties`
**Frontend (수정)**: `axiosInstance.js`, `dashboardApi.js`, `hubApi.js`, `WorkcationItemComponent.jsx`, `App.jsx`
**Frontend (신규)**: `.env.example`
**배포 설정 (신규)**: `.github/workflows/deploy.yml`, `deploy/nginx/workflow.conf`, `deploy/systemd/workflow.service`, `deploy/workflow.env.example`, `deploy/scripts/remote-deploy.sh`
**문서**: `.gitignore`, `README.md`(AWS 배포 가이드 섹션 신규), `PROJECT_STATUS.md`, `WORK_LOG.md`(본 파일)

#### 현재 상태
- 코드/설정 레벨에서는 배포 가능한 상태. AWS 실제 리소스(EC2/RDS/S3/IAM)는 아직 하나도 생성되지 않음
- Git에 남아있던 실제 Gemini API 키는 이번에 코드에서는 제거했으나 **과거 커밋 이력에는 여전히 남아있음** — 별도 조치 필요(아래 참고)

#### 남은 문제
- **Gemini API 키 회전 필요**: 이미 git 커밋 이력에 노출된 값이라 코드에서 지운 것만으로는 부족함 — Google AI Studio에서 키를 재발급하고 기존 키는 폐기할 것을 권장
- `FileRenamePolicy.java`(Hub/Place 이미지 업로드)가 `session.getServletContext().getRealPath()`를 사용 — 실행 가능 JAR(fat jar) 배포 환경에서는 이 값이 `null`을 반환할 가능성이 높아 **거점/장소 이미지 업로드가 운영에서 NPE로 실패할 수 있음**. 이번 STEP 범위(설정/배포 준비)를 넘어서는 코드 수정이라 손대지 않고 리스크로만 기록 - 별도 확인 필요
- `WorkcationItemComponent.jsx`의 지역 목록 조회는 원래부터 경로가 잘못돼(`/workflow`, `/hubs` 누락) 로컬에서도 404였던 것으로 보임 - host만 환경변수화했고 경로 버그 자체는 손대지 않음
- pom.xml의 `mysql-connector-j` 중복 선언 경고는 그대로 남아있음(기능에는 영향 없음)

#### 사용자 확인 필요
- **있음** — 아래 [AWS CI/CD 준비 결과] 보고의 "AWS에서 직접 해야 할 작업"/"GitHub에서 직접 해야 할 작업"을 완료해야 실제 배포가 가능함
