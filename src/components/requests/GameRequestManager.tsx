import React, { useState } from 'react';
import { GameRequestUpload } from './GameRequestUpload';
import { GameRequestList } from './GameRequestList';

export const GameRequestManager: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRequestCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <GameRequestUpload onRequestCreated={handleRequestCreated} />
      <GameRequestList refreshTrigger={refreshTrigger} />
    </div>
  );
};
