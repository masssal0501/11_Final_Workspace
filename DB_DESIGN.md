# DB_DESIGN.md

DB 기준 스키마(Source of Truth): **`SQL/WorkFlow_Script.sql`** (2026-09-09 확정)
> `SQL/WorkFlow_Script_Nam_ver.sql`은 기준이 아님. 충돌 시 `WorkFlow_Script.sql` → README → 현재 Java 코드 순으로 판단.

**2026-09-09 (STEP 8)**: `SQL/WorkFlow_Script.sql`을 **AWS RDS(MySQL 8.4.6)에 실제로 실행해 스키마 초기화 완료** — `SHOW TABLES` 결과 아래 22개 테이블 전부 생성 확인: `amount`, `amount_file`, `amount_item`, `amount_list`, `authority`, `department`, `employee`, `hub`, `hub_file`, `job`, `notice`, `notice_file`, `reservation`, `survey_answer`, `survey_question`, `task`, `task_history`, `verification`, `work`, `work_file`, `workcation_info`, `workcation_survey`. 스크립트 실행 자체에는 문제가 없었음을 실제 클라우드 MySQL 환경으로 확인함. 이번 STEP에서 스키마 자체의 추가 변경은 없음(아래 [확인 필요] 항목 3·4의 facility 부분은 계속 보류). RDS에는 초기 공통데이터(job/department/authority)와 시드 관리자 계정 1건만 있고 실제 업무 데이터는 없는 상태.

**2026-09-09 업데이트**: 아래 "[확인 필요] 목록"의 6개 항목에 대해 사용자 결정을 받아 반영 완료. 각 항목의 최종 처리 내용은 "[확인 필요] 목록 → 처리 결과"(하단)에 기록. 이 결정 과정에서 원래 6개 항목에 포함되지 않았던 `amount_item`(컬럼명/누락 필드)과 `amount_file`(PK/타임스탬프 컬럼명)의 정렬도 "SQL이 최종 기준"이라는 동일 원칙을 적용해 함께 정리했음 — 아래 표에 반영.

이 문서는 테이블마다 `Entity / Repository / Service / Controller / Frontend API` 매핑과 정합성 상태를 기록한다.
상태 기호: ✅ 일치 / ⚠️ 경미한 불일치(동작에 영향 적음) / 🔴 불일치(수정 필요) / ❓ 사용자 확인 필요(구조적 충돌) / ⛔ 대응 코드 없음

---

## job / department / authority (기준 코드 테이블)

- `job`, `authority`: 대응 Entity 없음. `Employee.jobCode`/`Employee.authCode`는 평범한 String 컬럼(FK는 SQL에만 존재, JPA 연관관계 없음). ⚠️ 설계상 허용 가능(코드성 테이블이라 관계 매핑 없이 문자열 검증만 하는 경우가 흔함) — 리팩토링 시 관계로 바꿀지 여부는 낮은 우선순위.
- `department` ↔ `Department` ✅ 완전 일치 (`dep_id CHAR(2)`, `dep_title`)

## employee

- `employee` ↔ `Employee` (`WorkFlow_Project_BE/src/main/java/com/kh/workflow/employee/model/vo/Employee.java`) ✅ 컬럼명/길이/nullable 모두 일치 (`email VARCHAR(100)`, `dep_id CHAR(2)`, `pw_chg_required BOOLEAN DEFAULT TRUE` 등)
- Repository: `EmployeeDao`(JPA) / Service: `EmployeeService`+`EmployeeServiceImpl` / Controller: `EmployeeController` (`/employees`) / Frontend: `employeeApi.js`

## hub / hub_file

- `hub` ↔ `Hub.java` ✅ / `hub_file` ↔ `HubFile.java` ✅ (양쪽 다 컬럼 매핑 정상)
- Repository: `HubDao`(JPA) / Controller: `HubController`(`/hubs`, `@RequestMapping` 없이 경로 하드코딩) / Frontend: `hubApi.js`
- 동일 `Hub` 엔티티를 `place` 모듈이 별도 DAO(`PlaceDao`)로 재사용 중 (hub_type 1,2 = hub 모듈 / 3,4,5 = place 모듈) — 스키마 문제는 아니고 모듈 중복 설계 이슈 (PROJECT_STATUS.md 참고)

