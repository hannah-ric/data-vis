import { useState } from 'react';
import Papa from 'papaparse';
import { validateFile, validateFileContent, sanitizeData } from '../utils/fileValidation';

export function useFileProcessor() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);
    
    // Store file reference for type detection
    window._lastUploadedFile = file;
    
    try {
      // Validate file before processing
      validateFile(file);
      
      const fileName = file.name.toLowerCase();
      const extension = fileName.substring(fileName.lastIndexOf('.'));
      
      let parsedData = null;
      
      switch (extension) {
        case '.csv':
          parsedData = await parseCSV(file);
          break;
        case '.json':
          parsedData = await parseJSON(file);
          break;
        case '.xlsx':
          parsedData = await parseExcel(file);
          break;
        default:
          throw new Error(`Unsupported file type: ${extension}`);
      }
      
      // Validate content
      await validateFileContent(parsedData, extension);
      
      // Sanitize data
      const sanitizedData = sanitizeData(parsedData);
      
      setData(sanitizedData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to process file');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target.result;
        try {
          const result = Papa.parse(csv, { 
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            transformHeader: (header) => header.trim()
          });
          
          if (result.errors && result.errors.length > 0) {
            // Filter out empty line errors
            const significantErrors = result.errors.filter(
              err => err.type !== 'Delimiter' && err.code !== 'UndetectableDelimiter'
            );
            if (significantErrors.length > 0) {
              throw new Error(significantErrors[0].message);
            }
          }
          
          // Filter out empty rows
          const filteredData = result.data.filter(row => 
            Object.values(row).some(val => val !== null && val !== '')
          );
          
          resolve(filteredData);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const parseJSON = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          
          // Handle different JSON structures
          let data;
          if (Array.isArray(json)) {
            data = json;
          } else if (json.data && Array.isArray(json.data)) {
            data = json.data;
          } else if (typeof json === 'object') {
            // Convert single object to array
            data = [json];
          } else {
            throw new Error('Invalid JSON structure. Expected array or object.');
          }
          
          resolve(data);
        } catch (err) {
          reject(new Error(`Invalid JSON: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const parseExcel = async (file) => {
    // Excel support requires additional package
    // For now, provide helpful error message
    throw new Error(
      'Excel file support is not yet implemented. ' +
      'Please save your Excel file as CSV format: ' +
      'File → Save As → Choose "CSV (Comma delimited)" as file type.'
    );
    
    // Note: To add Excel support in the future:
    // 1. npm install xlsx
    // 2. import * as XLSX from 'xlsx';
    // 3. Implement parsing logic
  };

  return { data, handleFileUpload, error, loading };
}
