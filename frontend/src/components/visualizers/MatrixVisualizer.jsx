import React from 'react';

export default function MatrixVisualizer({ matrix, playback }) {
  const currentStep = playback.currentStep;
  const isRunning = playback.steps.length > 0;

  const currentMatrix = isRunning && currentStep ? (currentStep.matrixSnapshot || []) : matrix;

  if (!currentMatrix || currentMatrix.length === 0) return null;

  const rows = currentMatrix.length;
  const cols = currentMatrix[0].length;

  const maxDim = Math.max(rows, cols);
  const cellSize = maxDim <= 3 ? 75 : (maxDim === 4 ? 60 : (maxDim <= 6 ? 45 : 38));
  const valFontSize = maxDim <= 3 ? '1.2rem' : (maxDim === 4 ? '1.0rem' : (maxDim <= 6 ? '0.85rem' : '0.75rem'));
  const coordFontSize = maxDim <= 3 ? '0.6rem' : (maxDim === 4 ? '0.55rem' : '0.45rem');
  const gapSize = maxDim <= 4 ? '8px' : '4px';

  return (
    <div
      className="stage"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '25px',
        height: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255, 255, 255, 0.015)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.2)',
          gap: gapSize
        }}
      >
        {/* Column indices header row */}
        <div style={{ display: 'flex', gap: gapSize, alignItems: 'center' }}>
          <div style={{ width: '40px', height: `${cellSize}px` }} />
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              style={{
                width: `${cellSize}px`,
                display: 'flex',
                justifyContent: 'center',
                fontSize: maxDim <= 5 ? '0.85rem' : '0.7rem',
                fontWeight: 'bold',
                color: 'rgba(255, 255, 255, 0.35)'
              }}
            >
              c={c}
            </div>
          ))}
        </div>

        {/* Rows with row labels and cells */}
        {currentMatrix.map((rowArr, r) => (
          <div key={r} style={{ display: 'flex', gap: gapSize, alignItems: 'center' }}>
            <div
              style={{
                width: '40px',
                display: 'flex',
                justifyContent: 'flex-end',
                paddingRight: '8px',
                fontSize: maxDim <= 5 ? '0.85rem' : '0.7rem',
                fontWeight: 'bold',
                color: 'rgba(255, 255, 255, 0.35)'
              }}
            >
              r={r}
            </div>

            {rowArr.map((cellVal, c) => {
              const cellKey = `${r}_${c}`;
              const highlightState = isRunning && currentStep && currentStep.highlights
                ? currentStep.highlights[cellKey]
                : null;

              let cellBg = 'rgba(255, 255, 255, 0.05)';
              let border = '1px solid rgba(255, 255, 255, 0.08)';
              let boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
              let scale = '1';
              let color = 'var(--text-primary)';
              let zIndex = '1';

              if (highlightState === 'checking') {
                cellBg = 'linear-gradient(135deg, #fbbf24, #d97706)';
                boxShadow = '0 0 15px rgba(251, 191, 36, 0.4)';
                scale = '1.08';
                border = '1px solid rgba(251, 191, 36, 0.6)';
                zIndex = '10';
                color = 'white';
              } else if (highlightState === 'swapped') {
                cellBg = 'linear-gradient(135deg, #10b981, #059669)';
                boxShadow = '0 0 15px rgba(16, 185, 129, 0.4)';
                scale = '1.08';
                border = '1px solid rgba(16, 185, 129, 0.6)';
                zIndex = '10';
                color = 'white';
              }

              return (
                <div
                  className="matrix-cell-box"
                  key={c}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    borderRadius: maxDim <= 5 ? '8px' : '4px',
                    background: cellBg,
                    border,
                    boxShadow,
                    transform: `scale(${scale})`,
                    color,
                    zIndex,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cellSize >= 45 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: '6px',
                        fontSize: coordFontSize,
                        color: highlightState ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      [{r},{c}]
                    </span>
                  )}
                  <span style={{ fontSize: valFontSize, fontWeight: 'bold' }}>
                    {cellVal}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
