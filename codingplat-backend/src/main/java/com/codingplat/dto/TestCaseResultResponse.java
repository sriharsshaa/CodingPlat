package com.codingplat.dto;

public class TestCaseResultResponse {

    private int testCaseNumber;
    private String status;
    private String input;
    private String expectedOutput;
    private String actualOutput;

    public TestCaseResultResponse() {
    }

    /*
     * Existing constructor.
     *
     * Kept for SubmissionService compatibility.
     */
    public TestCaseResultResponse(
            int testCaseNumber,
            String status,
            String expectedOutput,
            String actualOutput
    ) {
        this.testCaseNumber = testCaseNumber;
        this.status = status;
        this.expectedOutput = expectedOutput;
        this.actualOutput = actualOutput;
    }

    /*
     * New constructor.
     *
     * Used by Run Code.
     */
    public TestCaseResultResponse(
            int testCaseNumber,
            String status,
            String input,
            String expectedOutput,
            String actualOutput
    ) {
        this.testCaseNumber = testCaseNumber;
        this.status = status;
        this.input = input;
        this.expectedOutput = expectedOutput;
        this.actualOutput = actualOutput;
    }

    public int getTestCaseNumber() {
        return testCaseNumber;
    }

    public void setTestCaseNumber(int testCaseNumber) {
        this.testCaseNumber = testCaseNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }

    public String getActualOutput() {
        return actualOutput;
    }

    public void setActualOutput(String actualOutput) {
        this.actualOutput = actualOutput;
    }
}