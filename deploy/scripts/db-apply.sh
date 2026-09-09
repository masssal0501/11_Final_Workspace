#!/usr/bin/env bash
# WorkFlow ERP - RDS에 attendance 테이블 마이그레이션 + 시연용 더미 데이터 적용
#
# GitHub Actions가 AWS SSM(RunShellScript)을 통해 EC2에서 실행한다.
# EC2는 RDS와 같은 VPC 안에 있어 접속 가능하고, /etc/workflow/workflow.env에
# 이미 DB 접속정보가 있으므로 그 값을 재사용한다(SSH/추가 자격증명 불필요).
#
# 두 SQL 파일 모두 재실행해도 안전하도록 작성되어 있다
# (CREATE TABLE IF NOT EXISTS / INSERT ... ON DUPLICATE KEY UPDATE).
#
# __S3_BUCKET__ 플레이스홀더는 워크플로우가 실행 직전에 치환한다.

set -euo pipefail

S3_BUCKET="__S3_BUCKET__"
ENV_FILE="/etc/workflow/workflow.env"

if [ ! -f "${ENV_FILE}" ]; then
    echo "!!! ${ENV_FILE} 가 없습니다 - DB 접속정보를 확인할 수 없음" >&2
    exit 1
fi

# workflow.env는 systemd EnvironmentFile 형식(KEY=VALUE)이라 값에
# 특수문자가 있을 수 있으므로 source 대신 grep으로 필요한 값만 안전하게 추출한다.
DB_URL=$(grep -E '^DB_URL=' "${ENV_FILE}" | head -n1 | cut -d= -f2-)
DB_USERNAME=$(grep -E '^DB_USERNAME=' "${ENV_FILE}" | head -n1 | cut -d= -f2-)
DB_PASSWORD=$(grep -E '^DB_PASSWORD=' "${ENV_FILE}" | head -n1 | cut -d= -f2-)

# jdbc:mysql://<host>:<port>/<db>?... 에서 host/port 추출
DB_HOSTPORT=$(echo "${DB_URL}" | sed -E 's#jdbc:mysql://([^/]+)/.*#\1#')
DB_HOST=$(echo "${DB_HOSTPORT}" | cut -d: -f1)
DB_PORT=$(echo "${DB_HOSTPORT}" | cut -d: -f2)

if ! command -v mysql >/dev/null 2>&1; then
    echo "!!! EC2에 mysql 클라이언트가 설치되어 있지 않습니다" >&2
    exit 1
fi

echo "===== [1/3] SQL 마이그레이션/더미데이터 파일 다운로드 ====="
aws s3 cp "s3://${S3_BUCKET}/sql/migration_add_attendance.sql" /tmp/migration_add_attendance.sql
aws s3 cp "s3://${S3_BUCKET}/sql/dummy_data.sql" /tmp/dummy_data.sql

echo "===== [2/3] attendance 테이블 마이그레이션 적용 (IF NOT EXISTS - 안전) ====="
mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USERNAME}" -p"${DB_PASSWORD}" < /tmp/migration_add_attendance.sql

echo "===== [3/3] 시연용 더미 데이터 적용 (ON DUPLICATE KEY UPDATE - 안전) ====="
mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USERNAME}" -p"${DB_PASSWORD}" < /tmp/dummy_data.sql

rm -f /tmp/migration_add_attendance.sql /tmp/dummy_data.sql

echo "===== DB 마이그레이션 + 더미데이터 적용 완료 ====="
