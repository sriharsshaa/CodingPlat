package com.codingplat.repository;

import com.codingplat.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
}