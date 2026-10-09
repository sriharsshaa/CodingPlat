package com.codingplat.execution;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

@Service
public class DockerCodeExecutor {

    private static final int COMPILE_TIMEOUT_SECONDS = 15;
    private static final int EXECUTION_TIMEOUT_SECONDS = 5;


    /* =========================================================
       COMPILE C++ CODE
       ========================================================= */

    public ExecutionResult compileCppCode(
            String code,
            Path tempDirectory
    ) {

        try {

            /*
             * Create main.cpp
             */

            Path sourceFile =
                    tempDirectory.resolve("main.cpp");

            Files.writeString(
                    sourceFile,
                    code,
                    StandardCharsets.UTF_8
            );


            /*
             * Convert Windows path
             * Example:
             *
             * C:\Users\Dell\AppData\Local\Temp\codingplat-123
             *
             * becomes:
             *
             * C:/Users/Dell/AppData/Local/Temp/codingplat-123
             */

            String hostPath =
                    tempDirectory
                            .toAbsolutePath()
                            .normalize()
                            .toString()
                            .replace("\\", "/");


            System.out.println(
                    "CODINGPLAT DOCKER PATH = "
                            + hostPath
            );


            /*
             * Start Docker compilation
             */

            ProcessBuilder processBuilder =
                    new ProcessBuilder(
                            "docker",
                            "run",
                            "--rm",

                            "--cpus=0.5",

                            "--memory=256m",

                            "--memory-swap=256m",

                            "--network=none",

                            "--pids-limit=64",

                            "-v",

                            hostPath + ":/workspace",

                            "gcc:latest",

                            "bash",

                            "-c",

                            "cd /workspace && " +
                            "g++ main.cpp -o main"
                    );


            /*
             * Combine stdout + stderr
             */

            processBuilder.redirectErrorStream(true);


            System.out.println(
                    "Starting compilation..."
            );


            long startTime =
                    System.currentTimeMillis();


            /*
             * Start Docker process
             */

            Process process =
                    processBuilder.start();


            /*
             * Read Docker output directly.
             *
             * This is intentionally done in the same
             * thread because our standalone Java test
             * proved this approach works correctly.
             */

            StringBuilder output =
                    new StringBuilder();


            BufferedReader reader =
                    new BufferedReader(
                            new InputStreamReader(
                                    process.getInputStream(),
                                    StandardCharsets.UTF_8
                            )
                    );


            String line;


            while (
                    (line = reader.readLine())
                            != null
            ) {

                output
                        .append(line)
                        .append("\n");


                System.out.println(
                        "DOCKER: " + line
                );
            }


            /*
             * Wait until Docker completely exits.
             */

            int exitCode =
                    process.waitFor();


            long compileTime =
                    System.currentTimeMillis()
                            - startTime;


            System.out.println(
                    "Compilation finished in "
                            + compileTime
                            + " ms"
            );


            System.out.println(
                    "Docker exit code = "
                            + exitCode
            );


            /*
             * Compilation failed
             */

            if (exitCode != 0) {

                return new ExecutionResult(
                        "COMPILE_ERROR",
                        output.toString(),
                        exitCode
                );
            }


            /*
             * Compilation successful
             */

            return new ExecutionResult(
                    "EXECUTION_SUCCESS",
                    "",
                    0
            );


        } catch (Exception exception) {

            exception.printStackTrace();


            return new ExecutionResult(
                    "EXECUTION_ERROR",
                    exception.getMessage(),
                    -1
            );
        }
    }



    /* =========================================================
       EXECUTE COMPILED C++ PROGRAM
       ========================================================= */

