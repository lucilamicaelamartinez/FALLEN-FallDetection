package com.example.fallen.services;

import com.example.fallen.models.FallEvent;
import com.example.fallen.models.User;
import com.example.fallen.repositories.FallEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FallEventService {

    private static final Logger log = LoggerFactory.getLogger(FallEventService.class);

    @Autowired private FallEventRepository fallEventRepository;
    @Autowired private UserService userService;
    @Autowired private ExpoPushService expoPushService;

    public FallEvent registerFallEvent(User user, LocalDateTime timestamp, String location, String screenshotUri) {
        FallEvent ev = new FallEvent();
        ev.setUser(user);
        ev.setTimestamp(timestamp);
        ev.setLocation(location);
        ev.setScreenshotUri(screenshotUri);
        ev = fallEventRepository.save(ev);

        // 🔔 La notificación se envía desde el frontend

        return ev;
    }

    public FallEvent getEventById(Long id) {
        return fallEventRepository.findById(id).orElse(null);
    }

    public List<FallEvent> getEventsByUser(User user) {
        return fallEventRepository.findByUser(user);
    }

    public List<FallEvent> getEventsByUsers(List<User> users) {
        return fallEventRepository.findByUserIn(users);
    }

    public void updateScreenshot(FallEvent event, String screenshotUri) {
        event.setScreenshotUri(screenshotUri);
        fallEventRepository.save(event);
    }

    public void deleteEventsByUser(User user) {
        List<FallEvent> events = fallEventRepository.findByUser(user);
        fallEventRepository.deleteAll(events);
    }
}














