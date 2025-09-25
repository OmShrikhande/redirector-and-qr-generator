import React, { useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { BarChart3, Download, Edit, Eye, Trash2 } from 'lucide-react';

const LinkCard = ({ link, onUpdate, onDelete }) => {
  const [qrUrl, setQrUrl] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newUrl, setNewUrl] = useState(link.destinationUrl);

  const shortUrl = useMemo(
    () => `http://192.168.137.1:3000/r/${link.slug}`,
    [link.slug]
  );

  React.useEffect(() => {
    const generateQR = async () => {
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, shortUrl, {
        color: {
          dark: link.customizations.fgColor,
          light: link.customizations.bgColor,
        },
        width: 220,
        margin: 2,
        errorCorrectionLevel: 'H',
      });

      if (link.customizations.logoUrl) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const size = 58;
          const x = (canvas.width - size) / 2;
          const y = (canvas.height - size) / 2;
          ctx.save();
          ctx.beginPath();
          ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, x, y, size, size);
          ctx.restore();
          setQrUrl(canvas.toDataURL());
        };
        img.onerror = () => {
          setQrUrl(canvas.toDataURL());
        };
        img.src = link.customizations.logoUrl;
      } else {
        setQrUrl(canvas.toDataURL());
      }
    };
    generateQR();
  }, [link, shortUrl]);

  const handleSave = () => {
    onUpdate(link.id, { destinationUrl: newUrl });
    setEditing(false);
  };

  const downloadQr = () => {
    if (!qrUrl) return;
    const tempLink = document.createElement('a');
    tempLink.href = qrUrl;
    tempLink.download = `${link.slug || 'qr-code'}.png`;
    tempLink.click();
  };

  const handleDelete = () => {
    if (!onDelete) return;
    const confirmed = window.confirm(`Delete QR for “${link.slug}”? This cannot be undone.`);
    if (confirmed) {
      onDelete(link.id);
    }
  };

  return (
    <div className="card link-card">
      <div className="card-header">
        <div>
          <span className="badge">Slug</span>
          <h3>{link.slug}</h3>
          <p className="small mono">{shortUrl}</p>
        </div>
        <div className="card-actions">
          <button onClick={() => setShowStats(!showStats)} title="Toggle stats">
            <BarChart3 size={16} />
          </button>
          <button onClick={downloadQr} title="Download QR">
            <Download size={16} />
          </button>
          <button onClick={() => setEditing(!editing)} title="Edit destination">
            <Edit size={16} />
          </button>
          <button onClick={handleDelete} title="Delete QR">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {qrUrl && (
        <div
          className="qr preview-block"
          style={{ borderColor: link.customizations.borderColor }}
        >
          <img src={qrUrl} alt={`QR code for ${shortUrl}`} />
        </div>
      )}

      {editing && (
        <div className="editor">
          <div className="form-row">
            <label>Destination URL</label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>
          <div className="actions">
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setEditing(false)} className="ghost-button">
              Cancel
            </button>
          </div>
        </div>
      )}

      {showStats && (
        <div className="stats">
          <div className="hr"></div>
          <h4 className="flex items-center mb-2">
            <Eye className="mr-2" size={16} />
            Scan statistics
          </h4>
          <p className="highlight">Total scans: {link.scans?.length || 0}</p>
          {link.scans && link.scans.length > 0 && (
            <div className="timeline">
              <p className="small">Recent scans:</p>
              {link.scans.slice(-5).map((scan, index) => (
                <div key={index} className="timeline-item">
                  <span>{new Date(scan.timestamp).toLocaleString()}</span>
                  <span className="mono">{scan.ip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LinkCard;