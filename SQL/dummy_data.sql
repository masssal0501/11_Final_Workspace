/* =========================================================
   WorkFlow ERP - 시연용 더미 데이터 (약 2주치)
   =========================================================

   목적: SQL/WorkFlow_Script.sql로 초기화한 DB(공통 코드 +
   admin 1건 + 테스트 워케이션 1건만 존재하는 상태)에 실제
   서비스처럼 보이는 시연용 데이터를 채워 넣는다.

   - 모든 날짜는 NOW() 기준 상대값(DATE_SUB/DATE_ADD)을 사용해서
     스크립트를 언제 실행하더라도 "최근 2주" 데이터처럼 보이도록 함.
   - PK는 명시적으로 지정하고 ON DUPLICATE KEY UPDATE로 재실행해도
     에러 없이 안전하게 재적용되도록 함(단, work/task/attendance/
     amount/survey처럼 자연 유니크 키가 없는 테이블은 재실행 시
     중복 삽입될 수 있으므로 한 번만 실행하는 것을 전제로 한다).
   - 로그인 비밀번호는 전부 "Staff01!" (BCrypt 해시 재사용).

   실행 순서: WorkFlow_Script.sql 실행 직후, 1회만 실행.
   ========================================================= */

USE workflow;

SET NAMES utf8mb4;

/* =========================================================
   1. 사원 (emp_no 1 = admin은 WorkFlow_Script.sql에서 이미 생성됨)
   ========================================================= */

INSERT INTO employee
    (emp_no, emp_id, emp_pwd, emp_name, phone, email, address,
     join_at, status, pw_chg_required, dep_id, auth_code, job_code)
VALUES
    (2, 'staff01', '$2b$10$2RSZraDQDQoJXPDYeWRtc.gr.Z4ADmrrWja.4Uo2asUkxHm/pejn2',
     '김직원', '010-2222-1111', 'staff01@workflow.com', '서울시 강남구',
     DATE_SUB(NOW(), INTERVAL 400 DAY), 'Y', FALSE, 'D4', 'STAFF', 'J1'),

    (3, 'manager01', '$2b$10$2RSZraDQDQoJXPDYeWRtc.gr.Z4ADmrrWja.4Uo2asUkxHm/pejn2',
     '박부서장', '010-3333-1111', 'manager01@workflow.com', '서울시 서초구',
     DATE_SUB(NOW(), INTERVAL 900 DAY), 'Y', FALSE, 'D4', 'MANAGER', 'J4'),

    (4, 'staff02', '$2b$10$2RSZraDQDQoJXPDYeWRtc.gr.Z4ADmrrWja.4Uo2asUkxHm/pejn2',
     '이사원', '010-4444-1111', 'staff02@workflow.com', '서울시 마포구',
     DATE_SUB(NOW(), INTERVAL 300 DAY), 'Y', FALSE, 'D3', 'STAFF', 'J1'),

    (5, 'manager02', '$2b$10$2RSZraDQDQoJXPDYeWRtc.gr.Z4ADmrrWja.4Uo2asUkxHm/pejn2',
     '최부서장', '010-5555-1111', 'manager02@workflow.com', '서울시 송파구',
     DATE_SUB(NOW(), INTERVAL 800 DAY), 'Y', FALSE, 'D3', 'MANAGER', 'J4'),

    (6, 'staff03', '$2b$10$2RSZraDQDQoJXPDYeWRtc.gr.Z4ADmrrWja.4Uo2asUkxHm/pejn2',
     '정사원', '010-6666-1111', 'staff03@workflow.com', '서울시 성동구',
     DATE_SUB(NOW(), INTERVAL 200 DAY), 'Y', FALSE, 'D5', 'STAFF', 'J2')
ON DUPLICATE KEY UPDATE emp_no = emp_no;


/* =========================================================
   2. 거점 (오피스/숙소/체험/맛집)
   ========================================================= */

INSERT INTO hub
    (hub_no, main_region, sub_region, hub_name, hub_address, phone,
     description, hub_type, max_capacity, price, hub_status)
