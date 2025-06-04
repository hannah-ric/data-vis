import { render, screen, fireEvent } from '@testing-library/react';
import ChartConfiguration from '../src/components/ChartConfiguration';

test('renders nothing when columns are not provided', () => {
  const { container } = render(<ChartConfiguration columns={null} config={{}} onChange={jest.fn()} />);
  expect(container.firstChild).toBeNull();
});

test('calls onChange when selections update', () => {
  const onChange = jest.fn();
  const columns = ['col1', 'col2'];
  const config = { type: 'bar', x: '', y: '' };
  render(<ChartConfiguration columns={columns} config={config} onChange={onChange} />);

  fireEvent.change(screen.getByLabelText('Chart Type:'), { target: { name: 'type', value: 'line' } });
  fireEvent.change(screen.getByLabelText('X:'), { target: { name: 'x', value: 'col1' } });
  fireEvent.change(screen.getByLabelText('Y:'), { target: { name: 'y', value: 'col2' } });

  expect(onChange).toHaveBeenCalledTimes(3);
  expect(onChange).toHaveBeenNthCalledWith(1, { type: 'line', x: '', y: '' });
  expect(onChange).toHaveBeenNthCalledWith(2, { type: 'bar', x: 'col1', y: '' });
  expect(onChange).toHaveBeenNthCalledWith(3, { type: 'bar', x: '', y: 'col2' });
});
