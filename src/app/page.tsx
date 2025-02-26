"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { FaPaperPlane } from "react-icons/fa";
import './globals.css';

export default function Home() {
    const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const CodeBlock = ({ language, value }) => (
        <SyntaxHighlighter language={language} style={vscDarkPlus}>
            {value}
        </SyntaxHighlighter>
    );

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: "user", text: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5059/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Message: input }),
            });

            if (!response.body) {
                throw new Error("ReadableStream not supported in this browser.");
            }

            const reader = response.body.getReader();
            let done = false;
            let assistantMessage = "";
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunk = new TextDecoder("utf-8").decode(value);
                assistantMessage += chunk;
                setMessages([...newMessages, { role: "assistant", text: assistantMessage }]);
            }
        } catch (error) {
            console.error("Error fetching response:", error);
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = {
        input: {
            flex: 1,
            padding: "14px",
            fontSize: "16px",
            lineHeight: "1.5",
            backgroundColor: "rgb(17, 24, 39)",
            border: "1px solid rgb(55, 65, 81)",
            borderRadius: "8px",
            color: "white",
            outline: "none",
            resize: "none",
            fontFamily: "inherit",
        },
        container: {
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "24px",
            background: "rgb(17, 24, 39)",
            borderTop: "1px solid rgb(55, 65, 81)",
        },
        innerContainer: {
            display: "flex",
            maxWidth: "48rem",
            margin: "0 auto",
            padding: "8px 12px",
            backgroundColor: "rgb(31, 41, 55)",
            borderRadius: "8px",
            boxShadow: "0 0 15px rgba(0,0,0,0.2)",
        },
        button: {
            padding: "8px 12px",
            color: "rgb(156, 163, 175)",
            transition: "all 0.2s",
        },
    };

    return (
        <div className="w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-black p-4">
                <h1 className="text-2xl font-bold italic text-white text-center">Welcome to Horizon! What can I help with?</h1>
            </div>

            {/* Chat messages container */}
            <div className="h-[100vh] overflow-y-scroll p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
                {messages.map((m, index) => (
                    <div key={index} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`flex max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            <div
                                className={`p-4 rounded-xl ${
                                    m.role === "user"
                                        ? "bg-purple-600 text-white shadow-lg" // User message styling
                                        : "bg-teal-600 text-white shadow-lg"  // Horizon message styling
                                }`}
                            >
                                <div className="flex items-center">
                                    <span className={`font-bold mr-2 ${m.role === "user" ? "text-pink-300" : "text-green-300"}`}>
                                        {m.role === "user" ? "You:" : "Horizon:"}
                                    </span>
                                    <ReactMarkdown
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || "");
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        language={match[1]}
                                                        style={vscDarkPlus}
                                                        PreTag="div"
                                                        className="rounded-md mt-2"
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, "")}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className={`${className} bg-black/20 px-1 rounded`} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            p: ({ children }) => <span className="text-current">{children}</span>,
                                        }}
                                    >
                                        {m.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading state with blinking dots */}
                {loading && (
                    <div className="flex justify-start">
                        <div className="p-4 rounded-xl bg-gray-700 text-white">
                            <div className="flex items-center">
                                <span className="font-bold mr-2">Horizon:</span>
                                <div className="blinking-dots">
                                    <span>.</span>
                                    <span>.</span>
                                    <span>.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input container */}
            <div style={inputStyles.container}>
                <div style={inputStyles.innerContainer}>
                    <textarea
                        style={inputStyles.input}
                        rows={1}
                        placeholder="Send a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                    />
                    <button
                        onClick={sendMessage}
                        style={inputStyles.button}
                        disabled={loading || !input.trim()}
                    >
                        <FaPaperPlane className="w-5 h-8" />
                    </button>
                </div>
            </div>

            {/* Add the <style jsx> block here */}
            <style jsx>{`
                @keyframes blink {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0;
                    }
                }

                .blinking-dots span {
                    animation: blink 1.4s infinite;
                }

                .blinking-dots span:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .blinking-dots span:nth-child(3) {
                    animation-delay: 0.4s;
                }
            `}</style>
        </div>
    );
}
