import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function DemoTierTitle({title, mediaType, group, tier}) {
  // Default demo title includes hint text
  const defaultTitle = `${tier} - Double Click to Edit`;
  // Only use custom title if it's different from the tier letter
  const initialTitle = (title && title !== tier) ? title : defaultTitle;
  const [text, setText] = useState(initialTitle);
  const [editedText, setEditedText] = useState(tier); // Start editing with just the tier letter
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Update text when title prop changes (only if it's a custom title)
  React.useEffect(() => {
    if (title && title !== tier) {
      setText(title);
      if (!isEditing) setEditedText(title);
    }
  }, [title, tier, isEditing]);

  const handleDoubleClick = () => {
    // When double-clicking, start with just the tier letter if showing default hint
    if (text.includes('Double Click to Edit')) {
      setEditedText(tier);
    } else {
      setEditedText(text);
    }
    setIsEditing(true);
  };
  const handleInputChange = (event) => setEditedText(event.target.value);
  const handleInputBlur = () => { 
    // Restore previous text on blur (cancel edit)
    if (text.includes('Double Click to Edit')) {
      setEditedText(tier);
    } else {
      setEditedText(text);
    }
    setIsEditing(false); 
  };

  // In demo mode, just update local state (not persisted to backend)
  const handleCheckmarkMouseDown = (event) => {
    event.preventDefault();
    setText(editedText);
    setIsEditing(false);
    // Note: In demo mode, tier title changes are not persisted
  };

  const inputStyle = { 
    width: `${Math.min(Math.max((editedText || '').length * 18, 120), Math.min(window.innerWidth * 0.6, 800))}px`,
    minWidth: '120px',
    maxWidth: `${Math.min(window.innerWidth * 0.6, 800)}px`
  };

  return (
    <div className='px-4'>
      {isEditing ? (
        <div className="d-flex align-items-center justify-content-center gap-3" style={{ position: 'relative' }}>
          <input
            type="text"
            value={editedText}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="form-control text-center fw-normal text-white fs-2"
            data-large-input="true"
            style={{
              ...inputStyle,
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '2px solid #f59e0b',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.2s ease',
              fontSize: 'clamp(18px, 5vw, 28px) !important',
              fontFamily: 'Roboto, sans-serif !important',
              padding: '8px 12px !important',
              minHeight: 'auto !important',
              height: 'auto !important',
              lineHeight: '1.2 !important',
              fontWeight: 'normal !important'
            }}
            autoFocus
            onFocus={(e) => {
              e.target.style.backgroundColor = 'rgba(30, 41, 59, 0.9)';
              e.target.style.borderColor = '#f59e0b';
            }}
          />
          <button 
            className="btn btn-success rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: '32px',
              height: '32px',
              transition: 'background-color 0.2s ease',
              fontSize: '14px',
              padding: '0',
              border: 'none'
            }}
            onMouseDown={handleCheckmarkMouseDown}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
            title="Save changes"
          >
            ✓
          </button>
        </div>
      ) : (
        <div className='d-flex align-items-center justify-content-center gap-3' style={{ position: 'relative' }}>
          <h2 className='text-center fs-2 fw-normal text-white' onDoubleClick={handleDoubleClick} style={{ 
            fontFamily: 'Roboto, sans-serif', 
            fontSize: 'clamp(18px, 5vw, 28px)',
            cursor: 'pointer'
          }}>{text}</h2>
          {/* Add button - navigates to demo create page */}
          <a
            href={`/demo/${mediaType}/${group}/create?tier=${tier}`}
            aria-label='Add new in this tier'
            title='Add New'
            className='tier-add-btn animate-scale-in btn btn-outline-warning rounded-circle d-flex align-items-center justify-content-center'
            style={{ 
              width: '32px',
              height: '32px',
              fontSize: '14px',
              padding: '0'
            }}
            onClick={(e) => {
              e.preventDefault();
              
              // Get current tags from URL
              const urlParams = new URLSearchParams(location.search);
              const currentTags = urlParams.get('tags');
              
              // Build the create URL with tier and tags
              let createURL = `/demo/${mediaType}/${group}/create?tier=${tier}`;
              if (currentTags) {
                createURL += `&tags=${currentTags}`;
              }
              
              navigate(createURL);
            }}
          >
            <span className='fs-5 fw-bold'>+</span>
          </a>
        </div>
      )}
    </div>
  );
}

export default DemoTierTitle;
