import { renderWithRouter, screen, waitFor } from '../../test-utils';
import { api as axios } from '../api';
import Friends from './Friends';

jest.mock('../api', () => ({
  api: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

const mockUser = { ID: 'u1', username: 'selfuser', displayName: 'Self' };

beforeEach(() => {
  jest.clearAllMocks();
});

test('loads friends and requests then shows empty state', async () => {
  axios.get.mockImplementation((url) => {
    if (String(url).includes('/friends/requests')) {
      return Promise.resolve({ data: { success: true, incoming: [], outgoing: [] } });
    }
    return Promise.resolve({ data: { success: true, friends: [] } });
  });

  renderWithRouter(<Friends user={mockUser} setUserChanged={jest.fn()} />);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Friends' })).toBeInTheDocument();
  });

  expect(screen.getByText(/no friends or friend requests yet/i)).toBeInTheDocument();
  expect(axios.get).toHaveBeenCalledWith(
    expect.stringMatching(/\/api\/friends$/),
    expect.any(Object)
  );
  expect(axios.get).toHaveBeenCalledWith(
    expect.stringMatching(/\/api\/friends\/requests$/),
    expect.any(Object)
  );
});

test('renders friend display name when API returns friends', async () => {
  axios.get.mockImplementation((url) => {
    if (String(url).includes('/friends/requests')) {
      return Promise.resolve({ data: { success: true, incoming: [], outgoing: [] } });
    }
    return Promise.resolve({
      data: {
        success: true,
        friends: [
          {
            ID: 'f1',
            username: 'pal',
            displayName: 'Pal User',
            profilePic: null,
            isPublicProfile: true,
          },
        ],
      },
    });
  });

  renderWithRouter(<Friends user={mockUser} setUserChanged={jest.fn()} />);

  await waitFor(() => {
    expect(screen.getByText('Pal User')).toBeInTheDocument();
  });

  expect(screen.getByText('Your Friends (1)')).toBeInTheDocument();
});

test('shows API error message when fetch fails', async () => {
  axios.get.mockRejectedValue({
    response: { data: { message: 'Server unavailable' } },
  });

  renderWithRouter(<Friends user={mockUser} setUserChanged={jest.fn()} />);

  await waitFor(() => {
    expect(screen.getByText('Server unavailable')).toBeInTheDocument();
  });
});
