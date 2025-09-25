import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const DEFAULT_CUSTOMIZATIONS = {
  logoUrl: '',
  borderColor: '#6B46FF',
  bgColor: '#FFFFFF',
  fgColor: '#000000',
};

const CreateLinkForm = ({ onAdd }) => {
  const [destinationUrl, setDestinationUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [customizations, setCustomizations] = useState(() => ({ ...DEFAULT_CUSTOMIZATIONS }));
  const [previewUrl, setPreviewUrl] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      destinationUrl,
      slug: slug || generateSlug(),
      customizations,
      scans: [],
    });

    setDestinationUrl('');
    setSlug('');
    setCustomizations({ ...DEFAULT_CUSTOMIZATIONS });
  };

  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const handleCustomizationChange = (key) => (event) => {
    const value = event?.target?.value ?? event;
    setCustomizations((prev) => ({ ...prev, [key]: value }));
  };

  const formatColorValue = (value) => value?.toUpperCase();

  const downloadPreview = () => {
    if (!previewUrl) return;
    const tempLink = document.createElement('a');
    tempLink.href = previewUrl;
    tempLink.download = `${slug || 'qr-preview'}.png`;
    tempLink.click();
  };

  useEffect(() => {
    let isMounted = true;

    const createPreview = async () => {
      if (!destinationUrl.trim()) {
        if (isMounted) {
          setPreviewUrl('');
        }
        return;
      }

      setIsGeneratingPreview(true);
      try {
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, destinationUrl.trim(), {
          color: {
            dark: customizations.fgColor || '#000000',
            light: customizations.bgColor || '#ffffff',
          },
          width: 280,
          margin: 1,
          errorCorrectionLevel: 'H',
        });

        if (customizations.logoUrl) {
          await new Promise((resolve) => {
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const size = 60;
              const x = (canvas.width - size) / 2;
              const y = (canvas.height - size) / 2;
              ctx.save();
              ctx.beginPath();
              ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
              ctx.drawImage(img, x, y, size, size);
              ctx.restore();
              resolve();
            };
            img.onerror = resolve;
            img.src = customizations.logoUrl;
          });
        }

        const nextPreview = canvas.toDataURL('image/png');
        if (isMounted) {
          setPreviewUrl(nextPreview);
        }
      } catch (error) {
        if (isMounted) {
          setPreviewUrl('');
        }
      } finally {
        if (isMounted) {
          setIsGeneratingPreview(false);
        }
      }
    };

    createPreview();

    return () => {
      isMounted = false;
    };
  }, [
    destinationUrl,
    customizations.logoUrl,
    customizations.bgColor,
    customizations.fgColor,
  ]);

  return (
    <section className="panel creation-panel">
      <div className="creation-header">
        <span className="badge">Create</span>
        <h2 className="creation-title">Design a new QR redirect</h2>
        <p className="small">Enter the destination and tailor your QR code instantly.</p>
      </div>
      <div className="creation-grid">
        <form onSubmit={handleSubmit} className="form-grid form-section">
          <div className="form-row">
            <label>Destination URL</label>
            <input
              type="url"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </div>
          <div className="form-row">
            <label>Custom Slug (optional)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-custom-link"
            />
          </div>
          <div className="form-grid customization-grid">
            <div className="form-row">
              <label>Logo URL</label>
              <input
                type="url"
                value={customizations.logoUrl}
                onChange={handleCustomizationChange('logoUrl')}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="form-row color-picker">
              <label>Border Color</label>
              <div className="color-input">
                <input
                  type="color"
                  value={customizations.borderColor}
                  onChange={handleCustomizationChange('borderColor')}
                />
                <div className="color-chip" style={{ background: customizations.borderColor }} />
                <span className="color-value">{formatColorValue(customizations.borderColor)}</span>
              </div>
            </div>
            <div className="form-row color-picker">
              <label>Background Color</label>
              <div className="color-input">
                <input
                  type="color"
                  value={customizations.bgColor}
                  onChange={handleCustomizationChange('bgColor')}
                />
                <div className="color-chip" style={{ background: customizations.bgColor }} />
                <span className="color-value">{formatColorValue(customizations.bgColor)}</span>
              </div>
            </div>
            <div className="form-row color-picker">
              <label>Foreground Color</label>
              <div className="color-input">
                <input
                  type="color"
                  value={customizations.fgColor}
                  onChange={handleCustomizationChange('fgColor')}
                />
                <div className="color-chip" style={{ background: customizations.fgColor }} />
                <span className="color-value">{formatColorValue(customizations.fgColor)}</span>
              </div>
            </div>
          </div>
          <div className="actions">
            <button type="submit">
              Create Link
            </button>
          </div>
        </form>
        <aside className="preview-panel" style={{ borderColor: customizations.borderColor }}>
          <div className="preview-header">
            <span className="badge accent">Live Preview</span>
            <h3>QR Snapshot</h3>
            <p className="small">Adjust colors to see the magic happen in real time.</p>
          </div>
          <div className="preview-stage">
            {previewUrl ? (
              <img src={previewUrl} alt="QR preview" className="preview-qr" />
            ) : (
              <div className="preview-placeholder">
                <p>Add a destination URL to generate your QR preview.</p>
              </div>
            )}
            {isGeneratingPreview && <span className="small preview-status">Refreshing preview…</span>}
          </div>
          <div className="preview-colors">
            {[
              { key: 'borderColor', label: 'Border' },
              { key: 'bgColor', label: 'Background' },
              { key: 'fgColor', label: 'Foreground' },
            ].map(({ key, label }) => (
              <div key={key} className="preview-chip">
                <span className="chip-swatch" style={{ background: customizations[key] }} />
                <div className="chip-meta">
                  <span className="chip-label">{label}</span>
                  <span className="chip-value">{formatColorValue(customizations[key])}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="preview-actions">
            <button
              type="button"
              onClick={downloadPreview}
              className="ghost-button"
              disabled={!previewUrl}
            >
              Download QR
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default CreateLinkForm;