package com.restaurant.repository;

import com.restaurant.entity.RestaurantSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RestaurantSettingRepository extends JpaRepository<RestaurantSetting, Long> {
    Optional<RestaurantSetting> findFirstByOrderByIdAsc();
}
