
import { useEffect, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Define the structure of your messages
interface StompMessage {
    content: string;
}

export function useStompWithSend() {
    const [messages, setMessages] = useState<StompMessage[]>([]);
    const [client, setClient] = useState<Client | null>(null);

    useEffect(() => {
        console.log("create client...")
        // Create a STOMP client
        const stompClient = new Client({
            brokerURL: "ws://localhost:8080/ws",
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
            debug: (str: string) => console.log(str), // Debug logs
            onConnect: () => {
                console.log("Connected to STOMP");

                // Subscribe to a topic
                stompClient.subscribe("/topic/event", (message: IMessage) => {
                    const parsedMessage = JSON.parse(message.body) as StompMessage;
                    setMessages((prev) => [...prev, parsedMessage]);
                });
            },
        });

        stompClient.activate(); // Start the connection
        setClient(stompClient);

        return () => {
            stompClient.deactivate(); // Cleanup on component unmount
        };
    }, []);

    // Send a message to the server
    const sendMessage = (message: StompMessage) => {
        console.log(message);
        if (client) {
            client.publish({
                destination: "/app/send",
                body: JSON.stringify(message),
            });
        } else {
            console.error("STOMP client is not connected");
        }
    };

    return { messages, sendMessage };
}