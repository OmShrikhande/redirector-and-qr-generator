import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CreateLinkForm from '../components/CreateLinkForm';
import LinkCard from '../components/LinkCard';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user]);

  const fetchLinks = async () => {
    const response = await fetch(`/api/links?userId=${user.id}`);
    const linksData = await response.json();
    setLinks(linksData);
    setLoading(false);
  };

  const addLink = async (linkData) => {
    await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...linkData, userId: user.id }),
    });
    fetchLinks();
  };

  const updateLink = async (id, updates) => {
    await fetch(`/api/links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, userId: user.id }),
    });
    fetchLinks();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">QR Redirector Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span>Welcome, {user.email}</span>
          <button onClick={logout} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <CreateLinkForm onAdd={addLink} />
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map(link => (
              <LinkCard key={link.id} link={link} onUpdate={updateLink} />
            ))}
          </div>
          {links.length === 0 && <p className="text-gray-400">No links yet. Create your first one!</p>}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;