import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const success = isLogin ? await login(email, password) : await register(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError(isLogin ? 'Invalid credentials' : 'User already exists');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="panel w-full max-w-md">
        <h2 className="text-center mb-6">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="actions">
            <button type="submit" className="flex-1">
              {isLogin ? 'Login' : 'Register'}
            </button>
          </div>
        </form>
        <div className="hr"></div>
        <p className="small text-center">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;