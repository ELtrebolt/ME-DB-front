import React, { useCallback } from 'react'
import { ReactTags } from 'react-tag-autocomplete'
import { suggestionsByLabel } from '../../helpers';

const Function = ({suggestedTags, selected, setSelected, setSearchChanged, tagLogic, setTagLogic, placeholder}) => {
  
  const suggestions = suggestedTags;
  // suggested and selected are lists of { value: index, label: name }

  const onAdd = useCallback(
    (newTag) => {
      const newSelected = [...selected, newTag];
      setSelected(newSelected);
      setSearchChanged(true);
      console.log("Added filter tag:", newTag.label);
    },
    [selected, setSelected, setSearchChanged]
  )

  const onDelete = useCallback(
    (tagIndex) => {
      console.log("Deleting filter tag:", selected[tagIndex].label);
      const newSelected = selected.filter((_, i) => i !== tagIndex);
      setSelected(newSelected);
      setSearchChanged(true);
    },
    [selected, setSelected, setSearchChanged]
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label htmlFor='tagFilter-input' className='form-label fw-semibold text-white mb-2'>Filter by Tags</label>
      </div>
      <ReactTags
        id='tagFilter'
        selected={selected}
        suggestions={suggestions}
        onAdd={onAdd}
        onDelete={onDelete}
        noOptionsText="No matching tags" 
        suggestionsTransform={suggestionsByLabel}
        placeholderText={placeholder}
      />
    </div>
  )
}

export default Function;
