package com.codingplat.execution;

import com.codingplat.dto.ProblemExecutionResponse;
import com.codingplat.dto.TestCaseResponse;
import com.codingplat.service.ProblemExecutionService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/execution")
public class ExecutionController {

    private final DockerCodeExecutor dockerCodeExecutor;
    private final ProblemExecutionService problemExecutionService;

    public ExecutionController(
            DockerCodeExecutor dockerCodeExecutor,
            ProblemExecutionService problemExecutionService
    ) {
        this.dockerCodeExecutor =
                dockerCodeExecutor;

        this.problemExecutionService =
                problemExecutionService;
    }

    // =========================================================
    // CUSTOM CODE EXECUTION
    // =========================================================

    @PostMapping("/cpp")
    public ExecutionResult executeCpp(
            @RequestBody ExecutionRequest request
    ) {

        return dockerCodeExecutor.executeCppCode(
                request.getCode(),
                request.getInput()
        );
    }

    // =========================================================
    // GET TEST CASES
    // =========================================================

    @GetMapping("/cpp/problem/{id}/testcases")
    public List<TestCaseResponse> getTestCases(
            @PathVariable Long id
    ) {

        return problemExecutionService
                .getTestCases(id);
    }

    // =========================================================
    // RUN CODE AGAINST PROBLEM TEST CASES
    // =========================================================

    @PostMapping("/cpp/problem/{id}")
    public ProblemExecutionResponse executeProblem(
            @PathVariable Long id,
            @RequestBody ExecutionRequest request
    ) {

        return problemExecutionService.runProblem(
                id,
                request.getCode()
        );
    }
}