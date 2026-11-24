package com.restaurant.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "order_archive")
public class OrderArchive {

    @Id
    private Long id;

    @Column(name = "order_number", nullable = false, length = 50)
    private String orderNumber;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "customer_name", length = 100)
    private String customerName;

    @Column(name = "customer_mobile", length = 20)
    private String customerMobile;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "payment_method", length = 20)
    private String paymentMethod;

    @Column(name = "order_status", length = 20)
    private String orderStatus;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    private Double latitude;
    private Double longitude;

    @Column(name = "rejection_reason", length = 255)
    private String rejectionReason;

    @Column(name = "archived_at", nullable = false)
    private Instant archivedAt = Instant.now();

    @Column(name = "original_created_at", nullable = false)
    private Instant originalCreatedAt;

    @OneToMany(mappedBy = "orderArchive", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItemArchive> orderItemArchives = new ArrayList<>();

    public OrderArchive() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerMobile() { return customerMobile; }
    public void setCustomerMobile(String customerMobile) { this.customerMobile = customerMobile; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Instant getArchivedAt() { return archivedAt; }
    public void setArchivedAt(Instant archivedAt) { this.archivedAt = archivedAt; }

    public Instant getOriginalCreatedAt() { return originalCreatedAt; }
    public void setOriginalCreatedAt(Instant originalCreatedAt) { this.originalCreatedAt = originalCreatedAt; }

    public List<OrderItemArchive> getOrderItemArchives() { return orderItemArchives; }
    public void setOrderItemArchives(List<OrderItemArchive> orderItemArchives) { this.orderItemArchives = orderItemArchives; }
}
