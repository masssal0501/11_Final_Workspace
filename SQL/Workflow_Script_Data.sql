-- 임의 사용자 계정데이터
INSERT INTO employee (emp_id, emp_pwd, emp_name, phone, email, address, join_at, status, pw_chg_required, dep_id, auth_code, job_code) VALUES
-- 관리자 (1명)
('admin01', '$2a$10$1tpWzuqxqpx04vYNpVCBT.Dbc3cED1CNdNyx4RtMLM.OQGvY3jwI2', '관리자', '010-1111-2222', 'admin@workflow.com', '서울시 강남구', NOW(), 'N', FALSE, 'D1', 'ADMIN', 'J5'),

-- 매니저 (1명)
('manager01', '$2a$10$dummyPasswordHashExample2', '김팀장', '010-3333-4444', 'manager@workflow.com', '서울시 서초구', NOW(), 'Y', FALSE, 'D2', 'MANAGER', 'J3'),

-- 스태프 (7명)
('staff01', '$2a$10$dummyPasswordHashExample3', '홍길동', '010-5555-6666', 'staff1@workflow.com', '경기도 성남시', NOW(), 'Y', FALSE, 'D3', 'STAFF', 'J1'),
('staff02', '$2a$10$dummyPasswordHashExample4', '김철수', '010-5555-7777', 'staff2@workflow.com', '서울시 송파구', NOW(), 'Y', FALSE, 'D3', 'STAFF', 'J1'),
('staff03', '$2a$10$dummyPasswordHashExample5', '이영희', '010-5555-8888', 'staff3@workflow.com', '인천시 연수구', NOW(), 'Y', FALSE, 'D4', 'STAFF', 'J2'),
('staff04', '$2a$10$dummyPasswordHashExample6', '박민수', '010-5555-9999', 'staff4@workflow.com', '경기도 수원시', NOW(), 'Y', FALSE, 'D4', 'STAFF', 'J1'),
('staff05', '$2a$10$dummyPasswordHashExample7', '정지원', '010-6666-1111', 'staff5@workflow.com', '서울시 마포구', NOW(), 'Y', FALSE, 'D5', 'STAFF', 'J2'),
('staff06', '$2a$10$dummyPasswordHashExample8', '한서준', '010-6666-2222', 'staff6@workflow.com', '경기도 고양시', NOW(), 'Y', FALSE, 'D5', 'STAFF', 'J1'),
('staff07', '$2a$10$dummyPasswordHashExample9', '오지은', '010-6666-3333', 'staff7@workflow.com', '서울시 용산구', NOW(), 'Y', FALSE, 'D6', 'STAFF', 'J2'),
('test', '$2a$10$1tpWzuqxqpx04vYNpVCBT.Dbc3cED1CNdNyx4RtMLM.OQGvY3jwI2', '테스트', '010-6666-3333', 'masssal0501@gmail.com', '서울시 용산구', NOW(), 'Y', FALSE, 'D6', 'STAFF', 'J2');

-- 더미 워케이션 신청 내역
INSERT INTO workcation_info (
workcation_title,
work_plan,
start_at,
end_at,
approver_state,
emp_no
)
VALUES(
'강릉 스마트 워크스페이스 워케이션',
'해안 인근 거점 근무 및 원격 협업 진행',
'2026-09-01 09:00:00',
'2026-09-05 18:00:00',
'W',
1),
('부산 해운대 코워킹 워케이션',
'센텀시티 공유오피스 활용 프로젝트 기획',
'2026-09-10 09:00:00',
'2026-09-15 18:00:00',
'A',
2);

-- 더미 비용지원
INSERT INTO amount_support(
approved_amount,
requested_at,
approved_at,
created_at,
status,
amount_comment,
workcation_no)
VALUES(
150000,
NOW(),
NULL,
NOW(),
'W',
'지원금 신청 건 검토 요청',
1),
(300000,
'2026-08-20 10:00:00',
NOW(),
'2026-08-20 10:00:00',
'A',
'승인 완료된 지원금', 2);

-- 더미 지우너금 목록
INSERT INTO support_list (
sponsor_name,
request_amount,
approved_amount,
payment_date,
status,
remark,
transport_supported,
other_supported,
amount_no)VALUES(
'지자체 지원사업',
150000,
150000,
NULL,
'UNPAID',
'숙박비 및 식비 지원 항목',
 'Y', 'N', 1),
 ('진흥원 지원사업',
 300000,
 300000,
 NOW(),
 'PAID',
 '교통비 포함 최종 지급완료',
 'Y','Y',2);
 
 -- 더미 거점
 INSERT INTO hub(
 hub_no,
 main_region,
 sub_region,
 hub_name,
 hub_address,
 phone,
 description,
 hub_type,
 max_capacity,
 price,
 hub_status)VALUES 
