import { render, screen, fireEvent } from '@testing-library/react';
import TagFilter from './TagFilter';

const suggestions = [
  { value: 0, label: 'action' },
  { value: 1, label: 'romance' },
];

const defaultProps = {
  suggestedTags: suggestions,
  selected: [],
  setSelected: jest.fn(),
  setSearchChanged: jest.fn(),
  tagLogic: 'OR',
  setTagLogic: jest.fn(),
  placeholder: 'Add a tag',
};

describe('TagFilter', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders the "Filter by Tags" label', () => {
    render(<TagFilter {...defaultProps} />);
    expect(screen.getByText('Filter by Tags')).toBeInTheDocument();
  });

  test('renders the tag input', () => {
    render(<TagFilter {...defaultProps} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('renders without crashing when suggestedTags is empty', () => {
    render(<TagFilter {...defaultProps} suggestedTags={[]} />);
    expect(screen.getByText('Filter by Tags')).toBeInTheDocument();
  });

  test('renders without crashing when selected tags are present', () => {
    render(
      <TagFilter
        {...defaultProps}
        selected={[{ value: 0, label: 'action' }]}
      />
    );
    expect(screen.getByText('action')).toBeInTheDocument();
  });
});
