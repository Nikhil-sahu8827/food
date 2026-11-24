package com.restaurant;

import com.restaurant.entity.Order;
import com.restaurant.entity.OrderItem;
import com.restaurant.entity.User;
import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.PaymentMethod;
import com.restaurant.enums.Role;
import com.restaurant.repository.OrderArchiveRepository;
import com.restaurant.repository.OrderRepository;
import com.restaurant.service.RetentionSchedulerService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RetentionSchedulerServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderArchiveRepository orderArchiveRepository;

    @InjectMocks
    private RetentionSchedulerService retentionSchedulerService;

    @Test
    @DisplayName("Should archive and purge completed orders older than 30 days")
    void testRetentionArchival() {
        ReflectionTestUtils.setField(retentionSchedulerService, "retentionDays", 30);

        User customer = new User("John", "john@example.com", "9876543210", "pass", Role.CUSTOMER);
        customer.setId(5L);

        Order oldOrder = new Order();
        oldOrder.setId(99L);
        oldOrder.setOrderNumber("ORD-20261001-001");
        oldOrder.setCustomer(customer);
        oldOrder.setCustomerName("John");
        oldOrder.setCustomerMobile("9876543210");
        oldOrder.setTotalAmount(new BigDecimal("450.00"));
        oldOrder.setPaymentMethod(PaymentMethod.COD);
        oldOrder.setOrderStatus(OrderStatus.COMPLETED);
        oldOrder.setDeliveryAddress("Old Road, Bengaluru");
        oldOrder.setCreatedAt(Instant.now().minus(35, ChronoUnit.DAYS));

        OrderItem item = new OrderItem(null, "Biryani", 1, new BigDecimal("450.00"), new BigDecimal("450.00"));
        oldOrder.addOrderItem(item);

        when(orderRepository.findOrdersEligibleForRetention(anyList(), any(Instant.class)))
                .thenReturn(List.of(oldOrder));

        int archived = retentionSchedulerService.runRetentionCleanup();

        assertEquals(1, archived);
        verify(orderArchiveRepository, times(1)).save(any());
        verify(orderRepository, times(1)).delete(oldOrder);
    }

    @Test
    @DisplayName("Should NOT archive any orders if no orders are older than 30 days")
    void testRetentionArchivalNoEligible() {
        ReflectionTestUtils.setField(retentionSchedulerService, "retentionDays", 30);
        when(orderRepository.findOrdersEligibleForRetention(anyList(), any(Instant.class)))
                .thenReturn(Collections.emptyList());

        int archived = retentionSchedulerService.runRetentionCleanup();

        assertEquals(0, archived);
        verify(orderArchiveRepository, never()).save(any());
        verify(orderRepository, never()).delete(any(Order.class));
    }
}
