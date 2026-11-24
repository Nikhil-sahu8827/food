package com.restaurant.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class HolidayRequest {

    @NotNull(message = "Holiday date is required")
    private LocalDate holidayDate;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    public HolidayRequest() {}

    public HolidayRequest(LocalDate holidayDate, String description) {
        this.holidayDate = holidayDate;
        this.description = description;
    }

    public LocalDate getHolidayDate() { return holidayDate; }
    public void setHolidayDate(LocalDate holidayDate) { this.holidayDate = holidayDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
