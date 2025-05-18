import { useState, useRef } from "react";
// @ts-ignore
const axios = window.axios;
import "./App.css";

type Role = "user" | "assistant";
interface Message {
  role: Role;
  content: string;
}

const synth = window.speechSynthesis;
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const speakText = (text: string) => {
    if (!synth) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    synth.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
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
            Authorization: `Bearer YOUR_OPENAI_API_KEY_HERE`, // Replace with your OpenAI API key
            "Content-Type": "application/json",
          },
        }
      );

      const reply = response.data.choices[0].message;
      setMessages([...newMessages, reply]);
      speakText(reply.content);
    } catch (err: unknown) {
      console.error(err);
      alert("Error occurred while calling OpenAI API");
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Speech recognition not supported.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => setListening(true);
    recognitionRef.current.onend = () => setListening(false);

    recognitionRef.current.onresult = (event: any) => {
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
      <h1>Shikher Voice App 1</h1>
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <strong>{msg.role === "user" ? "You" : "GPT"}:</strong> {msg.content}
          </div>
        ))}
        {loading && <p>GPT is typing...</p>}
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
            backgroundColor: listening ? "red" : "green",
            color: "white",
            marginLeft: "8px",
          }}
        >
          🎙 {listening ? "Stop" : "Talk"}
        </button>
      </div>
    </div>
  );
}

export default App;
