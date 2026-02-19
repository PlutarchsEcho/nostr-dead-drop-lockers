import { Link, useLocation } from 'react-router-dom';
import { LoginArea } from '@/components/auth/LoginArea';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Map, Settings, MessageSquare, Home, Package, Shield, Cpu } from 'lucide-react';

export default function TopNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold tracking-tight">
            DeadDropstr
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Button
              asChild
              variant={isActive('/') ? 'secondary' : 'ghost'}
              size="sm"
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
            </Button>
            <Button
              asChild
              variant={isActive('/marketplace') ? 'secondary' : 'ghost'}
              size="sm"
            >
              <Link to="/marketplace">
                <Map className="h-4 w-4 mr-1" />
                Marketplace
              </Link>
            </Button>
            <Button
              asChild
              variant={isActive('/my-lockers') ? 'secondary' : 'ghost'}
              size="sm"
            >
              <Link to="/my-lockers">
                <Package className="h-4 w-4 mr-1" />
                My Lockers
              </Link>
            </Button>
            <Button
              asChild
              variant={isActive('/proxy-drops') ? 'secondary' : 'ghost'}
              size="sm"
            >
              <Link to="/proxy-drops">
                <Shield className="h-4 w-4 mr-1" />
                Proxy Drops
              </Link>
            </Button>
            <Button
              asChild
              variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
              size="sm"
            >
              <Link to="/dashboard">
                <Settings className="h-4 w-4 mr-1" />
                Host
              </Link>
            </Button>
            <Button
              asChild
              variant={isActive('/hardware') ? 'secondary' : 'ghost'}
              size="sm"
            >
              <Link to="/hardware">
                <Cpu className="h-4 w-4 mr-1" />
                Hardware
              </Link>
            </Button>
            <Button
              asChild
              variant={isActive('/messages') ? 'secondary' : 'ghost'}
              size="sm"
            >
              <Link to="/messages">
                <MessageSquare className="h-4 w-4 mr-1" />
                Messages
              </Link>
            </Button>
          </div>
        </div>
        <LoginArea className="max-w-60" />
      </div>
    </nav>
  );
}
