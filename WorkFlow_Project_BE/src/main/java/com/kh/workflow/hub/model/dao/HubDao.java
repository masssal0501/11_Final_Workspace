package com.kh.workflow.hub.model.dao;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kh.workflow.hub.model.vo.Hub;

public interface HubDao extends JpaRepository<Hub, Integer> {
	@EntityGraph(attributePaths = {"hubFileList"})
	Page<Hub> findByHubTypeInOrderByHubNoDesc(Pageable pageable, List<Integer> hubTypes);

    @EntityGraph(attributePaths = {"hubFileList"})
    Page<Hub> findAll(Pageable pageable);
    
    @EntityGraph(attributePaths = {"hubFileList"})
    @Query("""
    		SELECT h FROM Hub h WHERE
            h.mainRegion LIKE %:mainRegion% AND
            h.subRegion LIKE %:subRegion% AND
            h.hubType IN :hubTypes AND
            h.hubName LIKE %:keyword%
            ORDER BY h.hubNo DESC
            """)
     Page<Hub> searchHubList(
         Pageable pageable,
         @Param("mainRegion") String mainRegion,
         @Param("subRegion") String subRegion,
         @Param("hubTypes") List<Integer> hubTypes,
         @Param("keyword") String keyword
     );

    @Modifying
    @Query("""
    			UPDATE Hub h
    			   SET h.hubStatus = 'CLOSED'
    			 WHERE h.hubNo = :hubNo
    			   AND h.hubStatus IN ('OPEN', 'PAUSED')
    		""")
    int deleteHub(@Param("hubNo") int hubNo);

    @Query(value = """
            SELECT IFNULL(ROUND(AVG(CAST(sa.answer_value AS DECIMAL(10,2))), 1), 0.0)
            FROM reservation r
            JOIN workcation_info w ON r.workcation_no = w.workcation_no
            JOIN workcation_survey ws ON w.workcation_no = ws.workcation_no
            JOIN survey_answer sa ON ws.survey_no = sa.survey_no
            JOIN survey_question sq ON sa.question_no = sq.question_no
            WHERE r.hub_no = :hubNo AND sq.question_type = 'SCORE'
            """, nativeQuery = true)
	Double selectAvgScore(@Param("hubNo") int hubNo);
}