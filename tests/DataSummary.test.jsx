import { render, screen } from '@testing-library/react';
import DataSummary from '../src/components/DataSummary';

test('renders nothing when summary is null', () => {
  const { container } = render(<DataSummary summary={null} />);
  expect(container.firstChild).toBeNull();
});

test('shows row count and columns', () => {
  const summary = { rowCount: 2, columns: ['a', 'b'] };
  render(<DataSummary summary={summary} />);
  expect(screen.getByText('Data Summary')).toBeInTheDocument();
  expect(screen.getByText(/Rows: 2/)).toBeInTheDocument();
  expect(screen.getByText('a')).toBeInTheDocument();
  expect(screen.getByText('b')).toBeInTheDocument();
});
