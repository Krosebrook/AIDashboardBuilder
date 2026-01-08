/**
 * Mindmap Diagram Component
 */

import React, { useEffect } from 'react';
import type { DiagramData } from '@/types/components';

interface MindmapDiagramProps {
  data: DiagramData;
  onLoad?: () => void;
}

const MindmapDiagram: React.FC<MindmapDiagramProps> = ({ data, onLoad }) => {
  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  const nodes = data.nodes || [];
  const centerNode = nodes[0];
  const childNodes = nodes.slice(1);

  return (
    <div className="mindmap-diagram p-6 bg-white rounded-lg shadow-md">
      <svg
        viewBox="0 0 800 600"
        className="w-full h-auto"
        role="img"
        aria-label="Mindmap diagram"
      >
        {/* Center node */}
        {centerNode && (
          <g>
            <ellipse
              cx="400"
              cy="300"
              rx="100"
              ry="50"
              fill="#8b5cf6"
              stroke="#6d28d9"
              strokeWidth="3"
            />
            <text
              x="400"
              y="310"
              textAnchor="middle"
              fill="white"
              fontSize="16"
              fontWeight="600"
            >
              {centerNode.label}
            </text>
          </g>
        )}

        {/* Child nodes arranged in a circle */}
        {childNodes.map((node, index) => {
          const angle = (index / childNodes.length) * 2 * Math.PI;
          const radius = 200;
          const x = 400 + radius * Math.cos(angle);
          const y = 300 + radius * Math.sin(angle);

          const colors = [
            { fill: '#3b82f6', stroke: '#1e40af' },
            { fill: '#10b981', stroke: '#059669' },
            { fill: '#f59e0b', stroke: '#d97706' },
            { fill: '#ef4444', stroke: '#dc2626' },
            { fill: '#8b5cf6', stroke: '#7c3aed' },
            { fill: '#ec4899', stroke: '#db2777' },
          ];
          
          const color = colors[index % colors.length];

          return (
            <g key={node.id}>
              {/* Connection line */}
              <line
                x1="400"
                y1="300"
                x2={x}
                y2={y}
                stroke="#d1d5db"
                strokeWidth="2"
              />
              
              {/* Node */}
              <ellipse
                cx={x}
                cy={y}
                rx="80"
                ry="40"
                fill={color.fill}
                stroke={color.stroke}
                strokeWidth="2"
              />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="13"
                fontWeight="500"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default MindmapDiagram;
