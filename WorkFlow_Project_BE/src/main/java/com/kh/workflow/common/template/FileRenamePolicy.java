package com.kh.workflow.common.template;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;

public class FileRenamePolicy {

	// BUG: session.getServletContext().getRealPath(path)에 의존하고 있었는데,
	// Spring Boot는 내장 톰캣(fat jar)으로 실행되어 전통적인 webapp 디렉터리가
	// 없으므로 getRealPath()가 배포 환경마다 다른(또는 존재하지 않는) 경로를
	// 반환한다. 그 결과 업로드는 "성공"해도 실제로 어디에 저장됐는지 알 수
	// 없고, WebConfig의 정적 리소스 핸들러가 찾는 실제 디렉터리와 일치하지
	// 않아 화면에서 다시 조회하면 항상 404였다.
	// 비용 증빙 파일(app.upload.receipts-dir)과 동일한 방식으로, 실제
	// 파일시스템 경로를 환경변수로 명시적으로 지정한다.
	private static final String HUB_UPLOAD_DIR = resolveHubUploadDir();

	private static String resolveHubUploadDir() {

		String dir = System.getenv("APP_UPLOAD_HUB_DIR");

		if (dir == null || dir.isBlank()) {
			dir = "C:/upload/hub/";
		}

		return dir.endsWith("/") ? dir : dir + "/";
	}

	public static String saveFile(MultipartFile upfile,
								  HttpSession session, String path) {

		String originName = upfile.getOriginalFilename();

		String currentTime = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());

		int ranNum = (int)(Math.random() * 90000 + 10000);

		String ext = originName.substring(originName.lastIndexOf("."));

		String changeName = currentTime + ranNum + ext;

		File filePath = new File(HUB_UPLOAD_DIR);

		if (!filePath.exists()) {
		    filePath.mkdirs();
		}

		try {
			upfile.transferTo(new File(HUB_UPLOAD_DIR + changeName));
		} catch (IOException e) {
			e.printStackTrace();
		}

		return changeName;
	}

}
