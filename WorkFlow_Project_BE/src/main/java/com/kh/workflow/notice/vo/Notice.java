package com.kh.workflow.notice.vo;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "notice")
@NoArgsConstructor
@Getter
@Setter
@ToString(exclude = "fileList")
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_no")
    private Integer noticeNo;

    // BUG-03: notice_title 컬럼이 실제로 varchar(200)이라 200자를 넘기면 DB에서
    // "Data too long" SQL 예외(500)로 튕겨나갔다. 프런트(입력 카운터)뿐 아니라
    // 백엔드에서도 동일한 길이 제한을 명시적으로 검증해 400으로 응답하도록 한다.
    @NotBlank(message = "제목을 입력해주세요.")
    @Size(max = 200, message = "제목은 200자 이하로 입력해주세요.")
    @Column(name = "notice_title", length = 200, nullable = false)
    private String noticeTitle;

    // notice_content는 DB상 TEXT(최대 약 65,535바이트)라 여유는 있지만, 무제한 입력을
    // 막기 위해 화면에서 다루기 적절한 상한(10,000자)을 애플리케이션 레벨에서 강제한다.
    @NotBlank(message = "내용을 입력해주세요.")
    @Size(max = 10000, message = "내용은 10,000자 이하로 입력해주세요.")
    @Column(name = "notice_content", nullable = false, columnDefinition = "TEXT")
    private String noticeContent;

    @Column(
        name = "created_at",
        columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    )
    private LocalDateTime createdAt;

    @Column(name = "notice_status", length = 20, nullable = false)
    private String noticeStatus;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(name = "emp_no", nullable = false)
    private Integer empNo;

    // employee.emp_name - 조회 시 조인하여 채워주는 값 (emp_no는 plain FK 컬럼이라 관계매핑 대신
    // 서비스 계층에서 EmployeeDao로 조회해 채움, 기존 MyBatis의 JOIN 결과와 동일한 응답 형태 유지)
    @Transient
    private String empName;

    // 첨부파일 목록 - notice_file 테이블과 매핑은 되어 있으나, 기존 MyBatis 구현에서도
    // 실제 저장/조회 로직이 없어(파일은 컨트롤러에서 받기만 하고 저장되지 않음) 이번 전환에서도
    // 기존 동작 그대로 항상 빈 리스트로 유지함 (STEP7 보고 참고). 응답 JSON에 "fileList":[]로
    // 계속 노출되도록 이 필드 자체는 JsonIgnore하지 않음 (자식 쪽 back-reference만 처리, 순환참조 방지)
    @OneToMany(
        mappedBy = "notice",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<NoticeFile> fileList = new ArrayList<>();

    // 요청으로 전달된 첨부파일 - 기존과 동일하게 전달만 받고 실제로는 저장하지 않음
    @Transient
    private List<MultipartFile> files;
}
