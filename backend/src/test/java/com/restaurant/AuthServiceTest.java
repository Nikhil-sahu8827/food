package com.restaurant;

import com.restaurant.dto.AuthResponse;
import com.restaurant.dto.LoginRequest;
import com.restaurant.dto.RegisterRequest;
import com.restaurant.entity.User;
import com.restaurant.enums.Role;
import com.restaurant.exception.BadRequestException;
import com.restaurant.repository.UserRepository;
import com.restaurant.security.JwtTokenProvider;
import com.restaurant.security.UserPrincipal;
import com.restaurant.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFullName("Aarav Patel");
        registerRequest.setEmail("aarav@example.com");
        registerRequest.setMobileNumber("+919876543210");
        registerRequest.setPassword("Secret@123");
        registerRequest.setConfirmPassword("Secret@123");
    }

    @Test
    @DisplayName("Should successfully register customer with Role.CUSTOMER and hashed password")
    void testSuccessfulRegistration() {
        when(userRepository.existsByEmail("aarav@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret@123")).thenReturn("hashedPassword123");
        when(tokenProvider.generateToken(any())).thenReturn("mockJwtToken");

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(1L);
            return u;
        });

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mockJwtToken", response.getToken());
        assertEquals("aarav@example.com", response.getEmail());
        assertEquals(Role.CUSTOMER, response.getRole());
        verify(passwordEncoder).encode("Secret@123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully register administrator when Role.ADMIN is requested")
    void testSuccessfulAdminRegistration() {
        registerRequest.setEmail("admin2@example.com");
        registerRequest.setRole("ADMIN");
        when(userRepository.existsByEmail("admin2@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret@123")).thenReturn("hashedPassword123");
        when(tokenProvider.generateToken(any())).thenReturn("adminJwtToken");

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(2L);
            return u;
        });

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("adminJwtToken", response.getToken());
        assertEquals(Role.ADMIN, response.getRole());
    }

    @Test
    @DisplayName("Should reject registration if password and confirmPassword do not match")
    void testMismatchedPasswords() {
        registerRequest.setConfirmPassword("DifferentPassword");

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> authService.register(registerRequest));

        assertTrue(ex.getMessage().contains("do not match"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject registration if email already exists")
    void testDuplicateEmail() {
        when(userRepository.existsByEmail("aarav@example.com")).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> authService.register(registerRequest));

        assertTrue(ex.getMessage().contains("already exists"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should login successfully with valid credentials and return JWT")
    void testSuccessfulLogin() {
        LoginRequest loginRequest = new LoginRequest("aarav@example.com", "Secret@123");
        User user = new User("Aarav Patel", "aarav@example.com", "+919876543210", "hashed", Role.CUSTOMER);
        user.setId(1L);
        UserPrincipal principal = new UserPrincipal(user);

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(principal);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(principal)).thenReturn("validJwtToken");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("validJwtToken", response.getToken());
        assertEquals("aarav@example.com", response.getEmail());
    }

    @Test
    @DisplayName("Should throw BadCredentialsException on invalid login")
    void testInvalidLogin() {
        LoginRequest loginRequest = new LoginRequest("aarav@example.com", "WrongPassword");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));
    }
}
