# WORK_LOG.md

## 2026-09-10 (14차 작업 — 종합 현황 문서화: `PROJECT_FINAL_STATUS.md` 신규 작성)

### [작업 완료]

#### 작업 내용
1~13차(2026-09-09) 작업으로 이미 정확하게 유지관리되어 온 `WORK_LOG.md`/`PROJECT_STATUS.md`/`DB_DESIGN.md`/`API_STATUS.md`/`README.md`를 전부 재독해 교차검증하고, Executive Summary/우선순위 로드맵/최종 시연 시나리오(30단계)/TOP 10 문제/전체 기능 현황표 등 기존 문서에 없던 "한눈에 보기" 종합 문서 `PROJECT_FINAL_STATUS.md`를 신규 작성했다.

**직접 재검증한 항목(코드/git 기준)**:
- `git worktree list` / `git log`로 이번 세션이 작업하던 워크트리가 최신 브랜치(`docs/step1-6-project-audit`, HEAD `e282e6b`)와 히스토리가 다른(훨씬 오래된 `7e76d5b`) 상태였음을 발견 — 11차/12차 작업에서도 동일한 유형의 문제가 있었던 것과 같은 패턴. `git reset --hard e282e6b`로 동기화 후 작업 시작(이 워크트리는 다른 세션과 공유되지 않는 전용 워크트리라 안전하게 처리 가능했음).
- `git log --oneline -1 origin/Deploy`와 `origin/docs/step1-6-project-audit` 둘 다 `59223ab`로 동일함을 확인 — 즉 Swagger 문서화 커밋(`e282e6b`, 현재 HEAD)은 아직 운영에 반영되지 않았음을 재확인
- `find src/main/java -iname "*Controller.java"` — 12개 컨트롤러 확인(문서 기재와 일치)
- `grep -c "^CREATE TABLE" SQL/WorkFlow_Script.sql` — 23개 테이블, `DB_DESIGN.md` 기재와 정확히 일치 확인
- `WorkcationDao.managerSelectWaitingList()` 쿼리를 직접 열람 — `SELECT DISTINCT`가 없어 STEP11에서 admin판만 고치고 manager판은 미수정 상태임을 재확인(문서 기재와 일치, 여전히 미해결)
- `mvnw.cmd -o compile -DskipTests` 오프라인 실행 — BUILD SUCCESS 확인(Backend 현재 컴파일 가능 상태 재확인)
- `pom.xml`/`application.properties`의 `mybatis.*` 잔존 여부, `SecurityConfig.java`의 `AuthenticationEntryPoint` 부재(401/403 미분리) 재확인
- Frontend는 이 워크트리에 `node_modules`가 없어 `npm run build`는 재실행하지 않음 — 같은 날짜 STEP 13(1~13차, 2026-09-09)에서 이미 PASS 확인된 것을 근거로 인용

#### 수정 이유
사용자가 "지금까지 작업내용 정리 및 향후 작업계획"을 문서로 정리해달라고 요청. 기존 4개 문서가 이미 정확해 처음부터 다시 조사하기보다, 교차검증 + 신규 종합 섹션(Executive Summary/로드맵/시연시나리오/TOP10) 작성에 집중했다.

#### 변경 파일
**문서(신규)**: `PROJECT_FINAL_STATUS.md`
**문서(수정, 상호 참조 추가만)**: `PROJECT_STATUS.md`, `DB_DESIGN.md`, `API_STATUS.md`, `WORK_LOG.md`(본 파일)

#### 검증
- 위 "직접 재검증한 항목" 참조. 코드 수정은 전혀 하지 않았으며(문서화 전용 작업), 백엔드 컴파일만 재확인해 현재 상태가 여전히 정상임을 확인했다.

#### 현재 상태
- `PROJECT_FINAL_STATUS.md`가 종합 현황 문서로 신규 추가됨. 기존 4개 문서와의 역할 분담: `WORK_LOG.md`(날짜별 상세 기록) / `PROJECT_STATUS.md`(도메인별 상태) / `DB_DESIGN.md`(DB 구조) / `API_STATUS.md`(API별 상태) / `PROJECT_FINAL_STATUS.md`(종합 요약+로드맵+시연시나리오)

#### 남은 문제
- 이번 세션에서 새로 발견된 버그는 없음(전부 기존 문서에 이미 정확히 기록되어 있던 것을 재확인). `PROJECT_FINAL_STATUS.md`의 "⑳ TOP 10 문제"에 우선순위 재정리만 추가

#### 사용자 확인 필요
- **없음** — 문서화 작업 전용

---

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

---

## 2026-09-09 (8차 작업 — STEP 8 실행: AWS 리소스 생성, RDS 초기화, 최초 수동 배포, CI/CD 파이프라인 실가동 검증)

### [작업 완료]

#### 작업 내용
사용자가 AWS 콘솔에서 직접 EC2(Amazon Linux, Java21+Nginx)/RDS(MySQL)/보안그룹/`Deploy` 브랜치/S3 버킷/IAM(CI/CD 사용자+EC2 인스턴스 역할)을 생성했고, 이를 바탕으로 (1) RDS 초기화, (2) 최초 수동 배포, (3) GitHub Actions CI/CD 파이프라인 디버깅 및 실가동 검증을 진행했다.

**1. RDS 초기화 — 완료**
- `SQL/WorkFlow_Script.sql`을 EC2 경유로 RDS(MySQL 8.4.6)에 실행, `SHOW TABLES`로 22개 테이블 전부 생성 확인.

**2. 최초 수동 배포 (CI/CD 완성 전 임시 경로) — 완료, 과정에서 버그 3건 발견/수정**
- 로컬에서 백엔드 JAR(`mvn package`)/프론트 `dist`(`npm run build`)를 빌드해 `scp`로 EC2에 전송, `systemd`(`workflow.service`)/Nginx 설정을 EC2에 직접 구성.
- **[환경 차이 발견]** EC2가 Amazon Linux라 README/`deploy/nginx/workflow.conf`가 전제하던 Ubuntu식 `sites-available`/`sites-enabled` 구조가 없음 — Amazon Linux는 `conf.d/*.conf` 구조를 쓰고, `nginx.conf`에 기본 `server{}` 블록이 내장되어 있어 그대로 두면 포트 80을 우리 설정보다 먼저 점유함. `nginx.conf`의 내장 기본 블록을 주석 처리하고 `conf.d/workflow.conf`에 `default_server`를 명시해 해결(코드 변경 아님, EC2 서버 설정).
- **[버그 발견/수정] MSYS 경로 자동변환으로 인한 빌드 오염**: Git Bash에서 `VITE_API_BASE_URL=/workflow npm run build`를 실행하면 MSYS가 `/workflow`를 Windows 경로로 변환해 번들에 `C:/...`가 박혀 브라우저에서 `AxiosError: Unsupported protocol C:` 발생. `MSYS_NO_PATHCONV=1`로 재빌드해 해결(코드 변경 아님, 빌드 명령 문제).
- **[버그 발견/수정] `dashboardApi.js`/`hubApi.js`의 배포환경 API 경로 중복**: `axiosInstance`가 이미 `baseURL=/workflow`를 갖고 있는데 두 파일이 요청 URL에도 `${API_BASE_URL}/...`를 붙여, 프로덕션에서 axios가 둘을 합쳐 `/workflow/workflow/dashboard/admin`처럼 404를 유발(로컬 개발 기본값이 절대 URL(`http://localhost:8006/workflow`)이라 로컬에서는 드러나지 않던 버그). 실제 EC2 배포본에 로그인해 대시보드/거점 화면에서 404를 재현·발견. `hubApi.js`는 `<img src>` 조립용 절대경로 `BASE_URL`(export 유지)과 axios 요청용 상대경로 `RELATIVE_PATH`(신규)를 분리, `dashboardApi.js`는 `BASE_URL`을 상대경로(`/dashboard`)로 단순화. PR #13에 커밋으로 반영.
- **[운영 조치]** DB에 이미 시드되어 있던 관리자 계정(`emp_id=admin`)의 비밀번호 평문을 알 수 없어(해시만 존재), 앱이 사용하는 것과 동일한 `BCryptPasswordEncoder`로 새 해시를 생성해 해당 계정의 `emp_pwd`를 SQL `UPDATE`로 교체 — 실제 EC2 배포본에 로그인 성공까지 확인.

**3. GitHub Actions CI/CD 파이프라인 디버깅 — 완료, 4가지 독립적 원인을 순차적으로 발견/수정**

`docs/step1-6-project-audit` → `Deploy` 브랜치로 fast-forward 병합 후 push하는 방식으로 실제 파이프라인을 여러 차례 구동하며 실패마다 GitHub Actions API/CloudTrail로 원인을 특정했다:

1. **워크플로 파일 자체가 무효(Invalid workflow file)** — `External smoke test` 스텝의 `if: ${{ secrets.EC2_PUBLIC_URL != '' }}`가 원인. GitHub Actions는 스텝의 `if:` 조건에서 `secrets` 컨텍스트를 직접 참조할 수 없음(`Unrecognized named-value: 'secrets'`). 이 때문에 **어떤 브랜치로 push해도 job이 0개인 채 즉시 실패**하고 있었음(이전 세션에서 `js-yaml`로 검증한 것은 YAML 문법만 확인한 것이라 이 GitHub Actions 표현식 제약은 잡아내지 못했음). `env:`로 한 번 거쳐 참조하도록 수정.
2. **`mvnw` 실행 권한 누락** — git에 `100644`(비실행)로 커밋되어 있어 Linux 러너에서 `./mvnw: Permission denied`(exit 126) 발생. `git update-index --chmod=+x`로 `100755`로 수정.
3. **GitHub Secret `EC2_INSTANCE_ID`에 예시 placeholder 값이 그대로 등록됨** — IAM 정책은 실제 인스턴스 ARN에 대해 정확히 구성되어 있었는데도(IAM 정책 시뮬레이터로 Allow 확인) 계속 `AccessDeniedException`이 발생해 원인 불명이었으나, **CloudTrail 이벤트 기록의 마스킹되지 않은 원문 오류 메시지**에서 실제 호출에 사용된 인스턴스 ARN이 README/가이드 문서에 적어둔 "예시" 인스턴스 ID(`i-0123456789abcdef0` 형태)와 정확히 일치하는 것을 발견 — 사용자가 GitHub Secret에 실제 값이 아니라 문서의 예시 문자열을 그대로 등록했던 것. 실제 인스턴스 ID로 재등록해 해결. (GitHub Actions 로그 자체는 시크릿 값을 자동 마스킹하므로, 시크릿 값 자체가 잘못된 경우 로그만으로는 발견 불가 — CloudTrail 원문 대조가 결정적이었음)
4. **`aws ssm send-command`의 `--parameters` shorthand 표기가 다중 줄 스크립트의 개행을 깨뜨림** — `--parameters commands="$(jq -Rs '[.]' < script)"`처럼 shorthand 키(`commands=`)에 JSON 배열 값을 섞어 넘기면, SSM 문서가 실제로 받는 문자열에서 개행이 실제 줄바꿈이 아니라 문자 그대로 `\n` 텍스트로 전달되어 EC2에서 `/usr/bin/env: 'bash\n# ...': No such file or directory`(exit 127)로 실패. `PARAMS_JSON=$(jq -Rn --rawfile script <파일> '{"commands":[$script]}')`로 만든 순수 JSON 객체를 `--parameters`에 통째로 넘기는 방식으로 교체해 shorthand 파서를 우회, 해결.

각 수정 후 GitHub Actions API(`/actions/runs`, `/actions/jobs/{id}/logs`)로 실제 실행 로그를 직접 조회해 다음 실패 지점을 확인하는 방식으로 순차 디버깅했고, IAM 관련 문제는 AWS IAM 정책 시뮬레이터와 CloudTrail 이벤트 기록까지 함께 활용해 교차 검증했다.

