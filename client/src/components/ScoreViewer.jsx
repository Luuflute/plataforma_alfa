import React from 'react';

const ScoreViewer = ({ pdfUrl }) => {
  if (!pdfUrl) return null;

  return (
    <div className="w-full h-[700px] border rounded-lg bg-white overflow-hidden">
      <iframe
        src={`${pdfUrl}#toolbar=0&navpanes=0`}
        className="w-full h-full"
        title="Visor de Partitura"
      />
    </div>
  );
};

export default ScoreViewer;