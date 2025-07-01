package com.example.fallen.services;

import com.example.fallen.models.FallEvent;
import com.example.fallen.models.User;
import com.example.fallen.repositories.FallEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FallEventService {

    private final FallEventRepository fallEventRepository;

    @Autowired
    public FallEventService(FallEventRepository fallEventRepository) {
        this.fallEventRepository = fallEventRepository;
    }

    public FallEvent registerFallEvent(User user, LocalDateTime timestamp, String location, String screenshotUri) {
        FallEvent ev = new FallEvent();
        ev.setUser(user);
        ev.setTimestamp(timestamp);
        ev.setLocation(location);
        ev.setScreenshotUri(screenshotUri);
        return fallEventRepository.save(ev);
    }

    public List<FallEvent> getEventsByUser(User user) {
        return fallEventRepository.findByUser(user);
    }

    public List<FallEvent> getEventsByUsers(List<User> users) {
        return fallEventRepository.findByUserIn(users);
    }

    public FallEvent getEventById(Long id) {
        return fallEventRepository.findById(id).orElse(null);
    }

    public void updateScreenshot(FallEvent event, String screenshotUri) {
        event.setScreenshotUri(screenshotUri);
        fallEventRepository.save(event);
    }

    @Transactional
    public void deleteEventsByUser(User user) {
        List<FallEvent> events = fallEventRepository.findByUser(user);
        fallEventRepository.deleteAll(events);
    }
}










