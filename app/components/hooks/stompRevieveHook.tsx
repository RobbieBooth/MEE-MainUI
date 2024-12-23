import { useEffect, useState } from "react";
import {Client, IMessage} from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface StompMessage {
    content: string; // Adjust this type based on your backend response
}

export function useStomp() {
    const [messages, setMessages] = useState<StompMessage[]>([]);

    useEffect(() => {
        // Create a STOMP client
        const client = new Client({
            brokerURL: "ws://localhost:8080/ws", // Replace with your backend WebSocket URL
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"), // SockJS fallback
            debug: (str: string) => console.log(str), // Debug logs
            onConnect: () => {
                console.log("Connected to STOMP");

                // Subscribe to a topic
                client.subscribe("/topic/event", (message: IMessage) => {
                    // Parse and add the message to the state
                    const parsedMessage = JSON.parse(message.body) as StompMessage;
                    setMessages((prev) => [...prev, parsedMessage]);
                });
            },
            onDisconnect: () => {
                console.log("Disconnected from STOMP");
            },
        });

        client.activate(); // Start the connection

        return () => {
            client.deactivate(); // Cleanup on component unmount
        };
    }, []);

    return messages;
}