(1, '강원도', '강릉시', '강릉 바다코워킹스페이스', '강원도 강릉시 경강로 1234', '033-123-4567', '탁 트인 동해 바다가 보이는 쾌적한 원격 근무 공간입니다.', 1, 30, 20000, 'OPEN'),
(2, '부산', '해운대구', '해운대 오션사이드 호텔', '부산광역시 해운대구 해운대해변로 567', '051-987-6543', '해수욕장 도보 3분 거리의 깔끔한 워케이션 숙소입니다.', 2, 4, 120000, 'OPEN'),
(3, '강원도', '양양군', '서핑 앤 워크 양양 패키지', '강원도 양양군 현남면 동해대로 89', '033-555-1212', '오전에는 업무, 오후에는 서핑을 즐길 수 있는 강원도 대표 체험 프로그램', 3, 15, 50000, 'OPEN'),
(4, '제주도', '제주시', '제주 흑돼지 명가 오피스점', '제주특별자치도 제주시 중앙로 45', '064-777-8888', '신선한 제주 흑돼지 함께 팀 회식하기 좋은 최고의 맛집', 4, 50, 60000, 'OPEN'),
(5, '강원도', '춘천시', '남이섬 숲속 힐링 산책로', '강원도 춘천시 남이섬길 1', '033-740-8114', '업무 스트레스를 날려버릴 수 있는 자연 친화적 힐링 관광지', 5, 100, 15000, 'OPEN'),

(6, '부산', '영도구', '영도 오션뷰 공유오피스', '부산광역시 영도구 태종로 100', '051-222-3333', '바다를 보며 아이디어를 구상하기 좋은 영도의 스마트 오피스', 1, 20, 25000, 'OPEN'),
(7, '제주도', '서귀포시', '중문 힐링 리조트 앤 숙소', '제주특별자치도 서귀포시 중문관광로 72', '064-555-4444', '조용한 분위기에서 휴식과 업무를 병행할 수 있는 서귀포 숙소', 2, 6, 150000, 'OPEN'),
(8, '부산', '수영구', '광안리 해양레저 패키지', '부산광역시 수영구 광안해변로 200', '051-777-1111', '업무 후 광안대교를 바라보며 즐기는 패들보드 체험 프로그램', 3, 10, 40000, 'OPEN'),
(9, '강원도', '속초시', '속초 아바이 수제순대 맛집', '강원도 속초시 아바이마을길 12', '033-633-9999', '고소하고 담백한 전통 순대를 맛볼 수 있는 속초 명물 맛집', 4, 30, 25000, 'OPEN'),
(10, '제주도', '제주시', '성산일출봉 트레킹 코스', '제주특별자치도 서귀포시 성산읍 일출로 284-12', '064-783-0959', '아름다운 일출과 자연경관을 만끽할 수 있는 대표 관광지', 5, 200, 5000, 'OPEN'),

(11, '강원도', '평창군', '대관령 웰컴 코워킹센터', '강원도 평창군 대관령면 오목길 33', '033-333-7777', '시원한 고원 기후 속에서 집중해서 일할 수 있는 공유오피스', 1, 40, 18000, 'OPEN'),
(12, '강원도', '강릉시', '경포 레이크 사이드 펜션', '강원도 강릉시 창해로 350', '033-644-2222', '경포호 근처의 조용하고 아늑한 워케이션 전용 숙소', 2, 5, 110000, 'OPEN'),
(13, '제주도', '제주시', '제주 전통 도자기 공예 체험', '제주특별자치도 제주시 조천읍 선교로 200', '064-784-3333', '제주의 토속 감성을 담아 나만의 도자기를 만드는 체험 프로그램', 3, 8, 35000, 'OPEN'),
(14, '부산', '부산진구', '서면 전포 카페거리 브런치 맛집', '부산광역시 부산진구 서전로 38', '051-808-5555', '세련된 분위기에서 브런치와 커피를 즐기며 미팅하기 좋은 곳', 4, 25, 30000, 'OPEN'),
(15, '부산', '해운대구', '부산 아쿠아리움 해양 탐방', '부산광역시 해운대구 해운대해변로 266', '051-740-1700', '다양한 해양 생물을 관람하며 리프레시할 수 있는 관광 명소', 5, 150, 22000, 'OPEN');
 
 