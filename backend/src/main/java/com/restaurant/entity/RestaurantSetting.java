package com.restaurant.entity;

import com.restaurant.enums.ManualOverride;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "restaurant_settings")
public class RestaurantSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "restaurant_name", nullable = false, length = 150)
    private String restaurantName;

    @Column(name = "restaurant_address", nullable = false, columnDefinition = "TEXT")
    private String restaurantAddress;

    @Column(name = "whatsapp_number", nullable = false, length = 30)
    private String whatsappNumber;

    @Column(nullable = false, length = 50)
    private String timezone = "Asia/Kolkata";

    @Column(name = "minimum_order_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal minimumOrderAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "manual_override", nullable = false, length = 20)
    private ManualOverride manualOverride = ManualOverride.AUTO;

    @Column(name = "override_expiry")
    private Instant overrideExpiry;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public RestaurantSetting() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public String getRestaurantAddress() { return restaurantAddress; }
    public void setRestaurantAddress(String restaurantAddress) { this.restaurantAddress = restaurantAddress; }

    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public BigDecimal getMinimumOrderAmount() { return minimumOrderAmount; }
    public void setMinimumOrderAmount(BigDecimal minimumOrderAmount) { this.minimumOrderAmount = minimumOrderAmount; }

    public ManualOverride getManualOverride() { return manualOverride; }
    public void setManualOverride(ManualOverride manualOverride) { this.manualOverride = manualOverride; }

    public Instant getOverrideExpiry() { return overrideExpiry; }
    public void setOverrideExpiry(Instant overrideExpiry) { this.overrideExpiry = overrideExpiry; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
