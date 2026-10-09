package com.codingplat.controller;

import com.codingplat.dto.SubmissionRequest;
import com.codingplat.dto.SubmissionResponse;
import com.codingplat.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(
            SubmissionService submissionService
    ) {
        this.submissionService = submissionService;
    }

    @PostMapping
    public SubmissionResponse createSubmission(
            @Valid @RequestBody SubmissionRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return submissionService.createSubmission(
                request,
                email
        );
    }

    @GetMapping
    public List<SubmissionResponse> getMySubmissions(
            Authentication authentication
    ) {

        String email = authentication.getName();

        return submissionService.getMySubmissions(email);
    }

    /*
     * =========================================================
     * GET SOLVED PROBLEM IDS
     * =========================================================
     *
     * Example response:
     *
     * [1, 3, 6]
     *
     * Only problems solved by the currently logged-in
     * user are returned.
     */
    @GetMapping("/solved-problems")
    public List<Long> getSolvedProblemIds(
            Authentication authentication
    ) {

        String email = authentication.getName();

        return submissionService.getSolvedProblemIds(
                email
        );
    }

    @GetMapping("/{id}")
    public SubmissionResponse getSubmissionById(
            @PathVariable Long id,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return submissionService.getSubmissionById(
                id,
                email
        );
    }
}