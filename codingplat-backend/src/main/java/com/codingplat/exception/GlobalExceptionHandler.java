package com.codingplat.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProblemNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleProblemNotFound(
            ProblemNotFoundException exception
    ) {
        return Map.of(
                "timestamp", LocalDateTime.now(),
                "status", 404,
                "error", "Problem Not Found",
                "message", exception.getMessage()
        );
    }
}