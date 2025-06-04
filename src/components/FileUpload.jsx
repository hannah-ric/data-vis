import React from 'react';

export default function FileUpload({ onFileLoaded }) {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileLoaded(file);
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleChange} />
    </div>
  );
}