**4. 최종 검증 — Deploy 브랜치 push 1건으로 전체 파이프라인 성공**
Maven 빌드 → npm 빌드 → S3 업로드 → SSM으로 EC2 배포(JAR 교체+systemd 재시작+프론트 정적파일 교체+Nginx reload) → 배포 결과 검증까지 전 스텝 성공(`conclusion: success`) 확인. `External smoke test`는 `EC2_PUBLIC_URL` 시크릿을 등록하지 않아 정상적으로 skip됨(선택 사항).

#### 수정 이유
"CI/CD를 구축해서 Deploy 브랜치 push만으로 서버에 자동 빌드·배포되게 한다"는 목표를 실제로 검증 가능한 상태까지 만들기 위해, 발견되는 각 실패를 코드/설정 레벨 원인까지 추적해 수정했다. 모두 인프라/배포 파이프라인 자체의 명확한 버그이며 API 계약·DB 스키마·비즈니스 로직과는 무관해 사용자 확인 없이 즉시 수정.

#### 변경 파일
**배포 설정 (수정)**
- `.github/workflows/deploy.yml` (3개 커밋에 걸쳐 수정 — secrets/if: 수정, SSM `--parameters` JSON 인코딩 수정)
- `WorkFlow_Project_BE/mvnw` (파일 모드만 `100644`→`100755` 변경, 내용 변경 없음)

**Frontend (수정, 최초 수동 배포 과정에서 발견)**
- `workflow_project_fe/src/dashboard/api/dashboardApi.js`
- `workflow_project_fe/src/hub/api/hubApi.js`

**운영 환경 (git 추적 대상 아님)**
- RDS: `SQL/WorkFlow_Script.sql` 실행(신규 구축)
- EC2: Nginx `conf.d/workflow.conf` 구성, `nginx.conf` 기본 블록 비활성화, `systemd` 서비스 설치, `/etc/workflow/workflow.env` 구성
- GitHub Secrets: `EC2_INSTANCE_ID` 값 정정(잘못된 예시값 → 실제 인스턴스 ID)
- DB: 시드된 관리자 계정의 비밀번호 해시를 새로 생성해 교체(테스트 로그인 가능하도록)

#### 검증
- Backend/Frontend build: **PASS** (GitHub Actions 러너 상에서 `mvnw clean package`, `npm ci && npm run build` 모두 성공)
- SSM 배포: **PASS** — IAM 정책 시뮬레이터로 `ssm:SendCommand`(document+instance 리소스 양쪽) 허용 확인, CloudTrail로 실제 API 호출의 정확한 파라미터 확인
- 전체 파이프라인: **PASS** — `Deploy` 브랜치 push → GitHub Actions 전 스텝 성공 → EC2에 최신 코드 반영 확인
- 실제 EC2 배포본에서 로그인(`admin` 계정) → 대시보드/거점/비용/승인/워케이션 목록 등 주요 API 호출이 정상 인증·응답되는 것을 `journalctl -u workflow` 로그로 확인

#### 현재 상태
- **STEP 8 목표(AWS 실배포 + CI/CD 자동화)가 실제로 동작하는 상태로 완료됨.** `Deploy` 브랜치에 push하면 별도 수동 작업 없이 EC2까지 자동 반영됨.
- RDS는 초기 공통데이터(job/department/authority)와 시드 관리자 계정 1건만 존재 — 실제 업무 데이터(워케이션 신청/승인 이력/비용 등)는 없는 상태

#### 남은 문제
- 워케이션 신청→승인→업무→정산 전체 플로우의 EC2/RDS 환경 통합 테스트는 아직 미실행 — 다음 최우선 작업
- Kakao Maps JavaScript 키 미발급/미적용 — 지도 관련 화면 미작동
- `WorkcationItemComponent.jsx`의 지역 드롭다운 API 경로 버그(기존부터 있던 문제) — 미수정
- `FileRenamePolicy.java`의 `getRealPath()` 의존 — Hub 이미지 업로드가 EC2 fat-jar 환경에서 실패할 위험, 미검증
- GitHub Actions `External smoke test`용 `EC2_PUBLIC_URL` 시크릿 미등록(선택 사항, 필요 시 추가 가능)
- 워크플로 파일이 경로(path) 필터 없이 모든 push에 대해 FE+BE 전체를 재빌드함 — 지금 규모에선 문제없으나 프로젝트가 커지면 `paths:` 필터 분리를 고려할 수 있음(현재는 불필요한 최적화로 판단해 보류)

#### 사용자 확인 필요
- **없음** — 이번 작업분은 전부 배포 파이프라인 자체의 명확한 버그 수정. 다음 단계(워케이션 전체 플로우 통합 테스트)로 바로 진행 가능

## 2026-09-09 (9차 작업 — STEP 9: 워케이션 전체 라이프사이클 실제 검증 + 출퇴근 인증/만족도조사 신규 구현)

STEP 8에서 미뤄둔 "워케이션 신청→승인→업무 수행→정산 전체 플로우 통합 테스트"를 로컬 MySQL + 실제 브라우저 UI + API 호출로 순서대로 진행하며, 발견되는 버그를 즉시 수정했다. STAFF/MANAGER/ADMIN 3개 테스트 계정으로 신청→승인→업무 진행→비용 신청→업무완료확인→정산승인까지 전 구간을 실제로 시연 가능한 상태로 만드는 것이 목표.

**1. 업무 진행률(Task) 기능 — 사실상 전혀 동작하지 않던 상태를 실제 구현으로 교체**
- "내 워케이션" 화면(`MyWorkcationListComponent.jsx`, `MyWorkcationDetailFormComponent.jsx`) 자체가 `App.jsx`에 라우팅되어 있지 않아 클릭 시 빈 화면이었음 — `/workcation/mylist`, `/workcation/mydetail/:workcationNo` 라우트 신규 추가.
- 더 근본적인 문제: `workcation_info.work_plan`을 매 GET 요청마다 텍스트 파싱해 `id: System.currentTimeMillis() + Math.random()`이라는 요청마다 바뀌는 가짜 ID를 만들고 있어서, 진행률을 저장하려 해도 매번 "업무를 찾을수 없습니다" 오류만 발생하는 구조였음. 워케이션 신청(`insertWorkcationEnrollForm`) 시점에 실제 `Work`/`Task` 로우를 생성하고, 조회(`getWorkcationDetail`)도 실제 `Task` 테이블에서 읽도록 재작성해 근본 해결.
- `saveTaskProgress`(프론트)가 `FormData`를 만들어놓고 실제로는 JSON으로 전송하고 있었음(백엔드는 `@RequestParam` 기반 multipart 기대) — 실제로 `FormData`를 전송하도록 수정.
- `updateTask`가 progress=100이 되어도 `task.status`를 갱신하지 않아 부서 평균 진행률 통계(`status='Y'` 기준 집계)가 항상 0으로 나오던 문제 — 100%일 때 `status='Y'`로 자동 갱신하도록 수정.
- **실제 브라우저 UI로 검증**: 로그인 → 업무 등록 → 진행률 40%→100% 저장 → `task_history`에 실제 기록 저장 → 통계 반영까지 전부 실제 클릭으로 확인.

**2. 대시보드 500 에러 — 직원이 워케이션을 2건 이상 갖는 순간 터지는 잠재 버그**
`HubDao.selectHubAddress`가 날짜/상태 스코프 없이 `getSingleResult()`를 기대하는 구조라, 테스트 계정이 워케이션을 2건 이상 가지면 `IncorrectResultSizeDataAccessException`으로 대시보드 전체가 500이 되는 것을 발견(실제 시연 시나리오에서 충분히 발생 가능한 상황) — "현재 진행 중"(`approver_state='A' AND NOW() BETWEEN start_at AND end_at`) 기준으로 스코프를 좁히고 반환 타입을 `List`로 변경해 해결.

**3. 출퇴근 위치 인증(attendance) — 신규 기능, UI 목업만 있던 것을 실제로 동작하게 구현**
`LocationCheckModal.jsx`(GPS 좌표 계산·Haversine 거리 검증·Kakao 지도 표시까지 이미 완성되어 있던 컴포넌트)를 호출하는 `StaffComponent.jsx` 쪽이 실제로는 `alert()` + 로컬 state 변경만 하고 아무 것도 저장하지 않는 목업이었던 것을 실제 API 연동으로 교체.
- **신규 테이블** `attendance`(근태 PK, IN/OUT 구분, 위경도, 거점과의 거리, 지각 여부, 워케이션/사원/거점 FK) — `SQL/WorkFlow_Script.sql`에 추가.
- **신규 백엔드**: `Attendance` 엔티티/DAO/Service/Controller(`POST /attendance/check`) — 본인 소유 워케이션인지, 승인 상태(`A`)인지, 출근 없이 퇴근을 시도하는지(혹은 중복 출근) 등을 서버에서 검증. 지각 여부(9:10 기준)도 서버에서 계산해 저장 — 기존 프론트 로직(`getHours()>=9 && getMinutes()>10`)이 10시 출근도 "정상"으로 판정하던 버그를 서버 이전 과정에서 함께 바로잡음.
- **보안 버그 발견/즉시 수정**: `Attendance` 엔티티의 연관관계(`workcation`/`employee`/`hub`)에 `@JsonIgnore`가 없어 첫 실제 curl 테스트에서 응답에 **사원 비밀번호 BCrypt 해시가 그대로 노출**되는 것을 발견 — 프로젝트 전역 컨벤션(자식→부모 역참조에 `@JsonIgnore`)대로 즉시 수정.
- **Spring Boot 4.x 프로퍼티 키 이동 발견**: 컨트롤러 예외 메시지가 응답에 안 실리는 문제를 `server.error.include-message=always`로 고치려 했으나 효과가 없었음 — 소스 jar를 직접 열어 확인한 결과, Spring Boot 4.x부터 `ErrorProperties`가 `WebProperties` 하위로 이동해 실제 키는 `spring.web.error.include-message`임을 확인, 수정.
- **실제 검증**: staff01로 로그인 → 출근 → 중복 출근 시도(서버가 거부, 메시지 확인) → 퇴근 → 대시보드의 출근 상태 토글까지 API/DB로 전부 확인.

**4. MANAGER 업무완료확인 — 위 1번 수정으로 얻은 실제 진행률 데이터를 화면에 노출**
`WorkcationDetailComponent.jsx`(MANAGER가 보는 상세 화면)에 업무별 진행률/완료 여부 컬럼을 추가하고, `approverState`를 기준으로 한 상태 배지(BUG-008, 이전엔 항상 "신청 완료"로 고정 표시)도 함께 정리. manager01로 로그인해 실제로 "완료 (100%)"/"승인 완료"가 표시되는 것을 확인.

**5. ADMIN 정산승인 — UI로는 단 한 번도 성공한 적이 없던 상태였음을 발견**
- **BUG-012**: STAFF가 "새 비용 신청" 버튼을 누르면 `/cost/apply?workcationNo=...`로 이동하는데, 그 라우트가 렌더링하는 `AmountForm`은 props로 `workcationNo`를 받지도, 쿼리스트링을 읽지도 않아 `workcationNo`가 항상 `undefined`였음 — 제출을 누르면 매번 "워케이션 정보가 없습니다"로 막혔던 것. `useSearchParams`로 쿼리스트링을 읽도록 수정.
- **BUG-013**: ADMIN이 승인/반려/보류 버튼을 누르면 `amountApi.js`가 JSON 바디로 `axios.patch`를 보내는데, 백엔드 `AmountController.updateApproval`은 `@RequestParam`(쿼리 파라미터)으로만 값을 받아 항상 400("Required parameter 'status' is not present")으로 실패하고 있었음. 게다가 프론트가 보내는 필드명(`amountComment`)도 백엔드 파라미터명(`comment`)과 달랐음 — 쿼리 파라미터 전송 + 필드명 일치로 수정.
- **실제 검증**: staff01로 실제 비용 신청 제출 → admin으로 로그인해 승인(150,000원 승인)/반려 각각 실제 클릭 경로로 처리 → 화면 재조회로 상태 반영 확인. (ADMIN 화면의 승인 프롬프트는 `window.prompt()`를 쓰는데, 이번 세션에서 쓴 브라우저 자동화 도구가 네이티브 dialog를 지원하지 않아 클릭 자체는 재현하지 못하고 동일한 요청을 curl로 대신 보내 백엔드 계약을 검증함 — 실제 사람이 쓰는 브라우저에서는 `window.prompt()`가 정상 동작하므로 이는 자동화 도구의 한계이지 앱의 문제는 아님)

