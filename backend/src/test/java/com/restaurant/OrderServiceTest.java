package com.restaurant;

import com.restaurant.dto.CartItemRequest;
import com.restaurant.dto.LocationShareRequest;
import com.restaurant.dto.OrderDto;
import com.restaurant.dto.PlaceOrderRequest;
import com.restaurant.dto.RestaurantStatusResponse;
import com.restaurant.dto.UpdateOrderStatusRequest;
import com.restaurant.entity.FoodCategory;
import com.restaurant.entity.FoodItem;
import com.restaurant.entity.Order;
import com.restaurant.entity.RestaurantSetting;
import com.restaurant.entity.User;
import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.Role;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.RestaurantClosedException;
import com.restaurant.repository.FoodItemRepository;
import com.restaurant.repository.OrderRepository;
import com.restaurant.service.NotificationService;
import com.restaurant.service.OrderService;
import com.restaurant.service.RestaurantStatusService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private FoodItemRepository foodItemRepository;

    @Mock
    private RestaurantStatusService restaurantStatusService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OrderService orderService;

    private User customer;
    private FoodCategory category;
    private FoodItem biryani;
    private RestaurantSetting settings;

    @BeforeEach
    void setUp() {
        customer = new User("Rahul Sharma", "rahul@example.com", "+919876543210", "password", Role.CUSTOMER);
        customer.setId(10L);

        category = new FoodCategory("Biryani", "Delicious rice", true, 1);
        category.setId(1L);

        biryani = new FoodItem("Chicken Biryani", "Authentic dum", new BigDecimal("350.00"), "img.jpg", category, false, true);
        biryani.setId(100L);

        settings = new RestaurantSetting();
        settings.setMinimumOrderAmount(new BigDecimal("150.00"));
        settings.setRestaurantName("Royal Spice");
        settings.setWhatsappNumber("919876543210");
    }

    @Test
    @DisplayName("Should reject order placement when restaurant is closed")
    void testPlaceOrderWhenRestaurantClosed() {
        RestaurantStatusResponse statusResponse = new RestaurantStatusResponse();
        statusResponse.setOpen(false);
        statusResponse.setMessage("Restaurant closed for night");
        when(restaurantStatusService.getRestaurantStatus()).thenReturn(statusResponse);

        PlaceOrderRequest request = new PlaceOrderRequest("123 Street",
                Collections.singletonList(new CartItemRequest(100L, 1)));

        assertThrows(RestaurantClosedException.class, () -> orderService.placeOrder(request, customer));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Should calculate total on backend and place order when open")
    void testPlaceOrderSuccess() {
        RestaurantStatusResponse statusResponse = new RestaurantStatusResponse();
        statusResponse.setOpen(true);
        when(restaurantStatusService.getRestaurantStatus()).thenReturn(statusResponse);
        when(restaurantStatusService.getOrCreateDefaultSettings()).thenReturn(settings);
        when(foodItemRepository.findById(100L)).thenReturn(Optional.of(biryani));

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(500L);
            return o;
        });

        PlaceOrderRequest request = new PlaceOrderRequest("123 Street, Bengaluru",
                Collections.singletonList(new CartItemRequest(100L, 2)));

        OrderDto createdOrder = orderService.placeOrder(request, customer);

        assertNotNull(createdOrder);
        assertEquals(new BigDecimal("700.00"), createdOrder.getTotalAmount());
        assertEquals(OrderStatus.PENDING, createdOrder.getOrderStatus());
        assertFalse(createdOrder.getLocationShared());
        verify(notificationService).notifyAdminNewOrder(any(OrderDto.class));
    }

    @Test
    @DisplayName("Should successfully place order when customer is within 2.5 km delivery radius")
    void testPlaceOrderWithinDeliveryRadius() {
        RestaurantStatusResponse statusResponse = new RestaurantStatusResponse();
        statusResponse.setOpen(true);
        when(restaurantStatusService.getRestaurantStatus()).thenReturn(statusResponse);
        when(restaurantStatusService.getOrCreateDefaultSettings()).thenReturn(settings);
        when(foodItemRepository.findById(100L)).thenReturn(Optional.of(biryani));

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(501L);
            return o;
        });

        // Customer coordinate ~0.5 km away from restaurant (12.9716, 77.6412)
        PlaceOrderRequest request = new PlaceOrderRequest("Nearby Indiranagar, Bengaluru",
                Collections.singletonList(new CartItemRequest(100L, 1)), 12.9750, 77.6430);

        OrderDto createdOrder = orderService.placeOrder(request, customer);

        assertNotNull(createdOrder);
        assertTrue(createdOrder.getLocationShared());
        assertEquals(12.9750, createdOrder.getLatitude());
        assertEquals(77.6430, createdOrder.getLongitude());
    }

    @Test
    @DisplayName("Should reject order when customer location exceeds 2.5 km delivery radius")
    void testPlaceOrderOutsideDeliveryRadius() {
        RestaurantStatusResponse statusResponse = new RestaurantStatusResponse();
        statusResponse.setOpen(true);
        when(restaurantStatusService.getRestaurantStatus()).thenReturn(statusResponse);

        // Location ~6 km away
        PlaceOrderRequest request = new PlaceOrderRequest("Far Away Layout, Bengaluru",
                Collections.singletonList(new CartItemRequest(100L, 1)), 12.9200, 77.6100);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> orderService.placeOrder(request, customer));

        assertTrue(ex.getMessage().contains("Delivery is only available within 2.5 km"));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("WhatsApp location sharing MUST FAIL when order is still in PENDING status")
    void testLocationShareFailsWhenPending() {
        Order order = new Order();
        order.setId(1L);
        order.setCustomer(customer);
        order.setOrderStatus(OrderStatus.PENDING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        LocationShareRequest loc = new LocationShareRequest(12.9716, 77.5946);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> orderService.shareDeliveryLocation(1L, loc, customer));

        assertTrue(ex.getMessage().contains("after the restaurant accepts your order"));
    }

    @Test
    @DisplayName("WhatsApp location sharing SUCCEEDS when order status is ACCEPTED")
    void testLocationShareSucceedsWhenAccepted() {
        Order order = new Order();
        order.setId(1L);
        order.setCustomer(customer);
        order.setOrderStatus(OrderStatus.ACCEPTED);
        order.setOrderNumber("ORD-20261119-001");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LocationShareRequest loc = new LocationShareRequest(12.9716, 77.5946);

        OrderDto updated = orderService.shareDeliveryLocation(1L, loc, customer);

        assertTrue(updated.getLocationShared());
        assertEquals(12.9716, updated.getLatitude());
        assertEquals(77.5946, updated.getLongitude());
        verify(notificationService).notifyOrderStatusUpdate(any(OrderDto.class));
    }

    @Test
    @DisplayName("Admin order status transitions: PENDING -> ACCEPTED -> PREPARING -> READY -> COMPLETED")
    void testValidStatusTransitions() {
        Order order = new Order();
        order.setId(1L);
        order.setOrderNumber("ORD-001");
        order.setOrderStatus(OrderStatus.PENDING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // PENDING -> ACCEPTED
        orderService.updateOrderStatus(1L, new UpdateOrderStatusRequest(OrderStatus.ACCEPTED, null));
        assertEquals(OrderStatus.ACCEPTED, order.getOrderStatus());

        // ACCEPTED -> PREPARING
        orderService.updateOrderStatus(1L, new UpdateOrderStatusRequest(OrderStatus.PREPARING, null));
        assertEquals(OrderStatus.PREPARING, order.getOrderStatus());

        // PREPARING -> READY
        orderService.updateOrderStatus(1L, new UpdateOrderStatusRequest(OrderStatus.READY, null));
        assertEquals(OrderStatus.READY, order.getOrderStatus());

        // READY -> COMPLETED
        orderService.updateOrderStatus(1L, new UpdateOrderStatusRequest(OrderStatus.COMPLETED, null));
        assertEquals(OrderStatus.COMPLETED, order.getOrderStatus());
    }

    @Test
    @DisplayName("Invalid status transition: COMPLETED -> PENDING should be rejected")
    void testInvalidStatusTransition() {
        Order order = new Order();
        order.setId(1L);
        order.setOrderStatus(OrderStatus.COMPLETED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(BadRequestException.class,
                () -> orderService.updateOrderStatus(1L, new UpdateOrderStatusRequest(OrderStatus.PENDING, null)));
    }
}
