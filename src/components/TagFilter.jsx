import React, { useCallback } from 'react'
import { ReactTags } from 'react-tag-autocomplete'
import { matchSorter } from 'match-sorter'
import { useNavigate, useLocation } from 'react-router-dom'

const Function = ({suggestedTags, selected, setSelected, setSearchChanged}) => {
  console.log('TagFilter props:', { suggestedTags, selected, setSelected, setSearchChanged });
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const suggestions = suggestedTags;
  // suggested and selected are lists of { value: index, label: name }

  function suggestionsTransform(value, suggestions) {
    return matchSorter(suggestions, value, { keys: ['label'] })
  }

  // Function to update URL with selected tags
  const updateURLWithTags = useCallback((newSelected) => {
    const urlParams = new URLSearchParams(location.search);
    
    if (newSelected && newSelected.length > 0) {
      // Add tags to URL
      const tagLabels = newSelected.map(tag => tag.label).join(',');
      urlParams.set('tags', tagLabels);
      
      // Add 'from' parameter to track which page type these tags belong to
      // Extract media type and group from pathname (e.g., /anime/collection -> anime, collection)
      const pathParts = location.pathname.split('/');
      if (pathParts.length >= 3) {
        const group = pathParts[2];
        urlParams.set('from', group);
      }
      
      console.log('TagFilter: Adding tags to URL:', tagLabels);
    } else {
      // Remove tags from URL
      urlParams.delete('tags');
      urlParams.delete('from');
      console.log('TagFilter: Removing tags from URL');
    }
    
    // Update URL without triggering a page reload
    const newURL = `${location.pathname}?${urlParams.toString()}`;
    console.log('TagFilter: Updating URL to:', newURL);
    navigate(newURL, { replace: true });
  }, [location.search, location.pathname, navigate]);

  const onAdd = useCallback(
    (newTag) => {
      console.log('TagFilter onAdd called with:', newTag);
      const newSelected = [...selected, newTag];
      console.log('TagFilter: Setting new selected tags:', newSelected);
      setSelected(newSelected);
      updateURLWithTags(newSelected);
      console.log("Added Tag:", newTag)
      setSearchChanged(true);
    },
    [selected, setSelected, setSearchChanged, updateURLWithTags]
  )

  const onDelete = useCallback(
    (tagIndex) => {
      console.log('TagFilter onDelete called with index:', tagIndex);
      console.log("Deleting Tag:", selected[tagIndex]);
      const newSelected = selected.filter((_, i) => i !== tagIndex);
      console.log('TagFilter: Setting new selected tags after delete:', newSelected);
      setSelected(newSelected);
      updateURLWithTags(newSelected);
      setSearchChanged(true);
    },
    [selected, setSelected, setSearchChanged, updateURLWithTags]
  )

  return (
    <div className='w-100'>
      <label htmlFor='tagFilter-input' className='form-label fw-semibold text-white mb-2'>Filter By Tags</label>
      <ReactTags
        id='tagFilter'
        selected={selected}
        suggestions={suggestions}
        onAdd={onAdd}
        onDelete={onDelete}
        noOptionsText="No matching tags" 
        suggestionsTransform={suggestionsTransform}
      />
    </div>
  )
}

export default Function;