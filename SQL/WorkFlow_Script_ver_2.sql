/* =========================================================
   WorkFjob_codelow ERP
   Database Initialization Script

   MySQL 8.x
   MySQL Workbench

   실행 방법:
   1. MySQL Workbench에서 본 파일 전체 선택
   2. Execute
   3. 기존 DB가 있다면 테이블을 삭제하고 재생성
   4. 기본 데이터까지 자동 입력
   ========================================================= */


/* =========================================================
   1. DATABASE
   ========================================================= */

CREATE DATABASE IF NOT EXISTS workflow
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

USE workflow;


/* =========================================================
   2. 기존 테이블 삭제
   ========================================================= */

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS verification;
DROP TABLE IF EXISTS notice_file;
DROP TABLE IF EXISTS survey_answer;
DROP TABLE IF EXISTS workcation_survey;
DROP TABLE IF EXISTS survey_question;
DROP TABLE IF EXISTS work_file;
DROP TABLE IF EXISTS task;
DROP TABLE IF EXISTS work;
DROP TABLE IF EXISTS reservation;
DROP TABLE IF EXISTS amount_file;
DROP TABLE IF EXISTS amount_list;
DROP TABLE IF EXISTS amount_item;
DROP TABLE IF EXISTS amount;
DROP TABLE IF EXISTS notice;
DROP TABLE IF EXISTS workcation_info;
DROP TABLE IF EXISTS hub;
DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS authority;
DROP TABLE IF EXISTS job;
DROP TABLE IF EXISTS department;

SET FOREIGN_KEY_CHECKS = 1;


/* =========================================================
   3. 기준 코드
   ========================================================= */

