import React, { useState, useEffect } from 'react'; 
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
  const [existingFiles, setExistingFiles] = useState([]); // List of existing files
  const [selectedFile, setSelectedFile] = useState(""); // Selected file from dropdown

  // Fetch existing files from the backend
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch('http://localhost:5001/list-files');
        const data = await res.json();
        setExistingFiles(data.files || []);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSelectedFile(""); // Clear selected dropdown value when a new file is chosen
  };

  const handleUpload = async () => {
    if (file) {
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
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "system", content: "Please select a file or upload a new one." },
      ]);
    }
  };

  const handleSelectExistingFile =  async() => {
    setUploadedFileName(selectedFile);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "system", content: `Using existing file: ${selectedFile}` },
      ]);
  }

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
                  {/* Select an Existing File Section */}
                  <div className="file-select-container" style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '10px' }}>Select an Existing File</h3>
                    <select 
                      value={selectedFile} 
                      onChange={(e) => setSelectedFile(e.target.value)} 
                      style={{
                        marginRight: '10px',
                        padding: '5px',
                        minWidth: '200px',
                        border: '1px solid #e0e4e8',
                        borderRadius: '5px',
                      }}
                    >
                      <option value="">Select an existing file</option>
                      {existingFiles.map((file) => (
                        <option key={file.name} value={file.name}>
                          {file.name}
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={() => {
                        if (selectedFile) {
                          handleSelectExistingFile();
                        } else {
                          alert("Please select a file from the dropdown.");
                        }
                      }}
                      className="select-button"
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "var(--accent-color)",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Use Selected File
                    </button>
                  </div>
        
                  {/* Upload a New File Section */}
                  <div className="file-upload-container" style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '10px' }}>Or Upload a New File</h3>
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      style={{
                        marginRight: '10px',
                        padding: '5px',
                        border: '1px solid #e0e4e8',
                        borderRadius: '5px',
                      }}
                    />
                    <button 
                      onClick={handleUpload}
                      className="upload-button"
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "var(--accent-color)",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      <Upload className="nav-icon" style={{ marginRight: '5px' }} /> Upload
                    </button>
                  </div>

                  <div className="chat-messages">
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