VALUES
    (1, '강원도', '강릉시', '강릉 공유오피스', '강원특별자치도 강릉시 경강로 2100', '033-111-2222',
     '바다 전망 공유오피스, 화상회의실 완비', 1, 20, 30000, 'OPEN'),

    (2, '강원도', '강릉시', '강릉 오션뷰 숙소', '강원특별자치도 강릉시 창해로 350', '033-222-3333',
     '오션뷰 객실, 조식 포함', 2, 4, 120000, 'OPEN'),

    (3, '제주도', '제주시', '제주 스마트오피스', '제주특별자치도 제주시 첨단로 242', '064-111-2222',
     '넓은 좌석, 초고속 인터넷', 1, 15, 25000, 'OPEN'),

    (4, '제주도', '서귀포시', '서귀포 힐링 숙소', '제주특별자치도 서귀포시 중문관광로 72', '064-222-3333',
     '중문관광단지 인근, 주차 가능', 2, 4, 150000, 'OPEN'),

    (5, '강원도', '강릉시', '강릉 서핑 체험', '강원특별자치도 강릉시 안현동 123', '033-333-4444',
     '초급자 대상 서핑 강습 프로그램', 3, 10, 50000, 'OPEN'),

    (6, '제주도', '제주시', '제주 흑돼지 맛집', '제주특별자치도 제주시 노형로 45', '064-333-4444',
     '제주 대표 흑돼지 전문점', 4, 30, 25000, 'OPEN')
ON DUPLICATE KEY UPDATE hub_no = hub_no;


/* =========================================================
   3. 워케이션 신청 (workcation_no 1은 WorkFlow_Script.sql에서
      이미 생성된 관리자 테스트 건 - 건드리지 않음)

      - 2번: staff01 / 강릉 / 완료(정산+만족도 조사까지 끝난 케이스)
      - 3번: staff02 / 제주 / 완료(지자체 지원금 포함 정산 케이스)
      - 4번: staff03 / 강릉 / 진행중(출근만 하고 아직 근무 중)
      - 5번: staff01 / 제주 / 승인대기(방금 신청한 신규 건)
      - 6번: staff02 / 강릉 / 반려된 건
      - 7번: staff03 / 제주 / 보류된 건
   ========================================================= */

INSERT INTO workcation_info
    (workcation_no, workcation_title, work_plan, created_at, updated_at,
     start_at, end_at, approver_at, approver_comment, approver_state,
     emp_no, approver_no)
VALUES
    (2, '강릉 바다뷰 워케이션', '[근무 목적] 신규 서비스 기획안 작성 및 팀 회의',
     DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY),
     DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY),
     DATE_SUB(NOW(), INTERVAL 14 DAY), NULL, 'A', 2, 3),

    (3, '제주 워케이션 2주 프로젝트', '[근무 목적] 신규 프로젝트 설계 문서 작성',
     DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY),
     DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY),
     DATE_SUB(NOW(), INTERVAL 12 DAY), NULL, 'A', 4, 5),

    (4, '강릉 집중 업무 워케이션', '[근무 목적] 분기별 실적 보고서 작성',
     DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY),
     DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY),
     DATE_SUB(NOW(), INTERVAL 3 DAY), NULL, 'A', 6, 3),

    (5, '제주 신규 워케이션 신청', '[근무 목적] 신규 브랜드 마케팅 전략 수립',
     DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY),
     DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 9 DAY),
     NULL, NULL, 'W', 2, NULL),

    (6, '강릉 워케이션 신청(반려)', '[근무 목적] 개인 역량 강화 학습',
     DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY),
     DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY),
     DATE_SUB(NOW(), INTERVAL 9 DAY), '해당 기간 팀 프로젝트 마감 일정과 겹쳐 반려합니다.', 'J', 4, 5),

    (7, '제주 워케이션 신청(보류)', '[근무 목적] 하반기 데이터 분석 계획 수립',
     DATE_SUB(NOW(), INTERVAL 2 DAY), NULL,
     DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY),
     NULL, '예산 확인 후 재검토 예정입니다.', 'H', 6, 3)
