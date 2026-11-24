package com.restaurant.enums;

import java.util.EnumSet;
import java.util.Set;

public enum OrderStatus {
    PENDING,
    ACCEPTED,
    REJECTED,
    PREPARING,
    READY,
    COMPLETED,
    CANCELLED;

    public boolean canTransitionTo(OrderStatus nextStatus) {
        if (this == nextStatus) {
            return true;
        }
        return switch (this) {
            case PENDING -> EnumSet.of(ACCEPTED, REJECTED, CANCELLED).contains(nextStatus);
            case ACCEPTED -> EnumSet.of(PREPARING, CANCELLED).contains(nextStatus);
            case PREPARING -> EnumSet.of(READY, CANCELLED).contains(nextStatus);
            case READY -> EnumSet.of(COMPLETED, CANCELLED).contains(nextStatus);
            case REJECTED, COMPLETED, CANCELLED -> false;
        };
    }
}
