import React from 'react';

const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card p-6 ${hover ? 'hover:-translate-y-0.5 hover:shadow-apple-lg cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
