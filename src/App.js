import React, { useState } from 'react';
import ExtractDates from './ExtractDates';

function App() {
  const [file, setFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null); // To store the uploaded file name
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.filename) {
        setUploadedFileName(data.filename); // Save the filename for later use
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "system", content: `File uploaded: ${data.message}` },
        ]);
      } else {
        throw new Error("Filename not returned from backend");
      }
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "system", content: "An error occurred while uploading the file." },
      ]);
      console.error("Upload error:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: inputMessage },
    ]);

    try {
      const res = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: inputMessage,
          filename: uploadedFileName, // Include the filename in the request
        }),
      });

      const data = await res.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: data.response || "No response received." },
      ]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "An error occurred while fetching the response." },
      ]);
      console.error("Error:", error);
    }

    setInputMessage(""); // Clear input
  };

  return (
    <div>
      <h1>Upload a File</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      <h1>Chat with the Assistant</h1>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          maxHeight: "300px",
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
          borderRadius: "5px",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              textAlign: message.role === "user" ? "right" : "left",
              margin: "5px 0",
              padding: "10px",
              borderRadius: "5px",
              backgroundColor: message.role === "user" ? "#d4f0ff" : "#f4f4f4",
            }}
          >
            <strong>{message.role === "user" ? "You" : "Assistant"}:</strong> {message.content}
          </div>
        ))}
      </div>
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          style={{
            width: "80%",
            padding: "10px",
            marginRight: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
