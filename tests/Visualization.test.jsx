import { render } from '@testing-library/react';
import Visualization from '../src/components/Visualization';
import { Chart } from 'chart.js/auto';

jest.mock('chart.js/auto', () => ({
  Chart: jest.fn().mockImplementation(() => ({ destroy: jest.fn() }))
}));

// jsdom does not implement canvas getContext; stub it
HTMLCanvasElement.prototype.getContext = jest.fn();

test('renders canvas and initializes chart', () => {
  const data = [
    { x: 1, y: 2 },
    { x: 2, y: 3 }
  ];
  const config = { type: 'bar', x: 'x', y: 'y' };
  const { container } = render(<Visualization data={data} config={config} />);
  expect(container.querySelector('canvas')).toBeInTheDocument();
  expect(Chart).toHaveBeenCalled();
});
