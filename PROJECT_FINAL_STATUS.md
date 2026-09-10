# PROJECT_FINAL_STATUS.md — WorkFlow ERP 종합 현황 및 향후 작업계획

작성일: 2026-09-10 (14차 작업) / 기준 커밋: `e282e6b`(Swagger/OpenAPI 문서화, `docs/step1-6-project-audit` 브랜치 HEAD)

> **이 문서의 성격**: `WORK_LOG.md`(1~13차, 2026-09-09) / `PROJECT_STATUS.md` / `DB_DESIGN.md` / `API_STATUS.md`는 이미 실제 코드·DB·API를 기준으로 정확하게 유지관리되어 온 기록이다. 이 문서는 그 4개 문서를 전부 재확인(교차검증)한 뒤, **① Executive Summary ② 우선순위 로드맵 ③ 최종 시연 시나리오 ④ TOP 10 문제 ⑤ 종합 현황표**처럼 기존 문서에 없던 "한눈에 보기" 관점을 새로 추가한 종합 문서다. 세부 근거·변경 이력은 기존 4개 문서에 이미 상세히 있으므로, 이 문서는 그것을 반복 서술하지 않고 인용/링크한다. 상세 근거가 필요하면 반드시 원본 문서를 함께 참조할 것.
>
> **신뢰성 원칙(사용자 지침 30번)**: 이 문서 전체에서 `[계획]`(아직 안 만듦) / `[구현]`(코드는 있음, 정상 동작 미검증) / `[검증]`(실제 실행해서 정상 동작 확인함)을 구분한다. 이번 세션(14차)에서 직접 재검증한 항목은 "(14차 재검증)"으로 표시하고, 그 외는 전부 1~13차 세션 기록(WORK_LOG.md)에 근거한 것임을 밝힌다.

---

## ① Executive Summary (전체 진행률 한눈에 보기)

### 전체 진행률

| 영역 | 진행률(근거) | 상태 |
|---|---|---|
| Backend | **약 90%** — Controller 12개 중 11개가 실제 API 보유(74 operations), 핵심 도메인(인증/직원/워케이션/승인/업무/비용정산/공지/거점/출퇴근/설문) 전부 실동작 검증됨. 남은 감점 요인: 예약 시설조회 스텁(🔴), workcation 소유권 검사 누락(⚠️), TaskFile 고아 엔티티(⛔) | 🟢 |
| Frontend | **약 85%** — 주요 페이지(Login/Dashboard/Notice/Employee/Workcation/Approval/Amount/Attendance/Survey/MyPage) 전부 존재·연동 확인. 감점 요인: "업무 게시판"(TaskList/TaskDetail, "내 워케이션"과 별개 메뉴)이 여전히 더미데이터, Kakao Maps 키 미발급으로 지도 화면 미작동, 지역 드롭다운 API 경로 버그 | 🟡 |
| DB | **약 90%** — `SQL/WorkFlow_Script.sql` 기준 23개 테이블 전부 Entity와 정합성 확인 완료(14차 재검증: `CREATE TABLE` 23건 실카운트 일치). 남은 이슈: `TaskFile`↔`work_file` 재설계 보류, `facility` 개념 미설계(예약 가용시간 계산에 영향) | 🟢 |
| AWS 배포 | **인프라 100% 구축·검증완료 / 최신 코드 반영은 대기중** — EC2+RDS 실리소스, GitHub Actions CI/CD 파이프라인 실가동 검증 완료. 단, **`origin/Deploy`와 `origin/docs/step1-6-project-audit` 둘 다 `59223ab`에 멈춰있고, 이번 문서의 기준 커밋인 Swagger 작업(`e282e6b`)은 아직 push되지 않아 운영서버에 반영되지 않음**(14차 재검증) | 🟡 |
| Swagger | **로컬 90% / 운영 0%** — 로컬에서 11/12 Controller 문서화 완료, `swagger-ui`/`v3/api-docs` 실동작 검증(STEP 13, 59 paths/74 operations). 운영 EC2에는 아직 미배포. 남은 TODO 2건(태그 영문 3건, 401/403 미분리) | 🟡 |
| 통합 테스트(전체 라이프사이클) | **로컬 100% 검증 / 운영(EC2+RDS) 환경 재검증 0%** — STEP 9에서 신청→승인→출퇴근→업무진행→비용신청→정산승인→만족도조사 전 구간을 로컬 DB+실제 UI/API로 검증 완료. 배포된 EC2/RDS 환경에서 동일 플로우를 재검증한 기록은 아직 없음(`PROJECT_STATUS.md` "다음 최우선 작업"에도 동일하게 명시됨) | 🟡 |

> 진행률은 "API/기능 단위 실제 확인 결과"를 근거로 산정했으며, 정확한 소수점 단위 산정은 어려워 대략치임을 밝힌다(사용자 지침 21번에 따름).

### 현재 상태 요약

- 🟢 **완료**: 로그인/JWT 인증, 직원 CRUD+아이디/비번찾기, 워케이션 신청~승인, 업무 진행률("내 워케이션" 경로), 출퇴근 위치인증, 비용신청~정산승인, 공지사항(JPA 전환), 거점/장소, 만족도조사, 관리자 대시보드, AWS EC2+RDS 배포 인프라, CI/CD 파이프라인, Swagger 문서화(로컬)
- 🟡 **진행/부분완료**: Frontend 소유권 검사 없는 워케이션 상세/수정/삭제, Notice 조회수·첨부파일 미구현, `amount` PUT 미확인, Swagger 운영 미반영, 통합테스트 운영환경 미실행
- 🔴 **문제**: `GET /reservations/facilities` 스텁(항상 빈 리스트), `managerSelectWaitingList()` 중복 표시 버그(admin판은 고쳤으나 manager판은 미수정)
- ⚪ **TODO**: `TaskFile`/`work_file` 재설계+업무 첨부파일 기능, "업무 게시판"(TaskList/TaskDetail) 실데이터 연동, Kakao Maps 키 발급, Swagger 401/403 분리, MyBatis 잔존 dependency 정리

