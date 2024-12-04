import React, { useState } from 'react';

function ExtractDates() {
  const [file, setFile] = useState(null);
  const [events, setEvents] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleExtractDates = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/extract-dates", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.dates) {
        setEvents(data.dates);
      } else {
        throw new Error("No dates found.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h1>Upload Syllabus</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleExtractDates}>Extract Dates</button>

      <h2>Extracted Events</h2>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            <strong>{event.date}:</strong> {event.event}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExtractDates;
