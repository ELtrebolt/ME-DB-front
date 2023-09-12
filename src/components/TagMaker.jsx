import React, { useCallback, useEffect, useState } from 'react'
import { ReactTags } from 'react-tag-autocomplete'
import { matchSorter } from 'match-sorter'
import axios from 'axios';

const constants = require('../constants');

const TagMaker = ({mediaType, toDo, media, setMedia, alreadySelected}) => {
  const [toDoState, setToDoState] = useState();
  const [suggestions, setSuggestions] = useState();
  // list of {value, label}
  const [selected, setSelected] = useState(alreadySelected.map((name, index) => ({ value: index, label: name })));
  // get suggestions by iterating through all current media
  useEffect(() => {
    // Suggestions need to update if toDo is changed
    if(!suggestions || toDoState !== toDo) {
      const groupStr = toDo ? 'to-do' : 'collection'
      axios
      .get(constants['SERVER_URL'] + '/api/media/' + mediaType + '/' + groupStr)
      .then((res) => {
        console.log(`TagMaker GET ${mediaType}/${groupStr}`, res.data);
        var allTags = new Set();
        res.data.forEach((m) => {
          if(m.tags) {
            m.tags.forEach((t) => {
              allTags.add(t);
            })
          }
        })
        setSuggestions(Array.from(allTags).map((name, index) => ({ value: index, label: name })))  
        setToDoState(toDo);
      })
      .catch((err) => {
        console.log('Error from UpdateMediaInfo');
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

export default TagMaker;