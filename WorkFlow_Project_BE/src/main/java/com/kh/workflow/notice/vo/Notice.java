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

    @Column(name = "notice_title", length = 200, nullable = false)
    private String noticeTitle;

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
