# 11_WorkFlow
KH 파이널 프로젝트 (워케이션 서포트 시스템)

# 🌿 WorkFlow — 워케이션 서포트 시스템

> **Work & Vacation Flow**
> 일(Work)과 휴식(Vacation)의 흐름을 연결하는 워케이션 지원 ERP 시스템

WorkFlow는 기업의 **워케이션 신청부터 승인, 일정 관리, 업무 관리, 비용 및 정산까지** 워케이션 전 과정을 하나의 시스템에서 관리할 수 있도록 설계한 ERP 기반 워케이션 서포트 시스템입니다.

직원의 업무 효율성과 워케이션 만족도를 높이는 동시에, 기업에서는 워케이션 운영 현황과 비용을 체계적으로 관리할 수 있도록 하는 것을 목표로 합니다.

---

## 📌 Project Overview

최근 워케이션은 단순한 복지 제도를 넘어 **업무 효율성 향상과 직원 복지, 지역 경제 활성화**를 동시에 실현할 수 있는 기업 문화로 확대되고 있습니다.

하지만 기존 워케이션 운영 방식은 신청서, 이메일, 메신저, 엑셀 등 여러 도구가 분산되어 있어 다음과 같은 문제가 발생합니다.

* 워케이션 신청 및 승인 과정의 복잡성
* 직원과 관리자의 일정 관리 어려움
* 워케이션 중 업무 진행 상황 확인의 어려움
* 지원금 및 비용 정산 관리의 불편함
* 워케이션 운영 현황을 한눈에 파악하기 어려움

**WorkFlow**는 이러한 문제를 해결하기 위해 워케이션 업무 프로세스를 하나의 시스템으로 통합합니다.

---

## 🎯 Project Goals

### Employee

* 간편한 워케이션 신청
* 워케이션 일정 및 숙소 정보 관리
* 워케이션 중 업무 일정 관리
* 업무 완료 및 결과 기록
* 비용 및 지원금 확인
* 워케이션 취소 및 변경 관리

### Department Manager

* 부서원의 워케이션 신청 검토
* 승인 / 반려 처리
* 워케이션 일정 확인
* 업무 계획 및 완료 여부 확인
* 부서 단위 워케이션 현황 관리

### Administrator

* 전체 워케이션 운영 관리
* 회원 및 권한 관리
* 워케이션 정책 및 지원금 관리
* 비용 및 정산 관리
* 전체 운영 현황 및 통계 확인

---

## 👥 User Roles

|     Role    | 주요 기능                               |
| :---------: | ----------------------------------- |
|  👤 **직원**  | 워케이션 신청, 일정 관리, 업무 관리, 비용 확인, 취소 신청 |
|  👔 **부서장** | 워케이션 신청 승인/반려, 부서원 일정 및 업무 관리       |
| 🛠️ **관리자** | 회원/권한 관리, 정책 관리, 비용/정산, 전체 운영 관리    |

---

## 🔄 Workation Process

```text
┌─────────────┐
│   워케이션   │
│    신청      │
└──────┬──────┘
       ↓
┌─────────────┐
│  부서장 검토  │
└──────┬──────┘
       ↓
   승인 / 반려
       ↓
┌─────────────┐
│ 워케이션 진행 │
│             │
│ · 일정 관리  │
│ · 업무 관리  │
│ · 숙소 관리  │
└──────┬──────┘
       ↓
┌─────────────┐
│ 업무 완료 및 │
│ 결과 기록    │
└──────┬──────┘
       ↓
┌─────────────┐
│ 비용 / 정산  │
└──────┬──────┘
       ↓
┌─────────────┐
│ 워케이션 종료 │
└─────────────┘
```

---

## 🧩 주요 기능

### 1. 회원 관리

* 회원가입 / 로그인 / 로그아웃
* 비밀번호 변경
* 회원정보 조회 / 수정
* 계정 활성 / 비활성
* 역할(Role) 및 권한 관리

### 2. 워케이션 신청

* 워케이션 신청서 작성
* 워케이션 지역 및 기간 선택
* 숙소 및 일정 등록
* 워케이션 목적 및 업무 계획 작성
* 예상 비용 입력
* 신청 상태 확인

**신청 상태**

```text
임시저장
   ↓
신청
   ↓
검토중
   ↓
승인 ─────→ 워케이션 진행
   │
   └────→ 반려
```

### 3. 승인 관리

부서장은 부서원의 워케이션 신청을 검토하고 승인 또는 반려할 수 있습니다.

* 신청 내역 조회
* 신청 상세 확인
* 업무 계획 확인
* 일정 확인
* 비용 확인
* 승인 / 반려
* 반려 사유 입력