## workcation_info

- ↔ `WorkcationInfo.java` — 컬럼명 전부 일치 (`approver_at`↔`approvetAt` 필드명은 오타지만 `@Column(name="approver_at")`로 명시 매핑되어 있어 DB 동작에는 영향 없음, 코드 가독성 문제일 뿐)
- ✅ **[해결됨, 2026-09-09]** `approver_state` 기본값 — [확인 필요] 항목 1 결정에 따라 `SQL/WorkFlow_Script.sql`의 `DEFAULT`를 `'R'`→`'W'`로 변경하고 코멘트에 `W 대기`를 추가해 Entity(`DEFAULT 'W'`, allowableValues에 `W` 포함)와 일치시킴. Entity는 이미 `W`를 쓰고 있어 Java 코드 변경 없음.
- Repository: `WorkcationDao`(JPA, ~30개 커스텀 `@Query`) / Controller: `WorkcationController`(`/workcation`) / Frontend: `WorkcationApi.js`

## reservation

- ↔ `Reservation.java` ✅ 일치 (`rsv_no`, `rsv_status` N/C/Y, `workcation_no`/`hub_no` FK)
- Repository: `ReservationDao`(JPA) / Controller: `ReservationController`(`/reservations`) / Frontend: `reservationApi.js`
- `GET /reservations/facilities`는 스텁(항상 빈 리스트) — SQL에 `facility` 테이블 자체가 없음 → 신규 테이블 필요 여부는 **[확인 필요] 항목 4**

## work / task / task_history / work_file

- `work` ↔ `Work.java` ✅
- `task` ↔ `Task.java` ✅ **완전 일치** (`progress INT NOT NULL DEFAULT 0` 포함 — 이전 조사에서 "progress 컬럼 없음"으로 잘못 보고되었던 부분, 재확인 결과 SQL에 존재함을 확정)
- `task_history` ↔ `TaskHistory.java` ✅ **완전 일치** (이전 조사에서 "테이블 없음"으로 잘못 보고되었던 부분, 재확인 결과 SQL에 존재함을 확정)
- `work_file` ↔ **대응 Entity 없음.** 대신 `TaskFile.java`가 `@Table(name="task_file")`로 **존재하지 않는 테이블**을 가리키고 있고, PK도 `taskfile_no`(SQL은 `workfile_no`), FK도 `task_no`가 아니라 엉뚱하게 `amount_no`(nullable=false)로 되어 있음(AmountFile 복붙 흔적으로 추정). 🔴 어느 DAO/Service도 `TaskFile`을 참조하지 않아 완전한 고아 엔티티. → **[확인 필요] 항목 3**
- Repository: `TaskDao`(JPA, 통계 전용 커스텀 쿼리 다수), `TaskHistoryDao`(JPA, 커스텀 메서드 없음) / Controller: **없음** (`WorkcationController.updateTask()`가 `TaskDao`/`TaskHistoryDao`를 직접 주입받아 처리, `task` 패키지의 `TaskService`는 `@Service` 없는 빈 클래스로 죽은 코드) / Frontend: 없음(`TaskListComponent.jsx`가 더미데이터만 사용, `taskApi.js` 파일 자체가 없음)

## amount / amount_item / amount_list / amount_file

전부 **[해결됨, 2026-09-09]** — [확인 필요] 항목 2, 5, 6 결정에 따라 처리 완료:

- **`Amount` → `amount` 테이블.** [Amount.java](WorkFlow_Project_BE/src/main/java/com/kh/workflow/amount/model/vo/Amount.java) `@Table`을 `amount_support`→`amount`로 수정. `AmountSupport.java`/`AmountSupportDao.java`는 참조 재확인 결과(grep, 코드베이스 전체) 실제 참조 0건 확인(`DashboardServiceImpl`/`AmountDao`에 있던 "AmountSupport" 매치는 `selectAmountSupport`/`setAmountSupport`라는 무관한 메서드명에 대한 우연한 문자열 일치였음) — 두 파일 삭제 완료.
- **`AmountItem`을 `amount_item` 컬럼에 맞춤** (SQL이 최종 기준이라는 원칙을 항목 2/6과 동일하게 적용, Java 필드명은 유지해 API 응답 JSON 계약은 변경 없음):
  - `itemAmount` 필드의 `@Column`을 `item_amount`→`amount`로 수정 (Java 필드명 `itemAmount`는 그대로라 프론트가 받는 JSON 키는 안 바뀜)
  - SQL에 있던 `item_approved`(항목별 결재상태), `item_approved_amount`(항목별 승인금액, 기본값 0) 두 컬럼에 대응하는 필드를 신규 추가(`itemApproved`, `itemApprovedAmount`) — 추가만 했을 뿐 기존 로직에서 사용을 강제하지 않아 회귀 위험 없음
