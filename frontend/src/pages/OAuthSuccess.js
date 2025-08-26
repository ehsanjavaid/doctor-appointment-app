import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { oauthLogin } = useAuth();

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userId = params.get('userId');

      if (token) {
        try {
          const result = await oauthLogin(token);
          if (result.success) {
            navigate('/dashboard');
          } else {
            navigate('/login');
          }
        } catch (error) {
          console.error('OAuth login failed:', error);
          navigate('/login');
        }
      } else {
        // Handle error case
        navigate('/login');
      }
    };

    handleOAuthSuccess();
  }, [navigate, oauthLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900">Logging you in...</h1>
        <p className="text-gray-600 mt-2">Please wait while we complete your authentication</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
