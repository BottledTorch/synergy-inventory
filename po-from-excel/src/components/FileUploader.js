import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

const FileUploader = ({ onFileLoaded }) => {
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        onFileLoaded(json);
      } catch (err) {
        console.error(err);
        alert('File type not supported or file is corrupted');
      }
    };

    reader.readAsArrayBuffer(file);
  }, [onFileLoaded]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: '.xlsx, .xls'
  });

  return (
    <div className="dropzone" {...getRootProps()} style={dropzoneStyle}>
      <input {...getInputProps()} />
      <p>Drag 'n' drop your .xlsx file here, or click to select files</p>
    </div>
  );
};

const dropzoneStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: '2px',
  borderRadius: '2px',
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
  cursor: 'pointer',
};

export default FileUploader;
