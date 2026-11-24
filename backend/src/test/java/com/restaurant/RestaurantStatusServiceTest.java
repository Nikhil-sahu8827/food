package com.restaurant;

import com.restaurant.dto.RestaurantStatusResponse;
import com.restaurant.entity.RestaurantHoliday;
import com.restaurant.entity.RestaurantSchedule;
import com.restaurant.entity.RestaurantSetting;
import com.restaurant.enums.ManualOverride;
import com.restaurant.repository.RestaurantHolidayRepository;
import com.restaurant.repository.RestaurantScheduleRepository;
import com.restaurant.repository.RestaurantSettingRepository;
import com.restaurant.service.RestaurantStatusService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.*;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RestaurantStatusServiceTest {

    @Mock
    private RestaurantSettingRepository settingRepository;

    @Mock
    private RestaurantScheduleRepository scheduleRepository;

    @Mock
    private RestaurantHolidayRepository holidayRepository;

    @InjectMocks
    private RestaurantStatusService statusService;

    private RestaurantSetting testSetting;

    @BeforeEach
    void setUp() {
        testSetting = new RestaurantSetting();
        testSetting.setRestaurantName("Royal Spice Kitchen");
        testSetting.setRestaurantAddress("Indiranagar, Bengaluru");
        testSetting.setWhatsappNumber("919876543210");
        testSetting.setTimezone("Asia/Kolkata");
        testSetting.setMinimumOrderAmount(new BigDecimal("150.00"));
        testSetting.setManualOverride(ManualOverride.AUTO);
    }

    @Test
    @DisplayName("Should return OPEN when manual override is FORCE_OPEN")
    void testForceOpenOverride() {
        testSetting.setManualOverride(ManualOverride.FORCE_OPEN);
        testSetting.setOverrideExpiry(Instant.now().plus(2, java.time.temporal.ChronoUnit.HOURS));
        when(settingRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(testSetting));

        RestaurantStatusResponse response = statusService.getRestaurantStatus();
        assertTrue(response.isOpen());
        assertTrue(response.getMessage().contains("manual management override"));
    }

    @Test
    @DisplayName("Should return CLOSED when manual override is FORCE_CLOSED")
    void testForceClosedOverride() {
        testSetting.setManualOverride(ManualOverride.FORCE_CLOSED);
        testSetting.setOverrideExpiry(Instant.now().plus(2, java.time.temporal.ChronoUnit.HOURS));
        when(settingRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(testSetting));

        RestaurantStatusResponse response = statusService.getRestaurantStatus();
        assertFalse(response.isOpen());
        assertTrue(response.getMessage().contains("temporarily closed by management"));
    }

    @Test
    @DisplayName("Should return CLOSED when today is a registered holiday")
    void testHolidayHandling() {
        when(settingRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(testSetting));
        when(scheduleRepository.findByDayOfWeek(any(DayOfWeek.class))).thenReturn(Optional.of(
                new RestaurantSchedule(DayOfWeek.MONDAY, LocalTime.of(11, 0), LocalTime.of(23, 0), false)
        ));
        when(holidayRepository.findByHolidayDate(any(LocalDate.class))).thenReturn(Optional.of(
                new RestaurantHoliday(LocalDate.now(ZoneId.of("Asia/Kolkata")), "Festival National Holiday")
        ));

        RestaurantStatusResponse response = statusService.getRestaurantStatus();
        assertFalse(response.isOpen());
        assertTrue(response.getMessage().contains("Festival National Holiday"));
    }

    @Test
    @DisplayName("Should return CLOSED when today is marked closed in weekly schedule")
    void testScheduleMarkedClosed() {
        when(settingRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(testSetting));
        when(holidayRepository.findByHolidayDate(any(LocalDate.class))).thenReturn(Optional.empty());
        when(scheduleRepository.findByDayOfWeek(any(DayOfWeek.class))).thenReturn(Optional.of(
                new RestaurantSchedule(DayOfWeek.MONDAY, LocalTime.of(11, 0), LocalTime.of(23, 0), true)
        ));

        RestaurantStatusResponse response = statusService.getRestaurantStatus();
        assertFalse(response.isOpen());
        assertTrue(response.getMessage().contains("closed today"));
    }
}
