package com.kh.workflow.survey.model.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.survey.model.dao.SurveyAnswerDao;
import com.kh.workflow.survey.model.dao.SurveyQuestionDao;
import com.kh.workflow.survey.model.dao.WorkcationSurveyDao;
import com.kh.workflow.survey.model.dto.SurveyAnswerRequest;
import com.kh.workflow.workcation.model.dao.WorkcationDao;
import com.kh.workflow.workcation.model.vo.SurveyAnswer;
import com.kh.workflow.workcation.model.vo.SurveyQuestion;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;
import com.kh.workflow.workcation.model.vo.WorkcationSurvey;

@Service
public class SurveyServiceImpl implements SurveyService {

	@Autowired
	private SurveyQuestionDao surveyQuestionDao;

	@Autowired
	private WorkcationSurveyDao workcationSurveyDao;

	@Autowired
	private SurveyAnswerDao surveyAnswerDao;

	@Autowired
	private WorkcationDao workcationDao;

	@Override
	public List<SurveyQuestion> getQuestions() {
		return surveyQuestionDao.findAllByOrderByQuestionOrderAsc();
	}

	@Override
	public Map<String, Object> getSurveyStatus(int empNo, Integer workcationNo) {

		WorkcationInfo workcation = workcationDao.findById(workcationNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 워케이션 정보를 찾을 수 없습니다. 번호: " + workcationNo));

		Map<String, Object> status = new HashMap<>();

		if (workcation.getEmployee() == null || workcation.getEmployee().getEmpNo() == null
				|| workcation.getEmployee().getEmpNo() != empNo) {
			status.put("available", false);
			status.put("submitted", false);
			status.put("message", "본인의 워케이션에 대해서만 만족도 조사를 작성할 수 있습니다.");
			return status;
		}

		boolean submitted = workcationSurveyDao.existsByWorkcationInfo_WorkcationNo(workcationNo);
		status.put("submitted", submitted);

		if (submitted) {
			status.put("available", false);
			status.put("message", "이미 만족도 조사를 작성하셨습니다.");
			return status;
		}

		if (!"A".equals(workcation.getApproverState())) {
			status.put("available", false);
			status.put("message", "승인된 워케이션만 만족도 조사를 작성할 수 있습니다.");
			return status;
		}

		if (workcation.getEndAt() == null || LocalDateTime.now().isBefore(workcation.getEndAt())) {
			status.put("available", false);
			status.put("message", "워케이션 종료 후 만족도 조사를 작성할 수 있습니다.");
			return status;
		}

		status.put("available", true);
		status.put("message", "");
		return status;
	}

	@Override
	@Transactional
	public void submitSurvey(int empNo, Integer workcationNo, List<SurveyAnswerRequest> answers) {

		WorkcationInfo workcation = workcationDao.findById(workcationNo)
				.orElseThrow(() -> new IllegalArgumentException("해당 워케이션 정보를 찾을 수 없습니다. 번호: " + workcationNo));

		if (workcation.getEmployee() == null || workcation.getEmployee().getEmpNo() == null
				|| workcation.getEmployee().getEmpNo() != empNo) {
			throw new IllegalArgumentException("본인의 워케이션에 대해서만 만족도 조사를 작성할 수 있습니다.");
		}

		if (!"A".equals(workcation.getApproverState())) {
			throw new IllegalArgumentException("승인된 워케이션만 만족도 조사를 작성할 수 있습니다.");
		}

		if (workcation.getEndAt() == null || LocalDateTime.now().isBefore(workcation.getEndAt())) {
			throw new IllegalArgumentException("워케이션 종료 후 만족도 조사를 작성할 수 있습니다.");
		}

		if (workcationSurveyDao.existsByWorkcationInfo_WorkcationNo(workcationNo)) {
			throw new IllegalArgumentException("이미 만족도 조사를 작성하셨습니다.");
		}

		List<SurveyQuestion> questions = surveyQuestionDao.findAllByOrderByQuestionOrderAsc();

		if (answers == null || answers.size() != questions.size()) {
			throw new IllegalArgumentException("모든 질문에 답변해 주세요.");
		}

		Map<Integer, SurveyAnswerRequest> answerByQuestionNo = new HashMap<>();
		for (SurveyAnswerRequest answer : answers) {
			answerByQuestionNo.put(answer.questionNo, answer);
		}

		for (SurveyQuestion question : questions) {

			SurveyAnswerRequest answer = answerByQuestionNo.get(question.getQuestionNo());

			if (answer == null) {
				throw new IllegalArgumentException("모든 질문에 답변해 주세요.");
			}

			if ("SCORE".equals(question.getQuestionType())) {
				if (answer.score == null || answer.score < 1 || answer.score > 5) {
					throw new IllegalArgumentException("평점은 1~5 사이로 입력해 주세요.");
				}
			} else {
				if (answer.answerValue == null || answer.answerValue.isBlank()) {
					throw new IllegalArgumentException("답변을 입력해 주세요.");
				}
			}
		}

		LocalDateTime now = LocalDateTime.now();

		WorkcationSurvey survey = new WorkcationSurvey();
		survey.setWorkcationInfo(workcation);
		survey.setCreatedAt(now);
		survey.setUpdatedAt(now);
		survey = workcationSurveyDao.save(survey);

		for (SurveyQuestion question : questions) {

			SurveyAnswerRequest answer = answerByQuestionNo.get(question.getQuestionNo());

			SurveyAnswer entity = new SurveyAnswer();
			entity.setWorkcationSurvey(survey);
			entity.setSurveyQuestion(question);

			if ("SCORE".equals(question.getQuestionType())) {
				// 기존 통계 쿼리 두 곳이 각각 다른 컬럼을 참조한다:
				// HubDao.selectAvgScore -> answerValue를 double로 캐스팅
				// WorkcationDao.selectAvgSatisfaction -> score 컬럼
				// 두 통계 모두 정상 동작하도록 둘 다 채운다.
				entity.setScore(answer.score);
				entity.setAnswerValue(String.valueOf(answer.score));
			} else {
				entity.setAnswerValue(answer.answerValue.trim());
			}

			surveyAnswerDao.save(entity);
		}
	}
}
