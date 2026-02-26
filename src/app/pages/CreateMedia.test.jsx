import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import CreateMedia from './CreateMedia';

jest.mock('axios');
jest.mock('../components/TagMaker', () => () => <div data-testid="mock-tag-maker" />);

const mockUser = {
  username: 'alice',
  displayName: 'Alice',
  anime: { collectionTiers: {}, todoTiers: {} },
  newTypes: {},
};

// Helper: render CreateMedia at /anime/collection/create
function renderCreateMedia(props = {}) {
  return render(
    <MemoryRouter initialEntries={['/anime/collection/create']}>
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
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  axios.post.mockResolvedValue({ data: {} });
  window.alert = jest.fn();
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
});
