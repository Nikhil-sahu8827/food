package com.restaurant.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class PlaceOrderRequest {

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    @NotEmpty(message = "Order must contain at least one food item")
    @Valid
    private List<CartItemRequest> items;

    // Optional client idempotency key to prevent accidental double clicks
    private String clientRequestId;

    // Optional GPS coordinates for 2.5 km delivery radius validation
    private Double latitude;
    private Double longitude;

    public PlaceOrderRequest() {}

    public PlaceOrderRequest(String deliveryAddress, List<CartItemRequest> items) {
        this.deliveryAddress = deliveryAddress;
        this.items = items;
    }

    public PlaceOrderRequest(String deliveryAddress, List<CartItemRequest> items, Double latitude, Double longitude) {
        this.deliveryAddress = deliveryAddress;
        this.items = items;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public List<CartItemRequest> getItems() { return items; }
    public void setItems(List<CartItemRequest> items) { this.items = items; }

    public String getClientRequestId() { return clientRequestId; }
    public void setClientRequestId(String clientRequestId) { this.clientRequestId = clientRequestId; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
