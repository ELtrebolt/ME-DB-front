import { render, screen } from '@testing-library/react';
import TotalStats from './TotalStats';

describe('TotalStats', () => {
  // ─── Values ────────────────────────────────────────────────────────────────

  test('renders totalToDo value', () => {
    render(<TotalStats totalRecords={50} totalCollection={30} totalToDo={20} />);
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  test('renders totalRecords value', () => {
    render(<TotalStats totalRecords={50} totalCollection={30} totalToDo={20} />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  test('renders totalCollection value', () => {
    render(<TotalStats totalRecords={50} totalCollection={30} totalToDo={20} />);
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  // ─── Labels ────────────────────────────────────────────────────────────────

  test('shows "Total To-Do" label', () => {
    render(<TotalStats totalRecords={0} totalCollection={0} totalToDo={0} />);
    expect(screen.getByText('Total To-Do')).toBeInTheDocument();
  });

  test('shows "Total Records" label', () => {
    render(<TotalStats totalRecords={0} totalCollection={0} totalToDo={0} />);
    expect(screen.getByText('Total Records')).toBeInTheDocument();
  });

  test('shows "Total Collection" label', () => {
    render(<TotalStats totalRecords={0} totalCollection={0} totalToDo={0} />);
    expect(screen.getByText('Total Collection')).toBeInTheDocument();
  });

  // ─── Zero values ───────────────────────────────────────────────────────────

  test('renders without crashing when all values are zero', () => {
    render(<TotalStats totalRecords={0} totalCollection={0} totalToDo={0} />);
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(3);
  });

  // ─── Color classes ─────────────────────────────────────────────────────────

  test('applies text-primary class to totalToDo value', () => {
    const { container } = render(
      <TotalStats totalRecords={50} totalCollection={30} totalToDo={20} />
    );
    const h3 = container.querySelector('h3.text-primary');
    expect(h3).toBeInTheDocument();
    expect(h3.textContent).toBe('20');
  });

  test('applies text-success class to totalRecords value', () => {
    const { container } = render(
      <TotalStats totalRecords={50} totalCollection={30} totalToDo={20} />
    );
    const h3 = container.querySelector('h3.text-success');
    expect(h3).toBeInTheDocument();
    expect(h3.textContent).toBe('50');
  });

  test('applies text-warning class to totalCollection value', () => {
    const { container } = render(
      <TotalStats totalRecords={50} totalCollection={30} totalToDo={20} />
    );
    const h3 = container.querySelector('h3.text-warning');
    expect(h3).toBeInTheDocument();
    expect(h3.textContent).toBe('30');
  });

  // ─── Three cards ───────────────────────────────────────────────────────────

  test('renders exactly three stat cards', () => {
    const { container } = render(
      <TotalStats totalRecords={50} totalCollection={30} totalToDo={20} />
    );
    expect(container.querySelectorAll('.col-md-4')).toHaveLength(3);
  });
});
