package com.restaurant.dto;

import com.restaurant.entity.FoodCategory;

public class CategoryDto {
    private Long id;
    private String categoryName;
    private String description;
    private Boolean active;
    private Integer displayOrder;
    private int itemCount;

    public CategoryDto() {}

    public CategoryDto(FoodCategory category, int itemCount) {
        this.id = category.getId();
        this.categoryName = category.getCategoryName();
        this.description = category.getDescription();
        this.active = category.getActive();
        this.displayOrder = category.getDisplayOrder();
        this.itemCount = itemCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public int getItemCount() { return itemCount; }
    public void setItemCount(int itemCount) { this.itemCount = itemCount; }
}
