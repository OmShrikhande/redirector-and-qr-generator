import React, { useEffect, useMemo, useState } from 'react';
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

  const deleteLink = async (id) => {
    await fetch(`/api/links/${id}?userId=${user.id}`, {
      method: 'DELETE',
    });
    fetchLinks();
  };

  const profileInitials = useMemo(() => {
    if (!user) return 'QR';
    const source = user.displayName || user.email || 'QR';
    const nameParts = source.trim().split(/\s+/);
    if (nameParts.length === 1) {
      return nameParts[0].slice(0, 2).toUpperCase();
    }
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen text-white">
      <header className="header panel dashboard-header">
        <div className="header-title">
          <span className="badge accent">Dashboard</span>
          <h1>Creative QR Studio</h1>
          <p className="subtitle">Design, launch, and monitor personalized QR experiences in seconds.</p>
        </div>
        <div className="profile">
          <div className="profile-info">
            <span className="small">Welcome back</span>
            <strong>{user.displayName || user.email}</strong>
          </div>
          <div className="profile-avatar">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || user.email} />
            ) : (
              <span>{profileInitials}</span>
            )}
          </div>
          <button onClick={logout} className="ghost-button logout-button">
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <main className="container dashboard-grid">
        <CreateLinkForm onAdd={addLink} />
        <section className="panel links-panel">
          <div className="panel-heading">
            <span className="badge accent">Library</span>
            <h2>Your QR collection</h2>
            <p className="small">Tap any card to view analytics, refresh URLs, or download the code.</p>
          </div>
          <div className="links-grid">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onUpdate={updateLink}
                onDelete={deleteLink}
              />
            ))}
          </div>
          {links.length === 0 && (
            <p className="empty-state">
              You haven&apos;t created any QR links yet. Craft your first one with the form on the left!
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;