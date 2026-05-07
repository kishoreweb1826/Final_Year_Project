package com.organicfarm.backend.exception;

public class OtpSendException extends RuntimeException {
    public OtpSendException(String message) {
        super(message);
    }

    public OtpSendException(String message, Throwable cause) {
        super(message, cause);
    }
}
