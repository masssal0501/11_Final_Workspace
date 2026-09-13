package com.kh.workflow.task.model.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.task.model.dao.TaskDao;
import com.kh.workflow.task.model.dao.TaskHistoryDao;
import com.kh.workflow.task.model.dao.WorkDao;
import com.kh.workflow.task.model.dao.WorkFileDao;
import com.kh.workflow.task.model.vo.Task;
import com.kh.workflow.task.model.vo.TaskHistory;
import com.kh.workflow.task.model.vo.Work;
import com.kh.workflow.task.model.vo.WorkFile;
import com.kh.workflow.workcation.model.dao.WorkcationDao;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

@Service
public class TaskServiceImpl implements TaskService {

	@Autowired
	private WorkcationDao workcationDao;

	@Autowired
	private TaskDao taskDao;

	@Autowired
	private WorkDao workDao;

	@Autowired
	private TaskHistoryDao taskHistoryDao;

	@Autowired
	private WorkFileDao workFileDao;

	// 목록
	@Override
	@Transactional(readOnly = true)
	public Page<Map<String, Object>> selectTaskList(String condition, String keyword, Pageable pageable) {

		Page<Task> taskPage;

		if ("title".equals(condition) && keyword != null && !keyword.isBlank()) {
			taskPage = taskDao.findByTaskTitleContainingOrderByTaskNoDesc(keyword, pageable);
		} else {
			taskPage = taskDao.findAllByOrderByTaskNoDesc(pageable);
		}

		return taskPage.map(task -> {
			Map<String, Object> map = new LinkedHashMap<>();

			map.put("taskNo", task.getTaskNo());
			map.put("taskTitle", task.getTaskTitle());
			map.put("progress", task.getProgress());
			map.put("status", task.getStatus());
			map.put("tasktimeAt", task.getTasktimeAt());
			map.put("taskendAt", task.getTaskendAt());

			return map;
		});
	}

	// 상세
	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> selectTaskDetail(Integer taskNo) {

		Task task = taskDao.findById(taskNo).orElseThrow(() -> new IllegalArgumentException("업무 정보를 찾을 수 없습니다."));

		Map<String, Object> result = new LinkedHashMap<>();

		result.put("taskNo", task.getTaskNo());
		result.put("taskTitle", task.getTaskTitle());
		result.put("taskContent", task.getTaskContent());
		result.put("progress", task.getProgress());
		result.put("status", task.getStatus());
		result.put("tasktimeAt", task.getTasktimeAt());
		result.put("taskendAt", task.getTaskendAt());

		List<TaskHistory> historyList = taskHistoryDao.findByTaskTaskNoOrderByCreatedAtDesc(taskNo);

		List<Map<String, Object>> histories = historyList.stream().map(history -> {
			Map<String, Object> map = new LinkedHashMap<>();

			map.put("historyNo", history.getHistoryNo());
			map.put("historyTitle", history.getHistoryTitle());
			map.put("historyContent", history.getHistoryContent());
			map.put("progress", history.getProgress());
			map.put("createdAt", history.getCreatedAt());

			return map;
		}).toList();

		result.put("historyList", histories);

		return result;
	}

	@Override
	@Transactional(readOnly = true)
	public Page<Map<String, Object>> selectTaskBoardList(String keyword, Pageable pageable) {

		String searchKeyword = keyword == null ? "" : keyword.trim();

		Page<WorkcationInfo> page = workcationDao.findTaskBoardList(searchKeyword, pageable);

		return page.map(workcation -> {

			Map<String, Object> map = new HashMap<>();

			List<Work> workList = workDao.findByWorkcationInfoWorkcationNo(workcation.getWorkcationNo());

			int taskCount = 0;
			int progressSum = 0;

			for (Work work : workList) {
				List<Task> tasks = taskDao.findByWorkWorkNo(work.getWorkNo());

				for (Task task : tasks) {
					taskCount++;
					progressSum += task.getProgress() != null ? task.getProgress() : 0;
				}
			}

			int overallProgress = taskCount > 0 ? Math.round((float) progressSum / taskCount) : 0;

			map.put("workcationNo", workcation.getWorkcationNo());
			map.put("workcationTitle", workcation.getWorkcationTitle());

			map.put("writer", workcation.getEmployee() != null ? workcation.getEmployee().getEmpName() : "-");

			map.put("taskCount", taskCount);
			map.put("overallProgress", overallProgress);
			map.put("createdAt", workcation.getCreatedAt());

			return map;
		});
	}

