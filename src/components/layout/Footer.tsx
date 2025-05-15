
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t py-4">
      <div className="container text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Connectify. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
