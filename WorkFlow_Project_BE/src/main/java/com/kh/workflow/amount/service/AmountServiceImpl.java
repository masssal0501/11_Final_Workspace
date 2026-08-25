package com.kh.workflow.amount.service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.amount.dao.AmountDao;
import com.kh.workflow.amount.vo.Amount;

@Service
public class AmountServiceImpl implements AmountService {

    private final AmountDao amountDao;

    // =========================================================
    // 파일 저장 경로
    // =========================================================

    private static final String UPLOAD_DIR =
            "C:/upload/receipts/";

    private static final String FILE_PATH =
            "/upload/receipts/";


    // =========================================================
    // 생성자
    // =========================================================

    public AmountServiceImpl(AmountDao amountDao) {
        this.amountDao = amountDao;
    }


    // =========================================================
    // 1. 비용 신청 등록
    //
    // amount
    // ├── amount_item
    // ├── amount_list
    // └── amount_file
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int insertAmount(Amount amount) {

        try {

            if (amount == null) {
                throw new IllegalArgumentException(
                        "비용 신청 정보가 없습니다."
                );
            }

            // -------------------------------------------------
            // 1. amount 등록
            // -------------------------------------------------

            int amountResult =
                    amountDao.insertAmount(amount);

            if (amountResult <= 0) {
                throw new IllegalArgumentException(
                        "비용 신청 등록에 실패했습니다."
                );
            }

            // amount_no가 정상적으로 생성되었는지 확인
            if (amount.getAmountNo() == null ||
                amount.getAmountNo() <= 0) {

                throw new IllegalArgumentException(
                        "비용 신청 번호가 생성되지 않았습니다."
                );
            }


            // -------------------------------------------------
            // 2. amount_item 등록
            // -------------------------------------------------

            if (amount.getItemList() != null) {

                for (Amount.Item item :
                        amount.getItemList()) {

                    if (item == null) {
                        continue;
                    }

                    item.setAmountNo(
                            amount.getAmountNo()
                    );

                    int itemResult =
                            amountDao.insertAmountItem(item);

                    if (itemResult <= 0) {
                        throw new IllegalArgumentException(
                                "비용 상세 항목 등록에 실패했습니다."
                        );
                    }
                }
            }


            // -------------------------------------------------
            // 3. amount_list 등록
            //
            // 중요:
            // amount_list는 item_no가 없음.
            // amount_no로 amount와 직접 연결됨.
            // -------------------------------------------------

            if (amount.getSponsorList() != null) {

                for (Amount.Sponsor sponsor :
                        amount.getSponsorList()) {

                    if (sponsor == null) {
                        continue;
                    }

                    sponsor.setAmountNo(
                            amount.getAmountNo()
                    );

                    int sponsorResult =
                            amountDao.insertAmountSponsor(
                                    sponsor
                            );

                    if (sponsorResult <= 0) {
                        throw new IllegalArgumentException(
                                "지원금 등록에 실패했습니다."
                        );
                    }
                }
            }


            // -------------------------------------------------
            // 4. amount_file 등록
            // -------------------------------------------------

            if (amount.getFileList() != null) {

                for (Amount.File file :
                        amount.getFileList()) {

                    if (file == null) {
                        continue;
                    }

                    file.setAmountNo(
                            amount.getAmountNo()
                    );

                    int fileResult =
                            amountDao.insertAmountFile(file);

                    if (fileResult <= 0) {
                        throw new IllegalArgumentException(
                                "첨부파일 정보 등록에 실패했습니다."
                        );
                    }
                }
            }


            return amountResult;

        } catch (IllegalArgumentException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException(
                    "비용 신청 등록 중 오류가 발생했습니다.",
                    e
            );
        }
    }


    // =========================================================
    // 2. 비용 상세 조회
    // =========================================================

