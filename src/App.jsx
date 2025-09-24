import React, { useEffect, useMemo, useState } from 'react'

export default function App() {
  const [destinationUrl, setDestinationUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [links, setLinks] = useState([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const baseApi = '' // proxied by Vite to http://localhost:3000

  async function loadLinks() {
    try {
      const res = await fetch(`${baseApi}/api/links`)
      const data = await res.json()
      setLinks(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadLinks()
  }, [])

  async function createLink(e) {
    e.preventDefault()
    setError('')
    if (!destinationUrl) {
      setError('Destination URL is required')
      return
    }
    setCreating(true)
    try {
      const res = await fetch(`${baseApi}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationUrl, slug: slug || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create')
      setDestinationUrl('')
      setSlug('')
      await loadLinks()
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  async function updateDestination(s, newUrl) {
    const res = await fetch(`${baseApi}/api/links/${encodeURIComponent(s)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinationUrl: newUrl }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Update failed')
  }

  async function changeSlug(oldSlug, newSlug) {
    const res = await fetch(`${baseApi}/api/links/${encodeURIComponent(oldSlug)}/change-slug`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newSlug }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Change slug failed')
  }

  return (
    <div className="container">
      <header className="header">
        <div className="title">
          <h1>Redirector + QR</h1>
          <h2>Create permanent QR codes with editable destinations</h2>
        </div>
      </header>

      <section className="panel" style={{ marginBottom: 16 }}>
        <form onSubmit={createLink} className="form-grid">
          <div className="form-row">
            <label className="small">Destination URL</label>
            <input
              type="url"
              placeholder="https://github.com/omshrikhande"
              value={destinationUrl}
              onChange={e => setDestinationUrl(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label className="small">Optional custom slug (immutable)</label>
            <input
              type="text"
              placeholder="e.g. profile"
              value={slug}
              onChange={e => setSlug(e.target.value)}
            />
          </div>
          {error && <div className="small" style={{ color: '#ff6b6b' }}>{error}</div>}
          <div className="actions">
            <button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create short link'}
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="header" style={{ marginBottom: 10 }}>
          <h2>Your links</h2>
          <span className="badge mono">{links.length} total</span>
        </div>
        <div className="links-grid">
          {links.map(item => (
            <LinkCard key={item.slug} item={item} baseApi={baseApi} onChanged={loadLinks} onUpdateDest={updateDestination} onChangeSlug={changeSlug} />
          ))}
        </div>
      </section>
    </div>
  )
}

function LinkCard({ item, baseApi, onChanged, onUpdateDest, onChangeSlug }) {
  const [dest, setDest] = useState(item.destinationUrl)
  const [newSlug, setNewSlug] = useState('')
  const shortUrl = useMemo(() => `${window.location.origin}/r/${item.slug}`, [item.slug])

  async function handleSave() {
    await onUpdateDest(item.slug, dest)
    await onChanged()
  }

  async function handleChangeSlug() {
    if (!newSlug) return
    await onChangeSlug(item.slug, newSlug)
    setNewSlug('')
    await onChanged()
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="small"><strong>Slug:</strong> <span className="mono">{item.slug}</span></div>
          <div className="small mono" style={{ wordBreak: 'break-all' }}>
            <strong>Short URL:</strong> <a href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a>
          </div>
        </div>
        <img className="qr" src={`${baseApi}/api/links/${encodeURIComponent(item.slug)}/qr`} alt="qr" width={96} height={96} />
      </div>

      <hr className="hr" />

      <div>
        <label className="small">Destination URL</label>
        <input
          type="url"
          value={dest}
          onChange={e => setDest(e.target.value)}
        />
        <div className="actions" style={{ marginTop: 8 }}>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>

      <details style={{ marginTop: 8 }}>
        <summary className="small">Change slug (this retires the old QR)</summary>
        <div className="actions" style={{ marginTop: 8 }}>
          <input
            type="text"
            placeholder="new-slug"
            value={newSlug}
            onChange={e => setNewSlug(e.target.value)}
          />
          <button onClick={handleChangeSlug}>Change slug</button>
        </div>
      </details>
    </div>
  )
}