### 4. 워케이션 일정 관리

워케이션 기간 동안 필요한 일정을 관리합니다.

* 워케이션 기간
* 근무 일정
* 개인 일정
* 지역 프로그램
* 숙소 정보
* 주요 일정 확인

### 5. 업무 관리

워케이션 중에도 정상적인 업무가 이루어질 수 있도록 업무를 관리합니다.

* 업무 등록
* 업무 목표 설정
* 업무 진행 상태 관리
* 업무 완료 처리
* 업무 결과 작성
* 업무 완료 현황 확인

관리자는 업무를 직접 수행하는 것이 아니라 **업무 계획과 완료 여부를 확인하는 방식**으로 운영합니다.

### 6. 비용 및 정산

워케이션과 관련된 비용을 관리합니다.

* 예상 비용
* 실제 지출 금액
* 교통비
* 숙박비
* 식비
* 기타 비용
* 영수증 등록
* 지원금 확인
* 정산 신청
* 정산 승인

```text
워케이션 승인
      ↓
   비용 발생
      ↓
   정산 신청
      ↓
   관리자 검토
      ↓
   정산 승인
```

### 7. 지자체 지원금

지역 및 정책에 따라 워케이션 지원금 정보를 관리할 수 있도록 설계합니다.

* 지원 지역
* 지원 기간
* 지원 대상
* 지원 금액
* 지원 조건
* 지원금 신청 여부
* 지원금 지급 상태

> 실제 지자체 지원 정책은 지역과 기간에 따라 달라질 수 있으므로 프로젝트에서는 **더미 데이터를 활용한 정책 관리 기능**으로 구현할 수 있습니다.

### 8. 워케이션 취소

승인된 워케이션도 일정 변경이나 개인 사정에 따라 취소할 수 있도록 구성합니다.

```text
승인
 ↓
취소 요청
 ↓
상급자 검토
 ↓
취소 승인 / 반려
```

취소 시에는 취소 사유와 신청자, 신청일, 승인 상태 등을 기록하여 관리합니다.

### 9. 관리자 대시보드

관리자는 전체 워케이션 운영 현황을 한눈에 확인할 수 있습니다.

* 전체 신청 건수
* 승인 / 반려 건수
* 진행 중인 워케이션
* 종료된 워케이션
* 정산 대기 건수
* 총 지원금
* 총 비용
* 부서별 워케이션 현황
* 지역별 이용 현황

---

## 🏗️ System Architecture

```text
                    ┌──────────────────┐
                    │      Client      │
                    │  React Web App   │
                    └────────┬─────────┘
                             │
                             │ HTTP / REST API
                             ↓
                    ┌──────────────────┐
                    │     Backend      │
                    │   Spring Boot    │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │   JPA    │   │ Security │   │ Business │
        │          │   │          │   │  Logic   │
        └────┬─────┘   └──────────┘   └──────────┘
             │
             ↓
        ┌──────────┐
        │ Database │
        │  MySQL   │
        └──────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology   | Description         |
| ------------ | ------------------- |
| React        | 사용자 인터페이스           |
| JavaScript   | Frontend 개발         |
| Vite         | Frontend Build Tool |
| Axios        | REST API 통신         |
| HTML5 / CSS3 | UI 구성               |

### Backend

| Technology      | Description                   |
| --------------- | ----------------------------- |
| Java            | Backend 개발                    |
| Spring Boot     | REST API 및 서버                 |
| Spring MVC      | Web Layer                     |
| Spring Data JPA | ORM / 데이터 접근                  |
| Spring Security | 인증 / 권한 관리                    |
| Maven           | Build / Dependency Management |

### Database

| Technology | Description |
| ---------- | ----------- |
| MySQL      | 관계형 데이터베이스  |

### Deployment

| Technology     | Description                |
| -------------- | -------------------------- |
| AWS EC2        | Application Server         |
| AWS RDS        | Database Server            |
| Nginx          | Web Server / Reverse Proxy |
| GitHub Actions | CI/CD                      |

---

## 📂 Project Structure

```text
WorkFlow/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── services/
│   │   └── assets/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── ...
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── ...
│   │   └── test/
│   │
│   └── pom.xml
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
└── README.md
```

---

## 🔐 권한 구조

WorkFlow는 역할 기반 접근 제어(Role-Based Access Control)를 적용합니다.

```text
                    ┌─────────────┐
                    │    사용자    │
                    └──────┬──────┘
                           │
             ┌─────────────┼─────────────┐
             ↓             ↓             ↓
        ┌─────────┐   ┌─────────┐   ┌─────────┐
        │  직원   │   │ 부서장  │   │ 관리자  │
        └─────────┘   └─────────┘   └─────────┘
             │             │             │
             ↓             ↓             ↓
          신청/관리      승인/관리      전체 관리
