package com.organicfarm.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a business rule is violated, e.g.:
 * - Cart is empty
 * - Product is out of stock
 * - Promo code is invalid
 * - Duplicate order submission detected
 * - Payment verification fails
 */
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
