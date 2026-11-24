package com.restaurant.repository;

import com.restaurant.entity.OrderArchive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderArchiveRepository extends JpaRepository<OrderArchive, Long> {
    long count();
}
