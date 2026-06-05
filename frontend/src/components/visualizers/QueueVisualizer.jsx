import React from 'react';

export default function QueueVisualizer({ queue, newIndex, dequeueIndex }) {
  return (
    <div className="stage" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div className="queue-holder">
        {queue.map((value, index) => {
          const isNew = index === newIndex;
          const isDequeuing = index === dequeueIndex;

          let className = "queue-box";
          if (isNew) className += " animate-enqueue";
          if (isDequeuing) className += " animate-dequeue";

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
