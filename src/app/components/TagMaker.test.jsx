import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TagMaker from './TagMaker';

jest.mock('./../../app/hooks/useMediaData', () => {
  const tags = ['action', 'drama', 'romance'];
  return { useMediaData: () => ({ uniqueTags: tags }) };
});

// Controlled mock so we can trigger onAdd / onDelete directly.
// Tags can be strings or {value, label} objects depending on which useEffect sets them first.
jest.mock('react-tag-autocomplete', () => ({
  ReactTags: ({ onAdd, onDelete, selected, placeholderText }) => (
    <div>
      <span data-testid="placeholder">{placeholderText}</span>
      {selected.map((tag, i) => {
        const label = typeof tag === 'string' ? tag : tag.label;
        return (
          <span key={`${i}-${label}`} data-testid={`selected-tag-${label}`}>
            {label}
            <button onClick={() => onDelete(i)} aria-label={`remove ${label}`}>×</button>
          </span>
        );
      })}
      <button
        data-testid="add-tag-btn"
        onClick={() => onAdd({ value: 99, label: 'thriller' })}
      >
        add tag
      </button>
    </div>
  ),
}));

const baseMedia = { title: 'Test', tags: [] };

describe('TagMaker', () => {
  // ─── Label ──────────────────────────────────────────────────────────────────

  test('shows "Tags (Optional)" label by default', () => {
    render(
      <TagMaker
        mediaType="anime"
        media={baseMedia}
        setMedia={jest.fn()}
      />
    );
    expect(screen.getByText('Tags (Optional)')).toBeInTheDocument();
  });

  test('hides the label when hideLabel is true', () => {
    render(
      <TagMaker
        mediaType="anime"
        media={baseMedia}
        setMedia={jest.fn()}
        hideLabel
      />
    );
    expect(screen.queryByText('Tags (Optional)')).not.toBeInTheDocument();
  });

  // ─── Pre-selected tags ─────────────────────────────────────────────────────

  test('initialises selected tags from alreadySelected prop', async () => {
    render(
      <TagMaker
        mediaType="anime"
        media={baseMedia}
        setMedia={jest.fn()}
        alreadySelected={['action', 'drama']}
      />
    );
    // useEffect matches alreadySelected against uniqueTags — both 'action' and 'drama' exist
    await waitFor(() => {
      expect(screen.getByTestId('selected-tag-action')).toBeInTheDocument();
      expect(screen.getByTestId('selected-tag-drama')).toBeInTheDocument();
    });
  });

  // ─── Add tag ───────────────────────────────────────────────────────────────

  test('calls setMedia with the new tag appended when a tag is added', () => {
    const setMedia = jest.fn();
    render(
      <TagMaker
        mediaType="anime"
        media={baseMedia}
        setMedia={setMedia}
      />
    );
    fireEvent.click(screen.getByTestId('add-tag-btn'));
    expect(setMedia).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ['thriller'] })
    );
  });

  // ─── Delete tag ────────────────────────────────────────────────────────────

  test('calls setMedia with the tag removed when a tag is deleted', async () => {
    const setMedia = jest.fn();
    render(
      <TagMaker
        mediaType="anime"
        media={baseMedia}
        setMedia={setMedia}
        alreadySelected={['action']}
      />
    );
    await waitFor(() =>
      expect(screen.getByTestId('selected-tag-action')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: /remove action/i }));
    expect(setMedia).toHaveBeenCalledWith(
      expect.objectContaining({ tags: [] })
    );
  });

  // ─── Placeholder ──────────────────────────────────────────────────────────

  test('passes placeholder text to ReactTags', () => {
    render(
      <TagMaker
        mediaType="anime"
        media={baseMedia}
        setMedia={jest.fn()}
        placeholder="Add tags here"
      />
    );
    expect(screen.getByTestId('placeholder').textContent).toBe('Add tags here');
  });
});
