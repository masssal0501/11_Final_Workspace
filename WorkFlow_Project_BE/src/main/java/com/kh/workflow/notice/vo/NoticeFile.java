package com.kh.workflow.notice.vo;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "notice_file")
@NoArgsConstructor
@Getter
@Setter
@ToString(exclude = "notice")
public class NoticeFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "noticefile_no")
    private Integer noticefileNo;

    @Column(name = "file_path", length = 500, nullable = false)
    private String filePath;

    @Column(name = "origin_name", length = 225, nullable = false)
    private String originName;

    @Column(name = "change_name", length = 255)
    private String changeName;

    @Column(
        name = "updated_at",
        columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    )
    private LocalDateTime updatedAt;

    @Column(name = "status", length = 1)
    private String status;

    // 부모(Notice) 역참조 - Amount 계열과 동일하게 순환참조 방지를 위해 JsonIgnore
    @JsonIgnore
    @JoinColumn(name = "notice_no", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private Notice notice;
}
