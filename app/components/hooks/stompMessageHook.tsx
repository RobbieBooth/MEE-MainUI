
import { useEffect, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {StudentQuizAttempt} from "~/components/MEETypes/studentAttempt";
import {EventDetails} from "~/components/quizSection/quizEventTypes";

// Define the structure of your messages
interface StompMessage {
    content: string;
}



export function useStompWithSend(authToken: string) {
    const [messages, setMessages] = useState<StudentQuizAttempt[]>([]);
    const [quiz, setQuiz] = useState<StudentQuizAttempt | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        console.log("create client...", authToken);
        // Create a STOMP client
        const stompClient = new Client({
            brokerURL: "wss://localhost:8080/ws",
            webSocketFactory: () => new SockJS("http://localhost:8080/ws", ),
            connectHeaders: {
                Authorization: `Bearer ${authToken}` // Send JWT in headers
            },
            debug: (str: string) => console.log(str), // Debug logs
            onConnect: () => {
                console.log("Connected to STOMP");

                stompClient.subscribe("/topic/event", (message: IMessage) => {
                    try {
                        // Parse the message body
                        const parsedMessage = JSON.parse(message.body);

                        // Extract the `body` field and cast it to `EventDetails`
                        const eventDetails = parsedMessage.body as StudentQuizAttempt;

                        // Update the state with the extracted `EventDetails`
                        // setMessages((prev) => [...prev, eventDetails]);
                        setQuiz(eventDetails);
                        console.log(eventDetails);
                    } catch (error) {
                        console.error("Error processing message:", error);
                    }
                }, {Authorization: `Bearer ${authToken}`});

                setIsConnected(true);
            },
            onDisconnect: () =>{
                console.log("Disconnected from STOMP");
                setIsConnected(false);
            }
        });

        stompClient.activate(); // Start the connection
        setClient(stompClient);

        return () => {
            stompClient.deactivate(); // Cleanup on component unmount
        };
    }, []);

    // Send a message to the server
    const sendStart = (message: EventDetails) => {
        if (client) {

            client.publish({
                destination: "/app/startQuiz",
                body: JSON.stringify(message),
                headers:{
                    Authorization: `Bearer ${authToken}`
                }
            });
        } else {
            console.error("STOMP client is not connected");
        }
    };

    const sendMessage = (message: EventDetails) => {
        console.log(message);
        if (client) {

            client.publish({
                destination: "/app/send",
                body: JSON.stringify(message),
                headers:{
                    Authorization: `Bearer ${authToken}`
                }
            });
        } else {
            console.error("STOMP client is not connected");
        }
    };

    return { messages, sendStart, isConnected, quiz, sendMessage};
}