package com.codingplat.dto;

import java.util.List;

public class ProblemExecutionResponse {

    private String status;
    private long runtime;
    private String message;
    private List<TestCaseResultResponse> testCases;

    public ProblemExecutionResponse() {
    }

    public ProblemExecutionResponse(
            String status,
            long runtime,
            String message,
            List<TestCaseResultResponse> testCases
    ) {
        this.status = status;
        this.runtime = runtime;
        this.message = message;
        this.testCases = testCases;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getRuntime() {
        return runtime;
    }

    public void setRuntime(long runtime) {
        this.runtime = runtime;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<TestCaseResultResponse> getTestCases() {
        return testCases;
    }

    public void setTestCases(
            List<TestCaseResultResponse> testCases
    ) {
        this.testCases = testCases;
    }
}