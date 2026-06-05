import React from 'react';

export default function StackVisualizer({ stack, newIndex, poppingIndex }) {
  return (
    <div className="stage" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div className="stack-holder">
        {stack.map((value, index) => {
          const isNew = index === newIndex;
          const isPopping = index === poppingIndex;

          let className = "stack-box";
          if (isNew) className += " animate-push";
          if (isPopping) className += " animate-pop";

          return (
            <div className={className} key={index}>
              {value}
            </div>
          );
        })}
      </div>
    </div>
  );
}
