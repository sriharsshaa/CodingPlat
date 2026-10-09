package com.codingplat.execution;

public class ExecutionResult {

    private String status;
    private String output;
    private int exitCode;

    public ExecutionResult(
            String status,
            String output,
            int exitCode
    ) {
        this.status = status;
        this.output = output;
        this.exitCode = exitCode;
    }

    public String getStatus() {
        return status;
    }

    public String getOutput() {
        return output;
    }

    public int getExitCode() {
        return exitCode;
    }
}