    @Override
    public Amount selectAmountById(int amountNo) {

        if (amountNo <= 0) {
            return null;
        }

        Amount amount =
                amountDao.selectAmountById(amountNo);

        if (amount == null) {
            return null;
        }


        // -------------------------------------------------
        // amount_item 조회
        // -------------------------------------------------

        List<Amount.Item> itemList =
                amountDao.selectAmountItemsByAmountNo(
                        amountNo
                );

        if (itemList == null) {
            itemList = new ArrayList<>();
        }

        amount.setItemList(itemList);


        // -------------------------------------------------
        // amount_list 조회
        //
        // item_no가 아니라 amount_no 기준
        // -------------------------------------------------

        List<Amount.Sponsor> sponsorList =
                amountDao.selectSponsorsByAmountNo(
                        amountNo
                );

        if (sponsorList == null) {
            sponsorList = new ArrayList<>();
        }

        amount.setSponsorList(sponsorList);


        // -------------------------------------------------
        // amount_file 조회
        // -------------------------------------------------

        List<Amount.File> fileList =
                amountDao.selectAmountFilesByAmountNo(
                        amountNo
                );

        if (fileList == null) {
            fileList = new ArrayList<>();
        }

        amount.setFileList(fileList);


        return amount;
    }


    // =========================================================
    // 3. 워케이션별 비용 신청 목록
    // =========================================================

    @Override
    public List<Amount> selectAmountListByWorkcationNo(
            int workcationNo) {

        if (workcationNo <= 0) {
            return new ArrayList<>();
        }

        List<Amount> list =
                amountDao.selectAmountListByWorkcationNo(
                        workcationNo
                );

        if (list == null) {
            return new ArrayList<>();
        }

        return list;
    }


    // =========================================================
    // 4. 결재 상태 변경
    //
    // A = 승인
    // H = 보류
    // J = 반려
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int updateApprovalStatus(Amount amount) {

        try {

            if (amount == null) {
                throw new IllegalArgumentException(
                        "결재 정보가 없습니다."
                );
            }

            if (amount.getAmountNo() == null ||
                amount.getAmountNo() <= 0) {

                throw new IllegalArgumentException(
                        "잘못된 비용 신청 번호입니다."
                );
            }


            String status =
                    amount.getStatus();

            if (!"A".equals(status) &&
                !"H".equals(status) &&
                !"J".equals(status)) {

                throw new IllegalArgumentException(
                        "잘못된 결재 상태입니다."
                );
            }


            // 승인 금액 검증
            if (amount.getApprovedAmount() == null) {

                amount.setApprovedAmount(0);
            }

            if (amount.getApprovedAmount() < 0) {

                throw new IllegalArgumentException(
                        "승인 금액은 0원 이상이어야 합니다."
                );
            }


            int result =
                    amountDao.updateApprovalStatus(
                            amount
                    );

            if (result <= 0) {

                throw new IllegalArgumentException(
                        "결재 상태 변경에 실패했습니다."
                );
            }


            return result;

        } catch (IllegalArgumentException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException(
                    "결재 상태 변경 중 오류가 발생했습니다.",
                    e
            );
        }
    }


