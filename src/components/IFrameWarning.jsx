import React from 'react';
import './IFrameWarning.css';

export default function IFrameWarning({display}) {
  return (
    <div className={display ? 'iframe-warning' : 'hidden'}>
      "Warning: This page contains iframes. Hanzisize may not work properly."
    </div>
  )
}