ON DUPLICATE KEY UPDATE workcation_no = workcation_no;


/* =========================================================
   4. 예약 (거점 배정) - 반려/보류 건도 신청 시점에 거점을 이미
      선택했으므로 예약 자체는 존재한다.
   ========================================================= */

INSERT INTO reservation
    (rsv_no, rsv_start, rsv_end, rsv_status, user_capacity, workcation_no, hub_no)
VALUES
    (1, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), 'Y', 1, 2, 1),
    (2, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), 'Y', 1, 2, 2),
    (3, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY), 'Y', 1, 2, 5),

    (4, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), 'Y', 1, 3, 3),
    (5, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), 'Y', 1, 3, 4),
    (6, DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY), 'Y', 1, 3, 6),

    (7, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 'N', 1, 4, 1),

    (8, DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 9 DAY), 'N', 1, 5, 3),
    (9, DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 9 DAY), 'N', 1, 5, 4),

    (10, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), 'C', 1, 6, 1),

    (11, DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY), 'N', 1, 7, 4)
ON DUPLICATE KEY UPDATE rsv_no = rsv_no;


/* =========================================================
   5. 업무(work) / 작업(task) / 작업이력(task_history)
      - 2,3번(완료): 모든 작업 100% 완료
      - 4번(진행중): 절반 정도만 진행
   ========================================================= */

INSERT INTO work (work_no, submitted_at, updated_at, workcation_no)
VALUES
    (1, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), 2),
    (2, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), 3),
    (3, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 4)
ON DUPLICATE KEY UPDATE work_no = work_no;

INSERT INTO task
    (task_no, task_title, task_content, tasktime_at, taskend_at, progress, status, work_no)
VALUES
    (1, '기획안 초안 작성', '기획안 초안 작성 (2일)', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), 100, 'Y', 1),
    (2, '팀 회의 및 피드백 반영', '팀 회의 및 피드백 반영 (2일)', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), 100, 'Y', 1),

    (3, '설계 문서 초안', '설계 문서 초안 작성 (3일)', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), 100, 'Y', 2),
    (4, '리뷰 및 최종본 제출', '리뷰 반영 및 최종본 제출 (1일)', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), 100, 'Y', 2),

    (5, '실적 데이터 취합', '분기 실적 데이터 취합 (2일)', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 100, 'Y', 3),
    (6, '보고서 작성', '보고서 작성 및 검토 (3일)', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 40, 'N', 3)
ON DUPLICATE KEY UPDATE task_no = task_no;

INSERT INTO task_history
    (history_no, history_title, history_content, progress, created_at, task_no)
VALUES
    (1, '기획안 초안 작성', '기획안 초안 작성을 완료했습니다.', 100, DATE_SUB(NOW(), INTERVAL 12 DAY), 1),
    (2, '팀 회의 및 피드백 반영', '팀 회의에서 나온 피드백을 모두 반영했습니다.', 100, DATE_SUB(NOW(), INTERVAL 10 DAY), 2),
    (3, '설계 문서 초안', '설계 문서 초안을 작성했습니다.', 100, DATE_SUB(NOW(), INTERVAL 9 DAY), 3),
    (4, '리뷰 및 최종본 제출', '리뷰 의견을 반영해 최종본을 제출했습니다.', 100, DATE_SUB(NOW(), INTERVAL 8 DAY), 4),
    (5, '실적 데이터 취합', '분기 실적 데이터 취합을 완료했습니다.', 100, DATE_SUB(NOW(), INTERVAL 1 DAY), 5),
    (6, '보고서 작성 중', '보고서 초안 40% 작성했습니다.', 40, DATE_SUB(NOW(), INTERVAL 1 DAY), 6)
ON DUPLICATE KEY UPDATE history_no = history_no;


/* =========================================================
   6. 출퇴근 인증(attendance) - 완료 건은 며칠치 출/퇴근 기록,
      진행중 건은 오늘 출근만 기록
   ========================================================= */

