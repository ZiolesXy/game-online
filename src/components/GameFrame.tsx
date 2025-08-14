import React from "react";

const GameFrame: React.FC<{ title: string; src: string }> = ({ title, src }) => (
  <div className="w-full">
    <iframe src={src} title={title} className="w-full h-[600px]" />
  </div>
);

export default GameFrame;
