import React, { useCallback, useEffect, useState } from 'react'
import { ReactTags } from 'react-tag-autocomplete'
import { matchSorter } from 'match-sorter'
import axios from 'axios';

const constants = require('../constants');

const TagMaker = ({mediaType, media, setMedia, alreadySelected}) => {
  const [suggestions, setSuggestions] = useState();
  // list of {value, label}
  const [selected, setSelected] = useState();

  // get suggestions by iterating through all current media
  useEffect(() => {
    // Suggestions DO NOT need to update if toDo is changed
    if(!suggestions) {
      axios
      .get(constants['SERVER_URL'] + '/api/media/' + mediaType + '/tags')
      .then((res) => {
        console.log(`TagMaker GET ${mediaType}/tags`, res.data);
        var all_tags = [];
        var alreadySelectedList = [];
        // keep tag IDs the same betwen ToDo and Collection
        // keep alreadySelected Tags even if they are not in the other group
        res.data.uniqueTags.forEach((t, index) => {
          if(alreadySelected) {
            for(const s of alreadySelected) {
              if(s === t) {
                alreadySelectedList.push({value:index, label:t});
                break;
              }
            }
          }
          all_tags.push({value:index, label:t})
        })
        setSuggestions(all_tags);  
        setSelected(alreadySelectedList);
      })
      .catch((err) => {
        console.log(err);
      });
    }
  });

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
      <label>Tags (Optional)</label><ReactTags
        selected={selected}
        suggestions={suggestions}
        onAdd={onAdd}
        onDelete={onDelete}
        noOptionsText="No matching tags" 
        allowNew={true}
        suggestionsTransform={suggestionsTransform}/></>
    )
  }
}

export default TagMaker;