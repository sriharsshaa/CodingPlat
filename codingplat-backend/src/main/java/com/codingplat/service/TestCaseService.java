package com.codingplat.service;

import com.codingplat.dto.TestCaseRequest;
import com.codingplat.dto.TestCaseResponse;
import com.codingplat.entity.Problem;
import com.codingplat.entity.TestCase;
import com.codingplat.repository.ProblemRepository;
import com.codingplat.repository.TestCaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final ProblemRepository problemRepository;

    public TestCaseService(
            TestCaseRepository testCaseRepository,
            ProblemRepository problemRepository
    ) {
        this.testCaseRepository = testCaseRepository;
        this.problemRepository = problemRepository;
    }

    public TestCaseResponse createTestCase(
            Long problemId,
            TestCaseRequest request
    ) {

        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Problem with id "
                                        + problemId
                                        + " not found"
                        )
                );

        TestCase testCase = new TestCase();

        testCase.setProblem(problem);
        testCase.setInput(request.getInput());
        testCase.setExpectedOutput(
                request.getExpectedOutput()
        );

        TestCase savedTestCase =
                testCaseRepository.save(testCase);

        return convertToResponse(savedTestCase);
    }

    public List<TestCaseResponse> getTestCasesByProblemId(
            Long problemId
    ) {

        if (!problemRepository.existsById(problemId)) {
            throw new RuntimeException(
                    "Problem with id "
                            + problemId
                            + " not found"
            );
        }

        return testCaseRepository
                .findByProblemId(problemId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public void deleteTestCase(Long id) {

        TestCase testCase =
                testCaseRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Test case not found"
                                )
                        );

        testCaseRepository.delete(testCase);
    }

    private TestCaseResponse convertToResponse(
            TestCase testCase
    ) {

        return new TestCaseResponse(
                testCase.getId().intValue(),
                testCase.getInput(),
                testCase.getExpectedOutput()
        );
    }
}