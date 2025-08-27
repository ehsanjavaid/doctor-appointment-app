import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock the AuthContext to avoid dependency on actual context
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    hasRole: jest.fn(),
    hasAnyRole: jest.fn()
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

// Mock the SocketContext
jest.mock('../contexts/SocketContext', () => ({
  useSocket: () => ({
    socket: null,
    connected: false,
    connect: jest.fn(),
    disconnect: jest.fn()
  }),
  SocketProvider: ({ children }) => <div>{children}</div>
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // The app should render without throwing errors
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('contains navigation elements', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Check for navigation elements
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('renders main content area', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Check for main content area
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});

describe('App Routing', () => {
  test('renders home page by default', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Check for elements that should be on the home page
    expect(screen.getByText(/doctor booking/i)).toBeInTheDocument();
  });

  // Add more routing tests as needed
});
