import React, { useState } from 'react';
import QRCode from 'qrcode';
import { BarChart3, Edit, Eye } from 'lucide-react';

const LinkCard = ({ link, onUpdate }) => {
  const [qrUrl, setQrUrl] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newUrl, setNewUrl] = useState(link.destinationUrl);

  React.useEffect(() => {
    const generateQR = async () => {
      const url = `${window.location.origin}/r/${link.slug}`;
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, url, {
        color: {
          dark: link.customizations.fgColor,
          light: link.customizations.bgColor,
        },
        width: 200,
      });

      if (link.customizations.logoUrl) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const size = 40;
          const x = (canvas.width - size) / 2;
          const y = (canvas.height - size) / 2;
          ctx.drawImage(img, x, y, size, size);
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
  }, [link]);

  const handleSave = () => {
    onUpdate(link.id, { destinationUrl: newUrl });
    setEditing(false);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">Slug: {link.slug}</h3>
          <p className="text-gray-400 text-sm">URL: {window.location.origin}/r/{link.slug}</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setShowStats(!showStats)} className="p-2 bg-blue-600 rounded hover:bg-blue-700">
            <BarChart3 size={16} />
          </button>
          <button onClick={() => setEditing(!editing)} className="p-2 bg-green-600 rounded hover:bg-green-700">
            <Edit size={16} />
          </button>
        </div>
      </div>

      {qrUrl && (
        <div className="mb-4 flex justify-center">
          <img src={qrUrl} alt="QR Code" className="border-2 border-gray-600 rounded" />
        </div>
      )}

      {editing && (
        <div className="mb-4">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex space-x-2 mt-2">
            <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Save</button>
            <button onClick={() => setEditing(false)} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      )}

      {showStats && (
        <div className="bg-gray-700 p-4 rounded">
          <h4 className="font-semibold mb-2 flex items-center">
            <Eye className="mr-2" size={16} />
            Scan Statistics
          </h4>
          <p>Total Scans: {link.scans?.length || 0}</p>
          {link.scans && link.scans.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-400">Recent scans:</p>
              {link.scans.slice(-5).map((scan, index) => (
                <div key={index} className="text-xs text-gray-300">
                  {new Date(scan.timestamp).toLocaleString()} - {scan.ip}
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