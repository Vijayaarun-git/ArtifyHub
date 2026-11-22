package com.example.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.dao.DataIntegrityViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

        private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

        @ExceptionHandler(BusinessValidationException.class)
        public ResponseEntity<Map<String, String>> handleBusinessValidationException(
                        BusinessValidationException ex) {

                Map<String, String> response = new HashMap<>();
                response.put("message", ex.getMessage());

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(response);
        }

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<Map<String, String>> handleResourceNotFoundException(
                        ResourceNotFoundException ex) {

                Map<String, String> response = new HashMap<>();
                response.put("message", ex.getMessage());

                return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .body(response);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, String>> handleValidationException(
                        MethodArgumentNotValidException ex) {

                String message = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .map(FieldError::getField)
                                .map(field -> {
                                        FieldError error = ex.getBindingResult()
                                                        .getFieldError(field);
                                        return field + ": " + error.getDefaultMessage();
                                })
                                .collect(Collectors.joining(", "));

                Map<String, String> response = new HashMap<>();
                response.put("message", message);

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(response);
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<Map<String, String>> handleAccessDenied(
                        AccessDeniedException ex) {

                Map<String, String> response = new HashMap<>();
                response.put("message", "Access Denied");

                return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(response);
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(
                        DataIntegrityViolationException ex) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "This operation conflicts with existing data");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, String>> handleGenericException(
                        Exception ex) {

                log.error("Unhandled application exception", ex);
                Map<String, String> response = new HashMap<>();
                response.put(
                                "message",
                                "An unexpected error occurred");

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(response);
        }

}