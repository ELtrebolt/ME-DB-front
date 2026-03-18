import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TagMaker from './TagMaker';

jest.mock('./../../app/hooks/useMediaData', () => {
  const tags = ['action', 'drama', 'romance'];
  return { useMediaData: () => ({ uniqueTags: tags }) };
});

// Controlled mock so we can trigger onAdd / onDelete directly.
// Tags can be strings or {value, label} objects depending on which useEffect sets them first.
jest.mock('react-tag-autocomplete', () => {
  const { useState } = require('react');
  return { ReactTags: ({ onAdd, onDelete, selected, placeholderText }) => {
    const [customLabel, setCustomLabel] = useState('');
    return (
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
        {/* Fixed add button used by existing tests */}
        <button
          data-testid="add-tag-btn"
          onClick={() => onAdd({ value: 99, label: 'thriller' })}
        >
          add tag
        </button>
        {/* Configurable add input used by dedupe tests */}
        <input
          data-testid="custom-tag-input"
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
        />
        <button
          data-testid="add-custom-tag-btn"
          onClick={() => onAdd({ value: 100, label: customLabel })}
        >
          add custom tag
      </button>
    </div>
    );
  }};
});

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

  // ─── Dedupe guard ─────────────────────────────────────────────────────────

  describe('Dedupe guard', () => {
    function renderWithSelected(selectedLabels, setMedia = jest.fn()) {
      const alreadySelected = selectedLabels.map(label => ({ label, value: label }));
      const media = { title: 'Test', tags: selectedLabels };
      render(
        <TagMaker
          mediaType="anime"
          media={media}
          setMedia={setMedia}
          alreadySelected={alreadySelected}
          hideLabel
        />
      );
      return setMedia;
    }

    async function addCustomTag(label) {
      await waitFor(() =>
        expect(screen.getByTestId('add-custom-tag-btn')).toBeInTheDocument()
      );
      fireEvent.change(screen.getByTestId('custom-tag-input'), {
        target: { value: label },
      });
      fireEvent.click(screen.getByTestId('add-custom-tag-btn'));
    }

    test('blocks adding an exact duplicate tag', async () => {
      const setMedia = renderWithSelected(['action']);
      await addCustomTag('action');
      expect(setMedia).not.toHaveBeenCalled();
    });

    test('blocks adding a tag that differs only in case', async () => {
      const setMedia = renderWithSelected(['action']);
      await addCustomTag('Action');
      expect(setMedia).not.toHaveBeenCalled();
    });

    test('blocks adding a tag that matches after trimming whitespace', async () => {
      const setMedia = renderWithSelected(['action']);
      await addCustomTag(' action ');
      expect(setMedia).not.toHaveBeenCalled();
    });

    test('allows adding a genuinely different tag', async () => {
      const setMedia = renderWithSelected(['action']);
      await addCustomTag('drama');
      expect(setMedia).toHaveBeenCalledWith(
        expect.objectContaining({ tags: expect.arrayContaining(['action', 'drama']) })
      );
    });
  });
});
