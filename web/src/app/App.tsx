import { Route, Router } from '@solidjs/router';
import AppShell from './AppShell';
import About from './routes/About';
import GalleryPage from './routes/GalleryPage';
import LoginPage from './routes/LoginPage';
import RegisterPage from './routes/RegisterPage';

const App = () => {
  return (
    <Router root={AppShell}>
      <Route path="/" component={GalleryPage} />
      <Route path="/about" component={About} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
    </Router>
  );
};

export default App;
