import React, { useCallback, useEffect } from 'react'
import { ReactTags } from 'react-tag-autocomplete'
import { useNavigate } from 'react-router-dom';
import { suggestionsByLabel } from '../helpers';
const constants = require('../constants');

const SearchBar = ({mediaType, allMedia, searchQuery, setSearchQuery, setSearchChanged, basePath = ''}) => {
  const navigate = useNavigate();
  var selected = []
  var suggestions = [];
  for(const tier of Object.keys(allMedia)) {
    for(const m of allMedia[tier]) {
      suggestions.push({ value: m.ID, label: m.title })
    }
  }

  useEffect(() => {
    setSearchChanged(true);
  }, [searchQuery, setSearchChanged]);

  function onChange(value) {
    setSearchQuery(value.toLowerCase());
  };

  const onAdd = useCallback(
    (media) => {
      navigate(`${basePath}/${mediaType}/${media.value}`)
    }, [navigate, mediaType, basePath]
  )

  const onDelete = useCallback(
    (media) => {
      // console.log("Deleting Selection");
    }, []
  )
  
  const noOptionsText = `No matching ${mediaType}`;
  return (
    <div className="text-start">
      <label htmlFor='searchBar-input' className='form-label fw-semibold text-white mb-2 text-start d-block'>Search by Title</label>
      <ReactTags
        id='searchBar'
        placeholderText={constants[mediaType] && constants[mediaType].title ? constants[mediaType].title : constants['other'].title}
        selected={selected}
        suggestions={suggestions}
        onAdd={onAdd}
        onInput={onChange}
        onDelete={onDelete}
        noOptionsText={noOptionsText}
        suggestionsTransform={suggestionsByLabel}
      />
    </div>
  );
};

export default SearchBar;