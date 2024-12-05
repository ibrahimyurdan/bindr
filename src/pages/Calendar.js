import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { createEvents, download } from "ics";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5001/extract-calendar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      // Map JSON data to FullCalendar event format
      const mappedEvents = data.map((item) => ({
        title: item.title || "Untitled",
        date: `2024-${item.date}`, // Add year to date
        extendedProps: {
          task: item.task || "No task provided",
        },
      }));

      setEvents(mappedEvents);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const renderEventContent = (eventInfo) => {
    return (
      <Tippy
        content={
          <div>
            <strong>{eventInfo.event.title}</strong>
            <br />
            {eventInfo.event.extendedProps.task}
          </div>
        }
      >
        <div
          style={{
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {eventInfo.event.title}
        </div>
      </Tippy>
    );
  };

  const sanitizeString = (str, maxLength = 75) => {
    if (!str) return "";
    return str.length > maxLength ? `${str.substring(0, maxLength - 3)}...` : str;
  };
  
  const downloadICS = () => {
    const icsEvents = events.map((event) => {
      const [year, month, day] = event.date.split("-").map(Number);
      return {
        title: sanitizeString(event.title),
        description: sanitizeString(event.extendedProps?.task),
        start: [year, month, day],
      };
    });
  
    createEvents(icsEvents, (error, value) => {
      if (error) {
        console.error("Error generating ICS file:", error);
        return;
      }
      const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "calendar.ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  };
  

  return (
    <div>
      <h2>Calendar</h2>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        style={{ marginBottom: "20px" }}
      />

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        eventContent={renderEventContent} // Custom render function
      />

      <button
        onClick={downloadICS}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "var(--accent-color)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
        }}
      >
        Download as ICS
      </button>
    </div>
  );
};

export default Calendar;
