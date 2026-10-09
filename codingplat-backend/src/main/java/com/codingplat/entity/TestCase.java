package com.codingplat.entity;

import jakarta.persistence.*;

@Entity
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * The problem this test case belongs to.
     *
     * Example:
     *
     * Problem: Two Sum
     * TestCase: [2, 7, 11, 15], target = 9
     */
    @ManyToOne
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    /*
     * Input that will be given to the user's program.
     *
     * Example:
     *
     * 4
     * 2 7 11 15
     * 9
     */
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String input;

    /*
     * Correct output expected from the user's program.
     *
     * Example:
     *
     * 0 1
     */
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String expectedOutput;

    public TestCase() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Problem getProblem() {
        return problem;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
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