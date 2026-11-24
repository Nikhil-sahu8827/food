package com.restaurant.dto;

import java.math.BigDecimal;

public class DashboardStatisticsResponse {
    private long totalOrdersToday;
    private long pendingOrders;
    private long acceptedOrders;
    private long preparingOrders;
    private long readyOrders;
    private long completedOrders;
    private long rejectedOrders;
    private long cancelledOrders;
    private BigDecimal todaySales;

    public DashboardStatisticsResponse() {
        this.todaySales = BigDecimal.ZERO;
    }

    public long getTotalOrdersToday() { return totalOrdersToday; }
    public void setTotalOrdersToday(long totalOrdersToday) { this.totalOrdersToday = totalOrdersToday; }

    public long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }

    public long getAcceptedOrders() { return acceptedOrders; }
    public void setAcceptedOrders(long acceptedOrders) { this.acceptedOrders = acceptedOrders; }

    public long getPreparingOrders() { return preparingOrders; }
    public void setPreparingOrders(long preparingOrders) { this.preparingOrders = preparingOrders; }

    public long getReadyOrders() { return readyOrders; }
    public void setReadyOrders(long readyOrders) { this.readyOrders = readyOrders; }

    public long getCompletedOrders() { return completedOrders; }
    public void setCompletedOrders(long completedOrders) { this.completedOrders = completedOrders; }

    public long getRejectedOrders() { return rejectedOrders; }
    public void setRejectedOrders(long rejectedOrders) { this.rejectedOrders = rejectedOrders; }

    public long getCancelledOrders() { return cancelledOrders; }
    public void setCancelledOrders(long cancelledOrders) { this.cancelledOrders = cancelledOrders; }

    public BigDecimal getTodaySales() { return todaySales; }
    public void setTodaySales(BigDecimal todaySales) { this.todaySales = todaySales; }
}
