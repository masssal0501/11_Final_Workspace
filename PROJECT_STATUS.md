# PROJECT_STATUS.md

마지막 갱신: 2026-09-09 (STEP 1~6 완료 시점)

## 기술 스택 확정 상태

| 영역 | 현재 | 목표 |
|---|---|---|
| Backend Persistence | JPA(대부분) + MyBatis(Notice만) | **JPA 통일** — Notice만 전환하면 완료 |
| Backend 컴파일 | ✅ `mvn compile` BUILD SUCCESS (98 source files) | 유지 |
| DB 기준 | `SQL/WorkFlow_Script.sql` (사용자 확정) | Entity를 이 기준에 맞춤 (진행 중, DB_DESIGN.md 참조) |
| Frontend | React 19 + Vite 8 + Axios + React Router 7 | `npm install` 미실행 상태 — 빌드 검증 아직 안 함 |
| 배포/CI-CD | 없음 (`.github/workflows` 없음) | GitHub Actions → AWS (착수 전) |

## 도메인별 구현 상태

| 도메인 | Backend | Frontend | DB 정합성 | 비고 |
|---|---|---|---|---|
| 로그인/인증/JWT | ✅ 동작 | ✅ 동작 | ✅ | 1순위, 안정적 |
| 직원 관리 | ✅ 대부분 동작 | ✅ 대부분 동작 | ✅ | `POST /employees` 자가입 시 `authCode` 직접 전달 가능(권한상승 위험), 아이디/비번 찾기만 미구현 |
| 아이디/비밀번호 찾기 | ⛔ `verification` 테이블 있으나 대응 코드 없음 | ⛔ FindPWForm 버튼 미연결, FindIDForm은 잘못된 API 호출 | `verification` 테이블 존재(미사용) | **[확인 필요] 항목 4** — 신규 기능으로 착수 가능 |
| 워케이션 신청/조회/수정/삭제 | ✅ 동작(단, 소유권 검사 없이 아무나 타인 워케이션 수정/삭제 가능) | ✅ 동작 | ⚠️ `approver_state` 기본값 이슈, **[확인 필요] 항목 1** | 2순위 |
| 워케이션 승인(부서장/관리자) | ✅ Backend는 MANAGER 허용 | 🔴 **Frontend가 승인 라우트를 ADMIN 전용으로 막아놔서 부서장은 승인 화면에 접근 불가** | ✅ | README 권한표(부서장=승인 가능)와 불일치 → 조치 필요 |
| 워케이션 취소 | ⚠️ `approver_state='C'` 하나로만 처리, 별도 취소사유/이력 없음 | ⚠️ 동일 | 상태값 자체는 SQL에 존재 | README 8번 섹션의 "취소요청→상급자검토" 별도 플로우는 없음. 별도 테이블 필요 여부는 향후 판단 (지금은 저비용으로 기존 구조 활용 가능해 보임) |
| 업무/업무진행(Task) | 🔴 `updateTask` NPE **(2026-09-09 수정 완료)**, Task 컨트롤러 자체가 없음(Workcation쪽에 붙어있음) | ⛔ **전체 더미데이터, API 연동 0%** | ✅ (Task/TaskHistory는 SQL과 완전 일치) | 3순위, Frontend 작업량이 가장 큼 |
| 업무 첨부파일 | ⛔ `TaskFile` 엔티티가 잘못된 테이블/FK를 가리키는 고아 코드 | ⛔ 없음 | 🔴 **[확인 필요] 항목 3** | 후순위 |
| 거점(Hub) | ✅ 동작 (단, `/hubs/**` 전체 인증 없이 열려있음) | ✅ 동작 | ✅ | 보안 갭 있음 |
| 장소(Place) | ✅ 동작 (Hub 엔티티 재사용, ROLE_ADMIN 체크 있음) | ✅ 동작 | ✅ | `hub`와 중복 설계, 정리 필요성은 낮은 우선순위 |
| AI 추천 챗봇 | ⚠️ 동작하나 전역 `chatHistory` 필드로 전체 사용자 대화가 섞임 | ✅ 동작 | N/A | 4순위 이하지만 데이터 유출성 버그라 빠르게 손볼 가치 있음 |
| 예약(Reservation) | ⚠️ 대부분 동작, `getAvailableFacilities`만 스텁 | ✅ 동작 | **[확인 필요] 항목 4** | |
| 비용 신청/승인/정산 | 🔴 `GET /api/v1/amounts`, `GET /api/v1/amounts/workcation/{no}` 스텁으로 500 | 🔴 `amountApi.createAmount` 없음(제출 실패) | 🔴 **[확인 필요] 항목 2,5,6** (가장 많은 스키마 이슈) | 4순위, 착수 시 DB_DESIGN.md 확인 필요 항목부터 해결해야 함 |
| 지원금(지자체) | ⚠️ Amount 흐름에 통합 구현되어 있으나 SQL 구조와 카디널리티 불일치 | ✅ UI는 있음 | 🔴 **[확인 필요] 항목 5** | |
| 공지사항 | 🔴 관리자 글쓰기 3종 MyBatis 매퍼ID 불일치로 500 (Notice 전체 JPA 전환 시 함께 해결 예정, STEP7 대기) | ✅ 조회는 동작 | N/A(POJO, JPA 전환 전) | 5순위 |
| 대시보드(관리자/부서장/사원) | ✅ 동작 (Notice 조회 위해 MyBatis 의존 — Notice 전환 시 영향받음) | ✅ 동작 | ✅ | 6순위 |
| 설문(Survey) | 미확인(개별 기능 테스트 전) | 미확인 | 🔴 `SurveyQuestion`에 `question_order` 누락 + 코드값 불일치(S/T/M vs SCORE/TEXT/SCORE_TEXT) | 6순위 |