---

## ② 기술 스택 (실제 설정파일 기준, 2026-09-10 재확인)

| 영역 | 기술 | 버전(실측) |
|---|---|---|
| Backend | Java | 21 (`pom.xml` `<java.version>`) |
| Backend | Spring Boot | **4.1.0** (`pom.xml` `<parent><version>`) |
| Backend | Build | Maven (`mvnw`) |
| Backend Persistence | Spring Data JPA | MyBatis 실사용 코드 0건(STEP 7에서 완전 전환). 단 `pom.xml`에 `mybatis-spring-boot-starter` 의존성과 `application.properties`의 `mybatis.*` 설정 3줄은 미제거 상태로 남아있음(14차 재확인) |
| Frontend | React | ^19.2.7 |
| Frontend | Vite | ^8.1.0 |
| Frontend | React Router | ^7.18.3 |
| Frontend | Axios | ^1.20.0 |
| Frontend | 상태관리 | zustand ^5.0.15 |
| Frontend | 지도 | react-kakao-maps-sdk ^1.2.2 (키 미발급으로 실제 지도 렌더링은 안 됨) |
| Frontend | 차트 | recharts ^3.10.1 |
| DB | MySQL | 로컬 개발 기준(WORK_LOG), 운영은 AWS RDS MySQL 8.4.6(STEP 8에서 실제 확인) |
| 배포 | AWS EC2 + RDS + Nginx + GitHub Actions | STEP 8/10에서 실제 구축·검증 완료 |
| API 문서 | springdoc-openapi(Swagger UI, `/workflow/swagger-ui/index.html`) | STEP 13 로컬 검증 완료, 운영 미반영 |

context-path=`/workflow`, port=`8006` (`application.properties` 실측, 14차 재확인).

---

## ③ 전체 시스템 구조 / AWS 배포 구조

```
React 19 (Vite build, dist/)
   │  Axios (baseURL: /workflow, same-origin — 배포 시 CORS 대부분 불필요)
   ▼
Nginx (:80)
   ├── "/"         → React 정적파일 (SPA fallback)
   └── "/workflow/**" → 127.0.0.1:8006 리버스 프록시
   ▼
Spring Boot 4.1.0 (systemd 서비스, context-path=/workflow, :8006)
   ├── Spring Security + JwtAuthenticationFilter (JWT Bearer)
   ├── Controller (12개, 11개 API 보유) → Service → JPA Repository
   ▼
AWS RDS (MySQL 8.4.6) — SQL/WorkFlow_Script.sql 기준 23개 테이블
```

- 배포 트리거: `Deploy` 브랜치 push → GitHub Actions(Maven+npm 빌드 → S3 업로드 → AWS SSM으로 EC2 배포) — STEP 8에서 4가지 파이프라인 버그(YAML `if:secrets` 표현식/`mvnw` 실행권한/GitHub Secret 오기재/SSM 개행 손상)를 실제로 겪고 수정한 뒤 실가동 검증됨(`WORK_LOG.md` 8차 작업).
- **14차 재검증**: `git log --oneline -1 origin/Deploy` = `59223ab`, `origin/docs/step1-6-project-audit` = `59223ab` — **동일 커밋**. 즉 CSS 통일+버그5건(`59223ab`)까지는 운영에 반영되어 있으나, 그 다음 커밋인 Swagger 문서화(`e282e6b`, 현재 HEAD)는 아직 push되지 않아 운영에는 없다.
- 운영 EC2 접속 확인: `http://3.87.158.173` (오케스트레이터 컨텍스트 기준, 이번 세션에서 재요청하지 않음 — 코드 검증만 수행)

---

## ④ DB 구축 현황 / 지금까지 작업 내용

상세는 `DB_DESIGN.md`(테이블별 Entity/Repository/Service/Controller/Frontend 매핑 + 정합성 상태) 참조. 요약:

- 기준 스키마: `SQL/WorkFlow_Script.sql` (23개 테이블, 14차 재검증: `grep -c "^CREATE TABLE"` = 23, 목록도 `DB_DESIGN.md`와 정확히 일치)
- STEP 1~13에 걸쳐 6개 구조적 불일치(Amount/AmountSupport 테이블명, SupportList 카디널리티, AmountItem/AmountFile 컬럼명, approver_state 기본값)를 사용자 결정 하에 전부 해결하고 Entity를 SQL에 정렬 완료
- 신규 테이블 2개 추가: `attendance`(STEP 9, 출퇴근 인증), `verification`은 이미 SQL에 있었으나 Entity/API가 STEP 6에서 신규 구현
- 운영 RDS에는 STEP 10에서 `migration_add_attendance.sql`(재실행 안전, `CREATE TABLE IF NOT EXISTS`) + `dummy_data.sql`(시연용 2주치)이 반영 완료된 상태(WORK_LOG 10차 작업 근거)
- **미해결**: `TaskFile.java`가 `work_file` 테이블 구조와 불일치(PK/FK 모두 다름)한 고아 엔티티로 방치 — [확인 필요] 항목 3, 보류 상태 유지

