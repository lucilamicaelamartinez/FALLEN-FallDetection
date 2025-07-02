package com.example.fallen.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.MediaType;

import java.util.Map;

@Service
public class ExpoPushService {

    private static final Logger log = LoggerFactory.getLogger(ExpoPushService.class);

    private final WebClient webClient;

    public ExpoPushService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://exp.host/--/api/v2/push/send")
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Accept-Encoding", "gzip, deflate")
                .build();
    }

    /**
     * Sends a push notification using Expo's push API.
     *
     * @param expoPushToken the push token of the recipient (starts with "ExpoPushToken[...]")
     * @param title         title of the notification
     * @param message       body of the notification
     */
    public void sendPush(String expoPushToken, String title, String message) {
        Map<String, Object> payload = Map.of(
                "to", expoPushToken,
                "title", title,
                "body", message,
                "sound", "default"
        );

        log.info("📤 Enviando notificación a {}", expoPushToken);  // 👈 NUEVO LOG

        webClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(String.class)
                .doOnNext(response -> log.info("Expo response: {}", response))
                .doOnError(error -> log.error("Expo push failed: {}", error.getMessage()))
                .subscribe(); // Asynchronous, non-blocking
    }
}