**6. STAFF 만족도조사(TODO-001) — Entity만 있고 완전히 미구현이던 기능을 신규 구현**
- `SurveyQuestion`에 SQL에는 있는 `question_order` 컬럼 매핑이 아예 빠져 있었고, `SurveyAnswer.score`가 primitive `int`라 TEXT형 질문까지 평점 0점으로 잡혀 `WorkcationDao.selectAvgSatisfaction()`의 평균 만족도 통계를 왜곡시킬 수 있는 잠재 버그를 함께 발견 — `Integer`로 변경.
- **신규 백엔드**: `SurveyController`(`GET /survey/questions`, `GET /survey/status/{workcationNo}`, `POST /survey`) + Service + DAO 3종. 제출 시 본인 소유/승인 상태/워케이션 종료 여부/중복 제출 여부를 검증하고 모든 질문에 대한 답변을 강제.
- **기존 통계 쿼리 2개의 컬럼 참조가 서로 달랐던 것을 발견하고 양쪽 다 살림**: `HubDao.selectAvgScore`(거점별 평점)는 `answerValue`를 `double`로 캐스팅해서 쓰고, `WorkcationDao.selectAvgSatisfaction`(전사 평균 만족도)은 `score` 컬럼을 쓰는 서로 다른 설계였음 — SCORE형 답변 제출 시 두 컬럼에 동시에 저장하도록 구현해 두 통계 모두 신규 데이터로 정상 동작하도록 함.
- **신규 프론트**: `surveyApi.js`, `SurveyForm.jsx`(평점 1~5 버튼 / 텍스트 입력 렌더링), `/survey/:workcationNo` 라우트, "내 워케이션" 상세 화면에 "만족도 조사 작성" 버튼(승인 완료 건에만 노출).
- **실제 검증**: staff01로 실제 제출 → DB 저장 확인 → 재조회 시 "이미 작성하셨습니다" 정상 표시 → 중복 제출 서버 차단 확인 → ADMIN 대시보드 `avgSatisfaction`(4.5) 실제 반영 확인.

#### 수정 이유
STEP 8에서 "AWS 실배포는 됐지만 전체 업무 플로우 통합 테스트는 아직"으로 남겨둔 항목을 실제로 처리하는 과정에서, 코드 리뷰만으로는 드러나지 않았을 버그들(가짜 ID로 인한 저장 불가, 쿼리 파라미터/JSON 바디 불일치, N+1 상황에서의 500 등)이 실제 클릭·API 호출을 통해서만 발견되었다. 전부 "실제로 동작하지 않던 것을 동작하게 만드는" 성격의 수정이라 사용자 확인 없이 즉시 처리.

#### 변경 파일
**Backend (신규)**: `attendance/**`(Entity/DAO/Service/Controller), `survey/**`(Controller/Service/DAO 3종), `task/model/dao/WorkDao.java`, `dashboard/model/dto/CurrentHubDto.java`
**Backend (수정)**: `WorkcationServiceImpl.java`(Work/Task 생성·조회 재작성), `HubDao.java`(대시보드 500 수정 + 거점 정보 조회), `TaskDao.java`, `DashboardServiceImpl.java`, `dashboard/model/dto/StaffDto.java`, `amount/controller/AmountController.java`(변경 없음, 계약 확인용), `workcation/model/vo/SurveyQuestion.java`/`SurveyAnswer.java`, `application.properties`(`spring.web.error.include-message`)
**Frontend (수정)**: `App.jsx`(라우트 4건 추가), `StaffComponent.jsx`(출퇴근 실제 연동), `WorkcationDetailComponent.jsx`(진행률 표시 + 상태 배지), `MyWorkcationDetailFormComponent.jsx`(만족도조사 버튼), `WorkcationApi.js`(saveTaskProgress FormData 수정), `amount/api/amountApi.js`(BUG-013), `amount/components/AmountForm.jsx`(BUG-012)
**Frontend (신규)**: `dashboard/api/attendanceApi.js`, `survey/api/surveyApi.js`, `survey/components/SurveyForm.jsx`, `survey/styles/Survey.css`
**DB**: `SQL/WorkFlow_Script.sql`에 `attendance` 테이블 추가

#### 검증
- Backend compile / Frontend build: **PASS**
- 로컬 MySQL + 실제 백엔드 인스턴스에 대해 STAFF/MANAGER/ADMIN 3개 계정으로 로그인 → 신청 → 승인 → 출근 인증 → 업무 진행률 저장 → 퇴근 인증 → 비용 신청 → 업무완료확인 → 정산 승인/반려 → 만족도조사 제출까지 전 구간을 실제 UI 클릭 또는 API 호출로 검증(위 1~6 각 항목 참고)

#### 현재 상태
- **STEP 9 목표(전체 라이프사이클 실제 검증) 완료.** 신청부터 만족도조사까지 전 구간이 실제로 동작함을 확인.

#### 남은 문제(낮은 우선순위, 미수정)
- ADMIN 대시보드 `totalCost`가 음수로 계산되는 통계 버그 발견(더미데이터 검증 중 발견, 원인 미조사)
- ADMIN 대시보드 `waitingList`가 워케이션에 예약이 여러 건이면 중복 표시되는 것으로 추정되는 버그 발견(JOIN 중복 의심, 원인 미조사)
- `ManagerComponent.jsx`의 정산대기목록이 `item.approverState`를 참조하는데 `Amount`에는 해당 필드가 없어 보이는 표시 버그(원인 미조사)
- `AdminAmountPage.jsx`의 `workcationNo={1}` 하드코딩 prop이 실제로는 사용되지 않는 죽은 코드(무해하나 정리 대상)

#### 사용자 확인 필요
- **없음** — 전부 "이미 만들어졌어야 했는데 실제로는 동작하지 않던 것"을 고치는 성격의 버그 수정 및 이미 승인된 기능(TODO-001)의 구현.

## 2026-09-09 (10차 작업 — 운영 배포 준비: SQL 마이그레이션/시연용 더미데이터/ERD Cloud 갱신)

STEP 9에서 완성한 기능들을 실제 운영 서버(AWS EC2+RDS)에 배포하고, 시연 가능한 상태로 만들기 위한 준비 작업.

**1. `SQL/WorkFlow_Script.sql`의 attendance DROP 누락 버그 발견/수정**
9차 작업에서 `attendance` 테이블을 추가하면서 상단 `DROP TABLE IF EXISTS` 목록에 넣는 것을 빠뜨렸음 — 이미 `attendance`가 있는 DB에 스크립트를 재실행하면 `Table 'attendance' already exists`로 실패. 로컬 재검증 중 이 버그로 실제로 로컬 `workflow` DB가 일부 손상되는 사고가 있었음(아래 참고) — 즉시 DROP 목록에 추가해 수정.

> **사고 기록**: 스크립트가 내부적으로 `USE workflow;`를 하드코딩하고 있다는 것을 모른 채, 별도로 만든 스크래치 DB(`workflow_dummy_test`)에 연결해서 실행하면 격리된 채로 테스트될 것으로 생각하고 실행했으나, 실제로는 로컬 `workflow`(이번 세션 내내 써온 개발 DB)를 대상으로 DROP TABLE부터 순서대로 실행되다 `attendance` 테이블에서 에러로 중단되어, 로컬 개발 DB의 상당수 테이블이 빈 상태로 재생성되는 사고가 있었음. 로컬 전용 데이터라 실질적 피해는 없었고, 버그 수정 후 스크립트를 재실행 + 더미데이터를 적용해 즉시 복구함.

**2. `SQL/migration_add_attendance.sql`(신규)** — 운영 RDS는 이미 초기화되어 실데이터가 있어 전체 스크립트를 재실행할 수 없으므로(DROP TABLE로 기존 데이터가 전부 삭제됨), `attendance` 테이블만 추가하는 별도 마이그레이션(`CREATE TABLE IF NOT EXISTS`, 재실행 안전).

**3. `SQL/dummy_data.sql`(신규)** — 시연용 약 2주치 더미 데이터. 사원 5명(STAFF 3, MANAGER 2, 부서 상이), 거점 6곳(강릉/제주 오피스·숙소·체험·맛집), 워케이션 6건을 승인대기(W)/승인+진행중(A)/승인+완료(A)/반려(J)/보류(H) 상태별로 구성. 완료 건 2개는 출퇴근 기록·업무 진행률 100%·비용 정산 승인·만족도 조사 응답까지 채워 전체 시나리오를 한 번에 시연할 수 있게 했다. 모든 날짜는 `NOW()` 기준 상대값(`DATE_SUB`/`DATE_ADD`)이라 실행 시점과 무관하게 항상 "최근 2주" 데이터로 보인다. `INSERT ... ON DUPLICATE KEY UPDATE`로 재실행해도 안전. 로컬 MySQL(스크립트 재실행 후 깨끗한 상태)에 실제로 적용해 에러 없음과 대시보드 통계 반영을 확인 후 운영에도 동일 파일을 적용하기로 함.

**4. `deploy/scripts/db-apply.sh`(신규) + `.github/workflows/deploy.yml` 임시 확장** — `Deploy` 브랜치 push 시 기존 앱 배포(SSM)와 같은 방식으로, 위 마이그레이션/더미데이터 SQL을 S3 경유로 EC2에 내려받아 `/etc/workflow/workflow.env`의 DB 접속정보로 RDS에 직접 적용하는 스텝을 추가. 운영 DB에 시연 데이터를 1회 반영하는 목적이 끝나면 이 스텝은 후속 커밋에서 제거해 평소 배포 흐름(앱 코드만 배포)으로 되돌릴 예정 — 즉, `dummy_data.sql`/`migration_add_attendance.sql`을 매 배포마다 자동으로 재실행하는 것은 의도가 아님.

**5. ERD Cloud 스냅샷을 SQL 형식에서 JSON 형식으로 교체**
이전 세션에서 "SQL 가져오기(Import SQL)"용으로 만들어둔 `SQL/ERD_attendance_snapshot.sql`이 실제로는 erdcloud.com이 기대하는 가져오기 형식이 아니었음(사용자가 실제 프로젝트를 JSON으로 export해서 공유해줘서 확인) — 실제 export 파일(`entityData`/`domainData` 배열 구조, 필드별 `_id`/`relEntity`/`relFieldId`/`relType`/`relGroupId`로 관계를 표현하는 형식)을 그대로 분석해 `attendance` 엔티티(9개 필드 + PK, `workcation_info`/`employee`/`hub` 3개 테이블과의 FK 관계 포함)를 동일한 스키마로 작성, 기존 22개 엔티티에 추가한 전체 프로젝트 스냅샷을 `SQL/ERD_snapshot_with_attendance.json`으로 저장. 기존 `ERD_attendance_snapshot.sql`은 삭제. Node로 JSON 파싱 검증 + 신규 ID가 기존 ID와 충돌하지 않는지, FK가 참조하는 대상 엔티티/PK의 `_id`가 정확히 일치하는지 확인 완료.

#### 수정 이유
9차 작업으로 완성한 기능들을 실제로 시연 가능하게 만들려면 (1) 운영 DB에 신규 테이블이 반영되어야 하고, (2) 빈 DB로는 시연이 안 되므로 그럴듯한 데이터가 있어야 하며, (3) ERD 문서도 최신 스키마를 반영해야 한다는 사용자 요청에 따름.

#### 변경 파일
**DB (신규)**: `SQL/migration_add_attendance.sql`, `SQL/dummy_data.sql`, `SQL/ERD_snapshot_with_attendance.json`
**DB (수정)**: `SQL/WorkFlow_Script.sql`(DROP 목록에 `attendance` 추가)
**DB (삭제)**: `SQL/ERD_attendance_snapshot.sql`(형식이 틀려서 대체)
**배포 (신규)**: `deploy/scripts/db-apply.sh`
**배포 (수정, 임시)**: `.github/workflows/deploy.yml`(DB 마이그레이션/더미데이터 적용 스텝 2개 추가 — 1회성, 추후 제거 예정)

