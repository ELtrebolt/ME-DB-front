import { render } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { renderWithRouter, screen, fireEvent, waitFor } from '../../../test-utils';
import FiltersBar from './FiltersBar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock all child filter components so FiltersBar logic is tested in isolation
jest.mock('./TimeFilter', () => () => <div data-testid="mock-time-filter" />);
jest.mock('./SearchBar', () => () => <div data-testid="mock-search-bar" />);
jest.mock('./TagFilter', () => () => <div data-testid="mock-tag-filter" />);
jest.mock('./ExtraFilters', () => ({ onClearFilters }) => (
  <div data-testid="mock-extra-filters">
    <button onClick={onClearFilters}>Clear Filters</button>
  </div>
));

const defaultProps = {
  mediaType: 'anime',
  basePath: '',
  filteredData: {},
  suggestedTags: [],
  selectedTags: [],
  setSelectedTags: jest.fn(),
  setSearchChanged: jest.fn(),
  timePeriod: 'all',
  setTimePeriod: jest.fn(),
  startDate: '',
  setStartDate: jest.fn(),
  endDate: '',
  setEndDate: jest.fn(),
  tagLogic: 'AND',
  setTagLogic: jest.fn(),
  searchQuery: '',
  setSearchQuery: jest.fn(),
  searchScope: ['title'],
  setSearchScope: jest.fn(),
  sortOrder: 'default',
  setSortOrder: jest.fn(),
  showExtraFilters: false,
  setShowExtraFilters: jest.fn(),
  setSelectedTiers: jest.fn(),
  // Disable URL sync to prevent infinite navigate loop in jsdom
  skipUrlSync: true,
};

let mockNavigate;
beforeEach(() => {
  mockNavigate = jest.fn();
  useNavigate.mockReturnValue(mockNavigate);
  jest.clearAllMocks();
  // clearAllMocks resets mock.calls but NOT mockReturnValue; re-set to ensure a fresh spy per test
  mockNavigate = jest.fn();
  useNavigate.mockReturnValue(mockNavigate);
});