INSERT INTO attendance
    (attendance_no, check_type, checked_at, latitude, longitude, distance_m, is_late, workcation_no, emp_no, hub_no)
VALUES
    -- 워케이션 2번(강릉, staff01) - 3일치 출퇴근
    (1, 'IN',  DATE_SUB(NOW(), INTERVAL 14 DAY), 37.7519000, 128.8761000, 15, 'N', 2, 2, 1),
    (2, 'OUT', DATE_ADD(DATE_SUB(NOW(), INTERVAL 14 DAY), INTERVAL 8 HOUR), 37.7519000, 128.8761000, 12, 'N', 2, 2, 1),
    (3, 'IN',  DATE_SUB(NOW(), INTERVAL 13 DAY), 37.7519000, 128.8761000, 20, 'N', 2, 2, 1),
    (4, 'OUT', DATE_ADD(DATE_SUB(NOW(), INTERVAL 13 DAY), INTERVAL 8 HOUR), 37.7519000, 128.8761000, 18, 'N', 2, 2, 1),
    (5, 'IN',  DATE_SUB(NOW(), INTERVAL 12 DAY), 37.7519000, 128.8761000, 40, 'Y', 2, 2, 1),
    (6, 'OUT', DATE_ADD(DATE_SUB(NOW(), INTERVAL 12 DAY), INTERVAL 8 HOUR), 37.7519000, 128.8761000, 22, 'N', 2, 2, 1),

    -- 워케이션 3번(제주, staff02) - 2일치 출퇴근
    (7, 'IN',  DATE_SUB(NOW(), INTERVAL 12 DAY), 33.4996000, 126.5312000, 10, 'N', 3, 4, 3),
    (8, 'OUT', DATE_ADD(DATE_SUB(NOW(), INTERVAL 12 DAY), INTERVAL 8 HOUR), 33.4996000, 126.5312000, 14, 'N', 3, 4, 3),
    (9, 'IN',  DATE_SUB(NOW(), INTERVAL 11 DAY), 33.4996000, 126.5312000, 25, 'N', 3, 4, 3),
    (10, 'OUT', DATE_ADD(DATE_SUB(NOW(), INTERVAL 11 DAY), INTERVAL 8 HOUR), 33.4996000, 126.5312000, 19, 'N', 3, 4, 3),

    -- 워케이션 4번(강릉, staff03) - 어제까지 하루 완료 + 오늘 출근만
    (11, 'IN',  DATE_SUB(NOW(), INTERVAL 1 DAY), 37.7519000, 128.8761000, 30, 'N', 4, 6, 1),
    (12, 'OUT', DATE_ADD(DATE_SUB(NOW(), INTERVAL 1 DAY), INTERVAL 8 HOUR), 37.7519000, 128.8761000, 17, 'N', 4, 6, 1),
    (13, 'IN',  NOW(), 37.7519000, 128.8761000, 22, 'N', 4, 6, 1)
ON DUPLICATE KEY UPDATE attendance_no = attendance_no;


/* =========================================================
   7. 비용 신청(amount) / 비용 상세(amount_item) / 지원금(amount_list)
      - 2번: 승인 완료된 정산
      - 3번: 지자체 지원금까지 포함된 승인 완료 정산
      - 4번: 아직 검토중인 정산(ADMIN 승인 대기 큐 시연용)
   ========================================================= */

INSERT INTO amount
    (amount_no, requested_amount, approved_amount, requested_at, approved_at,
     created_at, updated_at, status, amount_comment, workcation_no)
VALUES
    (1, 150000, 150000, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY),
     DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY),
     'A', '강릉 워케이션 기간 중 발생한 오피스 이용료 및 체험 프로그램 비용입니다.', 2),

    (2, 220000, 200000, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY),
     DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY),
     'A', '제주 워케이션 숙박비 및 식비 정산 요청입니다.', 3),

    (3, 80000, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), NULL,
     DATE_SUB(NOW(), INTERVAL 1 DAY), NULL,
     'R', '강릉 워케이션 진행 중 발생한 교통비 정산 요청입니다.', 4)
ON DUPLICATE KEY UPDATE amount_no = amount_no;