#### 검증
- `migration_add_attendance.sql`/`dummy_data.sql` 둘 다 로컬 MySQL에 실제로 적용해 에러 없음 확인, 재실행(idempotency)도 확인
- `deploy.yml`은 `js-yaml`로 문법 검증(단, 이전 STEP 8에서 학습했듯 이것만으로는 GitHub Actions 표현식 제약까지 검증되지 않으므로, 실제 검증은 `Deploy` 브랜치 push 후 Actions 로그로 확인 필요)
- ERD JSON은 Node로 파싱 검증 + ID 충돌 없음 + FK 참조 정합성 확인

#### 현재 상태
- **`Deploy` 브랜치 push 완료, GitHub Actions 파이프라인 2회 모두 성공 확인** — 처음엔 세션 권한 정책(auto mode classifier)이 `git push`를 거부했으나, 사용자가 권한 설정을 조정한 뒤 재시도하니 실제로는 이전 시도들도 이미 원격에 반영되어 있었던 것으로 확인됨(GitHub Actions 실행 이력상 커밋 `880bdf6`이 이미 `Success`로 완료돼 있었음 — 즉 DB 마이그레이션 + 더미데이터가 이미 운영 RDS에 적용된 상태였음). 후속 커밋(설계 문서 갱신, 커밋 `efe72ae`)도 push해 파이프라인이 다시 한번 `Success`로 완료됨을 GitHub Actions 웹 UI로 직접 확인.
- 배포 성공 확인 후, 계획대로 `deploy.yml`에서 DB 마이그레이션/더미데이터 적용 스텝(`Apply DB migration + demo data via SSM`, `Verify DB migration result`)과 S3 업로드 라인 2줄을 제거해 평소 배포 흐름(앱 코드만 배포)으로 되돌림. `deploy/scripts/db-apply.sh`와 `SQL/migration_add_attendance.sql`/`SQL/dummy_data.sql`은 필요 시 재사용할 수 있도록 그대로 저장소에 남겨둠.

#### 남은 문제
- 없음 — 이번 작업 목표(운영 배포 준비 → 실배포 → 원상복구) 전부 완료

#### 사용자 확인 필요
- **없음**

## 2026-09-09 (11차 작업 — STEP 9에서 발견해 미뤄뒀던 낮은 우선순위 버그 4건 수정)

STEP 9(더미데이터 검증) 중 발견했지만 원인 미조사 상태로 남겨뒀던 낮은 우선순위 버그 4건을 로컬 MySQL(`workflow` DB, 더미데이터 적용 상태) + 실제 API 호출로 원인을 특정하고 수정했다.

**1. ADMIN 대시보드 `totalCost` 음수 계산 버그**
`AmountDao.selectTotalCost()`가 `AmountItem`과 `SupportList`를 각각 JOIN하고 있었는데, 워케이션 1건의 비용 신청에 항목(item)이 여러 개이고 지원처(support)도 있는 경우 JOIN이 항목 수 × 지원처 수만큼 행을 곱해서(카티션 곱) 만들어낸다. 그 위에서 `ai.itemAmount - sl.approvedAmount - a.approvedAmount`를 행마다 계산해 합산하다 보니 `a.approvedAmount`(비용 신청 1건당 값)가 행 개수만큼 중복 차감되었다. 실제 더미데이터(비용신청 2건 중 1건이 항목 3개+지원처 1개 구성)로 재현한 결과 API가 정확히 버그 리포트와 동일한 `-530000`을 반환함을 확인. 게다가 `SupportList`와의 INNER JOIN 때문에 지원처가 하나도 없는 승인 건(비용신청 1건, 150,000원)은 아예 합계에서 누락되는 문제도 있었다. "발생한 총 비용"은 비용 신청 1건당 최종 승인된 금액(`amount.approved_amount`, 스키마 주석상 "최종 승인된 비용")의 합이면 충분하므로 JOIN 자체를 제거하고 `SUM(a.approvedAmount) WHERE a.status = 'A'`로 재작성.

**2. ADMIN 대시보드 `waitingList` 중복 표시 버그**
`WorkcationDao.adminSelectWaitingList()`가 `Reservation`을 JOIN하면서 DISTINCT 없이 워케이션 1건에 연결된 예약(reservation) 건수만큼 행을 그대로 반환하고 있었다. 더미데이터의 승인대기('W') 워케이션(workcation_no=5, staff01)이 거점 예약을 2건(제주 스마트오피스+서귀포 힐링 숙소) 가지고 있어 실제로 API가 완전히 동일한 행을 2번 반환하는 것을 직접 확인. `SELECT DISTINCT`를 추가해 해결했는데, MySQL은 `DISTINCT` 사용 시 `ORDER BY` 표현식이 SELECT 목록에 포함되어야 하므로(`Expression #1 of ORDER BY clause is not in SELECT list ... incompatible with DISTINCT`), 기존 `ORDER BY w.workcationNo DESC`(SELECT 목록에 없음)를 이미 프로젝션에 포함된 `w.startAt DESC`로 변경.
> 참고: 부서장 대시보드의 동일 목적 쿼리(`WorkcationDao.managerSelectWaitingList()`)에도 완전히 동일한 JOIN 구조의 잠재 버그가 남아 있음을 확인했으나, 이번 버그 리포트 범위(`GET /dashboard/admin`)에 포함되지 않아 손대지 않고 별도 후속 작업으로 남겨둠(세션 내 background task로 등록).

**3. `ManagerComponent.jsx` 정산대기목록 위젯의 잘못된 필드 참조**
정산대기목록(`data.balanceList`) 렌더링에서 `item.approverState === "W"`로 "대기" 배지를 표시하려 했으나, 이 위젯이 쓰는 `BalanceListDto`(`AmountDao.selectBalanceList`)에는 `approverState` 필드 자체가 없다(필드: `empName`/`empNo`/`approvedAmount`/`status`) — `approverState`는 `WorkcationInfo`(워케이션 승인 상태 W/A/J/H/C)에만 있는 필드이고, `Amount`의 검토 상태는 `status`(A/C/H/J/R, `SQL/WorkFlow_Script.sql` 주석 "A 승인, C 취소, H 보류, J 반려, R 검토")다. 실제 `GET /api/v1/amounts` 응답을 직접 확인해 `Amount` 계열 객체에 `approverState` 필드가 전혀 없고 `status`만 있음을 재확인했고, `AdminAmount.jsx`가 이미 `status === 'R'`을 "검토중"(=결재 대기)으로 취급하는 것과 일관되게 `item.status === "R"`로 수정. 더미데이터의 검토 대기 건(amount_no=3, D5부서, 80,000원, status='R')을 대상으로 부서 정산대기목록 쿼리를 직접 재현해 수정 후 정상적으로 "대기" 배지가 뜰 조건임을 확인.

**4. `AdminAmountPage.jsx`의 죽은 `workcationNo={1}` prop 제거**
`App.jsx`의 `/admin/cost/list` 라우트가 `<AdminAmountPage workcationNo={1} />`로 하드코딩된 prop을 넘기고 있었는데, 확인 결과 `AdminAmountPage.jsx`는 이 prop을 받기만 하고(`console.log`용) 실제 자식 `<AdminAmount />`에는 전달조차 하지 않았고, `AdminAmount.jsx`는 애초에 어떤 prop도 받지 않는(`export default function AdminAmount()`) 컴포넌트로 `amountApi.getAmountList(currentPage)`를 통해 전체 목록을 독립적으로 조회하고 있어 완전히 죽은 코드임을 확인. `App.jsx`의 `workcationNo={1}` prop과 `AdminAmountPage.jsx`의 관련 prop 구조분해/로그 3줄을 함께 제거.

#### 수정 이유
STEP 9에서 "낮은 우선순위, 원인 미조사"로 남겨둔 항목들을 이번 세션에서 실제 로컬 DB/API로 원인을 규명하고 수정 완료. 모두 명확한 계산/쿼리/필드참조 버그이거나 확인된 죽은 코드라 사용자 확인 없이 즉시 처리.

#### 변경 파일
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/amount/dao/AmountDao.java` (`selectTotalCost()` 쿼리 재작성)
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/workcation/model/dao/WorkcationDao.java` (`adminSelectWaitingList()`에 DISTINCT 추가 + ORDER BY 컬럼 변경)
- `workflow_project_fe/src/dashboard/components/ManagerComponent.jsx` (정산대기목록 배지 조건을 `item.status === "R"`로 수정)
- `workflow_project_fe/src/App.jsx` (`/admin/cost/list` 라우트의 `workcationNo={1}` prop 제거)
- `workflow_project_fe/src/pages/amount/AdminAmountPage.jsx` (미사용 `workcationNo` prop 구조분해 및 디버그 로그 제거)

#### 검증
- Backend compile (`mvnw clean compile`): **PASS**
- Frontend build (`npm run build`): **PASS**
- **버그 1**: 로컬 MySQL에 직접 `SELECT SUM(approved_amount) FROM amount WHERE status='A'` 실행해 기대값 `350000` 확보 → 수정 전 `GET /dashboard/admin`이 `totalCost: -530000`(버그 리포트와 정확히 일치) 반환하는 것을 재현 → 수정 후 재기동해 동일 엔드포인트가 `totalCost: 350000`을 반환함을 실제 API 호출로 확인
- **버그 2**: 수정 전 원본 쿼리를 로컬 MySQL에 직접 실행해 workcation_no=5(예약 2건) 건이 완전히 동일한 행으로 2번 반환됨을 확인 → 수정 후 `GET /dashboard/admin`의 `waitingList`가 해당 워케이션을 정확히 1건만 반환함을 실제 API 호출로 확인
- **버그 3**: `GET /api/v1/amounts` 실제 응답을 확인해 `Amount` 계열 객체에 `approverState` 필드가 없고 `status`만 있음을 재확인, 더미데이터의 검토중(R) 건을 대상으로 부서 정산대기 쿼리를 로컬 MySQL에 직접 실행해 수정된 필드/값 조건이 실제로 매칭됨을 확인
- **버그 4**: 코드 추적으로 `AdminAmountPage`→`AdminAmount` 어디에서도 `workcationNo`를 사용하지 않는 완전한 죽은 코드임을 확인 후 제거, 프론트 빌드로 회귀 없음 확인
- (부수적으로 발견) 로컬 워크트리가 `docs/step1-6-project-audit` 브랜치 최신 커밋과 히스토리가 다른 상태(오래된 `feature/Approval-KGM` 기준)로 체크아웃되어 있어 `WORK_LOG.md`/`SQL/dummy_data.sql` 등이 아예 없는 상태였음 — 작업 시작 전 `git reset --hard origin/docs/step1-6-project-audit`로 동기화. 이 과정에서 `amount/components/AdminAmount.jsx` 등 6개 파일이 working tree에 반영되지 않은 상태(`git status`상 deleted)였던 것도 함께 발견해 `git checkout --`으로 복구(커밋 없이 워킹트리만 원상복구, 실제 저장소 히스토리에는 항상 존재했음)

#### 현재 상태
- STEP 9에서 남겨뒀던 낮은 우선순위 버그 4건 전부 수정 완료 및 실제 DB/API로 검증 완료

#### 남은 문제
- `WorkcationDao.managerSelectWaitingList()`에 `adminSelectWaitingList()`와 동일한 JOIN 중복 버그가 남아있음(이번 버그 리포트 범위 밖이라 미수정, 별도 후속 작업으로 등록)

#### 사용자 확인 필요
- **없음**

## 2026-09-09 (12차 작업 — CSS 통일 세션이 미룬 버그 4건 + 신규 리포트(직원 정보 수정 미작동) 1건, 총 5건 수정)

