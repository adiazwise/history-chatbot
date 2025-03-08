import  { useState } from "react";
import { signAndFetch } from "../lib/SignAndFetch";

interface Message {
    role: "user" | "npc";
    content: string;
}

function Chat() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "npc", content: "Hola, Soy un viajero en el tiempo que ha vivido momentos historicos." },
    ]);
    const [input, setInput] = useState<string>("");
   
    
    const sendMessage = async () => {
        if (!input.trim()) return;
        const newMessages: Message[] = [...messages, { role: "user" as "user", content: input }];
        setMessages(newMessages);
        setInput("");

       
        setMessages([...newMessages, { role: "npc", content: "Pensando..." }]);
        const response = await signAndFetch({ Input: input.concat(" in spanish") });
        setMessages((prevMessages) => prevMessages.filter(msg => msg.content !== "Pensando..."));
        
       const {data,error } = response;

        if (error) {
            console.error(error);
            return;
        }
        const { event,description,fromTo } = data as { event: string, description: string, fromTo: string };

       console.log(fromTo);
        const [from, to] = fromTo.split(" - ");
        

        let fromToText = to ? `entre ${from} y ${to}` : `en ${from}`;
        setMessages([...newMessages, { role: "npc", content: event !=='' ?  `en el evento ${event} que ocurrió  ${fromToText}  ${description} `: description  || "Lo siento. No entiendo la pregunta." }]);
    };

  
    return (
        <div className="p-4 bg-[#F2F6D0] w-screen h-screen  rounded-lg flex items-center justify-center">
            <div className="rounded-xl shadow-2xl w-96 overflow-hidden border-2 border-[#443627]">
            {/* <!-- Chat header --> */}
            <div className="bg-[#443627] w-full p-4 border-b-2 border-[#443627] rounded-t-lg">
                <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#D98324] rounded-full flex items-center justify-center text-[#EFDCAB] font-bold text-xl">
                    📚
                </div>
                <div>
                    <h2 className="text-[#EFDCAB] font-semibold">History Chat Bot</h2>
                    <p className="text-sm text-[#D98324]">Online</p>
                </div>
                </div>
            </div>
            
            {/* <!-- Chat body --> */}
            <div className="h-96 overflow-y-auto border p-3 bg-white">
            
                {messages.map((msg, index) => (
                    
                        <div className="m-2" key={index} >{msg.role === "user" 
                                        ? 
                                        <div className="flex items-start justify-end space-x-2 mb-4 fade-in">
                                            
                                            <div className="bg-[#543A14] p-3 rounded-lg max-w-[70%]">
                                                <p className="text-sm text-[#FFF0DC]">
                                                     {msg.content}
                                                 </p> 
                                            </div>
                                            <div className="w-10 h-10 bg-[#F0BB78] rounded-full flex items-center justify-center text-[#543A14] text-xl">
                                                👤
                                            </div>
                                        </div> 
                                        :
                                        <div className="flex items-start space-x-2 fade-in">
                                             <div className="w-10 h-10 bg-[#F0BB78] rounded-full flex items-center justify-center text-[#543A14] text-xl">
                                                📚
                                            </div>
                                            <div className="bg-[#FFF0DC] p-3 rounded-lg max-w-[70%] border border-[#543A14]"> 
                                                <p className="text-sm text-[#543A14]">
                                                    {msg.content}
                                                </p>
                                            </div>
                                           
                                        </div>
                             }
                        </div>
                        
                    
                ))}
            </div>


            {/* <!-- Chat input --> */}
            <div className="border-t-2 border-[#443627] p-4 bg-white" >
            <div className="flex items-center space-x-2">
            
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type a message..." className="flex-grow p-2 border rounded-lg focus:outline-none" />
                <button onClick={sendMessage} className="p-2 bg-[#543A14] rounded-full text-[#FFF0DC] hover:bg-[#F0BB78] hover:text-[#543A14] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            
            </div>
            </div>
            </div>
        </div>
    );
}

export default Chat;
