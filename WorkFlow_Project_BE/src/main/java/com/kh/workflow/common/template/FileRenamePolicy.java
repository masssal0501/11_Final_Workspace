package com.kh.workflow.common.template;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;

/**
 * BUG: 예전에는 session.getServletContext().getRealPath(path)로 저장 위치를
 * 계산했는데, Spring Boot는 내장 톰캣(fat jar)으로 실행되어 전통적인 webapp
 * 디렉터리가 없으므로 getRealPath()가 배포 환경마다 다르거나 존재하지 않는
 * 경로를 반환했다. 그 다음엔 System.getenv()로 직접 환경변수를 읽어보려
 * 했으나, 정작 운영 서버(EC2)의 systemd EnvironmentFile에는
 * APP_UPLOAD_HUB_DIR이 실제로 추가되어 있지 않아(로컬 예제 파일만 수정
 * 가능했음) 결국 로컬 개발용 Windows 기본값(C:/upload/hub/)으로 폴백되어
 * 운영에서 FileNotFoundException이 발생했다.
 *
 * WebConfig가 이미 올바르게 쓰고 있는 방식과 동일하게, application.properties/
 * application-prod.properties의 app.upload.hub-dir 프로퍼티(Spring 프로필별로
 * 서로 다른 기본값을 갖는다 - 로컬 C:/upload/hub/, 운영 /opt/workflow/uploads/hub/)를
 * 그대로 주입받는다. 이렇게 하면 운영 서버에 별도로 환경변수를 추가하지 않아도
 * application-prod.properties의 기본값만으로 정상 동작한다.
 */
@Component
public class FileRenamePolicy {

	@Value("${app.upload.hub-dir:C:/upload/hub/}")
	private String hubUploadDir;

	public String saveFile(MultipartFile upfile, HttpSession session, String path) {

		String originName = upfile.getOriginalFilename();

		String currentTime = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());

		int ranNum = (int)(Math.random() * 90000 + 10000);

		String ext = originName.substring(originName.lastIndexOf("."));

		String changeName = currentTime + ranNum + ext;

		String saveDir = hubUploadDir.endsWith("/") ? hubUploadDir : hubUploadDir + "/";

		File filePath = new File(saveDir);

		// BUG: mkdirs() 실패/쓰기 실패를 조용히 삼키고(e.printStackTrace()만 하고) 항상
		// changeName을 정상 반환해서, 실제로는 파일이 저장되지 않았는데도 DB에는 "성공"으로
		// 기록되고 API 응답도 200이 나가던 문제. 운영 서버 로그(SSH 접근 불가)에 의존하지
		// 않고도 원인을 바로 알 수 있도록 예외를 호출부까지 전파한다.
		if (!filePath.exists() && !filePath.mkdirs() && !filePath.exists()) {
			throw new RuntimeException(
					"이미지 저장 디렉터리를 생성할 수 없습니다: " + saveDir
							+ " (systemd 서비스 실행 계정의 쓰기 권한을 확인하세요)"
			);
		}

		try {
			upfile.transferTo(new File(saveDir + changeName));
		} catch (IOException e) {
			throw new RuntimeException(
					"이미지 파일 저장에 실패했습니다: " + saveDir + changeName
							+ " (" + e.getClass().getSimpleName() + ": " + e.getMessage() + ")",
					e
			);
		}

		return changeName;
	}

}
