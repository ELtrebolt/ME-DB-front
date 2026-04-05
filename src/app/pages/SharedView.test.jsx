import { renderWithRouter, screen, waitFor } from '../../test-utils';
import { Routes, Route } from 'react-router-dom';
import { api as axios } from '../api';
import SharedView from './SharedView';

jest.mock('../api', () => ({
  api: { get: jest.fn() },
}));

jest.mock('../hooks/useSwipe.tsx', () => ({
  __esModule: true,
  default: () => ({}),
}));

jest.mock('../components/CardsContainer', () => () => <div data-testid="cards-container" />);
jest.mock('../components/filters/FiltersBar', () => () => <div data-testid="filters-bar" />);
jest.mock('../components/TierTitle', () => () => <div data-testid="tier-title" />);

const sharePayload = {
  success: true,
  media: [
    {
      userID: 'owner1',
      ID: 1,
      mediaType: 'movies',
      title: 'Shared Film',
      tier: 'S',
      toDo: false,
      tags: [],
    },
  ],
  shareConfig: { collection: true, todo: false },
  mediaType: 'movies',
  ownerName: 'Owner Name',
  collectionTierTitles: {},
  todoTierTitles: {},
  collectionDescription: '',
  todoDescription: '',
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('shows loading then owner header when share fetch succeeds', async () => {
  axios.get.mockResolvedValue({ data: sharePayload });

  renderWithRouter(
    <Routes>
      <Route path="/user/:username/:mediaType" element={<SharedView />} />
    </Routes>,
    { route: '/user/shareowner/movies' }
  );

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getAllByText('Owner Name').length).toBeGreaterThanOrEqual(1);
  });

  const headings = screen.getAllByRole('heading', { level: 1 });
  expect(headings.some((h) => h.textContent.includes('Movies') && h.textContent.includes('Collection'))).toBe(true);
  expect(screen.getByTestId('filters-bar')).toBeInTheDocument();
  expect(axios.get).toHaveBeenCalledWith(
    expect.stringMatching(/\/api\/share\/user\/shareowner\/movies$/)
  );
});

test('shows error when share fetch fails', async () => {
  axios.get.mockRejectedValue({
    response: { data: { error: 'Not found' } },
  });

  renderWithRouter(
    <Routes>
      <Route path="/user/:username/:mediaType" element={<SharedView />} />
    </Routes>,
    { route: '/user/x/anime' }
  );

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Not found' })).toBeInTheDocument();
  });
});
