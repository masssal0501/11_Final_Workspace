-- =========================================================
-- ERD Cloud 업데이트용 스냅샷 (2026-09-09 추가된 attendance 테이블)
--
-- 사용법: erdcloud.com 에서 기존 프로젝트를 연 뒤
--   파일 > SQL 가져오기(Import SQL) 로 이 파일을 불러오면
--   기존 ERD에 attendance 테이블과 workcation_info / employee / hub
--   와의 관계(FK)가 자동으로 추가/갱신됩니다.
--
-- 원본 정의는 SQL/WorkFlow_Script.sql (DB 기준 스크립트)에 있으며,
-- 이 파일은 그 중 attendance 테이블 정의만 그대로 발췌한 것입니다.
-- =========================================================

/* 근태(출근/퇴근) 기록 - 워케이션 거점 위치 인증 기반 */
CREATE TABLE attendance (
    attendance_no INT NOT NULL AUTO_INCREMENT
        COMMENT '근태 PK',

    check_type VARCHAR(3) NOT NULL
        COMMENT 'IN 출근, OUT 퇴근',

    checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT '출근/퇴근 처리 시각',

    latitude DECIMAL(10,7) NOT NULL
        COMMENT '체크 시점 위도',

    longitude DECIMAL(10,7) NOT NULL
        COMMENT '체크 시점 경도',

    distance_m INT NOT NULL
        COMMENT '거점과의 거리(m) - 인증 근거 기록',

    is_late VARCHAR(1) NOT NULL DEFAULT 'N'
        COMMENT 'Y 지각, N 정상 (출근 건에만 의미 있음)',

    workcation_no INT NOT NULL
        COMMENT '워케이션 PK',

    emp_no INT NOT NULL
        COMMENT '사원 PK',

    hub_no INT NOT NULL
        COMMENT '거점 PK',

    CONSTRAINT pk_attendance
        PRIMARY KEY (attendance_no),

    CONSTRAINT fk_attendance_workcation
        FOREIGN KEY (workcation_no)
        REFERENCES workcation_info (workcation_no),

    CONSTRAINT fk_attendance_employee
        FOREIGN KEY (emp_no)
        REFERENCES employee (emp_no),

    CONSTRAINT fk_attendance_hub
        FOREIGN KEY (hub_no)
        REFERENCES hub (hub_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
