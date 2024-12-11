import React, { useState } from 'react';
import DaySelector from '../components/dayselector';
import './StudyPlanStyle.css';


const StudyPlan = () => {
  
  const [file, setFile] = useState(null);
  const [availability, setAvailability] = useState({
    Monday: { start: '', end: '' },
    Tuesday: { start: '', end: '' },
    Wednesday: { start: '', end: '' },
    Thursday: { start: '', end: '' },
    Friday: { start: '', end: '' },
    Saturday: { start: '', end: '' },
    Sunday: { start: '', end: '' },
  });

  const handleChange = (day, timeType, timeValue) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [timeType]: timeValue,
      },
    }));
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    console.log('Uploaded File:', uploadedFile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('availability', JSON.stringify(availability));
    // Append other fields as necessary

    fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => console.log('Server Response:', data))
      .catch((error) => console.error('Error:', error));
  };

  return (
    <div>

      <h1>Generate A Study Plan</h1>

      <form onSubmit={handleSubmit}>

        {/*Overall plan timeline*/}
        <div>
          <h3>Enter the start and end date of your study plan</h3>
          <label for="overall_start">Start date:</label>
          <input type="date" id="overall_start" name="overall_start" />
          <label for="overall_end">End date:</label>
          <input type="date" id="overall_end" name="overall_end" />
        </div>
        

        {/* weekly availability */}
        <div>
          <h3>Optional: Please enter your weekly availability:</h3>
          {Object.keys(availability).map((day) => (
            <DaySelector key={day} day={day} onChange={handleChange} />
          ))}
        </div>
        
        {/*Upload Syllabus*/}
        <div>
          <h3>Optional: Upload a syllabus to extract due dates, topics and resource names</h3>
          <input
            type="file"
            id="syllabus"
            name="syllabus"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
          />
        </div>
        
        <div>
          {/*Specific Topics*/}
          <h3>Are there any topics you would like to cover specifically?</h3>
          <label for="topics">Topics: </label>
          <input type="text" id="topics" name="topics"></input>
        </div>

        <button type="submit">Submit</button>

      </form>



    </div>
  );
};

export default StudyPlan;