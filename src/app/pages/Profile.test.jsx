import { renderWithRouter, screen, waitFor } from '../../test-utils';
import { Routes, Route } from 'react-router-dom';
import { api as axios } from '../api';
import Profile from './Profile';

jest.mock('../api', () => ({
  api: { get: jest.fn(), put: jest.fn(), post: jest.fn() },
}));

jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

jest.mock('../components/modals/ShareLinkModal', () => () => null);

jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }) => <div>{children}</div>,
  closestCenter: jest.fn(),
  PointerSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
  useSensor: jest.fn(() => ({})),
  useSensors: jest.fn(() => []),
}));

jest.mock('@dnd-kit/sortable', () => ({
  arrayMove: jest.fn((arr) => arr),
  SortableContext: ({ children }) => <div>{children}</div>,
  rectSortingStrategy: jest.fn(),
  useSortable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  })),
  sortableKeyboardCoordinates: jest.fn(),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}));

const mockCurrentUser = {
  ID: 'u-profile',
  username: 'profileuser',
  displayName: 'Profile User',
  isPublicProfile: false,
  movies: { total: 0 },
  newTypes: {},
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn(() => Promise.resolve()) },
  });
});

function renderProfileSelf() {
  return renderWithRouter(
    <Routes>
      <Route
        path="/profile"
        element={<Profile user={mockCurrentUser} setUserChanged={jest.fn()} />}
      />
    </Routes>,
    { route: '/profile' }
  );
}

test('self profile loads shared lists and shows username', async () => {
  axios.get.mockResolvedValue({ data: { success: true, sharedLists: [] } });

  renderProfileSelf();

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
  });

  expect(screen.getByText('profileuser')).toBeInTheDocument();
  expect(axios.get).toHaveBeenCalledWith(
    expect.stringMatching(/\/api\/user\/shared-lists$/),
    expect.objectContaining({ withCredentials: true })
  );
});

test('public profile route fetches user by username param', async () => {
  axios.get.mockResolvedValue({
    data: {
      success: true,
      user: {
        ID: 'other',
        username: 'publicu',
        displayName: 'Public Person',
        isPublicProfile: true,
      },
      sharedLists: [],
      friendshipStatus: 'none',
    },
  });

  renderWithRouter(
    <Routes>
      <Route path="/user/:username" element={<Profile />} />
    </Routes>,
    { route: '/user/publicu' }
  );

  await waitFor(() => {
    expect(screen.getByText('publicu')).toBeInTheDocument();
  });

  expect(axios.get).toHaveBeenCalledWith(
    expect.stringMatching(/\/api\/user\/public\/publicu$/),
    expect.objectContaining({ withCredentials: true })
  );
});
