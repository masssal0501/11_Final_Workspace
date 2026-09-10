package com.kh.workflow.mail;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class MailService {
	
    private final JavaMailSender mailSender;

    public void sendTemporaryPassword(
            String email,
            String empName,
            String empId,
            String temporaryPassword
    ) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);

        message.setSubject(
                "[WorkFlow] 계정 생성 안내"
        );

        String content =
                "안녕하세요. " + empName + "님.\n\n" +
                "WorkFlow 계정이 생성되었습니다.\n\n" +
                "아이디 : " + empId + "\n" +
                "임시 비밀번호 : " + temporaryPassword + "\n\n" +
                "최초 로그인 후 비밀번호를 반드시 변경해주세요.\n\n" +
                "감사합니다.\n" +
                "WorkFlow";

        message.setText(content);

        mailSender.send(message);
    }

    public void sendVerificationCode(
            String email,
            String empName,
            String verificationCode
    ) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);

        message.setSubject(
                "[WorkFlow] 비밀번호 재설정 인증번호 안내"
        );

        String content =
                "안녕하세요. " + empName + "님.\n\n" +
                "비밀번호 재설정을 위한 인증번호입니다.\n\n" +
                "인증번호 : " + verificationCode + "\n\n" +
                "인증번호는 5분간 유효합니다.\n\n" +
                "본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.\n\n" +
                "감사합니다.\n" +
                "WorkFlow";

        message.setText(content);

        mailSender.send(message);
    }

}
