package com.restaurant.service;

import com.restaurant.dto.AuthResponse;
import com.restaurant.dto.LoginRequest;
import com.restaurant.dto.RegisterRequest;
import com.restaurant.dto.UserDto;
import com.restaurant.entity.User;
import com.restaurant.enums.Role;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.exception.UnauthorizedException;
import com.restaurant.repository.UserRepository;
import com.restaurant.security.JwtTokenProvider;
import com.restaurant.security.UserPrincipal;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.admin.default-email:admin@restaurant.com}")
    private String defaultAdminEmail;

    @Value("${app.admin.default-password:AdminPassword@123}")
    private String defaultAdminPassword;

    @Value("${app.admin.default-name:Head Administrator}")
    private String defaultAdminName;

    @Value("${app.admin.default-mobile:+919876543210}")
    private String defaultAdminMobile;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @PostConstruct
    @Transactional
    public void initAdmin() {
        if (!userRepository.existsByEmail(defaultAdminEmail)) {
            log.info("Initializing default administrator account: {}", defaultAdminEmail);
            User admin = new User(
                    defaultAdminName,
                    defaultAdminEmail,
                    defaultAdminMobile,
                    passwordEncoder.encode(defaultAdminPassword),
                    Role.ADMIN
            );
            userRepository.save(admin);
            log.info("Default administrator account created successfully.");
        }

        String defaultCustomerEmail = "customer@restaurant.com";
        if (!userRepository.existsByEmail(defaultCustomerEmail)) {
            log.info("Initializing default customer account: {}", defaultCustomerEmail);
            User customer = new User(
                    "Rohan Sharma (Customer)",
                    defaultCustomerEmail,
                    "+919876543211",
                    passwordEncoder.encode(defaultAdminPassword),
                    Role.CUSTOMER
            );
            userRepository.save(customer);
            log.info("Default customer account created successfully.");
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email address already exists");
        }

        Role assignedRole = Role.CUSTOMER;
        if (request.getRole() != null && "ADMIN".equalsIgnoreCase(request.getRole().trim())) {
            assignedRole = Role.ADMIN;
            log.info("Registering new administrator account: {}", email);
        } else {
            log.info("Registering new customer account: {}", email);
        }

        User user = new User(
                request.getFullName().trim(),
                email,
                request.getMobileNumber().trim(),
                passwordEncoder.encode(request.getPassword()),
                assignedRole
        );

        User savedUser = userRepository.save(user);

        UserPrincipal principal = new UserPrincipal(savedUser);
        String token = tokenProvider.generateToken(principal);

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getMobileNumber(),
                savedUser.getRole()
        );
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            String token = tokenProvider.generateToken(principal);

            return new AuthResponse(
                    token,
                    principal.getId(),
                    principal.getFullName(),
                    principal.getEmail(),
                    principal.getMobileNumber(),
                    principal.getRole()
            );
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUserDto() {
        User user = getCurrentAuthenticatedUser();
        return new UserDto(user);
    }

    @Transactional(readOnly = true)
    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException("User is not authenticated");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
