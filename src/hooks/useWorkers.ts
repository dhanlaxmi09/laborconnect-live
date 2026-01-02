import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { demoWorkers, Worker } from '@/lib/demoWorkers';
import { useToast } from '@/hooks/use-toast';

export function useWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [noResults, setNoResults] = useState(false);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const { toast } = useToast();

  // Fetch workers from Firestore on mount
  useEffect(() => {
    const fetchWorkers = async () => {
      setInitialLoading(true);
      try {
        const profilesRef = collection(db, 'profiles');
        const snapshot = await getDocs(profilesRef);
        
        if (snapshot.empty) {
          console.log('No profiles in Firestore, using demo data');
          setWorkers(demoWorkers);
          setFilteredWorkers(demoWorkers);
          setUsingDemoData(true);
        } else {
          const firestoreWorkers: Worker[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || 'Unknown',
              skill: data.skill || 'General Labor',
              phone: data.phone || '',
              available: data.available ?? true,
              lat: data.lat || data.latitude || 17.6599,
              lng: data.lng || data.longitude || 75.9064,
            };
          });
          console.log(`Loaded ${firestoreWorkers.length} workers from Firestore`);
          setWorkers(firestoreWorkers);
          setFilteredWorkers(firestoreWorkers);
          setUsingDemoData(false);
        }
      } catch (error) {
        console.error('Error fetching from Firestore:', error);
        toast({
          title: "Using Demo Data",
          description: "Could not connect to database. Showing demo workers.",
          variant: "default",
        });
        setWorkers(demoWorkers);
        setFilteredWorkers(demoWorkers);
        setUsingDemoData(true);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchWorkers();
  }, [toast]);

  const searchWorkers = useCallback(async (queryText: string) => {
    setSearchQuery(queryText);
    setNoResults(false);
    
    // Show all workers if search is empty
    if (!queryText.trim()) {
      setFilteredWorkers(workers);
      return;
    }

    setLoading(true);
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY") {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are a skill extractor for a labor hiring app in India. 
                  
Given this user search query: "${queryText}"

Extract the matching skill types from this list ONLY:
- Plumber (water pipes, taps, bathroom, toilet, drainage)
- Electrician (wiring, lights, fans, switches, power)
- Carpenter (wood, furniture, doors, cabinets)
- Painter (walls, house painting, whitewash)
- Mason (bricks, cement, construction, tiles)
- AC Repair (air conditioner, cooling, AC service)
- Welder (metal, iron, gates, grills)

Rules:
1. Return ONLY the exact skill names that match, separated by commas
2. If user says "I need a plumber", return "Plumber"
3. If user says "fix my AC", return "AC Repair"
4. If user mentions multiple skills, return all matching ones
5. If no skills match, return "NONE"

Return only the skill names, nothing else.`
                }]
              }]
            })
          }
        );
        
        const data = await response.json();
        const skillsText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        
        console.log('Gemini extracted skills:', skillsText);
        
        if (skillsText.toUpperCase() === 'NONE') {
          setFilteredWorkers([]);
          setNoResults(true);
        } else {
          const matchedSkills = skillsText.split(',').map((s: string) => s.trim().toLowerCase());
          const filtered = workers.filter(w => 
            matchedSkills.some((skill: string) => 
              w.skill.toLowerCase().includes(skill) || skill.includes(w.skill.toLowerCase())
            )
          );
          
          if (filtered.length === 0) {
            setNoResults(true);
          }
          setFilteredWorkers(filtered);
        }
      } catch (error) {
        console.error('Gemini API error:', error);
        toast({
          title: "Search Error",
          description: "AI search failed. Using basic search.",
          variant: "destructive",
        });
        simpleSearch(queryText);
      }
    } else {
      // Fallback: simple keyword matching
      simpleSearch(queryText);
    }
    
    setLoading(false);
  }, [workers, toast]);

  const simpleSearch = (queryText: string) => {
    const lowerQuery = queryText.toLowerCase();
    const filtered = workers.filter(w => 
      w.skill.toLowerCase().includes(lowerQuery) ||
      w.name.toLowerCase().includes(lowerQuery)
    );
    
    if (filtered.length === 0) {
      setNoResults(true);
    }
    setFilteredWorkers(filtered);
  };

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setFilteredWorkers(workers);
    setNoResults(false);
  }, [workers]);

  const refreshWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const profilesRef = collection(db, 'profiles');
      const snapshot = await getDocs(profilesRef);
      
      if (!snapshot.empty) {
        const firestoreWorkers: Worker[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unknown',
            skill: data.skill || 'General Labor',
            phone: data.phone || '',
            available: data.available ?? true,
            lat: data.lat || data.latitude || 17.6599,
            lng: data.lng || data.longitude || 75.9064,
          };
        });
        setWorkers(firestoreWorkers);
        setFilteredWorkers(firestoreWorkers);
        setUsingDemoData(false);
        toast({
          title: "Refreshed",
          description: `Loaded ${firestoreWorkers.length} workers from database.`,
        });
      }
    } catch (error) {
      console.error('Error refreshing workers:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { 
    workers: filteredWorkers, 
    allWorkers: workers, 
    loading: loading || initialLoading,
    initialLoading,
    searchWorkers,
    clearSearch,
    searchQuery,
    noResults,
    usingDemoData,
    refreshWorkers
  };
}