    // =========================================================
    // 5. 비용 신청 수정
    //
    // - amount 수정
    // - 기존 item 삭제
    // - item 재등록
    // - 기존 sponsor 삭제
    // - sponsor 재등록
    // - 기존 파일 유지
    // - 새 파일 추가
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateAmount(
            Amount amount,
            List<MultipartFile> files) {

        List<String> savedFiles =
                new ArrayList<>();

        try {

            // =================================================
            // 1. 기본 검증
            // =================================================

            if (amount == null) {

                throw new IllegalArgumentException(
                        "수정할 비용 정보가 없습니다."
                );
            }


            if (amount.getAmountNo() == null ||
                amount.getAmountNo() <= 0) {

                throw new IllegalArgumentException(
                        "잘못된 비용 신청 번호입니다."
                );
            }


            int amountNo =
                    amount.getAmountNo();


            // =================================================
            // 2. 기존 데이터 확인
            // =================================================

            Amount existingAmount =
                    amountDao.selectAmountById(
                            amountNo
                    );

            if (existingAmount == null) {

                throw new IllegalArgumentException(
                        "존재하지 않는 비용 신청입니다."
                );
            }


            // =================================================
            // 3. amount 수정
            // =================================================

            int amountResult =
                    amountDao.updateAmount(
                            amount
                    );

            if (amountResult <= 0) {

                throw new IllegalArgumentException(
                        "비용 신청 수정에 실패했습니다."
                );
            }


            // =================================================
            // 4. 기존 amount_item 삭제
            // =================================================

            amountDao.deleteAmountItemsByAmountNo(
                    amountNo
            );


            // =================================================
            // 5. 새로운 amount_item 등록
            // =================================================

            if (amount.getItemList() != null) {

                for (Amount.Item item :
                        amount.getItemList()) {

                    if (item == null) {
                        continue;
                    }

                    item.setAmountNo(
                            amountNo
                    );

                    int itemResult =
                            amountDao.insertAmountItem(
                                    item
                            );

                    if (itemResult <= 0) {

                        throw new IllegalArgumentException(
                                "비용 상세 항목 수정에 실패했습니다."
                        );
                    }
                }
            }


            // =================================================
            // 6. 기존 amount_list 삭제
            //
            // amount_list는 amount_no로 연결됨
            // =================================================

            amountDao.deleteAmountSponsorsByAmountNo(
                    amountNo
            );


            // =================================================
            // 7. 새로운 amount_list 등록
            // =================================================

            if (amount.getSponsorList() != null) {

                for (Amount.Sponsor sponsor :
                        amount.getSponsorList()) {

                    if (sponsor == null) {
                        continue;
                    }

                    sponsor.setAmountNo(
                            amountNo
                    );

                    int sponsorResult =
                            amountDao.insertAmountSponsor(
                                    sponsor
                            );

                    if (sponsorResult <= 0) {

                        throw new IllegalArgumentException(
                                "지원금 수정에 실패했습니다."
                        );
                    }
                }
            }


            // =================================================
            // 8. 새 첨부파일 처리
            // =================================================

            if (files != null &&
                !files.isEmpty()) {

                File uploadDir =
                        new File(
                                UPLOAD_DIR
                        );


                // -------------------------------------------------
                // 업로드 폴더 생성
                // -------------------------------------------------

                if (!uploadDir.exists()) {

                    boolean created =
                            uploadDir.mkdirs();

                    if (!created &&
                        !uploadDir.exists()) {

                        throw new IOException(
                                "첨부파일 저장 폴더를 생성할 수 없습니다."
                        );
                    }
                }


                // -------------------------------------------------
                // 파일 반복
                // -------------------------------------------------

                for (MultipartFile multipartFile :
                        files) {

                    if (multipartFile == null ||
                        multipartFile.isEmpty()) {

                        continue;
                    }


                    String originalFilename =
                            multipartFile.getOriginalFilename();


                    if (originalFilename == null ||
                        originalFilename.trim().isEmpty()) {

                        continue;
                    }


                    // 경로 조작 방지
                    originalFilename =
                            new File(
                                    originalFilename
                            ).getName();


                    // 저장 파일명
                    String savedFilename =
                            UUID.randomUUID()
                                    .toString()
                                    + "_"
                                    + originalFilename;


                    File destination =
                            new File(
                                    uploadDir,
                                    savedFilename
                            );


                    // -------------------------------------------------
                    // 실제 파일 저장
                    // -------------------------------------------------

                    try {

                        multipartFile.transferTo(
                                destination
                        );

                    } catch (IOException e) {

                        throw new IOException(
                                "파일 저장에 실패했습니다: "
                                + originalFilename,
                                e
                        );
                    }


                    savedFiles.add(
                            destination.getAbsolutePath()
                    );


                    // -------------------------------------------------
                    // DB 저장용 VO
                    // -------------------------------------------------

                    Amount.File file =
                            new Amount.File();

                    file.setAmountNo(
                            amountNo
                    );

                    file.setOriginName(
                            originalFilename
                    );

                    file.setChangeName(
                            savedFilename
                    );

                    file.setFilePath(
                            FILE_PATH +
                            savedFilename
                    );

                    file.setStatus("Y");


                    int fileResult =
                            amountDao.insertAmountFile(
                                    file
                            );


                    if (fileResult <= 0) {

                        throw new IllegalArgumentException(
                                "첨부파일 DB 등록에 실패했습니다: "
                                + originalFilename
                        );
                    }
                }
            }

        } catch (IllegalArgumentException e) {

            deleteSavedFiles(savedFiles);

            throw e;

        } catch (IOException e) {

            deleteSavedFiles(savedFiles);

            throw new RuntimeException(
                    "첨부파일 처리 중 오류가 발생했습니다: "
                    + e.getMessage(),
                    e
            );

        } catch (Exception e) {

            deleteSavedFiles(savedFiles);

            throw new RuntimeException(
                    "비용 신청 수정 중 오류가 발생했습니다.",
                    e
            );
        }
    }


