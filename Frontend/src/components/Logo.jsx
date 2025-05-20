
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = '', size = 'lg' }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-10',
    lg: 'h-16'
  };

  return (
    <Link to="/" className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <img 
          src="/src/img/Logo.png" 
          alt="Ires Logo" 
          className={`${sizeClasses[size]} w-auto`}
        />
      </div>
      <span className="font-bold text-2xl text-gradient"> Iris</span>
    </Link>
  );
};

export default Logo;
