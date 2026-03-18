import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { api as axios } from '../api';
import CreateMedia from './CreateMedia';
import { toast } from 'sonner';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../api', () => ({
  api: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));
jest.mock('../components/TagMaker', () => () => <div data-testid="mock-tag-maker" />);

const mockUser = {
  username: 'alice',
  displayName: 'Alice',
  anime: { collectionTiers: {}, todoTiers: {} },
  newTypes: {},
};

// Helper: render CreateMedia at /anime/collection/create
function renderCreateMedia(props = {}) {
  return renderCreateMediaAt('/anime/collection/create', props);
}

// Helper: render CreateMedia at a custom initial URL (to test URL-based behaviour)
function renderCreateMediaAt(initialEntry, props = {}) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path="/:mediaType/:group/create"
            element={
              <CreateMedia
                user={mockUser}
                toDo={false}
                newType={false}
                selectedTags={[]}
                dataSource="api"
                basePath=""
                {...props}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

let mockNavigate;
beforeEach(() => {
  mockNavigate = jest.fn();
  useNavigate.mockReturnValue(mockNavigate);
  jest.clearAllMocks();
  // Re-set after clearAllMocks
  mockNavigate = jest.fn();
  useNavigate.mockReturnValue(mockNavigate);
  axios.post.mockResolvedValue({ data: {} });
  toast.error.mockClear();
});

describe('CreateMedia', () => {
  // ─── Basic render ──────────────────────────────────────────────────────────

  test('renders the page heading', () => {
    renderCreateMedia();
    expect(screen.getAllByText(/add anime to collection/i).length).toBeGreaterThan(0);
  });

  test('renders the TagMaker component', () => {
    renderCreateMedia();
    expect(screen.getAllByTestId('mock-tag-maker').length).toBeGreaterThan(0);
  });

  // ─── Title validation ──────────────────────────────────────────────────────

  test('shows "Title is required!" when submitting with empty title', () => {
    renderCreateMedia();
    fireEvent.click(screen.getAllByRole('button', { name: /create media/i })[0]);
    expect(screen.getAllByText(/title is required/i).length).toBeGreaterThan(0);
  });

  test('does not show title error before submission attempt', () => {
    renderCreateMedia();
    expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
  });

  test('clears the title error when the user starts typing in the title field', () => {
    renderCreateMedia();
    // Trigger validation error first
    fireEvent.click(screen.getAllByRole('button', { name: /create media/i })[0]);
    // Type in the desktop title input (first one)
    const inputs = screen.getAllByPlaceholderText(/e\.g\. one piece/i);
    fireEvent.change(inputs[0], { target: { value: 'Bleach' } });
    expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
  });

  // ─── API submission ────────────────────────────────────────────────────────

  test('calls POST /api/media when form is submitted with a valid title', async () => {
    renderCreateMedia();
    const inputs = screen.getAllByPlaceholderText(/e\.g\. one piece/i);
    fireEvent.change(inputs[0], { target: { value: 'Bleach' } });
    fireEvent.click(screen.getAllByRole('button', { name: /create media/i })[0]);
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/media'),
        expect.objectContaining({ media: expect.objectContaining({ title: 'Bleach' }) })
      )
    );
  });

  // ─── Demo mode ────────────────────────────────────────────────────────────

  test('calls onCreateMedia callback instead of axios in demo mode', () => {
    const onCreateMedia = jest.fn(() => ({ ID: 99, title: 'Bleach' }));
    renderCreateMedia({ dataSource: 'demo', onCreateMedia, toDo: false });
    const inputs = screen.getAllByPlaceholderText(/e\.g\. one piece/i);
    fireEvent.change(inputs[0], { target: { value: 'Bleach' } });
    fireEvent.click(screen.getAllByRole('button', { name: /create media/i })[0]);
    expect(onCreateMedia).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Bleach' })
    );
    expect(axios.post).not.toHaveBeenCalled();
  });

  // ─── Year input mode ───────────────────────────────────────────────────────

  test('renders a date input by default (useYearSelect=false)', () => {
    renderCreateMedia({ useYearSelect: false });
    const dateInputs = screen.getAllByDisplayValue(/^\d{4}-\d{2}-\d{2}$/);
    expect(dateInputs.length).toBeGreaterThan(0);
  });

  test('renders a year select when useYearSelect=true', () => {
    renderCreateMedia({ useYearSelect: true });
    // There should be selects for tier AND year; year select contains the current year as an option
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getAllByRole('option', { name: currentYear }).length).toBeGreaterThan(0);
  });

  // ─── Session expired ───────────────────────────────────────────────────────

  test('shows session expired message when user is null in API mode', () => {
    renderCreateMedia({ user: null });
    expect(screen.getByText(/session expired/i)).toBeInTheDocument();
  });

  // ─── Post-create redirect ─────────────────────────────────────────────────

  describe('Post-create redirect', () => {
    async function submitTitle(title) {
      const inputs = screen.getAllByPlaceholderText(/e\.g\. one piece/i);
      fireEvent.change(inputs[0], { target: { value: title } });
      fireEvent.click(screen.getAllByRole('button', { name: /create media/i })[0]);
      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    }

    test('after API create success, navigates to the collection list (not -1)', async () => {
      renderCreateMedia();
      await submitTitle('Bleach');
      const [url] = mockNavigate.mock.calls[0];
      expect(url).toMatch(/\/anime\/collection/);
      expect(url).not.toBe(-1);
    });

    test('redirect URL includes tag= params that were on the create URL', async () => {
      renderCreateMediaAt('/anime/collection/create?tag=comedy&tag=action');
      await submitTitle('Bleach');
      const [url] = mockNavigate.mock.calls[0];
      const params = new URLSearchParams(url.split('?')[1] || '');
      expect(params.getAll('tag')).toEqual(expect.arrayContaining(['comedy', 'action']));
    });

    test('redirect URL includes timePeriod filter that was on the create URL', async () => {
      renderCreateMediaAt('/anime/collection/create?tag=comedy&timePeriod=year');
      await submitTitle('Bleach');
      const [url] = mockNavigate.mock.calls[0];
      const params = new URLSearchParams(url.split('?')[1] || '');
      expect(params.get('timePeriod')).toBe('year');
    });

    test('redirect URL has no params when create URL had none', async () => {
      renderCreateMedia();
      await submitTitle('Bleach');
      const [url] = mockNavigate.mock.calls[0];
      expect(url).not.toContain('?');
    });

    test('demo mode onCreateMedia success also navigates to the deterministic list URL', () => {
      const onCreateMedia = jest.fn(() => ({ ID: 99, title: 'Bleach' }));
      renderCreateMediaAt('/anime/collection/create?tag=comedy', {
        dataSource: 'demo',
        onCreateMedia,
        toDo: false,
      });
      const inputs = screen.getAllByPlaceholderText(/e\.g\. one piece/i);
      fireEvent.change(inputs[0], { target: { value: 'Bleach' } });
      fireEvent.click(screen.getAllByRole('button', { name: /create media/i })[0]);
      expect(mockNavigate).toHaveBeenCalled();
      const [url] = mockNavigate.mock.calls[0];
      expect(url).toMatch(/\/anime\/collection/);
      expect(url).not.toBe(-1);
    });
  });

  // ─── URL tag hydration ────────────────────────────────────────────────────

  describe('URL tag hydration', () => {
    async function submitAndCapturePost(initialEntry) {
      renderCreateMediaAt(initialEntry);
      const inputs = screen.getAllByPlaceholderText(/e\.g\. one piece/i);
      fireEvent.change(inputs[0], { target: { value: 'Bleach' } });
      fireEvent.click(screen.getAllByRole('button', { name: /create media/i })[0]);
      await waitFor(() => expect(axios.post).toHaveBeenCalled());
      return axios.post.mock.calls[0][1].media;
    }

    test('new repeated tag= params pre-populate media.tags on submit', async () => {
      const media = await submitAndCapturePost(
        '/anime/collection/create?tag=comedy&tag=action'
      );
      expect(media.tags).toEqual(expect.arrayContaining(['comedy', 'action']));
    });

    test('legacy comma tags= param pre-populates media.tags on submit', async () => {
      const media = await submitAndCapturePost(
        '/anime/collection/create?tags=comedy,action'
      );
      expect(media.tags).toEqual(expect.arrayContaining(['comedy', 'action']));
    });

    test('no tag params result in empty tags on submit', async () => {
      const media = await submitAndCapturePost('/anime/collection/create');
      expect(media.tags).toEqual([]);
    });
  });
});
