import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn LLM pages', () => {
  render(<App />);
  const linkElement = screen.getByText(/LLM/i);
  expect(linkElement).toBeInTheDocument();
});
