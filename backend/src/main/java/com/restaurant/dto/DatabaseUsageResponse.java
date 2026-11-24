package com.restaurant.dto;

public class DatabaseUsageResponse {
    private long databaseSizeBytes;
    private double databaseSizeMB;
    private double storageLimitMB = 500.0;
    private double percentageUsed;
    private long totalActiveOrders;
    private long totalActiveOrderItems;
    private long totalArchivedOrders;
    private int retentionDays = 30;
    private String healthStatus;
    private String recommendation;

    public DatabaseUsageResponse() {}

    public long getDatabaseSizeBytes() { return databaseSizeBytes; }
    public void setDatabaseSizeBytes(long databaseSizeBytes) { this.databaseSizeBytes = databaseSizeBytes; }

    public double getDatabaseSizeMB() { return databaseSizeMB; }
    public void setDatabaseSizeMB(double databaseSizeMB) { this.databaseSizeMB = databaseSizeMB; }

    public double getStorageLimitMB() { return storageLimitMB; }
    public void setStorageLimitMB(double storageLimitMB) { this.storageLimitMB = storageLimitMB; }

    public double getPercentageUsed() { return percentageUsed; }
    public void setPercentageUsed(double percentageUsed) { this.percentageUsed = percentageUsed; }

    public long getTotalActiveOrders() { return totalActiveOrders; }
    public void setTotalActiveOrders(long totalActiveOrders) { this.totalActiveOrders = totalActiveOrders; }

    public long getTotalActiveOrderItems() { return totalActiveOrderItems; }
    public void setTotalActiveOrderItems(long totalActiveOrderItems) { this.totalActiveOrderItems = totalActiveOrderItems; }

    public long getTotalArchivedOrders() { return totalArchivedOrders; }
    public void setTotalArchivedOrders(long totalArchivedOrders) { this.totalArchivedOrders = totalArchivedOrders; }

    public int getRetentionDays() { return retentionDays; }
    public void setRetentionDays(int retentionDays) { this.retentionDays = retentionDays; }

    public String getHealthStatus() { return healthStatus; }
    public void setHealthStatus(String healthStatus) { this.healthStatus = healthStatus; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
}