---

## ⑤ Backend 개발 현황 (도메인별)

| 도메인 | Controller | 상태 |
|---|---|---|
| 인증/사용자 | `EmployeeController`(13 API) | 🟢 로그인/JWT/CRUD/역할변경/아이디·비번찾기 전부 검증 완료 |
| 공지 | `NoticeController`(5 API) | 🟢 STEP 7 MyBatis→JPA 전환 완료, 검증 완료. 조회수·첨부파일 기능 자체는 원래부터 미구현(⚪) |
| 워케이션 | `WorkcationController`(12 API) | 🟢 신청/승인/조회 핵심 플로우 검증 완료. ⚠️ 상세/수정/삭제 3개 API는 소유권 검사 없음 |
| 승인 | `ApprovalController`(5 API) | 🟢 MANAGER/ADMIN 권한 분리 검증 완료 |
| 업무 | 전용 Controller 없음(`WorkcationController.updateTask()`가 처리) + `task.model.service.TaskService`는 빈 죽은 클래스 | 🟢 "내 워케이션" 경로는 실제 Work/Task 데이터로 검증됨. ⛔ `TaskFile` 미구현 |
| 거점 | `HubController`(AI챗봇 포함) | 🟢 검증 완료(전역 chatHistory 버그 수정됨) |
| 장소 | `PlaceController`(Hub 엔티티 재사용) | 🟢 ROLE_ADMIN 체크 정상 |
| 예약 | `ReservationController`(7 API) | 🟡 CRUD는 정상, `getAvailableFacilities`는 🔴 스텁(항상 빈 리스트) |
| 비용정산 | `AmountController`(12 API) | 🟢 신청~승인~정산 end-to-end 실제 DB 검증 완료. 🔵 PUT `/api/v1/amounts/{no}`는 미확인 |
| 출퇴근 | `AttendanceController`(1 API) | 🟢 신규 구현+검증 완료(STEP 9) |
| 설문(만족도) | `SurveyController`(3 API) | 🟢 신규 구현+검증 완료(STEP 9, 옛 TODO-001) |
| 대시보드 | `DashboardController`(역할별) | 🟢 검증 완료(STEP 11에서 totalCost/waitingList 버그 수정) |
| AI(빈 스텁) | `AiController` | ⚪ `@RestController` 없는 빈 클래스, Swagger 대상에서도 제외됨(실제 AI 기능은 HubController가 담당) |

여행지역정보(지역/거점 정보)는 별도 컨트롤러 없이 `HubController`(`/workcation/hub/**` 지역 목록)와 `WorkcationController`에 흡수되어 있음 — README의 도메인 구분과 실제 코드 구조가 다소 다름(설계상 자연스러운 통합, 오류 아님).

---

## ⑥ API 현황 요약 (전체 표는 `API_STATUS.md` 참조)

Swagger 실측(STEP 13, 로컬): **59 paths / 74 operations / 11개 태그**. 도메인별 상태 요약은 아래 "⑫ 전체 기능 현황"과 `API_STATUS.md`의 세부 표를 참조. 대표 예시(사용자 지침 9번 형식):

| 기능 | Method | URL | 권한 | 구현 | 테스트 | 상태 |
|---|---|---|---|---|---|---|
| 직원 목록 | GET | `/employees` | 인증 필요 | O | O | 🟢 |
| 직원 등록 | POST | `/employees` | ADMIN | O | O | 🟢 |
| 워케이션 상세 | GET | `/workcation/detail/{no}` | 인증 필요(소유권 검사 없음) | O | O | 🟡 |
| 예약 가능 시설 조회 | GET | `/reservations/facilities` | 인증 필요 | O(스텁) | O | 🔴 |
| 출퇴근 체크 | POST | `/attendance/check` | 인증 필요(본인 소유만) | O | O | 🟢 |
| 만족도조사 제출 | POST | `/survey` | 인증 필요(본인 소유만) | O | O | 🟢 |

---

## ⑦ Swagger 현황

- `SwaggerConfig.java`(OpenAPI 기본정보 + JWT Bearer SecurityScheme), `SecurityConfig.java`(`/swagger-ui/**`, `/v3/api-docs/**` permitAll) — 🟢 확인됨(코드 존재 + 로컬 접속 검증, STEP 13)
- 12개 Controller 중 11개(API 실재 컨트롤러 전부) `@Tag`/`@Operation`/`@Parameter`/`@ApiResponses`/`@SecurityRequirement(name="JWT")` 문서화 완료 — 🟢
- `AiController`는 API가 0개라 문서화 대상 제외 — 정확한 판단(⚪ 대상 아님)
- 로컬 `GET /workflow/swagger-ui/index.html` = 200, `GET /workflow/v3/api-docs` = 200(59 paths/74 operations/11 태그) — 🟢 **로컬 검증됨**
- **운영(EC2) 배포 여부: 🔴 미배포** — `origin/Deploy`가 `59223ab`에 멈춰 있어 Swagger 커밋(`e282e6b`)이 아직 반영 안 됨(14차 재검증, 위 ③ 참조). **"Swagger가 라이브다"라고 말하면 안 됨.**
- 남은 TODO 2건: (1) `HubController`/`DashboardController`/`AttendanceController` 태그가 영문(`"Hub API"` 등)으로 한글 컨벤션과 불일치, (2) 401(미인증)과 403(권한없음)이 실제로는 커스텀 `AuthenticationEntryPoint` 부재로 둘 다 403 반환(14차 재확인: `SecurityConfig.java`에 `AuthenticationEntryPoint`/`exceptionHandling` 커스터마이징 코드 없음, grep 결과 0건) — 문서(Swagger 스펙)에는 401/403 구분해 적혀 있으나 실제 동작과 다름