```

### 권한 예시

| 기능       |  직원 | 부서장 | 관리자 |
| -------- | :-: | :-: | :-: |
| 회원정보 관리  |  ✅  |  ✅  |  ✅  |
| 워케이션 신청  |  ✅  |  ✅  |  ✅  |
| 본인 신청 조회 |  ✅  |  ✅  |  ✅  |
| 워케이션 승인  |  ❌  |  ✅  |  ✅  |
| 부서원 관리   |  ❌  |  ✅  |  ✅  |
| 업무 관리    |  ✅  |  ✅  |  ✅  |
| 비용/정산 신청 |  ✅  |  ✅  |  ✅  |
| 정산 승인    |  ❌  |  ❌  |  ✅  |
| 지원금 관리   |  ❌  |  ❌  |  ✅  |
| 전체 통계    |  ❌  |  △  |  ✅  |
| 회원/권한 관리 |  ❌  |  ❌  |  ✅  |

---

## 🗄️ 주요 Domain

```text
User
 │
 ├── Department
 │
 └── Role

User
 │
 └── Workation
       │
       ├── WorkationSchedule
       ├── WorkTask
       ├── Expense
       ├── Settlement
       └── Subsidy

Workation
 │
 ├── Approval
 └── Cancellation
```

---

## 🚀 실행 방법

### 1. Repository Clone

```bash
git clone https://github.com/USERNAME/WorkFlow.git
cd WorkFlow
```

### 2. Backend 실행

```bash
cd backend
./mvnw spring-boot:run
```

또는

```bash
mvn spring-boot:run
```

### 3. Frontend 실행

```bash
cd frontend
npm install
npm run dev
```

### 4. Build

Backend:

```bash
mvn clean package
```

Frontend:

```bash
npm run build
```

---

## 🌐 Deployment

WorkFlow는 AWS 기반 배포 환경을 고려하여 설계합니다.

```text
                    Internet
                       │
                       ↓
                ┌─────────────┐
                │    Nginx    │
                │    :80      │
                └──────┬──────┘
                       │
          ┌────────────┴────────────┐
          ↓                         ↓
   React Static Files         Spring Boot
                              Application
                                  │
                                  ↓
                              AWS RDS
                               MySQL
```

GitHub Actions를 활용하여 Git Repository에 코드가 Push되면 자동으로 Build 및 Deploy할 수 있도록 CI/CD 환경을 구성합니다.

---

## 🔄 CI/CD

```text
Developer
    │
    │ git push
    ↓
GitHub Repository
    │
    ↓
GitHub Actions
    │
    ├── Frontend Build
    ├── Backend Build
    ├── Test
    │
    ↓
AWS EC2
    │
    ├── React → Nginx
    │
    └── Spring Boot → JAR
              │
              ↓
           AWS RDS
