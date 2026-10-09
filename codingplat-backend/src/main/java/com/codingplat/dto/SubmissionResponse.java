package com.codingplat.dto;

import com.codingplat.entity.SubmissionStatus;
import java.time.LocalDateTime;

public class SubmissionResponse {

    private Long id;
    private Long problemId;
    private String code;
    private String language;
    private SubmissionStatus status;

    private int passedTestCases;
    private int totalTestCases;
    private long runtimeMs;
    private LocalDateTime submittedAt;

    private TestCaseResultResponse testCaseResult;

    public SubmissionResponse() {
    }

    public SubmissionResponse(
            Long id,
            Long problemId,
            String code,
            String language,
            SubmissionStatus status
    ) {
        this.id = id;
        this.problemId = problemId;
        this.code = code;
        this.language = language;
        this.status = status;
    }

    public SubmissionResponse(
            Long id,
            Long problemId,
            String code,
            String language,
            SubmissionStatus status,
            TestCaseResultResponse testCaseResult
    ) {
        this.id = id;
        this.problemId = problemId;
        this.code = code;
        this.language = language;
        this.status = status;
        this.testCaseResult = testCaseResult;
    }

    public Long getId() {
        return id;
    }

    public Long getProblemId() {
        return problemId;
    }

    public String getCode() {
        return code;
    }

    public String getLanguage() {
        return language;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public int getPassedTestCases() {
        return passedTestCases;
    }

    public void setPassedTestCases(int passedTestCases) {
        this.passedTestCases = passedTestCases;
    }

    public int getTotalTestCases() {
        return totalTestCases;
    }

    public void setTotalTestCases(int totalTestCases) {
        this.totalTestCases = totalTestCases;
    }

    public long getRuntimeMs() {
        return runtimeMs;
    }

    public void setRuntimeMs(long runtimeMs) {
        this.runtimeMs = runtimeMs;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public TestCaseResultResponse getTestCaseResult() {
        return testCaseResult;
    }

    public void setTestCaseResult(
            TestCaseResultResponse testCaseResult
    ) {
        this.testCaseResult = testCaseResult;
    }
}