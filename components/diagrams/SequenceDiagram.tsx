/**
 * Sequence Diagram Component
 */

import React, { useEffect } from 'react';
import type { DiagramData } from '@/types/components';

interface SequenceDiagramProps {
  data: DiagramData;
  onLoad?: () => void;
}

const SequenceDiagram: React.FC<SequenceDiagramProps> = ({ data, onLoad }) => {
  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  const actors = data.nodes || [];
  const interactions = data.edges || [];

  return (
    <div className="sequence-diagram p-6 bg-white rounded-lg shadow-md">
      <svg
        viewBox="0 0 800 600"
        className="w-full h-auto"
        role="img"
        aria-label="Sequence diagram"
      >
        {/* Render actors */}
        {actors.map((actor, index) => {
          const x = 100 + index * 200;
          return (
            <g key={actor.id}>
              {/* Actor box */}
              <rect
                x={x - 50}
                y="20"
                width="100"
                height="40"
                rx="4"
                fill="#10b981"
                stroke="#059669"
                strokeWidth="2"
              />
              <text
                x={x}
                y="45"
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="500"
              >
                {actor.label}
              </text>
              {/* Lifeline */}
              <line
                x1={x}
                y1="60"
                x2={x}
                y2="550"
                stroke="#d1d5db"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </g>
          );
        })}

        {/* Render interactions */}
        {interactions.map((interaction, index) => {
          const sourceIndex = actors.findIndex(a => a.id === interaction.source);
          const targetIndex = actors.findIndex(a => a.id === interaction.target);
          
          if (sourceIndex === -1 || targetIndex === -1) return null;
          
          const x1 = 100 + sourceIndex * 200;
          const x2 = 100 + targetIndex * 200;
          const y = 100 + index * 60;
          
          return (
            <g key={interaction.id}>
              <defs>
                <marker
                  id={`arrow-${interaction.id}`}
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
                </marker>
              </defs>
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke="#3b82f6"
                strokeWidth="2"
                markerEnd={`url(#arrow-${interaction.id})`}
              />
              {interaction.label && (
                <text
                  x={(x1 + x2) / 2}
                  y={y - 10}
                  textAnchor="middle"
                  fill="#1f2937"
                  fontSize="12"
                >
                  {interaction.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SequenceDiagram;
