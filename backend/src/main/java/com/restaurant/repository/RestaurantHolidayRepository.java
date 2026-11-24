package com.restaurant.repository;

import com.restaurant.entity.RestaurantHoliday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantHolidayRepository extends JpaRepository<RestaurantHoliday, Long> {
    Optional<RestaurantHoliday> findByHolidayDate(LocalDate holidayDate);
    boolean existsByHolidayDate(LocalDate holidayDate);
    List<RestaurantHoliday> findByHolidayDateGreaterThanEqualOrderByHolidayDateAsc(LocalDate fromDate);
}
