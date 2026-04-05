import { renderWithRouter, screen, waitFor, fireEvent } from '../../test-utils';
import { api as axios } from '../api';
import Stats from './Stats';
import constants from '../constants';

jest.mock('../api', () => ({
  api: { get: jest.fn() },
}));

jest.mock('../components/stats/TypeDistributionChart', () => () => <div data-testid="type-chart" />);
jest.mock('../components/stats/YearDistributionChart', () => () => <div data-testid="year-chart" />);
jest.mock('../components/stats/TierDistributionChart', () => () => <div data-testid="tier-chart" />);
jest.mock('../components/stats/TierByTypeChart', () => () => <div data-testid="tier-by-type-chart" />);

const mockStatsData = {
  totals: { totalRecords: 10, totalCollection: 7, totalToDo: 3 },
  typeDistribution: { anime: 2, tv: 0, movies: 8, games: 0 },
  yearDistribution: {},
  tierDistribution: {},
  yearDistributionByFilter: { all: {}, toDo: {}, collection: {} },
  tierDistributionByGroup: { toDo: {}, collection: {} },
  tierByTypeToDo: {},
  tierByTypeCollection: {},
  tierByTypeDistribution: {},
  customTypes: [],
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('shows loading then dashboard title when API succeeds', async () => {
  axios.get.mockResolvedValue({
    data: { success: true, data: mockStatsData },
  });

  renderWithRouter(<Stats user={{ ID: 'u1' }} />);

  expect(screen.getByText(/loading statistics/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: constants.statsPage.title })).toBeInTheDocument();
  });

  expect(screen.getByText('10')).toBeInTheDocument();
  expect(screen.getByText('7')).toBeInTheDocument();
  expect(screen.getByText('3')).toBeInTheDocument();
  expect(screen.getAllByTestId('type-chart').length).toBeGreaterThanOrEqual(1);
});

test('shows error and retry refetches stats', async () => {
  axios.get
    .mockRejectedValueOnce(new Error('network'))
    .mockResolvedValueOnce({ data: { success: true, data: mockStatsData } });

  renderWithRouter(<Stats user={{ ID: 'u1' }} />);

  await waitFor(() => {
    expect(screen.getByText(/error loading statistics/i)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole('button', { name: /try again/i }));

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: constants.statsPage.title })).toBeInTheDocument();
  });
});

test('shows warning when API returns success but no data payload', async () => {
  axios.get.mockResolvedValue({ data: { success: true, data: null } });

  renderWithRouter(<Stats user={{ ID: 'u1' }} />);

  await waitFor(() => {
    expect(screen.getByText(/no statistics data available/i)).toBeInTheDocument();
  });
});
