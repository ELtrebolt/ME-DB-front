import { render, screen, fireEvent } from '@testing-library/react';
import FormSelect from './FormSelect';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
];

describe('FormSelect', () => {
  test('renders a select element', () => {
    render(<FormSelect />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('renders all provided options', () => {
    render(<FormSelect options={options} />);
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option B' })).toBeInTheDocument();
  });

  test('renders label when provided', () => {
    render(<FormSelect label="Category" options={options} />);
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  test('shows error message and applies is-invalid class', () => {
    render(<FormSelect error="Required" options={options} />);
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveClass('is-invalid');
  });

  test('shows helper text when no error is present', () => {
    render(<FormSelect helperText="Choose one" options={options} />);
    expect(screen.getByText('Choose one')).toBeInTheDocument();
  });

  test('hides helper text when error is present', () => {
    render(<FormSelect error="Error" helperText="Helper" options={options} />);
    expect(screen.queryByText('Helper')).not.toBeInTheDocument();
  });

  test('renders with no options without crashing', () => {
    render(<FormSelect />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('calls onChange when selection changes', () => {
    const onChange = jest.fn();
    render(<FormSelect options={options} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
