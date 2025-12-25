import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  backTo?: string;
  className?: string;
}

export function AppHeader({ title, showBack = false, backTo = '/', className = '' }: AppHeaderProps) {
  return (
    <header className={`p-4 ${className}`}>
      <div className="flex items-center gap-3">
        {showBack && (
          <Link to={backTo}>
            <Button variant="secondary" size="icon" className="rounded-full shadow-md">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        )}
        
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="LaborConnect" className="w-10 h-10 object-contain" />
          {title ? (
            <h1 className="text-xl font-bold">{title}</h1>
          ) : (
            <span className="text-xl font-bold">LaborConnect</span>
          )}
        </Link>
      </div>
    </header>
  );
}
