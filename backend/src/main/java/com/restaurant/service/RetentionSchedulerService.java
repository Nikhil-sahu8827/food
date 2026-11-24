package com.restaurant.service;

import com.restaurant.entity.Order;
import com.restaurant.entity.OrderArchive;
import com.restaurant.entity.OrderItem;
import com.restaurant.entity.OrderItemArchive;
import com.restaurant.enums.OrderStatus;
import com.restaurant.repository.OrderArchiveRepository;
import com.restaurant.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

@Service
public class RetentionSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(RetentionSchedulerService.class);

    private final OrderRepository orderRepository;
    private final OrderArchiveRepository orderArchiveRepository;

    @Value("${app.retention.days:30}")
    private int retentionDays;

    public RetentionSchedulerService(OrderRepository orderRepository,
                                    OrderArchiveRepository orderArchiveRepository) {
        this.orderRepository = orderRepository;
        this.orderArchiveRepository = orderArchiveRepository;
    }

    /**
     * Daily scheduled retention cleanup job.
     * Identifies completed, cancelled, or rejected orders older than the retention threshold (30 days),
     * archives them with line-item snapshots into order_archive and order_item_archive,
     * and deletes them from active operational tables to maintain low database footprint (< 500MB).
     */
    @Scheduled(cron = "${app.retention.cron:0 0 3 * * *}")
    @Transactional
    public void scheduledRetentionJob() {
        log.info("Starting scheduled 30-day order retention and archival cleanup job...");
        int archivedCount = runRetentionCleanup();
        log.info("Retention job completed successfully. Total archived and purged orders: {}", archivedCount);
    }

    @Transactional
    public int runRetentionCleanup() {
        Instant cutoffTime = Instant.now().minus(retentionDays, ChronoUnit.DAYS);
        // Exclude pending, accepted, preparing, or ready orders! Only purge terminal orders.
        List<OrderStatus> terminalStatuses = Arrays.asList(
                OrderStatus.COMPLETED,
                OrderStatus.CANCELLED,
                OrderStatus.REJECTED
        );

        List<Order> eligibleOrders = orderRepository.findOrdersEligibleForRetention(terminalStatuses, cutoffTime);

        if (eligibleOrders.isEmpty()) {
            log.info("No orders older than {} days eligible for archival.", retentionDays);
            return 0;
        }

        log.info("Found {} orders older than {} days eligible for retention archival. Archiving...",
                eligibleOrders.size(), retentionDays);

        int count = 0;
        for (Order order : eligibleOrders) {
            // 1. Create Archive Order Record
            OrderArchive archive = new OrderArchive();
            archive.setId(order.getId());
            archive.setOrderNumber(order.getOrderNumber());
            if (order.getCustomer() != null) {
                archive.setCustomerId(order.getCustomer().getId());
            }
            archive.setCustomerName(order.getCustomerName());
            archive.setCustomerMobile(order.getCustomerMobile());
            archive.setTotalAmount(order.getTotalAmount());
            archive.setPaymentMethod(order.getPaymentMethod().name());
            archive.setOrderStatus(order.getOrderStatus().name());
            archive.setDeliveryAddress(order.getDeliveryAddress());
            archive.setLatitude(order.getLatitude());
            archive.setLongitude(order.getLongitude());
            archive.setRejectionReason(order.getRejectionReason());
            archive.setOriginalCreatedAt(order.getCreatedAt());
            archive.setArchivedAt(Instant.now());

            // 2. Archive associated Order Items
            if (order.getOrderItems() != null) {
                for (OrderItem item : order.getOrderItems()) {
                    OrderItemArchive itemArchive = new OrderItemArchive();
                    itemArchive.setId(item.getId());
                    itemArchive.setOrderArchive(archive);
                    itemArchive.setFoodName(item.getFoodName());
                    itemArchive.setQuantity(item.getQuantity());
                    itemArchive.setUnitPrice(item.getUnitPrice());
                    itemArchive.setSubtotal(item.getSubtotal());
                    archive.getOrderItemArchives().add(itemArchive);
                }
            }

            orderArchiveRepository.save(archive);

            // 3. Remove from active order table (cascade deletes active order_items)
            orderRepository.delete(order);
            count++;
        }

        return count;
    }
}
