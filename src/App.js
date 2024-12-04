import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState("");
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);  // Store the file in state
  };
  
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);  // Add the file to the form data
  
    try {
      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      });
  
      const data = await res.json();
      console.log(data);
      setResponse(data.message);  // Show the response message
  
    } catch (error) {
      setResponse("An error occurred while uploading.");
      console.error("Upload error:", error);
    }
  };
  

  const handleAskQuestion = async () => {
    const question = "What is artificial intelligence?"; // Or get this dynamically from an input field
  
    try {
      const res = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question })
      });
  
      if (!res.ok) {
        throw new Error("Failed to get response from backend");
      }
  
      const data = await res.json();
      setResponse(data.response); // Display the response from GPT-4
  
    } catch (error) {
      setResponse("An error occurred while asking the question.");
      console.error("Error:", error);
    }
  };
  

  return (
    <div>
      <h1>Upload a File</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      <h1>Ask a Question</h1>
      <button onClick={handleAskQuestion}>Ask</button>
      
      <div>{response}</div>
    </div>
  );
}

export default App;
