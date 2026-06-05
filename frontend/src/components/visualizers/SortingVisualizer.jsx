import React from 'react';

export default function SortingVisualizer({ playback, arrayInput }) {
  const currentStep = playback.currentStep;
  const isRunning = playback.steps.length > 0;

  // Use the array from the current playback step if running, else use the raw user inputs
  const currentArray = isRunning && currentStep ? (currentStep.array || []) : arrayInput;

  const maxValue = currentArray.length > 0 ? Math.max(...currentArray, 1) : 1;

  // Render variables from the execution trace
  const renderVariables = () => {
    if (!currentStep || !currentStep.variables) return null;
    const entries = Object.entries(currentStep.variables);
    if (entries.length === 0) return null;

    return (
      <div className="variable-watch-panel">
        {entries.map(([name, value]) => {
          if (name === 'arr' || typeof value === 'object') return null;
          return (
            <div className="var-pill" key={name}>
              <span className="var-name">{name}</span>
              <span className="var-val">{String(value)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="stage" style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
      {renderVariables()}
      <div className="sorting-container">
        {currentArray.map((val, idx) => {
          // Check if this bar is highlighted as swap or compare in the current step
          const isSwap = isRunning && currentStep && currentStep.swap === idx;
          const isCompare = isRunning && currentStep && currentStep.compare && currentStep.compare.includes(idx);

          let barBg = 'linear-gradient(to top, var(--primary), var(--secondary))';
          let boxShadow = '0 2px 10px rgba(139, 92, 246, 0.25)';
          let transform = 'none';

          if (isSwap) {
            barBg = 'linear-gradient(to top, #f43f5e, #be123c)';
            boxShadow = '0 0 15px rgba(244, 63, 94, 0.6)';
            transform = 'translateY(-4px)';
          } else if (isCompare) {
            barBg = 'linear-gradient(to top, #fbbf24, #d97706)';
            boxShadow = '0 0 12px rgba(251, 191, 36, 0.5)';
          }

          // Compute height percentage
          const hPct = (val / maxValue) * 100;

          return (
            <div
              className="bar"
              key={idx}
              style={{
                height: `${Math.max(hPct, 15)}%`,
                background: barBg,
                boxShadow: boxShadow,
                transform: transform,
                transition: 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s'
              }}
            >
              {val}
            </div>
          );
        })}
      </div>
    </div>
  );
}
