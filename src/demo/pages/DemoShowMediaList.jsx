import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ShowMediaList from '../../app/pages/ShowMediaList';
import { useDemoData } from "../hooks/useDemoData";
import { useDemoTierTitles } from "../hooks/useDemoTierTitles";
import { useDemoDescriptions } from "../hooks/useDemoDescriptions";

const DemoShowMediaList = ({ toDo }) => {
  const { mediaType } = useParams();
  const toDoString = toDo ? 'to-do' : 'collection';
  
  const { 
    loading, 
    getMediaByTier,
    reorderInTier, 
    moveToTier 
  } = useDemoData(mediaType);

  const { 
    setTierTitle, 
    overrides: tierTitleOverrides
  } = useDemoTierTitles();

  const {
    getDescription,
    setDescription
  } = useDemoDescriptions();

  const [filteredData, setFilteredData] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  // Callback to get media by tier
  const handleGetMediaByTier = useCallback((toDoState) => {
    return getMediaByTier(toDoState);
  }, [getMediaByTier]);

  // Callback to reorder in tier
  const handleReorderInTier = useCallback((tier, toDoState, orderedIds) => {
    reorderInTier(tier, toDoState, orderedIds);
  }, [reorderInTier]);

  // Callback to move to tier
  const handleMoveToTier = useCallback((mediaId, destTier, destIndex) => {
    moveToTier(mediaId, destTier, destIndex);
  }, [moveToTier]);

  // Callback to save tier title override
  const handleTierTitleSave = useCallback((tier, newTitle) => {
    setTierTitle(mediaType, toDoString, tier, newTitle);
  }, [mediaType, toDoString, setTierTitle]);

  // Callback to save description
  const handleDescriptionSave = useCallback((description) => {
    setDescription(mediaType, toDoString, description);
  }, [mediaType, toDoString, setDescription]);

  // Show loading while data is being fetched
  if (loading) {
    return <div className="text-center p-5 text-white">Loading...</div>;
  }

  return (
    <ShowMediaList
      toDo={toDo}
      dataSource="demo"
      basePath="/demo"
      onGetMediaByTier={handleGetMediaByTier}
      onReorderInTier={handleReorderInTier}
      onMoveToTier={handleMoveToTier}
      filteredData={filteredData}
      setFilteredData={setFilteredData}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      tierTitleOverrides={tierTitleOverrides}
      onTierTitleSave={handleTierTitleSave}
      descriptionOverride={getDescription(mediaType, toDoString)}
      onDescriptionSave={handleDescriptionSave}
    />
  );
};

export default DemoShowMediaList;