- **`SupportList`(지자체 지원금)를 1:N 구조로 확정** — 결정: "하나의 비용 신청에 여러 지원처가 붙을 수 있다"가 맞는 비즈니스 규칙. `SupportList.java`의 필드 구조(`@ManyToOne Amount`, 자체 auto-increment PK) 자체는 원래도 이미 이 구조였으므로 바꾸지 않았지만, **`@Table(name="support_list")`가 존재하지 않는 테이블명을 가리키던 것을 처음 처리할 때 `amount_list`로 고치는 것을 누락**했었고, 이는 2026-09-09 실제 API 테스트(`POST /api/v1/amounts` 실행 중 `Table 'workflow.support_list' doesn't exist` 오류)로 발견해 수정 완료. `SQL/WorkFlow_Script.sql`의 `amount_list` 테이블은 다음과 같이 재설계:
  - PK를 `amount_no`(겸 FK) 단독 → 별도 auto-increment `support_no`로 변경
  - `amount`(단일 금액) → `request_amount` + `approved_amount`(기본값 0) 두 컬럼으로 분리
  - `transport_supported`/`other_supported`(VARCHAR(1), 기본값 'N') 컬럼 추가
  - `item_no` FK(amount_item 참조)는 제거 — 현재 `SupportList.java`/`AmountDao`의 실사용 쿼리가 전부 `amount` 단위로만 지원처를 다루고 있어(항목 단위 연결 없음) 기존 코드/Frontend와 가장 자연스럽게 맞음
  - `amount_no` FK(→`amount`)는 유지, `idx_amount_list_amount` 인덱스 신규 추가
- **`AmountFile`을 `amount_file` 컬럼에 맞춤**:
  - PK `@Column`을 `amountfile_no`→`amountattachment_no`로 수정 (Java 필드명 `amountFileNo`는 유지, JSON 계약 불변)
  - 타임스탬프 `@Column`을 `created_at`→`updated_at`으로 수정 (SQL에 `created_at` 컬럼 자체가 없음, Java 필드명 `createdAt`은 유지, JSON 계약 불변)
  - `origin_name`/`change_name` 길이를 SQL과 동일하게 255→225로 조정
  - `fileSize` 필드는 **삭제** (SQL에 `file_size` 컬럼 없음) — 참조하던 `AmountServiceImpl.saveNewFiles()`와 `AmountController.createAmount()`의 `setFileSize(...)` 호출 2곳도 함께 제거함
- Repository: `AmountDao`(JPA, 통계/대시보드 쿼리 다수, `AmountItem`/`SupportList`/`AmountFile` 관련 쿼리 포함) / Controller: `AmountController`(`/api/v1/amounts`) / Frontend: `amountApi.js`(+ `Amount/components/*.jsx`)

**참고**: `AmountServiceImpl.selectAmountList(Pageable)`/`selectAmountListByWorkcationNo(int, Pageable)` 스텁(`return null`)도 함께 수정 — `AmountDao`에 이미 있던 `findAllByOrderByCreatedAtDescAmountNoDesc`/`findByWorkcationNoOrderByCreatedAtDescAmountNoDesc`에 연결. `GET /api/v1/amounts`, `GET /api/v1/amounts/workcation/{no}` 500 오류 해결.

