import React, { useCallback, useEffect } from 'react';
import { ReactTags } from 'react-tag-autocomplete';
import { matchSorter } from 'match-sorter';
import { useNavigate } from 'react-router-dom';

const constants = {
  anime: { title: 'Search anime...' },
  tv: { title: 'Search TV shows...' },
  movies: { title: 'Search movies...' },
  games: { title: 'Search games...' },
  other: { title: 'Search...' }
};

const DemoSearchBar = ({mediaType, allMedia, searchQuery, setSearchQuery, setSearchChanged}) => {
  const navigate = useNavigate();
  var selected = [];
  var suggestions = [];
  
  for(const tier of Object.keys(allMedia)) {
    for(const m of allMedia[tier]) {
      suggestions.push({ value: m.ID, label: m.title });
    }
  }

  function suggestionsTransform(value, suggestions) {
    return matchSorter(suggestions, value, { keys: ['label'] });
  }

  useEffect(() => {
    setSearchChanged(true);
  }, [searchQuery, setSearchChanged]);

  function onChange(value) {
    setSearchQuery(value.toLowerCase());
  }

  const onAdd = useCallback(
    (media) => {
      // Navigate to demo detail page
      navigate(`/demo/${mediaType}/${media.value}`);
    }, [navigate, mediaType]
  );

  const onDelete = useCallback(
    (media) => {
      // No-op
    }, []
  );
  
  const noOptionsText = `No matching ${mediaType}`;
  const placeholder = constants[mediaType]?.title || constants.other.title;

  return (
    <div className="text-start">
      <label htmlFor='searchBar-input' className='form-label fw-semibold text-white mb-2 text-start d-block'>Search by Title</label>
      <ReactTags
        id='searchBar'
        placeholderText={placeholder}
        selected={selected}
        suggestions={suggestions}
        onAdd={onAdd}
        onInput={onChange}
        onDelete={onDelete}
        noOptionsText={noOptionsText}
        suggestionsTransform={suggestionsTransform}
      />
    </div>
  );
};

export default DemoSearchBar;
