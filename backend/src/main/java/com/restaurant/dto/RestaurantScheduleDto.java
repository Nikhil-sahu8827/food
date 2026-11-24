package com.restaurant.dto;

import com.restaurant.entity.RestaurantSchedule;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;

public class RestaurantScheduleDto {
    private Long id;

    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Opening time is required")
    private LocalTime openingTime;

    @NotNull(message = "Closing time is required")
    private LocalTime closingTime;

    private Boolean closed = false;

    public RestaurantScheduleDto() {}

    public RestaurantScheduleDto(RestaurantSchedule schedule) {
        this.id = schedule.getId();
        this.dayOfWeek = schedule.getDayOfWeek();
        this.openingTime = schedule.getOpeningTime();
        this.closingTime = schedule.getClosingTime();
        this.closed = schedule.getClosed();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DayOfWeek getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public LocalTime getOpeningTime() { return openingTime; }
    public void setOpeningTime(LocalTime openingTime) { this.openingTime = openingTime; }

    public LocalTime getClosingTime() { return closingTime; }
    public void setClosingTime(LocalTime closingTime) { this.closingTime = closingTime; }

    public Boolean getClosed() { return closed; }
    public void setClosed(Boolean closed) { this.closed = closed; }
}
