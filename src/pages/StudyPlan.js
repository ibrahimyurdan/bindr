import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Upload 
} from 'lucide-react';
import './StudyPlanStyle.css';

const DaySelectorRow = ({ days, availability, onChange }) => {
  return (
    <div className="day-selector-row">
      {days.map((day) => (
        <div key={day} className="day-row">
          <div className="day-name">{day}</div>
          <div className="time-input-group">
            <div className="time-input">
              <label>Start:</label>
              <input
                type="time"
                value={availability[day].start}
                onChange={(e) => onChange(day, 'start', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="time-input">
              <label>End:</label>
              <input
                type="time"
                value={availability[day].end}
                onChange={(e) => onChange(day, 'end', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const StudyPlan = () => {
  const [file, setFile] = useState(null);
  const [overallEnd, setOverallEnd] = useState(null);
  const [overallStart, setOverallStart] = useState(null);
  const [topics, setTopics] = useState(null);
  const [studyPreference, setStudyPreference] = useState(null);
  const [openSections, setOpenSections] = useState({
    timeline: false,
    availability: false,
    syllabus: false,
    topics: false,
    preferences: false
  });
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
      const response = await fetch('http://localhost:5001/createstudyplan', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('Response:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const AccordionSection = ({ title, description, children, sectionKey }) => (
    <div className="accordion-section">
      <button 
        type="button"
        className="accordion-header"
        onClick={() => toggleSection(sectionKey)}
      >
        <div className="accordion-header-content">
          <h3>{title}</h3>
          {description && <p className="section-description">{description}</p>}
        </div>
        {openSections[sectionKey] ? <ChevronUp /> : <ChevronDown />}
      </button>
      {openSections[sectionKey] && (
        <div className="accordion-content">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="study-plan-container">
      <div className="content-header">
        <h1>Generate A Study Plan</h1>
        <p className="page-description">
          Create a personalized and effective study strategy tailored to your schedule, 
          learning style, and academic goals. Our AI-powered study plan generator helps 
          you optimize your learning by considering your availability, preferences, 
          and specific study topics.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="study-plan-form">
        {/* Overall Plan Timeline */}
        <AccordionSection 
          title="Study Timeline" 
          description="Set the start and end dates for your comprehensive study plan."
          sectionKey="timeline"
        >
          <div className="form-group">
            <label htmlFor="overall_start">Start date:</label>
            <input
              type="date"
              id="overall_start"
              name="overall_start"
              value={overallStart || ''}
              onChange={(e) => setOverallStart(e.target.value)}
              className="form-input"
            />
            <label htmlFor="overall_end">End date:</label>
            <input
              type="date"
              id="overall_end"
              name="overall_end"
              value={overallEnd || ''}
              onChange={(e) => setOverallEnd(e.target.value)}
              className="form-input"
            />
          </div>
        </AccordionSection>

        {/* Weekly Availability */}
        <AccordionSection 
          title="Weekly Availability" 
          description="Specify your available study times for each day of the week."
          sectionKey="availability"
        >
          <DaySelectorRow
            days={Object.keys(availability)}
            availability={availability}
            onChange={handleChange}
          />
        </AccordionSection>

        {/* Syllabus Upload */}
        <AccordionSection 
          title="Upload Syllabus" 
          description="Upload your course syllabus to help extract key dates and topics."
          sectionKey="syllabus"
        >
          <div className="file-upload-container">
            <input
              type="file"
              id="syllabus"
              name="syllabus"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              className="file-input"
            />
            <label htmlFor="syllabus" className="upload-button">
              <Upload className="nav-icon" />
              {file ? file.name : 'Choose File'}
            </label>
          </div>
        </AccordionSection>

        {/* Specific Topics */}
        <AccordionSection 
          title="Specific Topics" 
          description="List any specific topics you want to prioritize in your study plan."
          sectionKey="topics"
        >
          <div className="form-group">
            <label htmlFor="topics">Topics:</label>
            <input
              type="text"
              id="topics"
              name="topics"
              onChange={(e) => setTopics(e.target.value)}
              className="form-input"
              placeholder="Enter topics you want to cover"
            />
          </div>
        </AccordionSection>

        {/* Study Preferences */}
        <AccordionSection 
          title="Study Preferences" 
          description="Choose a study method that best suits your learning style and productivity."
          sectionKey="preferences"
        >
          <div className="radio-group">
            {[
              { 
                value: 'deep_focus', 
                label: 'Deep Focus Sessions', 
                description: 'Longer, uninterrupted study blocks for intense concentration and deep learning.' 
              },
              { 
                value: 'pomodoro', 
                label: 'Pomodoro Technique', 
                description: 'Alternating focused work periods with short breaks to maintain high productivity.' 
              },
              { 
                value: 'spaced', 
                label: 'Spaced Repetition', 
                description: 'Reviewing material at increasing intervals to improve long-term retention.' 
              }
            ].map((preference) => (
              <div key={preference.value} className="radio-option">
                <input
                  type="radio"
                  id={preference.value}
                  name="studyPreference"
                  value={preference.value}
                  checked={studyPreference === preference.value}
                  onChange={(e) => setStudyPreference(e.target.value)}
                />
                <div className="radio-label-group">
                  <label htmlFor={preference.value}>{preference.label}</label>
                  <p className="radio-description">{preference.description}</p>
                </div>
              </div>
            ))}
          </div>
        </AccordionSection>

        <button 
          type="submit" 
          className="submit-button"
        >
          Generate Study Plan
        </button>
      </form>
    </div>
  );
};

export default StudyPlan;