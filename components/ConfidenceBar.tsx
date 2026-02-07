// Confidence Bar Component - Displays analysis confidence
import React from 'react';

interface ConfidenceBarProps {
  confidence: number; // 0-100
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ confidence }) => {
  const percentage = Math.round(confidence);

  // Color based on confidence level
  const getColor = () => {
    if (percentage >= 80) return 'bg-[#00c853]'; // green
    if (percentage >= 60) return 'bg-[#f5a623]'; // amber
    return 'bg-[#ee0000]'; // red
  };

  return (
    <div className="border-b border-[#262626] px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#a1a1a1] text-sm">Confidence</span>
        <span className="text-[#ededed] font-mono text-sm">{percentage}%</span>
      </div>

      <div className="h-2 bg-[#111] rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
