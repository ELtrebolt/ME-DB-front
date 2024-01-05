import React, { useState } from 'react';
import axios from 'axios';
const constants = require('../constants');

function EditableText({title, mediaType, group, tier, setUserChanged, newType}) {
  const [text, setText] = useState(title);
  const [editedText, setEditedText] = useState(text); // Store edited text separately
  const [isEditing, setIsEditing] = useState(false);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event) => {
    setEditedText(event.target.value);
  };

  const handleInputBlur = () => {
    setEditedText(text);
    setIsEditing(false);
  };

  const handleCheckmarkMouseDown = (event) => {
    event.preventDefault();
    // console.log("CheckmarkMouseDown")
    group = group === 'to-do' ? 'todo' : 'collection'
    axios
    .put(constants['SERVER_URL'] + `/api/user/${mediaType}/${group}/${tier}`, {newTitle: editedText, newType: newType})
    .then((res) => {
      console.log("Updated Tier Title");
      setText(editedText); 
      setIsEditing(false);
      // Keeps changes when switching from to-do list and collection
      setUserChanged(true);
    })
    .catch((err) => {
      console.log('Error in TierTitle!');
    });
  };

  const inputStyle = {
    width: editedText.length > 6 ? `${editedText.length * 25}px` : '150px',
  };

  return (
    <div>
      {isEditing ? (
        <div className="centered-container">
            <input
                type="text"
                value={editedText}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                style={inputStyle}
                autoFocus // Focus on the input when in edit mode
                className='center-input'
            />
            <span className="checkmark" onMouseDown={handleCheckmarkMouseDown}>
                &#10003; {/* Checkmark symbol */}
            </span>
        </div>
      ) : (
        <div>
            <h2 className='display-8 text-center' onDoubleClick={handleDoubleClick}>{text}</h2>
        </div>
      )}
    </div>
  );
}

export default EditableText;
