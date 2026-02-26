import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useMediaData } from './useMediaData';

jest.mock('axios');

jest.mock('../../demo/hooks/useDemoData', () => ({
  useDemoData: () => ({
    uniqueTags: ['demo-tag'],
    loading: false,
    data: {},
    getMediaByToDo: jest.fn(),
    getMediaByTier: jest.fn(),
    getMediaById: jest.fn(),
    createMedia: jest.fn(),
    updateMedia: jest.fn(),
    deleteMedia: jest.fn(),
    reorderInTier: jest.fn(),
    moveToTier: jest.fn(),
    toggleToDo: jest.fn(),
  }),
}));

beforeEach(() => {
  axios.defaults = {};
  axios.get.mockResolvedValue({ data: { uniqueTags: ['action', 'romance'] } });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useMediaData', () => {
  test('fetches tags from API and returns them in api mode', async () => {
    const { result } = renderHook(() => useMediaData('anime', 'api'));
    // Wait for the async axios call to populate uniqueTags
    await waitFor(() => expect(result.current.uniqueTags).toEqual(['action', 'romance']));
    expect(result.current.dataSource).toBe('api');
  });

  test('exposes fetchTags function in api mode', async () => {
    const { result } = renderHook(() => useMediaData('anime', 'api'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.fetchTags).toBeInstanceOf(Function);
  });

  test('CRUD methods are null in api mode', async () => {
    const { result } = renderHook(() => useMediaData('anime', 'api'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.createMedia).toBeNull();
    expect(result.current.deleteMedia).toBeNull();
    expect(result.current.updateMedia).toBeNull();
  });

  test('returns demo data in demo mode without calling axios', () => {
    const { result } = renderHook(() => useMediaData('anime', 'demo'));
    expect(result.current.dataSource).toBe('demo');
    expect(result.current.uniqueTags).toEqual(['demo-tag']);
    expect(axios.get).not.toHaveBeenCalled();
  });

  test('fetchTags is null in demo mode', () => {
    const { result } = renderHook(() => useMediaData('anime', 'demo'));
    expect(result.current.fetchTags).toBeNull();
  });

  test('demo-specific methods are available in demo mode', () => {
    const { result } = renderHook(() => useMediaData('anime', 'demo'));
    expect(typeof result.current.createMedia).toBe('function');
    expect(typeof result.current.deleteMedia).toBe('function');
  });
});
