package com.codingplat.dto;

import java.util.List;

public class ProfileResponse {

    private String name;
    private String email;

    private long solved;
    private long attempting;

    private long easy;
    private long medium;
    private long hard;

    private long totalSubmissions;

    private List<SubmissionResponse> recentSubmissions;

    public ProfileResponse() {
    }

    public ProfileResponse(
            String name,
            String email,
            long solved,
            long attempting,
            long easy,
            long medium,
            long hard,
            long totalSubmissions,
            List<SubmissionResponse> recentSubmissions
    ) {
        this.name = name;
        this.email = email;
        this.solved = solved;
        this.attempting = attempting;
        this.easy = easy;
        this.medium = medium;
        this.hard = hard;
        this.totalSubmissions = totalSubmissions;
        this.recentSubmissions = recentSubmissions;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public long getSolved() {
        return solved;
    }

    public long getAttempting() {
        return attempting;
    }

    public long getEasy() {
        return easy;
    }

    public long getMedium() {
        return medium;
    }

    public long getHard() {
        return hard;
    }

    public long getTotalSubmissions() {
        return totalSubmissions;
    }

    public List<SubmissionResponse> getRecentSubmissions() {
        return recentSubmissions;
    }
}