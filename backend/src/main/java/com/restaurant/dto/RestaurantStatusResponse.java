package com.restaurant.dto;

import com.restaurant.enums.ManualOverride;
import java.math.BigDecimal;
import java.time.LocalTime;

public class RestaurantStatusResponse {
    private boolean open;
    private String message;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private String nextOpeningTime;
    private String timezone;
    private ManualOverride manualOverride;
    private BigDecimal minimumOrderAmount;
    private String whatsappNumber;
    private String restaurantName;
    private String restaurantAddress;
    private Double restaurantLatitude;
    private Double restaurantLongitude;
    private Double maxDeliveryRadiusKm;

    public RestaurantStatusResponse() {}

    public boolean isOpen() { return open; }
    public void setOpen(boolean open) { this.open = open; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalTime getOpeningTime() { return openingTime; }
    public void setOpeningTime(LocalTime openingTime) { this.openingTime = openingTime; }

    public LocalTime getClosingTime() { return closingTime; }
    public void setClosingTime(LocalTime closingTime) { this.closingTime = closingTime; }

    public String getNextOpeningTime() { return nextOpeningTime; }
    public void setNextOpeningTime(String nextOpeningTime) { this.nextOpeningTime = nextOpeningTime; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public ManualOverride getManualOverride() { return manualOverride; }
    public void setManualOverride(ManualOverride manualOverride) { this.manualOverride = manualOverride; }

    public BigDecimal getMinimumOrderAmount() { return minimumOrderAmount; }
    public void setMinimumOrderAmount(BigDecimal minimumOrderAmount) { this.minimumOrderAmount = minimumOrderAmount; }

    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public String getRestaurantAddress() { return restaurantAddress; }
    public void setRestaurantAddress(String restaurantAddress) { this.restaurantAddress = restaurantAddress; }

    public Double getRestaurantLatitude() { return restaurantLatitude; }
    public void setRestaurantLatitude(Double restaurantLatitude) { this.restaurantLatitude = restaurantLatitude; }

    public Double getRestaurantLongitude() { return restaurantLongitude; }
    public void setRestaurantLongitude(Double restaurantLongitude) { this.restaurantLongitude = restaurantLongitude; }

    public Double getMaxDeliveryRadiusKm() { return maxDeliveryRadiusKm; }
    public void setMaxDeliveryRadiusKm(Double maxDeliveryRadiusKm) { this.maxDeliveryRadiusKm = maxDeliveryRadiusKm; }
}
