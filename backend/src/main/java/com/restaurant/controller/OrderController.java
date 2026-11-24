package com.restaurant.controller;

import com.restaurant.dto.LocationShareRequest;
import com.restaurant.dto.OrderDto;
import com.restaurant.dto.PlaceOrderRequest;
import com.restaurant.entity.User;
import com.restaurant.service.AuthService;
import com.restaurant.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    public OrderController(OrderService orderService, AuthService authService) {
        this.orderService = orderService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<OrderDto> placeOrder(@Valid @RequestBody PlaceOrderRequest request) {
        User customer = authService.getCurrentAuthenticatedUser();
        OrderDto order = orderService.placeOrder(request, customer);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderDto>> getMyOrders() {
        User customer = authService.getCurrentAuthenticatedUser();
        List<OrderDto> orders = orderService.getCustomerOrders(customer);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        OrderDto order = orderService.getOrderById(id, user);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/share-location")
    public ResponseEntity<OrderDto> shareLocation(
            @PathVariable Long id,
            @Valid @RequestBody LocationShareRequest request) {
        User customer = authService.getCurrentAuthenticatedUser();
        OrderDto order = orderService.shareDeliveryLocation(id, request, customer);
        return ResponseEntity.ok(order);
    }
}
