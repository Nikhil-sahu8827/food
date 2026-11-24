package com.restaurant.repository;

import com.restaurant.entity.OrderItemArchive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemArchiveRepository extends JpaRepository<OrderItemArchive, Long> {
}
