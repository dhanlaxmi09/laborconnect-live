import { Link } from 'react-router-dom';
import { Users, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
const Index = () => {
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">LaborConnect</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="text-center max-w-md mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Find Workers
            <span className="text-primary"> Nearby</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Connect with skilled laborers in Solapur instantly. 
            Plumbers, electricians, carpenters and more.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-4">
          <Link to="/hire" className="block">
            <Button size="lg" className="w-full h-20 text-lg gap-3 rounded-2xl shadow-lg hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Hire Labor</div>
                <div className="text-sm opacity-80">Find workers near you</div>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Link to="/labor" className="block">
            <Button variant="secondary" size="lg" className="w-full h-20 text-lg gap-3 rounded-2xl shadow-lg hover:shadow-xl transition-all group border-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-foreground">I am a Labor</div>
                <div className="text-sm text-muted-foreground">Register & get hired</div>
              </div>
              <ArrowRight className="w-5 h-5 text-foreground group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-12 flex items-center gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">100+</div>
            <div className="text-sm text-muted-foreground">Workers</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <div className="text-2xl font-bold text-primary">10+</div>
            <div className="text-sm text-muted-foreground">Skills</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        Connecting workers with opportunities in Solapur
      </footer>
    </div>;
};
export default Index;