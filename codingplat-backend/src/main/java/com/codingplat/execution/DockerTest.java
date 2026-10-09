package com.codingplat.execution;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class DockerTest {

    public static void main(String[] args) {

        try {

            String hostPath =
                    "C:/Users/Dell/AppData/Local/Temp/codingplat-java-test";

            ProcessBuilder processBuilder =
                    new ProcessBuilder(
                            "docker",
                            "run",
                            "--rm",

                            "-v",
                            hostPath + ":/workspace",

                            "gcc:latest",

                            "bash",
                            "-c",
                            "cd /workspace && g++ main.cpp -o main"
                    );

            processBuilder.redirectErrorStream(true);

            System.out.println("Starting Docker...");

            long start =
                    System.currentTimeMillis();

            Process process =
                    processBuilder.start();

            BufferedReader reader =
                    new BufferedReader(
                            new InputStreamReader(
                                    process.getInputStream(),
                                    StandardCharsets.UTF_8
                            )
                    );

            String line;

            while ((line = reader.readLine()) != null) {

                System.out.println(line);
            }

            int exitCode =
                    process.waitFor();

            long time =
                    System.currentTimeMillis() - start;

            System.out.println(
                    "Exit code: " + exitCode
            );

            System.out.println(
                    "Time: " + time + " ms"
            );

        } catch (Exception exception) {

            exception.printStackTrace();
        }
    }
}