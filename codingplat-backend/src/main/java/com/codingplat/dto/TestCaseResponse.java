package com.codingplat.dto;

public class TestCaseResponse {

    private int testCaseNumber;
    private String input;
    private String expectedOutput;

    public TestCaseResponse() {
    }

    public TestCaseResponse(
            int testCaseNumber,
            String input,
            String expectedOutput
    ) {
        this.testCaseNumber = testCaseNumber;
        this.input = input;
        this.expectedOutput = expectedOutput;
    }

    public int getTestCaseNumber() {
        return testCaseNumber;
    }

    public void setTestCaseNumber(int testCaseNumber) {
        this.testCaseNumber = testCaseNumber;
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
}