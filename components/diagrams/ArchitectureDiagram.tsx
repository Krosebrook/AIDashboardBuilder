/**
 * Architecture Diagram Component
 */

import React, { useEffect } from 'react';
import type { DiagramData } from '@/types/components';

interface ArchitectureDiagramProps {
  data: DiagramData;
  onLoad?: () => void;
}

const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ data, onLoad }) => {
  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  const components = data.nodes || [];
  const connections = data.edges || [];

  return (
    <div className="architecture-diagram p-6 bg-white rounded-lg shadow-md">
      <svg
        viewBox="0 0 1000 700"
        className="w-full h-auto"
        role="img"
        aria-label="Architecture diagram"
      >
        {/* Background layers */}
        <rect x="50" y="50" width="900" height="150" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" rx="8" />
        <text x="500" y="35" textAnchor="middle" fill="#1e40af" fontSize="16" fontWeight="600">
          Frontend Layer
        </text>
        
        <rect x="50" y="250" width="900" height="150" fill="#f0fdf4" stroke="#10b981" strokeWidth="2" rx="8" />
        <text x="500" y="235" textAnchor="middle" fill="#047857" fontSize="16" fontWeight="600">
          API Layer
        </text>
        
        <rect x="50" y="450" width="900" height="150" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" rx="8" />
        <text x="500" y="435" textAnchor="middle" fill="#b45309" fontSize="16" fontWeight="600">
          Data Layer
        </text>

        {/* Render components */}
        {components.map((component, index) => {
          const layer = component.type || 'frontend';
          const yBase = layer === 'frontend' ? 80 : layer === 'api' ? 280 : 480;
          const x = 100 + (index % 4) * 220;
          const y = yBase + Math.floor(index / 4) * 80;

          return (
            <g key={component.id}>
              <rect
                x={component.position?.x || x}
                y={component.position?.y || y}
                width="180"
                height="60"
                rx="6"
                fill="white"
                stroke="#6b7280"
                strokeWidth="2"
                className="drop-shadow-md"
              />
              <text
                x={(component.position?.x || x) + 90}
                y={(component.position?.y || y) + 35}
                textAnchor="middle"
                fill="#111827"
                fontSize="13"
                fontWeight="500"
              >
                {component.label}
              </text>
            </g>
          );
        })}

        {/* Render connections */}
        {connections.map((connection) => {
          const source = components.find(c => c.id === connection.source);
          const target = components.find(c => c.id === connection.target);
          
          if (!source || !target) return null;
          
          const sourceIndex = components.indexOf(source);
          const targetIndex = components.indexOf(target);
          
          const sourceLayer = source.type || 'frontend';
          const targetLayer = target.type || 'api';
          
          const y1Base = sourceLayer === 'frontend' ? 80 : sourceLayer === 'api' ? 280 : 480;
          const y2Base = targetLayer === 'frontend' ? 80 : targetLayer === 'api' ? 280 : 480;
          
          const x1 = (source.position?.x || 100 + (sourceIndex % 4) * 220) + 90;
          const y1 = (source.position?.y || y1Base) + 60;
          const x2 = (target.position?.x || 100 + (targetIndex % 4) * 220) + 90;
          const y2 = target.position?.y || y2Base;
          
          return (
            <g key={connection.id}>
              <defs>
                <marker
                  id={`arch-arrow-${connection.id}`}
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                >
                  <polygon points="0 0, 8 4, 0 8" fill="#9ca3af" />
                </marker>
              </defs>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9ca3af"
                strokeWidth="2"
                markerEnd={`url(#arch-arrow-${connection.id})`}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default ArchitectureDiagram;
