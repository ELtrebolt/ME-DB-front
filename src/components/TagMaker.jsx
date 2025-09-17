import React, { useCallback, useEffect, useState } from 'react'
import { ReactTags } from 'react-tag-autocomplete'
import { matchSorter } from 'match-sorter'
import axios from 'axios';

const constants = require('../constants');

const TagMaker = ({mediaType, media, setMedia, alreadySelected, placeholder, hideLabel = false, size = 'normal'}) => {
  const [suggestions, setSuggestions] = useState();
  // list of {value, label}
  const [selected, setSelected] = useState([]);

  // Debug logging
  console.log('TagMaker props:', { mediaType, alreadySelected, placeholder });
  console.log('TagMaker state:', { suggestions, selected });

  // get suggestions by iterating through all current media
  useEffect(() => {
    console.log('TagMaker useEffect running with:', { mediaType, alreadySelected, suggestions });
    console.log('alreadySelected type:', typeof alreadySelected, 'length:', alreadySelected?.length);
    console.log('alreadySelected content:', alreadySelected);
    
    // Get suggestions if they don't exist
    if(!suggestions) {
      axios
      .get(constants['SERVER_URL'] + '/api/media/' + mediaType + '/tags')
      .then((res) => {
        console.log(`TagMaker GET ${mediaType}/tags`, res.data);
        var all_tags = [];
        var alreadySelectedList = [];
        // keep tag IDs the same betwen ToDo and Collection
        // keep alreadySelected Tags even if they are not in the other group
        if (res.data.uniqueTags) {
          res.data.uniqueTags.forEach((t, index) => {
            if(alreadySelected && alreadySelected.length > 0) {
              console.log('Checking tag:', t, 'against alreadySelected:', alreadySelected);
              for(const s of alreadySelected) {
                console.log('Comparing:', s, 'with:', t);
                if(s === t || s['label'] === t) {
                  console.log('Match found! Adding to alreadySelectedList');
                  alreadySelectedList.push({value:index, label:t});
                  break;
                }
              }
            }
            all_tags.push({value:index, label:t})
          })
        }
        console.log('Setting suggestions and selected:', { all_tags, alreadySelectedList });
        setSuggestions(all_tags);  
        setSelected(alreadySelectedList);
      })
      .catch((err) => {
        console.log(err);
      });
    } else {
      // If suggestions exist, only update selected tags if they haven't been set yet
      if (selected.length === 0 && alreadySelected && alreadySelected.length > 0 && suggestions) {
        console.log('Updating selected tags with alreadySelected:', alreadySelected);
        var alreadySelectedList = [];
        suggestions.forEach((t, index) => {
          for(const s of alreadySelected) {
            if(s === t || s['label'] === t) {
              alreadySelectedList.push({value:index, label:t});
              break;
            }
          }
        });
        console.log('Updating selected tags:', alreadySelectedList);
        setSelected(alreadySelectedList);
      }
    }
  }, [mediaType, suggestions, alreadySelected, selected.length]);

  // Separate effect to handle initial alreadySelected tags
  useEffect(() => {
    if (alreadySelected && alreadySelected.length > 0 && selected.length === 0) {
      console.log('Setting initial selected tags from alreadySelected:', alreadySelected);
      setSelected(alreadySelected);
    }
  }, [alreadySelected, selected.length]);

  function suggestionsTransform(value, suggestions) {
    return matchSorter(suggestions, value, { keys: ['label'] })
  }

  const onAdd = useCallback(
    (newTag) => {
      const newSelected = [...selected, newTag];
      setSelected(newSelected);
      setMedia({ ...media, tags: newSelected.map(item => item.label) });
      console.log("Added Tag:", newTag.label);
    },
    [selected, setSelected, media, setMedia]
  )

  const onDelete = useCallback(
    (tagIndex) => {
      console.log("Deleting Tag:", selected[tagIndex].label);
      const newSelected = selected.filter((_, i) => i !== tagIndex);
      setSelected(newSelected);
      setMedia({ ...media, tags: newSelected.map(item => item.label) });
    },
    [selected, setSelected, media, setMedia]
  )

  if(selected !== null) {
    const containerStyle = size === 'small' ? { 
      fontSize: '0.75rem',
      position: 'relative',
      zIndex: 1000,
      overflow: 'visible'
    } : size === 'extra-small' ? { 
      fontSize: '0.7rem',
      position: 'relative',
      zIndex: 1000,
      overflow: 'visible'
    } : {
      position: 'relative',
      zIndex: 1000,
      overflow: 'visible'
    };
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
    )
  }
  
  return null;
}

export default TagMaker;