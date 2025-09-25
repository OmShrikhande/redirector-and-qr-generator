import React, { useState } from 'react';

const CreateLinkForm = ({ onAdd }) => {
  const [destinationUrl, setDestinationUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [customizations, setCustomizations] = useState({
    logoUrl: '',
    borderColor: '#000000',
    bgColor: '#FFFFFF',
    fgColor: '#000000',
  });

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
    setCustomizations({
      logoUrl: '',
      borderColor: '#000000',
      bgColor: '#FFFFFF',
      fgColor: '#000000',
    });
  };

  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Create New QR Link</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2">Destination URL</label>
          <input
            type="url"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-2">Custom Slug (optional)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2">Logo URL</label>
            <input
              type="url"
              value={customizations.logoUrl}
              onChange={(e) => setCustomizations({...customizations, logoUrl: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Border Color</label>
            <input
              type="color"
              value={customizations.borderColor}
              onChange={(e) => setCustomizations({...customizations, borderColor: e.target.value})}
              className="w-full h-10 bg-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Background Color</label>
            <input
              type="color"
              value={customizations.bgColor}
              onChange={(e) => setCustomizations({...customizations, bgColor: e.target.value})}
              className="w-full h-10 bg-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Foreground Color</label>
            <input
              type="color"
              value={customizations.fgColor}
              onChange={(e) => setCustomizations({...customizations, fgColor: e.target.value})}
              className="w-full h-10 bg-gray-700 rounded"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Link
        </button>
      </form>
    </div>
  );
};

export default CreateLinkForm;