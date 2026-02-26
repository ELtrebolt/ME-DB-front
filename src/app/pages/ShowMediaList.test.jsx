import { renderWithRouter, screen, waitFor } from '../../test-utils';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import ShowMediaList from './ShowMediaList';

jest.mock('axios');

// Mock DnD kit so jsdom pointer-event limitations don't affect tests
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }) => <div>{children}</div>,
  closestCenter: jest.fn(),
  PointerSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
  useSensor: jest.fn(() => null),
  useSensors: jest.fn(() => []),
  DragOverlay: ({ children }) => children || null,
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => <div>{children}</div>,
  arrayMove: jest.fn((arr) => arr),
  sortableKeyboardCoordinates: jest.fn(),
  verticalListSortingStrategy: jest.fn(),
}));

// CardsContainer and SortableCard use DnD hooks not covered by the core mock above
jest.mock('../components/CardsContainer', () => () => <div data-testid="cards-container" />);
jest.mock('../components/SortableCard', () => () => <div data-testid="sortable-card" />);

jest.mock('../hooks/useMediaData', () => ({
  useMediaData: () => ({
    uniqueTags: [],
    loading: false,
    fetchTags: jest.fn(),
    dataSource: 'api',
    data: null,
    getMediaByToDo: null,
    getMediaByTier: null,
    getMediaById: null,
    createMedia: null,
    updateMedia: null,
    deleteMedia: null,
    reorderInTier: null,
    moveToTier: null,
    toggleToDo: null,
  }),
}));

const mockUser = {
  anime: {},
  newTypes: {},
  customizations: {},
};

const defaultProps = {
  user: mockUser,
  setUserChanged: jest.fn(),
  toDo: false,
  newType: false,
  selectedTags: [],
  setSelectedTags: jest.fn(),
  filteredData: {},
  setFilteredData: jest.fn(),
};

// Wrap with MemoryRouter (via renderWithRouter) so useParams/useLocation work
function renderShowMediaList(props = {}) {
  return renderWithRouter(
    <Routes>
      <Route
        path="/:mediaType/:group"
        element={<ShowMediaList {...defaultProps} {...props} />}
      />
    </Routes>,
    { route: '/anime/collection' }
  );
}

beforeEach(() => {
  axios.defaults = {};
  axios.get.mockResolvedValue({ data: { media: [], uniqueTags: [] } });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ShowMediaList', () => {
  test('renders without crashing', async () => {
    const { container } = renderShowMediaList();
    await waitFor(() => expect(container).not.toBeEmptyDOMElement());
  });

  test('renders the filters bar (Search by Title label)', async () => {
    renderShowMediaList();
    expect(await screen.findByText('Search by Title')).toBeInTheDocument();
  });

  test('fetches media data on mount via axios', async () => {
    renderShowMediaList();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/media/anime/collection')
    );
  });

  test('renders to-do list when toDo prop is true', async () => {
    axios.get.mockResolvedValue({ data: { media: [], uniqueTags: [] } });
    renderShowMediaList({ toDo: true });
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/media/anime/to-do')
    );
  });
});