describe('FiltersBar', () => {
  // ─── Render ────────────────────────────────────────────────────────────────

  test('renders without crashing', () => {
    renderWithRouter(<FiltersBar {...defaultProps} />);
    expect(screen.getByTestId('mock-time-filter')).toBeInTheDocument();
    expect(screen.getByTestId('mock-search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tag-filter')).toBeInTheDocument();
  });

  test('does not render ExtraFilters when showExtraFilters is false', () => {
    renderWithRouter(<FiltersBar {...defaultProps} showExtraFilters={false} />);
    expect(screen.queryByTestId('mock-extra-filters')).not.toBeInTheDocument();
  });

  test('renders ExtraFilters when showExtraFilters is true', () => {
    renderWithRouter(<FiltersBar {...defaultProps} showExtraFilters={true} />);
    expect(screen.getByTestId('mock-extra-filters')).toBeInTheDocument();
  });

  // ─── Toggle extra filters button ───────────────────────────────────────────

  test('shows "More Filters..." when extra filters are hidden', () => {
    renderWithRouter(<FiltersBar {...defaultProps} showExtraFilters={false} />);
    expect(screen.getByRole('button', { name: /more filters/i })).toBeInTheDocument();
  });

  test('shows "Hide Advanced" when extra filters are visible', () => {
    renderWithRouter(<FiltersBar {...defaultProps} showExtraFilters={true} />);
    expect(screen.getByRole('button', { name: /hide advanced/i })).toBeInTheDocument();
  });

  test('clicking the toggle button calls setShowExtraFilters', () => {
    renderWithRouter(<FiltersBar {...defaultProps} showExtraFilters={false} />);
    fireEvent.click(screen.getByRole('button', { name: /more filters/i }));
    expect(defaultProps.setShowExtraFilters).toHaveBeenCalledWith(true);
  });

  // ─── Auto-show extra filters ───────────────────────────────────────────────

  test('calls setShowExtraFilters(true) when timePeriod changes to "custom"', () => {
    const { rerender } = renderWithRouter(<FiltersBar {...defaultProps} timePeriod="all" />);
    // rerender must include MemoryRouter since FiltersBar uses useLocation/useNavigate
    rerender(
      <MemoryRouter>
        <FiltersBar {...defaultProps} timePeriod="custom" />
      </MemoryRouter>
    );
    expect(defaultProps.setShowExtraFilters).toHaveBeenCalledWith(true);
  });

  // ─── Clear filters ────────────────────────────────────────────────────────

  test('clear filters resets all filter state to defaults', () => {
    renderWithRouter(<FiltersBar {...defaultProps} showExtraFilters={true} />);
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(defaultProps.setTimePeriod).toHaveBeenCalledWith('all');
    expect(defaultProps.setStartDate).toHaveBeenCalledWith('');
    expect(defaultProps.setEndDate).toHaveBeenCalledWith('');
    expect(defaultProps.setSelectedTags).toHaveBeenCalledWith([]);
    expect(defaultProps.setTagLogic).toHaveBeenCalledWith('AND');
    expect(defaultProps.setSearchQuery).toHaveBeenCalledWith('');
    expect(defaultProps.setSortOrder).toHaveBeenCalledWith('default');
    expect(defaultProps.setSearchChanged).toHaveBeenCalledWith(true);
  });

  test('clear filters resets selected tiers to standard tiers', () => {
    renderWithRouter(<FiltersBar {...defaultProps} showExtraFilters={true} />);
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(defaultProps.setSelectedTiers).toHaveBeenCalledWith(
      expect.arrayContaining(['S', 'A', 'B', 'C', 'D', 'F'])
    );
  });

  // ─── URL tag serialization ────────────────────────────────────────────────

  describe('URL tag serialization', () => {
    // Renders FiltersBar with skipUrlSync:false so the URL sync effect is active.
    // First render skips (isFirstRender guard); rerender with new selectedTags triggers it.
    function renderAndTriggerSync(initialSearch, rerenderTags) {
      const initialEntry = `/anime/collection${initialSearch}`;
      const props = { ...defaultProps, skipUrlSync: false, selectedTags: [] };

      const { rerender } = render(
        <MemoryRouter initialEntries={[initialEntry]}>
          <FiltersBar {...props} />
        </MemoryRouter>
      );

      rerender(
        <MemoryRouter initialEntries={[initialEntry]}>
          <FiltersBar {...props} selectedTags={rerenderTags} />
        </MemoryRouter>
      );

      return mockNavigate;
    }

    test('writes tags as repeated tag= params, not comma-joined tags=', async () => {
      const navigate = renderAndTriggerSync('', [
        { label: 'action', value: 'action' },
      ]);
      await waitFor(() => expect(navigate).toHaveBeenCalled());
      const [calledUrl] = navigate.mock.calls[0];
      const search = calledUrl.includes('?') ? calledUrl.split('?')[1] : '';
      const params = new URLSearchParams(search);
      expect(params.getAll('tag')).toContain('action');
      expect(params.get('tags')).toBeNull();
    });

    test('encodes a tag containing & correctly as a single tag= param', async () => {
      const navigate = renderAndTriggerSync('', [
        { label: 'rock & roll', value: 'rock & roll' },
      ]);
      await waitFor(() => expect(navigate).toHaveBeenCalled());
      const [calledUrl] = navigate.mock.calls[0];
      const search = calledUrl.includes('?') ? calledUrl.split('?')[1] : '';
      const params = new URLSearchParams(search);
      expect(params.getAll('tag')).toEqual(['rock & roll']);
    });

    test('preserves a tag containing a comma as a single tag= param', async () => {
      const navigate = renderAndTriggerSync('', [
        { label: 'sci-fi, action', value: 'sci-fi, action' },
      ]);
      await waitFor(() => expect(navigate).toHaveBeenCalled());
      const [calledUrl] = navigate.mock.calls[0];
      const search = calledUrl.includes('?') ? calledUrl.split('?')[1] : '';
      const params = new URLSearchParams(search);
      expect(params.getAll('tag')).toEqual(['sci-fi, action']);
    });

    test('clearFilters removes both tag= and tags= from the URL', async () => {
      render(
        <MemoryRouter initialEntries={['/anime/collection?tag=comedy&tags=old']}>
          <FiltersBar
            {...defaultProps}
            skipUrlSync={false}
            showExtraFilters={true}
          />
        </MemoryRouter>
      );
      fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
      const [calledUrl] = mockNavigate.mock.calls[0];
      expect(calledUrl).not.toMatch(/[?&]tag=/);
      expect(calledUrl).not.toMatch(/[?&]tags=/);
    });
  });
});
