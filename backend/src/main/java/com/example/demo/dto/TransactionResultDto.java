package com.example.demo.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResultDto {

    private Long id;
    private Long artworkId;
    private String artworkTitle;
    private String artworkMediaUrl;
    private BigDecimal transactionAmount;
    private String status;
    private LocalDateTime purchaseDate;

}