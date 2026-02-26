import { renderWithRouter, screen } from '../../../test-utils';
import SearchBar from './SearchBar';

const mockAllMedia = {
  S: [{ ID: 1, title: 'Attack on Titan' }],
  A: [{ ID: 2, title: 'Naruto' }],
  B: [], C: [], D: [], F: [],
};

const defaultProps = {
  mediaType: 'anime',
  allMedia: mockAllMedia,
  searchQuery: '',
  setSearchQuery: jest.fn(),
  setSearchChanged: jest.fn(),
};

describe('SearchBar', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders the "Search by Title" label', () => {
    renderWithRouter(<SearchBar {...defaultProps} />);
    expect(screen.getByText('Search by Title')).toBeInTheDocument();
  });

  test('renders the search input', () => {
    renderWithRouter(<SearchBar {...defaultProps} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('calls setSearchChanged(true) on mount due to searchQuery effect', () => {
    renderWithRouter(<SearchBar {...defaultProps} />);
    expect(defaultProps.setSearchChanged).toHaveBeenCalledWith(true);
  });

  test('renders without crashing when allMedia has no items', () => {
    const empty = { S: [], A: [], B: [], C: [], D: [], F: [] };
    renderWithRouter(<SearchBar {...defaultProps} allMedia={empty} />);
    expect(screen.getByText('Search by Title')).toBeInTheDocument();
  });
});