    // =========================================================
    // 6. 저장 실패 시 실제 파일 삭제
    // =========================================================

    private void deleteSavedFiles(
            List<String> savedFiles) {

        if (savedFiles == null ||
            savedFiles.isEmpty()) {

            return;
        }


        for (String path :
                savedFiles) {

            if (path == null ||
                path.trim().isEmpty()) {

                continue;
            }


            try {

                File file =
                        new File(path);

                if (file.exists()) {

                    boolean deleted =
                            file.delete();

                    if (!deleted) {

                        System.err.println(
                                "파일 삭제 실패: "
                                + path
                        );
                    }
                }

            } catch (Exception e) {

                System.err.println(
                        "파일 정리 중 오류: "
                        + path
                );
            }
        }
    }


    // =========================================================
    // 7. 비용 신청 취소
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int cancelAmount(int amountNo) {

        try {

            if (amountNo <= 0) {

                throw new IllegalArgumentException(
                        "잘못된 비용 신청 번호입니다."
                );
            }


            Amount amount =
                    amountDao.selectAmountById(
                            amountNo
                    );


            if (amount == null) {

                throw new IllegalArgumentException(
                        "존재하지 않는 비용 신청입니다."
                );
            }


            String status =
                    amount.getStatus();


            // -------------------------------------------------
            // 승인
            // -------------------------------------------------

            if ("A".equals(status)) {

                throw new IllegalArgumentException(
                        "이미 승인된 비용 신청은 취소할 수 없습니다."
                );
            }


            // -------------------------------------------------
            // 반려
            // -------------------------------------------------

            if ("J".equals(status)) {

                throw new IllegalArgumentException(
                        "이미 반려된 비용 신청입니다."
                );
            }


            // -------------------------------------------------
            // 취소
            // -------------------------------------------------

            if ("C".equals(status)) {

                throw new IllegalArgumentException(
                        "이미 취소된 비용 신청입니다."
                );
            }


            int result =
                    amountDao.cancelAmount(
                            amountNo
                    );


            if (result <= 0) {

                throw new IllegalArgumentException(
                        "비용 신청 취소에 실패했습니다."
                );
            }


            return result;

        } catch (IllegalArgumentException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException(
                    "비용 신청 취소 중 오류가 발생했습니다.",
                    e
            );
        }
    }


