import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, X, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WorkerMap } from '@/components/WorkerMap';
import { SearchBar } from '@/components/SearchBar';
import { useWorkers } from '@/hooks/useWorkers';
import { Worker } from '@/lib/demoWorkers';
import { AppHeader } from '@/components/AppHeader';

const HireLabor = () => {
  const { workers, loading, initialLoading, searchWorkers, clearSearch, searchQuery, noResults, usingDemoData, refreshWorkers } = useWorkers();
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  if (initialLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="animate-spin">
          <Database className="w-12 h-12 text-primary" />
        </div>
        <p className="text-muted-foreground">Loading workers from database...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm">
        <AppHeader title="Find Workers" showBack backTo="/" />
        <div className="px-4 pb-4">
          <SearchBar onSearch={searchWorkers} loading={loading} />
        
          {/* Legend & Search Info */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-available" />
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-busy" />
              <span className="text-muted-foreground">Busy</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {usingDemoData && (
                <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                  Demo Data
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshWorkers}
                disabled={loading}
                className="h-7 px-2"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-7 px-2 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
                {workers.length} workers found
              </span>
            </div>
          </div>

          {/* No Results Message */}
          {noResults && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-destructive">No workers found for this skill in Solapur.</span>
            </div>
          )}
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

      {/* Results List (shows when search is active) */}
      {searchQuery && workers.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 max-h-48 overflow-y-auto bg-background/95 backdrop-blur-sm border-t">
          <div className="p-3">
            <h3 className="text-sm font-semibold mb-2">Matching Workers</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {workers.map((worker) => (
                <Card 
                  key={worker.id}
                  onClick={() => setSelectedWorker(worker)}
                  className={`flex-shrink-0 p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedWorker?.id === worker.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${worker.available ? 'bg-available' : 'bg-busy'}`} />
                    <div>
                      <p className="font-medium text-sm">{worker.name}</p>
                      <p className="text-xs text-muted-foreground">{worker.skill}</p>
                    </div>
                    <a 
                      href={`tel:${worker.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="ml-2 p-2 rounded-full bg-available text-white hover:bg-available/90"
                    >
                      <Phone className="w-3 h-3" />
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HireLabor;
