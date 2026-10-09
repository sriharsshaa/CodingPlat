package com.codingplat.controller;

import com.codingplat.dto.TestCaseRequest;
import com.codingplat.dto.TestCaseResponse;
import com.codingplat.service.TestCaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TestCaseController {

    private final TestCaseService testCaseService;

    public TestCaseController(
            TestCaseService testCaseService
    ) {
        this.testCaseService = testCaseService;
    }

    @PostMapping("/problems/{problemId}/testcases")
    public TestCaseResponse createTestCase(
            @PathVariable Long problemId,
            @Valid @RequestBody TestCaseRequest request
    ) {

        return testCaseService.createTestCase(
                problemId,
                request
        );
    }

    @GetMapping("/problems/{problemId}/testcases")
    public List<TestCaseResponse> getTestCases(
            @PathVariable Long problemId
    ) {

        return testCaseService.getTestCasesByProblemId(
                problemId
        );
    }

    @DeleteMapping("/testcases/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTestCase(
            @PathVariable Long id
    ) {

        testCaseService.deleteTestCase(id);
    }
}