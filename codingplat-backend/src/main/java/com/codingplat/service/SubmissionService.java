package com.codingplat.service;

import com.codingplat.dto.SubmissionRequest;
import com.codingplat.dto.SubmissionResponse;
import com.codingplat.dto.TestCaseResultResponse;
import com.codingplat.entity.Problem;
import com.codingplat.entity.Submission;
import com.codingplat.entity.SubmissionStatus;
import com.codingplat.entity.TestCase;
import com.codingplat.entity.User;
import com.codingplat.execution.DockerCodeExecutor;
import com.codingplat.execution.ExecutionResult;
import com.codingplat.repository.ProblemRepository;
import com.codingplat.repository.SubmissionRepository;
import com.codingplat.repository.TestCaseRepository;
import com.codingplat.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final TestCaseRepository testCaseRepository;
    private final DockerCodeExecutor dockerCodeExecutor;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            ProblemRepository problemRepository,
            UserRepository userRepository,
            TestCaseRepository testCaseRepository,
            DockerCodeExecutor dockerCodeExecutor
    ) {
        this.submissionRepository = submissionRepository;
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
        this.testCaseRepository = testCaseRepository;
        this.dockerCodeExecutor = dockerCodeExecutor;
    }

    public SubmissionResponse createSubmission(
            SubmissionRequest request,
            String email
    ) {
        long startTime = System.nanoTime();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Problem problem = problemRepository.findById(
                request.getProblemId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Problem with id " + request.getProblemId()
                                + " not found"));

        Submission submission = new Submission();
        submission.setUser(user);
        submission.setProblem(problem);
        submission.setCode(request.getCode());
        submission.setLanguage(request.getLanguage());
        submission.setStatus(SubmissionStatus.PENDING);

        submission = submissionRepository.save(submission);

        if (!"cpp".equalsIgnoreCase(request.getLanguage())) {
            submission.setRuntimeMs(elapsedMs(startTime));
            submissionRepository.save(submission);
            return convertToResponse(submission, null);
        }

        List<TestCase> testCases =
                testCaseRepository.findByProblemId(problem.getId());

        submission.setTotalTestCases(testCases.size());

        if (testCases.isEmpty()) {
            submission.setRuntimeMs(elapsedMs(startTime));
            submissionRepository.save(submission);
            return convertToResponse(submission, null);
        }

        Path tempDirectory = null;

        try {
            tempDirectory = Files.createTempDirectory("codingplat-");

            // Compile the submitted C++ program once.
            ExecutionResult compileResult =
                    dockerCodeExecutor.compileCppCode(
                            request.getCode(),
                            tempDirectory
                    );

            if (!"EXECUTION_SUCCESS".equals(
                    compileResult.getStatus())) {

                submission.setStatus(SubmissionStatus.COMPILE_ERROR);
                submission.setRuntimeMs(elapsedMs(startTime));
                submissionRepository.save(submission);

                return convertToResponse(submission, null);
            }

            int passed = 0;

            for (int i = 0; i < testCases.size(); i++) {
                TestCase testCase = testCases.get(i);
                int testCaseNumber = i + 1;

                ExecutionResult result =
                        dockerCodeExecutor.executeCompiledCpp(
                                tempDirectory,
                                testCase.getInput()
                        );

                String actualOutput =
                        normalizeOutput(result.getOutput());

                String expectedOutput =
                        normalizeOutput(testCase.getExpectedOutput());

                String executionStatus = result.getStatus();

                if ("TIME_LIMIT_EXCEEDED".equals(executionStatus)) {
                    saveFailure(
                            submission,
                            testCaseNumber,
                            "TIME_LIMIT_EXCEEDED",
                            testCase
                                    .getInput(),
                            testCase.getExpectedOutput(),
                            result.getOutput()
                    );
                    break;
                }

                if ("RUNTIME_ERROR".equals(executionStatus)
                        || !"EXECUTION_SUCCESS".equals(executionStatus)) {

                    saveFailure(
                            submission,
                            testCaseNumber,
                            "RUNTIME_ERROR",
                            testCase.getInput(),
                            testCase.getExpectedOutput(),
                            result.getOutput()
                    );
                    break;
                }

                if (!actualOutput.equals(expectedOutput)) {
                    saveFailure(
                            submission,
                            testCaseNumber,
                            "WRONG_ANSWER",
                            testCase.getInput(),
                            testCase.getExpectedOutput(),
                            result.getOutput()
                    );
                    break;
                }

                passed++;
                submission.setPassedTestCases(passed);
            }

            if (submission.getStatus() == SubmissionStatus.PENDING
                    && passed == testCases.size()) {
                submission.setStatus(SubmissionStatus.ACCEPTED);
            }

            submission.setRuntimeMs(elapsedMs(startTime));
            submission = submissionRepository.save(submission);

            return convertToResponse(submission, null);

        } catch (Exception exception) {
            exception.printStackTrace();

            submission.setStatus(SubmissionStatus.RUNTIME_ERROR);
            submission.setRuntimeMs(elapsedMs(startTime));
            submission = submissionRepository.save(submission);

            return convertToResponse(submission, null);

        } finally {
            if (tempDirectory != null) {
                try (var paths = Files.walk(tempDirectory)) {
                    paths.sorted((a, b) -> b.compareTo(a))
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
    }

    private void saveFailure(
            Submission submission,
            int testCaseNumber,
            String status,
            String input,
            String expectedOutput,
            String actualOutput
    ) {
        submission.setStatus(SubmissionStatus.valueOf(status));
        submission.setFailedTestCaseNumber(testCaseNumber);
        submission.setFailedTestCaseStatus(status);
        submission.setFailedInput(input);
        submission.setFailedExpectedOutput(expectedOutput);
        submission.setFailedActualOutput(actualOutput);
    }

    private long elapsedMs(long startTime) {
        return (System.nanoTime() - startTime) / 1_000_000;
    }

    public List<SubmissionResponse> getMySubmissions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return submissionRepository
                .findByUserIdOrderByIdDesc(user.getId())
                .stream()
                .map(submission -> convertToResponse(submission, null))
                .toList();
    }

    public List<Long> getSolvedProblemIds(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return submissionRepository
                .findByUserIdAndStatus(
                        user.getId(),
                        SubmissionStatus.ACCEPTED
                )
                .stream()
                .map(submission -> submission.getProblem().getId())
                .distinct()
                .toList();
    }

    public SubmissionResponse getSubmissionById(
            Long id,
            String email
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Submission not found"));

        if (!submission.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You are not allowed to access this submission");
        }

        return convertToResponse(submission, null);
    }

    private String normalizeOutput(String output) {
        if (output == null) {
            return "";
        }

        return output.trim().replaceAll("\\s+", " ");
    }

    private SubmissionResponse convertToResponse(
            Submission submission,
            TestCaseResultResponse ignored
    ) {
        SubmissionResponse response = new SubmissionResponse(
                submission.getId(),
                submission.getProblem().getId(),
                submission.getCode(),
                submission.getLanguage(),
                submission.getStatus()
        );

        response.setPassedTestCases(
                submission.getPassedTestCases());
        response.setTotalTestCases(
                submission.getTotalTestCases());
        response.setRuntimeMs(
                submission.getRuntimeMs());
        response.setSubmittedAt(
                submission.getSubmittedAt());

        if (submission.getFailedTestCaseNumber() != null) {
            response.setTestCaseResult(
                    new TestCaseResultResponse(
                            submission.getFailedTestCaseNumber(),
                            submission.getFailedTestCaseStatus(),
                            submission.getFailedInput(),
                            submission.getFailedExpectedOutput(),
                            submission.getFailedActualOutput()
                    )
            );
        }

        return response;
    }
}