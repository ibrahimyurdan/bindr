import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Upload 
} from 'lucide-react';
import './StudyPlanStyle.css';
import ReactMarkdown from 'react-markdown';

const DaySelectorRow = React.memo(({ days, availability, onChange }) => {
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
});


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
  const [existingFiles, setExistingFiles] = useState([]); // List of existing files
  const [selectedFile, setSelectedFile] = useState(""); // Selected file from dropdown
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [showResponse, setShowResponse] = useState(false);  // To control response visibility
  const [backendResponse, setBackendResponse] = useState('');  // Store backend response
  const [uploadStatus, setUploadStatus] = useState("");
  const [loading, setLoading] = useState(false);

  

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

    const handleChange = useCallback((day, timeType, timeValue) => {
      setAvailability((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [timeType]: timeValue,
        },
      }));
    }, []);


const handleDropdownChange = (e) => {
  const selected = e.target.value;
  setSelectedFile(selected); // Update the selected file
  setUploadedFileName(selected); // Update the uploadedFileName to match the selection
};


const handleFileChange = (e) => {
  const newFile = e.target.files[0];
  setFile(newFile); // Update the file to upload
  setSelectedFile(""); // Clear dropdown selection since a new file is chosen
};


  const handleUpload = async (e) => {
    e.preventDefault(); 
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch('http://localhost:5001/upload', {
          method: 'POST',
          body: formData,
        });

      const data = await res.json();
      setUploadStatus("File uploaded successfully!");

      } catch (error) {
        console.error("Upload error:", error);
        setUploadStatus("File upload failed. Please try again.");
      }
    } 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const formData = new FormData();
  
    // Add fields to formData only if they are not null or empty
    if (uploadedFileName) formData.append('fileName', uploadedFileName);
    if (availability && Object.values(availability).some(day => day.start || day.end)) {
      formData.append('availability', JSON.stringify(availability));
    }
    if (overallStart) formData.append('overallStart', overallStart);
    if (overallEnd) formData.append('overallEnd', overallEnd);
    if (topics) formData.append('topics', topics);
    if (studyPreference) formData.append('studyPreference', studyPreference);
  
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
  
      if (data.study_plan) {
        setBackendResponse(data.study_plan);
        setShowResponse(true);
      }
  
    } catch (error) {
      console.error('Error:', error);
    }
  };
  


  

  const toggleSection = useCallback((section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);
  


  const AccordionSection = memo(({ title, description, children, sectionKey }) => (
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
  ));

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

      {!showResponse ? (
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
          title="Choose Syllabus" 
          description="Upload your course syllabus to help extract key dates and topics."
          sectionKey="syllabus"
        >
          <div className="document-upload-section">
            {/* Select an Existing File Section */}
            <div className="file-select-container">
              <h3>Select an Existing File</h3>
              <select 
                value={selectedFile} 
                onChange={handleDropdownChange} // Use the updated handler
              >
                <option value="">Select an existing file</option>
                {existingFiles.map((file) => (
                  <option key={file.name} value={file.name}>
                    {file.name}
                  </option>
                ))}
              </select> 
            </div>

            {/* Upload a New File Section */}
            <div className="file-upload-container">
              <h3>Or Upload a New File</h3>
              <input 
                type="file" 
                onChange={handleFileChange} 
              />
              <button 
                onClick={handleUpload}
                className="upload-button"
              >
                <Upload className="nav-icon" /> Upload
              </button>
              {uploadStatus && <p>{uploadStatus}</p>}
            </div>
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
              autoFocus="autoFocus"
              name="topics"
              value={topics}
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
          disabled={loading}  // Disable the button while loading
        >
          {loading ? 'Loading...' : 'Generate Study Plan'}
        </button>
        </form>
    ) : (
      <div className="response-container">
        <h2>Your Generated Study Plan</h2>
        <ReactMarkdown>{backendResponse}</ReactMarkdown>
      </div>
    )}
    </div>
  );
};

export default StudyPlan;