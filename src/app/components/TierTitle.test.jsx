import { MemoryRouter, useNavigate } from 'react-router-dom';
import { renderWithRouter, screen, fireEvent, waitFor } from '../../test-utils';
import { api as axios } from '../api';
import TierTitle from './TierTitle';

jest.mock('../api', () => ({
  api: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const defaultProps = {
  title: 'S Tier',
  mediaType: 'anime',
  group: 'collection',
  tier: 'S',
  setUserChanged: jest.fn(),
  newType: false,
  readOnly: false,
};

let mockNavigate;
beforeEach(() => {
  mockNavigate = jest.fn();
  useNavigate.mockReturnValue(mockNavigate);
  axios.put.mockResolvedValue({});
  jest.clearAllMocks();
  // Re-set after clearAllMocks resets mock.calls
  mockNavigate = jest.fn();
  useNavigate.mockReturnValue(mockNavigate);
});

describe('TierTitle', () => {
  // ─── Initial render ────────────────────────────────────────────────────────

  test('renders the title text', () => {
    renderWithRouter(<TierTitle {...defaultProps} />);
    expect(screen.getByText('S Tier')).toBeInTheDocument();
  });

  test('falls back to tier value when title prop is not provided', () => {
    renderWithRouter(<TierTitle {...defaultProps} title={undefined} />);
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  test('shows the Add (+) button in non-readOnly mode', () => {
    renderWithRouter(<TierTitle {...defaultProps} />);
    expect(screen.getByTitle('Add New')).toBeInTheDocument();
  });

  test('hides the Add (+) button in readOnly mode', () => {
    renderWithRouter(<TierTitle {...defaultProps} readOnly={true} />);
    expect(screen.queryByTitle('Add New')).not.toBeInTheDocument();
  });

  // ─── Edit mode activation ───────────────────────────────────────────────────

  test('enters edit mode on double-click', () => {
    renderWithRouter(<TierTitle {...defaultProps} />);
    fireEvent.doubleClick(screen.getByText('S Tier'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('S Tier');
  });

  test('does not enter edit mode on double-click in readOnly mode', () => {
    renderWithRouter(<TierTitle {...defaultProps} readOnly={true} />);
    fireEvent.doubleClick(screen.getByText('S Tier'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  // ─── Edit mode interaction ─────────────────────────────────────────────────

  test('updates the input value as the user types', () => {
    renderWithRouter(<TierTitle {...defaultProps} />);
    fireEvent.doubleClick(screen.getByText('S Tier'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Supreme Tier' } });
    expect(screen.getByRole('textbox')).toHaveValue('Supreme Tier');
  });

  test('shows the save (✓) button while editing', () => {
    renderWithRouter(<TierTitle {...defaultProps} />);
    fireEvent.doubleClick(screen.getByText('S Tier'));
    expect(screen.getByTitle('Save changes')).toBeInTheDocument();
  });

  // ─── Blur cancels ─────────────────────────────────────────────────────────

  test('cancels editing on blur and reverts to original text', () => {
    renderWithRouter(<TierTitle {...defaultProps} />);
    fireEvent.doubleClick(screen.getByText('S Tier'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Changed Title' } });
    fireEvent.blur(screen.getByRole('textbox'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('S Tier')).toBeInTheDocument();
  });

  // ─── Save via onSave callback (demo mode) ──────────────────────────────────

  test('calls onSave callback with the new text and exits edit mode', () => {
    const onSave = jest.fn();
    renderWithRouter(<TierTitle {...defaultProps} onSave={onSave} />);
    fireEvent.doubleClick(screen.getByText('S Tier'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Supreme Tier' } });
    fireEvent.mouseDown(screen.getByTitle('Save changes'));
    expect(onSave).toHaveBeenCalledWith('Supreme Tier');
    // Edit mode exits; the displayed text reverts to the title prop since the parent
    // hasn't updated it yet (onSave notifies the parent to do so)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  test('does not call axios when onSave callback is provided', () => {
    const onSave = jest.fn();
    renderWithRouter(<TierTitle {...defaultProps} onSave={onSave} />);
    fireEvent.doubleClick(screen.getByText('S Tier'));
    fireEvent.mouseDown(screen.getByTitle('Save changes'));
    expect(axios.put).not.toHaveBeenCalled();
  });

  // ─── Save via API (app mode) ───────────────────────────────────────────────

  test('calls axios.put with the correct URL and body when no onSave callback', async () => {
    renderWithRouter(<TierTitle {...defaultProps} />);
    fireEvent.doubleClick(screen.getByText('S Tier'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Supreme Tier' } });
    fireEvent.mouseDown(screen.getByTitle('Save changes'));
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/api/user/anime/collection/S'),
      expect.objectContaining({ newTitle: 'Supreme Tier' })
    );
  });

  test('uses "todo" as groupKey when group is "to-do"', async () => {
    renderWithRouter(<TierTitle {...defaultProps} group="to-do" />);
    fireEvent.doubleClick(screen.getByText('S Tier'));
    fireEvent.mouseDown(screen.getByTitle('Save changes'));
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/api/user/anime/todo/S'),
      expect.any(Object)
    );
  });

  test('exits edit mode after successful API save', async () => {
    renderWithRouter(<TierTitle {...defaultProps} />);
    fireEvent.doubleClick(screen.getByText('S Tier'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Supreme Tier' } });
    fireEvent.mouseDown(screen.getByTitle('Save changes'));
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
  });

  test('calls setUserChanged(true) after a successful API save', async () => {
    renderWithRouter(<TierTitle {...defaultProps} />);
    fireEvent.doubleClick(screen.getByText('S Tier'));
    fireEvent.mouseDown(screen.getByTitle('Save changes'));
    await waitFor(() => expect(defaultProps.setUserChanged).toHaveBeenCalledWith(true));
  });

  // ─── Title prop update ─────────────────────────────────────────────────────

  test('updates displayed text when the title prop changes', () => {
    const { rerender } = renderWithRouter(<TierTitle {...defaultProps} title="S Tier" />);
    expect(screen.getByText('S Tier')).toBeInTheDocument();
    // rerender must include the MemoryRouter wrapper because TierTitle calls useNavigate()
    rerender(
      <MemoryRouter>
        <TierTitle {...defaultProps} title="S+ Tier" />
      </MemoryRouter>
    );
    expect(screen.getByText('S+ Tier')).toBeInTheDocument();
  });

  // ─── Create URL tag forwarding ────────────────────────────────────────────

  describe('Create URL tag forwarding', () => {
    function renderWithSearch(search) {
      const initialEntry = `/anime/collection${search}`;
      renderWithRouter(<TierTitle {...defaultProps} />, {
        initialEntries: [initialEntry],
      });
      fireEvent.click(screen.getByTitle('Add New'));
    }

    function getNavigateUrl() {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      return mockNavigate.mock.calls[0][0];
    }

    test('when no tags in URL, create link contains only tier param', () => {
      renderWithSearch('');
      const url = getNavigateUrl();
      const params = new URLSearchParams(url.split('?')[1] || '');
      expect(params.get('tier')).toBe('S');
      expect(params.getAll('tag')).toHaveLength(0);
    });

    test('forwards repeated tag= params from list URL to create URL', () => {
      renderWithSearch('?tag=action&tag=drama');
      const url = getNavigateUrl();
      const params = new URLSearchParams(url.split('?')[1] || '');
      expect(params.getAll('tag')).toEqual(['action', 'drama']);
    });

    test('forwards a tag containing & correctly via URL encoding', () => {
      renderWithSearch('?tag=rock+%26+roll');
      const url = getNavigateUrl();
      const params = new URLSearchParams(url.split('?')[1] || '');
      expect(params.getAll('tag')).toEqual(['rock & roll']);
    });

    test('converts legacy comma tags= param to repeated tag= params', () => {
      renderWithSearch('?tags=comedy,action');
      const url = getNavigateUrl();
      const params = new URLSearchParams(url.split('?')[1] || '');
      expect(params.getAll('tag')).toEqual(['comedy', 'action']);
      expect(params.get('tags')).toBeNull();
    });

    test('forwards a plain tag with no special chars unchanged', () => {
      renderWithSearch('?tag=sci-fi');
      const url = getNavigateUrl();
      const params = new URLSearchParams(url.split('?')[1] || '');
      expect(params.getAll('tag')).toEqual(['sci-fi']);
    });
  });
});
