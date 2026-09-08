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
