import { render } from 'solid-js/web';
import { QueryClientProvider } from '@tanstack/solid-query';
import App from './app/App';
import { queryClient } from './app/queryClient';
import './shared/style/global.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing root element');
}

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  ),
  root
);
