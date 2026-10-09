package com.codingplat.repository;

import com.codingplat.entity.Submission;
import com.codingplat.entity.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmissionRepository
        extends JpaRepository<Submission, Long> {

    List<Submission> findByUserId(Long userId);

    List<Submission> findByProblemId(Long problemId);

    List<Submission> findByUserIdOrderByIdDesc(Long userId);

    /*
     * Find all accepted submissions made by a specific user.
     *
     * We use this to determine which problems
     * the user has already solved.
     */
    List<Submission> findByUserIdAndStatus(
            Long userId,
            SubmissionStatus status
    );
}