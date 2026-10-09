package com.codingplat.service;

import com.codingplat.dto.LoginRequest;
import com.codingplat.dto.LoginResponse;
import com.codingplat.dto.ProfileResponse;
import com.codingplat.dto.RegisterRequest;
import com.codingplat.dto.SubmissionResponse;
import com.codingplat.dto.UserResponse;
import com.codingplat.entity.Difficulty;
import com.codingplat.entity.Submission;
import com.codingplat.entity.SubmissionStatus;
import com.codingplat.entity.User;
import com.codingplat.repository.SubmissionRepository;
import com.codingplat.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            UserRepository userRepository,
            SubmissionRepository submissionRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.submissionRepository = submissionRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    /* =====================================================
       REGISTER
       ===================================================== */

    public UserResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        String hashedPassword =
                passwordEncoder.encode(
                        request.getPassword()
                );

        user.setPassword(hashedPassword);

        User savedUser =
                userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail()
        );
    }


    /* =====================================================
       LOGIN
       ===================================================== */

    public LoginResponse login(LoginRequest request) {

        User user =
                userRepository.findByEmail(
                        request.getEmail()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        )
                );


        boolean passwordMatches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );


        if (!passwordMatches) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }


        String token =
                jwtService.generateToken(
                        user.getEmail()
                );


        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                token
        );
    }


    /* =====================================================
       PROFILE
       ===================================================== */

    public ProfileResponse getProfile(
            String email
    ) {

        /*
         * Find the logged-in user.
         */

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );


        /*
         * Get all submissions made by this user.
         *
         * They are already ordered by ID descending
         * because of:
         *
         * findByUserIdOrderByIdDesc()
         */

        List<Submission> submissions =
                submissionRepository
                        .findByUserIdOrderByIdDesc(
                                user.getId()
                        );


        /*
         * Store unique solved problem IDs.
         */

        Set<Long> solvedProblemIds =
                new HashSet<>();


        /*
         * Store unique attempted problem IDs.
         */

        Set<Long> attemptedProblemIds =
                new HashSet<>();


        /*
         * Store solved problems by difficulty.
         */

        long easy = 0;
        long medium = 0;
        long hard = 0;


        /*
         * Process every submission.
         */

        for (Submission submission : submissions) {

            Long problemId =
                    submission.getProblem().getId();


            /*
             * Every submission means the problem
             * was attempted.
             */

            attemptedProblemIds.add(problemId);


            /*
             * Only ACCEPTED submissions count
             * as solved.
             */

            if (
                    submission.getStatus()
                            != SubmissionStatus.ACCEPTED
            ) {
                continue;
            }


            /*
             * If this problem was already solved,
             * don't count it again.
             */

            if (
                    solvedProblemIds.contains(
                            problemId
                    )
            ) {
                continue;
            }


            /*
             * First accepted submission for
             * this problem.
             */

            solvedProblemIds.add(problemId);


            Difficulty difficulty =
                    submission
                            .getProblem()
                            .getDifficulty();


            if (difficulty == Difficulty.EASY) {

                easy++;

            } else if (
                    difficulty == Difficulty.MEDIUM
            ) {

                medium++;

            } else if (
                    difficulty == Difficulty.HARD
            ) {

                hard++;
            }
        }


        /*
         * Total solved problems.
         */

        long solved =
                solvedProblemIds.size();


        /*
         * Attempting means:
         *
         * attempted
         * -
         * solved
         */

        long attempting = 0;


        for (Long problemId :
                attemptedProblemIds) {

            if (
                    !solvedProblemIds.contains(
                            problemId
                    )
            ) {

                attempting++;
            }
        }


        /*
         * Get the latest 10 submissions.
         */

        List<SubmissionResponse>
                recentSubmissions =
                submissions.stream()
                        .limit(10)
                        .map(
                                this::convertToSubmissionResponse
                        )
                        .toList();


        /*
         * Total number of submissions.
         */

        long totalSubmissions =
                submissions.size();


        /*
         * Create profile response.
         */

        return new ProfileResponse(
                user.getName(),
                user.getEmail(),
                solved,
                attempting,
                easy,
                medium,
                hard,
                totalSubmissions,
                recentSubmissions
        );
    }


    /* =====================================================
       SUBMISSION → DTO
       ===================================================== */

    private SubmissionResponse
    convertToSubmissionResponse(
            Submission submission
    ) {

        return new SubmissionResponse(
                submission.getId(),
                submission.getProblem().getId(),
                submission.getCode(),
                submission.getLanguage(),
                submission.getStatus()
        );
    }
}