**✅ [해결됨, 2026-09-09] `AmountForm.jsx` 요청 포맷 (PROJECT_STATUS.md 신규 항목 7, A안 채택)**: `AmountForm.jsx`를 `FormData` 조립 방식으로 재작성해 백엔드의 `@ModelAttribute Amount` + `multipart/form-data` 계약을 그대로 유지했다. 실제 로컬 DB에 연결한 백엔드로 end-to-end 테스트하는 과정에서 다음 두 가지 별개의 버그를 추가로 발견/수정했다(둘 다 이번 세션 이전부터 존재하던 잠재 버그로, 최초 실제 요청 테스트를 해봐서야 드러남):
- **Jackson 순환참조**: `AmountItem`/`AmountFile`/`SupportList`의 `amount`(부모 `@ManyToOne` 역참조) 필드에 `@JsonIgnore`가 없어 `Amount`를 JSON으로 반환하는 모든 엔드포인트(`POST /api/v1/amounts`, `GET /api/v1/amounts/{no}`, `GET /api/v1/amounts`, `GET /api/v1/amounts/workcation/{no}`)가 무한에 가깝게 순환 직렬화됨 — 세 필드 모두에 `@JsonIgnore` 추가로 해결.
- **`SecurityConfig`의 `/error` 미포함**: 예외 발생 시 서블릿 컨테이너의 내부 `/error` forward가 인증 요구 규칙에 걸려, 실제 오류 상태코드/메시지 대신 항상 빈 403이 반환되던 버그(애플리케이션 전역 영향) — `/error`를 permitAll에 추가로 해결.

## notice / notice_file — ✅ JPA 전환 완료 (2026-09-09, STEP 7)

- `notice` ↔ `Notice.java`(`@Entity`로 전환) — 컬럼 전부 일치 (`notice_no`,`notice_title`,`notice_content`,`created_at`,`notice_status`,`view_count`,`emp_no`). `created_at`은 기존 `java.sql.Timestamp`에서 코드베이스 전반의 컨벤션(Amount/WorkcationInfo 등)에 맞춰 `LocalDateTime`으로 정규화(JSON 응답은 여전히 ISO-8601 문자열이라 프론트 영향 없음).
- `notice_file` ↔ `NoticeFile.java`(`@Entity`로 전환, `Notice`에 대한 `@ManyToOne` + `@JsonIgnore`로 순환참조 방지 — Amount 계열과 동일 패턴).
- Repository: `NoticeRepository extends JpaRepository<Notice,Integer>`(신규) / Service: `NoticeService`(인터페이스 무변경) + `NoticeServiceImpl`(내부 구현을 JPA 기반으로 재작성) / Controller: `NoticeController`(**무변경** — Service 인터페이스를 그대로 유지해 컨트롤러 코드를 건드릴 필요가 없었음) / Frontend: `noticeApi.js`(무변경)
- ✅ **버그 해결**: `NoticeDao.isAdmin()`의 MyBatis statement id 불일치 버그(`noticeMapper.isAdmin` vs 실제 정의 `selectIsAdminByLoginId`)를 MyBatis 자체를 걷어내면서 근본 해결 — `EmployeeDao.findByEmpId()` 기반의 JPA 조회로 대체. 실제 로컬 DB로 STAFF/ADMIN 양쪽 토큰으로 등록/수정/삭제를 호출해 정상 차단·허용을 확인.
- ✅ **의존관계 처리**: `DashboardServiceImpl`(관리자/부서장/사원 대시보드 3곳)이 `NoticeDao`+`SqlSessionTemplate`을 직접 호출하던 것을 `NoticeService.selectNoticeList(map)` 호출로 교체 — 실제 `/dashboard/admin` API 호출로 대시보드 공지 위젯이 정상 동작함을 확인.
- ✅ **삭제 완료**: `NoticeDao.java`(MyBatis), `notice-mapper.xml` — 전체 코드베이스에서 참조 0건(자기 자신 제외) 확인 후 삭제, 삭제 후 재컴파일/재기동/재검증까지 통과.
- ⚠️ **[확인 필요] 신규 발견 — 조회수 증가 미구현**: 기존 MyBatis 구현에서도 `selectNotice`(상세조회)가 `view_count`를 증가시키는 로직이 전혀 없었음(단순 SELECT뿐). "기존 기능과 동일하게 동작"을 원칙으로 이번 JPA 전환도 증가 로직을 추가하지 않고 그대로 포팅함 — 즉 상세조회 시 조회수가 오르지 않는 것은 이번 전환으로 생긴 문제가 아니라 원래부터 있던 상태. 필요하면 별도로 추가 여부 결정 필요.
- ⚠️ **[확인 필요] 신규 발견 — 첨부파일 기능 미구현**: `NoticeController`가 `files`(MultipartFile 목록)를 받고 `Notice.setFiles()`로 전달은 하지만, 기존 MyBatis 매퍼에는애초에 `notice_file` 테이블에 INSERT/조회하는 statement가 하나도 없어 파일이 실제로 저장된 적이 없었음(`NoticeFile` VO도 어디서도 채워지지 않는 죽은 코드였음). JPA 전환에서도 `NoticeFile` 엔티티/`Notice.fileList` 관계는 구조만 갖춰두고(향후 구현 대비) 실제 저장 로직은 추가하지 않아 기존과 동일하게 항상 빈 배열로 응답함 — 실제로 파일 업로드 기능을 완성할지는 별도 결정 필요.
- ⚠️ **[확인 필요] 신규 발견 — Frontend 관리자 권한 체크 버그**: `NoticeDetail.jsx`/`NoticeInsert.jsx`가 앱 전역 로그인 저장 방식(`localStorage`의 `user.authCode`)이 아니라 어디서도 설정된 적 없는 `sessionStorage`의 `loginMember.role==='S'`를 참조하고 있어, **실제 관리자로 로그인해도 공지 등록/수정/삭제 버튼이 전혀 동작하지 않는 버그**였음(이번 STEP 7 검증 과정에서 발견). Notice 모듈 자체 파일이라 이번 작업 범위 내로 판단해 `localStorage`/`authCode==='ADMIN'` 기준으로 수정 완료(스키마/API 계약 변경 아님, 순수 프론트 버그 수정).

