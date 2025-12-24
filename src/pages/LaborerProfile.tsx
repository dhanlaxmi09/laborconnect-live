import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
const skills = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'Painter',
  'Mason',
  'AC Repair',
  'Welder',
  'Cleaner',
  'Driver',
  'Other'
];

const LaborerProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skill, setSkill] = useState('');
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saved, setSaved] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const isDemo = location.state?.isDemo;

  // Check authentication and load existing profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setPhone(currentUser.phoneNumber || '');
        
        // Load existing profile if it exists
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', currentUser.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            setName(data.name || '');
            setSkill(data.skill || '');
            setAvailable(data.available ?? true);
            if (data.lat && data.lng) {
              setCoords({ lat: data.lat, lng: data.lng });
              setGpsStatus('success');
            }
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
        setLoadingProfile(false);
      } else if (!isDemo) {
        // Redirect to auth if not logged in and not in demo mode
        navigate('/labor');
      } else {
        setLoadingProfile(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, isDemo]);

  useEffect(() => {
    // Request GPS location on mount if not already set
    if (gpsStatus === 'idle') {
      getLocation();
    }
  }, [gpsStatus]);

  const getLocation = () => {
    setGpsStatus('loading');
    
    if (!navigator.geolocation) {
      setGpsStatus('error');
      toast({
        title: "GPS Not Available",
        description: "Your browser doesn't support location services",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGpsStatus('success');
        toast({
          title: "Location Found",
          description: "Your location has been detected",
        });
      },
      (error) => {
        console.error('GPS error:', error);
        setGpsStatus('error');
        toast({
          title: "Location Error",
          description: "Please enable location access in your browser",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !skill) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and select a skill",
        variant: "destructive",
      });
      return;
    }

    if (!coords) {
      toast({
        title: "Location Required",
        description: "Please enable location access to be visible on the map",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isDemo) {
        // Demo mode - just simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else if (user) {
        // Save to Firestore
        const profileData = {
          name,
          phone: phone || user.phoneNumber || '',
          skill,
          available,
          lat: coords.lat,
          lng: coords.lng,
          updatedAt: serverTimestamp(),
        };

        // Check if profile exists to preserve createdAt
        const profileRef = doc(db, 'profiles', user.uid);
        const existingProfile = await getDoc(profileRef);
        
        if (!existingProfile.exists()) {
          // New profile - add createdAt
          await setDoc(profileRef, {
            ...profileData,
            createdAt: serverTimestamp(),
          });
        } else {
          // Update existing profile
          await setDoc(profileRef, profileData, { merge: true });
        }
      }
      
      setSaved(true);
      toast({
        title: "Profile Saved!",
        description: available 
          ? "You're now visible to employers on the map" 
          : "Your profile is saved but you're marked as busy",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/labor">
          <Button variant="secondary" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Your Profile</h1>
      </div>

      <div className="max-w-sm mx-auto">
        {isDemo && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-6 text-sm text-center">
            🎭 Demo Mode - Firebase not configured
          </div>
        )}

        <Card className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Phone (read-only, from auth) */}
            {phone && (
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={phone} disabled className="bg-muted" />
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Skill */}
            <div className="space-y-2">
              <Label htmlFor="skill">Your Skill</Label>
              <Select value={skill} onValueChange={setSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your main skill" />
                </SelectTrigger>
                <SelectContent>
                  {skills.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <Label htmlFor="available" className="text-base font-medium">
                  {available ? 'Available for Work' : 'Currently Busy'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {available ? 'Employers can see you' : 'Hidden from search'}
                </p>
              </div>
              <Switch
                id="available"
                checked={available}
                onCheckedChange={setAvailable}
              />
            </div>

            {/* GPS Status */}
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className={`w-5 h-5 ${gpsStatus === 'success' ? 'text-available' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium">
                    {gpsStatus === 'loading' && 'Finding location...'}
                    {gpsStatus === 'success' && 'Location detected'}
                    {gpsStatus === 'error' && 'Location not found'}
                    {gpsStatus === 'idle' && 'Enable location'}
                  </p>
                  {coords && (
                    <p className="text-xs text-muted-foreground">
                      {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
              {gpsStatus === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
              {gpsStatus === 'success' && <CheckCircle className="w-5 h-5 text-available" />}
              {(gpsStatus === 'error' || gpsStatus === 'idle') && (
                <Button type="button" variant="outline" size="sm" onClick={getLocation}>
                  Retry
                </Button>
              )}
            </div>

            {/* Save Button */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={loading || !name || !skill}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Profile Saved
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </form>
        </Card>

        {saved && (
          <div className="mt-6 p-4 bg-available/10 border border-available/20 rounded-lg text-center animate-fade-in">
            <CheckCircle className="w-8 h-8 text-available mx-auto mb-2" />
            <p className="font-medium">You're all set!</p>
            <p className="text-sm text-muted-foreground">
              {available 
                ? 'Employers can now find you on the map' 
                : 'Update your status when you\'re ready for work'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaborerProfile;