---

## ⑧ Frontend 개발 현황 / 연동 현황

주요 페이지 존재+API 연동 여부(React→Axios→Controller→Service→DB→Response→화면 반영):

| 페이지 | 존재 | API 연동 | 상태 |
|---|---|---|---|
| Login/FindID/FindPW | O | O | 🟢 (2026-09-09 findId 버그 수정, FindPW 2단계 UI 신규) |
| Dashboard(역할별 3종) | O | O | 🟢 |
| Notice | O | O | 🟢 (관리자 권한 체크 저장소 불일치 버그 수정됨) |
| Employee(목록/상세/등록/수정) | O | O | 🟢 (EmployeeEdit 스텁→실구현, 12차 작업) |
| Workcation(신청/내워케이션) | O | O | 🟢 |
| Approval(승인 대기/이력) | O | O | 🟢 (MANAGER 라우팅+메뉴 필터링 수정됨, 4차 작업) |
| Work/Task("업무 게시판", 독립 메뉴) | O | ⛔ 더미데이터 | ⚪ **미해결** — "내 워케이션" 상세 화면의 업무 진행률과는 별개 화면 |
| Hub(거점 조회/AI챗봇) | O | O | 🟢 |
| Reservation | O | O(단 facilities 스텁) | 🟡 |
| Amount/Settlement | O | O | 🟢 (FormData 재작성+BUG-012/013 수정 완료) |
| Travel/지역정보 | O(지역 드롭다운) | ⚠️ 경로 버그 있음(기존부터, 미수정) | 🟡 |
| Attendance(출퇴근) | O | O | 🟢 (신규, LocationCheckModal 실연동) |
| Survey(만족도조사) | O | O | 🟢 (신규) |
| MyPage | O | O | 🟢 |
| Error(404 등) | 🔵 이번 세션에서 별도 확인 안 함 | — | 🔵 확인 필요 |

---

## ⑨ 인증/권한 현황

- JWT 발급/검증: `JwtUtil`/`JwtAuthenticationFilter` — 🟢 정상 동작(WORK_LOG STEP 6에서 4-역할×8-엔드포인트 실제 조합 테스트로 검증)
- Role 기반 URL 인가: `SecurityConfig` 매처(주력) + 일부 컨트롤러 내부 수동 체크(`place` 등) 혼재 — `@PreAuthorize`는 미사용(리팩토링 후보, ⚠️)
- STEP 6(5차 작업)에서 `/hubs/**`, `POST /employees`, `POST /approval/*`, `/api/v1/amounts/**` GET, `WebConfig` CORS 중복 5건을 SecurityConfig 레벨로 정리 완료, 무인증/STAFF/MANAGER/ADMIN 4조합 실제 호출로 검증
- README 권한표(직원✅/부서장✅승인/관리자✅전체)와 실제 코드가 일치하도록 4차 작업(부서장 승인 프론트 라우팅+메뉴 필터링)에서 정합화 완료
- **미해결**: 401 vs 403 미분리(위 Swagger 섹션 참조), `place` 등 일부 컨트롤러의 수동 권한체크 방식이 SecurityConfig 매처와 이원화되어 있음(기능엔 문제 없으나 유지보수 부담)

---

## ⑩ 핵심 WorkFlow 업무 흐름 점검 / Flow 상태표

| 단계 | UI | API | Backend | DB | 통합테스트 | 상태 |
|---|---|---|---|---|---|---|
| ADMIN 기본데이터관리 | O | O | O | O | 🔵 이번 세션 별도 미검증(1~13차 근거) | 🟢 |
| STAFF 로그인 | O | O | O | O | 🟢(STEP9, 14차 재확인: `mvn compile` PASS) | 🟢 |
| 거점조회 | O | O | O | O | 🟢 | 🟢 |
| 워케이션신청 | O | O | O | O | 🟢 | 🟢 |
| 업무계획작성/업무생성 | O | O | O | O | 🟢(신청 시점 Work/Task 자동생성, STEP9 근본수정) | 🟢 |
| 시설예약 | O | O(가용조회 스텁) | O(가용조회 스텁) | O(facility 테이블 없음) | 🔴 가용시간 조회 불가 | 🔴 |
| 신청제출 | O | O | O | O | 🟢 | 🟢 |
| MANAGER승인 | O | O | O | O | 🟢 | 🟢 |
| ADMIN최종확인 | O | O | O | O | 🟢 | 🟢 |
| STAFF워케이션진행/근무시작(출퇴근) | O | O | O | O | 🟢(STEP9 신규구현+검증) | 🟢 |
| 업무진행/업무보고 | O(내워케이션만) | O | O | O | 🟢("업무게시판"은 별도로 여전히 더미) | 🟡 |
| 근무종료 | O | O | O | O | 🟢 | 🟢 |
| 비용신청/증빙등록 | O | O | O | O | 🟢(BUG-012 수정 후) | 🟢 |
| 정산신청/MANAGER업무완료확인 | O | O | O | O | 🟢 | 🟢 |
| ADMIN정산승인 | O | O | O | O | 🟢(BUG-013 수정 후) | 🟢 |
| 지원금적용 | O | O | O | O | 🟢 | 🟢 |
| 최종완료 | O | O | O | O | 🟢 | 🟢 |
| 만족도조사 | O | O | O | O | 🟢(STEP9 신규구현) | 🟢 |
| 이력확인 | O | O | O | O | 🟢 | 🟢 |

