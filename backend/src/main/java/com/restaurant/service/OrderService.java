package com.restaurant.service;

import com.restaurant.dto.*;
import com.restaurant.entity.FoodItem;
import com.restaurant.entity.Order;
import com.restaurant.entity.OrderItem;
import com.restaurant.entity.RestaurantSetting;
import com.restaurant.entity.User;
import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.PaymentMethod;
import com.restaurant.enums.Role;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.exception.RestaurantClosedException;
import com.restaurant.exception.UnauthorizedException;
import com.restaurant.repository.FoodItemRepository;
import com.restaurant.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final FoodItemRepository foodItemRepository;
    private final RestaurantStatusService restaurantStatusService;
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepository,
                        FoodItemRepository foodItemRepository,
                        RestaurantStatusService restaurantStatusService,
                        NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.foodItemRepository = foodItemRepository;
        this.restaurantStatusService = restaurantStatusService;
        this.notificationService = notificationService;
    }

    @Transactional
    public OrderDto placeOrder(PlaceOrderRequest request, User customer) {
        // 1. Backend validation of Restaurant Open/Close status
        RestaurantStatusResponse status = restaurantStatusService.getRestaurantStatus();
        if (!status.isOpen()) {
            throw new RestaurantClosedException("Cannot place order. " + status.getMessage()
                    + (status.getNextOpeningTime() != null ? " Next opening: " + status.getNextOpeningTime() : ""));
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order must contain at least one food item");
        }

        // 2. Fetch food items and compute totals server-side (Never trust frontend prices)
        BigDecimal totalAmount = BigDecimal.ZERO;
        Order order = new Order();
        order.setCustomer(customer);
        order.setCustomerName(customer.getFullName());
        order.setCustomerMobile(customer.getMobileNumber());
        order.setDeliveryAddress(request.getDeliveryAddress().trim());
        order.setPaymentMethod(PaymentMethod.COD);
        order.setOrderStatus(OrderStatus.PENDING);
        order.setLocationShared(false);
        order.setOrderNumber(generateOrderNumber());

        for (CartItemRequest cartItem : request.getItems()) {
            if (cartItem.getQuantity() == null || cartItem.getQuantity() <= 0) {
                throw new BadRequestException("Quantity must be greater than zero");
            }

            FoodItem foodItem = foodItemRepository.findById(cartItem.getFoodItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + cartItem.getFoodItemId()));

            if (!foodItem.getAvailable() || !foodItem.getCategory().getActive()) {
                throw new BadRequestException("Item '" + foodItem.getName() + "' is currently unavailable. Please remove it from your cart.");
            }

            BigDecimal unitPrice = foodItem.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            // Snapshot item details for historical accuracy
            OrderItem orderItem = new OrderItem(
                    foodItem,
                    foodItem.getName(),
                    cartItem.getQuantity(),
                    unitPrice,
                    subtotal
            );
            order.addOrderItem(orderItem);
        }

        // 3. Validate Minimum Order Amount
        RestaurantSetting settings = restaurantStatusService.getOrCreateDefaultSettings();
        if (settings.getMinimumOrderAmount() != null
                && totalAmount.compareTo(settings.getMinimumOrderAmount()) < 0) {
            throw new BadRequestException("Minimum order amount is ₹" + settings.getMinimumOrderAmount()
                    + ". Your current cart total is ₹" + totalAmount);
        }

        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        OrderDto orderDto = new OrderDto(savedOrder);

        // 4. Send real-time notification to admin
        notificationService.notifyAdminNewOrder(orderDto);

        log.info("Order placed successfully: {} by customer: {} (Total: ₹{})",
                savedOrder.getOrderNumber(), customer.getEmail(), totalAmount);

        return orderDto;
    }

    @Transactional
    public OrderDto shareDeliveryLocation(Long orderId, LocationShareRequest request, User customer) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        // Ownership verification
        if (customer.getRole() != Role.ADMIN && !order.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("You are not authorized to update this order");
        }

        // Location sharing is only permitted after order is ACCEPTED by restaurant
        if (order.getOrderStatus() == OrderStatus.PENDING) {
            throw new BadRequestException("Delivery location can only be shared after the restaurant accepts your order.");
        }

        if (order.getOrderStatus() == OrderStatus.REJECTED || order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot share location for an order that is " + order.getOrderStatus());
        }

        order.setLatitude(request.getLatitude());
        order.setLongitude(request.getLongitude());
        order.setLocationShared(true);

        Order savedOrder = orderRepository.save(order);
        OrderDto orderDto = new OrderDto(savedOrder);

        // Notify admin in real time
        notificationService.notifyOrderStatusUpdate(orderDto);

        log.info("Location shared for order: {} (lat: {}, lng: {})",
                order.getOrderNumber(), request.getLatitude(), request.getLongitude());

        return orderDto;
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        OrderStatus currentStatus = order.getOrderStatus();
        OrderStatus nextStatus = request.getStatus();

        if (!currentStatus.canTransitionTo(nextStatus)) {
            throw new BadRequestException("Invalid status transition from " + currentStatus + " to " + nextStatus);
        }

        order.setOrderStatus(nextStatus);
        if (nextStatus == OrderStatus.REJECTED && request.getRejectionReason() != null) {
            order.setRejectionReason(request.getRejectionReason());
        }

        Order savedOrder = orderRepository.save(order);
        OrderDto orderDto = new OrderDto(savedOrder);

        // Notify customer and admin of status change
        notificationService.notifyOrderStatusUpdate(orderDto);

        log.info("Order {} status updated: {} -> {}", order.getOrderNumber(), currentStatus, nextStatus);

        return orderDto;
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getCustomerOrders(User customer) {
        return orderRepository.findByCustomerIdWithItems(customer.getId()).stream()
                .map(OrderDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId, User user) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (user.getRole() != Role.ADMIN && !order.getCustomer().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to view this order");
        }

        return new OrderDto(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getAdminOrders(OrderStatus status, Pageable pageable) {
        Page<Order> orders = (status != null)
                ? orderRepository.findByOrderStatusOrderByCreatedAtDesc(status, pageable)
                : orderRepository.findAllOrdersPaged(pageable);

        return orders.map(OrderDto::new);
    }

    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomPart = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "ORD-" + datePart + "-" + randomPart;
    }
}
