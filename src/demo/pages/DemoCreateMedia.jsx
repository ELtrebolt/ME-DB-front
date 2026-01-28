import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDemoData } from "../hooks/useDemoData";
import { useDemoTierTitles } from "../hooks/useDemoTierTitles";
import CreateMedia from '../../app/pages/CreateMedia';
const constants = require('../../app/constants');
const { STANDARD_TIERS } = constants;

/**
 * Demo wrapper for CreateMedia component
 * Uses demo data source and provides onCreateMedia callback
 */
const DemoCreateMedia = ({ toDo }) => {
  const { mediaType } = useParams();
  const { createMedia } = useDemoData(mediaType);
  const { overrides } = useDemoTierTitles();
  
  const handleCreateMedia = (mediaData) => {
    return createMedia(mediaData);
  };

  // Build mediaTypeLoc-like object from tier overrides so create page shows tier names like the detail page
  const mediaTypeLoc = useMemo(() => {
    const collectionTiers = {};
    const todoTiers = {};
    STANDARD_TIERS.forEach((tier) => {
      const cKey = `${mediaType}-collection-${tier}`;
      const tKey = `${mediaType}-to-do-${tier}`;
      collectionTiers[tier] = overrides[cKey] ?? `${tier} - Double Click to Edit`;
      todoTiers[tier] = overrides[tKey] ?? `${tier} - Double Click to Edit`;
    });
    return { collectionTiers, todoTiers };
  }, [mediaType, overrides]);

  return (
    <CreateMedia
      toDo={toDo}
      dataSource="demo"
      basePath="/demo"
      onCreateMedia={handleCreateMedia}
      useYearSelect={true}
      mediaTypeLoc={mediaTypeLoc}
    />
  );
};

export default DemoCreateMedia;
