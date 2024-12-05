import React, { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { 
  FileText, 
  Calendar as CalendarIcon, 
  List, 
  Home,
  Upload
} from 'lucide-react';
import MyDocuments from './pages/MyDocuments';
import Calendar from './pages/Calendar';
import StudyPlan from './pages/StudyPlan';
import './App.css';

const App = () => {
  const [file, setFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.filename) {
        setUploadedFileName(data.filename);
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
      const res = await fetch('http://localhost:5001/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: inputMessage,
          filename: uploadedFileName,
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

    setInputMessage("");
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <h1>Bindr</h1>
        </div>
        <nav className="sidebar-nav">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `sidebar-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Home className="nav-icon" />
            <span>Home</span>
          </NavLink>
          <NavLink 
            to="/my-documents" 
            className={({ isActive }) => 
              `sidebar-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <FileText className="nav-icon" />
            <span>My Documents</span>
          </NavLink>
          <NavLink 
            to="/calendar" 
            className={({ isActive }) => 
              `sidebar-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <CalendarIcon className="nav-icon" />
            <span>Calendar</span>
          </NavLink>
          <NavLink 
            to="/study-plan" 
            className={({ isActive }) => 
              `sidebar-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <List className="nav-icon" />
            <span>Study Plan</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-title">
            <h1>Document Chat</h1>
          </div>
          <div className="header-actions">
            <button className="btn-profile">Profile</button>
          </div>
        </header>

        {/* Page Content */}
        <div className="content-wrapper">
          <Routes>
            <Route 
              path="/" 
              element={
                <div className="document-upload-section">
                  <div className="file-upload-container">
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      style={{ marginBottom: '10px' }}
                    />
                    <button 
                      onClick={handleUpload}
                      className="upload-button"
                    >
                      <Upload className="nav-icon" /> Upload
                    </button>
                  </div>

                  <div 
                    className="chat-messages"
                    style={{
                      border: "1px solid #e0e4e8",
                      padding: "10px",
                      maxHeight: "400px",
                      overflowY: "auto",
                      backgroundColor: "var(--bg-secondary)",
                      borderRadius: "10px",
                      marginTop: "20px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
                    }}
                  >
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        style={{
                          textAlign: message.role === "user" ? "right" : "left",
                          margin: "10px 0",
                          padding: "10px",
                          borderRadius: "8px",
                          backgroundColor: message.role === "user" ? "#e6f2ff" : "#f4f6f9",
                          maxWidth: "80%",
                          marginLeft: message.role !== "user" ? "0" : "auto"
                        }}
                      >
                        <strong>{message.role === "user" ? "You" : "Assistant"}:</strong> {message.content}
                      </div>
                    ))}
                  </div>

                  <div style={{ 
                    marginTop: "20px", 
                    display: 'flex',
                    gap: '10px'
                  }}>
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      style={{
                        flexGrow: 1,
                        padding: "10px",
                        border: "1px solid #e0e4e8",
                        borderRadius: "8px",
                        backgroundColor: "var(--bg-secondary)"
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "var(--accent-color)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background-color 0.3s ease"
                      }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              } 
            />
            <Route path="/my-documents" element={<MyDocuments />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/study-plan" element={<StudyPlan />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;