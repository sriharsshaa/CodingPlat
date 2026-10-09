package com.codingplat.dto;

import jakarta.validation.constraints.NotBlank;

public class TestCaseRequest {

    @NotBlank(message = "Input is required")
    private String input;

    @NotBlank(message = "Expected output is required")
    private String expectedOutput;

    public TestCaseRequest() {
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