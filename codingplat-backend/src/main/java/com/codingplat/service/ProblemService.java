package com.codingplat.service;

import com.codingplat.dto.ProblemRequest;
import com.codingplat.dto.ProblemResponse;
import com.codingplat.entity.Problem;
import com.codingplat.repository.ProblemRepository;
import com.codingplat.exception.ProblemNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;

    public ProblemService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public List<ProblemResponse> getAllProblems() {

        return problemRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public ProblemResponse getProblemById(Long id) {

        Problem problem = problemRepository.findById(id)
                .orElseThrow(() ->
                        new ProblemNotFoundException(
                                "Problem with id " + id + " not found"
                        )
                );

        return convertToResponse(problem);
    }

    public ProblemResponse createProblem(ProblemRequest request) {

        Problem problem = new Problem();

        problem.setTitle(request.getTitle());
        problem.setDescription(request.getDescription());
        problem.setDifficulty(request.getDifficulty());
        problem.setTags(request.getTags());
        problem.setInputFormat(request.getInputFormat());
        problem.setOutputFormat(request.getOutputFormat());
        problem.setConstraints(request.getConstraints());

        Problem savedProblem = problemRepository.save(problem);

        return convertToResponse(savedProblem);
    }

    public ProblemResponse updateProblem(
            Long id,
            ProblemRequest request
    ) {

        Problem problem = problemRepository.findById(id)
                .orElseThrow(() ->
                        new ProblemNotFoundException(
                                "Problem with id " + id + " not found"
                        )
                );

        problem.setTitle(request.getTitle());
        problem.setDescription(request.getDescription());
        problem.setDifficulty(request.getDifficulty());
        problem.setTags(request.getTags());
        problem.setInputFormat(request.getInputFormat());
        problem.setOutputFormat(request.getOutputFormat());
        problem.setConstraints(request.getConstraints());

        Problem updatedProblem =
                problemRepository.save(problem);

        return convertToResponse(updatedProblem);
    }

    public void deleteProblem(Long id) {

        Problem problem = problemRepository.findById(id)
                .orElseThrow(() ->
                        new ProblemNotFoundException(
                                "Problem with id " + id + " not found"
                        )
                );

        problemRepository.delete(problem);
    }

    private ProblemResponse convertToResponse(
            Problem problem
    ) {

        return new ProblemResponse(
                problem.getId(),
                problem.getTitle(),
                problem.getDescription(),
                problem.getDifficulty(),
                problem.getTags(),
                problem.getInputFormat(),
                problem.getOutputFormat(),
                problem.getConstraints()
        );
    }
}