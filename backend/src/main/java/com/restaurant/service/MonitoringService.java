package com.restaurant.service;

import com.restaurant.dto.DashboardStatisticsResponse;
import com.restaurant.dto.DatabaseUsageResponse;
import com.restaurant.entity.RestaurantSetting;
import com.restaurant.enums.OrderStatus;
import com.restaurant.repository.OrderArchiveRepository;
import com.restaurant.repository.OrderItemRepository;
import com.restaurant.repository.OrderRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;

@Service
public class MonitoringService {

    private static final Logger log = LoggerFactory.getLogger(MonitoringService.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderArchiveRepository orderArchiveRepository;
    private final RestaurantStatusService restaurantStatusService;
    private final EntityManager entityManager;

    @Value("${app.retention.days:30}")
    private int retentionDays;

    public MonitoringService(OrderRepository orderRepository,
                             OrderItemRepository orderItemRepository,
                             OrderArchiveRepository orderArchiveRepository,
                             RestaurantStatusService restaurantStatusService,
                             EntityManager entityManager) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderArchiveRepository = orderArchiveRepository;
        this.restaurantStatusService = restaurantStatusService;
        this.entityManager = entityManager;
    }

    @Transactional(readOnly = true)
    public DashboardStatisticsResponse getDashboardStatistics() {
        RestaurantSetting settings = restaurantStatusService.getOrCreateDefaultSettings();
        ZoneId zoneId = ZoneId.of(settings.getTimezone() != null ? settings.getTimezone() : "Asia/Kolkata");

        // Start of today in restaurant's timezone
        ZonedDateTime startOfToday = ZonedDateTime.of(LocalDate.now(zoneId), LocalTime.MIN, zoneId);

        DashboardStatisticsResponse stats = new DashboardStatisticsResponse();
        stats.setTotalOrdersToday(orderRepository.countOrdersSince(startOfToday.toInstant()));

        stats.setPendingOrders(orderRepository.countByOrderStatus(OrderStatus.PENDING));
        stats.setAcceptedOrders(orderRepository.countByOrderStatus(OrderStatus.ACCEPTED));
        stats.setPreparingOrders(orderRepository.countByOrderStatus(OrderStatus.PREPARING));
        stats.setReadyOrders(orderRepository.countByOrderStatus(OrderStatus.READY));
        stats.setCompletedOrders(orderRepository.countByOrderStatus(OrderStatus.COMPLETED));
        stats.setRejectedOrders(orderRepository.countByOrderStatus(OrderStatus.REJECTED));
        stats.setCancelledOrders(orderRepository.countByOrderStatus(OrderStatus.CANCELLED));

        BigDecimal salesToday = orderRepository.sumSalesSince(
                Arrays.asList(OrderStatus.REJECTED, OrderStatus.CANCELLED),
                startOfToday.toInstant()
        );
        stats.setTodaySales(salesToday != null ? salesToday : BigDecimal.ZERO);

        return stats;
    }

    @Transactional(readOnly = true)
    public DatabaseUsageResponse getDatabaseUsage() {
        DatabaseUsageResponse response = new DatabaseUsageResponse();
        long activeOrders = orderRepository.count();
        long activeItems = orderItemRepository.count();
        long archivedOrders = orderArchiveRepository.count();

        response.setTotalActiveOrders(activeOrders);
        response.setTotalActiveOrderItems(activeItems);
        response.setTotalArchivedOrders(archivedOrders);
        response.setRetentionDays(retentionDays);

        long sizeBytes = queryDatabaseSizeBytes(activeOrders, activeItems, archivedOrders);
        double sizeMB = BigDecimal.valueOf((double) sizeBytes / (1024 * 1024))
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();

        response.setDatabaseSizeBytes(sizeBytes);
        response.setDatabaseSizeMB(sizeMB);
        response.setStorageLimitMB(500.0);

        double pct = (sizeMB / 500.0) * 100.0;
        response.setPercentageUsed(BigDecimal.valueOf(pct).setScale(2, RoundingMode.HALF_UP).doubleValue());

        if (pct < 70.0) {
            response.setHealthStatus("HEALTHY");
            response.setRecommendation("Database storage is well within the 500MB Supabase Free limit. 30-day retention keeps data lean.");
        } else if (pct < 85.0) {
            response.setHealthStatus("WARNING");
            response.setRecommendation("Database usage is above 70%. Ensure daily retention job is executing and consider cold storage offload.");
        } else {
            response.setHealthStatus("CRITICAL");
            response.setRecommendation("Database usage is approaching the 500MB limit. Immediate archival export or database upgrade required.");
        }

        return response;
    }

    private long queryDatabaseSizeBytes(long activeOrders, long activeItems, long archivedOrders) {
        try {
            // Attempt PostgreSQL native query
            Query query = entityManager.createNativeQuery("SELECT pg_database_size(current_database())");
            Object result = query.getSingleResult();
            if (result instanceof Number num) {
                return num.longValue();
            }
        } catch (Exception ex) {
            log.debug("Native pg_database_size query not available: {}", ex.getMessage());
        }

        // Realistic calculation for Supabase Free sizing estimate:
        // Base schema + indexes overhead ~ 12MB
        // Active orders ~ 1.5 KB per record
        // Active items ~ 0.8 KB per record
        // Archive ~ 1.2 KB per record
        long baseOverhead = 12L * 1024 * 1024;
        long ordersBytes = activeOrders * 1536L;
        long itemsBytes = activeItems * 800L;
        long archiveBytes = archivedOrders * 1200L;

        return baseOverhead + ordersBytes + itemsBytes + archiveBytes;
    }
}
