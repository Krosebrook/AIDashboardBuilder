/**
 * Flowchart Diagram Component
 */

import React, { useEffect } from 'react';
import type { DiagramData } from '@/types/components';

interface FlowchartDiagramProps {
  data: DiagramData;
  onLoad?: () => void;
}

const FlowchartDiagram: React.FC<FlowchartDiagramProps> = ({ data, onLoad }) => {
  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  return (
    <div className="flowchart-diagram p-6 bg-white rounded-lg shadow-md">
      <svg
        viewBox="0 0 800 600"
        className="w-full h-auto"
        role="img"
        aria-label="Flowchart diagram"
      >
        {/* Render nodes */}
        {data.nodes?.map((node, index) => (
          <g key={node.id}>
            <rect
              x={node.position?.x || index * 150 + 50}
              y={node.position?.y || 50}
              width="120"
              height="60"
              rx="8"
              fill="#3b82f6"
              stroke="#1e40af"
              strokeWidth="2"
            />
            <text
              x={(node.position?.x || index * 150 + 50) + 60}
              y={(node.position?.y || 50) + 35}
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontWeight="500"
            >
              {node.label}
            </text>
          </g>
        ))}
        
        {/* Render edges */}
        {data.edges?.map((edge) => {
          const sourceNode = data.nodes?.find(n => n.id === edge.source);
          const targetNode = data.nodes?.find(n => n.id === edge.target);
          
          if (!sourceNode || !targetNode) return null;
          
          const sourceIndex = data.nodes?.indexOf(sourceNode) || 0;
          const targetIndex = data.nodes?.indexOf(targetNode) || 0;
          
          const x1 = (sourceNode.position?.x || sourceIndex * 150 + 50) + 120;
          const y1 = (sourceNode.position?.y || 50) + 30;
          const x2 = targetNode.position?.x || targetIndex * 150 + 50;
          const y2 = (targetNode.position?.y || 50) + 30;
          
          return (
            <g key={edge.id}>
              <defs>
                <marker
                  id={`arrowhead-${edge.id}`}
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#6b7280" />
                </marker>
              </defs>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#6b7280"
                strokeWidth="2"
                markerEnd={`url(#arrowhead-${edge.id})`}
              />
              {edge.label && (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 10}
                  textAnchor="middle"
                  fill="#374151"
                  fontSize="12"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default FlowchartDiagram;
