import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toCapitalNotation } from "../helpers";
const constants = require('../constants');
const theme = require('../../styling/theme');

/**
 * SharedMediaDetails - Read-only version of ShowMediaDetails for shared/public views
 * Shows media details without edit, duplicate, or delete functionality
 */
function SharedMediaDetails() {
  const [media, setMedia] = useState({});
  const { username, mediaType, id } = useParams();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [tierTitles, setTierTitles] = useState({});
  const [ownerName, setOwnerName] = useState('');
  
  const location = useLocation();
  
  // Build back URL to the shared list
  const buildBackUrl = () => {
    const baseUrl = `/user/${username}/${mediaType}`;
    const currentSearch = location.search;
    return currentSearch ? `${baseUrl}${currentSearch}` : baseUrl;
  };
  
  // Fetch media details
  useEffect(() => {
    if (!loaded) {
      axios.get(`${constants['SERVER_URL']}/api/share/user/${username}/${mediaType}/${id}`)
        .then((res) => {
          if (res.data.success) {
            setMedia(res.data.media);
            setOwnerName(res.data.ownerName || username);
            
            // Set tier titles based on toDo status
            const titles = res.data.media.toDo 
              ? (res.data.todoTierTitles || constants.DEFAULT_TIER_LABELS)
              : (res.data.collectionTierTitles || constants.DEFAULT_TIER_LABELS);
            setTierTitles(titles);
            
            setLoaded(true);
          } else {
            setError('Media not found');
            setLoaded(true);
          }
        })
        .catch((err) => {
          console.error('Error fetching shared media details:', err);
          setError(err.response?.data?.error || 'Media not found or link expired');
          setLoaded(true);
        });
    }
  }, [loaded, username, mediaType, id]);

  if (!loaded) {
    return <div className="text-white text-center pt-5">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center pt-5" style={{backgroundColor: theme.colors.background.primary, minHeight: '100vh'}}>
        <h3 className="text-danger">{error}</h3>
        <Link to={buildBackUrl()} className="btn btn-outline-warning mt-3">
          <i className="fas fa-arrow-left me-2"></i>Go Back
        </Link>
      </div>
    );
  }
  
  return (
    <div className='SharedMediaDetails min-vh-100' style={{backgroundColor: theme.colors.background.primary, color: 'white'}}>
      <style>{`
        @media (min-width: 768px) {
          .SharedMediaDetails table {
            table-layout: auto;
          }
          .SharedMediaDetails .description-cell {
            max-width: 70ch !important;
            width: 70ch !important;
            overflow-wrap: break-word !important;
            word-wrap: break-word !important;
          }
          .SharedMediaDetails .description-cell > span {
            max-width: 100% !important;
            display: block !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            white-space: normal !important;
            word-break: normal !important;
          }
        }
        @media (max-width: 767.98px) {
          .SharedMediaDetails table tbody tr td:nth-child(2) {
            width: 25% !important;
            min-width: 80px;
            padding-left: 0.75rem !important;
            padding-right: 0.5rem !important;
          }
          .SharedMediaDetails table tbody tr td:nth-child(3) {
            width: 75% !important;
            padding-left: 0.5rem !important;
            padding-right: 0.75rem !important;
          }
        }
      `}</style>
      <div className='py-3' style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
        {/* Mobile layout - single row */}
        <div className='mb-4 d-md-none' style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className='d-flex align-items-center'>
            <div style={{ flex: '0 0 auto', minWidth: '80px' }}>
              <Link to={buildBackUrl()} className='btn btn-outline-warning btn-sm'>
                <i className="fas fa-arrow-left me-1"></i>Back
              </Link>
            </div>
            <div style={{ flex: '1', textAlign: 'center', padding: '0 0.5rem' }}>
              <h1 className='fw-bold text-white mb-1' style={{fontSize: '1.2rem', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{toCapitalNotation(mediaType)} Record</h1>
              <div className="border-bottom border-2 border-warning mx-auto" style={{width: '60%'}}></div>
            </div>
            <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
              <Link to={`/user/${username}`} className='btn btn-outline-warning btn-sm'>
                <i className="fas fa-user me-1"></i>{ownerName}
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop layout - hidden on mobile */}
        <div className='row mb-4 d-none d-md-flex align-items-center'>
          <div className='col-md-2 d-flex justify-content-start'>
            <Link to={buildBackUrl()} className='btn btn-outline-warning btn-lg'>
              <i className="fas fa-arrow-left me-2"></i>Go Back
            </Link>
          </div>
          <div className='col-md-8 text-center'>
            <h1 className='fw-bold text-white mb-0' style={{ fontSize: 'clamp(28px, 4.5vw, 52px)' }}>{toCapitalNotation(mediaType)} Record</h1>
            <div className="border-bottom border-3 border-warning w-25 mx-auto"></div>
          </div>
          <div className='col-md-2 d-flex justify-content-end'>
            <Link to={`/user/${username}`} className='btn btn-outline-warning btn-lg'>
              <i className="fas fa-user me-2"></i>{ownerName}
            </Link>
          </div>
        </div>
        
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="card shadow-soft border-0" style={{backgroundColor: theme.colors.background.dark}}>
              <div className="card-body p-0" style={{backgroundColor: theme.colors.background.dark}}>
                <div className="table-responsive">
                  <table className='table table-hover mb-0 text-white' style={{backgroundColor: theme.colors.background.dark}}>
                    <tbody style={{backgroundColor: theme.colors.background.dark}}>
                      <tr style={{backgroundColor: theme.colors.background.dark}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>1</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Title</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: theme.colors.background.dark}}>
                          {media.title || '-'}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: theme.colors.background.dark}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>2</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Date</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: theme.colors.background.dark}}>
                          {media.year ? new Date(media.year).toISOString().split('T')[0] : '-'}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: theme.colors.background.dark}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>3</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Tier</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: theme.colors.background.dark}}>
                          {tierTitles[media.tier] || media.tier || '-'}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: theme.colors.background.dark}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>4</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Tags</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: theme.colors.background.dark}}>
                          {media.tags && media.tags.length > 0 ? media.tags.join(', ') : '-'}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: theme.colors.background.dark}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>5</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>Description</td>
                        <td className='px-4 py-3 text-white description-cell' style={{backgroundColor: theme.colors.background.dark, wordWrap: 'break-word', overflowWrap: 'break-word'}}>
                          {media.description || '-'}
                        </td>
                      </tr>
                      <tr style={{backgroundColor: theme.colors.background.dark}}>
                        <th scope='row' className='px-4 py-3 fw-semibold text-warning' style={{backgroundColor: theme.colors.background.dark}}>6</th>
                        <td className='px-4 py-3 fw-semibold text-white' style={{backgroundColor: theme.colors.background.dark}}>List Type</td>
                        <td className='px-4 py-3 text-white' style={{backgroundColor: theme.colors.background.dark}}>
                          {media.toDo ? 'To-Do List' : 'Collection'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        
      </div>
    </div>
  );
}

export default SharedMediaDetails;
