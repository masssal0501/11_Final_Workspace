/* =========================================================
   Production DB 마이그레이션 - attendance 테이블 추가
   =========================================================

   운영 RDS는 SQL/WorkFlow_Script.sql로 최초 초기화된 뒤로
   전체 스크립트를 재실행하지 않는다(전체 재실행은 DROP TABLE로
   기존 데이터를 전부 삭제하기 때문). attendance 테이블은 이후에
   추가된 것이므로, 기존 데이터를 건드리지 않고 이 테이블만
   추가로 생성하기 위한 마이그레이션 스크립트다.

   IF NOT EXISTS를 사용해 재실행해도 안전하다(이미 있으면 무시).
   ========================================================= */

USE workflow;

/* 근태(출근/퇴근) 기록 - 워케이션 거점 위치 인증 기반 */
CREATE TABLE IF NOT EXISTS attendance (
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

SELECT 'attendance table migration applied.' AS result;
