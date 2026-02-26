import { MemoryRouter } from 'react-router-dom';
import { renderWithRouter, screen, fireEvent, waitFor } from '../../test-utils';
import axios from 'axios';
import TierTitle from './TierTitle';

jest.mock('axios');

const defaultProps = {
  title: 'S Tier',
  mediaType: 'anime',
  group: 'collection',
  tier: 'S',
  setUserChanged: jest.fn(),
  newType: false,
  readOnly: false,
};

beforeEach(() => {
  axios.defaults = {};
  axios.put.mockResolvedValue({});
  jest.clearAllMocks();
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
});