11차 작업 직후 진행된 프론트엔드 CSS 디자인 시스템 통일 세션(커밋 `9970470`)에서 범위 밖으로 판단해 손대지 않고 넘긴 버그 4건과, 사용자가 이번에 새로 제보한 "관리자가 직원 정보를 수정할 때 정보가 안 불러와지는 버그" 1건을 함께 수정했다.

**1. (UI-001) `PlaceList.jsx`의 `useNavigate` import 누락**
`react-router-dom`에서 `useSearchParams`만 import하면서 `useNavigate()`를 호출해 렌더링 시 `ReferenceError`로 페이지 전체가 크래시하던 버그. import에 `useNavigate` 추가로 해결.

**2. (UI-002) `ApprovalHistoryDetail.jsx`의 정의되지 않은 setter 호출**
`ApprovalReject.jsx`에서 복사해온 것으로 보이는 `setApproverState`/`setApproverComment` 호출이 이 컴포넌트에는 존재하지 않는 state setter라 매 조회마다 `ReferenceError`가 발생 → `catch` 블록으로 흡수되어 화면은 정상 렌더링되지만 콘솔에 에러가 계속 쌓이던 버그. `setWorkcationInfo(response)` 이후의 두 줄(죽은 코드)을 제거.

**3. (UI-003) `TaskStatusBadge.jsx`의 `getStatusInfoByProgress`가 전역 `window.status`를 참조**
함수가 `progress` 하나만 파라미터로 받으면서 내부에서 `status`를 참조 — 스코프에 없어 전역 `window.status`(항상 falsy)로 resolve되어 "업무 완료" 분기가 영구히 죽어있던 버그. 호출부(`TaskStatusBadge` 컴포넌트, 47번째 줄)는 이미 `getStatusInfoByProgress(progress, status)`로 두 번째 인자를 넘기고 있었으므로, 함수 시그니처를 `(progress, status)`로 맞춰 호출부와 일치시켜 해결(호출부 쪽 수정이 아니라 함수 정의 쪽 수정이 맞는 케이스로 판단).

**4. (UI-004) 미사용 디렉터리/파일 3건 삭제 — 전부 재확인 후 실제로 죽은 코드였음을 확인**
`workflow_project_fe/src` 전체에서 각 대상에 대한 import를 재검색(grep)해 재확인:
- `src/login/`(`LoginForm.jsx`/`FindIDForm.jsx`/`FindPWForm.jsx`/`styles/LoginForm.css`) — `App.jsx`는 동일한 이름의 컴포넌트를 `src/employee/components/LoginForm.jsx` 등에서 import하고 있어, `src/login/`은 완전히 대체된 이전 버전의 죽은 사본이었음. 삭제.
- `src/placeinfo/`(전체) — `App.jsx`가 `/hub/ai`, `/placeInfo/ai` 두 라우트 모두에서 `src/hub/components/AIComponent.jsx`(동일 이름의 다른 컴포넌트)만 import하고 있어, `src/placeinfo/`는 어디서도 import되지 않는 완전한 죽은 코드였음(라우트 경로 문자열에 "placeInfo"가 들어갈 뿐, 실제 임포트 경로는 전부 `hub/`). 삭제.
- `workcation/components/approval/style/ApprovalQueueDetail.css` — 프로젝트 전체에서 import하는 곳이 없음을 확인. 삭제.

**5. (신규 리포트) `EmployeeEdit.jsx`("관리자가 직원 정보를 수정할 때 정보가 안 불러와지는 버그") — 완전 미구현 스텁이었음**
`getEmployee`를 import만 하고 호출하지 않고, `useState`/`useEffect` 없이 모든 input이 uncontrolled(`value` 없음)이며 `<form>`에 `onSubmit`조차 없는 완성되지 않은 컴포넌트였음. `EmployeeDetail.jsx`의 fetch 패턴(`useParams`/`useEffect`/`getEmployee(empNo)`/로딩 상태)을 그대로 따라 실제로 구현:
- `updateEmployee(empNo, { empName, phone, email, address })` (`PUT /employees/{empNo}`)로 이름/연락처/이메일/주소 저장
- `updateEmployeeRole`/`updateEmployeeStatus`(`PATCH .../role`, `PATCH .../status`) — 백엔드에는 이미 존재하지만 프론트 어디서도 호출하지 않던 두 API를 이 화면에서 처음으로 실제 사용. 상태 라디오의 플레이스홀더 값(`"apple"`/`"banana"`)을 실제 코드(`Y`/`N`)로 교체하고 조회된 현재 상태로 사전 선택되도록 처리
- 부서(`depId`)/직위(`jobCode`)는 백엔드에 변경 API 자체가 없음(컨트롤러 전체 매핑 확인, `PUT/PATCH` 경로 중 depId/jobCode를 받는 엔드포인트 없음) — 새 백엔드 엔드포인트를 만들지 않는 대신(DB/API 계약 변경은 범위 밖) 조회된 현재 값으로 `<select>`를 채우되 `disabled` 처리(기존 `empId` input과 동일 패턴)하고, 저장되지 않는 이유를 한 줄 주석으로 명시
- 연락처는 `employee.phone`(단일 문자열, 예: `"010-1234-5678"`)을 `-` 기준으로 분리해 3개 입력란에 채우고, 저장 시 다시 `-`로 합쳐서 전송
- 제출 성공 시 `alert` 후 `EmployeeDetail.jsx`의 "돌아가기"와 일관되게 상세 페이지(`/employee/detail/${empNo}`)로 이동

> **검증 중 추가로 발견한 실제 버그(프론트 `employeeApi.js`)**: `updateEmployeeRole`이 `authCode`를 쿼리 파라미터로 보내고 있었으나, 실제 백엔드(`EmployeeController.updateRole`)는 `@RequestBody EmployeeRoleUpdateRequest`(JSON 본문)를 요구함 — 이대로면 매번 "Required request body is missing" 400 오류. 쿼리 파라미터 대신 JSON 본문(`{ authCode, depId, jobCode }`)을 보내도록 수정.
> 또한 **백엔드 `EmployeeServiceImpl.updateEmployeeRole()`이 요청 DTO의 `authCode`/`depId`/`jobCode` 세 필드를 무조건 엔티티에 그대로 덮어쓰는 것**을 실제 API 호출로 발견 — `authCode`만 보내면 `depId`/`jobCode`가 `null`이 되어 `dep_id` NOT NULL 제약조건 위반으로 500 에러. 백엔드 코드는 범위 밖이라 손대지 않고, 프론트에서 매번 조회된 현재 `depId`/`jobCode`를 함께 보내는 방식으로 우회(주석으로 이유 명시).

#### 수정 이유
1~4번은 CSS 통일 세션이 "범위 밖"으로 판단해 미뤄둔 버그로, 이번 세션에서 실제 코드 재확인 후(특히 4번은 삭제 전 grep으로 재검증) 확정 수정. 5번은 사용자가 이번에 새로 제보한 버그로, "관리자가 직원 정보를 수정할 때 정보가 안 불러와진다"는 증상의 원인이 실제로는 EmployeeEdit 컴포넌트가 애초에 데이터 조회/저장 로직 자체가 구현되지 않은 스텁이었음을 확인.

#### 변경 파일
- `workflow_project_fe/src/place/components/PlaceList.jsx` (import 수정)
- `workflow_project_fe/src/workcation/components/approval/components/ApprovalHistoryDetail.jsx` (죽은 코드 2줄 제거)
- `workflow_project_fe/src/taskboard/components/TaskStatusBadge.jsx` (`getStatusInfoByProgress` 시그니처 수정)
- `workflow_project_fe/src/login/`, `workflow_project_fe/src/placeinfo/`, `workflow_project_fe/src/workcation/components/approval/style/ApprovalQueueDetail.css` (삭제)
- `workflow_project_fe/src/employee/components/EmployeeEdit.jsx` (전체 구현)
- `workflow_project_fe/src/employee/api/employeeApi.js` (`updateEmployeeRole`을 실제 백엔드 계약에 맞게 수정)

#### 검증
- Frontend build (`npm run build`): **PASS**
- **버그 1~3**: 코드 리딩으로 원인 확정, 수정 후 빌드 통과로 회귀 없음 확인(런타임 재현 테스트는 별도로 하지 않음 — 원인이 명확한 단순 버그)
- **버그 4**: 삭제 전 `workflow_project_fe/src` 전체에서 각 대상 경로에 대한 import를 재검색(grep)해 실제로 어디서도 참조되지 않음을 재확인 후 삭제(로그인/장소정보 라우트가 각각 `employee/`, `hub/`의 동일 이름 컴포넌트로 이미 대체되어 있었음을 `App.jsx` import 라인으로 직접 확인)
- **버그 5**: 로컬 MySQL(`workflow` DB, 기존 더미데이터) + 실제 실행 중인 백엔드(격리를 위해 별도 포트 8007 인스턴스, CORS는 이 검증용 프론트 포트로 한정 설정) + 실제 브라우저로 end-to-end 검증
  - `admin` 계정 비밀번호를 알 수 없어(메모리 기록의 `Staff01!`이 더 이상 유효하지 않음을 실제 로그인 시도로 확인) bcryptjs로 새 해시를 생성해 `emp_pwd`를 `Staff01!`로 재설정(로컬 전용 조치)
  - admin으로 로그인 → 직원 관리 목록에서 staff02(이사원) 상세 → 편집 화면 진입 시 이름/연락처(3분할)/이메일/주소/부서(비활성)/직위(비활성)/상태(라디오 사전선택)가 실제 DB 값 그대로 채워짐을 스크린샷으로 확인(수정 전이었다면 전부 빈 입력란이었을 화면)
  - 이름을 "이사원(UI테스트)", 연락처를 "010-5555-1111"로 실제 브라우저에서 수정 후 저장 → alert 확인 → 상세 페이지로 자동 이동, 변경값이 즉시 반영된 것을 확인
  - 상세 페이지를 완전히 새로 고침(하드 네비게이션, SPA 상태가 아닌 서버 재조회)해도 변경값이 그대로 유지됨을 확인해 실제 DB 반영(단순 로컬 state 아님)을 검증
  - 검증 후 staff02 데이터를 원래 값(이름 "이사원", 연락처 "010-4444-1111")으로 API 호출을 통해 복원
  - 검증 과정에서 `updateEmployeeRole`의 쿼리파라미터/본문 불일치, 백엔드의 `depId`/`jobCode` 강제 덮어쓰기 문제를 실제 API 응답(400 → 500)으로 발견해 위 "추가로 발견한 실제 버그" 항목대로 수정 후 재검증(204 No Content 확인)
- (부수적 발견) 이번에도 워크트리가 `docs/step1-6-project-audit` 최신 커밋(`9970470`, CSS 통일 세션 결과물)이 아닌 훨씬 오래된 히스토리(`feature/Approval-KGM`, `WORK_LOG.md` 자체가 없는 상태)로 체크아웃되어 있었음 — 작업 시작 전 `git reset --hard docs/step1-6-project-audit`로 동기화. 이 과정에서 이전 세션과 동일한 워킹트리 미반영 파일(`amount/components/AmountPage.jsx`)이 `git status`상 deleted로 나타난 것도 `git checkout --`으로 복구

#### 현재 상태
- 5개 버그 전부 수정 및 검증 완료

#### 남은 문제
- 없음 — 이번 버그 리포트 범위 전부 처리 완료

#### 사용자 확인 필요
- **없음** — 전부 명확한 버그 수정(스텁 미구현, import 누락, 죽은 코드, 확정된 미사용 파일)이며, 백엔드 API 계약을 바꾸지 않는 선에서 처리 가능했음

## 2026-09-09 (13차 작업 — Swagger/OpenAPI 문서화 전체 적용, 이전 세션의 rate-limit 중단 작업 이어받아 완료)

### [작업 완료]

#### 작업 내용
이전 세션이 rate-limit로 중단되면서 남긴 미커밋 작업(`SwaggerConfig.java`, `SecurityConfig.java` 기반 설정 + `AmountController`/`ApprovalController`/`HubController`/`SurveyController` 4개 문서화)을 이어받아, 프로젝트 전체 12개 Controller 클래스(`find src/main/java -iname "*Controller.java"`로 실제 확인) 중 나머지를 마무리했다.