## survey_question / workcation_survey / survey_answer

- `survey_question` ↔ `SurveyQuestion.java` 🔴 두 가지 불일치:
  1. SQL에 `question_order INT NOT NULL UNIQUE`가 있는데 Entity에 해당 필드가 **없음**
  2. Entity `allowableValues={"S","T","M"}` — 실제 SQL 코멘트/시드 데이터는 `SCORE`/`TEXT`/`SCORE_TEXT`(문자열 전체), 완전히 다른 코드 체계
- `workcation_survey` ↔ `WorkcationSurvey.java`, `survey_answer` ↔ `SurveyAnswer.java` — 개별 재확인 전이나 이전 조사에서 큰 구조적 문제는 없었음(경미한 `updated_at` 기본값 메타데이터 차이 정도로 추정, ddl-auto 미사용이라 런타임엔 영향 없음)

## verification

- ✅ **[구현 완료, 2026-09-09]** — [확인 필요] 항목 4 결정("verification은 스키마 변경 없이 기능 구현 진행")에 따라 신규 구현:
  - Entity: [Verification.java](WorkFlow_Project_BE/src/main/java/com/kh/workflow/employee/model/vo/Verification.java) — `verification` 테이블 컬럼과 완전히 일치 (`verification_no` PK, `verification_code`, `expires_at`, `verified_at`, `created_at`, `emp_no` FK → `Employee` `@ManyToOne`)
  - Repository: [VerificationDao.java](WorkFlow_Project_BE/src/main/java/com/kh/workflow/employee/model/dao/VerificationDao.java)(JPA)
  - Service: `EmployeeService`/`EmployeeServiceImpl`에 `requestPasswordReset`(1단계: empId+email 확인 → 6자리 인증번호 생성·저장(5분 유효)·이메일 발송) / `verifyPasswordResetCode`(2단계: 인증번호 확인 → 임시 비밀번호 발급·저장·이메일 발송, 기존 `TemporaryPasswordGenerator`/`MailService.sendTemporaryPassword` 재사용)
  - Controller: `POST /employees/password/reset/request`, `POST /employees/password/reset/verify` (둘 다 `SecurityConfig`에 `permitAll` 추가 — 로그인 전 사용자가 호출해야 하므로)
  - Frontend: [FindPWForm.jsx](workflow_project_fe/src/employee/components/FindPWForm.jsx) 2단계 UI로 재작성(기존엔 버튼에 핸들러 자체가 없는 정적 화면이었음), [employeeApi.js](workflow_project_fe/src/employee/api/employeeApi.js)에 `requestPasswordReset`/`verifyPasswordResetCode` 함수 추가
  - `아이디 찾기`(`POST /employees/findId`)는 원래도 백엔드 구현이 정상이었고 프론트 `FindIDForm.jsx`도 올바르게 호출하고 있었음 — 버그는 오직 `employeeApi.js`의 `findEmployeeId`가 인자를 무시하고 `GET /employees`(전체 목록)를 호출하던 것뿐이라 이 부분만 `POST /employees/findId`로 수정.

