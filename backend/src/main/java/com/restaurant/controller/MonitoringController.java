package com.restaurant.controller;

import com.restaurant.dto.DashboardStatisticsResponse;
import com.restaurant.dto.DatabaseUsageResponse;
import com.restaurant.service.MonitoringService;
import com.restaurant.service.RetentionSchedulerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class MonitoringController {

    private final MonitoringService monitoringService;
    private final RetentionSchedulerService retentionSchedulerService;

    public MonitoringController(MonitoringService monitoringService,
                                RetentionSchedulerService retentionSchedulerService) {
        this.monitoringService = monitoringService;
        this.retentionSchedulerService = retentionSchedulerService;
    }

    @GetMapping("/dashboard/statistics")
    public ResponseEntity<DashboardStatisticsResponse> getDashboardStatistics() {
        DashboardStatisticsResponse stats = monitoringService.getDashboardStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/monitoring/database-usage")
    public ResponseEntity<DatabaseUsageResponse> getDatabaseUsage() {
        DatabaseUsageResponse usage = monitoringService.getDatabaseUsage();
        return ResponseEntity.ok(usage);
    }

    @PostMapping("/monitoring/retention-cleanup")
    public ResponseEntity<Map<String, Object>> triggerRetentionCleanup() {
        int archivedCount = retentionSchedulerService.runRetentionCleanup();
        return ResponseEntity.ok(Map.of(
                "message", "Retention cleanup executed successfully",
                "archivedOrdersCount", archivedCount
        ));
    }
}