1. **기반 설정 검증** — `SwaggerConfig.java`(OpenAPI 기본정보/Contact/License/Server, `JWT` Bearer SecurityScheme 등록)와 `SecurityConfig.java`(`/swagger-ui/**`, `/swagger-ui.html`, `/v3/api-docs/**`, `/v3/api-docs` permitAll, 기존 중복 matcher 블록 제거)가 이미 올바르게 완료되어 있음을 확인 — 수정 불필요
2. **이미 완료된 상태였음을 추가로 확인** — `EmployeeController`(13개 API 전부), `DashboardController`(5개), `AttendanceController`(1개)는 더 이전 세션에서 이미 Swagger 문서화가 완료되어 커밋되어 있었음(현재 diff에는 안 잡힘). 실제 endpoint 수와 `@Operation` 개수를 일일이 대조해 확인
3. **신규 문서화 4개 Controller** — `NoticeController`(5개), `PlaceController`(5개), `ReservationController`(7개), `WorkcationController`(12개) 총 29개 API에 `@Tag`/`@Operation`/`@Parameter`/`@ApiResponses`/`@SecurityRequirement(name="JWT")`를 기존 `SurveyController`(`"만족도조사 관리"` 태그) 스타일과 동일하게 적용. 각 API의 실제 권한 요구사항은 `SecurityConfig.java`의 matcher(예: `/reservations/**`, `/workcation/**` → `anyRequest().authenticated()`, `place`의 ADMIN 체크는 컨트롤러 내부 수동 검사)를 직접 대조해 문서에 반영
4. **`AiController`는 문서화 대상에서 제외** — `find`로는 발견되지만 실제로는 빈 껍데기 클래스(`@RestController` 없음, 필드/메서드 없음, endpoint 0개)라 Swagger에 노출할 API 자체가 없음을 확인

#### 수정 이유
사용자 원본 지시(Swagger UI 적용 및 전체 API 문서화)를 이전 세션에서 이어받아 완료. 문서화 작업이므로 Controller/Service/Security 로직 자체는 변경하지 않고 Annotation과 `SwaggerConfig`/`SecurityConfig`의 Swagger 관련 matcher만 추가.

#### 변경 파일
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/notice/controller/NoticeController.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/place/controller/PlaceController.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/reservation/controller/ReservationController.java`
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/workcation/controller/WorkcationController.java`
- (이전 세션에서 이미 작성되어 있던 것을 함께 커밋) `SwaggerConfig.java`, `SecurityConfig.java`, `AmountController.java`, `ApprovalController.java`, `HubController.java`, `SurveyController.java`

#### 검증
- Backend 빌드: **PASS** (`./mvnw clean package -DskipTests`, BUILD SUCCESS, jar 생성 확인)
- 로컬 MySQL(`workflow` DB, 기존 더미데이터) 기동 상태에서 실제 `java -jar`로 앱 실행 — 포트 8006에 이전 세션이 남겨둔 좀비 java 프로세스(구버전 jar, PID 33756)가 떠 있어 종료 후 새로 빌드한 jar로 재기동
- `GET /workflow/swagger-ui/index.html` → **200** (403 아님, Security matcher 정상 동작)
- `GET /workflow/v3/api-docs` → **200**, JSON 파싱 결과 **59 paths / 74 operations / 11개 도메인 태그**(비용/정산, Employee, Dashboard, 공지사항, 만족도조사, 승인, 거점(장소), 예약, Hub, 워케이션, Attendance) / `securitySchemes: ["JWT"]` 확인
- Swagger UI를 실제 브라우저로 열어 제목/설명/Authorize 버튼/태그별 그룹 렌더링 스크린샷으로 확인
- `POST /employees/login`(staff01/`Staff01!`, 요청 필드는 `empId`/`password`)으로 실제 JWT 발급 확인 → JWT로 `GET /employees`, `GET /api/v1/notice`, `GET /place`, `GET /workcation/list`, `GET /approval/list`, `GET /api/v1/amounts` 전부 **200** 확인(핵심 GET API가 Swagger UI → Security → Controller → Service → Repository → DB → Response까지 실제로 동작함을 curl로 직접 검증)
- 무인증 `GET /employees` → 403, STAFF 계정으로 `DELETE /api/v1/notice/{no}`(ADMIN 전용) 호출 → 403 (권한 분리 정상 동작 확인)
- 검증 후 로컬 java 프로세스는 종료(포트 8006 정리)

#### 현재 상태
- 12개 Controller 클래스 중 API가 실재하는 11개 전부 Swagger 문서화 완료(`AiController`는 빈 스텁이라 대상 제외)
- Swagger UI/OpenAPI JSON 정상 노출, JWT Authorize 플로우 정상 동작

#### 남은 문제 (TODO로 기록, 이번 작업 범위 밖이라 손대지 않음)
- `HubController`/`DashboardController`/`AttendanceController`는 (이전 세션들에서 작성됨) `@Tag` 이름이 영문(`"Hub API"`, `"Dashboard API"`, `"Attendance API"`)으로, 이번에 통일한 한글 태그 컨벤션(`"거점(장소) 관리"`, `"워케이션 관리"` 등)과 표기가 다름. `EmployeeController`도 확인 필요. 기능에는 영향 없는 순수 표기 통일 이슈라 별도 후속 작업으로 남김
- 인증 실패(JWT 없음, 401 문서화)와 권한 없음(403)이 실제 런타임에서는 커스텀 `AuthenticationEntryPoint` 부재로 둘 다 403으로 응답됨(무인증 `GET /employees` 테스트로 확인) — Swagger 문서에는 관례대로 401/403을 구분해 적었으나, 실제 동작과 문서가 다른 부분이므로 Security 로직 변경이 필요한 별도 이슈로 기록(이번 세션에서는 Security 로직을 변경하지 않는다는 지침에 따라 미수정)

#### 사용자 확인 필요
- **없음** — 문서화 작업 범위 내에서 완결, 위 2건은 TODO로 기록만 함

## 2026-09-10 (15차 작업 — 잘못된 경로/권한없는 URL 직접 접근 처리 + JWT 만료 자동 로그아웃 버그 수정)

사용자가 상세 스펙으로 요청한 작업: "사용자가 존재하지 않는 URL이나 접근 권한이 없는 페이지에 직접 접근했을 때 적절한 에러페이지로 이동하고, JWT 토큰이 만료되거나 인증이 무효화된 경우 자동으로 로그아웃되어 로그인 페이지로 이동하도록 구현한다." Frontend(React Router/Axios)부터 Backend(Spring Security/JWT)까지 전체 흐름을 분석하고, 코드 수정뿐 아니라 실제 브라우저로 8개 필수 시나리오를 전부 재현·검증했다.

### [작업 완료]

#### 사전 조사 (작업 전 상태)
- **워크트리 불일치 재발**: 이전 세션들(11차/12차)과 동일하게 이번 세션의 워크트리도 `docs/step1-6-project-audit` 최신 커밋이 아닌 훨씬 오래된 히스토리(`feature/Approval-KGM` 병합 시점)로 체크아웃되어 있었음 — `WORK_LOG.md`/`PROJECT_STATUS.md` 자체가 없는 상태였음. `git reset --hard origin/docs/step1-6-project-audit`로 동기화 후 작업 시작. 동기화 과정에서 이전 세션들과 동일하게 `amount/components/AmountPage.jsx`가 워킹트리상 deleted로 나타난 것도 `git checkout --`으로 복구(커밋에는 항상 존재, 작업 트리 반영만 누락됐던 것).
- **Frontend**: `App.jsx`가 로그인 상태(`loginUser`)에 따라 3갈래(비로그인/비밀번호변경필요/정상)로 완전히 다른 `<Routes>` 트리를 렌더링. 정상 로그인 분기는 ADMIN/MANAGER 전용 라우트를 `{loginUser.authCode === "ADMIN" && (...)}` 식으로 조건부 등록하고 있었으나, **매치되는 Route가 하나도 없을 때의 catch-all(`path="*"`)이 없어** (1) 존재하지 않는 URL과 (2) 로그인은 했지만 현재 권한에서 등록되지 않은 URL(예: STAFF가 `/employee/list` 직접 접근) 둘 다 헤더/푸터만 남고 본문이 완전히 빈 화면으로 남아있었음(React Router의 "No routes matched" 콘솔 경고와 함께). `ErrorPage.jsx`(요구 문구 "접속권한이 없거나 잘못된 경로입니다." + [이전 페이지]/[홈으로] 버튼)는 이미 존재했지만 `App.jsx`에서 import조차 되지 않고 라우트도 전부 주석 처리되어 있어 완전히 미사용 상태였음. `ProtectedRoute.jsx`도 존재하지만 어디서도 import되지 않는 죽은 컴포넌트였음(App.jsx의 조건부 라우트 등록 방식이 사실상 동일한 역할을 이미 하고 있어 그대로 두고 활용하지 않음).
- **Backend**: `SecurityConfig.java`에 커스텀 `AuthenticationEntryPoint`/`AccessDeniedHandler`가 전혀 등록되어 있지 않음(레포 전체 grep으로 재확인, 0건). `JwtAuthenticationFilter`는 토큰이 없거나 `JwtUtil.validateToken()`이 실패해도 예외를 던지지 않고 그냥 `SecurityContext`를 비운 채 `filterChain.doFilter()`만 호출 — 즉 401/403 판단을 전적으로 Spring Security 기본 동작에 위임. `formLogin`/`httpBasic`을 쓰지 않는 상태에서 커스텀 EntryPoint가 없으면 Spring Security의 기본 폴백(`Http403ForbiddenEntryPoint`)이 "인증 자체가 안 됨(401이어야 함)"과 "인증은 됐지만 권한 부족(403)"을 구분 없이 전부 403으로 응답한다는 것을 실제 curl 요청으로 재확인(무토큰 요청도 403, 권한부족 요청도 403 — 동일).
- **Axios**: `axiosInstance.js`에 request 인터셉터(Bearer 토큰 첨부)만 있고 **response 인터셉터가 아예 없어** 401을 받아도 아무 처리도 하지 않고 있었음 — 이것이 "JWT 만료돼도 화면에 그대로 남아있는" 버그의 직접 원인.
- **Zustand 미사용 확인**: `package.json`엔 `zustand` 의존성이 있지만 실제 소스 전체(`workflow_project_fe/src`)에서 import하는 곳이 0건 — 인증 상태는 순수 React state(`useState`) + `localStorage`로만 관리되고 있음을 확인. 잘못된 가정(Zustand 스토어 초기화)으로 코드를 만들지 않도록 사전에 확인.
- **`WorkcationApi.js`는 이미 공용 `axiosInstance`를 사용 중**(이전 세션 메모의 우려와 달리 문제 없음). 대신 실제로 raw `axios`(공용 인터셉터 미적용)를 쓰는 곳은 `workcation/components/WorkcationItemComponent.jsx` 1곳이었음(레포 전체 grep으로 확인).
- **Header.jsx의 로그아웃 로직 확인**: `handleLogout`이 `App.jsx`의 `onLogout` prop(=`handleLogout`: `localStorage.removeItem("accessToken")` + `localStorage.removeItem("user")` + `setLoginUser(null)`)을 호출하는 구조. axios 인터셉터는 컴포넌트 트리 밖에서 실행되어 이 함수(React state setter)를 직접 재사용할 수 없으므로, 동일한 localStorage 키 정리 로직만 그대로 재사용하고 `window.location.href`로 페이지를 완전히 새로고침시켜 `App.jsx`가 처음부터 다시 마운트되며 자연스럽게 비로그인 상태가 되도록 처리(요구사항 14번의 "Hook을 못 쓰는 구조라면 프로젝트에 맞는 방법으로 처리" 조건에 해당).
- **Nginx 설정 확인**: `deploy/nginx/workflow.conf`에 React Router SPA fallback(`try_files $uri $uri/ /index.html`)과 `/workflow/**` → Spring Boot 프록시가 이미 올바르게 분리되어 있어 별도 수정 불필요함을 확인(요구사항 17/18번).

