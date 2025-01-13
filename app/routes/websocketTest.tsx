import React, { useState } from "react";
import { useStompWithSend } from "~/components/hooks/stompMessageHook";

export default function StompPage() {
    const { messages, sendMessage } = useStompWithSend();
    const [input, setInput] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(input);
        if (input.trim()) {
            // sendMessage({
            //     genericEvent: {
            //         type: "QuestionEvent",
            //         event: "SAVE_QUESTION"
            //     },
            //     quizUUID: "123e4567-e89b-12d3-a456-426614174000",
            //     questionUUID: "456e4567-e89b-12d3-a456-426614174000",
            //     additionalData: {}
            // }); // Send the input to the server
            // sendMessage({ content: input }); // Send the input to the server
            sendMessage({
                genericEvent: {
                    type: "QuizEvent",
                    event: "START_QUIZ"
                },
                quizUUID: "77476ce2-628f-4bc2-87b8-44f8443af5ea",
                studentUUID: "04474476-0204-4761-a110-495543d1e7a7",
                questionUUID: "",
                additionalData: {}
            });
            setInput(""); // Clear the input field
        }
    };

    return (
        <div>
            <h1>STOMP Messages</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Send a message"
                />
                <button type="submit">Send</button>
            </form>
            <ul>
                {messages.map((message, index) => (
                    <li key={index}>{message.quizUUID}</li> // Display messages
                ))}
            </ul>
        </div>
    );
}


// interface FormElements extends HTMLFormControlsCollection {
//     usernameInput: HTMLInputElement
// }
// interface UsernameFormElement extends HTMLFormElement {
//     readonly elements: FormElements
// }
//
// export default function UsernameForm() {
//     function handleSubmit(event: React.FormEvent<UsernameFormElement>) {
//         event.preventDefault();
//         console.log(event.currentTarget.elements.usernameInput.value);
//     }
//
//     return (
//         <form onSubmit={handleSubmit}>
//             <div>
//                 <label htmlFor="usernameInput">Username:</label>
//                 <input id="usernameInput" type="text" />
//             </div>
//             <button type="submit">Submit</button>
//         </form>
//     )
// }