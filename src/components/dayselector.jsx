// DaySelector.jsx
import React from 'react';
import './dayselector.css'

const DaySelector = ({ day, onChange }) => {
  const handleTimeChange = (timeType, value) => {
    onChange(day, timeType, value);
  };

  return (
    <div className="day">
      <label>{day}:</label>
      <label htmlFor={`${day}-start`}>Start Time:</label>
      <input
        type="time"
        id={`${day}-start`}
        onChange={(e) => handleTimeChange('start', e.target.value)}
      />
      <label htmlFor={`${day}-end`}>End Time:</label>
      <input
        type="time"
        id={`${day}-end`}
        onChange={(e) => handleTimeChange('end', e.target.value)}
      />
    </div>
  );
};

export default DaySelector;