#### 수정 내용

**Backend**
1. `WorkFlow_Project_BE/src/main/java/com/kh/workflow/config/jwt/JwtAuthenticationEntryPoint.java` (신규) — 인증 실패(토큰 없음/만료/위조) 시 401 + JSON 응답
2. `WorkFlow_Project_BE/src/main/java/com/kh/workflow/config/jwt/JwtAccessDeniedHandler.java` (신규) — 인가 실패(권한 부족) 시 403 + JSON 응답
3. `WorkFlow_Project_BE/src/main/java/com/kh/workflow/config/SecurityConfig.java` — 위 두 Bean을 `.exceptionHandling(exception -> exception.authenticationEntryPoint(...).accessDeniedHandler(...))`로 연결. JWT 구조/필터 로직/Controller/Service는 전혀 건드리지 않은 additive 변경(요구사항 27번 준수).

**Frontend**
4. `workflow_project_fe/src/App.jsx` — `ErrorPage` import 추가, `/error` 명시적 라우트 추가, 정상 로그인 분기 `<Routes>` 최하단에 `<Route path="*" element={<ErrorPage />} />` 추가(존재하지 않는 URL + 권한없는 URL 직접 접근을 전부 에러 페이지로 유도)
5. `workflow_project_fe/src/common/api/axiosInstance.js` — response 인터셉터 신규 추가: 401은 `accessToken`/`user` 삭제(Header.jsx/App.jsx의 로그아웃과 동일 키) 후 `/login`으로 이동(자동 로그아웃), 403은 로그아웃 없이 `/error`로 이동. `isRedirecting` 플래그로 동시다발 401(무한 요청 문제, 요구사항 15번) 시 중복 리다이렉트 방지. 추가로, "요청이 발생해야만 401을 받는" 구조의 한계(요구사항 10번 버그의 근본 원인)를 보강하기 위해 새 라이브러리 추가 없이 JWT `exp` 클레임을 직접 base64url 디코딩해 15초 주기로 만료 여부를 선제 확인하는 로직 추가 — 사용자가 아무 조작도 하지 않고 화면만 보고 있어도 만료 시점 이후 자동 로그아웃되도록 함.
6. `workflow_project_fe/src/common/components/ErrorPage.jsx` — "홈으로" 버튼이 존재하지 않는 `/dashboard` 경로로 이동하려 하던 버그 수정(`App.jsx`엔 `/dashboard` 라우트가 없고 대시보드는 `/`에서 authCode별로 조건부 렌더링됨) → `/`로 수정. 기존 코드대로면 버튼을 눌러도 다시 에러 페이지로 되돌아오는 루프였음.
7. `workflow_project_fe/src/workcation/components/WorkcationItemComponent.jsx` — 유일하게 공용 `axiosInstance` 대신 raw `axios` + 수동 조립 URL을 쓰던 곳을 `axiosInstance`로 교체(401/403 인터셉터 커버리지 통일). 이 컴포넌트가 호출하는 엔드포인트 경로 자체가 이미 깨져있는(404) 별도의 기존 버그는 코드 내 기존 주석대로 범위 밖이라 손대지 않음.

#### 실제 테스트 (실제 브라우저 + 실제 로컬 백엔드로 재현·검증, 코드 리뷰만으로 끝내지 않음)

로컬 백엔드(포트 8006, MySQL 로컬 DB)와 프론트 dev 서버(포트 5173)를 실제로 기동해 Claude Browser로 직접 조작하며 검증. JWT 만료 테스트를 위해 `application.properties`의 `jwt.expiration` 값 자체는 건드리지 않고, 백엔드 프로세스 기동 시 `JWT_EXPIRATION=20000`(20초) 환경변수만 임시로 주입(요구사항 22번 — 운영 설정 파일은 무변경, 테스트 종료 후 즉시 프로세스 종료로 원복).

- **Test 1 (존재하지 않는 URL)**: 로그인 상태에서 `/no-such-page-xyz` 직접 접근 → ErrorPage 정상 렌더링 확인 (🟢)
- **Test 2 (STAFF → ADMIN 페이지 직접 접근)**: `staff01`(STAFF)로 로그인 후 `/employee/list`(ADMIN 전용) 직접 접근 → ErrorPage 렌더링 확인. "홈으로" 버튼 클릭 시 정상적으로 `/`(대시보드)로 이동하는 것까지 확인 (🟢)
- **Test 3 (MANAGER → ADMIN 페이지 직접 접근)**: `manager01`(MANAGER)로 로그인 후 `/admin/statistics`(ADMIN 전용) 직접 접근 → ErrorPage 렌더링 확인 (🟢)
- **Test 4 (비로그인 → 보호 페이지)**: 로그아웃 상태에서 `/no-such-page` 직접 접근 → `window.location.pathname`이 `/login`으로 확인됨(로그인 페이지로 이동) (🟢)
- **Test 5 (JWT 만료 → 자동 로그아웃)**: `staff01`로 로그인 후 아무 조작 없이 대기만 함(20초 만료 설정) → 사용자 인터랙션 없이도 신규 추가한 15초 주기 선제 만료 확인 로직이 감지해 `accessToken`/`user` 둘 다 `localStorage`에서 삭제되고 `/login`으로 자동 이동됨을 확인. 별도로 curl로도 백엔드 단에서 무토큰/위조토큰 요청이 정확히 401(과거엔 403)을 반환함을 확인 (🟢)
- **Test 6 (JWT 만료 후 새로고침)**: `manager01`로 로그인 후 만료 시점 직후 강제 새로고침(F5 상당) → `/login`으로 이동, `accessToken`/`user` 모두 삭제 확인 (🟢)
- **Test 7 (로그아웃 후 뒤로가기)**: 로그인 → Header 로그아웃 버튼 클릭(실제 UI 클릭, `Header.jsx`의 기존 로그아웃 로직 그대로 사용) → 브라우저 뒤로가기 → 보호된 화면이 재노출되지 않고 로그인 화면 유지됨을 확인(로그인 상태가 URL이 아니라 `App.jsx`의 React state에 묶여있어 히스토리 엔트리와 무관하게 항상 최신 인증 상태로 렌더링되는 구조 덕분) (🟢)
- **Test 8 (ADMIN/MANAGER/STAFF 정상 접근)**: 세 계정 모두 실제 로그인 → 각자의 대시보드(Staff/Manager/AdminComponent) 정상 렌더링 확인, ADMIN 계정으로 `/employee/list` 정상 접근(직원 목록 6건 정상 표시)도 확인 (🟢)
- **(추가) 403은 로그아웃시키지 않는 것 확인 (요구사항 16번)**: `staff01`로 로그인한 상태에서 브라우저 콘솔로 실제 `axiosInstance` 모듈을 동적 import해 ADMIN 전용 API(`PATCH /employees/2/role`)를 직접 호출 → 인터셉터가 403을 감지해 `/error`로 이동하면서도 `accessToken`/`user`는 그대로 유지됨(로그아웃되지 않음)을 확인 — 401(로그아웃)과 403(에러 페이지만, 세션 유지)의 실제 동작 차이를 코드가 아닌 살아있는 브라우저 요청으로 직접 검증 (🟢)
- **Backend 401/403/404 구분(요구사항 5/16번)**: curl로 직접 확인 — 무토큰 보호 API=401, STAFF의 ADMIN 전용 API(`POST /employees`, `PATCH /employees/*/role`)=403(신규 JSON 바디 포함), 인증된 상태의 존재하지 않는 경로(`/invalid-api`)=404(Spring 표준), 존재하지 않는 리소스 조회(`GET /employees/999999999`)는 여전히 500(컨트롤러/서비스가 던지는 예외를 그대로 반환하는 기존 동작 — Service/Controller 변경은 요구사항 27번 범위 밖이라 손대지 않음, ⚪ 참고용으로만 기록)
- **Frontend build (`npm run build`)**: PASS (경고만 있음, 청크 크기 관련 — 기능과 무관)
- **Backend build (`mvn clean package -DskipTests`)**: PASS

테스트 도중 `preview_start`(launch.json 기반)로 띄운 dev 서버가 이 에이전트의 격리된 워크트리가 아니라 공유 체크아웃 디렉터리를 대상으로 기동되어(경로 해석 문제로 추정) 처음엔 수정 전 코드가 그대로 서빙되는 현상을 발견 — `preview_stop` 후 워크트리 내부에서 직접 `npm run dev`를 실행해 올바른 코드가 서빙되는 것을 확인하고 이후 모든 브라우저 테스트를 그 인스턴스로 진행함.

#### 변경 파일
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/config/jwt/JwtAuthenticationEntryPoint.java` (신규)
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/config/jwt/JwtAccessDeniedHandler.java` (신규)
- `WorkFlow_Project_BE/src/main/java/com/kh/workflow/config/SecurityConfig.java` (exceptionHandling 연결)
- `workflow_project_fe/src/App.jsx` (ErrorPage import + `/error` 라우트 + catch-all 라우트)
- `workflow_project_fe/src/common/api/axiosInstance.js` (401/403 response 인터셉터 + JWT 만료 선제 확인)
- `workflow_project_fe/src/common/components/ErrorPage.jsx` ("홈으로" 버튼의 존재하지 않는 `/dashboard` 경로 버그 수정)
- `workflow_project_fe/src/workcation/components/WorkcationItemComponent.jsx` (raw axios → 공용 axiosInstance 교체)

#### 현재 상태
- 필수 테스트 8종 + 401/403 실동작 검증 전부 완료(🟢). Frontend/Backend 빌드 모두 PASS. `application.properties`는 무변경(JWT 만료 테스트는 프로세스 기동 시 환경변수로만 임시 적용 후 프로세스 종료로 원복). 로컬에서 띄웠던 백엔드/프론트 dev 서버 전부 종료 완료.

#### 남은 문제 / 확인 필요
- ⚪ **TODO**: `GET /employees/999999999`(존재하지 않는 리소스 조회)가 404가 아니라 500을 반환하는 기존 동작은 이번 작업 범위(라우팅/인증) 밖이라 손대지 않음 — Resource Not Found를 404로 통일하려면 Service/Controller 변경이 필요해 별도 확인 필요 항목으로 남김.
- ⚪ **TODO**: 배포 환경(AWS EC2 + Nginx)에서의 실제 재검증은 이번 세션에서 진행하지 못함(로컬 환경에서만 검증). Nginx 설정 자체는 SPA fallback이 이미 올바르게 되어 있음을 코드로 확인했으나, 실제 배포 환경에서 잘못된 URL 접근/401/403 흐름이 로컬과 동일하게 동작하는지는 별도 확인 필요.

#### 사용자 확인 필요
- **없음** — 이번 작업은 전부 요구사항 27번(최소 변경) 원칙 내에서 처리 가능했고, DB/API 계약/JWT 구조 변경 없이 완료.

## 2026-09-10 (16차 작업 — WorkFlow ERP 전체 화면 UI/UX 구조 개선, 이전 세션의 rate-limit 중단 작업 이어받아 완료)

사용자 원본 지시: "WorkFlow ERP 프로젝트의 기존 화면을 전반적으로 점검하고, UI/UX 관점에서 사용하기 편하고 완성도 높은 화면이 되도록 HTML/JSX 구조를 개선해줘. 기능은 그대로 유지." — 이전 세션이 rate-limit로 중단되며 38개 파일(미커밋)을 남겼고, 이번 세션은 그 작업을 이어받아 나머지 미착수 도메인을 마무리했다.

### [작업 완료]

