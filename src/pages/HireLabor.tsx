import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkerMap } from '@/components/WorkerMap';
import { SearchBar } from '@/components/SearchBar';
import { useWorkers } from '@/hooks/useWorkers';
import { Worker } from '@/lib/demoWorkers';

const HireLabor = () => {
  const { workers, loading, searchWorkers } = useWorkers();
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/">
            <Button variant="secondary" size="icon" className="rounded-full shadow-md">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Find Workers</h1>
        </div>
        
        <SearchBar onSearch={searchWorkers} loading={loading} />
        
        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 px-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-available" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-busy" />
            <span className="text-muted-foreground">Busy</span>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            {workers.length} workers found
          </div>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 pt-36">
        <WorkerMap 
          workers={workers} 
          selectedWorker={selectedWorker}
          onSelectWorker={setSelectedWorker}
        />
      </div>
    </div>
  );
};

export default HireLabor;
