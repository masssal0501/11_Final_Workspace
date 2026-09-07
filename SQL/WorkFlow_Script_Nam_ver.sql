CREATE DATABASE IF NOT EXISTS workflow;
USE workflow;

-- 기존 테이블이 있다면 외래 키 제약조건 때문에 역순으로 안전하게 삭제
DROP TABLE IF EXISTS support_list;
DROP TABLE IF EXISTS amount_file;
DROP TABLE IF EXISTS amount_item;
DROP TABLE IF EXISTS amount_support;
DROP TABLE IF EXISTS reservation;
DROP TABLE IF EXISTS workcation_info;
DROP TABLE IF EXISTS hub;
DROP TABLE IF EXISTS employee;

-- 1. 사원 테이블 (employee)
CREATE TABLE employee (
    emp_no INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    emp_id VARCHAR(20) NOT NULL UNIQUE,
    emp_pwd VARCHAR(100) NOT NULL,
    emp_name VARCHAR(20) NOT NULL,
    phone VARCHAR(13) NULL,
    email VARCHAR(50) NULL,
    address VARCHAR(300) NULL,
    join_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_at TIMESTAMP NULL,
    status VARCHAR(1) NOT NULL DEFAULT 'Y',
    pw_chg_required BOOLEAN NOT NULL DEFAULT FALSE,
    dep_id VARCHAR(2) NOT NULL,
    auth_code VARCHAR(20) NOT NULL,
    job_code VARCHAR(20) NOT NULL
);

-- 2. 거점 테이블 (Hub)
CREATE TABLE hub (
    hub_no INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    main_region VARCHAR(20) NOT NULL,
    sub_region VARCHAR(20) NOT NULL,
    hub_name VARCHAR(20) NOT NULL,
    hub_address VARCHAR(100) NULL,
    phone VARCHAR(13) NULL,
    description VARCHAR(300) NULL,
    hub_type INT NULL,
    max_capacity INT NULL,
    price INT NULL,
    hub_status VARCHAR(10) NOT NULL
);

-- 3. 워케이션 내역 테이블 (workcation_info)
CREATE TABLE workcation_info (
    workcation_no INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    workcation_title VARCHAR(200) NOT NULL,
    work_plan VARCHAR(300) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    approver_at TIMESTAMP NULL,
    approver_comment VARCHAR(300) NULL,
    approver_state VARCHAR(1) NOT NULL,
    emp_no INT NOT NULL,
    approver_no INT NULL,
    CONSTRAINT fk_workcation_emp FOREIGN KEY (emp_no) REFERENCES employee(emp_no),
    CONSTRAINT fk_workcation_approver FOREIGN KEY (approver_no) REFERENCES employee(emp_no)
);

-- 4. 예약 테이블 (Reservation)
CREATE TABLE reservation (
    rsv_no INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    rsv_start DATETIME NOT NULL,
    rsv_end DATETIME NOT NULL,
    rsv_status VARCHAR(1) NULL DEFAULT 'N',
    user_capacity INT NULL,
    workcation_no INT NOT NULL,
    hub_no INT NOT NULL,
    CONSTRAINT fk_reservation_workcation FOREIGN KEY (workcation_no) REFERENCES workcation_info(workcation_no),
    CONSTRAINT fk_reservation_hub FOREIGN KEY (hub_no) REFERENCES hub(hub_no)
);

-- 5. 비용 지원 테이블 (amount_support)
CREATE TABLE amount_support (
    amount_no INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    approved_amount INT NULL,
    requested_at DATETIME NOT NULL,
    approved_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,
    status VARCHAR(10) NOT NULL,
    amount_comment VARCHAR(300) NULL,
    workcation_no INT NOT NULL,
    CONSTRAINT fk_amount_support_workcation FOREIGN KEY (workcation_no) REFERENCES workcation_info(workcation_no)
);

-- 6. 비용 상세 테이블 (amount_item)
CREATE TABLE amount_item (
    item_no INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    item_type VARCHAR(15) NOT NULL,
    item_amount INT NOT NULL DEFAULT 0,
    item_date TIMESTAMP NOT NULL,
    item_description VARCHAR(500) NULL,
    amount_no INT NOT NULL,
    CONSTRAINT fk_amount_item_support FOREIGN KEY (amount_no) REFERENCES amount_support(amount_no)
);

-- 7. 비용 첨부파일 테이블 (amount_file)
CREATE TABLE amount_file (
    amountfile_no INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    file_path VARCHAR(500) NULL,
    origin_name VARCHAR(255) NULL,
    change_name VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_size BIGINT NULL,
    status VARCHAR(1) NULL DEFAULT 'Y',
    amount_no INT NOT NULL,
    CONSTRAINT fk_amount_file_support FOREIGN KEY (amount_no) REFERENCES amount_support(amount_no)
);

-- 8. 지원금 목록 테이블 (support_list)
CREATE TABLE support_list (
    support_no INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    sponsor_name VARCHAR(50) NULL,
    request_amount INT NULL,
    approved_amount INT NULL,
    payment_date TIMESTAMP NULL,
    status VARCHAR(10) NULL,
    remark VARCHAR(300) NULL,
    transport_supported VARCHAR(1) NULL,
    other_supported VARCHAR(1) NULL,
    amount_no INT NOT NULL,
    CONSTRAINT fk_support_list_support FOREIGN KEY (amount_no) REFERENCES amount_support(amount_no)
);

CREATE TABLE work (
    work_no INT AUTO_INCREMENT PRIMARY KEY,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    workcation_no INT NOT NULL,

    CONSTRAINT fk_work_workcation
        FOREIGN KEY (workcation_no)
        REFERENCES workcation_info(workcation_no)
);

CREATE TABLE task (
    task_no INT AUTO_INCREMENT PRIMARY KEY,
    task_title VARCHAR(200) NOT NULL,
    task_content VARCHAR(300) NOT NULL,
    tasktime_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    taskend_at TIMESTAMP NULL,
    progress INT NOT NULL DEFAULT 0,
    status VARCHAR(1) DEFAULT 'N',
    work_no INT NOT NULL,

    CONSTRAINT fk_task_work
        FOREIGN KEY (work_no)
        REFERENCES work(work_no)
);

CREATE TABLE task_history (
    history_no INT AUTO_INCREMENT PRIMARY KEY,
    history_title VARCHAR(200) NOT NULL,
    history_content VARCHAR(1000) NOT NULL,
    progress INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    task_no INT NOT NULL,

    CONSTRAINT fk_task_history_task
        FOREIGN KEY (task_no)
        REFERENCES task(task_no)
);

CREATE TABLE work_file (
    taskfile_no INT AUTO_INCREMENT PRIMARY KEY,
    file_path VARCHAR(500) NULL,
    origin_name VARCHAR(255) NOT NULL,
    change_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_size BIGINT NOT NULL,
    status VARCHAR(1) DEFAULT 'Y',
    work_no INT NOT NULL,

    CONSTRAINT fk_work_file_work
        FOREIGN KEY (work_no)
        REFERENCES work(work_no)
);