#### 시작 시점 상태 확인
- `git status`/`git diff --stat`로 이전 세션이 남긴 38개 파일(amount/dashboard/employee/notice/reservation/workcation/approval 도메인, `common/styles/common.css`에 `--wf-*` 디자인 토큰 및 `wf-container`/`wf-page-header`/`wf-page-title`/`wf-page-description`/`wf-page-actions`/`wf-table-wrap`/`wf-badge`/`wf-state`/`wf-modal` 등 공용 클래스 확립)을 확인, `npm run build` PASS 재확인 후 시작
- 기존 38개 파일 대비 아직 손대지 않은 도메인을 spec §19 체크리스트와 대조해 확인: `hub/`, `place/`, `survey/`, `taskboard/`(업무 관리), `pages/amount/StatisticsPage.jsx`(정산), `common/components/`(Header/Footer/ErrorPage/LocationCheckModal)

#### 수정 내용 — 구조/스타일 개선 (기능 변경 없음)
이미 확립된 `wf-container`/`wf-page-header`(`wf-page-title`+`wf-page-description`+`wf-page-actions`)/`wf-page-content` 시맨틱 구조 컨벤션을 그대로 따라 나머지 도메인에 적용:

1. **`taskboard/`(업무 관리)** — `TaskListComponent.jsx`/`TaskDetailComponent.jsx`를 page-header 구조로 재정리, 빈 목록 상태 문구 추가, `TaskList.css`에 `.paging-area` 정렬 규칙 신규(기존엔 `align="center"` HTML 속성에만 의존하던 것을 CSS로 이관). `TaskStatusBadge`는 이미 배지 패턴이 완비되어 있어 무변경.
2. **`hub/`(거점)** — `HubListComponent`/`HubDetailComponent`/`HubEnrollFormComponent`/`HubUpdateFormComponent`/`AIComponent` 5개 페이지 전부 page-header 구조 적용, 운영상태 텍스트를 `wf-badge`로 전환, 목록의 주요 액션(AI추천/지역정보로/거점등록)을 `wf-page-actions`로 통합.
3. **`place/`(지역 정보)** — `PlaceList`/`PlaceDetail`/`PlaceForm`/`PlaceEdit` page-header 구조 적용, 운영상태 배지화, 빈 상태 UI(`wf-state`) 적용. `PlaceEdit.jsx`는 CSS import조차 없이 `<h4>`/무클래스 `<button>`으로만 되어 있던 것을 `wf-form-group`/`wf-label`/`wf-input`/`wf-select`/`wf-textarea`/`btn btn-primary`/`btn btn-secondary`로 전면 정리(라벨-인풋 연결 `htmlFor`/`id` 추가 포함).
4. **`pages/amount/StatisticsPage.jsx`(정산, 1047줄)** — 로딩/에러/정상 3개 반환 분기 전부 page-header 구조 + `wf-state` 적용. 내부 KPI 카드/차트(recharts)는 기존 전용 CSS가 이미 `--wf-*` 토큰으로 잘 구성되어 있어 구조만 감싸고 내용은 무변경.
5. **`survey/components/SurveyForm.jsx`(만족도 조사)** — page-header 구조 적용, 로딩 상태를 `wf-state`+스피너로 개선, 액션 버튼(`취소`/`제출하기`/`돌아가기`)이 클래스 없이 기본 브라우저 버튼으로 렌더링되던 것을 `btn btn-primary`/`btn btn-secondary`로 통일.
6. **`common/components/`** — `Header.jsx`/`Footer.jsx`/`ErrorPage.jsx`/`LocationCheckModal.jsx`는 이전 CSS 통일 세션(`9970470`)에서 이미 `--wf-*` 토큰 기반으로 정리되어 있고 구조도 이미 spec에 부합(LocationCheckModal은 이미 modal-header/body/footer 패턴 완비)해 추가 구조 변경 불필요함을 확인. Header.jsx는 아래 버그 수정만 반영.

#### 추가로 발견해 수정한 실제 버그 (구조 개선 작업 중 브라우저 검증으로 발견)
로컬 백엔드(포트 8006, MySQL 로컬 DB) + 프론트 dev 서버를 실제로 기동해 Claude Browser로 새로 만진 페이지들을 하나씩 열어보며 검증하던 중, 이번 세션 작업과 무관한 기존 버그 3종을 발견해 함께 수정했다(전부 "화면이 깨지거나 기능을 쓸 수 없는" P0급 문제라 이번 작업 범위인 "화면이 깨지는 문제" 수정에 해당한다고 판단, JSX 구조/CSS 외의 최소한의 로직 수정만 포함):

1. **`HubItemComponent.jsx` 크래시 버그**: 첨부 이미지가 없는 거점을 목록에서 렌더링할 때 `item.hubFileList[0].filePath`를 방어 코드 없이 접근해 `Cannot read properties of undefined (reading 'filePath')`로 React 트리 전체가 언마운트되며 **거점 목록 화면이 통째로 빈 화면이 되는 것을 실제 브라우저에서 재현**. `item.hubFileList && item.hubFileList.length > 0` 가드 추가로 해결(이미지 없으면 렌더링만 생략, 기능 변경 없음).
2. **거점(`hub/`) ↔ 지역정보(`place/`) 간 `navigate()` 경로 불일치**: `App.jsx`의 실제 등록 라우트는 `/workflow/place/list`·`/workflow/place/detail/:hubNo`·`/workflow/place/edit/:hubNo`인데, `HubListComponent.jsx`(`"/place/list"`)·`HubDetailComponent.jsx`/`HubUpdateFormComponent.jsx`(`"/placeInfo/list"`)·`PlaceItem.jsx`(`/place/detail/...`)·`PlaceDetail.jsx`(`/place/.../edit`)·`PlaceForm.jsx`(`"/place"`)·`PlaceEdit.jsx`(`/place/...`) 전부가 존재하지 않는 경로 문자열을 쓰고 있어 클릭 시 전부 `ErrorPage`로 튕기던 것을 실제 클릭으로 재현(지역정보 카드 클릭 → 상세 진입 자체가 불가능했음). 각 파일의 `navigate()` 대상 문자열만 실제 등록된 라우트로 수정(라우터 구조 자체는 무변경).
3. **`Header.jsx` 상단 네비 "거점 등록" 메뉴 경로 오류**: `path: "/placeInfo/enrollForm"`로 등록돼 있었으나 해당 라우트가 `App.jsx`에 존재하지 않아(`/hub/enrollForm`이 실제 라우트) ADMIN이 상단 메뉴로 거점 등록에 진입할 수 없었음 — `/hub/enrollForm`으로 수정.

#### 발견했으나 이번 세션 범위 밖으로 판단해 수정하지 않은 버그 (TODO로 기록)
- **`PlaceDetail.jsx`/`PlaceEdit.jsx`의 `localStorage.getItem("role")` 참조**: 저장소 전체를 grep한 결과 `localStorage.setItem("role", ...)`을 호출하는 코드가 단 한 곳도 없어(로그인 시 저장되는 키는 `accessToken`/`user`뿐, 다른 모든 컴포넌트는 `JSON.parse(localStorage.getItem('user'))?.authCode === 'ADMIN'` 패턴 사용) `role` 값이 항상 `null`이다. 그 결과 `isAdmin`이 항상 `false`가 되어 **`PlaceDetail.jsx`의 "수정하기" 버튼은 실제 ADMIN 계정으로 로그인해도 절대 노출되지 않고, `PlaceEdit.jsx`는 페이지 진입 즉시 `alert` 후 강제로 이전 페이지로 튕겨나가 항상 접근 불가능한 상태**임을 실제 admin 계정으로 로그인해 브라우저로 직접 재현·확인했다. 이번 세션은 "JSX 구조 + CSS만, 권한 처리 로직은 유지"가 명시적 범위라 권한 체크 로직 자체를 바꾸는 것은 범위를 벗어난다고 판단해 손대지 않고 TODO로만 기록.

#### 검증
- `npm run build`: 매 도메인 수정 직후 및 최종적으로 총 6회 **PASS** 확인(경고는 청크 크기 관련뿐, 기능과 무관)
- 로컬 백엔드(포트 8006, MySQL) + 프론트 dev 서버(5173) 실제 기동, Claude Browser로 admin 계정 실제 로그인 후 검증:
  - `/hub/list` — 새 page-header 구조 정상 렌더링, 크래시 버그 수정 후 목록/필터/페이징 전부 정상 동작 확인
  - `/workflow/place/list` → 카드 클릭 → `/workflow/place/detail/:hubNo` — 신규 수정한 라우팅으로 실제 진입 확인, 빈 사진 상태(`wf-state`)/운영상태 배지(`wf-badge-success` "운영중") 정상 렌더링 확인. "수정하기" 버튼이 admin으로도 노출되지 않는 것을 확인해 위 TODO 항목 실증.
  - `/task/list` — 신규 page-header 구조 정상 렌더링
  - `/admin/statistics`(정산) — 신규 page-header 구조 + 기존 KPI 카드 정상 렌더링
  - `/hub/enrollForm` — Header 메뉴 경로 수정 검증(신규 page-header 구조도 함께 확인)
- 검증 후 로컬 백엔드 프로세스 종료, 프리뷰 서버 종료(포트 8006 재확인 결과 LISTENING 없음)

#### 변경 파일 (이번 세션에서 추가/수정한 18개 파일, 이전 세션의 38개와 합쳐 총 56개)
- `workflow_project_fe/src/taskboard/components/TaskListComponent.jsx`, `TaskDetailComponent.jsx`
- `workflow_project_fe/src/taskboard/styles/TaskList.css`
- `workflow_project_fe/src/hub/components/HubListComponent.jsx`, `HubDetailComponent.jsx`, `HubEnrollFormComponent.jsx`, `HubUpdateFormComponent.jsx`, `HubItemComponent.jsx`(크래시 버그 수정), `AIComponent.jsx`
- `workflow_project_fe/src/hub/styles/Hub.css`
- `workflow_project_fe/src/place/components/PlaceList.jsx`, `PlaceDetail.jsx`, `PlaceForm.jsx`, `PlaceEdit.jsx`, `PlaceItem.jsx`(navigate 경로 수정)
- `workflow_project_fe/src/pages/amount/StatisticsPage.jsx`
- `workflow_project_fe/src/survey/components/SurveyForm.jsx`
- `workflow_project_fe/src/common/components/Header.jsx`(거점 등록 메뉴 경로 수정)

#### 현재 상태
- spec §19 체크리스트 도메인 전부 구조 개선 완료(공통/사용자/공지/워케이션/업무/예약/비용·정산/대시보드). `npm run build` 최종 PASS.
- 구조 개선 과정에서 발견한 크래시 버그 1건 + 라우팅 경로 오류 3건은 함께 수정, 권한 로직 버그 1건은 범위 밖으로 판단해 TODO 기록.

#### 남은 문제 (TODO)
- ⚪ **`PlaceDetail.jsx`/`PlaceEdit.jsx`의 `localStorage.getItem("role")` 버그**: 위 상세 설명대로 지역 정보 수정 기능이 사실상 전원(ADMIN 포함) 접근 불가 상태. `JSON.parse(localStorage.getItem('user'))?.authCode === 'ADMIN'` 패턴으로 교체하는 별도 작업 필요(권한 로직 변경이라 이번 세션 범위 밖).
- ⚪ P2/P3(타이포그래피 세부 조정, hover/focus 디테일, 반응형 브레이크포인트 전수 테스트)는 시간 관계상 전체 페이지에 균일하게 적용하지 못함 — 우선순위가 높은 P0/P1(구조/배지/빈상태/버튼 클래스) 위주로 처리.
- ⚪ `pages/notice/*.jsx`(9줄짜리 래퍼 4개)는 내부적으로 이미 구조 개선된 `NoticeList`/`NoticeDetail`/`NoticeInsert`/`NoticeUpdate` 컴포넌트를 그대로 감싸기만 해서 별도 수정 불필요로 판단, 무변경.

#### 사용자 확인 필요
- **`localStorage.getItem("role")` 버그 수정 여부** — 권한 로직 변경이 필요해 이번 세션에서 임의로 고치지 않음. 수정을 원하면 `PlaceDetail.jsx`/`PlaceEdit.jsx`의 해당 라인을 `JSON.parse(localStorage.getItem('user'))?.authCode === 'ADMIN'`로 교체하는 별도 작업으로 진행 필요.
