package com.codingplat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SubmissionRequest {

    @NotNull(message = "Problem ID is required")
    private Long problemId;

    @NotBlank(message = "Code is required")
    private String code;

    @NotBlank(message = "Language is required")
    private String language;

    public SubmissionRequest() {
    }

    public Long getProblemId() {
        return problemId;
    }

    public void setProblemId(Long problemId) {
        this.problemId = problemId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}