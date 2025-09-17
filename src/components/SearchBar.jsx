import React, { useCallback, useEffect } from 'react'
import { ReactTags } from 'react-tag-autocomplete'
import { matchSorter } from 'match-sorter'
import { useNavigate } from 'react-router-dom';
const constants = require('../constants');

const Function = ({mediaType, allMedia, searchQuery, setSearchQuery, setSearchChanged}) => {
  const navigate = useNavigate();
  var selected = []
  var suggestions = [];
  for(const tier of Object.keys(allMedia)) {
    for(const m of allMedia[tier]) {
      suggestions.push({ value: m.ID, label: m.title })
    }
  }

  function suggestionsTransform(value, suggestions) {
    return matchSorter(suggestions, value, { keys: ['label'] })
  }

  useEffect(() => {
    console.log("Query:", searchQuery);
    setSearchChanged(true);
  }, [searchQuery, setSearchChanged]);


  function onChange(value) {
    setSearchQuery(value.toLowerCase());
  };

  const onAdd = useCallback(
    (media) => {
      console.log("Selected:", media.value, media.label)
      navigate(`/${mediaType}/${media.value}`)
    }, [navigate, mediaType]
  )

  const onDelete = useCallback(
    (media) => {
      console.log("Deleting Selection");
    }, []
  )
  
  const noOptionsText = `No matching ${mediaType}`;
  return (
    <div>
      <label htmlFor='searchBar-input' className='form-label fw-semibold text-white mb-2'>Search by Title</label>
      <ReactTags
        id='searchBar'
        placeholderText={constants[mediaType] && constants[mediaType].title ? constants[mediaType].title : constants['other'].title}
        selected={selected}
        suggestions={suggestions}
        onAdd={onAdd}
        onInput={onChange}
        onDelete={onDelete}
        noOptionsText={noOptionsText}
        suggestionsTransform={suggestionsTransform}
      />
    </div>
  )
}

export default Function;