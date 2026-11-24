package com.restaurant.dto;

import com.restaurant.enums.ManualOverride;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class RestaurantSettingsUpdateRequest {

    @NotBlank(message = "Restaurant name is required")
    private String restaurantName;

    @NotBlank(message = "Restaurant address is required")
    private String restaurantAddress;

    @NotBlank(message = "WhatsApp number is required")
    private String whatsappNumber;

    @NotBlank(message = "Timezone is required")
    private String timezone;

    @NotNull(message = "Minimum order amount is required")
    @DecimalMin(value = "0.0", message = "Minimum order amount cannot be negative")
    private BigDecimal minimumOrderAmount;

    @NotNull(message = "Manual override setting is required")
    private ManualOverride manualOverride;

    private Integer overrideExpiryMinutes;

    public RestaurantSettingsUpdateRequest() {}

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

    public Integer getOverrideExpiryMinutes() { return overrideExpiryMinutes; }
    public void setOverrideExpiryMinutes(Integer overrideExpiryMinutes) { this.overrideExpiryMinutes = overrideExpiryMinutes; }
}
