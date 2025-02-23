import  { useState } from "react";
import { signAndFetch } from "../lib/SignAndFetch";

interface Message {
    role: "user" | "npc";
    content: string;
}

function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>("");
   
    
    const sendMessage = async () => {
        if (!input.trim()) return;
        const newMessages: Message[] = [...messages, { role: "user" as "user", content: input }];
        setMessages(newMessages);
        setInput("");

       
        const response = await signAndFetch({ Input: input });     
    
        if (response.error) {
            console.error(response.error);
            return;
        }
        setMessages([...newMessages, { role: "npc", content: response.data!.content[0].text || "Lo siento. No entiendo la pregunta." }]);
    };

    return (
        <div className="max-w-lg mx-auto p-4 bg-gray-100 shadow-md rounded-lg">
            <div className="h-96 overflow-y-auto border p-3 rounded-lg bg-white">
                {messages.map((msg, index) => (
                    <div key={index} className={`p-2 rounded-md text-white ${msg.role === "user" ? "bg-blue-500 text-right ml-auto w-fit" : "bg-gray-600 text-left mr-auto w-fit"}`}>
                        <b>{msg.role === "user" ? "You: " : "NPC: "}</b> {msg.content}
                    </div>
                ))}
            </div>
            <div className="flex mt-3">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type a message..." className="flex-grow p-2 border rounded-lg focus:outline-none" />
                <button onClick={sendMessage} className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Send
                </button>
            </div>
        </div>
    );
}

export default Chat;
