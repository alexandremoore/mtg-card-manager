import React from 'react';

const Scrollable = ({ header, children }) => (
  <div
    style={{
      position: 'relative',
      height: '100%',
      overflowY: 'auto'
    }}>
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 2
      }}>
      {header}
    </div>
    {children}
  </div>
);

export default Scrollable;
