package com.kh.workflow.place.model.dto;

import java.util.List;

import com.kh.workflow.hub.model.vo.HubFile;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

// main 브랜치의 "지역 정보 평점 연동" 커밋(041d8ee)이 PlaceServiceImpl/PlaceController/
// PlaceService에서 이 클래스를 참조하지만 실제 파일이 커밋에 누락되어 있었다(git add 누락으로
// 추정 - main 자체가 컴파일되지 않는 상태). 기존 코드의 사용처(필드 setter 호출, 프론트엔드
// PlaceDetail.jsx의 averageRating 참조)를 그대로 근거로 복원했다 - 로직/필드명은 변경하지 않음.
@Schema(description = "거점(장소) 상세 조회 응답 - 장소 정보 + 평균 평점(설문 기반)")
@Getter
@Setter
@NoArgsConstructor
@ToString
public class PlaceDto {

    @Schema(description = "거점 번호")
    private int hubNo;

    @Schema(description = "메인 지역명")
    private String mainRegion;

    @Schema(description = "세부 지역명")
    private String subRegion;

    @Schema(description = "거점 이름")
    private String hubName;

    @Schema(description = "거점 주소")
    private String hubAddress;

    @Schema(description = "연락처")
    private String phone;

    @Schema(description = "상세 설명")
    private String description;

    @Schema(description = "거점 유형 코드")
    private int hubType;

    @Schema(description = "운영 상태(OPEN, PAUSED, CLOSED)")
    private String hubStatus;

    @Schema(description = "첨부파일(대표 이미지 등) 목록")
    private List<HubFile> hubFileList;

    @Schema(description = "평균 평점(만족도 조사 기반, 데이터 없으면 null)")
    private Double averageRating;
}