```

---

## 📊 기대 효과

### 기업

* 워케이션 운영 업무 감소
* 승인 프로세스 표준화
* 비용 및 정산 관리 효율화
* 워케이션 운영 데이터 확보
* 직원 복지 프로그램 체계화

### 직원

* 간편한 워케이션 신청
* 일정 및 업무 통합 관리
* 비용 및 지원금 확인
* 워케이션 진행 상황 확인
* 업무와 휴식의 균형 향상

### 지역사회

* 워케이션 참여자의 지역 방문 증가
* 숙박 및 관광 서비스 이용 증가
* 지역 관광 상품 활성화
* 지역 경제 활성화

---

## 🌱 Project Vision

> **WorkFlow는 단순히 워케이션을 신청하는 시스템이 아닙니다.**

업무와 휴식이 자연스럽게 연결되고,
기업과 직원 그리고 지역사회가 함께 성장할 수 있는
**새로운 워케이션 업무 환경**을 만드는 것을 목표로 합니다.

### Work + Vacation + Flow

**일과 휴식의 흐름을 연결하다.**

---

## 👨‍💻 Team

**Workness**

> Work + Wellness + Business

업무 효율성과 직원의 워라밸을 함께 고려하는
워케이션 ERP 시스템을 개발합니다.

---

## 📌 Project Status

🚧 **Development**

현재 프로젝트 설계 및 기능 구현을 진행하고 있습니다.

### Roadmap

* [x] 프로젝트 기획
* [x] 사용자 역할 정의
* [x] 워케이션 업무 프로세스 설계
* [x] 시스템 구조 설계
* [ ] UI/UX 구현
* [ ] 회원 및 인증 기능
* [ ] 워케이션 신청 기능
* [ ] 승인 관리
* [ ] 일정 관리
* [ ] 업무 관리
* [ ] 비용 및 정산
* [ ] 관리자 대시보드
* [x] CI/CD 구축 (GitHub Actions 워크플로우/설정 파일 준비 완료 - 아래 참조, AWS 리소스 연결 및 실배포는 대기 중)
* [ ] AWS 배포 (설정 준비 완료, 실제 AWS 리소스 생성/최초 배포는 대기 중)
* [ ] 테스트 및 안정화

---

## 🚀 AWS 배포 가이드 (STEP 8)

### 1. 아키텍처

```text
                          Internet
                             │
                             ▼
                    ┌─────────────────┐
                    │   EC2 (Ubuntu)  │
                    │  ┌───────────┐  │
                    │  │  Nginx    │  │   / (정적파일)      → React (dist/)
                    │  │  :80      │──┼─▶ /workflow/**      → 127.0.0.1:8006
                    │  └─────┬─────┘  │
                    │        │        │
                    │        ▼        │
                    │  ┌───────────┐  │
                    │  │Spring Boot│  │  systemd 서비스(workflow), context-path=/workflow
                    │  │  :8006    │  │
                    │  └─────┬─────┘  │
                    └────────┼────────┘
                             ▼
                    ┌─────────────────┐
                    │   RDS (MySQL)   │  SQL/WorkFlow_Script.sql 기준 스키마
                    └─────────────────┘
```

React와 Spring Boot를 **같은 EC2 인스턴스, 같은 origin(포트 80)**에서 서빙한다.
Nginx가 `/workflow/**` 요청만 백엔드(`localhost:8006`)로 프록시하고, 나머지는 React 정적 파일을 반환한다.
이 구조 덕분에 브라우저 입장에서는 프론트엔드와 API가 **같은 origin**이라 CORS가 대부분의 경우 필요 없다.

### 2. Git 브랜치 전략 / 배포 트리거

```text
main  →  (준비되면) Deploy 브랜치로 병합/푸시  →  GitHub Actions 자동 실행  →  AWS 배포
```

* **`Deploy`** 브랜치에 push가 발생할 때만 `.github/workflows/deploy.yml`이 실행된다.
* `main`에 아무리 push해도 자동 배포되지 않는다 (의도적으로 분리됨).
* 배포하려면 반드시 `main`의 변경사항을 `Deploy` 브랜치로 가져온 뒤 `Deploy`에 push해야 한다.

```bash
git checkout Deploy
git merge main
git push origin Deploy
```

### 3. 필요한 GitHub Secrets

Repository Settings → Secrets and variables → Actions 에 아래 항목을 등록한다.

| Secret 이름 | 설명 |
|---|---|
| `AWS_ACCESS_KEY_ID` | CI/CD 전용 IAM 사용자의 Access Key (Root 계정 키 사용 금지) |
| `AWS_SECRET_ACCESS_KEY` | 위 IAM 사용자의 Secret Key |
| `AWS_REGION` | 예: `ap-northeast-2` |
| `AWS_DEPLOY_BUCKET` | 빌드 산출물(JAR, 프론트 빌드)을 임시로 올려둘 S3 버킷 이름 |
| `EC2_INSTANCE_ID` | 배포 대상 EC2 인스턴스 ID (예: `i-0123456789abcdef0`) |
| `KAKAO_APP_KEY` | Kakao Maps JavaScript SDK 키 (프론트 빌드 시 주입) |
| `EC2_PUBLIC_URL` | (선택) 배포 후 외부 스모크 테스트용, 예: `http://<EC2_공인IP>` |

> AWS Access Key/Secret Key는 GitHub Secrets에만 저장하며 코드에 절대 직접 적지 않는다. GitHub OIDC는 사용하지 않는다(이번 프로젝트의 결정).

### 4. EC2에서 준비해야 할 것 (최초 1회, 아래 "AWS에서 직접 해야 할 작업" 참조)

* `/opt/workflow/backend/` — 백엔드 JAR 배치 위치
* `/opt/workflow/uploads/receipts/` — 비용 영수증 업로드 저장 위치
* `/etc/workflow/workflow.env` — 운영 환경변수 (`deploy/workflow.env.example` 참고, 실제 값 채워서 EC2에만 생성)
* `/etc/systemd/system/workflow.service` — `deploy/systemd/workflow.service` 그대로 복사
* `/etc/nginx/sites-available/workflow.conf` — `deploy/nginx/workflow.conf` 그대로 복사 후 `sites-enabled`에 링크
* SSM Agent 활성화 + EC2 인스턴스 프로필에 `AmazonSSMManagedInstanceCore` + S3 읽기 정책 연결

### 5. 최초 배포 절차

1. AWS에서 EC2(Ubuntu, Java 21 설치), RDS(MySQL), S3 버킷을 직접 생성한다 (Claude가 자동 생성하지 않음).
2. EC2에 Java 21, Nginx 설치 후 위 "4. EC2에서 준비해야 할 것" 항목을 전부 설정한다.
3. RDS에 `SQL/WorkFlow_Script.sql`을 실행해 스키마를 구축한다.
4. `/etc/workflow/workflow.env`에 RDS 접속정보 등 실제 값을 채운다.
5. GitHub repository에 위 "3. 필요한 GitHub Secrets"를 전부 등록한다.
6. `Deploy` 브랜치를 생성하고 `main`을 병합해 push한다 → GitHub Actions가 자동으로 빌드·배포한다.
7. Actions 탭에서 워크플로우 로그를 확인하고, 완료 후 `http://<EC2_공인IP>` 로 접속해 로그인 화면이 뜨는지 확인한다.

### 6. 재배포 절차

`Deploy` 브랜치에 새 커밋을 push하기만 하면 된다. GitHub Actions가 자동으로:
Maven 빌드 → npm 빌드 → S3 업로드 → SSM으로 EC2에서 JAR 교체 + `systemctl restart workflow` → 프론트 정적파일 교체 + `nginx reload` → 헬스체크까지 수행한다.

```bash
git checkout Deploy
git merge main   # 또는 원하는 브랜치
git push origin Deploy
```

### 7. 서버 상태 확인 명령 (EC2 접속 후)

```bash
# 백엔드 서비스 상태
sudo systemctl status workflow
sudo journalctl -u workflow -f          # 실시간 로그

# 백엔드가 실제로 응답하는지
curl -i http://127.0.0.1:8006/workflow/v3/api-docs

# Nginx 상태 / 설정 문법 검사
sudo systemctl status nginx
sudo nginx -t

# 프론트 정적 파일이 잘 배포됐는지
ls -la /usr/share/nginx/html
```

### 8. 장애 발생 시 확인 방법

| 증상 | 확인할 것 |
|---|---|
| GitHub Actions에서 실패 | Actions 탭 로그 확인. `Verify deployment result` 스텝이 SSM 명령의 stdout/stderr를 그대로 출력하므로 대부분 원인이 바로 보임 |
| 백엔드가 재시작 후 응답 없음 | `sudo journalctl -u workflow -n 100` — DB 연결 실패(`workflow.env`의 `DB_URL`/비밀번호), JWT_SECRET 누락 등이 흔한 원인 |
| 502/504 (Nginx) | 백엔드(`:8006`)가 떠 있는지 먼저 확인, `sudo nginx -t`로 설정 문법 확인 |
| 새로고침 시 흰 화면/404 | `deploy/nginx/workflow.conf`의 `try_files ... /index.html` 폴백이 실제로 적용됐는지 확인 |
| 로그인 후 API 호출이 CORS 에러 | `CORS_ALLOWED_ORIGINS` 환경변수가 실제 접속 도메인과 일치하는지 확인 (same-origin이면 애초에 CORS 자체가 발생하지 않아야 함) |
| 파일 업로드 실패 | `/opt/workflow/uploads/receipts/`에 `workflow` 사용자 쓰기 권한이 있는지 확인 |
| DB 연결 안 됨 | RDS 보안그룹이 EC2로부터의 3306 인바운드를 허용하는지, `workflow.env`의 `DB_URL`이 정확한지 확인 |

### 9. 관련 파일

| 파일 | 용도 |
|---|---|
| `.github/workflows/deploy.yml` | GitHub Actions 배포 워크플로우 |
| `deploy/nginx/workflow.conf` | Nginx 설정 (React + API 프록시) |
| `deploy/systemd/workflow.service` | Spring Boot systemd 서비스 정의 |
| `deploy/workflow.env.example` | EC2용 운영 환경변수 템플릿 (실제 값은 EC2에만 존재) |
| `deploy/scripts/remote-deploy.sh` | SSM으로 EC2에서 실행되는 실제 배포 스크립트 |
| `WorkFlow_Project_BE/src/main/resources/application-prod.properties` | Production Spring 프로필 |
| `workflow_project_fe/.env.example` | 프론트 로컬 개발용 환경변수 템플릿 |

---

## 📄 License

This project is developed for educational and portfolio purposes.


