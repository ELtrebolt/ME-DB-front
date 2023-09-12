import React, { useCallback } from 'react'
import { ReactTags } from 'react-tag-autocomplete'
import { matchSorter } from 'match-sorter'

const Function = ({tagsList, selected, setSelected, setSearchChanged}) => {
  const suggestions = tagsList.map((name, index) => ({ value: index, label: name }))
  function suggestionsTransform(value, suggestions) {
    return matchSorter(suggestions, value, { keys: ['label'] })
  }

  const onAdd = useCallback(
    (newTag) => {
      setSelected([...selected, newTag]);
      console.log("Added Tag:", newTag)
      setSearchChanged(true);
    },
    [selected, setSelected, setSearchChanged]
  )

  const onDelete = useCallback(
    (tagIndex) => {
      console.log("Deleting Tag:", selected[tagIndex]);
      setSelected(selected.filter((_, i) => i !== tagIndex));
      setSearchChanged(true);
    },
    [selected, setSelected, setSearchChanged]
  )

  return (
    <><label>Filter By Tags</label><ReactTags
      labelText="Select countries"
      selected={selected}
      suggestions={suggestions}
      onAdd={onAdd}
      onDelete={onDelete}
      noOptionsText="No matching tags" 
      suggestionsTransform={suggestionsTransform}/></>
  )
}

export default Function;