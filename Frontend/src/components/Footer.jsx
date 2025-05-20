
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-ires-darkPurple/90 border-t border-ires-purple/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Logo size="sm" />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Transforming diabetic retinopathy care through advanced AI technology for medical professionals.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-sm text-muted-foreground hover:text-ires-brightPurple">Features</Link></li>
                <li><Link to="/" className="text-sm text-muted-foreground hover:text-ires-brightPurple">Use Cases</Link></li>
                <li><Link to="/" className="text-sm text-muted-foreground hover:text-ires-brightPurple">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-sm text-muted-foreground hover:text-ires-brightPurple">Documentation</Link></li>
                <li><Link to="/" className="text-sm text-muted-foreground hover:text-ires-brightPurple">Research</Link></li>
                <li><Link to="/" className="text-sm text-muted-foreground hover:text-ires-brightPurple">Case Studies</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-sm text-muted-foreground hover:text-ires-brightPurple">About</Link></li>
                <li><Link to="/" className="text-sm text-muted-foreground hover:text-ires-brightPurple">Contact</Link></li>
                <li><Link to="/" className="text-sm text-muted-foreground hover:text-ires-brightPurple">Legal</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-ires-purple/20">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Ires. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