CREATE TABLE department (
    dep_id CHAR(2) NOT NULL COMMENT 'D1~D6',
    dep_title VARCHAR(20) NOT NULL COMMENT '부서명',

    PRIMARY KEY (dep_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE job (
    job_code VARCHAR(20) NOT NULL COMMENT 'J1~J5',
    job_name VARCHAR(35) NOT NULL COMMENT '직급명',

    PRIMARY KEY (job_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE authority (
    auth_code VARCHAR(20) NOT NULL COMMENT 'ADMIN, MANAGER, STAFF',
    auth_name VARCHAR(35) NOT NULL COMMENT '권한명',

    PRIMARY KEY (auth_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   4. 직원
   ========================================================= */

CREATE TABLE employee (
    emp_no INT NOT NULL AUTO_INCREMENT COMMENT '회원 PK',

    emp_id VARCHAR(20) NOT NULL COMMENT '로그인 ID',
    emp_pwd VARCHAR(100) NOT NULL COMMENT '암호화 비밀번호',
    emp_name VARCHAR(20) NOT NULL COMMENT '이름',

    phone VARCHAR(13) NULL COMMENT '(-) 포함',
    email VARCHAR(50) NULL,
    address VARCHAR(300) NULL,

    join_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_at TIMESTAMP NULL,

    status VARCHAR(1) NOT NULL DEFAULT 'Y'
        COMMENT 'Y 재직, N 퇴사, R 휴직, V 휴가',

	pw_chg_required	BOOLEAN	NOT NULL DEFAULT TRUE	COMMENT '최초 생성시 변경 필수 요구',

    dep_id CHAR(2) NOT NULL,
    auth_code VARCHAR(20) NOT NULL,
    job_code VARCHAR(20) NOT NULL,

    PRIMARY KEY (emp_no),

    UNIQUE KEY uk_employee_emp_id (emp_id),

    CONSTRAINT fk_employee_department
        FOREIGN KEY (dep_id)
        REFERENCES department(dep_id),

    CONSTRAINT fk_employee_authority
        FOREIGN KEY (auth_code)
        REFERENCES authority(auth_code),

    CONSTRAINT fk_employee_job
        FOREIGN KEY (job_code)
        REFERENCES job(job_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   5. 거점
   ========================================================= */

CREATE TABLE hub (
    hub_no INT NOT NULL AUTO_INCREMENT COMMENT '거점 PK',

    region_name VARCHAR(20) NOT NULL COMMENT '지역명',
    hub_name VARCHAR(50) NOT NULL COMMENT '거점명',
    hub_address VARCHAR(100) NULL COMMENT '주소',
    phone VARCHAR(13) NULL COMMENT '전화번호',
    description VARCHAR(300) NULL COMMENT '거점 상세정보',

    hub_type INT NOT NULL
        COMMENT '1 공유오피스, 2 숙소, 3 제휴시설',

    PRIMARY KEY (hub_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   6. 워케이션
   ========================================================= */

CREATE TABLE workcation_info (
    workcation_no INT NOT NULL AUTO_INCREMENT,

    workcation_title VARCHAR(200) NOT NULL,
    work_plan VARCHAR(300) NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,

    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,

    approver_at TIMESTAMP NULL,

    approver_comment VARCHAR(300) NULL,

    approver_state VARCHAR(1) NOT NULL DEFAULT 'R'
        COMMENT 'A 승인, C 취소, H 보류, J 반려, R 검토',

    emp_no INT NOT NULL COMMENT '신청자',
    approver_no INT NULL COMMENT '결재자',

    PRIMARY KEY (workcation_no),

    CONSTRAINT fk_workcation_employee
        FOREIGN KEY (emp_no)
        REFERENCES employee(emp_no),

    CONSTRAINT fk_workcation_approver
        FOREIGN KEY (approver_no)
        REFERENCES employee(emp_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   7. 예약
   ========================================================= */

CREATE TABLE reservation (
    rsv_no INT NOT NULL AUTO_INCREMENT,

    rsv_start DATETIME NOT NULL,
    rsv_end DATETIME NOT NULL,

    rsv_status VARCHAR(1) NOT NULL DEFAULT 'N'
        COMMENT 'N 예약, C 취소, Y 완료',

    user_cnt INT NULL,

    workcation_no INT NOT NULL,
    hub_no INT NOT NULL,

    PRIMARY KEY (rsv_no),

    CONSTRAINT fk_reservation_workcation
        FOREIGN KEY (workcation_no)
        REFERENCES workcation_info(workcation_no),

    CONSTRAINT fk_reservation_hub
        FOREIGN KEY (hub_no)
        REFERENCES hub(hub_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   8. 업무
   ========================================================= */

CREATE TABLE work (
    work_no INT NOT NULL AUTO_INCREMENT,

    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,

    workcation_no INT NOT NULL,

    PRIMARY KEY (work_no),

    CONSTRAINT fk_work_workcation
        FOREIGN KEY (workcation_no)
        REFERENCES workcation_info(workcation_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE task (
    task_no INT NOT NULL AUTO_INCREMENT,

    task_title VARCHAR(200) NOT NULL,
    task_content VARCHAR(300) NOT NULL,

    tasktime_at TIMESTAMP NOT NULL,
    taskend_at TIMESTAMP NULL,

    status VARCHAR(1) NOT NULL DEFAULT 'N'
        COMMENT 'N 미완료, Y 완료',

    work_no INT NOT NULL,

    PRIMARY KEY (task_no),

    CONSTRAINT fk_task_work
        FOREIGN KEY (work_no)
        REFERENCES work(work_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE work_file (
    workfile_no INT NOT NULL AUTO_INCREMENT,

    file_path VARCHAR(500) NOT NULL,
    origin_name VARCHAR(225) NOT NULL,
    change_name VARCHAR(225) NOT NULL,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(1) NOT NULL DEFAULT 'Y',

    task_no INT NOT NULL,

    PRIMARY KEY (workfile_no),

    CONSTRAINT fk_work_file_task
        FOREIGN KEY (task_no)
        REFERENCES task(task_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   9. 비용 / 정산
   ========================================================= */

CREATE TABLE amount (
    amount_no INT NOT NULL AUTO_INCREMENT,

    requested_amount INT NOT NULL,
    approved_amount INT NULL,

    requested_at DATETIME NOT NULL,
    approved_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,

    status VARCHAR(10) NOT NULL
        COMMENT 'A 승인, C 취소, H 보류, J 반려, R 검토',

    amount_comment VARCHAR(300) NULL,

    workcation_no INT NOT NULL,

    PRIMARY KEY (amount_no),

    CONSTRAINT fk_amount_workcation
        FOREIGN KEY (workcation_no)
        REFERENCES workcation_info(workcation_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE amount_item (
    item_no INT NOT NULL AUTO_INCREMENT,

    item_type VARCHAR(15) NOT NULL
        COMMENT 'S 숙박, T 교통, E 체험, F 식비, V 차량, O 기타',

    item_date TIMESTAMP NOT NULL,

    item_approved VARCHAR(15) NULL
        COMMENT 'A 승인, C 취소, H 보류, J 반려, R 검토',

    item_description VARCHAR(500) NULL,

    amount_no INT NOT NULL,

    PRIMARY KEY (item_no),

    CONSTRAINT fk_amount_item_amount
        FOREIGN KEY (amount_no)
        REFERENCES amount(amount_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE amount_list (
    amount_list_no INT NOT NULL AUTO_INCREMENT,

    sponsor_name VARCHAR(50) NULL,
    amount INT NOT NULL,

    payment_date TIMESTAMP NULL,

    status VARCHAR(10) NOT NULL DEFAULT 'UNPAID'
        COMMENT 'PAID 지급, UNPAID 미지급, HOLD 보류',

    remark VARCHAR(300) NULL,

    amount_no INT NOT NULL,

    PRIMARY KEY (amount_list_no),

    CONSTRAINT fk_amount_list_amount
        FOREIGN KEY (amount_no)
        REFERENCES amount(amount_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE amount_file (
    amountattachment_no INT NOT NULL AUTO_INCREMENT,

    file_path VARCHAR(500) NULL,
    origin_name VARCHAR(225) NOT NULL,
    change_name VARCHAR(225) NOT NULL,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(1) NOT NULL DEFAULT 'Y',

    amount_no INT NOT NULL,

    PRIMARY KEY (amountattachment_no),

    CONSTRAINT fk_amount_file_amount
        FOREIGN KEY (amount_no)
        REFERENCES amount(amount_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   10. 공지사항
   ========================================================= */

CREATE TABLE notice (
    notice_no INT NOT NULL AUTO_INCREMENT,

    notice_title VARCHAR(200) NOT NULL,
    notice_content TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    notice_status VARCHAR(20) NOT NULL
        COMMENT 'VISIBLE, IMPORTANT, UNVISIBLE',

    view_count INT NOT NULL DEFAULT 0,

    emp_no INT NOT NULL,

    PRIMARY KEY (notice_no),

    CONSTRAINT fk_notice_employee
        FOREIGN KEY (emp_no)
        REFERENCES employee(emp_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE notice_file (
    noticefile_no INT NOT NULL AUTO_INCREMENT,

    file_path VARCHAR(500) NOT NULL,
    origin_name VARCHAR(225) NOT NULL,
    change_name VARCHAR(255) NULL,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(1) NOT NULL DEFAULT 'Y',

    notice_no INT NOT NULL,

    PRIMARY KEY (noticefile_no),

    CONSTRAINT fk_notice_file_notice
        FOREIGN KEY (notice_no)
        REFERENCES notice(notice_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   11. 만족도 조사
   ========================================================= */

CREATE TABLE survey_question (
    question_no INT NOT NULL AUTO_INCREMENT,

    question_content VARCHAR(200) NOT NULL,

    question_type VARCHAR(20) NOT NULL
        COMMENT 'SCORE, TEXT, SCORE_TEXT',

    question_order INT NOT NULL,

    PRIMARY KEY (question_no),

    UNIQUE KEY uk_question_order (question_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE workcation_survey (
    survey_no INT NOT NULL AUTO_INCREMENT,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,

    workcation_no INT NOT NULL,

    PRIMARY KEY (survey_no),

    UNIQUE KEY uk_survey_workcation (workcation_no),

    CONSTRAINT fk_survey_workcation
        FOREIGN KEY (workcation_no)
        REFERENCES workcation_info(workcation_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE survey_answer (
    answer_no INT NOT NULL AUTO_INCREMENT,

    answer_value VARCHAR(200) NULL,
    score INT NULL,

    survey_no INT NOT NULL,
    question_no INT NOT NULL,

    PRIMARY KEY (answer_no),

    UNIQUE KEY uk_survey_question
        (survey_no, question_no),

    CONSTRAINT fk_answer_survey
        FOREIGN KEY (survey_no)
        REFERENCES workcation_survey(survey_no),

    CONSTRAINT fk_answer_question
        FOREIGN KEY (question_no)
        REFERENCES survey_question(question_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   12. 인증
   ========================================================= */

CREATE TABLE verification (
    verification_no INT NOT NULL AUTO_INCREMENT,

    verification_code VARCHAR(10) NOT NULL,

    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    emp_no INT NOT NULL,

    PRIMARY KEY (verification_no),

    CONSTRAINT fk_verification_employee
        FOREIGN KEY (emp_no)
        REFERENCES employee(emp_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   13. INDEX
   ========================================================= */

CREATE INDEX idx_workcation_emp
    ON workcation_info(emp_no);

CREATE INDEX idx_workcation_approver
    ON workcation_info(approver_no);

CREATE INDEX idx_reservation_workcation
    ON reservation(workcation_no);

CREATE INDEX idx_reservation_hub
    ON reservation(hub_no);

CREATE INDEX idx_work_workcation
    ON work(workcation_no);

CREATE INDEX idx_task_work
    ON task(work_no);

CREATE INDEX idx_amount_workcation
    ON amount(workcation_no);

CREATE INDEX idx_amount_item_amount
    ON amount_item(amount_no);

CREATE INDEX idx_amount_file_amount
    ON amount_file(amount_no);

CREATE INDEX idx_notice_employee
    ON notice(emp_no);

CREATE INDEX idx_survey_answer_question
    ON survey_answer(question_no);

CREATE INDEX idx_verification_employee
    ON verification(emp_no);


/* =========================================================
   14. 기본 데이터
   ========================================================= */


/* -------------------------
   부서
   ------------------------- */

INSERT INTO department
    (dep_id, dep_title)
VALUES
    ('D1', '기획부'),
    ('D2', '디자인부'),
    ('D3', 'FE 개발부'),
    ('D4', 'BE 개발부'),
    ('D5', '데이터부'),
    ('D6', 'QA부');


/* -------------------------
   직급
   ------------------------- */

INSERT INTO job
    (job_code, job_name)
VALUES
    ('J1', '사원'),
    ('J2', '대리'),
    ('J3', '과장'),
    ('J4', '차장'),
    ('J5', '부장');


/* -------------------------
   권한
   ------------------------- */

INSERT INTO authority
    (auth_code, auth_name)
VALUES
    ('ADMIN', '관리자'),
    ('MANAGER', '부서장'),
    ('STAFF', '사원');


/* =========================================================
   15. 테스트 계정
   ========================================================= */

/*
   비밀번호는 프로젝트에서 사용할 BCrypt 해시값으로 교체.

   예:
   평문 비밀번호 → 1234

   Spring Security BCryptPasswordEncoder로 생성한
   실제 해시값을 입력해야 함.
*/


INSERT INTO employee
(
    emp_id,
    emp_pwd,
    emp_name,
    phone,
    email,
    address,
    status,
    dep_id,
    auth_code,
    job_code
)
VALUES

/* 관리자 */
(
    'admin',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH',
    '시스템 관리자',
    '010-0000-0000',
    'admin@workflow.com',
    '서울특별시',
    'Y',
    'D1',
    'ADMIN',
    'J5'
),

/* 기획부 부서장 */
(
    'manager01',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH',
    '김기획',
    '010-0000-0001',
    'manager01@workflow.com',
    '서울특별시',
    'Y',
    'D1',
    'MANAGER',
    'J5'
),

/* 디자인부 부서장 */
(
    'manager02',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH',
    '김디자인',
    '010-0000-0002',
    'manager02@workflow.com',
    '서울특별시',
    'Y',
    'D2',
    'MANAGER',
    'J5'
),

/* FE 개발부 부서장 */
(
    'manager03',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH',
    '김프론트',
    '010-0000-0003',
    'manager03@workflow.com',
    '서울특별시',
    'Y',
    'D3',
    'MANAGER',
    'J5'
),

/* BE 개발부 부서장 */
(
    'manager04',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH',
    '김백엔드',
    '010-0000-0004',
    'manager04@workflow.com',
    '서울특별시',
    'Y',
    'D4',
    'MANAGER',
    'J5'
),

/* 데이터부 부서장 */
(
    'manager05',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH',
    '김데이터',
    '010-0000-0005',
    'manager05@workflow.com',
    '서울특별시',
    'Y',
    'D5',
    'MANAGER',
    'J5'
),

/* QA부 부서장 */
(
    'manager06',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH',
    '김QA',
    '010-0000-0006',
    'manager06@workflow.com',
    '서울특별시',
    'Y',
    'D6',
    'MANAGER',
    'J5'
),

/* BE 개발부 사원 */
(
    'staff01',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH',
    '홍길동',
    '010-0000-0010',
    'staff01@workflow.com',
    '경기도',
    'Y',
    'D4',
    'STAFF',
    'J1'
),

/* FE 개발부 사원 */
(
    'staff02',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH',
    '김철수',
    '010-0000-0011',
    'staff02@workflow.com',
    '경기도',
    'Y',
    'D3',
    'STAFF',
    'J1'
),

/* 디자인부 사원 */
(
    'staff03',
    '$2a$10$REPLACE_WITH_BCRYPT_HASH',
    '이영희',
    '010-0000-0012',
    'staff03@workflow.com',
    '경기도',
    'Y',
    'D2',
    'STAFF',
    'J2'
);


/* =========================================================
   16. 만족도 조사 고정 문항
   ========================================================= */

INSERT INTO survey_question
(
    question_content,
    question_type,
    question_order
)
VALUES
(
    '워케이션 전반에 만족하셨나요?',
    'SCORE',
    1
),
(
    '업무 환경에 만족하셨나요?',
    'SCORE',
    2
),
(
    '숙소에 만족하셨나요?',
    'SCORE',
    3
),
(
    '체험 프로그램에 만족하셨나요?',
    'SCORE',
    4
),
(
    '워케이션을 통해 업무와 휴식을 효과적으로 병행할 수 있었나요?',
    'SCORE',
    5
),
(
    '워케이션에서 가장 좋았던 점이나 개선할 점을 자유롭게 작성해주세요.',
    'TEXT',
    6
);


/* =========================================================
   17. 초기 데이터 확인
   ========================================================= */

SELECT 'Department' AS table_name, COUNT(*) AS count
FROM department

UNION ALL

SELECT 'Job', COUNT(*)
FROM job

UNION ALL

SELECT 'Authority', COUNT(*)
FROM authority

UNION ALL

SELECT 'Employee', COUNT(*)
FROM employee

UNION ALL

SELECT 'Survey Question', COUNT(*)
FROM survey_question;


/* =========================================================
   COMPLETE
   ========================================================= */

SELECT '========================================' AS '';
SELECT 'WorkFlow DB initialization completed.' AS result;
SELECT '========================================' AS '';