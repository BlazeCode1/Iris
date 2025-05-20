import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/me', {
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("No session");
        const data = await res.json();
        console.log('User session:', data);
        setUser(data.user);
      })
      .catch((err) => {
        console.log("Not logged in", err);
        setUser(null);
      });
  }, []);


  const handleLogout = async () => {
    await fetch('http://localhost:3000/logout', {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-ires-darkPurple/90 backdrop-blur-md border-b border-ires-purple/20">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Logo />

        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-ires-brightPurple ${isActive ? 'text-ires-brightPurple' : 'text-foreground'}`
            }
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-ires-brightPurple ${isActive ? 'text-ires-brightPurple' : 'text-foreground'}`
            }
          >
            Upload
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-ires-brightPurple ${isActive ? 'text-ires-brightPurple' : 'text-foreground'}`
            }
          >
            Dashboard
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button

                className="bg-gradient-ires text-white border-none opacity-100 cursor-default"
              >
                Hi, {user.username.toUpperCase()}
              </Button>
              <Button
                onClick={handleLogout}
                className="bg-gradient-ires hover:bg-gradient-ires/40 text-white border-none"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="bg-gradient-ires hover:bg-gradient-ires/90 text-white text-sm px-4 py-2 rounded-md"
              >
                Login
              </NavLink>
              <Button className="bg-gradient-ires hover:bg-gradient-ires/90 border-none text-white">Get Started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
