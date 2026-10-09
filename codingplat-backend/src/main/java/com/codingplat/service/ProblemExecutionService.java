package com.codingplat.service;

import com.codingplat.dto.ProblemExecutionResponse;
import com.codingplat.dto.TestCaseResponse;
import com.codingplat.dto.TestCaseResultResponse;
import com.codingplat.entity.Problem;
import com.codingplat.entity.TestCase;
import com.codingplat.execution.DockerCodeExecutor;
import com.codingplat.execution.ExecutionResult;
import com.codingplat.repository.ProblemRepository;
import com.codingplat.repository.TestCaseRepository;

import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProblemExecutionService {

    private final DockerCodeExecutor dockerCodeExecutor;
    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;

    public ProblemExecutionService(
            DockerCodeExecutor dockerCodeExecutor,
            ProblemRepository problemRepository,
            TestCaseRepository testCaseRepository
    ) {
        this.dockerCodeExecutor = dockerCodeExecutor;
        this.problemRepository = problemRepository;
        this.testCaseRepository = testCaseRepository;
    }

    // =========================================================
    // GET SAMPLE TEST CASES
    // =========================================================

    public List<TestCaseResponse> getTestCases(
            Long problemId
    ) {

        Problem problem =
                problemRepository
                        .findById(problemId)
                        .orElse(null);

        if (problem == null) {
            return new ArrayList<>();
        }

        List<TestCase> testCases =
                testCaseRepository
                        .findByProblemId(problemId);

        List<TestCaseResponse> responses =
                new ArrayList<>();

        for (int i = 0;
             i < testCases.size();
             i++) {

            TestCase testCase =
                    testCases.get(i);

            responses.add(
                    new TestCaseResponse(
                            i + 1,
                            testCase.getInput(),
                            testCase.getExpectedOutput()
                    )
            );
        }

        return responses;
    }

    // =========================================================
    // RUN CODE AGAINST ALL TEST CASES
    // =========================================================

    public ProblemExecutionResponse runProblem(
            Long problemId,
            String code
    ) {

        long startTime =
                System.currentTimeMillis();

        Problem problem =
                problemRepository
                        .findById(problemId)
                        .orElse(null);

        if (problem == null) {

            return new ProblemExecutionResponse(
                    "ERROR",
                    0,
                    "Problem not found",
                    new ArrayList<>()
            );
        }

        List<TestCase> testCases =
                testCaseRepository
                        .findByProblemId(problemId);

        if (testCases.isEmpty()) {

            return new ProblemExecutionResponse(
                    "ERROR",
                    0,
                    "No test cases found for this problem",
                    new ArrayList<>()
            );
        }

        Path tempDirectory = null;

        try {

            tempDirectory =
                    Files.createTempDirectory(
                            "codingplat-run-"
                    );

            // =================================================
            // COMPILE ONCE
            // =================================================

            ExecutionResult compileResult =
                    dockerCodeExecutor.compileCppCode(
                            code,
                            tempDirectory
                    );

            if (!compileResult
                    .getStatus()
                    .equals("EXECUTION_SUCCESS")) {

                long runtime =
                        System.currentTimeMillis()
                                - startTime;

                return new ProblemExecutionResponse(
                        compileResult.getStatus(),
                        runtime,
                        compileResult.getOutput(),
                        new ArrayList<>()
                );
            }

            // =================================================
            // RUN ALL TEST CASES
            // =================================================

            List<TestCaseResultResponse> results =
                    new ArrayList<>();

            String overallStatus =
                    "ACCEPTED";

            for (int i = 0;
                 i < testCases.size();
                 i++) {

                TestCase testCase =
                        testCases.get(i);

                ExecutionResult executionResult =
                        dockerCodeExecutor
                                .executeCompiledCpp(
                                        tempDirectory,
                                        testCase.getInput()
                                );

                String actualOutput =
                        normalizeOutput(
                                executionResult.getOutput()
                        );

                String expectedOutput =
                        normalizeOutput(
                                testCase.getExpectedOutput()
                        );

                String testStatus;

                // =================================================
                // EXECUTION STATUS
                // =================================================

                if (executionResult
                        .getStatus()
                        .equals("TIME_LIMIT_EXCEEDED")) {

                    testStatus =
                            "TIME_LIMIT_EXCEEDED";

                } else if (executionResult
                        .getStatus()
                        .equals("RUNTIME_ERROR")) {

                    testStatus =
                            "RUNTIME_ERROR";

                } else if (executionResult
                        .getStatus()
                        .equals("EXECUTION_ERROR")) {

                    testStatus =
                            "EXECUTION_ERROR";

                } else if (!actualOutput
                        .equals(expectedOutput)) {

                    testStatus =
                            "WRONG_ANSWER";

                } else {

                    testStatus =
                            "ACCEPTED";
                }

                // =================================================
                // ADD RESULT
                // =================================================

                results.add(
                        new TestCaseResultResponse(
                                i + 1,
                                testStatus,
                                testCase.getInput(),
                                testCase.getExpectedOutput(),
                                executionResult.getOutput()
                        )
                );

                // =================================================
                // FIRST FAILURE BECOMES OVERALL STATUS
                // =================================================

                if (!testStatus.equals("ACCEPTED")
                        && overallStatus
                        .equals("ACCEPTED")) {

                    overallStatus =
                            testStatus;
                }
            }

            long runtime =
                    System.currentTimeMillis()
                            - startTime;

            String message =
                    overallStatus.equals("ACCEPTED")
                            ? "All test cases passed"
                            : "One or more test cases failed";

            return new ProblemExecutionResponse(
                    overallStatus,
                    runtime,
                    message,
                    results
            );

        } catch (Exception exception) {

            long runtime =
                    System.currentTimeMillis()
                            - startTime;

            return new ProblemExecutionResponse(
                    "ERROR",
                    runtime,
                    exception.getMessage(),
                    new ArrayList<>()
            );

        } finally {

            deleteDirectory(
                    tempDirectory
            );
        }
    }

    // =========================================================
    // NORMALIZE OUTPUT
    // =========================================================

    private String normalizeOutput(
            String output
    ) {

        if (output == null) {
            return "";
        }

        return output
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .trim();
    }

    // =========================================================
    // DELETE TEMP DIRECTORY
    // =========================================================

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

                            Files.deleteIfExists(path);

                        } catch (Exception ignored) {
                        }

                    });

        } catch (Exception ignored) {
        }
    }
}