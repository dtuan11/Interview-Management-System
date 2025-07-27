package com.group2.InterviewManagement.utils;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class UserUpdaterHandler extends TextWebSocketHandler {
    private final Set<WebSocketSession> sessionSet = ConcurrentHashMap.newKeySet();
    private ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessionSet.add(session);
        scheduler.scheduleAtFixedRate(() -> {
            try {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage("ping"));
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }, 0, 30, TimeUnit.SECONDS); // Gửi gói tin ping mỗi 30 giây
        System.out.println("WebSocket connection established with session ID: " + session.getId());
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        System.out.println("Received message: " + message.getPayload());
        for (WebSocketSession webSocketSession : sessionSet) {
            if (webSocketSession.isOpen()) {
                webSocketSession.sendMessage(message);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessionSet.remove(session);
        System.out.println("WebSocket connection closed with session ID: " + session.getId());
    }

    public void sendMessageToAllSessions(String message) {
        TextMessage textMessage = new TextMessage(message);
        System.out.println("Sending message to all sessions: " + message);
        for (WebSocketSession session : sessionSet) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(textMessage);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public void notifyUserUpdated(int userId) {
        sendMessageToAllSessions("{\"type\":\"user-updated\",\"userId\":" + userId + "}");
    }

    public void notifyVersionUpdated(int userId) {
        sendMessageToAllSessions("{\"type\":\"version-updated\",\"userId\":" + userId + "}");
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.out.println("WebSocket transport error: " + exception.getMessage());
        // Handle transport error
        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }
}
