/* =========================================================
   WorkFlow ERP Database Initialization Script
   MySQL 8.x / MySQL Workbench
   BY ChatGPT 
   AT 2026-09-02
   ========================================================= */


/* =========================================================
   0. DATABASE
   ========================================================= */

CREATE DATABASE IF NOT EXISTS workflow
    CHARACTER SET utf8 COLLATE utf8_unicode_ci ;

USE workflow;


/* =========================================================
   1. 기존 테이블 삭제
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
DROP TABLE IF EXISTS hub_file;
DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS authority;
DROP TABLE IF EXISTS job;
DROP TABLE IF EXISTS department;

SET FOREIGN_KEY_CHECKS = 1;


/* =========================================================
   2. 기준 코드 테이블
   ========================================================= */

/* 직급 */
CREATE TABLE job (
    job_code VARCHAR(20) NOT NULL COMMENT 'J1, J2, J3, J4, J5',
    job_name VARCHAR(35) NULL COMMENT '사원, 대리, 과장, 차장, 부장',

    CONSTRAINT pk_job
        PRIMARY KEY (job_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* 부서 */
CREATE TABLE department (
    dep_id CHAR(2) NOT NULL COMMENT 'D1~D6',
    dep_title VARCHAR(20) NULL
        COMMENT 'D1 기획부, D2 디자인부, D3 FE 개발부, D4 BE 개발부, D5 데이터부, D6 QA부서',

    CONSTRAINT pk_department
        PRIMARY KEY (dep_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* 권한 */
CREATE TABLE authority (
    auth_code VARCHAR(20) NOT NULL COMMENT 'ADMIN, MANAGER, STAFF',
    auth_name VARCHAR(35) NULL COMMENT '관리자, 부서장, 사원',

    CONSTRAINT pk_authority
        PRIMARY KEY (auth_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   3. 직원
   ========================================================= */

CREATE TABLE employee (
    emp_no INT NOT NULL AUTO_INCREMENT COMMENT '회원 PK',
    emp_id VARCHAR(20) NOT NULL COMMENT '로그인 아이디',
    emp_pwd VARCHAR(100) NOT NULL COMMENT '암호화 비밀번호',
    emp_name VARCHAR(20) NOT NULL COMMENT '사용자 이름',
    phone VARCHAR(13) NULL COMMENT '(-) 포함',
    email VARCHAR(100) NULL,
    address VARCHAR(300) NULL,

    join_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT '입사일시',

    end_at TIMESTAMP NULL
        COMMENT '퇴사일시',

    status VARCHAR(1) NOT NULL DEFAULT 'Y'
        COMMENT 'Y 재직, N 퇴사, R 휴직, V 휴가',

	pw_chg_required BOOLEAN NOT NULL DEFAULT TRUE
		COMMENT '최초 생성시 변경 필수 요구',

    dep_id CHAR(2) NOT NULL COMMENT '부서 PK',
    auth_code VARCHAR(20) NOT NULL COMMENT '권한 PK',
    job_code VARCHAR(20) NOT NULL COMMENT '직급 PK',

    CONSTRAINT pk_employee
        PRIMARY KEY (emp_no),

    CONSTRAINT uk_employee_id
        UNIQUE (emp_id),

    CONSTRAINT fk_employee_department
        FOREIGN KEY (dep_id)
        REFERENCES department (dep_id),

    CONSTRAINT fk_employee_authority
        FOREIGN KEY (auth_code)
        REFERENCES authority (auth_code),

    CONSTRAINT fk_employee_job
        FOREIGN KEY (job_code)
        REFERENCES job (job_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   4. 거점
   ========================================================= */

CREATE TABLE hub (
    hub_no INT NOT NULL AUTO_INCREMENT COMMENT '거점 PK',

    main_region VARCHAR(20) NOT NULL
        COMMENT '부산, 제주도, 강원도',

    sub_region VARCHAR(20) NOT NULL
        COMMENT '강릉시, 속초시, 양양군 등',

    hub_name VARCHAR(20) NOT NULL
        COMMENT '거점명 / 숙소명',

    hub_address VARCHAR(100) NULL
        COMMENT '카카오맵 API 사용 예정',

    phone VARCHAR(13) NULL
        COMMENT '(-) 포함，전화번호',

    description VARCHAR(300) NULL
        COMMENT '거점 상세정보',

    hub_type INT NULL
        COMMENT '1 공유오피스, 2 숙소, 3 제휴시설',
        
	max_capacity INT NULL
        COMMENT '최대 수용인원',

    price INT NULL
        COMMENT '1박 또는 1회 기준 이용 금액',

    hub_status VARCHAR(10) NOT NULL DEFAULT 'OPEN'
        COMMENT 'OPEN 운영중, PAUSED 일시중단, CLOSED 종료',

    CONSTRAINT pk_hub
        PRIMARY KEY (hub_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE hub_file (
    hubfile_no INT NOT NULL AUTO_INCREMENT,
    file_path VARCHAR(500) NULL,
    origin_name VARCHAR(255) NOT NULL,
    change_name VARCHAR(255) NOT NULL,
    UPDATED_AT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(1) NOT NULL DEFAULT 'Y' COMMENT 'Y: 사용, N: 삭제',
    hub_no INT NOT NULL COMMENT '거점 PK',

    CONSTRAINT pk_hub_file
        PRIMARY KEY (hubfile_no),

    CONSTRAINT fk_hub_file_hub
        FOREIGN KEY (hub_no)
        REFERENCES hub (hub_no)
)ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4;

/* =========================================================
   5. 워케이션
   ========================================================= */

CREATE TABLE workcation_info (
    workcation_no INT NOT NULL AUTO_INCREMENT
        COMMENT '워케이션 PK',

    workcation_title VARCHAR(200) NOT NULL
        COMMENT '워케이션 제목',

    work_plan VARCHAR(300) NULL
        COMMENT '업무 계획',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT '신청 작성일시',

    updated_at TIMESTAMP NULL DEFAULT NULL
        COMMENT '신청 수정일시',

    start_at TIMESTAMP NOT NULL
        COMMENT '워케이션 시작일시',

    end_at TIMESTAMP NOT NULL
        COMMENT '워케이션 종료일시',

    approver_at TIMESTAMP NULL
        COMMENT '결재일시',

    approver_comment VARCHAR(300) NULL
        COMMENT '결재 의견',

    approver_state VARCHAR(1) NOT NULL DEFAULT 'R'
        COMMENT 'A 승인, C 취소, H 보류, J 반려, R 검토',

    emp_no INT NOT NULL
        COMMENT '신청자 회원 PK',

    approver_no INT NULL
        COMMENT '결재자 회원 PK',

    CONSTRAINT pk_workcation_info
        PRIMARY KEY (workcation_no),

    CONSTRAINT fk_workcation_employee
        FOREIGN KEY (emp_no)
        REFERENCES employee (emp_no),

    CONSTRAINT fk_workcation_approver
        FOREIGN KEY (approver_no)
        REFERENCES employee (emp_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   6. 예약
   ========================================================= */

CREATE TABLE reservation (
    rsv_no INT NOT NULL AUTO_INCREMENT,

    rsv_start DATETIME NOT NULL
        COMMENT '예약 시작일시',

    rsv_end DATETIME NOT NULL
        COMMENT '예약 종료일시',

    rsv_status VARCHAR(1) NOT NULL DEFAULT 'N'
        COMMENT 'N 예약, C 취소, Y 완료',

    user_cnt INT NULL
        COMMENT '이용 인원',

    workcation_no INT NOT NULL
        COMMENT '워케이션 PK',

    hub_no INT NOT NULL
        COMMENT '거점 PK',

    CONSTRAINT pk_reservation
        PRIMARY KEY (rsv_no),

    CONSTRAINT fk_reservation_workcation
        FOREIGN KEY (workcation_no)
        REFERENCES workcation_info (workcation_no),

    CONSTRAINT fk_reservation_hub
        FOREIGN KEY (hub_no)
        REFERENCES hub (hub_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   7. 업무
   ========================================================= */

CREATE TABLE work (
    work_no INT NOT NULL AUTO_INCREMENT
        COMMENT '업무 PK',

    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT '업무 등록일시',

    updated_at TIMESTAMP NULL DEFAULT NULL
        COMMENT '업무 수정일시',

    workcation_no INT NOT NULL
        COMMENT '워케이션 PK',

    CONSTRAINT pk_work
        PRIMARY KEY (work_no),

    CONSTRAINT fk_work_workcation
        FOREIGN KEY (workcation_no)
        REFERENCES workcation_info (workcation_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* 작업 */
CREATE TABLE task (
    task_no INT NOT NULL AUTO_INCREMENT
        COMMENT '작업 PK',

    task_title VARCHAR(200) NOT NULL,
    task_content VARCHAR(300) NOT NULL,

    tasktime_at TIMESTAMP NOT NULL
        COMMENT '작업 시작일시',

    taskend_at TIMESTAMP NULL
        COMMENT '작업 종료일시',

    status VARCHAR(1) NOT NULL DEFAULT 'N'
        COMMENT 'N 미완료, Y 완료',

    work_no INT NOT NULL
        COMMENT '업무 PK',

    CONSTRAINT pk_task
        PRIMARY KEY (task_no),

    CONSTRAINT fk_task_work
        FOREIGN KEY (work_no)
        REFERENCES work (work_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* 작업 첨부파일 */
CREATE TABLE work_file (
    workfile_no INT NOT NULL AUTO_INCREMENT
        COMMENT '작업 첨부파일 PK',

    file_path VARCHAR(500) NOT NULL,
    origin_name VARCHAR(225) NOT NULL,
    change_name VARCHAR(225) NOT NULL,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT '파일 수정일시',

    status VARCHAR(1) NOT NULL DEFAULT 'Y'
        COMMENT 'Y 사용, N 삭제',

    task_no INT NOT NULL
        COMMENT '작업 PK',

    CONSTRAINT pk_work_file
        PRIMARY KEY (workfile_no),

    CONSTRAINT fk_work_file_task
        FOREIGN KEY (task_no)
        REFERENCES task (task_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   8. 비용 / 정산
   ========================================================= */

CREATE TABLE amount (
    amount_no INT NOT NULL AUTO_INCREMENT,

    requested_amount INT NOT NULL
        COMMENT '지원금 목록 + 비용 상세 = 전체 신청금액',

    approved_amount INT NULL
        COMMENT '최종 승인된 비용',

    requested_at DATETIME NOT NULL
        COMMENT '비용 검토 신청일시',

    approved_at DATETIME NULL
        COMMENT '결재자 최종 승인일시',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT '신청자 작성일시',

    updated_at DATETIME NULL
        COMMENT '신청자 수정일시',

    status VARCHAR(10) NOT NULL
        COMMENT 'A 승인, C 취소, H 보류, J 반려, R 검토',

    amount_comment VARCHAR(300) NULL,

    workcation_no INT NOT NULL
        COMMENT '워케이션 PK',

    CONSTRAINT pk_amount
        PRIMARY KEY (amount_no),

    CONSTRAINT fk_amount_workcation
        FOREIGN KEY (workcation_no)
        REFERENCES workcation_info (workcation_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* 비용 상세 */
CREATE TABLE amount_item (
    item_no INT NOT NULL AUTO_INCREMENT,

    amountamountitem_type VARCHAR(15) NOT NULL
        COMMENT 'S 숙박, T 교통, E 체험, F 식비, V 차량, O 기타',

    item_date TIMESTAMP NOT NULL
        COMMENT '비용 발생일시',

    item_approved VARCHAR(15) NULL
        COMMENT 'A 승인, C 취소, H 보류, J 반려, R 검토',

    item_description VARCHAR(500) NULL
        COMMENT '반려된 비용 참고 설명',

    amount_no INT NOT NULL
        COMMENT '비용 신청 PK',

    CONSTRAINT pk_amount_item
        PRIMARY KEY (item_no),

    CONSTRAINT fk_amount_item_amount
        FOREIGN KEY (amount_no)
        REFERENCES amount (amount_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE amount_item ADD COLUMN amount INT NOT NULL DEFAULT 0 COMMENT '비용 상세 항목 금액';

/* 지원금 목록 */
CREATE TABLE amount_list (
    amount_no INT NOT NULL
        COMMENT '비용 신청 PK',

    sponsor_name VARCHAR(50) NULL
        COMMENT '지원기관명 / 익명 가능',

    amount INT NOT NULL
        COMMENT '지원금액',

    payment_date TIMESTAMP NOT NULL
        COMMENT '지급일시',

    status VARCHAR(10) NOT NULL DEFAULT 'UNPAID'
        COMMENT 'PAID 지급, UNPAID 미지급, HOLD 보류',

    remark VARCHAR(300) NULL
        COMMENT '특이사항',

    item_no INT NOT NULL
        COMMENT '비용 상세 PK',

    CONSTRAINT pk_amount_list
        PRIMARY KEY (amount_no),

    CONSTRAINT fk_amount_list_amount
        FOREIGN KEY (amount_no)
        REFERENCES amount (amount_no),

    CONSTRAINT fk_amount_list_item
        FOREIGN KEY (item_no)
        REFERENCES amount_item (item_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* 비용 첨부파일 */
CREATE TABLE amount_file (
    amountattachment_no INT NOT NULL AUTO_INCREMENT,

    file_path VARCHAR(500) NULL,

    origin_name VARCHAR(225) NOT NULL
        COMMENT '원본 파일명',

    change_name VARCHAR(225) NOT NULL
        COMMENT '변경 파일명',

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(1) NOT NULL DEFAULT 'Y'
        COMMENT 'Y 사용, N 삭제',

    amount_no INT NOT NULL
        COMMENT '비용 신청 PK',

    CONSTRAINT pk_amount_file
        PRIMARY KEY (amountattachment_no),

    CONSTRAINT fk_amount_file_amount
        FOREIGN KEY (amount_no)
        REFERENCES amount (amount_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   9. 공지사항
   ========================================================= */

CREATE TABLE notice (
    notice_no INT NOT NULL AUTO_INCREMENT
        COMMENT '공지사항 PK',

    notice_title VARCHAR(200) NOT NULL,

    notice_content TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT '작성일시',

    notice_status VARCHAR(20) NOT NULL
        COMMENT 'VISIBLE, IMPORTANT, UNVISIBLE',

    view_count INT NOT NULL DEFAULT 0
        COMMENT '조회수',

    emp_no INT NOT NULL
        COMMENT '작성자 회원 PK',

    CONSTRAINT pk_notice
        PRIMARY KEY (notice_no),

    CONSTRAINT fk_notice_employee
        FOREIGN KEY (emp_no)
        REFERENCES employee (emp_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* 공지사항 첨부파일 */
CREATE TABLE notice_file (
    noticefile_no INT NOT NULL AUTO_INCREMENT
        COMMENT '첨부파일 PK',

    file_path VARCHAR(500) NOT NULL,
    origin_name VARCHAR(225) NOT NULL,
    change_name VARCHAR(255) NULL,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(1) NOT NULL DEFAULT 'Y'
        COMMENT 'Y 사용, N 삭제',

    notice_no INT NOT NULL
        COMMENT '공지사항 PK',

    CONSTRAINT pk_notice_file
        PRIMARY KEY (noticefile_no),

    CONSTRAINT fk_notice_file_notice
        FOREIGN KEY (notice_no)
        REFERENCES notice (notice_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   10. 만족도 조사
   ========================================================= */

/* 고정 질문 */
CREATE TABLE survey_question (
    question_no INT NOT NULL AUTO_INCREMENT
        COMMENT '질문 PK',

    question_content VARCHAR(200) NOT NULL
        COMMENT '질문 내용',

    question_type VARCHAR(20) NOT NULL
        COMMENT 'SCORE, TEXT, SCORE_TEXT',

    question_order INT NOT NULL
        COMMENT '질문 표시 순서',

    CONSTRAINT pk_survey_question
        PRIMARY KEY (question_no),

    CONSTRAINT uk_survey_question_order
        UNIQUE (question_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* 워케이션 만족도 조사 */
CREATE TABLE workcation_survey (
    survey_no INT NOT NULL AUTO_INCREMENT
        COMMENT '설문 PK',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NULL DEFAULT NULL
        COMMENT '수정일시',

    workcation_no INT NOT NULL
        COMMENT '워케이션 PK',

    CONSTRAINT pk_workcation_survey
        PRIMARY KEY (survey_no),

    CONSTRAINT uk_workcation_survey_workcation
        UNIQUE (workcation_no),

    CONSTRAINT fk_workcation_survey_workcation
        FOREIGN KEY (workcation_no)
        REFERENCES workcation_info (workcation_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* 설문 답변 */
CREATE TABLE survey_answer (
    answer_no INT NOT NULL AUTO_INCREMENT
        COMMENT '답변 PK',

    answer_value VARCHAR(200) NULL
        COMMENT '텍스트형 답변',

    score INT NULL
        COMMENT '평점',

    survey_no INT NOT NULL
        COMMENT '설문 PK',

    question_no INT NOT NULL
        COMMENT '질문 PK',

    CONSTRAINT pk_survey_answer
        PRIMARY KEY (answer_no),

    CONSTRAINT uk_survey_answer
        UNIQUE (survey_no, question_no),

    CONSTRAINT fk_survey_answer_survey
        FOREIGN KEY (survey_no)
        REFERENCES workcation_survey (survey_no),

    CONSTRAINT fk_survey_answer_question
        FOREIGN KEY (question_no)
        REFERENCES survey_question (question_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   11. 인증
   ========================================================= */

CREATE TABLE verification (
    verification_no INT NOT NULL AUTO_INCREMENT
        COMMENT '인증 PK',

    verification_code VARCHAR(10) NOT NULL
        COMMENT '랜덤 6자리 인증번호',

    expires_at TIMESTAMP NOT NULL
        COMMENT '인증번호 만료일시',

    verified_at TIMESTAMP NULL
        COMMENT '인증 완료일시',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT '인증번호 생성일시',

    emp_no INT NOT NULL
        COMMENT '회원 PK',

    CONSTRAINT pk_verification
        PRIMARY KEY (verification_no),

    CONSTRAINT fk_verification_employee
        FOREIGN KEY (emp_no)
        REFERENCES employee (emp_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/* =========================================================
   12. 인덱스
   ========================================================= */

/* 워케이션 조회 */
CREATE INDEX idx_workcation_employee
    ON workcation_info (emp_no);

CREATE INDEX idx_workcation_approver
    ON workcation_info (approver_no);


/* 예약 조회 */
CREATE INDEX idx_reservation_workcation
    ON reservation (workcation_no);

CREATE INDEX idx_reservation_hub
    ON reservation (hub_no);


/* 업무 조회 */
CREATE INDEX idx_work_workcation
    ON work (workcation_no);

CREATE INDEX idx_task_work
    ON task (work_no);


/* 비용 조회 */
CREATE INDEX idx_amount_workcation
    ON amount (workcation_no);

CREATE INDEX idx_amount_item_amount
    ON amount_item (amount_no);

CREATE INDEX idx_amount_file_amount
    ON amount_file (amount_no);


/* 공지 조회 */
CREATE INDEX idx_notice_employee
    ON notice (emp_no);


/* 만족도 조회 */
CREATE INDEX idx_survey_answer_question
    ON survey_answer (question_no);


/* 인증 조회 */
CREATE INDEX idx_verification_employee
    ON verification (emp_no);

CREATE INDEX idx_verification_code
    ON verification (verification_code);


/* =========================================================
   13. 초기 공통 데이터
   ========================================================= */

/* 직급 */
INSERT INTO job (job_code, job_name)
VALUES
('J1', '사원'),
('J2', '대리'),
('J3', '과장'),
('J4', '차장'),
('J5', '부장');


/* 부서 */
INSERT INTO department (dep_id, dep_title)
VALUES
('D1', '기획부'),
('D2', '디자인부'),
('D3', 'FE 개발부'),
('D4', 'BE 개발부'),
('D5', '데이터부'),
('D6', 'QA부');


/* 권한 */
INSERT INTO authority (auth_code, auth_name)
VALUES
('ADMIN', '관리자'),
('MANAGER', '부서장'),
('STAFF', '사원');


/* 만족도 질문 */
INSERT INTO survey_question
    (question_content, question_type, question_order)
VALUES
('워케이션 전반에 만족하셨나요?', 'SCORE', 1),
('업무 환경에 만족하셨나요?', 'SCORE', 2),
('숙소에 만족하셨나요?', 'SCORE', 3),
('체험 프로그램에 만족하셨나요?', 'SCORE', 4),
('워케이션 후기를 작성해주세요.', 'TEXT', 5);


/* =========================================================
   14. 완료
   ========================================================= */

SELECT 'WorkFlow DB initialization completed.' AS result;


-- 1) 사원(employee) 데이터 생성 (workcation_info 참조용)
INSERT INTO employee (
    emp_no, emp_id, emp_pwd, emp_name, phone, email, address, 
    join_at, status, pw_chg_required, dep_id, auth_code, job_code 
) VALUES (
    1, 'admin', '$2a$10$1tpWzuqxqpx04vYNpVCBT.Dbc3cED1CNdNyx4RtMLM.OQGvY3jwI2', '홍길동', '010-1234-5678', 'test@workflow.com', '서울',
    NOW(), 'Y', FALSE, 'D4', 'ADMIN', 'J1'
) ON DUPLICATE KEY UPDATE emp_no = emp_no;

-- 2) 워케이션(workcation_info) 1번 데이터 생성
INSERT INTO workcation_info (
    workcation_no, workcation_title, work_plan, start_at, end_at, 
    approver_state, emp_no
) VALUES (
    1, '테스트 워케이션', '기능 테스트용', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY),
    'A', 1
) ON DUPLICATE KEY UPDATE workcation_no = workcation_no;
