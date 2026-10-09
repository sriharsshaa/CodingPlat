package com.codingplat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String code;

    @Column(nullable = false)
    private String language;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status;

    @Column(nullable = false)
    private int passedTestCases = 0;

    @Column(nullable = false)
    private int totalTestCases = 0;

    @Column(nullable = false)
    private long runtimeMs = 0;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    private Integer failedTestCaseNumber;

    private String failedTestCaseStatus;

    @Column(columnDefinition = "LONGTEXT")
    private String failedInput;

    @Column(columnDefinition = "LONGTEXT")
    private String failedExpectedOutput;

    @Column(columnDefinition = "LONGTEXT")
    private String failedActualOutput;

    public Submission() {
    }

    @PrePersist
    protected void onCreate() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Problem getProblem() {
        return problem;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
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

    public SubmissionStatus getStatus() {
        return status;
    }

    public void setStatus(SubmissionStatus status) {
        this.status = status;
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

    public Integer getFailedTestCaseNumber() {
        return failedTestCaseNumber;
    }

    public void setFailedTestCaseNumber(Integer failedTestCaseNumber) {
        this.failedTestCaseNumber = failedTestCaseNumber;
    }

    public String getFailedTestCaseStatus() {
        return failedTestCaseStatus;
    }

    public void setFailedTestCaseStatus(String failedTestCaseStatus) {
        this.failedTestCaseStatus = failedTestCaseStatus;
    }

    public String getFailedInput() {
        return failedInput;
    }

    public void setFailedInput(String failedInput) {
        this.failedInput = failedInput;
    }

    public String getFailedExpectedOutput() {
        return failedExpectedOutput;
    }

    public void setFailedExpectedOutput(String failedExpectedOutput) {
        this.failedExpectedOutput = failedExpectedOutput;
    }

    public String getFailedActualOutput() {
        return failedActualOutput;
    }

    public void setFailedActualOutput(String failedActualOutput) {
        this.failedActualOutput = failedActualOutput;
    }
}