    // =========================================================
    // 8. 승인 + 지원금 처리
    //
    // amount
    // └── amount_list
    //
    // amount_list는 item과 연결되지 않음
    // =========================================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateApprovalWithSponsor(
            int amountNo,
            String status,
            int approvedAmount,
            String comment,
            String sponsorName,
            int sponsorAmount,
            String sponsorStatus,
            String remark) {

        try {

            // =================================================
            // 1. 기본 검증
            // =================================================

            if (amountNo <= 0) {

                throw new IllegalArgumentException(
                        "잘못된 비용 신청 번호입니다."
                );
            }


            if (!"A".equals(status) &&
                !"H".equals(status) &&
                !"J".equals(status)) {

                throw new IllegalArgumentException(
                        "잘못된 결재 상태입니다."
                );
            }


            if (approvedAmount < 0) {

                throw new IllegalArgumentException(
                        "승인 금액은 0원 이상이어야 합니다."
                );
            }


            if (sponsorAmount < 0) {

                throw new IllegalArgumentException(
                        "지원금은 0원 이상이어야 합니다."
                );
            }


            // =================================================
            // 2. 기존 정산 확인
            // =================================================

            Amount existingAmount =
                    amountDao.selectAmountById(
                            amountNo
                    );

            if (existingAmount == null) {

                throw new IllegalArgumentException(
                        "존재하지 않는 비용 신청입니다."
                );
            }


            // =================================================
            // 3. 승인 상태 변경
            // =================================================

            Amount amount =
                    new Amount();

            amount.setAmountNo(
                    amountNo
            );

            amount.setStatus(
                    status
            );

            amount.setApprovedAmount(
                    approvedAmount
            );

            amount.setAmountComment(
                    comment
            );


            int result =
                    amountDao.updateApprovalStatus(
                            amount
                    );


            if (result <= 0) {

                throw new IllegalArgumentException(
                        "결재 처리에 실패했습니다."
                );
            }


            // =================================================
            // 4. 승인인 경우 amount_list 처리
            // =================================================

            if ("A".equals(status)) {

                // 기존 지원금 삭제
                amountDao.deleteAmountSponsorsByAmountNo(
                        amountNo
                );


                // 지원금이 있는 경우만 등록
                if (sponsorAmount > 0) {

                    Amount.Sponsor sponsor =
                            new Amount.Sponsor();


                    // ★ 핵심
                    // itemNo가 아니라 amountNo
                    sponsor.setAmountNo(
                            amountNo
                    );


                    sponsor.setSponsorName(
                            sponsorName
                    );

                    sponsor.setAmount(
                            sponsorAmount
                    );

                    sponsor.setStatus(
                            sponsorStatus
                    );

                    sponsor.setRemark(
                            remark
                    );


                    int sponsorResult =
                            amountDao.insertAmountSponsor(
                                    sponsor
                            );


                    if (sponsorResult <= 0) {

                        throw new IllegalArgumentException(
                                "지원금 등록에 실패했습니다."
                        );
                    }
                }
            }


        } catch (IllegalArgumentException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException(
                    "결재 및 지원금 처리 중 오류가 발생했습니다.",
                    e
            );
        }
    }


    // =========================================================
    // 9. 전체 통계
    // =========================================================

    @Override
    public Map<String, Object> getFullStatistics() {

        try {

            Map<String, Object> result =
                    new HashMap<>();


            // -------------------------------------------------
            // 전체 요약
            // -------------------------------------------------

            result.put(
                    "summary",
                    amountDao.getStatisticsSummary()
            );


            // -------------------------------------------------
            // 부서별
            // -------------------------------------------------

            result.put(
                    "deptStatistics",
                    amountDao.getDeptStatistics()
            );


            // -------------------------------------------------
            // 월별
            // -------------------------------------------------

            result.put(
                    "monthlyStatistics",
                    amountDao.getMonthlyStatistics()
            );


            // -------------------------------------------------
            // 비용 항목별
            // -------------------------------------------------

            result.put(
                    "itemStatistics",
                    amountDao.getItemStatistics()
            );


            return result;

        } catch (Exception e) {

            throw new RuntimeException(
                    "정산 통계 조회 중 오류가 발생했습니다.",
                    e
            );
        }
    }
}