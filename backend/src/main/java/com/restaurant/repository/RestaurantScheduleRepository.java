package com.restaurant.repository;

import com.restaurant.entity.RestaurantSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantScheduleRepository extends JpaRepository<RestaurantSchedule, Long> {
    Optional<RestaurantSchedule> findByDayOfWeek(DayOfWeek dayOfWeek);
    List<RestaurantSchedule> findAllByOrderByIdAsc();
}