## 보안 점검 상태 (지침 10번)

| 항목 | 상태 |
|---|---|
| JWT 발급/검증 | ✅ 정상 동작 (`JwtUtil`, `JwtAuthenticationFilter`) |
| Role 기반 URL 인가 | ⚠️ 있지만 불균일 — 컨트롤러별로 수동 체크(`place`)/전혀 없음(`hub`)/컨트롤러 내부 if문(`notice`,`approval`)이 혼재, `@PreAuthorize` 미사용 |
| `/hubs/**` | 🔴 전체 `permitAll` — 생성/수정/삭제(관리자 기능)까지 인증 없이 호출 가능 |
| `/api/v1/amounts/**` | 🔴 전체 `permitAll` — 코드 주석 `// 추후 관리자로 수정` 방치 |
| `POST /employees` (자가입) | 🔴 `permitAll` + 요청 바디에 `authCode` 포함 → 이론상 스스로 ADMIN 등록 가능 |
| `POST /approval/{workcationNo}` (반려) | 🔴 형제 엔드포인트(`/approval/queue`)와 달리 STAFF 차단 로직 없음 |
| CORS | ⚠️ `SecurityConfig`(제한적, localhost:5173만 허용)와 `WebConfig`(와일드카드 `allowedOriginPatterns("*")`)가 동시에 활성화되어 중복/충돌 |

> 보안 정책 변경은 지침 10번대로 README 역할 정의(EMPLOYEE/MANAGER/ADMIN)를 기준으로 정리할 예정이며, 실제 변경 전 각 API별 접근 가능 역할표를 별도로 작성해 사용자 확인을 받을 예정.

## 완료된 작업 (WORK_LOG.md에 상세 기록)

- 2026-09-09: `WorkcationServiceImpl.taskHistoryDao` `@Autowired` 누락 수정 → `PUT /workcation/task/{taskNo}` NPE 해결, `mvn compile` BUILD SUCCESS 재확인

## 다음 단계 (사용자 확인 대기 중)

DB_DESIGN.md의 **[확인 필요] 항목 1~6**에 대한 답변을 받는 대로 STEP 6(나머지 명확한 런타임 버그)부터 순서대로 진행 예정. 확인이 필요 없는 항목(HubController 전역 chatHistory 수정, AmountServiceImpl 스텁 메서드 구현 등)은 곧바로 착수 가능.
