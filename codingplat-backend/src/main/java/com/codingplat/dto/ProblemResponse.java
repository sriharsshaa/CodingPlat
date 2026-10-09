package com.codingplat.dto;

import com.codingplat.entity.Difficulty;

public class ProblemResponse {

    private Long id;
    private String title;
    private String description;
    private Difficulty difficulty;
    private String tags;
    private String inputFormat;
    private String outputFormat;
    private String constraints;

    public ProblemResponse() {
    }

    public ProblemResponse(
            Long id,
            String title,
            String description,
            Difficulty difficulty,
            String tags,
            String inputFormat,
            String outputFormat,
            String constraints
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.tags = tags;
        this.inputFormat = inputFormat;
        this.outputFormat = outputFormat;
        this.constraints = constraints;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public String getTags() {
        return tags;
    }

    public String getInputFormat() {
        return inputFormat;
    }

    public String getOutputFormat() {
        return outputFormat;
    }

    public String getConstraints() {
        return constraints;
    }
}
