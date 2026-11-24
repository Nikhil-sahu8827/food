package com.restaurant.controller;

import com.restaurant.dto.HolidayRequest;
import com.restaurant.dto.RestaurantScheduleDto;
import com.restaurant.dto.RestaurantSettingsUpdateRequest;
import com.restaurant.dto.RestaurantStatusResponse;
import com.restaurant.entity.RestaurantHoliday;
import com.restaurant.entity.RestaurantSchedule;
import com.restaurant.entity.RestaurantSetting;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.RestaurantHolidayRepository;
import com.restaurant.repository.RestaurantScheduleRepository;
import com.restaurant.repository.RestaurantSettingRepository;
import com.restaurant.service.RestaurantStatusService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class RestaurantController {

    private final RestaurantStatusService restaurantStatusService;
    private final RestaurantSettingRepository settingRepository;
    private final RestaurantScheduleRepository scheduleRepository;
    private final RestaurantHolidayRepository holidayRepository;

    public RestaurantController(RestaurantStatusService restaurantStatusService,
                                RestaurantSettingRepository settingRepository,
                                RestaurantScheduleRepository scheduleRepository,
                                RestaurantHolidayRepository holidayRepository) {
        this.restaurantStatusService = restaurantStatusService;
        this.settingRepository = settingRepository;
        this.scheduleRepository = scheduleRepository;
        this.holidayRepository = holidayRepository;
    }

    // Public
    @GetMapping("/restaurant/status")
    public ResponseEntity<RestaurantStatusResponse> getStatus() {
        return ResponseEntity.ok(restaurantStatusService.getRestaurantStatus());
    }

    @GetMapping("/restaurant/settings")
    public ResponseEntity<RestaurantSetting> getPublicSettings() {
        return ResponseEntity.ok(restaurantStatusService.getOrCreateDefaultSettings());
    }

    // Admin Settings
    @PutMapping("/admin/restaurant/settings")
    public ResponseEntity<RestaurantSetting> updateSettings(@Valid @RequestBody RestaurantSettingsUpdateRequest request) {
        RestaurantSetting settings = restaurantStatusService.getOrCreateDefaultSettings();
        settings.setRestaurantName(request.getRestaurantName().trim());
        settings.setRestaurantAddress(request.getRestaurantAddress().trim());
        settings.setWhatsappNumber(request.getWhatsappNumber().trim());
        settings.setTimezone(request.getTimezone().trim());
        settings.setMinimumOrderAmount(request.getMinimumOrderAmount());
        settings.setManualOverride(request.getManualOverride());

        if (request.getOverrideExpiryMinutes() != null && request.getOverrideExpiryMinutes() > 0) {
            settings.setOverrideExpiry(Instant.now().plus(request.getOverrideExpiryMinutes(), ChronoUnit.MINUTES));
        } else {
            settings.setOverrideExpiry(null);
        }

        RestaurantSetting updated = settingRepository.save(settings);
        return ResponseEntity.ok(updated);
    }

    // Weekly Schedule
    @GetMapping("/admin/restaurant/schedule")
    public ResponseEntity<List<RestaurantScheduleDto>> getWeeklySchedule() {
        List<RestaurantScheduleDto> list = scheduleRepository.findAllByOrderByIdAsc().stream()
                .map(RestaurantScheduleDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PutMapping("/admin/restaurant/schedule")
    public ResponseEntity<List<RestaurantScheduleDto>> updateWeeklySchedule(@Valid @RequestBody List<RestaurantScheduleDto> scheduleList) {
        for (RestaurantScheduleDto dto : scheduleList) {
            RestaurantSchedule schedule = scheduleRepository.findByDayOfWeek(dto.getDayOfWeek())
                    .orElse(new RestaurantSchedule());
            schedule.setDayOfWeek(dto.getDayOfWeek());
            schedule.setOpeningTime(dto.getOpeningTime());
            schedule.setClosingTime(dto.getClosingTime());
            schedule.setClosed(dto.getClosed() != null ? dto.getClosed() : false);
            scheduleRepository.save(schedule);
        }
        return getWeeklySchedule();
    }

    // Holidays
    @GetMapping("/admin/restaurant/holidays")
    public ResponseEntity<List<RestaurantHoliday>> getUpcomingHolidays() {
        List<RestaurantHoliday> holidays = holidayRepository.findByHolidayDateGreaterThanEqualOrderByHolidayDateAsc(LocalDate.now());
        return ResponseEntity.ok(holidays);
    }

    @PostMapping("/admin/restaurant/holidays")
    public ResponseEntity<RestaurantHoliday> addHoliday(@Valid @RequestBody HolidayRequest request) {
        if (holidayRepository.existsByHolidayDate(request.getHolidayDate())) {
            throw new BadRequestException("Holiday for date " + request.getHolidayDate() + " already exists");
        }
        RestaurantHoliday holiday = new RestaurantHoliday(request.getHolidayDate(), request.getDescription());
        RestaurantHoliday saved = holidayRepository.save(holiday);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/restaurant/holidays/{id}")
    public ResponseEntity<Map<String, String>> deleteHoliday(@PathVariable Long id) {
        RestaurantHoliday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with ID: " + id));
        holidayRepository.delete(holiday);
        return ResponseEntity.ok(Collections.singletonMap("message", "Holiday removed successfully"));
    }
}
