import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShowMediaDetails from '../../app/pages/ShowMediaDetails';
import { useDemoData } from "../hooks/useDemoData";
import { useDemoTierTitles } from "../hooks/useDemoTierTitles";
const constants = require('../../app/constants');
const { STANDARD_TIERS } = constants;

const DemoShowMediaDetails = () => {
  const { mediaType, group } = useParams();
  const navigate = useNavigate();
  
  const { 
    data, 
    loading,
    getMediaById, 
    updateMedia, 
    deleteMedia,
    createMedia
  } = useDemoData(mediaType);

  const { overrides } = useDemoTierTitles();

  // Build media list from all data
  const mediaList = useMemo(() => {
    if (!data) return [];
    return data;
  }, [data]);

  // Build mediaTypeLoc-like object from tier overrides so detail page shows tier names like the list
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

  // Callback to get media by ID
  const handleGetMediaById = (id) => {
    return getMediaById(id);
  };

  // Callback to update media
  const handleUpdateMedia = (id, updatedData) => {
    return updateMedia(id, updatedData);
  };

  // Callback to delete media
  const handleDeleteMedia = (id) => {
    return deleteMedia(id);
  };

  // Callback to duplicate media. createMedia expects a flat media object.
  const handleDuplicateMedia = (duplicateData) => {
    return createMedia(duplicateData.media);
  };

  // Wait for demo data to load before rendering ShowMediaDetails. Otherwise
  // getMediaById returns null (data not ready) and we 404 immediately.
  if (loading) {
    return <div className="text-center p-5 text-white">Loading...</div>;
  }

  // Once loaded, if the requested ID doesn't exist, 404 before mounting ShowMediaDetails
  if (group && group !== 'collection' && group !== 'to-do' && !getMediaById(group)) {
    navigate('/404', { replace: true });
    return null;
  }

  return (
    <ShowMediaDetails
      dataSource="demo"
      basePath="/demo"
      onGetMediaById={handleGetMediaById}
      onUpdateMedia={handleUpdateMedia}
      onDeleteMedia={handleDeleteMedia}
      onDuplicateMedia={handleDuplicateMedia}
      mediaList={mediaList}
      mediaTypeLoc={mediaTypeLoc}
    />
  );
};

export default DemoShowMediaDetails;
