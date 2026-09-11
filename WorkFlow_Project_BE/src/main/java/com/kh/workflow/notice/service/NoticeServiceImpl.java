package com.kh.workflow.notice.service;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.employee.model.dao.EmployeeDao;
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.notice.dao.NoticeRepository;
import com.kh.workflow.notice.vo.Notice;
import com.kh.workflow.notice.vo.NoticeFile;

@Service
public class NoticeServiceImpl implements NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private EmployeeDao employeeDao;


    // =========================================================
    // 첨부파일 저장 설정
    //
    // Amount 도메인(AmountServiceImpl)과 동일한 패턴
    // =========================================================

    @Value("${app.upload.notice-dir:C:/upload/notice/}")
    private String UPLOAD_DIR;

    private static final String FILE_PATH = "/upload/notice/";

    private static final long MAX_FILE_SIZE = 10L * 1024L * 1024L;


    // =========================================================
    // 검색/페이징 공통 처리
    //
    // map: offset, limit, condition(title/content/writer/그 외=제목+내용), keyword
    // 기존 notice-mapper.xml의 <choose> 조건 분기를 그대로 반영
    // =========================================================

    private Page<Notice> searchPage(Map<String, Object> map) {

        int offset = ((Number) map.get("offset")).intValue();
        int limit = ((Number) map.get("limit")).intValue();
        String condition = (String) map.get("condition");
        String keyword = (String) map.get("keyword");

        // offset은 (page - 1) * limit 형태로 컨트롤러에서 계산되어 넘어오므로
        // Pageable의 page 번호로 되돌리기 위해 다시 나눔
        int pageNumber = limit > 0 ? offset / limit : 0;
        Pageable pageable = PageRequest.of(pageNumber, limit);

        if (keyword == null || keyword.isBlank()) {
            return noticeRepository.findAllVisible(pageable);
        }

        if ("title".equals(condition)) {
            return noticeRepository.findByTitleVisible(keyword, pageable);
        }

        if ("content".equals(condition)) {
            return noticeRepository.findByContentVisible(keyword, pageable);
        }

        if ("writer".equals(condition)) {
            return noticeRepository.findByWriterVisible(keyword, pageable);
        }

        return noticeRepository.findByTitleOrContentVisible(keyword, pageable);
    }


    // 목록 조회 결과에 작성자 이름(emp_name)을 채워넣음
    // (emp_no가 관계매핑이 아닌 plain FK라 서비스 계층에서 일괄 조회 후 매핑)
    private void attachEmpNames(List<Notice> list) {

        if (list.isEmpty()) {
            return;
        }

        Set<Integer> empNos =
                list.stream()
                        .map(Notice::getEmpNo)
                        .collect(Collectors.toSet());

        Map<Integer, String> empNoToName =
                employeeDao.findAllById(empNos)
                        .stream()
                        .collect(Collectors.toMap(
                                Employee::getEmpNo,
                                Employee::getEmpName
                        ));

        list.forEach(n ->
                n.setEmpName(empNoToName.get(n.getEmpNo()))
        );
    }


    // =========================================================
    // 공지사항 총 개수 조회
    // =========================================================

    @Override
    public int selectNoticeCount(Map<String, Object> map) {

        return (int) searchPage(map).getTotalElements();
    }


    // =========================================================
    // 공지사항 목록 조회
    // =========================================================

    @Override
    public ArrayList<Notice> selectNoticeList(Map<String, Object> map) {

        List<Notice> list = searchPage(map).getContent();

        attachEmpNames(list);

        return new ArrayList<>(list);
    }


    // =========================================================
    // 공지사항 상세 조회
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Notice selectNotice(int noticeNo) {

        Notice notice =
                noticeRepository.findById(noticeNo)
                        .orElse(null);

        if (notice != null) {

            employeeDao.findById(notice.getEmpNo())
                    .ifPresent(e ->
                            notice.setEmpName(e.getEmpName())
                    );

            // -------------------------------------------------
            // LAZY 연관관계를 트랜잭션 안에서 초기화한다.
            //
            // fileList
            // -------------------------------------------------

            if (notice.getFileList() != null) {
                notice.getFileList().size();
            }
        }

        return notice;
    }


    // =========================================================
    // 공지사항 등록
    // =========================================================

    @Transactional(rollbackFor = Exception.class)
    @Override
    public int insertNotice(Notice n) {

        n.setCreatedAt(LocalDateTime.now());

        if (n.getViewCount() == null) {
            n.setViewCount(0);
        }

        List<MultipartFile> files = n.getFiles();

        // 저장 전 files를 비워서 fileList(연관관계)와 충돌하지 않도록 함
        n.setFiles(null);

        Notice saved = noticeRepository.save(n);

        try {

            saveNewFiles(saved, files);

        } catch (IOException e) {

            throw new RuntimeException(
                    "공지사항 첨부파일 저장 중 오류가 발생했습니다.",
                    e
            );
        }

        return 1;
    }


    // =========================================================
    // 공지사항 수정
    // =========================================================

    @Transactional(rollbackFor = Exception.class)
    @Override
    public int updateNotice(Notice n) {

        Notice existing =
                noticeRepository.findById(n.getNoticeNo())
                        .orElse(null);

        if (existing == null) {
            return 0;
        }

        existing.setNoticeTitle(n.getNoticeTitle());
        existing.setNoticeContent(n.getNoticeContent());
        existing.setNoticeStatus(n.getNoticeStatus());

        noticeRepository.save(existing);

        try {

            saveNewFiles(existing, n.getFiles());

        } catch (IOException e) {

            throw new RuntimeException(
                    "공지사항 첨부파일 저장 중 오류가 발생했습니다.",
                    e
            );
        }

        return 1;
    }


    // =========================================================
    // 공지사항 삭제
    // =========================================================

    @Transactional
    @Override
    public int deleteNotice(int noticeNo) {

        if (!noticeRepository.existsById(noticeNo)) {
            return 0;
        }

        noticeRepository.deleteById(noticeNo);

        return 1;
    }


    // =========================================================
    // 로그인 ID로 사원번호 조회
    // =========================================================

    @Override
    public Integer selectEmpNoByLoginId(String loginId) {

        return employeeDao.findByEmpId(loginId)
                .map(Employee::getEmpNo)
                .orElse(null);
    }


    // =========================================================
    // 관리자 권한 확인
    //
    // employee.auth_code = 'ADMIN'
    //
    // 기존 MyBatis 구현은 NoticeDao.isAdmin()이 존재하지 않는
    // statement id("noticeMapper.isAdmin")를 호출해 항상 예외가 발생했던
    // 버그가 있었음(실제 정의는 selectIsAdminByLoginId) - JPA 전환하면서
    // EmployeeDao 기반의 직접 조회로 교체해 근본적으로 해결
    // =========================================================

    @Override
    public boolean isAdmin(String loginId) {

        return employeeDao.findByEmpId(loginId)
                .map(e -> "ADMIN".equals(e.getAuthCode()))
                .orElse(false);
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public int deleteFile(int noticefileNo) {

        NoticeFile noticeFile =
                noticeRepository.findNoticeFileById(noticefileNo)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "해당 첨부파일을 찾을 수 없습니다."
                                )
                        );

        // 실제 파일 삭제 (선택사항이지만 권장)
        try {
            File file = new File(UPLOAD_DIR, noticeFile.getChangeName());
            if (file.exists()) {
                file.delete();
            }
        } catch (Exception ignored) {
            // 파일 삭제 실패해도 DB 삭제는 진행
        }

        return noticeRepository.deleteNoticeFile(noticefileNo);
    }
    
    
    
    // =========================================================
    // 첨부파일 다운로드
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> downloadFile(int noticefileNo) {

        NoticeFile noticeFile =
                noticeRepository.findNoticeFileById(noticefileNo)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "해당 첨부파일을 찾을 수 없습니다."
                                )
                        );

        try {

            File file = new File(UPLOAD_DIR, noticeFile.getChangeName());

            Path path = file.toPath();

            if (!Files.exists(path)) {

                throw new IllegalArgumentException(
                        "파일이 서버에 존재하지 않습니다."
                );
            }

            Resource resource = new UrlResource(path.toUri());

            String encodedFileName =
                    URLEncoder.encode(
                            noticeFile.getOriginName(),
                            StandardCharsets.UTF_8
                    ).replace("+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + encodedFileName + "\""
                    )
                    .body(resource);

        } catch (MalformedURLException e) {

            throw new RuntimeException(
                    "파일 다운로드 중 오류가 발생했습니다.",
                    e
            );
        }
    }


    // =========================================================
    // 첨부파일 실제 저장
    //
    // AmountServiceImpl.saveNewFiles()와 동일한 패턴
    // =========================================================

    private void saveNewFiles(
            Notice notice,
            List<MultipartFile> files)
            throws IOException {

        if (files == null || files.isEmpty()) {
            return;
        }

        File uploadDir = new File(UPLOAD_DIR);

        if (!uploadDir.exists()) {

            if (!uploadDir.mkdirs() && !uploadDir.exists()) {

                throw new IOException(
                        "첨부파일 저장 폴더를 생성할 수 없습니다."
                );
            }
        }

        for (MultipartFile multipartFile : files) {

            if (multipartFile == null || multipartFile.isEmpty()) {
                continue;
            }

            if (multipartFile.getSize() > MAX_FILE_SIZE) {

                throw new IllegalArgumentException(
                        "첨부파일은 10MB 이하만 업로드할 수 있습니다."
                );
            }

            String originalFilename =
                    multipartFile.getOriginalFilename();

            if (originalFilename == null || originalFilename.isBlank()) {
                continue;
            }

            originalFilename =
                    new File(originalFilename).getName();

            String changeName =
                    UUID.randomUUID() + "_" + originalFilename;

            File destination =
                    new File(uploadDir, changeName);

            multipartFile.transferTo(destination);

            NoticeFile noticeFile = new NoticeFile();

            noticeFile.setNotice(notice);
            noticeFile.setOriginName(originalFilename);
            noticeFile.setChangeName(changeName);
            noticeFile.setFilePath(FILE_PATH + changeName);
            noticeFile.setUpdatedAt(LocalDateTime.now());
            noticeFile.setStatus("Y");

            notice.getFileList().add(noticeFile);
        }

        // fileList는 CascadeType.ALL이므로 notice를 다시 save하면 자식(NoticeFile)도 함께 저장됨
        noticeRepository.save(notice);
    }
}