    public ExecutionResult executeCompiledCpp(
            Path tempDirectory,
            String input
    ) {

        try {

            /*
             * Convert Windows path
             */

            String hostPath =
                    tempDirectory
                            .toAbsolutePath()
                            .normalize()
                            .toString()
                            .replace("\\", "/");


            /*
             * Start Docker execution
             */

            ProcessBuilder processBuilder =
                    new ProcessBuilder(
                            "docker",
                            "run",
                            "--rm",

                            "--cpus=0.5",

                            "--memory=256m",

                            "--memory-swap=256m",

                            "--network=none",

                            "--pids-limit=64",

                            "-i",

                            "-v",

                            hostPath + ":/workspace:ro",

                            "gcc:latest",

                            "bash",

                            "-c",

                            "cd /workspace && ./main"
                    );


            processBuilder.redirectErrorStream(true);


            System.out.println(
                    "Starting program execution..."
            );


            long startTime =
                    System.currentTimeMillis();


            /*
             * Start Docker
             */

            Process process =
                    processBuilder.start();


            /*
             * Send input to the program
             */

            if (input != null) {

                OutputStream outputStream =
                        process.getOutputStream();


                outputStream.write(
                        input.getBytes(
                                StandardCharsets.UTF_8
                        )
                );


                outputStream.flush();

                outputStream.close();
            }


            /*
             * Read program output
             */

            StringBuilder output =
                    new StringBuilder();


            BufferedReader reader =
                    new BufferedReader(
                            new InputStreamReader(
                                    process.getInputStream(),
                                    StandardCharsets.UTF_8
                            )
                    );


            String line;


            while (
                    (line = reader.readLine())
                            != null
            ) {

                output
                        .append(line)
                        .append("\n");
            }


            /*
             * Wait for program to finish
             */

            boolean finished =
                    process.waitFor(
                            EXECUTION_TIMEOUT_SECONDS,
                            TimeUnit.SECONDS
                    );


            /*
             * Program exceeded time limit
             */

            if (!finished) {

                process.destroyForcibly();


                return new ExecutionResult(
                        "TIME_LIMIT_EXCEEDED",
                        output.toString(),
                        -1
                );
            }


            int exitCode =
                    process.exitValue();


            long executionTime =
                    System.currentTimeMillis()
                            - startTime;


            System.out.println(
                    "Program finished in "
                            + executionTime
                            + " ms"
            );


            /*
             * Runtime error
             */

            if (exitCode != 0) {

                return new ExecutionResult(
                        "RUNTIME_ERROR",
                        output.toString(),
                        exitCode
                );
            }


            /*
             * Successful execution
             */

            return new ExecutionResult(
                    "EXECUTION_SUCCESS",
                    output.toString(),
                    exitCode
            );


        } catch (Exception exception) {

            exception.printStackTrace();


            return new ExecutionResult(
                    "EXECUTION_ERROR",
                    exception.getMessage(),
                    -1
            );
        }
    }



    /* =========================================================
       COMPILE + EXECUTE
       Used by normal code execution endpoint
       ========================================================= */

    public ExecutionResult executeCppCode(
            String code,
            String input
    ) {

        Path tempDirectory = null;


        try {

            /*
             * Create temporary directory
             */

            tempDirectory =
                    Files.createTempDirectory(
                            "codingplat-"
                    );


            /*
             * Compile
             */

            ExecutionResult compileResult =
                    compileCppCode(
                            code,
                            tempDirectory
                    );


            /*
             * Stop if compilation failed
             */

            if (!compileResult
                    .getStatus()
                    .equals("EXECUTION_SUCCESS")) {

                return compileResult;
            }


            /*
             * Execute
             */

            return executeCompiledCpp(
                    tempDirectory,
                    input
            );


        } catch (Exception exception) {

            exception.printStackTrace();


            return new ExecutionResult(
                    "EXECUTION_ERROR",
                    exception.getMessage(),
                    -1
            );


        } finally {

            /*
             * Delete temporary directory
             */

            deleteDirectory(
                    tempDirectory
            );
        }
    }



    /* =========================================================
       DELETE TEMPORARY DIRECTORY
       ========================================================= */

    private void deleteDirectory(
            Path directory
    ) {

        if (directory == null) {
            return;
        }


        try {

            Files.walk(directory)
                    .sorted(
                            (a, b) ->
                                    b.compareTo(a)
                    )
                    .forEach(path -> {

                        try {

                            Files.deleteIfExists(
                                    path
                            );

                        } catch (Exception ignored) {
                        }

                    });


        } catch (Exception ignored) {
        }
    }
}