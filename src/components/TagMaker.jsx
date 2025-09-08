import React, { useCallback, useEffect, useState } from 'react'
import { ReactTags } from 'react-tag-autocomplete'
import { matchSorter } from 'match-sorter'
import axios from 'axios';

const constants = require('../constants');

const TagMaker = ({mediaType, media, setMedia, alreadySelected, placeholder}) => {
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
      // If suggestions exist, just update the selected tags based on alreadySelected
      var alreadySelectedList = [];
      if (alreadySelected && alreadySelected.length > 0 && suggestions) {
        console.log('Updating selected tags with alreadySelected:', alreadySelected);
        suggestions.forEach((t, index) => {
          for(const s of alreadySelected) {
            if(s === t || s['label'] === t) {
              alreadySelectedList.push({value:index, label:t});
              break;
            }
          }
        });
      }
      console.log('Updating selected tags:', alreadySelectedList);
      setSelected(alreadySelectedList);
    }
  }, [mediaType, alreadySelected, suggestions]);

  // Add a separate effect to handle alreadySelected changes when suggestions are available
  useEffect(() => {
    if (suggestions && alreadySelected && alreadySelected.length > 0) {
      console.log('Processing alreadySelected with available suggestions:', { suggestions, alreadySelected });
      var alreadySelectedList = [];
      
      // First, try to find exact matches in suggestions
      suggestions.forEach((suggestion, index) => {
        for(const selectedTag of alreadySelected) {
          if (selectedTag.label === suggestion.label) {
            console.log('Found exact match:', selectedTag.label, 'at index:', index);
            alreadySelectedList.push({value: index, label: suggestion.label});
            break;
          }
        }
      });
      
      // If no exact matches found, try to create new tag objects
      if (alreadySelectedList.length === 0) {
        console.log('No exact matches found, creating new tag objects');
        alreadySelected.forEach((tag, index) => {
          if (tag.label) {
            alreadySelectedList.push({value: `custom-${index}`, label: tag.label});
          }
        });
      }
      
      console.log('Final alreadySelectedList:', alreadySelectedList);
      setSelected(alreadySelectedList);
    }
  }, [suggestions, alreadySelected]);

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
    return (
      <>
      <label className="tags-label fw-bold text-white">Tags (Optional)</label><ReactTags
        selected={selected}
        suggestions={suggestions}
        onAdd={onAdd}
        onDelete={onDelete}
        noOptionsText="No matching tags" 
        allowNew={true}
        suggestionsTransform={suggestionsTransform}
        placeholderText={placeholder}/></>
    )
  }
  
  return null;
}

export default TagMaker;