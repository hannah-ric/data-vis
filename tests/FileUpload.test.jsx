import { render, fireEvent } from '@testing-library/react';
import FileUpload from '../src/components/FileUpload';

test('calls onFileLoaded when a file is selected', () => {
  const onFileLoaded = jest.fn();
  const { container } = render(<FileUpload onFileLoaded={onFileLoaded} />);
  const input = container.querySelector('input[type="file"]');
  const file = new File(['data'], 'test.csv', { type: 'text/csv' });
  fireEvent.change(input, { target: { files: [file] } });
  expect(onFileLoaded).toHaveBeenCalledWith(file);
});
