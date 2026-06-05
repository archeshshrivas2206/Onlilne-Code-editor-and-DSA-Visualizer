import React from 'react';

export default function LinkedListVisualizer({ linkedList, playback }) {
  const currentStep = playback.currentStep;
  const isRunning = playback.steps.length > 0;

  return (
    <div className="stage" style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '15px',
      position: 'relative',
      flexWrap: 'wrap',
      padding: '20px',
      height: '100%'
    }}>
      {linkedList.map((value, index) => {
        let boxBg = 'linear-gradient(135deg, #6f42c1, #5a32a3)';
        let boxShadow = '0 2px 8px rgba(111, 66, 193, 0.3)';
        let transform = 'none';

        const stepIndex = isRunning && currentStep ? currentStep.index : undefined;
        const stepState = isRunning && currentStep ? currentStep.state : undefined;

        if (stepIndex !== undefined && index === stepIndex) {
          transform = 'scale(1.2)';
          if (stepState === 'checking' || stepState === 'visiting') {
            boxBg = 'linear-gradient(135deg, #fbbf24, #d97706)';
            boxShadow = '0 0 20px rgba(251, 191, 36, 0.6)';
          } else if (stepState === 'found') {
            boxBg = 'linear-gradient(135deg, #10b981, #059669)';
            boxShadow = '0 0 20px rgba(16, 185, 129, 0.6)';
          } else if (stepState === 'not_found') {
            boxBg = 'linear-gradient(135deg, #f43f5e, #be123c)';
            boxShadow = '0 0 20px rgba(244, 63, 94, 0.6)';
          } else {
            boxBg = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
            boxShadow = '0 0 20px rgba(59, 130, 246, 0.6)';
          }
        } else if (stepIndex !== undefined && index < stepIndex) {
          // Visited nodes in search/traverse
          boxBg = 'linear-gradient(135deg, #6366f1, #4f46e5)';
          boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
        }

        return (
          <div className="ll-node-container" key={index} style={{ transform }}>
            <div
              className="ll-node-box"
              style={{
                background: boxBg,
                boxShadow: boxShadow,
              }}
            >
              {value}
            </div>

            {index !== linkedList.length - 1 && (
              <span className="ll-arrow">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