**시설예약(가용시간 조회) 단계만 명확히 🔴이고, 나머지는 로컬 환경에서 전부 🟢 검증됨. 단, 이 표 전체는 "운영(EC2/RDS) 환경"이 아니라 "로컬 환경" 기준 검증이라는 점을 다시 강조한다 — 운영 재검증은 아직 없음.**

---

## ⑪ 기능명세서와의 비교 — ⚪ 자료 없음, 정직하게 보고

리포 전체(`grep -ril "기능명세서"`, `find -iname "*기능명세*"`, `find -iname "*spec*"`)를 검색했으나 Notion에서 export된 기능명세서 원본 파일은 이 저장소 어디에도 존재하지 않는다(14차 재검증, `.md`/전체 파일명 매칭 둘 다 0건). `WORK_LOG.md`(1~13차, 모두 "N차 작업" 형식)에도 기능명세서 파일 경로에 대한 언급이 없다 — 오케스트레이터가 언급한 "1차"-넘버링의 이전 세션 기록도 이 저장소에서는 찾지 못했다.

**결론**: 섹션 15/16(기능명세서 vs 구현 비교, 기능명세서 오류 찾기)은 **원본 문서가 물리적으로 없어 수행 불가**. README.md의 서술적 요구사항(User Roles/주요 기능/신청 상태 흐름 등)을 사실상의 대체 기준으로 이미 WORK_LOG.md 전반에서 사용해왔고(예: [확인 필요] 항목 1의 판단 근거), 이 문서의 ⑨/⑩ 섹션도 동일하게 README를 기준으로 비교했다. 기능명세서 자체가 발견되면 별도로 섹션 15/16/24 비교 작업을 재개할 것을 권장한다(⚪ TODO로 기록).

---

## ⑫ 전체 기능 현황 (도메인별 집계)

API 엔드포인트(Swagger 74 operations) + 별도 프론트 전용 기능(업무게시판 등)을 기준으로 집계. 정확한 "기능" 단위 정의가 문서마다 다를 수 있어 대략치임을 밝힌다.

| 도메인 | 기능 수(대략) | 완료 | 부분 | 오류 | TODO |
|---|---:|---:|---:|---:|---:|
| 사용자(인증/직원) | 15 | 15 | 0 | 0 | 0 |
| 공지 | 5 | 5 | 0 | 0 | 2(조회수, 첨부파일) |
| 워케이션 | 12 | 9 | 3(소유권검사 없음) | 0 | 0 |
| 승인 | 5 | 5 | 0 | 0 | 0 |
| 업무(Task) | 3 | 2("내 워케이션" 경로) | 0 | 0 | 1(업무게시판 더미) |
| 거점/장소 | 11 | 11 | 0 | 0 | 0 |
| 예약 | 7 | 6 | 0 | 1(facilities 스텁) | 0 |
| 비용정산 | 12 | 10 | 1(sponsor) | 0 | 1(PUT 미확인, 🔵) |
| 여행지역정보 | — | — | 1(지역 드롭다운 경로버그) | 0 | 0 |
| 대시보드 | 5 | 5 | 0 | 0 | 0 |
| 출퇴근 | 1 | 1 | 0 | 0 | 0 |
| 만족도조사 | 3 | 3 | 0 | 0 | 0 |

---

## ⑬ 주요 문제 정리 (Git history/코드/문서 기준, BUG-XXX)

명시적으로 번호가 매겨진 것: `BUG-008`(WorkcationDetailComponent 상태 배지 고정 표시), `BUG-012`(AmountForm이 workcationNo 쿼리스트링 미읽음), `BUG-013`(ADMIN 승인/반려가 JSON 바디로 전송되어 항상 400). 그 외 서술형으로 기록된 주요 버그(발생일 전부 2026-09-09):

| # | 문제 | 원인 | 해결 | 현재 상태 |
|---|---|---|---|---|
| 1 | `PUT /workcation/task/{taskNo}` NPE | `taskHistoryDao` `@Autowired` 누락 | 애노테이션 추가 | 🟢 해결됨 |
| 2 | `/error` 경로가 전부 빈 403 반환 | SecurityConfig에 `/error` permitAll 누락, 서블릿 내부 forward가 인증 규칙에 걸림 | permitAll 추가 | 🟢 해결됨(전역 영향 버그) |
| 3 | Amount 계열 JSON 무한 순환직렬화 | 부모-자식 양방향 연관관계에 `@JsonIgnore` 누락 | 3개 필드에 `@JsonIgnore` 추가 | 🟢 해결됨 |
| 4 | 업무 진행률 저장 불가(가짜 ID) | `work_plan` 텍스트를 매 요청 파싱 → 요청마다 바뀌는 ID 생성 | 신청 시점에 실제 Work/Task row 생성으로 재작성 | 🟢 해결됨(STEP9) |
| 5 | 대시보드 500(워케이션 2건 이상 보유 시) | `getSingleResult()` 기대하는데 다중 결과 반환 가능 | 스코프 좁히고 `List` 반환으로 변경 | 🟢 해결됨(STEP9) |
| 6 | 출퇴근 API 응답에 비밀번호 해시 노출 | `Attendance` 연관관계에 `@JsonIgnore` 누락 | 추가 | 🟢 해결됨(STEP9) |
| 7 | ADMIN 대시보드 `totalCost` 음수 | `AmountItem`×`SupportList` JOIN 카티션곱 + 중복차감 | `SUM(approved_amount) WHERE status='A'`로 재작성 | 🟢 해결됨(STEP11) |
| 8 | ADMIN `waitingList` 중복 표시 | `adminSelectWaitingList()` JOIN에 DISTINCT 없음 | DISTINCT 추가 | 🟢 해결됨(STEP11) |
| 9 | `ManagerComponent.jsx` 정산대기 배지 오표시 | 존재하지 않는 `approverState` 필드 참조 | `status==='R'`로 수정 | 🟢 해결됨(STEP11) |
| 10 | `EmployeeEdit.jsx` 완전 미구현 스텁 | 조회/저장 로직 자체가 없음 | `EmployeeDetail` 패턴대로 신규 구현 | 🟢 해결됨(STEP12) |
| 11 | Notice 관리자 버튼 무반응 | `sessionStorage` 참조(전역 로그인 저장소는 `localStorage`) | `localStorage`/`authCode` 기준으로 통일 | 🟢 해결됨(STEP7) |
| 12 | 배포환경 API 경로 중복(`/workflow/workflow/...`) | `dashboardApi.js`/`hubApi.js`가 baseURL과 별개로 절대경로 재조합 | 상대경로로 단순화 | 🟢 해결됨(STEP8) |

