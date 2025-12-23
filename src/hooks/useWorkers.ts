import { useState, useCallback } from 'react';
import { demoWorkers, Worker } from '@/lib/demoWorkers';
import { useToast } from '@/hooks/use-toast';

export function useWorkers() {
  const [workers] = useState<Worker[]>(demoWorkers);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>(demoWorkers);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [noResults, setNoResults] = useState(false);
  const { toast } = useToast();

  const searchWorkers = useCallback(async (query: string) => {
    setSearchQuery(query);
    setNoResults(false);
    
    // Show all workers if search is empty
    if (!query.trim()) {
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
                  
Given this user search query: "${query}"

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
        simpleSearch(query);
      }
    } else {
      // Fallback: simple keyword matching
      simpleSearch(query);
    }
    
    setLoading(false);
  }, [workers, toast]);

  const simpleSearch = (query: string) => {
    const lowerQuery = query.toLowerCase();
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

  return { 
    workers: filteredWorkers, 
    allWorkers: workers, 
    loading, 
    searchWorkers,
    clearSearch,
    searchQuery,
    noResults
  };
}
