package com.restaurant.dto;

import com.restaurant.entity.OrderItem;
import java.math.BigDecimal;

public class OrderItemDto {
    private Long id;
    private Long foodItemId;
    private String foodName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;

    public OrderItemDto() {}

    public OrderItemDto(OrderItem item) {
        this.id = item.getId();
        if (item.getFoodItem() != null) {
            this.foodItemId = item.getFoodItem().getId();
        }
        this.foodName = item.getFoodName();
        this.quantity = item.getQuantity();
        this.unitPrice = item.getUnitPrice();
        this.subtotal = item.getSubtotal();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFoodItemId() { return foodItemId; }
    public void setFoodItemId(Long foodItemId) { this.foodItemId = foodItemId; }

    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}
