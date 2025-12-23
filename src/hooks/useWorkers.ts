import { useState, useEffect } from 'react';
import { demoWorkers, Worker } from '@/lib/demoWorkers';

export function useWorkers() {
  const [workers, setWorkers] = useState<Worker[]>(demoWorkers);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>(demoWorkers);
  const [loading, setLoading] = useState(false);

  const searchWorkers = async (query: string) => {
    if (!query.trim()) {
      setFilteredWorkers(workers);
      return;
    }

    setLoading(true);
    
    // PLACEHOLDER: This would use Gemini 1.5 Flash API
    // For demo, we'll do simple keyword matching
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
                  text: `Given this search query: "${query}", return only the skill types that match from this list: Plumber, Electrician, Carpenter, Painter, Mason, AC Repair, Welder. Return just the matching skills separated by commas, nothing else. If no match, return "all".`
                }]
              }]
            })
          }
        );
        
        const data = await response.json();
        const skills = data.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase() || '';
        
        if (skills.includes('all')) {
          setFilteredWorkers(workers);
        } else {
          const matchedSkills = skills.split(',').map((s: string) => s.trim().toLowerCase());
          const filtered = workers.filter(w => 
            matchedSkills.some((skill: string) => w.skill.toLowerCase().includes(skill))
          );
          setFilteredWorkers(filtered.length > 0 ? filtered : workers);
        }
      } catch (error) {
        console.error('Gemini API error:', error);
        // Fallback to simple search
        simpleSearch(query);
      }
    } else {
      // Fallback: simple keyword matching
      simpleSearch(query);
    }
    
    setLoading(false);
  };

  const simpleSearch = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const filtered = workers.filter(w => 
      w.skill.toLowerCase().includes(lowerQuery) ||
      w.name.toLowerCase().includes(lowerQuery)
    );
    setFilteredWorkers(filtered.length > 0 ? filtered : workers);
  };

  return { workers: filteredWorkers, allWorkers: workers, loading, searchWorkers };
}