---

## MyBatis 사용 영역 전체 검색 결과 (STEP 4, 2026-09-09 STEP 7 완료 후 최신화)

당초 MyBatis를 실제로 사용하던 파일은 `notice` 관련 정확히 3개(`NoticeDao.java`, `NoticeServiceImpl.java`, `DashboardServiceImpl.java`)였음 — **STEP 7에서 전부 JPA로 전환 완료, 현재 MyBatis 실사용 코드는 프로젝트 전체에서 0건**(`SqlSessionTemplate`/`noticeMapper` 등 재검색 결과 참조 없음). `mybatis-spring-boot-starter` 의존성과 `mybatis.*` 설정(`application.properties`)은 아직 정리하지 않고 남아있음(이번 STEP 7 요청 범위 밖으로 판단, 필요 시 후속 작업으로 제거 가능).

---

## [확인 필요] 목록 (섹션 23 형식) — 결정/처리 현황

| 항목 | 결정 | 처리 상태 |
|---|---|---|
| 1. `approver_state` 기본값 | SQL을 `'W'`로 변경 | ✅ 완료 (SQL 수정) |
| 2. `Amount`/`AmountSupport` | `Amount`→`amount` 테이블, `AmountSupport` 계열 삭제 | ✅ 완료 (참조 0건 확인 후 삭제) |
| 3. `TaskFile` | 현재 보류 | ⏸ 보류 (SQL/Entity 미변경) |
| 4. `facility`/`verification` | facility 보류, verification 기능 구현 | ✅ verification 구현 완료 / ⏸ facility 보류 |
| 5. `SupportList` 카디널리티 | 여러 지원처 가능(1:N) 확정 | ✅ 완료 (SQL `amount_list` 재설계, Java는 원래도 1:N 구조라 무변경) |
| 6. `amount_file.file_size` | Entity 매핑에서 제거 | ✅ 완료 (참조 2곳 함께 정리) |

아래는 각 항목의 원래 논의 기록(참고용, 결정 내용은 위 표 및 해당 테이블 섹션 참조).

### 항목 1. `workcation_info.approver_state` 기본값/허용값

**현재**
- 기존 구조: `WorkcationInfo.java`는 `DEFAULT 'W'`, `allowableValues={"A","C","H","J","R","W"}`로 "대기(W)" 상태를 사용 중
- README 요구사항: 신청 상태 흐름은 "임시저장→신청→검토중→승인/반려"로 서술 — "대기"에 해당하는 별도 상태명이 명시되어 있진 않음
- `WorkFlow_Script.sql`: `DEFAULT 'R'`, 코멘트는 `A 승인, C 취소, H 보류, J 반려, R 검토` (**W 없음**)

**충돌/문제**
Java 코드는 신청 직후 상태를 `'W'`(대기)로 시작해 부서장이 검토를 시작하면 `'R'`(검토중)로 바뀌는 2단계 흐름을 전제하는 것으로 보이나, SQL은 애초에 `'R'`을 초기값으로 잡고 있어 "대기" 단계가 없음. `ApprovalDao`의 승인 대기열 쿼리들이 `'H','R','W'`를 함께 필터링하고 있어, SQL 그대로 가면 신청 직후 상태가 `'R'`이 되어 동작 자체는 문제없이 흘러갈 가능성이 높지만, "대기(W)"라는 상태 자체가 UI/통계에서 의미를 잃음.

**선택지**
A. 기존 구조 유지 — Entity 기본값을 `'W'`로, SQL도 `WorkFlow_Script.sql`에 `'W'`를 추가 반영(코멘트+DEFAULT 값 수정)
B. README 기준으로 변경 — README는 이 세부 상태를 규정하지 않으므로 사실상 판단 불가
C. SQL 기준으로 변경 — Entity 기본값을 `'R'`로 바꾸고 `allowableValues`에서 `'W'` 제거, "대기"라는 상태 개념 자체를 없앰

