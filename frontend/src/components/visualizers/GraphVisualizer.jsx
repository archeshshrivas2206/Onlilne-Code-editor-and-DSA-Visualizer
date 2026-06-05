import React, { useRef, useState, useEffect } from 'react';

export default function GraphVisualizer({ graph, graphNodes, playback }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 350 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width || 500,
          height: entry.contentRect.height || 350
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const radius = Math.min(centerX, centerY) - 50;

  const positions = {};
  graphNodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / graphNodes.length;
    const x = centerX + radius * Math.cos(angle) - 25;
    const y = centerY + radius * Math.sin(angle) - 25;
    positions[node] = { x, y };
  });

  const currentStep = playback.currentStep;
  const isRunning = playback.steps.length > 0;
  const highlightNode = isRunning && currentStep ? currentStep.currentNode : null;
  const visitedData = isRunning && currentStep ? (currentStep.visitedSoFar || []) : [];

  return (
    <div
      ref={containerRef}
      className="stage"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '350px'
      }}
    >
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {Object.keys(graph).map((from) =>
          (graph[from] || []).map((to, edgeIdx) => {
            if (!positions[from] || !positions[to]) return null;
            return (
              <line
                key={`${from}-${to}-${edgeIdx}`}
                x1={positions[from].x + 25}
                y1={positions[from].y + 25}
                x2={positions[to].x + 25}
                y2={positions[to].y + 25}
                stroke="rgba(148, 163, 184, 0.4)"
                strokeWidth="2"
              />
            );
          })
        )}
      </svg>

      {graphNodes.map((node) => {
        const pos = positions[node];
        if (!pos) return null;

        const isCurrent = highlightNode === node;
        const isVisited = Array.isArray(visitedData)
          ? visitedData.includes(node)
          : (visitedData instanceof Set ? visitedData.has(node) : false);

        let background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        let boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
        let transform = 'none';

        if (isCurrent) {
          background = 'linear-gradient(135deg, #f43f5e, #be123c)';
          boxShadow = '0 0 20px rgba(244, 63, 94, 0.6)';
          transform = 'scale(1.2)';
        } else if (isVisited) {
          background = 'linear-gradient(135deg, #10b981, #059669)';
          boxShadow = '0 0 10px rgba(16, 185, 129, 0.4)';
        }

        return (
          <div
            className="tree-node-circle"
            key={node}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              background,
              boxShadow,
              transform,
              transition: 'background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease'
            }}
          >
            {node}
          </div>
        );
      })}
    </div>
  );
}
