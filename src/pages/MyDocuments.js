import React, { useEffect, useState } from 'react';

const MyDocuments = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('http://localhost:5001/list-files');
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setFiles(data.files || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  if (loading) {
    return <p>Loading files...</p>;
  }

  if (error) {
    return <p>Error loading files: {error}</p>;
  }

  return (
    <div>
      <h2>My Documents</h2>
      {files.length === 0 ? (
        <p>No documents found.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {files.map((file, index) => (
            <li
              key={index}
              style={{
                marginBottom: '10px',
                padding: '10px',
                border: '1px solid #e0e4e8',
                borderRadius: '5px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: 'none',
                  color: '#007bff',
                  fontWeight: 'bold',
                }}
              >
                {file.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyDocuments;
