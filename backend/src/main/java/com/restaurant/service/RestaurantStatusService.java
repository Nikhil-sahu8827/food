package com.restaurant.service;

import com.restaurant.dto.RestaurantStatusResponse;
import com.restaurant.entity.RestaurantHoliday;
import com.restaurant.entity.RestaurantSchedule;
import com.restaurant.entity.RestaurantSetting;
import com.restaurant.enums.ManualOverride;
import com.restaurant.repository.RestaurantHolidayRepository;
import com.restaurant.repository.RestaurantScheduleRepository;
import com.restaurant.repository.RestaurantSettingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class RestaurantStatusService {

    private static final Logger log = LoggerFactory.getLogger(RestaurantStatusService.class);

    private final RestaurantSettingRepository settingRepository;
    private final RestaurantScheduleRepository scheduleRepository;
    private final RestaurantHolidayRepository holidayRepository;

    @Value("${app.delivery.restaurant-latitude:12.9716}")
    private double restaurantLatitude;

    @Value("${app.delivery.restaurant-longitude:77.6412}")
    private double restaurantLongitude;

    @Value("${app.delivery.max-radius-km:2.5}")
    private double maxDeliveryRadiusKm;

    public RestaurantStatusService(RestaurantSettingRepository settingRepository,
                                   RestaurantScheduleRepository scheduleRepository,
                                   RestaurantHolidayRepository holidayRepository) {
        this.settingRepository = settingRepository;
        this.scheduleRepository = scheduleRepository;
        this.holidayRepository = holidayRepository;
    }

    @Transactional
    public RestaurantStatusResponse getRestaurantStatus() {
        RestaurantSetting settings = getOrCreateDefaultSettings();
        ZoneId zoneId = ZoneId.of(settings.getTimezone() != null ? settings.getTimezone() : "Asia/Kolkata");
        ZonedDateTime now = ZonedDateTime.now(zoneId);

        RestaurantStatusResponse response = new RestaurantStatusResponse();
        response.setTimezone(settings.getTimezone());
        response.setMinimumOrderAmount(settings.getMinimumOrderAmount());
        response.setWhatsappNumber(settings.getWhatsappNumber());
        response.setRestaurantName(settings.getRestaurantName());
        response.setRestaurantAddress(settings.getRestaurantAddress());
        response.setRestaurantLatitude(restaurantLatitude);
        response.setRestaurantLongitude(restaurantLongitude);
        response.setMaxDeliveryRadiusKm(maxDeliveryRadiusKm);
        response.setManualOverride(settings.getManualOverride());

        // 1. Check Manual Override
        if (settings.getManualOverride() == ManualOverride.FORCE_OPEN) {
            if (settings.getOverrideExpiry() != null && Instant.now().isAfter(settings.getOverrideExpiry())) {
                log.info("Manual FORCE_OPEN override expired. Reverting to AUTO.");
                settings.setManualOverride(ManualOverride.AUTO);
                settings.setOverrideExpiry(null);
                settingRepository.save(settings);
            } else {
                response.setOpen(true);
                response.setMessage("Restaurant is open (manual management override)");
                return response;
            }
        } else if (settings.getManualOverride() == ManualOverride.FORCE_CLOSED) {
            if (settings.getOverrideExpiry() != null && Instant.now().isAfter(settings.getOverrideExpiry())) {
                log.info("Manual FORCE_CLOSED override expired. Reverting to AUTO.");
                settings.setManualOverride(ManualOverride.AUTO);
                settings.setOverrideExpiry(null);
                settingRepository.save(settings);
            } else {
                response.setOpen(false);
                response.setMessage("Restaurant is temporarily closed by management");
                response.setNextOpeningTime(findNextOpeningTime(now, zoneId));
                return response;
            }
        }

        // 2. Check Midnight Crossing from Yesterday's Shift
        DayOfWeek yesterdayDay = now.minusDays(1).getDayOfWeek();
        Optional<RestaurantSchedule> yesterdayScheduleOpt = scheduleRepository.findByDayOfWeek(yesterdayDay);
        if (yesterdayScheduleOpt.isPresent()) {
            RestaurantSchedule ySched = yesterdayScheduleOpt.get();
            if (!ySched.getClosed() && crossesMidnight(ySched.getOpeningTime(), ySched.getClosingTime())) {
                if (now.toLocalTime().isBefore(ySched.getClosingTime())) {
                    response.setOpen(true);
                    response.setMessage("Restaurant is open (night shift closing at " + formatTime(ySched.getClosingTime()) + ")");
                    response.setOpeningTime(ySched.getOpeningTime());
                    response.setClosingTime(ySched.getClosingTime());
                    return response;
                }
            }
        }

        // 3. Check Today's Holiday
        LocalDate todayDate = now.toLocalDate();
        Optional<RestaurantHoliday> holidayOpt = holidayRepository.findByHolidayDate(todayDate);
        if (holidayOpt.isPresent()) {
            response.setOpen(false);
            response.setMessage("Restaurant is closed today for holiday: " + holidayOpt.get().getDescription());
            response.setNextOpeningTime(findNextOpeningTime(now, zoneId));
            return response;
        }

        // 4. Check Today's Regular Schedule
        DayOfWeek todayDay = now.getDayOfWeek();
        Optional<RestaurantSchedule> todayScheduleOpt = scheduleRepository.findByDayOfWeek(todayDay);
        if (todayScheduleOpt.isEmpty() || todayScheduleOpt.get().getClosed()) {
            response.setOpen(false);
            response.setMessage("Restaurant is closed today (" + todayDay.name() + ")");
            response.setNextOpeningTime(findNextOpeningTime(now, zoneId));
            return response;
        }

        RestaurantSchedule todaySchedule = todayScheduleOpt.get();
        LocalTime openTime = todaySchedule.getOpeningTime();
        LocalTime closeTime = todaySchedule.getClosingTime();
        LocalTime currentTime = now.toLocalTime();

        response.setOpeningTime(openTime);
        response.setClosingTime(closeTime);

        boolean isOpen;
        if (crossesMidnight(openTime, closeTime)) {
            // e.g. 12:00 PM to 01:00 AM -> open if currentTime >= 12:00 PM
            isOpen = !currentTime.isBefore(openTime);
        } else {
            // Normal schedule: e.g. 11:00 AM to 11:00 PM
            isOpen = (!currentTime.isBefore(openTime)) && currentTime.isBefore(closeTime);
        }

        response.setOpen(isOpen);
        if (isOpen) {
            response.setMessage("Restaurant is open now until " + formatTime(closeTime));
        } else {
            response.setMessage("Restaurant is currently closed. Working hours today: "
                    + formatTime(openTime) + " - " + formatTime(closeTime));
            response.setNextOpeningTime(findNextOpeningTime(now, zoneId));
        }

        return response;
    }

    public boolean isCurrentlyOpen() {
        return getRestaurantStatus().isOpen();
    }

    private boolean crossesMidnight(LocalTime openTime, LocalTime closeTime) {
        return !closeTime.isAfter(openTime);
    }

    private String findNextOpeningTime(ZonedDateTime now, ZoneId zoneId) {
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("EEEE, MMM d 'at' hh:mm a");

        // Check later today
        DayOfWeek todayDay = now.getDayOfWeek();
        Optional<RestaurantSchedule> todaySchedule = scheduleRepository.findByDayOfWeek(todayDay);
        if (todaySchedule.isPresent() && !todaySchedule.get().getClosed()
                && !holidayRepository.existsByHolidayDate(now.toLocalDate())) {
            LocalTime openTime = todaySchedule.get().getOpeningTime();
            if (now.toLocalTime().isBefore(openTime)) {
                return "Today at " + openTime.format(timeFormatter);
            }
        }

        // Check upcoming 7 days
        for (int i = 1; i <= 7; i++) {
            ZonedDateTime nextDay = now.plusDays(i);
            LocalDate date = nextDay.toLocalDate();
            if (holidayRepository.existsByHolidayDate(date)) {
                continue;
            }
            Optional<RestaurantSchedule> schedule = scheduleRepository.findByDayOfWeek(nextDay.getDayOfWeek());
            if (schedule.isPresent() && !schedule.get().getClosed()) {
                ZonedDateTime nextOpenZdt = ZonedDateTime.of(date, schedule.get().getOpeningTime(), zoneId);
                return nextOpenZdt.format(dateTimeFormatter);
            }
        }

        return "Please contact restaurant for upcoming hours";
    }

    private String formatTime(LocalTime time) {
        if (time == null) return "";
        return time.format(DateTimeFormatter.ofPattern("hh:mm a"));
    }

    @Transactional
    public RestaurantSetting getOrCreateDefaultSettings() {
        return settingRepository.findFirstByOrderByIdAsc().orElseGet(() -> {
            RestaurantSetting defaultSetting = new RestaurantSetting();
            defaultSetting.setRestaurantName("Royal Spice Kitchen");
            defaultSetting.setRestaurantAddress("88 Gourmet Boulevard, Indiranagar, Bengaluru, Karnataka 560038");
            defaultSetting.setWhatsappNumber("919876543210");
            defaultSetting.setTimezone("Asia/Kolkata");
            defaultSetting.setMinimumOrderAmount(new java.math.BigDecimal("150.00"));
            defaultSetting.setManualOverride(ManualOverride.AUTO);
            return settingRepository.save(defaultSetting);
        });
    }
}