---

## ⑭ 현재 미해결 문제

| 상태 | 항목 | 비고 |
|---|---|---|
| 🔴 | `GET /reservations/facilities` 항상 빈 리스트 | `facility` 테이블/개념 자체가 SQL에 없음, 설계 결정 필요 |
| 🔴 | `managerSelectWaitingList()` 중복 표시 | 14차 재검증: 현재 코드에 `SELECT DISTINCT` 없음(admin판은 STEP11에서 고쳤으나 manager판은 미반영) — `WorkcationDao.java` 235~245줄 |
| ⚪ | `TaskFile`/`work_file` 미구현 | 업무 첨부파일 기능 자체 없음, 고아 엔티티 방치 |
| ⚪ | "업무 게시판"(TaskList/TaskDetail) 더미데이터 | "내 워케이션" 경로와 별개 메뉴, 미연동 |
| ⚪ | Notice 조회수 증가/첨부파일 미구현 | 원래부터 없던 기능, JPA 전환 시에도 그대로 포팅 |
| ⚪ | Kakao Maps 키 미발급 | 지도 관련 화면(거점 위치, 출퇴근 인증 지도 등) 미작동 |
| ⚪ | `WorkcationItemComponent.jsx` 지역 드롭다운 경로 버그 | 기존부터 있던 문제, 미수정 |
| 🔵 | `PUT /api/v1/amounts/{no}` | API_STATUS.md상 "미확인"으로 표시, 이번 세션에서도 재검증 안 함 |
| 🔵 | Swagger 401/403 미분리 | 실제로는 둘 다 403(AuthenticationEntryPoint 미구현), 문서와 실동작 불일치 |
| 🔵 | Error 페이지(404 등) | 이번 세션 대상 밖, 별도 확인 필요 |
| ⚪ | `FileRenamePolicy.getRealPath()` 리스크 | fat-jar(EC2) 환경에서 null 반환 가능성 — 이론적 리스크로만 기록됨, 실제 운영에서 재현/미재현 확인된 적 없음(🔵에 가까움) |
| ⚪ | Gemini API 키 git 히스토리 노출 | 코드에서는 제거됐으나 과거 커밋 이력에 남아있음, 키 회전 권장 |
| ⚪ | MyBatis 잔존 dependency/설정 | 기능엔 영향 없음(실사용 0건), 정리 대상 |

---

## ⑮ 코드 품질 / 기술 부채

- **MyBatis 잔여코드**: 실사용 0건이지만 `pom.xml`의 `mybatis-spring-boot-starter`, `application.properties`의 `mybatis.*` 3줄 미제거(14차 재확인)
- **Controller 수동 권한검사 vs SecurityConfig 매처 이원화**: `place` 등 일부는 컨트롤러 내부 `ROLE_ADMIN` 체크, 대부분은 SecurityConfig — `@PreAuthorize` 통일 미착수
- **미사용 파일**: `Amount/components/AmountPage.jsx`(동명이인 파일, `App.jsx`는 `pages/amount/AmountPage.jsx` 사용), `ApprovalQueueDetail.jsx`(내부 참조 깨짐), `place/api/recoApi.js`(0바이트), `ai/*`(빈 스켈레톤), `task/model/service/TaskService.java`(빈 클래스) — `API_STATUS.md` "Frontend 죽은 코드/고아 파일" 표에 상세
- **중복 API 설계**: `hub`와 `place`가 동일 `Hub` 엔티티를 hub_type으로만 구분해 재사용 — 기능상 문제는 없으나 모듈 경계가 불명확
- **`WorkcationApi.js`**: 프로젝트에서 유일하게 중앙 `axiosInstance` 대신 raw axios + 수동 Bearer 헤더 사용 — 통일 권장
- **예외처리**: 전역 예외 핸들러(`@ControllerAdvice`) 존재 여부 이번 세션에서 재확인 안 함(🔵)
- **DTO/Entity 혼용**: 일부 대시보드 통계 쿼리가 타입 없는 raw `Object`(JPQL tuple) 반환 — `StatisticsPage.jsx`의 다중 fallback 패턴(`item.amount ?? item.AMOUNT`)으로 우회 중, 근본 정리 안 됨

---

## ⑯ AWS 배포 현황

