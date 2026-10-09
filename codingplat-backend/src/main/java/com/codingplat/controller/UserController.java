package com.codingplat.controller;

import com.codingplat.dto.LoginRequest;
import com.codingplat.dto.LoginResponse;
import com.codingplat.dto.ProfileResponse;
import com.codingplat.dto.RegisterRequest;
import com.codingplat.dto.UserResponse;
import com.codingplat.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    /* =====================================================
       REGISTER
       ===================================================== */

    @PostMapping("/register")
    public UserResponse register(
            @Valid @RequestBody RegisterRequest request
    ) {

        return userService.register(request);
    }


    /* =====================================================
       LOGIN
       ===================================================== */

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request
    ) {

        return userService.login(request);
    }


    /* =====================================================
       PROFILE
       ===================================================== */

    @GetMapping("/profile")
    public ProfileResponse getProfile(
            Authentication authentication
    ) {

        String email = authentication.getName();

        return userService.getProfile(email);
    }
}