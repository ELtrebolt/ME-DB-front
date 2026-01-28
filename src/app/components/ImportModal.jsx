import React, { useState } from 'react';
import axios from 'axios';
import Modal from './ui/Modal';
const constants = require('../constants');

function ImportModal({ show, setShow, user, onImportComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [importStats, setImportStats] = useState({ success: 0, failed: 0, byType: {} });
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [errorLog, setErrorLog] = useState([]);

  const handleClose = () => {
    if (uploading) return; // Prevent closing while uploading
    setShow(false);
    setFile(null);
    setProgress(0);
    setStatus('');
    setErrorLog([]);
    setCompleted(false);
    setImportStats({ success: 0, failed: 0, byType: {} });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorLog([]);
      setStatus('');
      setCompleted(false);
    }
  };

  const parseCSVLine = (text) => {
    const result = [];
    let cell = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          cell += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cell);
        cell = '';
      } else {
        cell += char;
      }
    }
    result.push(cell);
    return result;
  };

  const processImport = async () => {
    if (!file) return;

    setUploading(true);
    setStatus('Reading file...');
    setProgress(0);
    setErrorLog([]);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          throw new Error('File is empty or missing headers');
        }

        const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
        const dataRows = lines.slice(1);
        const totalRows = dataRows.length;
        
        let successCount = 0;
        let failCount = 0;
        let typeStats = {};

        // Map headers to object keys
        // Expected headers: Title, Year, Tier, Tags, Description, ToDo, Type (ShowMediaList format)
        // OR: Media Type, Title, Tier, To-Do, Year, Tags, Description (Navbar format)
        
        const getIndex = (names) => headers.findIndex(h => names.some(n => h === n.toLowerCase()));
        
        const idxMap = {
          title: getIndex(['title']),
          year: getIndex(['year']),
          tier: getIndex(['tier']),
          tags: getIndex(['tags']),
          description: getIndex(['description']),
          toDo: getIndex(['todo', 'to-do']),
          mediaType: getIndex(['type', 'media type'])
        };

        if (idxMap.title === -1) {
          throw new Error('Required column "Title" missing in CSV');
        }

        // If 'Type' is missing, try to infer it from filename or ask user (for now, assume filename or error)
        // But the user said they had "Type" column, so maybe it wasn't detected because of case/whitespace
        if (idxMap.mediaType === -1) {
             // Fallback: check if there's a column that contains "type" at all
             const potentialTypeIdx = headers.findIndex(h => h.includes('type'));
             if (potentialTypeIdx !== -1) {
                 idxMap.mediaType = potentialTypeIdx;
             } else {
                 throw new Error('Required column "Type" missing in CSV');
             }
        }

        // Process sequentially to ensure IDs are assigned correctly and avoid race conditions
        const CHUNK_SIZE = 1; 
        
        for (let i = 0; i < totalRows; i += CHUNK_SIZE) {
          const chunk = dataRows.slice(i, i + CHUNK_SIZE);
          
          // Process chunk and return results for counters
          const chunkResults = await Promise.all(chunk.map(async (row, chunkIndex) => {
            try {
              const cols = parseCSVLine(row);
              // Basic validation
              if (cols.length < headers.length - 2) { // Allow some missing trailing columns
                 // Skip empty rows
                 if (cols.length === 1 && cols[0] === '') return { status: 'skipped' };
              }

              const getValue = (idx) => idx !== -1 && cols[idx] ? cols[idx].trim() : '';
              
              let mediaType = getValue(idxMap.mediaType);
              const title = getValue(idxMap.title);

              if (!mediaType || !title) return { status: 'skipped' }; // Skip invalid

              // Normalize mediaType to match DB keys (lowercase, kebab-case)
              mediaType = mediaType.toLowerCase().replace(/ /g, '-');

              const toDoVal = getValue(idxMap.toDo).toLowerCase();
              const toDo = toDoVal === 'yes' || toDoVal === 'true';
              const yearStr = getValue(idxMap.year);
              let year;
              if (yearStr) {
                if (/^\d{4}$/.test(yearStr)) {
                  year = new Date(`${yearStr}-01-01`).toISOString();
                } else {
                  const date = new Date(yearStr);
                  year = isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
                }
              } else {
                year = new Date().toISOString();
              }
              const tagsRaw = getValue(idxMap.tags);
              // Handle pipe | or comma , separator
              const tags = tagsRaw ? (tagsRaw.includes('|') ? tagsRaw.split('|') : tagsRaw.split(',')) : [];
              const tier = getValue(idxMap.tier) || 'F';
              const description = getValue(idxMap.description);

              if (!mediaType || !title) return { status: 'skipped' }; // Skip invalid

              // Determine if newType
              const isNewType = !constants.STANDARD_MEDIA_TYPES.includes(mediaType);

              const payload = {
                media: {
                  mediaType,
                  title,
                  tier,
                  toDo,
                  year,
                  tags: tags.map(t => t.trim()),
                  description
                },
                newType: isNewType
              };

              await axios.post(constants['SERVER_URL'] + '/api/media', payload, { withCredentials: true });
              return { status: 'success', type: mediaType };
            } catch (err) {
              const rowIndex = i + chunkIndex + 2;
              console.error(`Row ${rowIndex} error:`, err);
              return { status: 'error', msg: `Row ${rowIndex}: ${err.message || 'Failed'}` };
            }
          }));

          // Update counters based on results
          let chunkSuccess = 0;
          let chunkFail = 0;
          const chunkTypeStats = {};
          
          chunkResults.forEach(res => {
            if (res.status === 'success') {
                chunkSuccess++;
                chunkTypeStats[res.type] = (chunkTypeStats[res.type] || 0) + 1;
            }
            else if (res.status === 'error') {
              chunkFail++;
              setErrorLog(prev => [...prev, res.msg]);
            }
          });
          
          successCount += chunkSuccess;
          failCount += chunkFail;
          
          // Merge chunk type stats into main stats
          Object.entries(chunkTypeStats).forEach(([type, count]) => {
              typeStats[type] = (typeStats[type] || 0) + count;
          });
          
          const currentProgress = Math.round(((i + chunk.length) / totalRows) * 100);
          setProgress(currentProgress);
          setStatus(`Importing... ${successCount} success, ${failCount} failed`);
        }

        setStatus(`Completed! ${successCount} imported, ${failCount} failed.`);
        setUploading(false);
        setCompleted(true);
        setImportStats({ success: successCount, failed: failCount, byType: typeStats });
        
        if (onImportComplete) onImportComplete();
        // Removed auto-close timeout

      } catch (err) {
        setStatus(`Error: ${err.message}`);
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Modal
      show={show}
      onClose={handleClose}
      title="Import List from CSV"
      dialogClassName="modal-dialog-centered"
      showCloseButton={!uploading}
      footer={!uploading && (
        completed ? (
          <button type="button" className="btn btn-success px-4" onClick={handleClose}>Done</button>
        ) : (
          <>
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancel</button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={processImport}
              disabled={!file}
            >
              Start Import
            </button>
          </>
        )
      )}
    >
      {!uploading && !completed ? (
        <>
          <p className="text-muted mb-3">
            Upload a CSV file exported from ME-DB. 
            Existing records with same titles may be duplicated.
          </p>
          <div className="mb-3">
            <input 
              className="form-control" 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>
        </>
      ) : completed ? (
        <div className="text-center">
          <div className="mb-4">
            <i className="fas fa-check-circle text-success" style={{fontSize: '3rem'}}></i>
            <h4 className="mt-3">Import Complete</h4>
          </div>
          <div className="row mb-3">
            <div className="col-6 text-end border-end">
              <h2 className="text-success mb-0">{importStats.success}</h2>
              <small className="text-muted">Imported</small>
            </div>
            <div className="col-6 text-start">
              <h2 className="text-danger mb-0">{importStats.failed}</h2>
              <small className="text-muted">Failed</small>
            </div>
          </div>
          {Object.keys(importStats.byType).length > 0 && (
            <div className="card bg-light mb-3">
              <div className="card-body py-2">
                <h6 className="card-title text-muted mb-2" style={{fontSize: '0.8rem'}}>RECORDS ADDED</h6>
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  {Object.entries(importStats.byType).map(([type, count]) => (
                    <button 
                      key={type} 
                      onClick={() => { window.location.href = `/${type}/collection`; }}
                      className="badge bg-secondary text-decoration-none border-0"
                      style={{ transition: 'opacity 0.2s', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                      onMouseOver={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                      onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}: {count} <i className="fas fa-arrow-right ms-1" style={{fontSize: '0.7em'}}></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-3">
          <h5 className="mb-3">{status}</h5>
          <div className="progress mb-3" style={{height: '25px'}}>
            <div 
              className="progress-bar progress-bar-striped progress-bar-animated" 
              role="progressbar" 
              style={{width: `${progress}%`}}
              aria-valuenow={progress} 
              aria-valuemin="0" 
              aria-valuemax="100"
            >
              {progress}%
            </div>
          </div>
        </div>
      )}
      {errorLog.length > 0 && (
        <div className="alert alert-warning mt-3" style={{maxHeight: '150px', overflowY: 'auto'}}>
          <strong>Errors:</strong>
          <ul className="mb-0 ps-3">
            {errorLog.map((err, idx) => <li key={idx}><small>{err}</small></li>)}
          </ul>
        </div>
      )}
    </Modal>
  );
}

export default ImportModal;