**추천**: A (SQL에 `'W'`를 추가하는 쪽)
**이유**: `ApprovalDao`, 프론트 대시보드, `Workflow_Script_Data.sql`이 이미 `'W'`를 전제로 만들어져 있어 코드 변경 범위가 SQL 한 줄 수정보다 훨씬 큼. SQL 파일 자체를 "최종 배포 기준"으로 유지보수하는 것이 지침 15번("필요한 수정사항 발견 시 최종적으로 WorkFlow_Script.sql에 반영")과도 부합.

---

### 항목 2. `amount`/`amount_support` 테이블명 및 `AmountSupport` 처리

**현재**
- 기존 구조: `Amount.java`, `AmountSupport.java` 둘 다 `@Table(name="amount_support")`
- WorkFlow_Script.sql: 테이블명은 `amount`, `amount_support`라는 테이블 자체가 없음

**충돌/문제**
`Amount`가 실사용 엔티티(`AmountDao`가 이를 기반으로 동작)이므로 `@Table` 이름만 `amount`로 고치면 나머지 컬럼은 이미 SQL과 일치한다. `AmountSupport`는 `AmountSupportDao`의 제네릭 타입이 `Amount`로 잘못 선언되어 있어 사실상 어디서도 정상 동작하지 않는 고아 코드.

**선택지**
A. `Amount.java`의 `@Table`만 `amount`로 수정하고, `AmountSupport.java`/`AmountSupportDao.java`는 일단 남겨둔 채 미사용 표시만
B. A에 더해 `AmountSupport.java`/`AmountSupportDao.java`를 삭제
C. 그대로 유지(비추천 — 존재하지 않는 테이블을 가리키는 죽은 매핑을 방치)

**추천**: B
**이유**: `AmountSupportDao`는 컴파일은 되지만 제네릭 타입 오류(`JpaRepository<Amount,Integer>`인데 클래스명은 `AmountSupportDao`)로 사실상 처음부터 의도대로 동작한 적이 없는 코드이고, 참조하는 Controller/Service가 전혀 없음(지침 14번 Dead Code 절차대로 reference 검색 완료 — 참조 0건 확인). 다만 삭제는 지침에 따라 사용자 승인 후 진행.

---

### 항목 3. `TaskFile` ↔ `work_file` 재설계 필요

**현재**
- 기존 구조: `TaskFile.java`가 `@Table(name="task_file")`, PK `taskfile_no`, FK 필드가 `task_no`가 아니라 `amountNo`
- WorkFlow_Script.sql: 실제 파일 테이블명은 `work_file`, PK `workfile_no`, FK는 `task_no`(→ `task` 테이블 참조)

**충돌/문제**
`TaskFile`을 참조하는 DAO/Service/Controller가 프로젝트 어디에도 없음(reference 검색 완료, 0건). 업무(Task) 첨부파일 기능 자체가 백엔드/프론트 양쪽에서 완전히 미구현 상태.

**선택지**
A. `TaskFile.java`를 `work_file` 테이블에 맞춰 재작성(테이블명/PK명/FK를 `Task`에 대한 `@ManyToOne`으로 교체)하고 `TaskFileDao`/Service/Controller까지 신규 구현 — 업무 첨부파일 기능을 실제로 완성
B. 지금 당장은 손대지 않고 "구현 대상 후보"로만 기록, 우선순위가 낮으므로 후순위 작업으로 미룸

**추천**: B (지금 단계에서는)
**이유**: README에는 "업무 완료 및 결과 기록"까지만 언급되고 첨부파일 필수 여부가 명시되어 있지 않음. 지침 20번 테스트 우선순위 기준으로도 Task는 3순위이며, 지금 무리하게 새 Repository/Controller를 만드는 것보다 1~2순위(Login/Employee/JWT/Role, Workcation/Approval/Manager) 먼저 안정화하는 편이 낫다고 판단.

---

### 항목 4. `facility`/`verification` 신규 테이블 필요 여부

**현재**
- 기존 구조: `ReservationController.getAvailableFacilities()`가 항상 빈 리스트를 반환(주석으로 `Facility` 엔티티 부재를 인정). "아이디/비밀번호 찾기" 기능은 프론트 버튼 미연결, 백엔드에 대응 로직 없음.
- WorkFlow_Script.sql: `facility` 테이블은 없음. `verification` 테이블(인증코드+만료일시+emp_no FK)은 이미 정의되어 있으나 대응 Entity/DAO/Service/Controller가 전혀 없음.

