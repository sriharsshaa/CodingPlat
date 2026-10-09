package com.codingplat.controller;

import com.codingplat.dto.ProblemRequest;
import com.codingplat.dto.ProblemResponse;
import com.codingplat.dto.SampleTestCaseResponse;
import com.codingplat.service.ProblemService;
import com.codingplat.repository.TestCaseRepository;
import com.codingplat.entity.TestCase;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemService problemService;
    private final TestCaseRepository testCaseRepository;

    public ProblemController(
            ProblemService problemService,
            TestCaseRepository testCaseRepository
    ) {
        this.problemService = problemService;
        this.testCaseRepository = testCaseRepository;
    }

    @GetMapping
    public List<ProblemResponse> getAllProblems() {
        return problemService.getAllProblems();
    }

    @PostMapping
    public ProblemResponse createProblem(
            @RequestBody ProblemRequest request
    ) {
        return problemService.createProblem(request);
    }

    @GetMapping("/{id}")
    public ProblemResponse getProblemById(
            @PathVariable Long id
    ) {
        return problemService.getProblemById(id);
    }

    /*
     * Returns the test cases that are displayed
     * on the Problem Details page.
     */
    @GetMapping("/{id}/test-cases")
    public List<SampleTestCaseResponse> getTestCases(
            @PathVariable Long id
    ) {

        List<TestCase> testCases =
                testCaseRepository.findByProblemId(id);

        List<SampleTestCaseResponse> response =
                new ArrayList<>();

        for (int i = 0; i < testCases.size(); i++) {

            TestCase testCase =
                    testCases.get(i);

            response.add(
                    new SampleTestCaseResponse(
                            i + 1,
                            testCase.getInput(),
                            testCase.getExpectedOutput()
                    )
            );
        }

        return response;
    }

    @PutMapping("/{id}")
    public ProblemResponse updateProblem(
            @PathVariable Long id,
            @Valid @RequestBody ProblemRequest request
    ) {
        return problemService.updateProblem(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProblem(
            @PathVariable Long id
    ) {
        problemService.deleteProblem(id);
    }
}