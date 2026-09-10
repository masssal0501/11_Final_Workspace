#!/usr/bin/env bash
# WorkFlow ERP - EC2에서 실행되는 배포 스크립트
#
# GitHub Actions가 AWS SSM(RunShellScript)을 통해 이 스크립트 내용을
# EC2 인스턴스에 직접 실행시킨다(SSH 불필요). __S3_BUCKET__ 플레이스홀더는
# 워크플로우가 실행 직전에 실제 버킷 이름으로 치환한다.
#
# 사전 조건(최초 EC2 설정 시 1회):
#   - /opt/workflow/backend, /opt/workflow/uploads/receipts 디렉터리와
#     workflow 사용자/그룹 존재, 쓰기 권한 부여
#   - /etc/workflow/workflow.env 존재 (deploy/workflow.env.example 참고)
#   - /etc/systemd/system/workflow.service 설치 및 enable
#   - Nginx에 deploy/nginx/workflow.conf 적용
#   - EC2 인스턴스 프로필에 S3 GetObject + SSM 관리 정책 연결

set -euo pipefail

S3_BUCKET="__S3_BUCKET__"

BACKEND_DIR="/opt/workflow/backend"
BACKEND_JAR="${BACKEND_DIR}/workflow-backend.jar"
FRONTEND_ROOT="/usr/share/nginx/html"

echo "===== [1/6] 백엔드 JAR 다운로드 ====="
sudo -u workflow mkdir -p "${BACKEND_DIR}"
aws s3 cp "s3://${S3_BUCKET}/backend/workflow-backend.jar" "${BACKEND_JAR}.new"
sudo chown workflow:workflow "${BACKEND_JAR}.new"
mv "${BACKEND_JAR}.new" "${BACKEND_JAR}"

echo "===== [2/6] Spring Boot 재시작 (systemd) ====="
sudo systemctl restart workflow
sleep 10

echo "===== [3/6] 백엔드 헬스체크 (최대 30초 대기) ====="
BACKEND_OK=0
for i in $(seq 1 6); do
    if curl -fsS "http://127.0.0.1:8006/workflow/v3/api-docs" -o /dev/null; then
        BACKEND_OK=1
        break
    fi
    echo "  backend 아직 준비 안됨, 5초 후 재시도 (${i}/6)"
    sleep 5
done

if [ "${BACKEND_OK}" -ne 1 ]; then
    echo "!!! 백엔드 헬스체크 실패 - systemctl status / journalctl -u workflow 로 확인 필요"
    sudo systemctl status workflow --no-pager || true
    exit 1
fi
echo "  backend OK"

echo "===== [4/6] 프론트엔드 정적 파일 배포 ====="
aws s3 cp "s3://${S3_BUCKET}/frontend/frontend-dist.tar.gz" /tmp/frontend-dist.tar.gz
sudo rm -rf "${FRONTEND_ROOT:?}"/*
sudo tar -xzf /tmp/frontend-dist.tar.gz -C "${FRONTEND_ROOT}"
rm -f /tmp/frontend-dist.tar.gz

echo "===== [5/6] Nginx 재적용 ====="
sudo nginx -t
sudo systemctl reload nginx

echo "===== [6/6] 최종 확인 ====="
curl -fsS "http://127.0.0.1:8006/workflow/v3/api-docs" -o /dev/null && echo "  backend  : OK"
curl -fsS "http://127.0.0.1/" -o /dev/null && echo "  frontend : OK"

echo "===== 배포 완료 ====="
