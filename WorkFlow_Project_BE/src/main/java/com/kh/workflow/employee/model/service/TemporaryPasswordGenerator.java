package com.kh.workflow.employee.model.service;

import java.security.SecureRandom;

import org.springframework.stereotype.Component;

@Component
public class TemporaryPasswordGenerator {

	private static final String CHARACTERS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "abcdefghijklmnopqrstuvwxyz" +
            "0123456789" +
            "!@#$%^&*";

    private final SecureRandom random =
            new SecureRandom();

    public String generate(int length) {

        StringBuilder password =
                new StringBuilder(length);

        for (int i = 0; i < length; i++) {

            int index =
                    random.nextInt(CHARACTERS.length());

            password.append(
                    CHARACTERS.charAt(index)
            );
        }

        return password.toString();
    }
    
}
