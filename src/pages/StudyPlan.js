import React, { useState } from 'react';
import DaySelector from '../components/dayselector';
import './StudyPlanStyle.css';


const StudyPlan = () => {
  
  const [file, setFile] = useState(null);
  const [overallEnd, setOverallEnd] =  useState(null);
  const [overallStart, setOverallStart] =  useState(null);
  const [topics, setTopics] = useState(null);
  const [studyPreference, setStudyPreference] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('availability', JSON.stringify(availability));
    formData.append('overallStart', overallStart);
    formData.append('overallEnd', overallEnd);
    formData.append('topics', topics);
    formData.append('studyPreference', studyPreference);
  
    try {
      const response = await fetch('/createStudyPlan', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('Response:', data);
  
      // print new study plan
    } catch (error) {
      console.error('Error:', error);
  
      // Handle error, e.g., show an error message to the user
    }
  };

  return (
    <div>

      <h1>Generate A Study Plan</h1>

      <form onSubmit={handleSubmit}>

        {/*Overall plan timeline*/}
        <div>
          <h3>Enter the start and end date of your study plan</h3>
          <label htmlFor="overall_start">Start date:</label>
          <input
            type="date"
            id="overall_start"
            name="overall_start"
            onChange={(e) => setOverallStart(e.target.value)}
          />
          <label htmlFor="overall_end">End date:</label>
          <input
            type="date"
            id="overall_end"
            name="overall_end"
            onChange={(e) => setOverallEnd(e.target.value)}
          />
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
          {/*Specific Topics */}
          <h3>Are there any topics you would like to cover specifically?</h3>
          <label htmlFor="topics">Topics:</label>
          <input
            type="text"
            id="topics"
            name="topics"
            onChange={(e) => setTopics(e.target.value)}
          />
        </div>

        <div>
          <h3>Optional: Select study preferences</h3>
          
          <input
            type="radio"
            id="deep_focus"
            name="studyPreference" 
            value="deep_focus" 
            checked={studyPreference === 'deep_focus'} 
            onChange={(e) => setStudyPreference(e.target.value)}
          />
          <label for="deep_focus">Deep Focus Sessions</label><br></br>
          
         
          <input
            type="radio"
            id="pomodoro"
            name="studyPreference" 
            value="pomodoro" 
            checked={studyPreference === 'pomodoro'} 
            onChange={(e) => setStudyPreference(e.target.value)} 
          />
          <label for="pomodoro">Pomodoro Technique</label> <br></br>

          
          <input
            type="radio"
            id="spaced"
            name="studyPreference" 
            value="spaced" 
            checked={studyPreference === 'spaced'} 
            onChange={(e) => setStudyPreference(e.target.value)} 
          />
          <label for="spaced">Spaced Repetition</label><br></br>
        </div>
        

        <button type="submit">Submit</button>

      </form>



    </div>
  );
};

export default StudyPlan;