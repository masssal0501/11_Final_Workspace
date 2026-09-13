package com.kh.workflow.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * TODO-N02: 이 프로젝트는 ddl-auto를 쓰지 않고 SQL/WorkFlow_Script.sql로 스키마를 직접
 * 구축하며(application.properties 참고), deploy.yml에도 DB 마이그레이션 스텝이 없어
 * 새 테이블을 추가해도 운영 RDS에는 자동으로 반영되지 않는다(SSH/직접 DB 접근 불가).
 *
 * workcation_review(워케이션 후기) 테이블은 SQL/WorkFlow_Script.sql에 정의만 추가하는
 * 것으로는 운영에 생성되지 않으므로, 앱 기동 시 IF NOT EXISTS로 한 번 생성을 시도한다.
 * SQL/WorkFlow_Script.sql의 CREATE TABLE 문과 완전히 동일하며, 기존 테이블은 절대
 * 건드리지 않는(추가 전용) 멱등적 동작이라 여러 번 기동해도 안전하다. 실패해도 앱
 * 기동 자체는 막지 않는다(다른 기능에 영향을 주지 않기 위함).
 */
@Component
public class SchemaBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaBootstrap.class);

    private final JdbcTemplate jdbcTemplate;

    public SchemaBootstrap(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {

        try {

            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS workcation_review (
                        review_no INT NOT NULL AUTO_INCREMENT COMMENT '후기 PK',
                        rating INT NOT NULL COMMENT '별점 1~5',
                        content VARCHAR(500) NOT NULL COMMENT '후기 내용',
                        photo_path VARCHAR(500) NULL COMMENT '사진 저장 경로(선택)',
                        photo_origin_name VARCHAR(255) NULL COMMENT '사진 원본 파일명',
                        photo_change_name VARCHAR(255) NULL COMMENT '사진 저장 파일명',
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        workcation_no INT NOT NULL COMMENT '워케이션 PK',
                        emp_no INT NOT NULL COMMENT '작성자 사원 PK',
                        CONSTRAINT pk_workcation_review PRIMARY KEY (review_no),
                        CONSTRAINT uk_workcation_review_workcation UNIQUE (workcation_no),
                        CONSTRAINT fk_workcation_review_workcation FOREIGN KEY (workcation_no) REFERENCES workcation_info (workcation_no),
                        CONSTRAINT fk_workcation_review_employee FOREIGN KEY (emp_no) REFERENCES employee (emp_no)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                    """);

            log.info("workcation_review 테이블 확인/생성 완료(TODO-N02)");

        } catch (Exception e) {

            log.error("workcation_review 테이블 생성 시도 중 오류 발생 - 워케이션 후기 기능이 "
                    + "동작하지 않을 수 있습니다. 원인: {}", e.getMessage(), e);
        }
    }
}