	@Override
	@Transactional(readOnly = true)
	public Map<String, Object> selectWorkcationTasks(Integer workcationNo) {

	    WorkcationInfo workcation = workcationDao.findById(workcationNo)
	            .orElseThrow(() -> new IllegalArgumentException("워케이션 정보를 찾을 수 없습니다."));

	    Map<String, Object> result = new HashMap<>();

	    result.put("workcationNo", workcation.getWorkcationNo());
	    result.put("workcationTitle", workcation.getWorkcationTitle());

	    if (workcation.getEmployee() != null) {
	        result.put("writer", workcation.getEmployee().getEmpName());
	    } else {
	        result.put("writer", "-");
	    }

	    List<Map<String, Object>> taskList = new ArrayList<>();

	    List<Work> workList = workDao.findByWorkcationInfoWorkcationNo(workcationNo);

	    for (Work work : workList) {

	        List<Task> tasks = taskDao.findByWorkWorkNo(work.getWorkNo());

	        for (Task task : tasks) {

	            Map<String, Object> taskMap = new HashMap<>();

	            taskMap.put("taskNo", task.getTaskNo());
	            taskMap.put("taskTitle", task.getTaskTitle());
	            taskMap.put("taskContent", task.getTaskContent());
	            taskMap.put("progress", task.getProgress() != null ? task.getProgress() : 0);
	            taskMap.put("status", task.getStatus());
	            taskMap.put("tasktimeAt", task.getTasktimeAt());
	            taskMap.put("taskendAt", task.getTaskendAt());

	            List<Map<String, Object>> historyList = new ArrayList<>();

	            List<TaskHistory> histories =
	                    taskHistoryDao.findByTaskTaskNoOrderByCreatedAtDesc(task.getTaskNo());

	            for (TaskHistory history : histories) {

	                Map<String, Object> historyMap = new HashMap<>();

	                historyMap.put("historyNo", history.getHistoryNo());
	                historyMap.put("title", history.getHistoryTitle());
	                historyMap.put("content", history.getHistoryContent());
	                historyMap.put("progress", history.getProgress());
	                historyMap.put("createdAt", history.getCreatedAt());

	                historyList.add(historyMap);
	            }

	            taskMap.put("historyList", historyList);

	            List<Map<String, Object>> fileList = new ArrayList<>();

	            List<WorkFile> files = workFileDao.findByTaskTaskNo(task.getTaskNo());

	            for (WorkFile file : files) {

	                Map<String, Object> fileMap = new HashMap<>();

	                fileMap.put("taskFileNo", file.getTaskFileNo());
	                fileMap.put("originName", file.getOriginName());
	                fileMap.put("changeName", file.getChangeName());
	                fileMap.put("filePath", file.getFilePath());
	                fileMap.put("fileSize", file.getFileSize());

	                fileList.add(fileMap);
	            }

	            taskMap.put("fileList", fileList);

	            taskList.add(taskMap);
	        }
	    }

	    int taskCount = taskList.size();

	    int totalProgress = 0;

	    for (Map<String, Object> task : taskList) {
	        totalProgress += (Integer) task.get("progress");
	    }

	    int overallProgress =
	            taskCount > 0 ? Math.round((float) totalProgress / taskCount) : 0;

	    result.put("taskCount", taskCount);
	    result.put("overallProgress", overallProgress);
	    result.put("taskList", taskList);

	    return result;
	}
	@Transactional
	@Override
	public void updateTaskStatus(Integer taskNo, String status, String content) {

		Task task = taskDao.findById(taskNo).orElseThrow(() -> new IllegalArgumentException("업무를 찾을 수 없습니다."));

		if (!"Y".equals(status) && !"R".equals(status) && !"N".equals(status)) {

			throw new IllegalArgumentException("잘못된 상태값입니다.");
		}

		if (task.getProgress() == null || task.getProgress() != 100) {

			throw new IllegalStateException("100% 업무만 상태를 변경할 수 있습니다.");
		}

		// 거부인데 사유가 없는 경우
		if ("R".equals(status) && (content == null || content.trim().isEmpty())) {

			throw new IllegalArgumentException("거부 사유를 입력해주세요.");
		}

		task.setStatus(status);

		// 거부했을 때 업무이력 저장
		if ("R".equals(status)) {

			TaskHistory history = new TaskHistory();

			history.setTask(task);
			history.setHistoryTitle("거부 사유");
			history.setHistoryContent(content);
			history.setProgress(task.getProgress());

			taskHistoryDao.save(history);
		}
	}
}