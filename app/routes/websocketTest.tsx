import React, { useState } from "react";
import { useStompWithSend } from "~/components/hooks/stompMessageHook";

export default function StompPage() {
    const { messages, sendMessage } = useStompWithSend();
    const [input, setInput] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(input);
        if (input.trim()) {
            sendMessage({ content: input }); // Send the input to the server
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
            <button onClick={()=> sendMessage({ content: "hola amego" })}>test</button>
            <ul>
                {messages.map((message, index) => (
                    <li key={index}>{message.content}</li> // Display messages
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