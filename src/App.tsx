import React, { useState, useRef } from "react";
import axios from "axios";
import "./App.css";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const speakText = (text) => {
    if (!synth) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; // You can customize the voice and lang
    synth.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: newMessages,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const reply = response.data.choices[0].message;
      setMessages([...newMessages, reply]);
      speakText(reply.content);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => setListening(true);
    recognitionRef.current.onend = () => setListening(false);

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + transcript);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return (
    <div className="app">
      <h1>ChatGPT Voice App</h1>
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === "user" ? "message user" : "message bot"}
          >
            <strong>{msg.role === "user" ? "You" : "GPT"}:</strong> {msg.content}
          </div>
        ))}
        {loading && <p className="loading">GPT is typing...</p>}
      </div>
      <div className="input-box">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or speak..."
        />
        <button onClick={sendMessage}>Send</button>
        <button
          onClick={listening ? stopListening : startListening}
          style={{
            background: listening ? "red" : "green",
            color: "white",
            border: "none",
            borderRadius: "5px",
            padding: "10px 16px",
          }}
        >
          🎙️ {listening ? "Stop" : "Talk"}
        </button>
      </div>
    </div>
  );
}

export default App;
