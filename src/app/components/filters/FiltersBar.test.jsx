import { MemoryRouter } from 'react-router-dom';
import { renderWithRouter, screen, fireEvent } from '../../../test-utils';
import FiltersBar from './FiltersBar';

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

beforeEach(() => jest.clearAllMocks());

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
});