INSERT INTO amount_item
    (item_no, item_type, item_approved, item_approved_amount, item_date, item_description, amount_no, amount)
VALUES
    (1, 'S', 'A', 120000, DATE_SUB(NOW(), INTERVAL 13 DAY), '강릉 오피스 4박 이용료', 1, 120000),
    (2, 'E', 'A', 30000,  DATE_SUB(NOW(), INTERVAL 13 DAY), '서핑 체험 프로그램', 1, 30000),

    (3, 'S', 'A', 150000, DATE_SUB(NOW(), INTERVAL 11 DAY), '서귀포 숙소 4박 이용료', 2, 150000),
    (4, 'F', 'A', 50000,  DATE_SUB(NOW(), INTERVAL 10 DAY), '워케이션 기간 식비', 2, 50000),
    (5, 'O', 'A', 0,      DATE_SUB(NOW(), INTERVAL 9 DAY), '기타 비용(개인 사유로 반영 안됨)', 2, 20000),

    (6, 'T', 'R', 0, DATE_SUB(NOW(), INTERVAL 2 DAY), '강릉 왕복 교통비', 3, 80000)
ON DUPLICATE KEY UPDATE item_no = item_no;

INSERT INTO amount_list
    (support_no, sponsor_name, request_amount, approved_amount, payment_date, status, remark,
     transport_supported, other_supported, amount_no)
VALUES
    (1, '강원도청 워케이션 지원사업', 50000, 50000, DATE_SUB(NOW(), INTERVAL 7 DAY), 'PAID',
     '강원도 워케이션 지원금 지급 완료', 'N', 'N', 2)
ON DUPLICATE KEY UPDATE support_no = support_no;


/* =========================================================
   8. 만족도 조사(workcation_survey / survey_answer)
      - 완료된 워케이션 2건(2번, 3번)에 대해서만 작성됨
      - survey_question: 1~4번 SCORE, 5번 TEXT (WorkFlow_Script.sql 기준)
   ========================================================= */

INSERT INTO workcation_survey (survey_no, created_at, updated_at, workcation_no)
VALUES
    (1, DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), 2),
    (2, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), 3)
ON DUPLICATE KEY UPDATE survey_no = survey_no;

INSERT INTO survey_answer (answer_no, answer_value, score, survey_no, question_no)
VALUES
    (1, '5', 5, 1, 1),
    (2, '4', 4, 1, 2),
    (3, '5', 5, 1, 3),
    (4, '4', 4, 1, 4),
    (5, '바다가 보이는 오피스에서 일하니 집중이 잘 되고 새로운 아이디어도 많이 나왔습니다.', NULL, 1, 5),

    (6, '5', 5, 2, 1),
    (7, '5', 5, 2, 2),
    (8, '4', 4, 2, 3),
    (9, '3', 3, 2, 4),
    (10, '제주도 워케이션 전반적으로 만족스러웠고, 다음에도 신청하고 싶습니다.', NULL, 2, 5)
ON DUPLICATE KEY UPDATE answer_no = answer_no;


/* =========================================================
   9. 공지사항 (있으면 대시보드가 더 그럴듯하게 보임)
   ========================================================= */

INSERT INTO notice
    (notice_no, notice_title, notice_content, notice_status, view_count, created_at, emp_no)
VALUES
    (2, '9월 워케이션 신청 마감 안내', '9월 워케이션 신청은 이번 주 금요일까지입니다. 많은 신청 부탁드립니다.',
     'VISIBLE', 12, DATE_SUB(NOW(), INTERVAL 5 DAY), 1),

    (3, '강릉/제주 거점 오피스 신규 오픈', '강릉과 제주에 신규 공유오피스 거점이 오픈했습니다. 워케이션 신청 시 확인해보세요.',
     'IMPORTANT', 8, DATE_SUB(NOW(), INTERVAL 2 DAY), 1)
ON DUPLICATE KEY UPDATE notice_no = notice_no;


SELECT 'WorkFlow dummy data (2 weeks demo dataset) loaded.' AS result;