| 항목 | 상태 |
|---|---|
| EC2 생성 | 🟢 완료(사용자가 AWS 콘솔에서 직접 생성, STEP8) |
| Java 설치 | 🟢 완료 |
| Nginx 설치·실행 | 🟢 완료(Amazon Linux `conf.d` 구조로 구성, 기본 서버블록 비활성화) |
| RDS 생성·연결 | 🟢 완료(MySQL 8.4.6) |
| workflow DB 생성/SQL 초기화 | 🟢 완료(23개 테이블 `SHOW TABLES`로 확인) |
| Backend 배포 | 🟢 완료(systemd, `59223ab` 기준 — **`e282e6b` 미반영**) |
| Frontend 배포 | 🟢 완료(Nginx 정적파일, `59223ab` 기준) |
| Nginx 리버스프록시 | 🟢 완료 |
| CI/CD(GitHub Actions) | 🟢 완료, 실가동 검증됨 |
| Domain | ⚪ 미설정(IP로만 접속, `http://3.87.158.173` 형태로 추정) |
| HTTPS | ⚪ 미설정(80 포트, HTTP만) |
| **최신 코드(Swagger) 반영** | 🔴 **미완료** — `Deploy` push 필요 |
| **운영 환경 전체 라이프사이클 재검증** | ⚪ **미실행** |

---

## ⑰ 앞으로 해야 할 일 (우선순위)

**P0 (시연 불가능/반드시 해결)**
1. `managerSelectWaitingList()` DISTINCT 추가 — admin판과 동일 패턴, 이미 정답이 코드베이스에 있어 난이도 매우 낮음
2. 워케이션 상세/수정/삭제 3개 API에 소유권 검사 추가(타인 워케이션 조회/수정/삭제 가능한 상태는 데이터 무결성 리스크)
3. 운영(EC2/RDS) 환경에서 STEP 9급 전체 라이프사이클 재검증(로컬 검증은 끝났으나 운영은 미검증)

**P1 (핵심 기능)**
4. `reservation facilities` 스텁 해결(설계 결정: hub 재사용 vs 신규 facility 테이블)
5. `Deploy` 브랜치에 Swagger 커밋(`e282e6b`) 반영(단순 push, 난이도 낮음)
6. Kakao Maps 키 발급/등록(지도 관련 화면 다수에 영향)
7. TaskFile/work_file 재설계 + 업무 첨부파일 기능(README "업무 완료 및 결과 기록" 요구사항과 관련)

**P2 (UI/UX)**
8. "업무 게시판"(TaskList/TaskDetail) 실데이터 연동 또는 "내 워케이션" 화면으로 통합·정리(현재 사용자 혼란 소지 있는 중복 메뉴)
9. `WorkcationItemComponent.jsx` 지역 드롭다운 API 경로 버그 수정
10. Swagger 태그 영문→한글 통일(3개 컨트롤러), 401/403 분리(커스텀 `AuthenticationEntryPoint`)

**P3 (부가기능/기술부채)**
11. MyBatis 의존성/설정 완전 제거
12. Gemini API 키 회전(git 히스토리 노출분)
13. `@PreAuthorize` 통일 등 인가 로직 리팩토링
14. 죽은 코드/미사용 파일 정리(`recoApi.js`, `ai/*`, `TaskService.java` 등)

---

## ⑱ 앞으로의 작업 순서 제안 (STEP 형식)

- ~~STEP 1~5: 프로젝트 전체 재분석 + 문서 신규 작성~~ 🟢 완료
- ~~STEP 6: DB/Entity 정합화 + 보안정책 정리 + verification 신규구현~~ 🟢 완료
- ~~STEP 7: Notice MyBatis→JPA 전환~~ 🟢 완료
- ~~STEP 8: AWS CI/CD 구축 + 실배포~~ 🟢 완료
- ~~STEP 9: 전체 라이프사이클 로컬 실검증 + 출퇴근/설문 신규구현~~ 🟢 완료
- ~~STEP 10: 운영 배포 준비(마이그레이션/더미데이터) + 실배포~~ 🟢 완료
- ~~STEP 11~12: 낮은 우선순위 버그 정리 + CSS 통일~~ 🟢 완료
- ~~STEP 13: Swagger/OpenAPI 문서화~~ 🟢 완료(로컬)
- **STEP 14(이번 세션): 종합 현황 문서화** 🟢 완료 — 본 문서
- **STEP 15(다음): P0 항목 처리** — managerSelectWaitingList 수정 → 워케이션 소유권 검사 추가 → `Deploy` push(Swagger 반영) → 운영 환경 전체 플로우 재검증
- STEP 16: reservation facilities 설계 결정 + 구현
- STEP 17: Kakao Maps 키 적용, 업무 첨부파일 기능 결정 및 구현
- STEP 18: 최종 시연 리허설(아래 ⑲ 시나리오 기준) → 발표/제출

---

## ⑲ 최종 시연 시나리오 (ADMIN→STAFF→MANAGER→STAFF→MANAGER→ADMIN→STAFF, 30단계)

시연 가능 여부는 **로컬 환경 기준**(STEP 9~13에서 실제 검증된 범위)이며, 운영 환경은 별도 확인 필요(🔵)로 표시.

