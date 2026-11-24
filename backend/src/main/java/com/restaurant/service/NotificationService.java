package com.restaurant.service;

import com.restaurant.dto.OrderDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notifyAdminNewOrder(OrderDto orderDto) {
        log.info("Sending real-time notification to admin for new order: {}", orderDto.getOrderNumber());
        try {
            messagingTemplate.convertAndSend("/topic/admin/orders", orderDto);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification to /topic/admin/orders: {}", e.getMessage());
        }
    }

    public void notifyOrderStatusUpdate(OrderDto orderDto) {
        log.info("Sending order status update notification for order: {} -> {}",
                orderDto.getOrderNumber(), orderDto.getOrderStatus());
        try {
            // Notify admin topic
            messagingTemplate.convertAndSend("/topic/admin/orders", orderDto);
            // Notify customer-specific order topic
            messagingTemplate.convertAndSend("/topic/orders/" + orderDto.getOrderNumber(), orderDto);
            if (orderDto.getCustomerId() != null) {
                messagingTemplate.convertAndSend("/topic/customers/" + orderDto.getCustomerId() + "/orders", orderDto);
            }
        } catch (Exception e) {
            log.error("Failed to send WebSocket status update notification: {}", e.getMessage());
        }
    }
}
