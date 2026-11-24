package com.restaurant.repository;

import com.restaurant.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    @Query("SELECT f FROM FoodItem f JOIN FETCH f.category c WHERE f.available = true AND c.active = true ORDER BY c.displayOrder ASC, f.name ASC")
    List<FoodItem> findAllAvailableWithCategory();

    @Query("SELECT f FROM FoodItem f JOIN FETCH f.category c ORDER BY c.displayOrder ASC, f.name ASC")
    List<FoodItem> findAllWithCategory();

    @Query("SELECT f FROM FoodItem f JOIN FETCH f.category c WHERE f.category.id = :categoryId AND f.available = true")
    List<FoodItem> findByCategoryIdAndAvailableTrue(@Param("categoryId") Long categoryId);

    @Query("SELECT f FROM FoodItem f JOIN FETCH f.category c WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(f.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<FoodItem> searchByNameOrDescription(@Param("query") String query);

    long countByAvailableTrue();
}
