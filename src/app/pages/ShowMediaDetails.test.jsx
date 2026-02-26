import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import ShowMediaDetails from './ShowMediaDetails';

jest.mock('axios');

// DeleteModal manages its own show/hide via internal state.
// Use require inside the factory (variables must be prefixed with 'mock' to be allowed by Jest).
jest.mock('../components/modals/DeleteModal', () => {
  const mockReact = require('react');
  return ({ onDeleteClick, onModalOpen }) => {
    const [open, setOpen] = mockReact.useState(false);
    return mockReact.createElement(mockReact.Fragment, null,
      mockReact.createElement('button', {
        onClick: () => { if (onModalOpen) onModalOpen(); setOpen(true); },
        'aria-label': 'Delete',
      }, 'Delete'),
      open && mockReact.createElement('button', {
        onClick: onDeleteClick,
        'data-testid': 'confirm-delete-btn',
      }, 'Confirm Delete')
    );
  };
});
jest.mock('../components/modals/DuplicateModal', () => () => null);
jest.mock('../components/TagMaker', () => () => <div data-testid="mock-tag-maker" />);
jest.mock('../hooks/useSwipe.tsx', () => () => ({ onTouchStart: jest.fn(), onTouchEnd: jest.fn() }));

const mockMedia = {
  ID: 42,
  title: 'Attack on Titan',
  tier: 'S',
  toDo: false,
  year: '2020-04-07',
  tags: ['action'],
  description: 'Great show',
  mediaType: 'anime',
};

const mockUser = {
  username: 'alice',
  anime: {
    collectionTiers: { S: 'S', A: 'A', B: 'B', C: 'C', D: 'D', F: 'F' },
    todoTiers: { S: 'S', A: 'A', B: 'B', C: 'C', D: 'D', F: 'F' },
  },
  newTypes: {},
};

function renderDetails(urlPath = '/anime/collection/42', props = {}) {
  return render(
    <MemoryRouter initialEntries={[urlPath]}>
      <Routes>
        <Route
          path="/:mediaType/:group/:id"
          element={
            <ShowMediaDetails
              user={mockUser}
              newType={false}
              filteredData={{ S: [mockMedia] }}
              dataSource="api"
              basePath=""
              {...props}
            />
          }
        />
        <Route path="/:mediaType/:group" element={<div data-testid="list-page" />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  axios.get.mockResolvedValue({ data: mockMedia });
  axios.put.mockResolvedValue({ data: mockMedia });
  axios.delete.mockResolvedValue({ data: { toDo: false } });
  window.alert = jest.fn();
});

describe('ShowMediaDetails', () => {
  // ─── Fetch on mount ────────────────────────────────────────────────────────

  test('calls GET /api/media/:type/:id on mount', async () => {
    renderDetails();
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/media/anime/')
      )
    );
  });

  test('renders media title after loading', async () => {
    renderDetails();
    await waitFor(() =>
      expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
    );
  });

  test('renders media tier after loading', async () => {
    renderDetails();
    await waitFor(() => expect(screen.getByText('S')).toBeInTheDocument());
  });

  // ─── Edit mode (double-click to start editing) ────────────────────────────

  test('shows "Update Media" and "Cancel" buttons after double-clicking a field', async () => {
    renderDetails();
    await waitFor(() =>
      expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
    );
    // Double-click the title span to enter editing
    fireEvent.doubleClick(screen.getByText('Attack on Titan'));
    expect(screen.getByRole('button', { name: /update media/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('calls PUT /api/media when "Update Media" is clicked', async () => {
    renderDetails();
    await waitFor(() =>
      expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
    );
    fireEvent.doubleClick(screen.getByText('Attack on Titan'));
    fireEvent.click(screen.getByRole('button', { name: /update media/i }));
    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/media/anime/'),
        expect.any(Object)
      )
    );
  });

  test('hides "Update Media"/"Cancel" after clicking Cancel', async () => {
    renderDetails();
    await waitFor(() =>
      expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
    );
    fireEvent.doubleClick(screen.getByText('Attack on Titan'));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('button', { name: /update media/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  // ─── Delete flow ──────────────────────────────────────────────────────────

  test('opens delete confirmation when Delete button is clicked', async () => {
    renderDetails();
    await waitFor(() =>
      expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
    );
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    expect(screen.getByTestId('confirm-delete-btn')).toBeInTheDocument();
  });

  test('calls DELETE /api/media when deletion is confirmed', async () => {
    renderDetails();
    await waitFor(() =>
      expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
    );
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    fireEvent.click(screen.getByTestId('confirm-delete-btn'));
    await waitFor(() =>
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/api/media/anime/')
      )
    );
  });

  test('navigates to list page after successful deletion', async () => {
    renderDetails();
    await waitFor(() =>
      expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
    );
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    fireEvent.click(screen.getByTestId('confirm-delete-btn'));
    await waitFor(() =>
      expect(screen.getByTestId('list-page')).toBeInTheDocument()
    );
  });
});
