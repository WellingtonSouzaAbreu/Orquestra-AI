'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface ResizableChatContainerProps {
  content: ReactNode;
  chat: ReactNode;
  defaultHeight?: number; // percentage
}

export default function ResizableChatContainer({
  content,
  chat,
  defaultHeight = 30,
}: ResizableChatContainerProps) {
  const [chatHeight, setChatHeight] = useState(defaultHeight);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRect.height;
      const mouseY = e.clientY - containerRect.top;

      // Calculate new height as percentage
      const newHeightPercent = ((containerHeight - mouseY) / containerHeight) * 100;

      // Clamp between 15% and 70%
      const clampedHeight = Math.max(15, Math.min(70, newHeightPercent));
      setChatHeight(clampedHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const contentHeight = 100 - chatHeight;

  return (
    <div ref={containerRef} className="flex flex-col h-screen">
      {/* Content Area */}
      <div
        className="overflow-y-auto"
        style={{ height: `${contentHeight}%` }}
      >
        {content}
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`
          relative h-1 bg-gray-300 hover:bg-primary-500 cursor-ns-resize
          transition-colors duration-200 flex-shrink-0 group
          ${isResizing ? 'bg-primary-500' : ''}
        `}
      >
        {/* Visual indicator */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
          <div className="w-12 h-1 bg-gray-400 rounded-full group-hover:bg-primary-600 transition-colors" />
        </div>
      </div>

      {/* Chat Area */}
      <div
        className="flex flex-col bg-white border-t border-gray-200"
        style={{ height: `${chatHeight}%` }}
      >
        {chat}
      </div>
    </div>
  );
}
