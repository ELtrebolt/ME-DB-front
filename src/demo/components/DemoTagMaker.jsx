import React, { useCallback, useEffect, useState } from 'react';
import { ReactTags } from 'react-tag-autocomplete';
import { matchSorter } from 'match-sorter';
import { useDemoData } from '../hooks/useDemoData';

const DemoTagMaker = ({ mediaType, media, setMedia, alreadySelected, placeholder, hideLabel = false, size = 'normal', zIndex = 1000 }) => {
  // Get unique tags from demo data
  const { uniqueTags } = useDemoData(mediaType);
  
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState([]);

  // Build suggestions from uniqueTags
  useEffect(() => {
    if (uniqueTags && uniqueTags.length > 0) {
      const all_tags = uniqueTags.map((t, index) => ({ value: index, label: t }));
      setSuggestions(all_tags);
      
      // Set already selected tags
      if (alreadySelected && alreadySelected.length > 0 && selected.length === 0) {
        const alreadySelectedList = [];
        uniqueTags.forEach((t, index) => {
          for (const s of alreadySelected) {
            if (s === t || s['label'] === t) {
              alreadySelectedList.push({ value: index, label: t });
              break;
            }
          }
        });
        if (alreadySelectedList.length > 0) {
          setSelected(alreadySelectedList);
        }
      }
    }
  }, [uniqueTags, alreadySelected, selected.length]);

  // Handle initial alreadySelected tags
  useEffect(() => {
    if (alreadySelected && alreadySelected.length > 0 && selected.length === 0) {
      // Convert to proper format if needed
      const formattedSelected = alreadySelected.map((s, index) => {
        if (typeof s === 'string') {
          return { value: index, label: s };
        }
        return s;
      });
      setSelected(formattedSelected);
    }
  }, [alreadySelected, selected.length]);

  function suggestionsTransform(value, suggestions) {
    return matchSorter(suggestions, value, { keys: ['label'] });
  }

  const onAdd = useCallback(
    (newTag) => {
      const newSelected = [...selected, newTag];
      setSelected(newSelected);
      setMedia({ ...media, tags: newSelected.map(item => item.label) });
    },
    [selected, media, setMedia]
  );

  const onDelete = useCallback(
    (tagIndex) => {
      const newSelected = selected.filter((_, i) => i !== tagIndex);
      setSelected(newSelected);
      setMedia({ ...media, tags: newSelected.map(item => item.label) });
    },
    [selected, media, setMedia]
  );

  const baseContainerStyle = {
    position: 'relative',
    zIndex: zIndex,
    overflow: 'visible'
  };

  const containerStyle = size === 'small' ? {
    ...baseContainerStyle,
    fontSize: '0.75rem'
  } : size === 'extra-small' ? {
    ...baseContainerStyle,
    fontSize: '0.7rem'
  } : baseContainerStyle;

  const reactTagsStyle = size === 'small' ? {
    fontSize: '0.75rem',
    minHeight: '28px'
  } : size === 'extra-small' ? {
    fontSize: '0.7rem',
    minHeight: '26px'
  } : {};

  return (
    <>
      {!hideLabel && <label className="form-label fw-semibold text-white edit-media-mobile-label">Tags (Optional)</label>}
      <div style={containerStyle}>
        <ReactTags
          selected={selected}
          suggestions={suggestions}
          onAdd={onAdd}
          onDelete={onDelete}
          noOptionsText="No matching tags"
          allowNew={true}
          suggestionsTransform={suggestionsTransform}
          placeholderText={placeholder}
          style={reactTagsStyle}
        />
      </div>
    </>
  );
};

export default DemoTagMaker;
