import React, { useRef, useEffect, useState } from 'react';

export default function SortingVisualizer({ playback, arrayInput }) {
  const currentStep = playback.currentStep;
  const isRunning = playback.steps.length > 0;

  // Use the array from the current playback step if running, else use the raw user inputs
  const currentArray = isRunning && currentStep ? (currentStep.array || []) : arrayInput;
  const maxValue = currentArray.length > 0 ? Math.max(...currentArray, 1) : 1;

  // Determine which indices are being swapped or compared in the current step
  const swapIndices = isRunning && currentStep && currentStep.swap
    ? (Array.isArray(currentStep.swap) ? currentStep.swap : [currentStep.swap])
    : [];
  const compareIndices = isRunning && currentStep && currentStep.compare
    ? currentStep.compare
    : [];

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

  // Calculate bar width to determine swap translateX offset
  const containerRef = useRef(null);

  return (
    <div className="stage" style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
      {renderVariables()}
      <div className="sorting-container" ref={containerRef}>
        {currentArray.map((val, idx) => {
          const isSwap = swapIndices.includes(idx);
          const isCompare = compareIndices.includes(idx);

          let barBg = 'linear-gradient(to top, var(--primary), var(--secondary))';
          let boxShadow = '0 2px 10px rgba(139, 92, 246, 0.25)';
          let transform = 'none';
          let extraClass = '';

          if (isSwap && swapIndices.length === 2) {
            // Two-index swap: animate the bars crossing
            barBg = 'linear-gradient(to top, #f43f5e, #be123c)';
            boxShadow = '0 0 18px rgba(244, 63, 94, 0.55)';
            extraClass = 'bar-swapping';

            // Calculate pixel offset for the swap motion
            const otherIdx = swapIndices[0] === idx ? swapIndices[1] : swapIndices[0];
            const gap = 8; // matches CSS gap
            const barCount = currentArray.length;
            const containerWidth = containerRef.current ? containerRef.current.clientWidth : 600;
            const maxBarWidth = 45;
            const barWidth = Math.min(maxBarWidth, (containerWidth - gap * (barCount - 1)) / barCount);
            const distance = (otherIdx - idx) * (barWidth + gap);
            transform = `translateX(${distance}px) translateY(-6px)`;
          } else if (isSwap) {
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
              className={`bar ${extraClass}`}
              key={idx}
              style={{
                height: `${Math.max(hPct, 15)}%`,
                background: barBg,
                boxShadow: boxShadow,
                transform: transform,
                transition: 'height 0.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s, box-shadow 0.15s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: isSwap ? 5 : 1
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