| # | 주체 | 단계 | 시연 가능? |
|---|---|---|---|
| 1 | ADMIN | 로그인 | 🟢 |
| 2 | ADMIN | 부서/직급/거점 등 기본데이터 확인 | 🟢 |
| 3 | ADMIN | 직원 목록 조회 | 🟢 |
| 4 | ADMIN | 공지사항 등록 | 🟢 |
| 5 | ADMIN | 로그아웃 | 🟢 |
| 6 | STAFF | 로그인(staff01) | 🟢 |
| 7 | STAFF | 대시보드 확인 | 🟢 |
| 8 | STAFF | 거점 목록/AI 챗봇 추천 조회 | 🟢(단, 지도 UI는 Kakao 키 미발급으로 🟡) |
| 9 | STAFF | 워케이션 신청서 작성(기간/거점/업무계획) | 🟢 |
| 10 | STAFF | 거점 예약 | 🟢 |
| 11 | STAFF | 시설 예약 가용시간 조회 | 🔴 스텁이라 항상 빈 결과 — **시연 불가, 건너뛰어야 함** |
| 12 | STAFF | 신청 제출 | 🟢 |
| 13 | MANAGER | 로그인(manager01) | 🟢 |
| 14 | MANAGER | 승인 대기 목록 확인 | 🟢(단, 부서 예약 2건 이상인 경우 🔴 중복 표시 버그 가능성) |
| 15 | MANAGER | 신청 상세(업무계획/일정/비용) 확인 | 🟢 |
| 16 | MANAGER | 승인 처리 | 🟢 |
| 17 | ADMIN | 로그인, 최종 승인 대기열 확인 | 🟢 |
| 18 | ADMIN | 최종 확인/정책 반영 | 🟢 |
| 19 | STAFF | 로그인, 워케이션 진행 화면 진입("내 워케이션") | 🟢 |
| 20 | STAFF | 출근 위치 인증(GPS) | 🟢 |
| 21 | STAFF | 업무 진행률 갱신(40%→100%) | 🟢 |
| 22 | STAFF | 퇴근 위치 인증 | 🟢 |
| 23 | STAFF | 비용 신청(영수증 첨부, 항목별 입력) | 🟢 |
| 24 | MANAGER | 로그인, 업무완료확인(진행률/완료여부 화면) | 🟢 |
| 25 | MANAGER | 정산 대기 목록 확인 | 🟢(status==='R' 배지 정상화됨, STEP11) |
| 26 | ADMIN | 로그인, 비용 정산 승인 | 🟢 |
| 27 | ADMIN | 지원금(지자체) 반영 확인 | 🟢 |
| 28 | ADMIN | 대시보드에서 총비용/승인건수 통계 확인 | 🟢(totalCost 버그 수정됨, STEP11) |
| 29 | STAFF | 로그인, 워케이션 종료 후 만족도조사 작성 | 🟢 |
| 30 | STAFF | 이력 확인(완료된 워케이션 상세/이력 목록) | 🟢 |

**요약**: 30단계 중 29단계는 로컬 환경에서 🟢 시연 가능. 11번(시설 예약 가용시간 조회)만 명확히 🔴 불가능하므로 시연 스크립트에서 제외하거나 "예약은 특정 거점을 직접 선택하는 방식으로 진행"으로 우회 서술 필요. 14번은 부서 예약 건수에 따라 중복 표시가 나타날 수 있어 사전에 더미데이터 상태를 확인해둘 것. **전체가 "로컬 환경" 기준이며 운영(EC2) 환경 재검증은 아직 없다는 점을 시연 전 반드시 재확인할 것.**

---

## ⑳ 현재 가장 중요한 문제 TOP 10

| 순위 | 문제 | 영향도 | 난이도 | 권장 해결 순서 |
|---|---|---|---|---|
| 1 | 워케이션 상세/수정/삭제 소유권 검사 없음 | 높음(데이터 무결성/보안) | 낮음(소유권 비교 로직 추가) | 1 |
| 2 | `managerSelectWaitingList()` 중복 표시 | 중간(부서장 대시보드 신뢰도) | 매우 낮음(admin판 패턴 그대로 적용) | 2 |
| 3 | Swagger 커밋(`e282e6b`) 운영 미반영 | 낮음~중간(문서 접근성) | 매우 낮음(Deploy push만 하면 됨) | 3 |
| 4 | 운영(EC2/RDS) 환경 전체 라이프사이클 미검증 | 높음(실제 시연/납품 리스크) | 중간(로컬과 달리 재현 시간 소요) | 4 |
| 5 | `reservation facilities` 스텁 | 중간(시연 시나리오 11단계 영향) | 중간(설계 결정 필요) | 5 |
| 6 | `TaskFile`/업무 첨부파일 미구현 | 중간(README 요구사항 일부 미충족) | 중간(신규 Entity+API+Frontend) | 6 |
| 7 | Kakao Maps 키 미발급 | 중간(지도 UI 다수 영향) | 낮음(키 발급/등록만 하면 됨) | 7 |
| 8 | "업무 게시판" 더미데이터 방치 | 낮음~중간(별도 메뉴 혼란) | 중간(연동 또는 메뉴 제거 결정 필요) | 8 |
| 9 | 401/403 미분리 | 낮음(문서-실동작 불일치) | 낮음(EntryPoint 구현) | 9 |
| 10 | MyBatis 잔존 의존성/Gemini 키 회전 | 낮음(기술부채/보안 위생) | 낮음 | 10 |

---

*이 문서는 2026-09-10(14차 작업)에 `WORK_LOG.md`/`PROJECT_STATUS.md`/`DB_DESIGN.md`/`API_STATUS.md`(1~13차, 2026-09-09) 전체를 재검토하고, git 상태/컨트롤러 목록/SQL 테이블 카운트/managerSelectWaitingList 쿼리/애플리케이션 설정/백엔드 컴파일을 직접 재확인한 결과를 종합해 작성되었다. 세부 변경 이력·코드 diff·검증 로그는 `WORK_LOG.md`를 참조할 것.*
