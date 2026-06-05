import React, { useRef, useState, useEffect } from 'react';

export default function TreeVisualizer({ tree, playback }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width || 600);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const nodes = [];
  const lines = [];

  const traverse = (node, x, y, offset) => {
    if (!node) return;
    nodes.push({ value: node.value, x, y });

    if (node.left) {
      const childX = x - offset;
      const childY = y + 80;
      lines.push({ x1: x + 25, y1: y + 25, x2: childX + 25, y2: childY + 25 });
      traverse(node.left, childX, childY, offset / 2);
    }

    if (node.right) {
      const childX = x + offset;
      const childY = y + 80;
      lines.push({ x1: x + 25, y1: y + 25, x2: childX + 25, y2: childY + 25 });
      traverse(node.right, childX, childY, offset / 2);
    }
  };

  if (tree) {
    traverse(tree, width / 2 - 25, 20, width / 4);
  }

  const currentStep = playback.currentStep;
  const isRunning = playback.steps.length > 0;
  const highlightValue = isRunning && currentStep ? currentStep.value : undefined;

  return (
    <div
      ref={containerRef}
      className="stage"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '350px',
        overflow: 'auto'
      }}
    >
      {tree && (
        <>
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {lines.map((line, idx) => (
              <line
                key={idx}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="rgba(148, 163, 184, 0.4)"
                strokeWidth="2"
              />
            ))}
          </svg>

          {nodes.map((node, idx) => {
            const isHighlighted = highlightValue !== undefined && node.value === highlightValue;

            let background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            let boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)';
            let transform = 'none';

            if (isHighlighted) {
              background = 'linear-gradient(135deg, #f43f5e, #be123c)';
              boxShadow = '0 0 20px rgba(244, 63, 94, 0.6)';
              transform = 'scale(1.2)';
            }

            return (
              <div
                className="tree-node-circle"
                key={idx}
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  background,
                  boxShadow,
                  transform,
                  transition: 'background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease'
                }}
              >
                {node.value}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