**충돌/문제**
`verification`은 SQL에 이미 설계되어 있으므로 "새 테이블이 필요한 경우"는 아니고 기존 테이블에 대한 Entity/API 구현이 빠진 상태 — 상대적으로 안전하게 진행 가능. 반면 `facility`는 SQL에 아예 없어 신규 테이블 설계가 필요.

**선택지 (facility)**
A. `hub` 테이블 자체를 "시설"로 취급해 `reservation` 가용 여부만 계산(신규 테이블 없이 기존 `hub`/`reservation`로 가용시간 계산)
B. `facility`라는 신규 테이블을 SQL에 추가

**추천**: A
**이유**: README 어디에도 "거점(Hub)"과 별개인 "시설(Facility)" 개념이 명시되어 있지 않음. `hub`가 이미 숙소/오피스 개념을 담당하므로 예약 가능 여부는 `hub_no` + `reservation` 기간 겹침 계산으로 충분해 보임. 다만 최종 판단은 확인 필요.

**verification(아이디/비밀번호 찾기)은 A(기존 테이블 그대로 사용)로 즉시 진행 가능** — Entity/Repository/Service/Controller 신규 작성만 필요하고 스키마 변경이 없으므로 사용자 승인 시 바로 착수 가능.

---

### 항목 5. `amount_list`(SupportList) 카디널리티

위 "amount_item" 섹션 참조 — **가장 구조적으로 큰 충돌.** 지자체 지원금이 "1건 신청당 1개 지원처만 가능"(SQL 구조)인지 "여러 지원처를 동시에 받을 수 있다"(현재 Java 코드 구조)인지에 대한 비즈니스 규칙 확인이 반드시 필요.

**선택지**
A. SQL 기준 채택 — `amount` 1건당 `amount_list` 1건(단일 지원처)만 허용하도록 `SupportList`를 재설계, `transport_supported`/`other_supported`/`requestAmount` 이원화 로직은 제거하거나 SQL에 반영
B. 현재 Java 로직(여러 지원처 지원) 유지 — `WorkFlow_Script.sql`의 `amount_list` 구조를 다중 지원처가 가능하도록 수정(PK를 별도 auto-increment `support_no`로 변경, `transport_supported`/`other_supported` 컬럼 추가)

**추천**: B
**이유**: README 7번 섹션("지자체 지원금")과 실제 `AmountDetail.jsx`/`AdminAmount.jsx` UI가 이미 "회사부담금 + 지자체지원금"을 항목별로 나눠 승인하는 화면을 구현해 놓은 상태라, 여러 지원 유형을 동시에 다루는 현재 로직 쪽이 실제 화면 기능과 더 부합함. SQL을 다중 지원처 구조로 갱신하는 편이 손실이 적음. 단, 최종 결정은 사용자 확인 필요.

---

### 항목 6. `amount_file`의 `file_size` 컬럼

**현재**: `AmountFile.java`가 `fileSize`(Long, NOT NULL)를 요구하지만 SQL `amount_file`에는 해당 컬럼이 없음.

**선택지**
A. SQL에 `file_size BIGINT NULL` 컬럼 추가(용량 표시가 필요한 실제 요구사항이 있다면)
B. Entity에서 `fileSize` 필드 제거(SQL 그대로 유지)

**추천**: A
**이유**: 파일 업로드 UI(`AmountForm.jsx` 등)에서 용량 검증/표시가 일반적으로 필요하고, `TaskFile.java`에도 동일한 `fileSize` 필드가 이미 관례적으로 존재해 프로젝트 전반의 파일 첨부 패턴과 일치시키는 편이 자연스러움. 다만 실제로 프론트에서 파일 용량을 쓰는지 여부는 확인 필요.

---

*최초 작성: 2026-09-09 (STEP 1~5 분석 결과 기준, 코드 미변경 상태에서 작성 — 단 WorkcationServiceImpl의 `@Autowired` 누락만 별도로 STEP 6에서 수정함, WORK_LOG.md 참조)*
