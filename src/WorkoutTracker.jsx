import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, TrendingUp, Dumbbell, Calendar, Menu, ChevronRight, Save, Plus, X, Edit2, BarChart3, Clock, Target, Heart, User, Mountain, Zap, Layout, Footprints, ArrowUp, ArrowDown, Move } from 'lucide-react';

const WorkoutTracker = () => {
  // Google Drive Configuration
  const GOOGLE_CLIENT_ID = '1032172807789-dgk74040rk2c8a3njf2nlon2r6r5647n.apps.googleusercontent.com';
  const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
  const SCOPES = 'https://www.googleapis.com/auth/drive.file';

  const [activeTab, setActiveTab] = useState('dashboard');
  const [gDriveConnected, setGDriveConnected] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Push');
  const [workoutData, setWorkoutData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  
  const [exercises, setExercises] = useState({
    'hammer-curl': {
      id: 'hammer-curl',
      name: 'Hammer Curl',
      bodyPart: 'Biceps',
      lastWeight: 20,
      lastReps: 12,
      history: [
        { date: '2024-01-15', sets: [{ weight: 17.5, reps: 12 }, { weight: 17.5, reps: 10 }, { weight: 15, reps: 12 }] },
        { date: '2024-01-20', sets: [{ weight: 20, reps: 10 }, { weight: 20, reps: 8 }, { weight: 17.5, reps: 10 }] },
        { date: '2024-01-25', sets: [{ weight: 20, reps: 12 }, { weight: 20, reps: 10 }, { weight: 20, reps: 9 }] }
      ]
    },
    'bench-press': {
      id: 'bench-press',
      name: 'Bench Press',
      bodyPart: 'Chest',
      lastWeight: 80,
      lastReps: 8,
      history: [
        { date: '2024-01-14', sets: [{ weight: 75, reps: 8 }, { weight: 75, reps: 7 }, { weight: 70, reps: 8 }] },
        { date: '2024-01-19', sets: [{ weight: 80, reps: 6 }, { weight: 80, reps: 5 }, { weight: 75, reps: 8 }] },
        { date: '2024-01-24', sets: [{ weight: 80, reps: 8 }, { weight: 80, reps: 7 }, { weight: 80, reps: 6 }] }
      ]
    },
    'deadlift': {
      id: 'deadlift',
      name: 'Deadlift',
      bodyPart: 'Back',
      lastWeight: 120,
      lastReps: 5,
      history: [
        { date: '2024-01-16', sets: [{ weight: 110, reps: 5 }, { weight: 110, reps: 5 }, { weight: 110, reps: 4 }] },
        { date: '2024-01-21', sets: [{ weight: 115, reps: 5 }, { weight: 115, reps: 5 }, { weight: 115, reps: 4 }] },
        { date: '2024-01-26', sets: [{ weight: 120, reps: 5 }, { weight: 120, reps: 4 }, { weight: 115, reps: 5 }] }
      ]
    },
    'squat': {
      id: 'squat',
      name: 'Squat',
      bodyPart: 'Legs',
      lastWeight: 100,
      lastReps: 8,
      history: [
        { date: '2024-01-17', sets: [{ weight: 90, reps: 8 }, { weight: 90, reps: 8 }, { weight: 90, reps: 7 }] },
        { date: '2024-01-22', sets: [{ weight: 95, reps: 8 }, { weight: 95, reps: 7 }, { weight: 95, reps: 6 }] },
        { date: '2024-01-27', sets: [{ weight: 100, reps: 8 }, { weight: 100, reps: 7 }, { weight: 100, reps: 6 }] }
      ]
    },
    'lat-pulldown': {
      id: 'lat-pulldown',
      name: 'Lat Pulldown',
      bodyPart: 'Back',
      lastWeight: 65,
      lastReps: 10,
      history: [
        { date: '2024-01-15', sets: [{ weight: 60, reps: 10 }, { weight: 60, reps: 9 }, { weight: 60, reps: 8 }] },
        { date: '2024-01-20', sets: [{ weight: 62.5, reps: 10 }, { weight: 62.5, reps: 9 }, { weight: 60, reps: 10 }] },
        { date: '2024-01-25', sets: [{ weight: 65, reps: 10 }, { weight: 65, reps: 9 }, { weight: 62.5, reps: 10 }] }
      ]
    },
    'shoulder-press': {
      id: 'shoulder-press',
      name: 'Shoulder Press',
      bodyPart: 'Shoulders',
      lastWeight: 50,
      lastReps: 10,
      history: [
        { date: '2024-01-14', sets: [{ weight: 45, reps: 10 }, { weight: 45, reps: 9 }, { weight: 42.5, reps: 10 }] },
        { date: '2024-01-19', sets: [{ weight: 47.5, reps: 10 }, { weight: 47.5, reps: 9 }, { weight: 45, reps: 10 }] },
        { date: '2024-01-24', sets: [{ weight: 50, reps: 10 }, { weight: 50, reps: 9 }, { weight: 47.5, reps: 10 }] }
      ]
    },
    'plank': {
      id: 'plank',
      name: 'Plank',
      bodyPart: 'Abs',
      lastWeight: 0,
      lastReps: 60,
      history: [
        { date: '2024-01-15', sets: [{ weight: 0, reps: 45 }, { weight: 0, reps: 40 }, { weight: 0, reps: 35 }] },
        { date: '2024-01-20', sets: [{ weight: 0, reps: 50 }, { weight: 0, reps: 45 }, { weight: 0, reps: 40 }] },
        { date: '2024-01-25', sets: [{ weight: 0, reps: 60 }, { weight: 0, reps: 55 }, { weight: 0, reps: 50 }] }
      ]
    }
  });

  const [programs, setPrograms] = useState({
    Push: ['bench-press', 'shoulder-press', 'hammer-curl'],
    Pull: ['deadlift', 'lat-pulldown', 'hammer-curl'],
    Legs: ['squat', 'plank'],
    Upper: ['bench-press', 'lat-pulldown', 'shoulder-press', 'hammer-curl'],
    Lower: ['squat', 'deadlift', 'plank'],
    Custom: [] // Empty custom workout
  });

  const [workoutHistory, setWorkoutHistory] = useState([
    { date: '2024-01-15', type: 'Pull', exercisesCompleted: 3 },
    { date: '2024-01-16', type: 'Legs', exercisesCompleted: 1 },
    { date: '2024-01-19', type: 'Push', exercisesCompleted: 2 },
    { date: '2024-01-20', type: 'Pull', exercisesCompleted: 3 },
    { date: '2024-01-21', type: 'Lower', exercisesCompleted: 2 },
    { date: '2024-01-24', type: 'Push', exercisesCompleted: 2 },
    { date: '2024-01-25', type: 'Pull', exercisesCompleted: 3 },
    { date: '2024-01-26', type: 'Lower', exercisesCompleted: 2 },
    { date: '2024-01-27', type: 'Legs', exercisesCompleted: 1 }
  ]);

  const [currentWorkout, setCurrentWorkout] = useState({});
  const [tempExercise, setTempExercise] = useState({ name: '', bodyPart: 'Chest', weight: 0, reps: 0 });

  // Load Google API on component mount
  useEffect(() => {
    const loadGoogleAPIs = () => {
      console.log('🔄 Loading Google APIs...');
      
      // Load GAPI for Drive API
      if (window.gapi) {
        window.gapi.load('client', async () => {
          try {
            console.log('📦 Initializing gapi client...');
            await window.gapi.client.init({
              apiKey: '', // Not needed for OAuth
              discoveryDocs: DISCOVERY_DOCS,
            });
            console.log('✅ GAPI client initialized');
            setGapiLoaded(true);
          } catch (error) {
            console.error('❌ Error initializing gapi client:', error);
          }
        });
      }
      
      // Wait for Google Identity Services to load
      const checkGIS = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(checkGIS);
          console.log('📦 Initializing Google Identity Services...');
          
          try {
            const client = window.google.accounts.oauth2.initTokenClient({
              client_id: GOOGLE_CLIENT_ID,
              scope: SCOPES,
              callback: (response) => {
                console.log('🔐 Token response received');
                if (response.error) {
                  console.error('❌ Token error:', response);
                  alert('Sign in failed: ' + response.error);
                  setIsLoading(false);
                  return;
                }
                if (response.access_token) {
                  console.log('✅ Access token received');
                  setAccessToken(response.access_token);
                  setGDriveConnected(true);
                  setIsLoading(false);
                  loadFromGoogleDrive(response.access_token);
                }
              },
            });
            setTokenClient(client);
            setGisLoaded(true);
            console.log('✅ Google Identity Services initialized');
          } catch (error) {
            console.error('❌ Error initializing GIS:', error);
          }
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkGIS);
        if (!window.google || !window.google.accounts) {
          console.error('❌ Google Identity Services failed to load');
        }
      }, 10000);
    };
    
    // Wait a bit for scripts to load
    setTimeout(loadGoogleAPIs, 500);
  }, []);

  // Save to localStorage as backup
  useEffect(() => {
    localStorage.setItem('workout-data', JSON.stringify({
      exercises,
      programs,
      currentWorkout
    }));
  }, [exercises, programs, currentWorkout]);

  // Load from localStorage on mount (if not connected to Drive)
  useEffect(() => {
    const savedData = localStorage.getItem('workout-data');
    if (savedData && !gDriveConnected) {
      try {
        const data = JSON.parse(savedData);
        if (data.exercises) setExercises(data.exercises);
        if (data.programs && Object.keys(data.programs).length > 0) {
          // Only update programs if there's saved data
          setPrograms(data.programs);
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
  }, []);

  // Google Drive Sign In (NEW METHOD)
  const connectGoogleDrive = async () => {
    console.log('🔐 Sign in button clicked');
    console.log('gapiLoaded:', gapiLoaded, 'gisLoaded:', gisLoaded);
    
    if (!gapiLoaded || !gisLoaded || !tokenClient) {
      alert('Google services are still loading. Please wait a few seconds and try again.\n\nIf this persists, refresh the page.');
      return;
    }

    setIsLoading(true);
    console.log('🔓 Requesting access token...');
    
    try {
      // This triggers the OAuth popup
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      console.error('❌ Error requesting token:', error);
      alert('Failed to open sign-in popup. Check if pop-ups are blocked.');
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOutGoogleDrive = () => {
    if (accessToken) {
      // Revoke the token
      window.google.accounts.oauth2.revoke(accessToken, () => {
        console.log('Token revoked');
      });
      
      setAccessToken(null);
      setGDriveConnected(false);
      
      console.log('✅ Signed out from Google Drive');
    }
  };

  // Save to Google Drive (in visible "Movement App" folder)
  const saveToGoogleDrive = async () => {
    if (!gDriveConnected || !accessToken) return;

    const data = {
      exercises,
      programs,
      currentWorkout,
      lastUpdated: new Date().toISOString()
    };

    const fileContent = JSON.stringify(data, null, 2);
    const fileName = 'movement-workout-data.json';
    const folderName = 'Movement App';

    try {
      console.log('💾 Saving to Google Drive...');
      
      // First, find or create the "Movement App" folder
      const folderSearch = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const folderResults = await folderSearch.json();
      let folderId;

      if (folderResults.files && folderResults.files.length > 0) {
        // Folder exists
        folderId = folderResults.files[0].id;
        console.log('📁 Found existing folder:', folderId);
      } else {
        // Create folder
        console.log('📁 Creating new folder...');
        const folderMetadata = {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        };

        const createFolderResponse = await fetch(
          'https://www.googleapis.com/drive/v3/files',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(folderMetadata)
          }
        );

        const newFolder = await createFolderResponse.json();
        folderId = newFolder.id;
        console.log('✅ Created folder:', folderId);
      }

      // Now check if file exists in the folder
      const fileSearch = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and '${folderId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const fileResults = await fileSearch.json();
      const fileId = fileResults.files && fileResults.files.length > 0 ? fileResults.files[0].id : null;

      if (fileId) {
        // Update existing file
        console.log('📝 Updating existing file...');
        await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: fileContent
          }
        );
        console.log('✅ File updated!');
      } else {
        // Create new file
        console.log('📄 Creating new file...');
        const metadata = {
          name: fileName,
          parents: [folderId]
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([fileContent], { type: 'application/json' }));

        await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            body: form
          }
        );
        console.log('✅ File created!');
      }
      
      console.log('✅ Successfully saved to Google Drive!');
    } catch (error) {
      console.error('❌ Error saving to Google Drive:', error);
    }
  };

    // Load from Google Drive
  const loadFromGoogleDrive = async (token = accessToken) => {
    if (!token) return;

    const fileName = 'movement-workout-data.json';
    const folderName = 'Movement App';

    try {
      console.log('📥 Loading from Google Drive...');
      
      // Find the "Movement App" folder
      const folderSearch = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const folderResults = await folderSearch.json();
      
      if (!folderResults.files || folderResults.files.length === 0) {
        console.log('ℹ️ No folder found yet');
        return;
      }

      const folderId = folderResults.files[0].id;
      console.log('📁 Found folder:', folderId);

      // Find the file in the folder
      const fileSearch = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and '${folderId}' in parents and trashed=false&fields=files(id)`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const fileResults = await fileSearch.json();
      
      if (fileResults.files && fileResults.files.length > 0) {
        const fileId = fileResults.files[0].id;
        console.log('📄 Found file:', fileId);
        
        // Download file content
        const contentResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await contentResponse.json();
        
        if (data.exercises) setExercises(data.exercises);
        if (data.programs) setPrograms(data.programs);
        if (data.currentWorkout) setCurrentWorkout(data.currentWorkout);
        
        console.log('✅ Data loaded from Google Drive!');
      } else {
        console.log('ℹ️ No file found yet');
      }
    } catch (error) {
      console.error('❌ Error loading from Google Drive:', error);
    }
  };

    // Auto-save to Google Drive when data changes
  useEffect(() => {
    if (gDriveConnected && accessToken) {
      const timeoutId = setTimeout(() => {
        saveToGoogleDrive();
      }, 2000); // Save 2 seconds after last change

      return () => clearTimeout(timeoutId);
    }
  }, [exercises, programs, currentWorkout, gDriveConnected, accessToken]);

  const connectGoogleDrive_OLD = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setGDriveConnected(true);
      setIsLoading(false);
    }, 1500);
  };

  const getWorkoutStats = () => {
    const totalWorkouts = workoutHistory.length;
    const last30Days = workoutHistory.filter(w => {
      const date = new Date(w.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date >= thirtyDaysAgo;
    }).length;

    const byType = workoutHistory.reduce((acc, w) => {
      acc[w.type] = (acc[w.type] || 0) + 1;
      return acc;
    }, {});

    return { totalWorkouts, last30Days, byType };
  };

  const getBodyPartProgress = () => {
    const bodyParts = {};
    Object.values(exercises).forEach(exercise => {
      if (!bodyParts[exercise.bodyPart]) {
        bodyParts[exercise.bodyPart] = [];
      }
      bodyParts[exercise.bodyPart].push(exercise);
    });

    // Define the order
    const order = ['Chest', 'Back', 'Biceps', 'Shoulders', 'Legs', 'Abs'];
    
    return order.filter(bodyPart => bodyParts[bodyPart]).map(bodyPart => {
      const exs = bodyParts[bodyPart];
      const avgProgress = exs.reduce((acc, ex) => {
        if (ex.history.length >= 2) {
          // Get best set from first and last workout
          const firstBest = ex.history[0].sets.reduce((best, set) => 
            set.weight * set.reps > best.weight * best.reps ? set : best
          );
          const lastBest = ex.history[ex.history.length - 1].sets.reduce((best, set) => 
            set.weight * set.reps > best.weight * best.reps ? set : best
          );
          return acc + ((lastBest.weight - firstBest.weight) / firstBest.weight) * 100;
        }
        return acc;
      }, 0) / exs.length;

      const totalVolume = exs.reduce((acc, ex) => acc + ex.lastWeight * ex.lastReps, 0);

      return {
        bodyPart,
        avgProgress: avgProgress.toFixed(1),
        totalVolume,
        exercises: exs.length
      };
    });
  };

  const stats = getWorkoutStats();
  const bodyPartProgress = getBodyPartProgress();

  // Body part icons as base64 data URIs
  const bodyPartIcons = {
    'Legs': `data:image/png;base64,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`,
    'Chest': `data:image/png;base64,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`,
    'Abs': `data:image/png;base64,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+k/EMkv5aHDeXYOcYWGq50m3RjnryeMqnU6+bx008IERFaK4REQEREBV/wCmatparpBbYKeXfJRzTwVA2kbHmV0gHPn4ZGHIyOftBUgKnvSFW0smibvbmS5qoLl35GbT8LJI2NYc+Dkxv488c+Qq/c684Oe0p23W4zcd4bsREWdXopp9YNs7WpLFee/n5VRyU3a2fR7T927Oec97GMcbffPFLLR/q/t0EukrLd3PkE9NXupmNBG0tljLnEjGc5hbjn3PnjE3QW6c9UXW16sFkyoiLSs8IiICIiAiIgIiICIiAiIgIiIK/wDTNRUtL0gts9PFskrJp56g7id7xK6MHnx8MbBgYHH2krZa6bQtFVW3RNit1bF2qqlttPBMzcHbXtja1wyMg4IPI4XcrJZr9eS1u8tPhr0461+giIuTom71h3GCW96ftDWSCemppql7iBtLZXNa0A5znMLs8e48840Mtn+p64z13VutppWRtZb6aCmiLQcuaWCXLufO6Vw4xwB+86wWp0denBWPp+Wc1durNaRERSUcREQEREBERAREQEREBERAREQehSIixrViIiDz1REWyZQREQEREBERAREQEREBERAREQFvn0eXGCK96gtDmSGeppoaljgBtDYnOa4E5znMzccex8cZ0Mtn+mG4z0PVuipomRuZcKaemlLgctaGGXLefO6Jo5zwT+8RtZXqwWj6fhI0lunNWVdoiLLNGLWnqZoqWq6QXKeoi3yUc0E9OdxGx5lbGTx5+GR4wcjn7QFstdNrqiqrlom+26ii7tVVW2oghZuDdz3Rua0ZOAMkjk8Lrht0ZK27S55q9WO1fog5ERa1mBERAREQEREBERAREQEREBdjpm2fPWpLXZu/2Pl9ZFTd3Zu2b3hu7GRnGc4yF1yz70+Wpl16t2Vk1JJUQUz31Um0OxGY2OdG9xHgCTt+eCSAc5weeW/RSbdoe8deu8V7rMREWRagRFwr7cYLPZK+71LJHwUNNJUytjALi1jS4gAkDOB7kL7EczxBM8eKLOrtbVXDqhqWerl7kjblNA07QMMjcY2Dj7GtaM+TjnlYqiLX0r01ivZlrW6rTIiIvTyIiICIiAiIgIiICIiAiIgIiIPQpERY1qxERB56oiLZMoIiICIiAiIgIiICIiAiIgIiICyrpFW1Vv6oaanpJe3I65QwOO0HLJHCN45+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`,
    'Biceps': `data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAIAAgADASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAcIBAUGAwn/xABJEAABAwMDAwIDBAcECAUDBQABAAIDBAURBhIhBxMxCCIUQVEVMmFxFiMkN1aEtDOVsdIXQlJ1gaSz0yU0Q0bDGFOTNVVygpT/xAAaAQEAAwEBAQAAAAAAAAAAAAAABAUGAwIB/8QANBEAAgIBAgQEBQMEAgMBAAAAAAECAwQRMQUSEyEyQVFxIjNhkbEVUqEUYoHwQuEjNMHR/9oADAMBAAIRAxEAPwCmSIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCk/pz0V1RqymguVW+OzWqdgkinnbvllaQ7DmRAg4yBy4tyHAt3BSP0B6QfZXw+q9V0v/AIjxJQ0Mjf8Ay3zEkgP/AKnzDf8AU8n3fcnRVGXxHlfJV9y0xsDmXNZ9jgdLdH9AWCNu2yR3OfY5jp7licvBdnlhHbBHABDQcD8TnuqWCClpoqamhjgghYI4oo2hrWNAwGgDgADjAXoip52Tm9ZPUtYVxgtIrQIiLwegiIgCIiAIiIDldQ9OtD37ebnpm3PkkmM8k0MfYlkec5Lnx7XOzkkgkgnnyAoT176ebnR7qrR1d9pQ8fsdW5sc4+6Pa/hj+S4nOzAAA3FWWRSacu2p/CyPbi1Wruj581UE9LUy01TDJBPC8xyxSNLXMcDgtIPIIPGCvNXY6mdOdPa7oj9oQ9i5RwmOlr4874ecgEZAe3P+q75OdgtJyqo9QNA6l0RW9m80e6ndtEdbThzqeQuBO0PIGHe13tIB4zjGCb3GzYX9tn6FPkYk6e+6OVREUwiBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAFOnpa0H8fcpNY3eg3UdLhtt70ftkm3e6VvPOzGASCNzsghzOIc01Zq7UN/obJbo99VWTNiZkOIbny520EhrRlxODgAn5K9GmrNQ6esFDZLdHspaOFsTMhoLseXO2gAuccuJwMkk/NVvEsjpw5Fu/wWGBRzz53svybFERZ8uwiLHuVdQ22ikrbjWU9FSx43zVErY2NyQBlziAMkgfmV9S1GxkIuJu/Vjp3a6ltPU6qo5HuYHg0rX1LcZI5dE1zQePBOfH1Cwv9NXTL+Jf+RqP+2uqx7X3UX9mcnfUt5L7khoo8/01dMv4l/5Go/7af6aumX8S/wDI1H/bX3+mu/Y/sx/UVfuX3JDRR5/pq6ZfxL/yNR/20/01dMv4l/5Go/7af0137H9mP6ir9y+5IaLgaXrJ01qKmKnj1PG18rwxpkpZ42gk4GXOYGtH4kgD5rrbNfbJeu79jXi3XLs47vwlSyXZnON20nGcHGfoV4lVOHii0eo2Ql4WmbFERcz2Fj3KhoblRSUVxo6etpZMb4aiJsjHYIIy1wIOCAfzCyEX1PQblZeqvQi4W2Sa66MbJcKJz3vdb/8A1qZgbn2EnMoyHAD7/wB0e85Kg9fQpRR1j6OW/V0YuVgZR2q9h5MjizZDVBzsuMm0E78knfgk+Dngtt8TiLXw2/f/APSrycBP4q/sVMRZt7tVwsl2qbVdaSSkraZ+yWJ45af8CCMEEcEEEZBWErlNNaoqWtOzCIi+nwIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiLItlFVXK5Utuoou7VVUzIIWbg3c9zg1oycAZJHJ4RvQbk6+kXTMc9bdNWVVPu+GxR0T3bCA9w3SkD7wcGlgB4GJHDnnFjVptEafpdK6Tt2n6R2+OjhDHPwR3Hklz34JONzi52MkDOBwFuVlcq7rWuXkaTHq6VaiERFHO5z3UTVdDovSdVfq1ne7WGQ04kax08rjhrAT/wAScAkNa44OMKmetNW37V92fcb5XSTkvc6KAOIhpwcDbGzOGjDW/icZJJ5Uj+qXWP2zqyPTNFPuobRnvbH5bJUuHuzhxB2DDeQC1xkChtaHh+Mq6+druyjzshznyJ9kERFYkAIiIAiIgCyLbXV1trY623VlRRVUedk1PK6N7cgg4c0gjIJH5FY6I1qNiyPSrr1BXSQ2jWwjpql72RxXGJgbC724zMM+wlw+80bfdyGBuTOtLPBVU0VTTTRzwTMEkUsbg5r2kZDgRwQRzkL58qQ+lvVnUOh9lF/+p2Vu8/ASvDdjnc7mSYJZyM45acu4ydwqcrhql8VW/oWeNxBx+Gz7lx0Wi0Xq2w6vtLLjY66OcFjXSwFwE1OTkbZGZy05a78DjIJHK3qpZRcXo9y3jJSWqCIi8n05XqZoa0a7sBt1xb2qiLLqOsY3L6d5+Y+rTgbm+CAPBAIqL1C0RftDXaO33uGMiZm+CpgJdDMON21xAOWk4IIBHB8EE3kWq1Tp2y6otLrVfqCOtpC9smxxLS1w8Oa5pDmnyMgjgkeCQp2Jmyoej7xIeViRuWq7MoUi77rH01uGgbsHsMlXZKl5FJVkctPntSY4DwM8+HAZGMOa3gVoa7I2RUovsUc4ShLlluERF7PAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAU6ek3SXxl6q9Y1TP1NBmmo+fMzm+93Ds+1jsYIIPcyOWqE7ZRVVyuVLbqKLu1VVMyCFm4N3Pc4NaMnAGSRyeFenRGn6XSuk7dp+kdvjo4Qxz8Edx5Jc9+CTjc4udjJAzgcBV3Er+nXyLd/gn4FPPZzPZfk3KIizxeBcz1O1VBo3RVffJDGZ42dukifj9bO7hjcbgXDPucAc7WuI8LplWn1Zat+MvVJo6lf+poMVNZx5mc32N5bn2sdnIJB7mDy1ScSnrWqPl5nDJt6Vbl5kH1U89VUy1NTNJPPM8ySyyOLnPcTkuJPJJPOSvNEWpM2EREAREQBERAEREAREQG10tqK9aXuzbrYa+Siqwx0e9oDg5p8tc1wLXDwcEHkA+QCrVdIurdo1v2rVVM+z78Idz4D/ZTkZ3GE5JOANxaeQCcbg0uVQF6Us89LUxVNNNJBPC8SRSxuLXMcDkOBHIIPOQouTiQvXff1JOPkzpfbb0PoMir90Y64QfDUuntbTyCcPbFT3R5BaW4OO+Scgg4G/nOcuxguNgVnb6J0y5ZF7TdC6PNEIiLidTHuVDQ3KikorjR09bSyY3w1ETZGOwQRlrgQcEA/mFVTrp0on0dUvvdkjkn09M/kZLnUTieGOPksJ4a4/g13OC62a86qCCqppaaphjngmYY5YpGhzXtIwWkHggjjBUnGyZUS1W3oR8jHjdHR7nz5RSv106UT6OqX3uyRyT6emfyMlzqJxPDHHyWE8Ncfwa7nBdFC0tVsbY80digsrlXLlkERF0OYREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERATp6TdJfGXqr1jVM/U0Gaaj58zOb73cOz7WOxggg9zI5arLLlekVFS2/pfpqCki7cbrbDO4bicvkaJHnn6uc448DPHC6pZbLudtrkzR4tSrqSQREUYkGm1vqCl0rpO46gq2746OEvazJHceSGsZkA43OLW5wQM5PAVFrnW1VyuVVca2Xu1VVM+eZ+0N3Pc4uccDAGSTwOFY71dQ6hmsFrdTUu+wwTGSrlYQ4tmPtjLxty1uHOAcCQS/BAIburSr/hlSjXz+bKTiNjlZyeSCIisyvCIiAIiIAiIgCIiAIiIAiIgCmDox1luGm6mlsmpqiSssAY2GKQt3S0QBOCCBuewZwWnJAA2/d2uh9FztphbHlkjpVbKqXNFn0GpZ4KqmiqaaaOeCZgkiljcHNe0jIcCOCCOcheip50k6r3rRNTT0FTJJXaeD3d2jIBdFuIJfE48gg87Sdpy7wXbhbayXW33u0011tVXHV0VSzfFKw8OH+IIOQQeQQQcELN5OLPHffb1L/HyY3rtuZqIiikg86qCCqppaaphjngmYY5YpGhzXtIwWkHggjjBVXfUZ0z/Ry5HUun7d27HUY+JZEctpZi4/6uPZG7LceQHZHtBYFaZedVBBVU0tNUwxzwTMMcsUjQ5r2kYLSDwQRxgqTjZEqJ8y2OGRRG6OjPnyilfrp0on0dUvvdkjkn09M/kZLnUTieGOPksJ4a4/g13OC6KFparY2x5o7GfsrlXLlkERF0OYREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQF4OkVbS3Dpfpqekl7kbbbDA47SMPjaI3jn6Oa4Z8HHHC6pVE6B9SmaHu01vuokfZK97TK5pc40sg47rW+CCMBwA3ENaRnbtNt6WeCqpoqmmmjngmYJIpY3BzXtIyHAjggjnIWYzMeVNj12exosS+Nta03R6IiKISTzqoIKqmlpqmGOeCZhjlikaHNe0jBaQeCCOMFVQ66dKJ9HVL73ZI5J9PTP5GS51E4nhjj5LCeGuP4NdzgutmvOqggqqaWmqYY54JmGOWKRoc17SMFpB4II4wVJxsmVEtVt5o4ZGPG6Oj3Pnyilfrp0on0dUvvdkjkn09M/kZLnUTieGOPksJ4a4/g13OC6KFparY2x5o7GfsrlXLlkERF0OYREQBERAEWRbaGuuVbHRW6jqK2qkzshp4nSPdgEnDWgk4AJ/IKbNBenm51m2q1jXfZsPP7HSObJOfvD3P5YzkNIxvyCQdpXG6+ulazZ1qona9IogtFeC29OdB2+ijpINI2Z8cecOqKVs7zkk8vkBcfPzJwOPAS5dOdB3CikpJ9I2ZkcmMup6VsDxgg8PjAcPHyIyOPBUD9Vr18LJv6ZPTxIo+ikfrV0vn6f1NLU01ZJX2qte9sUroi10DgciN5HtJLeQRjdtf7QAo4VlXZGyKlF9iBZXKuXLLcIiL2eAu+6OdSrhoG7FjxJV2SpeDV0gPLT47seeA8DHHhwGDjDXN4FF4srjZFxkux7hOUJc0dy/tkutvvdpprraquOroqlm+KVh4cP8QQcgg8ggg4IWaqZ9HOpVw0Ddix4kq7JUvBq6QHlp8d2PPAeBjjw4DBxhrm2/sl1t97tNNdbVVx1dFUs3xSsPDh/iCDkEHkEEHBCzeViyx5fQv8AGyY3x+pmoiKISTzqoIKqmlpqmGOeCZhjlikaHNe0jBaQeCCOMFVA66dOp9E6jfU0FLINPVj/ANjl3mTtOxl0TiRkEHcW5zluOSQ7Fw1hXu1W+92mptV1pI6uiqWbJYnjhw/xBBwQRyCARghSsXJePPXy8yPk46vjp5lAkXXdVdEXDQ2qJrfUQyGgme99vqSdwmizxlwAG9oIDhgYPPgtJ5FaaE1OKlHZmelFwbi9wiIvR5CIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgClfoX1Xn0dUssl7kkn09M/g4LnUTieXtHksJ5c0fi5vOQ6KEXO2qNseWWx0rslXLmifQalngqqaKpppo54JmCSKWNwc17SMhwI4II5yF6KpnQvqvPo6pZZL3JJPp6Z/BwXOonE8vaPJYTy5o/Fzech1r6WeCqpoqmmmjngmYJIpY3BzXtIyHAjggjnIWaycaVEtHt5M0GPkRujqtz0REUY7nnVQQVVNLTVMMc8EzDHLFI0Oa9pGC0g8EEcYKqh106UT6OqX3uyRyT6emfyMlzqJxPDHHyWE8Ncfwa7nBdbNedVBBVU0tNUwxzwTMMcsUjQ5r2kYLSDwQRxgqTjZMqJarbzRwyMeN0dHufPlFK/XTpRPo6pfe7JHJPp6Z/IyXOonE8McfJYTw1x/BrucF0ULS1WxtjzR2M/ZXKuXLIIsi20Ndcq2Oit1HUVtVJnZDTxOke7AJOGtBJwAT+QU2aC9PNzrNtVrGu+zYef2Okc2Sc/eHufyxnIaRjfkEg7SvN19dK1mz7VRO16RRCdtoa65VsdFbqOoraqTOyGnidI92AScNaCTgAn8gps0F6ebnWbarWNd9mw8/sdI5sk5+8Pc/ljOQ0jG/IJB2lT7pTS2ntK0TqTT9pp6CN333MBL5MEkb3uy52NxxknAOBwtyqi/ic5dq1ov5LWnh0Y97O/4NNpTS2ntK0TqTT9pp6CN333MBL5MEkb3uy52NxxknAOBwtyiKslJyerLBJRWiCIi8n05Xq7RUtw6X6lgq4u5G22zTtG4jD42mRh4+jmtOPBxzwqPq8HV2tpbf0v1LPVy9uN1tmgadpOXyNMbBx9XOaM+BnnhUfV7wrXpy9ym4npzx9giIrUrQiIgC77o51KuGgbsWPElXZKl4NXSA8tPjux54DwMceHAYOMNc3gUXiyuNkXGS7HuE5QlzR3PoNSzwVVNFU000c8EzBJFLG4Oa9pGQ4EcEEc5C9FUzoX1Xn0dUssl7kkn09M/g4LnUTieXtHksJ5c0fi5vOQ62azOTjSolo9vI0OPkRvjqtwiIox3Oe6iaUodaaTqrDWv7Pdw+GoEbXuglacteAf+IOCCWucMjOVSvVtguGl9R1lhurY21dI8Nf237muBAc1wP0LSDzg88gHIV9VHHXTp1BrbTj6mgpYzqGjZ+xy7xH3W5y6JxIwQRuLc4w7HIBdmxwMvoy5JeF/wQc3F6seaO6KeIvSqgnpamWmqYZIJ4XmOWKRpa5jgcFpB5BB4wV5rQlEEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAUr9C+q8+jqllkvckk+npn8HBc6icTy9o8lhPLmj8XN5yHRQi521Rtjyy2Oldkq5c0T6DUs8FVTRVNNNHPBMwSRSxuDmvaRkOBHBBHOQvRVM6F9V59HVLLJe5JJ9PTP4OC51E4nl7R5LCeXNH4ubzkOtfSzwVVNFU000c8EzBJFLG4Oa9pGQ4EcEEc5CzWTjSolo9vJmgx8iN0dVueiIijHc86qCCqppaaphjngmYY5YpGhzXtIwWkHggjjBUH1Hp0tE2rKipbeaimsLsPipIm5naSHZZ3HZAa07SCQ4kEg8jc6dEXaq+yrXkempysphbpzrXQ02lNLae0rROpNP2mnoI3ffcwEvkwSRve7LnY3HGScA4HC3KIucpOT1Z0SUVogiIvJ9CIiALXajvds07ZZ7zean4Whp9vdl7bn7dzg0cNBJ5cBwPmtivOqggqqaWmqYY54JmGOWKRoc17SMFpB4II4wV9Wmvc+PXTsVA61dUJ+oFTS01NRyUFqonvdFE6UudO4nAkeB7QQ3gAZ27n+4gqOFJ/XzpqzQ92huFqMj7JXvcImuDnGlkHPac7wQRktJO4hrgc7dxjBarG6fSXT2M3kdTqPqbhERdziEREAREQBT76b+qNVHW0eh7/L3aeX9XbaqR4BhIHELiTy04wz5gkNGQRtgJFxvpjdBxkdabpVS5on0KRQ/wCnnqbBqS0waZvdZI6/0rCI5Z3gmtjGSCDxl7W8EHJIG7J922YFmLqpVTcZGiqtjbFSiERFyOhX71P9Op6iR2uLJSyTPDP/ABZjXlxDWtaGStbjwGjDsHgBpx99yrsvoNVQQVVNLTVMMc8EzDHLFI0Oa9pGC0g8EEcYKp5120F+g+rP2KPbZbhukoMzb3M2hvcjOefaXDGc5aW8k7sXnDsrmXSlutinz8blfUjt5keIiK2KwIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIApX6F9V59HVLLJe5JJ9PTP4OC51E4nl7R5LCeXNH4ubzkOihFztqjbHllsdK7JVy5on0GpZ4KqmiqaaaOeCZgkiljcHNe0jIcCOCCOcheiqZ0L6rz6OqWWS9yST6emfwcFzqJxPL2jyWE8uaPxc3nIda+lngqqaKpppo54JmCSKWNwc17SMhwI4II5yFmsnGlRLR7eTNBj5Ebo6rc9ERFGO4RFptV6p09pWibV6gu1PQRu+415JfJggHYxuXOxuGcA4ByeF6jFyeiPjaitWblabVeqdPaVom1eoLtT0Ebv7NryS+TBAOxjcudjcM4BwDk8KAte+oa51m6l0dQ/ZsPH7ZVtbJOfun2s5YzkOBzvyCCNpUJ3KurrlWyVtxrKitqpMb5qiV0j3YAAy5xJOAAPyCsqOGTl3sei/kr7uIxj2r7l/qWeCqpoqmmmjngmYJIpY3BzXtIyHAjggjnIXoqmdC+q8+jqllkvckk+npn8HBc6icTy9o8lhPLmj8XN5yHWvpZ4KqmiqaaaOeCZgkiljcHNe0jIcCOCCOchRMnGlRLR7eTJWPkRujqtz0REUY7mFe7Vb73aam1XWkjq6KpZslieOHD/EEHBBHIIBGCFTTq7oaq0JqyW37aiW2zfrKCqlaB3mYGRkcbmk7T4Ph2AHBXYXK9U9H0ut9HVNmm9tQ3M9FIZC0R1DWuDC7AOW+4gjB4JxzgibhZTono9n/upEy8ZXQ7boo+iyLnRVVtuVVbq2LtVVLM+CZm4O2va4tcMjIOCDyOFjrSp6mf2CIiAIiIAiIgM2yXW4WS7U11tVXJSVtM/fFKw8tP+BBGQQeCCQcgq5/SrW9v1zpeG4U80Yr4WMZcKYDaYZcc4aSTscQS05ORx5DgKRrsukWuarQmrIrhuqJbbN+rr6WJwHeZg4ODxuaTuHg+W5AcVCzcXrw1XiRLw8noz0ezLsIse2VtLcrbS3Gil7tLVQsnhftLdzHAOacHBGQRweVkLNtaGg3C57qJpSh1ppOqsNa/s93D4agRte6CVpy14B/4g4IJa5wyM5XQovsZOLUlufJRUloygV7tVwsl2qbVdaSSkraZ+yWJ45af8CCMEEcEEEZBWErNep/p+y5Wl2s7VTxtraFn/iDWRuL6mL2gP44zGM5JH3M5OGAKsq1GNer61Jf5M5kUumfKwiIpBwCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAKT+jnV24aHjNquEElzsj3hzYhJiSlJd7nR54IIydhwC7kFuXZjBFzsqjbHlktUe67JVy5ovuXgtvUbQdwoo6uDV1mZHJnDaiqbA8YJHLJCHDx8wMjnwUuXUbQdvopKufV1mfHHjLaeqbO85IHDIyXHz8gcDnwFR9FXfpVeviZP/AFOenhROmvfUNc6zdS6Oofs2Hj9sq2tknP3T7WcsZyHA535BBG0qE7lXV1yrZK241lRW1UmN81RK6R7sAAZc4knAAH5BY6KfTRXStIIhW3TtesmERF2OQUr9C+q8+jqllkvckk+npn8HBc6icTy9o8lhPLmj8XN5yHRQi521Rtjyy2Oldkq5c0T6DUs8FVTRVNNNHPBMwSRSxuDmvaRkOBHBBHOQvRV69LGvf/Ydzk/2pLUWw/8A8pJY3OH/ABcMj/bGfuhWFWYyKHTY4M0VFyugpIIiLgdStPqy0l8HeqTWNKzENfimrOfEzW+x3Ls+5jcYAAHbyeXKC1fHW+n6XVWk7jp+rdsjrISxr8E9t4Icx+ARna4NdjIBxg8FUSqoJ6WplpqmGSCeF5jlikaWuY4HBaQeQQeMFaHht/Ur5XuvwUefTyWcy2Z5oiKxIAREQBERAEREBPPpc6gMoak6Ju9RHHTVD3SW6WWR3tlcRmAZy0B3Lh933bh7i8YsivnqrmdC9bv1voplRXTRvu9E/sVwaGt3HyyTaCcBzfngAua/AACo+JYvK+rHz3Ljh+RzLpy/wd8iIqkswqX9bNDSaH1jJTQtza63dUUDmtfhjC45iJdnLmcA8kkFpON2BdBcb1l0l+mega21ws3V0X7TQ84/XMBw3lwHuBczLjgb8/JTMLI6NnfZ7kXMo61fbdbFJ0XpVQT0tTLTVMMkE8LzHLFI0tcxwOC0g8gg8YK81pjPBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQGRbK2qttypbjRS9qqpZmTwv2h217XBzTg5BwQODwr06I1BS6q0nbtQUjdkdZCHuZkntvBLXsyQM7XBzc4AOMjgqhysD6QL+8VN60vK6RzHMbXwNDG7WEERykn72TmLA5HtPj51vEqeevnW6J/D7uSzkezLEoiLPl4FUT1N2WC0dVKianMbWXOmjrTGyIMDHEuY7x94udGXk8ZLz+Zt2oL9YNs7um7Fee/j4Wskpu1s+93Wbt2c8Y7OMY53fLHM/h1nJel69iHnw5qW/QrSiItGUAREQBERAEREAXVdLNYVWiNY015h91O7EFbGIw4yU7nNLw3JGHe0EHI5AzxkHlUXmcVOLi9meoycWpI+g1LPBVU0VTTTRzwTMEkUsbg5r2kZDgRwQRzkL0UBelTXMctE7Qte7bND3Ki3vc5gDmE7nxAcEuBLnj7xILvAaMz6srfS6bHBmkotVsFJBERcTqVh9Uuho7Peo9X29u2lukxjq4w1jWxVG3IIxgneGvceD7muJPuAEJq+Ot9P0uqtJ3HT9W7ZHWQljX4J7bwQ5j8AjO1wa7GQDjB4Kotc6KqttyqrdWxdqqpZnwTM3B217XFrhkZBwQeRwtDw7I6lfK91+Cjz6OnPmWzMdERWJACIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgJH6K9L5+oFTVVNTWSUFqonsbLK2IudO4nJjYT7QQ3kk527me0gqzNt6c6Dt9FHSQaRsz4484dUUrZ3nJJ5fIC4+fmTgceAnSKipbf0v01BSRduN1thncNxOXyNEjzz9XOcceBnjhdUs1l5dlk2k9EjQY2NCuCbWrZyty6c6DuFFJST6RszI5MZdT0rYHjBB4fGA4ePkRkceCq3dY+kVw0PGLrb55LnZHvLXSmPElKS72tkxwQRgbxgF3BDctzbtedVBBVU0tNUwxzwTMMcsUjQ5r2kYLSDwQRxgrzj5llMtddV6Hq/Frtjtoz58opX66dKJ9HVL73ZI5J9PTP5GS51E4nhjj5LCeGuP4NdzguihaOq2NseaOxQ2VyrlyyCIi6HMIiIAiKV+hfSifWNSy93uOSDT0L+BktdWuB5Y0+QwHhzh+LW85Ledtsao80tjpXXKyXLEx+jnSK4a4jN1uE8lssjHhrZRHmSqId7mx54AAyN5yA7gB2HYsjbenOg7fRR0kGkbM+OPOHVFK2d5ySeXyAuPn5k4HHgLpqWCClpoqamhjgghYI4oo2hrWNAwGgDgADjAXos5kZll0tddF6F9Ri11R21Zyty6c6DuFFJST6RszI5MZdT0rYHjBB4fGA4ePkRkceCqzdaul8/T+ppammrJK+1Vr3tildEWugcDkRvI9pJbyCMbtr/aAFcNcr1doqW4dL9SwVcXcjbbZp2jcRh8bTIw8fRzWnHg454XrEy7K7Em9Uzzk40LIPRaNFH12XRK5/ZPVfTtV2O9vrBTbd+3HeBi3ZwfG/OPnjHHlcavSlnnpamKppppIJ4XiSKWNxa5jgchwI5BB5yFopx54uPqUMJcslL0PoMiIsgakLgfUNBPUdHL/HTwyTPDIZC1jS4hrZ43OdgfINBJPyAJXfLnupv7t9T/AO56v/ovXWl8tkX9Uc7VrXJfRlFkRFrTMBERAEREAREQBERAbHTV5rtPX+hvduk2VVHM2VmS4B2PLXbSCWuGWkZGQSPmrwaI1BS6q0nbtQUjdkdZCHuZkntvBLXsyQM7XBzc4AOMjgqhynD0q61gtd2qtJXKpjhpri8TUTnkNHxPDSzOOS9objJAywAAlyruI4/Ur51uvwT8C/knyPZ/ks0iIs8XgVevVlo7/wAprWhg+lLcdjP/AMUpw382Fzj/APaAVhVrtS2ah1DYK6yXGPfS1kLon4DSW58ObuBAc04cDg4IB+S741zpsUzjkVK2txKDIsi50VVbblVW6ti7VVSzPgmZuDtr2uLXDIyDgg8jhY61aepmtgiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIC8HSKtpbh0v01PSS9yNtthgcdpGHxtEbxz9HNcM+DjjhdUqidA+pTND3aa33USPsle9plc0ucaWQcd1rfBBGA4AbiGtIzt2m29LPBVU0VTTTRzwTMEkUsbg5r2kZDgRwQRzkLMZmPKmx67PY0WJfG2tabo9ERFEJJ51UEFVTS01TDHPBMwxyxSNDmvaRgtIPBBHGCqkdfOmrND3aG4WoyPsle9wia4OcaWQc9pzvBBGS0k7iGuBzt3G3a5Xq7RUtw6X6lgq4u5G22zTtG4jD42mRh4+jmtOPBxzwpeHkSpsWmz3I2VRG2D9UUfREWnM6EREBJ/QPpqzXF2muF1MjLJQPaJWtDmmqkPPaa7wABguIO4BzQMbtwtvSwQUtNFTU0McEELBHFFG0NaxoGA0AcAAcYC5npFRUtv6X6agpIu3G62wzuG4nL5GiR55+rnOOPAzxwuqWYzMiV1j12WxosSiNVa03YREUQkhcr1draW39L9Sz1cvbjdbZoGnaTl8jTGwcfVzmjPgZ54XTVU8FLTS1NTNHBBCwySyyODWsaBkuJPAAHOSqkdfOpTNcXaG32oSMslA9xic4uaaqQ8d1zfAAGQ0EbgHOJxu2iXh48rrFpstyNlXxqg/VkYIiyLZRVVyuVLbqKLu1VVMyCFm4N3Pc4NaMnAGSRyeFp29DO7n0CREWNNWFz3U392+p/8Ac9X/ANF66Fc91N/dvqf/AHPV/wDReulfjXuebPCyiyIi1xlgiIgCIiAIiIAiIgC9KWeelqYqmmmkgnheJIpY3FrmOByHAjkEHnIXmiAvJ0x1VBrLRVBfIzGJ5GduriZj9VO3h7cbiWjPuaCc7XNJ8rplV30paqnt+r5dKymSSkurHSRNGSIp42l27G7ADmBwJAJJbH8grRLL5dHRtcfLyNHi3dWtS8wiIopIK0+rLSXwd6pNY0rP1NfimrOfEzW+x3Ls+5jcYAAHbyeXKC1fHW+n6XVWk7jp+rdsjrISxr8E9t4Icx+ARna4NdjIBxg8FUWudFVW25VVurYu1VUsz4Jmbg7a9ri1wyMg4IPI4Wh4bf1K+R7r8FHn08lnMtmY6IisSAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBSv0L6rz6OqWWS9yST6emfwcFzqJxPL2jyWE8uaPxc3nIdFCLnbVG2PLLY6V2SrlzRPoNSzwVVNFU000c8EzBJFLG4Oa9pGQ4EcEEc5C9FUTo51duGh4zarhBJc7I94c2ISYkpSXe50eeCCMnYcAu5Bbl2bI23qNoO4UUdXBq6zMjkzhtRVNgeMEjlkhDh4+YGRz4KzmRh2Uy001XqX1GVXbHfRnVLlertbS2/pfqWerl7cbrbNA07ScvkaY2Dj6uc0Z8DPPCXLqNoO30UlXPq6zPjjxltPVNneckDhkZLj5+QOBz4CrN1q6oT9QKmlpqajkoLVRPe6KJ0pc6dxOBI8D2ghvAAzt3P9xBXrExLLLE2tEjzk5MK4PR6tkcIiLSmfCIiAvB0iraW4dL9NT0kvcjbbYYHHaRh8bRG8c/RzXDPg444XVKnnRXqhP0/qaqmqaOSvtVa9jpYmylroHA4MjAfaSW8EHG7az3ABWZtvUbQdwoo6uDV1mZHJnDaiqbA8YJHLJCHDx8wMjnwVmsvEsrm2lqmaDGyYWQSb0aOqXnVTwUtNLU1M0cEELDJLLI4NaxoGS4k8AAc5K5m5dRtB2+ikq59XWZ8ceMtp6ps7zkgcMjJcfPyBwOfAVbusfV24a4jFqt8ElssjHlzojJmSqId7XSY4AAwdgyA7kl2G484+HZdLTTRep6vyq6o76syOunVefWNS+yWSSSDT0L+TgtdWuB4e4eQwHlrT+Dnc4DYoRFo6qo1R5Y7FDZZKyXNILtuhVugunVvT1NUPkaxlSakFhAO6FjpWjkHguYAfwz48riVNHpEgndr+51LYZDBHanRvlDTta50sRa0nwCQ1xA+e0/QrxlS5KZP6HrGjzWxX1LRIiLKGlCjT1M1tLS9ILlBUS7JKyaCCnG0ne8StkI48e2N5ycDj6kKS1BfrBufa03YrN2M/FVklT3d/wB3tM27cY5z3s5zxt+eeJOHHmvivr+CPlS5aZP6FaURFqTOBERAEREAREQBERAEREBkWytqrbcqW40UvaqqWZk8L9odte1wc04OQcEDg8K9OiNQUuqtJ27UFI3ZHWQh7mZJ7bwS17MkDO1wc3OADjI4Kocp59I+p3wXa46RqJIxBVMNZS7ntae63a17WjGXFzMO88CInHJKruJUc9fOt1+Cfw+7ks5XsyyKIizxeBVZ9UujvsbVkepqKDbQ3fPe2Mw2OpaPdnDQBvGHcklzhIVaZcz1O0rBrLRVfY5BGJ5Gdyklfj9VO3ljs7SWjPtcQM7XOA8qViX9G1S8vMj5VPVra8yjaIi1BnAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCsL6Nv8A3V/J/wDzqvSsL6Nv/dX8n/8AOofEP/Xl/j8ol4Pz4/5/BYVERZk0AVYfV7W1UmtrRbny5pYLb342bR7XySPa858nIjZx4448lWeVWfVz+8i3/wC54v8ArTKw4av/ADohcQ+SyG0RFoihCIiAIiIAiIgCIiAIiIAtjpq812nr/Q3u3SbKqjmbKzJcA7HlrtpBLXDLSMjIJHzWuRfGk1oz6m09UX501eaHUNgob3bpN9LWQtlZktJbny120kBzTlpGTggj5LYqAvSLqaSeiumk6qo3fDYrKJjt5IY47ZQD90NDiwgcHMjjzzifVlcino2OBpKLerWpBERcDsVI9S+kv0d18+6UzMUN73VLOfuzAjvN5cSeXB+cAfrMD7qixXU636YZqvpxcqNscklXSsNZRiNjnuMsbSQ0NBG4uaXM+f384JAVK1pMC/q1aPddigzaenZqtmERFOIZMHQvpEzWFMzUd8nkhtEdTsZStjc11YGj3e/jazdhuW5Jw8e0gFWEpen+hqemip49IWJzImBjTJQRyOIAwMucC5x/Ekk/Nb62UVLbbbS26ii7VLSwsghZuLtrGgNaMnJOAByeVkLL5GXZbLXXRGioxoVR007nPfoLon+DtPf3ZD/lT9BdE/wdp7+7If8AKuhRcOpP1Z36cPQ579BdE/wdp7+7If8AKn6C6J/g7T392Q/5V0KJ1J+rHTh6HE3fpP07ulS2oqdK0cb2sDAKVz6ZuMk8tic1pPPkjPj6BczcvT5oOqrZKiCa80EbsYp6epaWMwAODIxzufPLjyfpwpcRdI5N0dpM5yx6pbxRWm8+m69xdr7G1LbqzOe78XC+n2+Mbdvc3Z5znGMDzniOdR9NNd6fpvibppqsZBsfI+WDbO2NrAC5zzGXBgAOcux4P0Ku4il18Tuj4u5Gnw6qXh7Hz1RXg1n090jq2Kf7Xs1Oaqbk1sLRHUBwYWtd3By7AxgOy3gZBwFDGtPTrcIJH1GkbrHVwBjnfC1ztk2Q0Ya17RtcXHd5DAOMk8lWFPEqp9pdmQbcC2HePcgZFsdQ2O76euT7de7dUUFU3J2TMxuAcW7mnw5uWnDhkHHBWuU9NNaohNNPRhERfT4EREAREQBERAEREARddpzpprvUFN8Ta9NVj4NjJGSz7YGyNeCWuYZC0PBAzlufI+oUjWb03XuXu/bOpbdR4x2vhIX1G7zndu7e3HGMZzk+Mcx7MqmvxSO8Ma2fhiQWitdbfT5oOlrY6iea818bc5p6ipaGPyCOTGxruPPDhyPpwumtHSfp3a6l1RTaVo5HuYWEVTn1LcZB4bK5zQePIGfP1Kiy4pStk2SY8Ote7SKVor0/oLon+DtPf3ZD/lT9BdE/wdp7+7If8q5/q0P2s9/pk/3FFkV6f0F0T/B2nv7sh/yp+guif4O09/dkP+VP1aH7WP0yf7iiyK5lV0b6a1FTLUSaYja+V5e4R1U8bQScnDWvDWj8AAB8lxt39OGnZaZrbRqC60k+8Fz6pkc7S3ByA1oYQc45z8jxzkdY8Tpe+qOcuHXLbRlZUUyaj9POrqHvy2aut13hZt7TNxgnlzjPtd7Bgk+X8gfU4Ucap0fqjS8jm36x1lEwPbH3nM3QucW7g1sjcsccZ4BPg/QqXXkVWeGRFnRZX4omiVhfRt/7q/k//nVelNnpCraqPW13tzJcUs9t78jNo9z45GNYc+RgSP48c8+AuWetceX++Z1wnpfEs8iIswaEKrPq5/eRb/8Ac8X/AFplaZQF6xaKqktum7iyLNLBNUQSP3D2vkDHMGPJyI38+OOfIU7h0tL19SHnx1oZXJERaQoAiIgCIiAIiIAiIgCIiAIiIDc6I1BVaV1ZbtQUjd8lHMHuZkDuMILXsyQcbmlzc4JGcjkK9NsraW5W2luNFL3aWqhZPC/aW7mOAc04OCMgjg8r5+qz3pN1NHW6Tq9MVFRmqtsxmp43bB+zyHJ249zsSbySRx3GDPIAquKUc0FYt1+Cy4ddyydb8ybERFRFyFTjr9o79EdfVHwsHbtdxzVUe1mGMyffEMNDRtd4aM4a5mfKuOow9SumH6g6cTVlNHG6rs7/AIxpLG7jEGkStDiRtG33nGc9sDBOMTcC7pWrXZ9iJm09Sp6boqIiItKZ8+hSIixpqwiLHuVdQ22ikrbjWU9FSx43zVErY2NyQBlziAMkgfmV9S1GxkIse211DcqKOtt1ZT1tLJnZNTytkY7BIOHNJBwQR+YWQjWg3CIi+AIiIAiIgNdqGx2jUNtfbr3bqevpXZOyZmdpILdzT5a7DjhwwRngqA+pnp/qopTX6Ff8RC7Jfb6mcB7SX8CJ7sAtAPh5BAb95xOBY1FIoybKX8LON2PXcviR8+aqCelqZaaphkgnheY5YpGlrmOBwWkHkEHjBXmrsdTOnOntd0R+0Iexco4THS18ed8POQCMgPbn/Vd8nOwWk5VVepXT+/aGu0tPcKeSegLwKa4MjIhmByWjPhr8NOWE5GDjIwTfY2bC/ts/QpcjEnT33RyKIimEQIizbJarhe7tTWq1UklXW1L9kUTBy4/4AAZJJ4ABJwAvjaS1Z9S17IwludKaW1DqqtdSaftNRXyN++5gAZHkEje92GtztOMkZIwOVOnTP0/0sUQr9dP+Imdgst9NOQxoLORK9uCXAnwwgAt+84HAnW20NDbaKOit1HT0VLHnZDTxNjY3JJOGtAAyST+ZVZkcThDtX3f8FhRw+Uu8+y/kr9of06vmphU6xuslO97MtpLe5pdGSGkb5HAtyPcC1oI8EOPhTHpbQWjtMSNlsmn6Omna9z2VDmmWZhLdp2yPJc0Y4wDjk/UrpkVVblW2+JlnVjVV+FBERRjuEREAREQBERAEREAREQHA6p6P6Av8bt1kjtk+xrGz23EBYA7PDAO2SeQSWk4P4DHI6H6P3fQ/VK33q03b4yxu70dQ1zu3Mxjo5NrXge2RocIuRgl2DsAGRNiKRHKtUXHXVM4Sxq3JS07oIiKOdwo89RFk+2ulF17dN36ig2VsP6zbs2H9Y7yAcRGTg5/AZwpDXnVQQVVNLTVMMc8EzDHLFI0Oa9pGC0g8EEcYK6VTdc1JeR4shzxcX5nz5RbnW+n6rSurLjp+rdvko5ixr8AdxhAcx+ATjc0tdjJIzg8haZa2MlJaozDTi9GERF9PgREQBERAEREAREQBERAF03THVU+jda0F8jMhgjf26uJmf1sDuHtxuAcce5oJxua0nwuZReZRUouL2Z6jJxaaPoNSzwVVNFU000c8EzBJFLG4Oa9pGQ4EcEEc5C9FFHpg1Oy99Pm2eWSR9bZX9l/ce55dE8udEckYAA3MDQTgRjwCApXWUurdU3B+RpqrFZBSXmERFyPZSfrLpL9DNfVtrhZtoZf2mh5z+peThvLifaQ5mXHJ2Z+a41Wq9U+lZ73oqnvlIJJJ7I98j4m5O6CTaJHYDSSWlrHZyAGh5PyVVVqMO7rVJvfzM7l09K1pbH0KREWXNEFHnqO/czfv5f8AqIlIajz1HfuZv38v/URLvjfOh7r8nLI+VL2ZThERaszJ0Ns1xrK2/Cii1TeYo6XYIYfjHuiaG42t2ElpaMAbSMY4xhdlZuvfUGg7vxVTbrrvxt+LpA3t4znb2izznnOfAxjnMWIuU6Kp+KKOsbrI7SZaLS3qH0vXyNhv1trLK9z3DutPxMLWhuQXFoD8k5GAw/I584lPTmo7DqOm+Isd3o7gwMY94glDnRh4Jbvb95hODw4A8H6FUKWRba6uttbHW26sqKKqjzsmp5XRvbkEHDmkEZBI/IqDbwuuXgehMr4jZHxrU+gSKrPT3r5qGzdmi1NF9t0Ldre9kNqo2+0Z3eJMAOOHYc4nl6sBofXWl9ZUwksdzjlnDN8tJJ7J4uG5yw8kAuA3Ny3PAJVVfiW0+JdvUsqcqu3Z9zpkRFFJAWFe7Vb73aam1XWkjq6KpZslieOHD/EEHBBHIIBGCFmovqbT1Qa17MqR1r6SVWiNt2tD6ivsLtrXySYMtM88Yk2gAtcfDgAMnaedpdFi+g1VBBVU0tNUwxzwTMMcsUjQ5r2kYLSDwQRxgqI7R0C0vQ61deZamSrtTHmSntUseWsdxgPeSTIwHOGkc+0OLgDuucbiSUNLd1/JU38PblrXs/4Ic6SdKL1rapp6+pjkodPF7u7WEgOl2kAsiaeSSeNxG0Yd5LdptNovSVh0haWW6x0McADGtlnLQZqgjJ3SPxlxy534DOAAOFvUUDJzJ3vv2XoTcfFhSu3d+oREUQkhERAEWq1HqOw6cpviL5d6O3sLHvYJ5Q10gYAXbG/eeRkcNBPI+oUWap9Q+l6CR0NhttZente0d1x+Ghc0tyS0uBfkHAwWD5nPjPavHst8EdTlZfXX4mTQiqZd+v8Ar+upmxUxtVseHhxlpaUuc4YI2nuue3HOeBngc+c8dVdQNc1FTLUSavvrXyvL3COvkjaCTk4a0hrR+AAA+Smw4Xa/E0iJLiVa2TZeRY9yrqG20UlbcaynoqWPG+aolbGxuSAMucQBkkD8yvn6i7rhP9/8f9nH9T/t/n/o+hSL56rIttdXW2tjrbdWVFFVR52TU8ro3tyCDhzSCMgkfkV8fCf7/wCP+z7+p/2/z/0fQJFSO0dTNf2updUU2rbrI9zCwiqmNS3GQeGy7mg8eQM+fqV22nPUNq6h7EV5obdd4Wbu6/aYJ5c5x7m+wYJHhnIH1OVwnwu1eFpnaHEanumi0yKI9PeoDQ9w2MubLjZ5OyHyOmg7sQfxljTHlx8nBLWggfI4ClS211DcqKOtt1ZT1tLJnZNTytkY7BIOHNJBwQR+YUKymyrxrQl12ws8L1MhERcjoEREAREQFevVlo7/AMprWhg+lLcdjP8A8Upw382Fzj/9oBV6X0CudFS3K21VurYu7S1UL4Jmbi3cxwLXDIwRkE8jlUe6iaUrtF6sqrDWv73aw+GoEbmNnicMteAf+IOCQHNcMnGVfcNyOeHTe6/BS8Qo5ZdRbM55ERWhXBERAEREAREQBERAEREAREQHZdGtW/oZr6iukz9tDL+zV3Gf1LyMu4aT7SGvw0ZOzHzV2F89Vcf086j/AEi6X2/fF25rZ/4dJhuGu7TW7COST7HMyePduwAMKn4pT2Vi9mWvDbe7rfuSGiIqUtjzqoIKqmlpqmGOeCZhjlikaHNe0jBaQeCCOMFUO1fZZ9OaouVjqDI59FUvhD3xGMyNB9r9pzgObhw5PBHJ8q+qq76tLAyg1rQ36FsbWXWmLZcPcXOlhw0uIPAGx0QGP9k8fM2nC7eWxw9f/hXcRr5q1L0LRIiKrLEKPPUd+5m/fy/9REpDUeeo79zN+/l/6iJd8b50Pdfk5ZHypezKcIiLVmZCIiAIiIAsi211dba2Ott1ZUUVVHnZNTyuje3IIOHNIIyCR+RWOiNajYsj0q69QV0kNo1sI6ape9kcVxiYGwu9uMzDPsJcPvNG33chgbkzrSzwVVNFU000c8EzBJFLG4Oa9pGQ4EcEEc5C+fKkvpF1bu+iO1aqpn2hYTNufAf7WAHO4wnIAyTuLTwSDjaXFyqMrhyfxVb+haY2e18Nn3LfosKyXW33u0011tVXHV0VSzfFKw8OH+IIOQQeQQQcELNVK009GW6evdBERfAEREARY9yrqG20UlbcaynoqWPG+aolbGxuSAMucQBkkD8yq49UOvldX/GWjR0XwdG7dF9pPLhPI3j3Rt47X+sMnLsEEbHDiRRjWXvSKON2RClayZNHULqLpfQ0cbb1VSPq5WdyKjp2b5nt3Bu7GQ1o88uIztdjJGFX7WfXzV16inpLRFT2Klk4DoSZKgNLCHN7hwBkkkFrWuGBg8EmKKqeeqqZampmknnmeZJZZHFznuJyXEnkknnJXmrujh9Va1l3ZT3Z1lnZdkelVPPVVMtTUzSTzzPMkssji5z3E5LiTySTzkrzRFPIQREQBERAEREAREQBbHT18u+nrky42S41FBVNwN8L8bgHB21w8Obloy05BxyFrkXxpNaM+ptPVE6aC9Q1zo9tLrGh+0oef2yka2OcfePuZwx/JaBjZgAk7ip90pqnT2qqJ1Xp+7U9fG377WEh8eSQN7HYc3O04yBkDI4VDlsdPXy76euTLjZLjUUFU3A3wvxuAcHbXDw5uWjLTkHHIVfkcNrs7w7P+CdRnzh2n3X8l+UUH9Kuu9vuUcNq1m6O31rWMY24f+jUvLse8AYiOC0k/c+8fYMBTgqS6idMuWaLiq6Fq1iwiIuJ0C4XrL08peoFgjhE/wALdKLe+hncTsBdjcx4H+q7a3kDIIBGeWu7pF7rnKuSlHdHmcIzi4y2PnzVQT0tTLTVMMkE8LzHLFI0tcxwOC0g8gg8YK81bPrp0og1jTPvdkjjg1DCzkZDW1rQOGOPgPA4a4/g13GC2qlyoa621slFcaOooqqPG+GoidG9uQCMtcARkEH8itNjZMb46rf0M9kY8qZaPYx0RFJI4REQBERAEREAREQBERAFMnpNvfwOvquzS1PbhudGdkXbz3ZojubzjIwwzHyAfxOFDa3Oh7z+j2sbRezJUMjo6yOWb4c4e6IOG9o5GdzdzcEgEHB4K45FfUqlE60T6dikXxREWTNMFEfqrs32h00bc2R0/ctdZHK6R494if8Aqy1hx83OjJGQCG58gKXFyvV2ipbh0v1LBVxdyNttmnaNxGHxtMjDx9HNaceDjnhd8efJbF/U5Xx565L6HVIiLgdQo89R37mb9/L/ANREpDUeeo79zN+/l/6iJd8b50Pdfk5ZHypezKcIiLVmZCIiAIiIAiIgCIuq6WaPqtb6xprND7aduJ62QSBpjp2uaHluQcu9wAGDyRnjJHmclCLk9keoxcmoomP0i2zUMNFdLnPPUQ2GfDaenewbJ5gcOlYScjaG7SQMOJxnMeBPqx7ZRUttttLbqKLtUtLCyCFm4u2saA1oyck4AHJ5WQstkXdaxz0NJRV0oKIREXA6hcz1C1vYdDWmO4XuaQmZ+yCmgAdNMeN21pIGGg5JJAHA8kA+fUzXNo0JYDcbi7u1EuW0dGx2H1Dx8h9GjI3O8AEeSQDTjWeprvq2/wA96vVR3aiX2ta3hkLBnEbB8mjJ/Ekkkkkkz8PCd75peH8kLLy1SuWO5tepXUC/a5u0tRcKiSCgDwaa3skJhhAyGnHhz8OOXkZOTjAwByKItDCEYLlitEUcpOb1k+4REXo8hERAEREAREQBERAEREAREQBERAFK/RzrHcNIyG2399ZdbIWARtD981KWtw0R7iBswANmQB5GOQ6KEXO2qFseWSOldkq5c0WX9sl1t97tNNdbVVx1dFUs3xSsPDh/iCDkEHkEEHBCzVSfpn1G1DoStH2fN37bJMJKqgkxsm4wSDgljsf6zfm1uQ4DCtvoXWentaW11bYa3vdraKiF7SyWBzhkNc0/8RkZaS12CcFZ7Kw50PXdf7uXuNlxuWmzOhREUIlBcD1j6a2/X1pD2GOkvdMwikqyOHDz2pMclhOefLScjOXNd3yL3XZKuSlF9zzOEZx5ZbFDtZ6Zu+kr/PZb1T9qoi9zXN5ZMw5xIw/NpwfxBBBAIIGmV6ddaM09rS2tor9Rd7tbjTzMcWSwOcMFzXD/AIHBy0lrcg4CqJ1K6f37Q12lp7hTyT0BeBTXBkZEMwOS0Z8NfhpywnIwcZGCdDiZsb1yvtIosrElS9V3RyKIinEMIiIAiIgCIiAIiIAiIgL66PuM940lZ7vUsjZPXUEFTK2MENDnxtcQASTjJ+ZK2q57pl+7fTH+56T/AKLF0KyE1pJpGpg9YphedVBBVU0tNUwxzwTMMcsUjQ5r2kYLSDwQRxgr0ReT0ERF8AUeeo79zN+/l/6iJSGo89R37mb9/L/1ES743zoe6/JyyPlS9mU4REWrMyEREAREQBERAFdDonoaPQ+jo6aZubpW7aivc5rMseWjEQLc5azkDkgkuIxuwIX9LmiH3fUZ1dXQxvt1re5lOHFp31WAR7SDwxrt2eCHbCM4OLRKk4nk6vpR/wAlvw+jRdR/4CIiqC0C02s9TWjSVgnvV6qO1Txe1rW8vmec4jYPm44P4AAkkAEjcqnnXTqLPrbUb6agqpDp6jf+xxbDH3XYw6VwJySTuDc4w3HAJdmXiYzvnp5LcjZWQqYa+b2OV15qe4av1RV3y4ySEzPIgic/cKeLJ2RNwAMNB84GTknklaJEWmjFRWi2M9KTk9WERF9PgREQBERAEREAREQBERAEREAREQBERAEREAW50Zqa76Sv8F6stR2qiL2ua7lkzDjMbx82nA/EEAgggEaZF8lFSWjPqbi9UXM6OdSrfr60ljxHSXumYDV0gPDh47seeSwnHHlpODnLXO75fPmlnnpamKppppIJ4XiSKWNxa5jgchwI5BB5yFaLo11podR/Baf1Kfhb4/8AVsqdrWwVThjaPPskdk+3G0kcEFwYqLMwHX8de34LnFzVP4Z7/kmRERVZYhYV7tVvvdpqbVdaSOroqlmyWJ44cP8AEEHBBHIIBGCFmovqbT1Qa17Mp51q6Xz9P6mlqaaskr7VWve2KV0Ra6BwORG8j2klvIIxu2v9oAUcK8HV2ipbh0v1LBVxdyNttmnaNxGHxtMjDx9HNaceDjnhUfWjwMiV1fxbooM2hVT+HZhERTiGEREAREQBERAEREBenpl+7fTH+56T/osXQrVaPt09n0lZ7RUvjfPQ0EFNK6MktLmRtaSCQDjI+YC2qyE3rJtGpgtIpBEReD0EREAUeeo79zN+/l/6iJSGo89R37mb9/L/ANREu+N86Huvycsj5UvZlOERFqzMhERAEREAREQF4OkVFS2/pfpqCki7cbrbDO4bicvkaJHnn6uc448DPHC6pcr0iraW4dL9NT0kvcjbbYYHHaRh8bRG8c/RzXDPg444XVLI269SWvqairTkWnoERarVt/t+l9OVl+urpG0lIwOf22bnOJIa1oH1LiBzgc8kDJXhJyeiPTaS1ZFHql1zJZ7LHpC3u21V0hMlXIHPa6Kn3YAGMA7y17Tyfa1wI9wIrCtjqW812ob/AF17uMm+qrJnSvwXENz4a3cSQ1ow0DJwAB8lrlqcWhUVqPn5mcyLndNyCIikHAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAn3on1sqo62Owa4r+7Ty7WUtylwDCQAA2Y/Npx/aHkEkuJBy2xNLPBVU0VTTTRzwTMEkUsbg5r2kZDgRwQRzkL58qT+jnV24aHjNquEElzsj3hzYhJiSlJd7nR54IIydhwC7kFuXZqczh6l8dW/oWeLnOPw2bepbtFytt6jaDuFFHVwauszI5M4bUVTYHjBI5ZIQ4ePmBkc+Cly6jaDt9FJVz6usz448ZbT1TZ3nJA4ZGS4+fkDgc+AqfpWa6cr+xa9WGmuqHV2tpbf0v1LPVy9uN1tmgadpOXyNMbBx9XOaM+BnnhUfUj9auqE/UCppaamo5KC1UT3uiidKXOncTgSPA9oIbwAM7dz/cQVHC0GBjypr+LdlHm3q2fw7IIiKcQwiIgCIiAIiIAtzoezfpDrG0WQx1D46ysjim+HGXtiLhvcODja3c7JBAAyeAtMpg9KVgfceoMt7e2QQWimc4Pa9oHdlBY1rgeSCzunjwWjJ+R45FnTqlL0OtEOpYolqkRFkzTBcz1Vngp+meppKiaOFhtVRGHPcGgudG5rW5PzLiAB8yQF0yiz1SXP4DpRPS9jufaNZDTbt+O3gmXdjHP9ljHH3s/LB7Y8ea2K+pyvly1yf0JTREXE6hR56jv3M37+X/qIlIajz1HfuZv38v8A1ES743zoe6/JyyPlS9mU4REWrMyEREAREQBERASP0V6oT9P6mqpqmjkr7VWvY6WJspa6BwODIwH2klvBBxu2s9wAVmbb1G0HcKKOrg1dZmRyZw2oqmwPGCRyyQhw8fMDI58FUfRQcjArulzbMmUZs6ly7ovBcuo2g7fRSVc+rrM+OPGW09U2d5yQOGRkuPn5A4HPgKs3WrqhP1AqaWmpqOSgtVE97oonSlzp3E4EjwPaCG8ADO3c/wBxBUcImPgV0y5t2L82dseXZBERTiGEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBW/9N+mY7B00o6ySn7dddv2ydzthJYf7IAt527MOAJJBe7xnArl0a0l+mevqK1zM3UMX7TXc4/UsIy3hwPuJazLTkb8/JXYVPxS/sql7steG093Y/YIiKlLYKsPq6vPxWsbXZGSU747fRmV2w5eyWV3LX88e2ONwGAcOzyCFZqqngpaaWpqZo4IIWGSWWRwa1jQMlxJ4AA5yVRLW+oKrVWrLjqCrbskrJi9rMg9tgAaxmQBna0NbnAJxk8lWfC6ua1z9Cv4jZy1qPqXxREVYWAUeeo79zN+/l/6iJSGo89R37mb9/L/1ES743zoe6/JyyPlS9mU4REWrMyEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREARFOnpi6d/aNbFrm6jFLSTObQU74siaUDBlJcMbWk+0t53tPI2YdyvujTBzkdaapWzUUSx0L0Q/RGimU9dDGy71r+/XFpa7afDI9wAyGt+WSA5z8EgrvkRZWybsk5S3ZpIQUIqK8giLzqp4KWmlqamaOCCFhkllkcGtY0DJcSeAAOcleT0RZ6n9TssnT51nikkZW3p/ZZse5hbEwtdKcgYII2sLSRkSHyAQqmLsusurf0z19W3SF+6hi/ZqHjH6lhOHctB9xLn4cMjfj5LjVpsKjo1JPd92Z3Lu6tja2R9CkRFmDRBR56jv3M37+X/qIlIajz1HfuZv38v/AFES743zoe6/JyyPlS9mU4REWrMyEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAERd90c6a3DX12L3mSkslM8CrqwOXHz2o88F5GOfDQcnOWtd4ssjXFyk+x7hCU5csdx0c6a3DX12L3mSkslM8CrqwOXHz2o88F5GOfDQcnOWtdcilggpaaKmpoY4IIWCOKKNoa1jQMBoA4AA4wFjWS1W+yWmmtVqpI6SipmbIomDho/xJJySTySSTklZqzeXlSyJa+S2L/GxlRHTzCIiiEkKF/VHrdlo04NI0M0jLjdGNfUFocNlLkg+4Ecvc3bjkFu8HGRmS9eant+kNL1d8uMkYELCIInP2molwdkTcAnLiPODgZJ4BVI9S3mu1Df6693GTfVVkzpX4LiG58NbuJIa0YaBk4AA+SsuHY3Unzy2X5IGfkckeRbs1yIi0BRn0KREWNNWFHnqO/czfv5f+oiUhqPPUd+5m/fy/9REu+N86Huvycsj5UvZlOERFqzMhERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREARb3Rekr9q+7Mt1joZJyXtbLOWkQ04OTukfjDRhrvxOMAE8Ky3SrorZdKSQ3W9Pju95jeyWJ+0thpXBvhjc+8hxJD3D5NIa0jJi5GXXQu+/oSKMWdz7bepGHRrotXaj+C1BqUfC2N/wCsZTbnNnqmjG0+PZG7J92dxA4ADg9WZslqt9ktNNarVSR0lFTM2RRMHDR/iSTkknkkknJKzUVBkZM73rLb0LyjHhStI7hERRjuF51U8FLTS1NTNHBBCwySyyODWsaBkuJPAAHOSlVPBS00tTUzRwQQsMkssjg1rGgZLiTwABzkqqnX7qjVapuVRpy0S9qw0sxY90bw7457XffJaSDGCMtAODw487Q2TjY0r5aLY4ZGRGmOr3Oe6y9Q6rqBf45hB8La6LeyhgcBvAdjc95H+s7a3gHAAAGeXO4VEWmrhGuKjHZGdnOU5OUtwiIvZ5PoUiIsaasKPPUd+5m/fy/9REpDUeeo79zN+/l/6iJd8b50Pdfk5ZHypezKcIiLVmZCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgC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`,
    'Shoulders': `data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAIAAgADASIAAhEBAxEB/8QAGwABAAMBAQEBAAAAAAAAAAAAAAYHCAUEAwn/xABHEAACAQMEAQIEAwQGBQoHAAAAAQIDBBEFBhIhEwcxCBQiQRUyUSM3YXEWJHWEsbMzQka0wzVSU1Zyc4KV0tMXGFWBkpSk/8QAGgEBAAMBAQEAAAAAAAAAAAAAAAQFBgMBAv/EAC4RAQACAQIFAwMEAgMBAAAAAAABAgMEEQUSITFBE1FhMnGxIjOBkUKhIzTwUv/aAAwDAQACEQMRAD8AxkAAAAAAAAAAAAAAAAAdHb2h6vuHUoadomnXF/dSw+FGGeKclHlJ+0Y5ksyeEs9s8mYiN5exEzO0OcDRu1PhxsY2Up7q1y4ndS9qemuMYU+3/r1ItzyuL/LHDyu/c6OpfDjtapZVIadrms2908cKlw6daEe1nMIxg31lfmXfffsQp4jgidt0uNBmmN9mYQTb1R9Nde2Dc05Xzp3mnXE5Rt72gnxbTeIzT/JNxXLHa98OXF4hJLpet681Z3hFvS1J5bR1AAfb5AAAAAAAAAAAAAA7OzNs6vu3X6Gi6Lb+W4q/VKUuoUYLGak39orK/i20km2k+MaW+EXb3y2gapuavRxUvaytreU6GGqVPuUoTfvGUpYaXWaX3a6j6rN6OKbR3d9Nh9XJFfCfenPpltfZVtQqWlnTu9VhBKrqNeGaspYkm4J5VNNSaxH3WFJyayTYAzF72vPNad5aKlK0jasbQhPqN6ZbX3rbV6l3Z07TVZwapajQhirGWIpOaWFUSUUsS9llRcW8mQN26BqG19x3mg6rGnG7tJqM/HPlGSaUoyT/AEcWn3h99pPKN6lBfGDo3PTdC3BTp28fFWqWdaeMVZ81zprOO4x4VPd9OfS7ZY8O1NovGO09J/0ga/T1mk5I7wzkAC+UoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABr/4ddn2u2dg2uo/n1DWqNO7uZqo5R4NOVKCWFjEZ9+75Sl20ljIB+gWmfI/htr+GfL/I+GHy3y/HxeLC4cOPXHGMY6wVXFckxStY8rLhtIm82nw9AAKJcvFrelafrek3OlaraU7uyuYcKtKa6kv8U08NNdppNYaMP782xqG0N0Xeh6jTqJ0Zt0KsocVcUsvhVjhtYkl7ZeHlPtM3aU38UuzvxnadPc1lQ5X2kZ83CGZVLaT+rOItvg8S7aUYuoyx4dqPTyck9pQddg9SnNHeGWQAaFRAAAAAAAAAAAAAAbp9NdE/o7sHRNGlbfK1rezh8xS8nPjWkuVXvLT+uUn08d9dYMgekejfj3qXoGmOnb1KcryNWtTuFmFSlT/aTi1h5zGElhrDbw+jcBTcWyfTT+Vtwyn1X/gABTLUKL+MHU/FtvQtG8Gfmrypc+Xn+XxQ48cY7z5s5z1x++er0MgfEtrP4t6r31GFS3qUdOo07OnOi85wuc1J5a5Kc5xftjjhrKZP4dj588T7dUPX35cMx7q0ABo1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa7+G3dlDcPp9b6XOvUqajo0I21wpUlFKnmXhcWumuEVH9cwefdN5EJd6SbxnsbetvrUqdStaShKheUqfHlOlLGcZXupKMvdZ44yk2RNbg9bFMR3jsk6TN6OTee0tuA+drXoXVtSubatTr0K0FUpVaclKM4tZUk10013lH0My0QADwYr9Z9lV9lb1urSnbVIaVczlW06q0+Mqbw3BNttuDfF5eXhSaSkiEmw/iI2rQ3J6cXtylThe6RCV9QqywvphHNWGeLeJQTeFjMowy8Ix4abRZ/Wxbz3hntZg9LJtHaQAExFAAAAAAAAAABYfw4/vm0H+8f7vVNjn5+6Ze3Wm6la6jZVfFdWtaFejPipcZxkpReHlPDS6fRtj0z3zpG+9AWo6dLxXFLEbyznLM7eb+z/WLw+MvZpP2aaVLxXFbmjJHbst+G5a8s0890qABTrR59TvbXTdNutRvavitbWjOvWnxcuMIpyk8LLeEn0uzAup3t1qWpXWo3tXy3V1WnXrT4qPKcpOUnhYSy2+l0aJ+JX1LoW+nVtlaHXp1q91DGoXNG4T8EVNqVD6XlTbi1JS9ovGHy+nNxf8MwTSk3t5UvEM0XvFY8AALNXAAAAAAAAAAAAAAAAAAAAAAAAAAAAHZ03am6dSsqd7p22tZvbWpnhWt7GpUhLDaeJRi08NNfzR5Noju9iJns4wJ1pvpD6j6hZU7uhte4hTqZxG4rUqE1htdwqSUl7fdLK79mdnRvQT1Bv/AC/NW2naVwxx+bu1LyZznj4lP2x3nHusZ7xxtqcNe9o/t1jT5Z7Vn+lWAnW4fSP1B0XnOtt24vKKrOlCpYtXHP3xJQg3NRaWcyivdJ4bwQU6UyVvG9Z3c7UtSdrRsAA+3yAAAAAAAAAAAAAAAA098LW+amsaLU2hqEuV1pdFVLSo5TlKrb8sNPOUuDlCK7X0yikvpbd2GDtkbgutq7s07cFpHnUs6ynKGUvJBpxnDLTxyi5RzhtZyu0bg21rNjuHQLHW9Oqc7W8oxqwy4txz7xlxbSlF5i1l4aa+xnuI6f08nPHafyvNBn9SnLPePw6IAK5PefU/kfw26/E/l/kfDP5n5jj4vFh8+fLrjjOc9Yyfn6az+JXetDb+yq2g2lzT/FdXh4fEmnKnbPKqTaaaxJJwWcP6m08wZkwvuF45rSbT5U3EskWvFY8AALRWgAAAAAAAAAAHR29rmr7e1KGo6JqNxYXUcLnRnjklJS4yXtKOYrMXlPHaOcDyYiY2l7EzE7wtvTfiD35a2VO3r0dGv6kc5uLi2kpzy2+1TnGPXt1FdL9ezl7p9at/67TlRjqdPSaEoRjKnptN0m2pcuSqNupF+yeJJYWMdvNcA4RpcMTvFYdp1OWY2m0gAJDgAAAAAAAAAAAAAAAAAEy0b0t9QdW8vyu1NRp+LHL5uKts5zjj5XHl7d4zjrPuj5tetI3tOz6rS1ulY3Q0F+7e+G6+nwqbg3Lb0eNZc6NjRlU50us4qT48ZP6l+SSXT79idaN6Cen1h5fmrbUdV544/N3bj48Zzx8Sh757zn2WMd5h34jgr2nf7JVNBmt42ZIJNomwN661Uto6dtfVakLmHko1p28qVGcePJS8k8Qw17PPeVj3RtPRtC0TRfL+DaPp2m+bHl+UtoUueM45cUs4y8Z/VnRId+LT/jVKpwyP8rMmaR6Ab/vraVW5WlaZNTcVSurpylJYX1LxRnHHeO3np9e2Ztpvw12NO9pz1HdtxcWqzzp29lGjOXTxicpzS7w/yvrrr3L9BGvxHPbtOyTXQYa+N1WaN6Cen1h5fmrbUdV544/N3bj48Zzx8Sh757zn2WMd5kukemewNLtpW9ttLSqkJTc27qirmWcJdSq8pJdeyePf9WS4Ea2oy272n+3euDFXtWHn02xsdNsqdlp1nb2VrTzwo29KNOEctt4jFJLLbf8ANnoAOUzu69gAHgFBfEh6XWtSyvN8aBS8VxS/aala04Nqsm+60Ul1JZzP7NJyeGnyv08+p2VrqWm3WnXtLy2t1RnQrQ5OPKEk4yWVhrKb7XZ3wZrYbxaHLNhrlpNZfn6ADVsyAAAAAAAAAAAAAAAAEq9P9/bl2Re+bRrzlby5OpZXDlK3qOSS5OCaxL6Y/Umn1jOMpxUHzalbxtaN4fVbTWd6y0jpHxJaXVuZR1fa15aUODcZ2t1GvJyysJxlGCSxnvP2XXeVx91fEbqFxbXFttvQqdjOU5RpXd1V8slTw0pKmkoxn+V9ucVhrEvcoYEWOH6eJ35UmddnmNt3t1vVdQ1vVrnVdVu6l3e3M+dWrN9yf+CSWEkukkksJHiAJcRERtCLM79ZAAevAAAAAAAAAAAAAAAAAAAAAAAAAAAAejTbG+1K9p2WnWdxe3VTPCjb0pVJywm3iMU28JN/yRZe0/QnfGs+OtqFG30S1l45OV3PNVwl23GnHLUor3jNweWl+uOeTNTHG952dKYr5PpjdVh7dI0nVNYuZW2kabeahXjB1JUrWhKrJRTScmopvGWln+KNVbT9Cdj6N462oUbjW7qPjk5Xc8UlOPbcaccJxk/eM3NYSX65svTbGx02yp2WnWdvZWtPPCjb0o04Ry23iMUkstt/zZXZeK0jpSN07Hw28/XOzKm3PQPfeo3PHVKVno1CM4Kc69xGrKUW3ycI03JNpL2k45yu/dq09rfD7s7TqcZ63XvNcr8JRmpTdCjlyypRjB8k0uu5tPLePbFwAr8nEM+Tzt9k7HocNPG/3crbm3NB25bfL6HpFnp8HCEJuhSUZVFBNR5y/NNrL7k2+3+rOqAQ5mZneUqIiI2gAB49AAAAAAAAAAAAPndV6FrbVbm5rU6FCjB1KtWpJRjCKWXJt9JJd5Z6PoR71G3Na7S2dqGtV7i3pVqVGUbSNbLVa4cX46eF28td49km8pJtc7cPqhsPRdNne1ty6deYyoUbGvG4qzlhtRUYN4zjGZYjlrLWTMvrH6lahv7VlCCqWmiW027S0b7k/by1MdObWevaKeFnMpSm6XR3y3jmjaETU6umOvSd5QEAGkZ8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9Gm2N9qV7TstOs7i9uqmeFG3pSqTlhNvEYpt4Sb/AJITOx3ecEh/oLvb/qduH/yyt/6Tu2vo36lXFtSuKe2KkYVYKcVUuqFOSTWVmMpqUX/BpNfc5zmx172j+3SMWSe1Z/pAQWH/APBX1N/6tf8A91v/AO4c7WfS31B0nxfNbU1Gp5c8flIq5xjGeXicuPv1nGe8ezPI1GKZ2i0f29nBkjrNZ/pDQd262bu+1tqtzc7U12hQowdSrVqafVjGEUsuTbjhJLvLOEdItFu0uc1mO4AD14As/ZfofvXcFOFzeUKeh2jnFOV8pRrOPJqTjSS5ZWM4nwzlYeHlXpsf0Z2Vtu2TudPp65eyhxq19QpxqR7Uc8KT+mKzHKynJZa5NELNr8OLpvvPwl4tFlyddto+WZtmenu7t21aH4Ro1w7Wt2r2tF07dRU1GUvI+pYecqOZdPCeGXZtP4dNItvHX3NrNxf1F45yt7SPhpJrucJSeZTi+kmuDxn2b6vQFVm4llv0r0hZYtBip9XWXK25tzQduW3y+h6RZ6fBwhCboUlGVRQTUecvzTay+5Nvt/qzqgECZmZ3lNiIiNoAAePQAAAAAB4tX1bS9Hto3Or6lZ6fQlNU41bqvGlFyabUU5NLOE3j+DK91f139O7G2jVttQvNTm5qLpWtnOMorD+p+VQjjrHTz2uvfHWmHJk+mJl8Xy0p9U7LPBnLcPxI30+dPb+2rejxrPhWvq0qnOl3jNOHHjJ/S/zyS7XfuV5uH1c9Qda5wrbiuLOi6zqwp2KVvw98RU4JTcUnjEpP2TeWskzHwzNbv0RL8QxV7dWzLqvQtbarc3NanQoUYOpVq1JKMYRSy5NvpJLvLIjrPql6faT4vmt16dU8uePyknc4xjPLxKXH36zjPePZmL9Svr7Ur2pe6jeXF7dVMc61xVlUnLCSWZSbbwkl/JHnJVOE1/ysjW4nb/GrV+pfEHsO1valvQo6zf044xcW9tFQnlJ9KpOMus47iu1+nZDdS+JS+qWVSGnbSt7e6eOFS4vZVoR7WcwjCDfWV+Zd99+xQQJNeHYK+N0e2vzW87LX1f1/3/fW0aVs9K0yampOra2rlKSw/pfllOOO89LPS798xrWfVL1B1bxfNbr1Gn4s8flJK2znGeXiUeXt1nOO8e7IaCRXTYq9qw421GW3e0urq+5NxaxbRttX1/VdQoRmqkaV1eVKsVJJpSSk2s4bWf4s5QB1iIjpDlMzPcAB68AAABon0q9BbOdjR1fezqVp1oQqUtOpTnSUIyhnFZ4jNTTl+WLWHHtyzhXB/QXZP/U7b3/llH/0ldl4nipbaI3T8fD8l43nowsDYe+PRnZW5LZu20+nod7GHGlX0+nGnHpSxzpL6ZLMsvCUnhLkkZ/9QvSDd20fNdfK/iulw5S+cs4uXCC5PNSH5oYjHLfcVlLkzrg12LL032n5c82jyYuu28K8ABMRAAAAAAAAAAAAAAAAAAAADs7U2tuHdV7K02/pNxf1I/nlBJQp5Ta5zliMc8XjLWWsLs8taKxvL2Im07Q4x6NNsb7Ur2nZadZ3F7dVM8KNvSlUnLCbeIxTbwk3/JGjthfDzplnxut4334lW7/qdpKVOgvzL6p9Tn04tY4YaafJFx7e0PSNvabDTtE063sLWOHwowxyaSjyk/eUsRWZPLeO2VubieOvSkb/AIWGLh17dbzsyztP0J3xrPjrahRt9EtZeOTldzzVcJdtxpxy1KK94zcHlpfri09ufDztGx8FXWb7UdXrQ5eWHJUKFXOcfTH61hNe0+2v0eC5AV2TiGe/nb7J+PQ4aeN/uiOkemewNLtpW9ttLSqkJTc27qirmWcJdSq8pJdeyePf9WS4AiWva/W07pNaVr9MbAAPh9AAAHn1KxsdSsqllqNnb3trUxzo3FKNSEsNNZjJNPDSf80egHsTsd0F3D6R+n2tc51tu29nWdF0oVLFu34e+JKEGoOSbzmUX7JPKWD2bL9N9nbRqQuNH0en87GEY/OV5OrWbUXFyTl1ByUnngop59sJJS4HSc+Sa8s2nZzjDjieaKxuAA5OgAAAAAAj27t7bV2l41uDWreyqVMOFHEqlVp8sS4QTlx+mS5YxlYzkp/dPxH0FTlS2vt+pObhFxr6lNRUJcu06UG+S4+z5rt+3XcjFpcuX6auOTUYsf1S0CRXcPqLsfQea1Pc2nQqU6zoVKNGp56tOazlShT5SjjDTbSSfXu0ZF3Tv3eO56cqWt7gvLmhKEYTt4yVKjNKXJcqcEoyee8tZ6X6IjJY4+Ff/dv6V+Tif/xX+2id0/EfQVOVLa+36k5uEXGvqU1FQly7TpQb5Lj7Pmu37dd1pun1g3/r9SXLW6mmUOcZxoabmgoNRx1NPyNPttOTWX/BYgILDHo8OPtVCyarLfvZ9LqvXurmrc3NapXr1pupVq1JOUpyby5NvttvvLPmASUcAAAAAAAAAAAAAAAALP8Ahk0Whq/qpb1rh05Q0y2qXqpzpKanJOMI+/5XGVRTT7w4L+arAvT4PtT8W5Nd0bwZ+as6dz5ef5fFPjxxjvPmznPXH756jay01wWmEjSxE5qxLSwAMs0YAAK49SvR/a+8KdW5t6NPRtXnNTd7b0sqf1Ny8lNNRm5cm3LqWcdtLDzdv30z3dszlW1TTvNYxx/XrRupQ/1V9TwnDuSiuajl5xk2wCdp9flw9O8ImfRY8vXtL89QaF+Iz0rsbXTXuzaumfL+HC1CztaUVSjSSf7eMVjjjCUlFNNPl1iTeei+wZ656c1VJmw2w25bAAOzkAAAAAAAAAAAejTbG+1K9p2WnWdxe3VTPCjb0pVJywm3iMU28JN/yRJvTX0/17fOrUrfT7epQsFNq51CdNujRSw5LPtKeJLEE8vKzhZa1d6a+n+g7G0mlb6fb069+4NXOoTppVqzeHJZ94wzFYgnhYWcvLcLVa2mDp3lL0+kvm69oVZ6a/D7ClUpajvmvTrpwb/DLeckk3FY8lWLTzFuWYw6yk+TWU7502xsdNsqdlp1nb2VrTzwo29KNOEctt4jFJLLbf8ANnoBQ5tRkzTveV3iwUxRtWAAHB1AAAAAAAAAAAAAAAAADnbh1zSNvabPUdb1G3sLWOVzrTxyaTlxiveUsReIrLeOkexEzO0EzERvLonn1K+sdNsql7qN5b2VrTxzrXFWNOEctJZlJpLLaX82UF6hfEN/prHZVj/zofiN5H/tLlTpf/jJSn/FOBSe6907h3Vexu9watcX9SP5IzaUKeUk+EI4jHPFZwllrL7LHDw3JfrfpH+0DNxDHTpXrP8AppXefr5tHRate00ilca7dU+lKi1Tt3JTalHyPLeEm04xlF5WH22qU3d6yb83F44fin4RRhh+PS3KhykuX1OfJzfUsY5cek8ZWSvAWuHQ4cXaN5+Vbl1mXJ52j4AAS0UAAAAAAAAAAAAAAAAAAAAAAAAOzsjcF1tXdmnbgtI86lnWU5Qyl5INOM4ZaeOUXKOcNrOV2jjA8tWLRtL2Jms7w3jszc2kbt0ChrWi3Hlt6v0yjLqdGaxmnNfaSyv4NNNNppvsmCtrbi1ra+rR1XQb+pZXahKnzilJSi/eMoyTjJezw0+0n7pM0DsL4htMvONrvGx/Da3f9ctIyqUH+Z/VDucOlFLHPLbb4ooNRw69J3x9Y/2usGvpfpfpP+l6A8+m31jqVlTvdOvLe9tameFa3qxqQlhtPEotp4aa/mj0FdMbLDuAA8Hn1OytdS026069peW1uqM6FaHJx5QknGSysNZTfa7Pz9N67v1qhtza+pa5cKnKFlbTrKE6qpqpJL6YcnnDlLEV0+2un7GCi74TE7Wnx0VHE5jesfcABbqsAAAAAAAALL9IvSTV97+LVbqf4foKrcZ13/pa6WeSorDTw1xcn0m3jk4uJ6PQX0v/AKb3s9X1aXDQbOt46kITxO5qpKXjWO4xxKLlLp4aUe23HWdrQoWttStrajToUKMFTpUqcVGMIpYUUl0kl1hFXrdd6f6Mff8ACx0ej9T9d+zzaJpWn6JpNtpWlWlO0sraHClSguor/FtvLbfbbbeWz2gFFMzM7yuojbpAADwACtN/etO0dq3txpkHcatqVDnCdG1iuFKrFLEJ1JNJZbw+Km4tSTWVh9MeK+SdqRu+L5K443tOyyyM7p37s7bFSVLW9wWdtXjOMJ28ZOrWg3HkuVOCcorHeWsdr9UZi3x6zb13JctW2oVNDsoz5UqGn1JU5dOWOdVfVJ4lh4ai8J8UyuC0w8KmeuSf6V2XiUR0xx/bS2s/EjolLxfg22tRvM58vzdaFvx9scePk5Z7znGML3z1Xms+vfqDf+L5W507SuGeXylopeTOMcvK5+2OsY93nPWKsBPpocFP8d/v1Qb6zNf/ACSrUvUbfmoXtS7r7u1mFSpjMbe6lQgsJLqFNqK9vsll9+7ONrOu63rXi/GdY1HUvDnxfN3M6vDOM8eTeM4WcfojnAkVx0r2hwm9rd5Du2u8t32ttStrbdeu0KFGCp0qVPUKsYwilhRSUsJJdYRwgfU1i3eHkWmO0plo3ql6g6T5fld16jU8uOXzclc4xnHHyqXH37xjPWfZEy258Q27rHwUtZsdO1ejDl5Z8XQr1c5x9UfoWG17Q7S/V5KbBxvpsN+9Yda6jLTtaWptufENtG+8FLWbHUdIrT5eWfFV6FLGcfVH63lJe0Om/wBFk7t163emtG2q1aevVLicIOUaVOyrqVRpdRXKCjl+3bS/Vox4CLbhmGZ3jeEmOI5ojbovTfvxDanecrXZ1j+G0ev65dxjUrv8r+mHcIdqSeeeU01xZSepX19qV7UvdRvLi9uqmOda4qyqTlhJLMpNt4SS/kjzgl4cGPDG1IRcua+Wd7SAA7OQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOztTdO4dq3srvb+rXFhUl+eMGnCphNLnCWYyxyeMp4byuy/dhfENpl5xtd42P4bW7/AK5aRlUoP8z+qHc4dKKWOeW23xRmkEfPpcWb6o6+7vh1OTF9M9H6BabfWOpWVO9068t721qZ4VrerGpCWG08Si2nhpr+aPFuPceg7ctvmNc1ez0+DhOcFXqqMqigk5cI/mm1ldRTfa/VGCgQI4TG/W3T7Js8TnbpXr91r+unqvX3jcz0TRKlSht6jPt4cZXsk+pyXuoJ9xi/4Sl3hRqgAs8WKuKvLXsr8mS2S3NYAB0cwAAAAAJt6ObCr7+3Q7GVapbadawVa9uIQbajnChF4cVOXeM/ZSeHxw41trRr7cOv2OiadT53V5WjShlSajn3lLim1GKzJvDwk39jbmw9saftDa9poenU6aVGCderGHF3FXC51ZZbeZNe2XhYS6SIOu1XoV2r3lM0em9a289odDRNK0/RNJttK0q0p2llbQ4UqUF1Ff4tt5bb7bbby2e0AzkzMzvK/iNukAAPAOFvTdug7Q0meo65fU6CUJSpUFJOtcNYXGnDOZPMo/wWctpdke9Y/UrT9g6SoQVO71u5g3aWjfUV7eWpjtQTz17yawsYlKOSN07i1rdGrS1XXr+pe3bhGnzklFRivaMYxSjFe7wku237tssNJobZv1W6V/KFqtZGL9Nesp16q+sevbvqVtO02dTSdE5zUaVKbjWuKbjxxWknhprl9C+n6sPlhMrAAvseKmKvLWNlJkyWyTzWkAB0fAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMvRraX9M9/WWl1ocrGl/Wb7vH7GDWY9ST+puMMxeVzz9j5veKVm09ofVKze0VjyvD4XNkQ0jbj3dfUakNR1SEoW6k5Lha5TX0tLuco8s9px4NYy83QAZTNlnLeby0uLFGKkVgABydAgPrH6lafsHSVCCp3et3MG7S0b6ivby1MdqCeeveTWFjEpR7HqVvHT9jbXq63qFOpXbmqNtQh061VpuMeWMRWItuT9knhN4TxRreq6hrerXOq6rd1Lu9uZ86tWb7k/wDBJLCSXSSSWEix0Oj9aea30x/tB1mq9KOWvef9Gt6rqGt6tc6rqt3Uu725nzq1ZvuT/wAEksJJdJJJYSPEAaCIiI2hRzO/WQAHrwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADW/w0bS/o7sGGqXMMX2t8bmff5aKT8MepNPqTnnCf7TD/ACmafTfbn9Ld8aVt91fFTuq37aalxapRi5z4vD+rjGWMrGcZ6N0lTxTNtWMceesrThuLeZyT4AAUa3D53Veha21W5ua1OhQowdSrVqSUYwillybfSSXeWfQpf4o97w0jbi2jY1qkNR1SEZ3DipLha5af1Jruco8cdpx5p4ys9cOKct4pDnmyRipNpUv62b5qb43jUuaMsaXZcrewjGU8TgpPNVqWMSn030mkop545cFANVjpGOsVr2hmr3m9ptPeQAH2+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGgfhA0Cbuda3RVjUjCMI2FCSnHjNtqpVTX5srFLD6X1P3+2iSA/D/oENA9K9Jjxpqvfw+fryhOUlN1UnB9+zVPxxaXWYv393PjL6zJ6ma0tHpcfJirAACKkPndV6FrbVbm5rU6FCjB1KtWpJRjCKWXJt9JJd5Zh/wBTt1V95b1v9cqOoqFSfjtKU8/sqEeoRxyai8fVJJ45Sk17mnfiO1+eheld/GjKpCvqc42FOUYRkkppuopZ9k6cakcrLTaxj3WPC74Vh6Tkn7KjiWXrGOPuAAt1WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHo0yyutS1K106ypeW6uq0KFGHJR5TlJRisvCWW12+jzky9EtM/FvVfbtr5/DwvFc8uHLPhTq8cZXvwxn7Zz37HxktyVm3s+qV5rRX3bUtaFC1tqVtbUadChRgqdKlTioxhFLCikukkusI+gBkWpAAeDNPxg6n5dyaFo3gx8rZ1Lny8/zeWfHjjHWPDnOe+X2x3RZMvW3U/xb1X3FdeDw8Lx23Hnyz4UqXLOF78M4+2cd+5DTVaWnJhrX4ZvU358tpAASHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALP+GHTq996t2VzSnTjDT7avc1VJvMouDpYj178qsX3jpP+TrAuT4Rv3kah/Y9X/OokfVztgt9nfSxvmr92pgAZVpAA8Wu6jQ0fRL/AFe5hUnQsbapc1Y00nJxhFyaSbSzhfdo9iN52gmdurBWp3t1qWpXWo3tXy3V1WnXrT4qPKcpOUnhYSy2+l0ecA2MRsyncAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD0abY32pXtOy06zuL26qZ4UbelKpOWE28Rim3hJv+SEzsd3nBZ+3PQrf+r23zFa1s9Jg4QnTV/XcZTUk3+WClKLXWVNRaz/PElvvhu1uGm0KlluXTq19Lj5qNajOnSh9P1cai5OWHhLMI5XfXsRrazBWdpskV0ua0bxVRYJNvjYu6Nm3Lp65plSlQc+FK7p/XQq9yxia6Tai3xliWO2kRk71tW0b1neHG1ZrO0wAA+nyAAAXJ8I37yNQ/ser/AJ1EpsuT4Rv3kah/Y9X/ADqJG1n7FvskaT96rUwAMs0YR71N/dvuf+x7v/JmSE42+rK61LZOu6dZUvLdXWm3FCjDko8pypyjFZeEstrt9H3jna8Pm/WssHAA17LAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+lrQr3VzStrajUr1601TpUqcXKU5N4UUl2231hFp7V9Bd66xbW93fuz0ahVnHlC6nJ11TaTc1Tims4b+mUovKaePcsv4avTqho2iUd3ava056rfQ8li3NT8FtOKxJLGIzmm8vLai0vpbmndBT6riNq2mmPx5Wum0EWrFsn9Kf2t8PuztOpxnrde81yvwlGalN0KOXLKlGMHyTS67m08t49sWnpGk6Xo9tK20jTbPT6EpupKla0I0ouTSTk1FJZwks/wR7QVWTPky/XO6yx4aY/pjYABydHi1vStP1vSbnStVtKd3ZXMOFWlNdSX+KaeGmu00msNGLPVPZ91sjeNzo1b6reWa9lUdRSdS3lKSg5YSxL6WmsLtPHWG9wGcvjFsrWnqW29RhSxdV6NxQqT5P6oU5QlBY9lh1J9+/ffsiy4ZlmuXk8SgcQxRbHz+YUEADQKMAAAs/4YdRr2Pq3ZW1KFOUNQtq9tVck8xioOrmPfvypRXeem/5qsCZeiWp/hPqvt268Hm53ituPPjjzJ0uWcP255x98Y69zjqK82K0fEuuC3LlrPzDbAAMm0wAAPz5uqFe1uattc0alCvRm6dWlUi4yhJPDi0+00+sM+ZKvV2yutP8AVDctC7peOpLUq1eK5J5hUk6kH1+sZRePdZ77IqbCluasW92WvXltMAAPp8gAAAAAAAAAAAAAAAAAAFt7M9A93a1SoXer1bfQrWp241k6lwouCcZeNYSy2k1KUZLDyuknJvhc9P8AT722e9tXt6larRuZU9OpVaeKScUs11n87Um4r7RcJPuWOOiSo1nELUtyY/HlaaTQxevPkZ2uvhqrxtqsrbeNOrXUG6UKmnOEZSx0nJVG4rP3SeP0fsVZ6henW6NjVKctatac7SrPx0ry3nzozlxUuOcKUX79SSzxljKWTbh4tb0rT9b0m50rVbSnd2VzDhVpTXUl/imnhprtNJrDRGxcSy1t+vrCRl4fitH6OksBAk3qdtWvs3et/odRVHQpz8lpVnn9rQl3CWeKUnj6ZNLHKMkvYjJfVtFqxaO0qW1ZrMxIAD6fIAAAAAAAAAAAAAAAAAAAAAAAAAAP0GtaFC1tqVtbUadChRgqdKlTioxhFLCikukkusI+hFfSjc1PduwdL1f5jz3Toqjet8FJXEElUzGPUcv6kuvplF4WcEqMhes1tNZ7w1NLRasTAAD4fQAR7ce99o7d88dZ3Fp1rWt+Plt/Mp148sY/ZRzN9ST6Xs8+3Z9VrNp2rG7y1orG8ykJkT4ldzw3B6j1rO2qVJWmjw+TinOXF1VJurJRaXF8voeM58aeWsYl3qn6+fO2Vzo2yqVxbxqZpy1So+E+OZJ+KHvHK4tTbUkm/pi8NUEXXD9HbHPqX6eyo12qreOSgAC2VgAAB6NMvbrTdStdRsqviurWtCvRnxUuM4yUovDynhpdPo85IfTfbn9Ld8aVt91fFTuq37aalxapRi5z4vD+rjGWMrGcZ6Pm8xWszPZ9ViZtER3blta9C6tqVzbVqdehWgqlKrTkpRnFrKkmummu8o+h87WhQtbalbW1GnQoUYKnSpU4qMYRSwopLpJLrCPoZCWpAAeDKHxV6N+H+pcdThTuPHqlnTqyqTX0OrD9m4wePtGNNtZbTln2aKkL5+MPUaFXW9v6RGFRV7a2rXM5NLi41ZRjFJ5znNGWevuvfvFDGo0UzOCu7O6uIjNbYABKRgAAAAAAAAAAAAAAAAAAbc9GqOn0PSvbcNMdN0HYU5z4VOa8slyq95ffkc8r7PK6xglxT/wpa/DUfT6rok5U1X0i5lFQjCSfiqtzjKTfTbn5V17KKyvu7gMpqaTTLaJ92l09otirMewADg7M/fF/oEHbaLuilGnGcZysK8nOXKaadSkkvy4WKuX0/qXv9s7G5PVLQJ7n9Pta0SlGpOvXtnK3hCcYudWDU6ccy6Sc4xTzjpvte5hs0PDMvPi5Z8KPiGPly83uAAsUAAAAAAAAAAAAAAAAAAAAAAAAAAAEq9M986vsTX1qOnS8tvVxG8s5yxC4gvs/0ksvjL3Tb902npna3rVsDXakaMtTqaTXlOUY09SpqkmlHlydRN04r3SzJPKxjtZx4CJqNFjzzvPSUrBq8mGNo7Nsaz6pen2k+L5rdenVPLnj8pJ3OMYzy8Slx9+s4z3j2ZWG6fiPoKnKltfb9Sc3CLjX1KaioS5dp0oN8lx9nzXb9uu87A5Y+GYa9Z6umTiGW3bomW7PU/fG5vJT1DXrila1PJF2to/BS4T96clHDnHHS5uTxnvt5hoBOpStI2rGyHa9rzvadwAH0+QAAAAANG/CLtmpQstU3ZdW/H5nFnZTlzTcIvlVaX5XFyUEn2805LrvOcjdvp/oENr7K0nQYxpxnaW0Y1vHOUoyqv6qkk5d4c3J/b39l7FbxPLyYuWPKfw7HzZOafDugAz68D53Veha21W5ua1OhQowdSrVqSUYwillybfSSXeWfQqz4l92/wBHdgz0u2ni+1vlbQ6/LRSXml3Fp9SUMZT/AGmV+U6Ysc5bxSPL4y5Ix0m0+GbvU7dVfeW9b/XKjqKhUn47SlPP7KhHqEccmovH1SSeOUpNe5GQDWVrFaxWO0Mza02mZkAB9PkAAAAAAAAAAAAAAAAAAFp/DFuH8G9S6Wn1q3C11ajK2kp1+EFVX105NPqUsxcIrp5qPHvh63Pz90y9utN1K11Gyq+K6ta0K9GfFS4zjJSi8PKeGl0+jfWmXtrqWm2uo2VXy2t1RhXoz4uPKEkpReHhrKa6fZRcVx7Xi8eVzw3JvSaez0AAqlkGH/VzRvwH1L1/TFTt6dON5KrRp26xCnSqftIRSwsYjOKwlhNYXRuAzL8Xmi0LTdGka5SdOM9Rtp0asI0lFuVFx+uUv9ZuNSMe10oLt+ysuGZOXNy+6BxGnNi5vZR4ANAowAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWH8O+ifjXqvpXktvPb2HO9rftOPDgv2cvdN4qun0s/wAVjJscob4QNFoQ0TWtxSdOdetcxsoZpLlTjCKnLE/fEnUjldf6NPvrF8mc4jk580x7dF9oMfJh39wAEBNDIHxIbmqa/wCpd5Z07jyWOk/1OhGPNJTX+lbUuuXPMW0kmoR98Zeqt361Q25tfUtcuFTlCytp1lCdVU1Ukl9MOTzhyliK6fbXT9jB11Xr3VzVubmtUr1603Uq1aknKU5N5cm32233lltwrFvack+FZxLJtWKR5fMAF4pwAAAAAAAAAAAAAAAAAAAAANf/AA06z+LelFjRnUuKlbTq1SzqTrPOcPnBReW+KhOEV7Y44SwkZANA/B5qsI3O4NEq3dTnOFG6oW7cnFKLlGrNf6qf1Uk/u+vfHUDiVObBM+yboL8uaI92iQAZxfBVHxU6dXvvSt3NKdOMNPv6NzVUm8yi1KliPXvyqxfeOk/5O1yPepdj+Jenm4bJWfztSpptfw0VS8jlVUG4cY4eZKSi1jvKWOztp78mWtvlyz158dq/DCwANYzIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAdHbOmfjW5NL0bz+D5+8pW3l4cuHOajyxlZxnOMo8mYiN5exG87Q2f6R6N+A+mmgaY6dxTqRs41a1O4WJ06tT9pOLWFjEpyWGspLD7JUAZC9ptabT5amtYrWKx4AAfL1S/xaa/Ow2VY6DRlUjPVblyq4hFxlSo4k4tvtPnKk1j/mvv7PLpa/xTa1X1H1OqaXJVIUNKtqdGEHVcoylOKqymo+0W1OMX754Lv2Sqg02hx8mCvz1Z7W5OfNPx0AATEUAAAAAAAAAAAAAAAAAAAAACz/AIYdRr2Pq3ZW1KFOUNQtq9tVck8xioOrmPfvypRXeem/5qsDs7FvbXTd7aFqN7V8Vra6lb160+LlxhGpGUnhZbwk+l2cs9OfHavvDphtyZK2+W8QAZJpwAAYG3Npn4LuTVNG8/n+QvKtt5eHHnwm48sZeM4zjLOcTb1106hpfq3uG2t51JQncq5bm03yrQjVkukulKbS/hj39yEmvxW5qRb3hl8leW819gAH2+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALP8Ahh06vferdlc0p04w0+2r3NVSbzKLg6WI9e/KrF946T/k6wL5+DzTqFXW9wavKdRV7a2o20Ipri41ZSlJtYznNGOO/u/frEbWW5cFp+PykaSvNmrDSIAMs0YARn1T1WGi+nG4NRld1LScLCrCjWpuSlCrOPCnhx7T5yj39vfrGT6rWbWiseXlrcsTMsYbw1GhrG7dY1e2hUhQvr+vc0o1ElJRnUlJJpNrOH9mzlAGviNo2hlpnedwAHrwAAAAAAAAAAAAAAAAAAAAAAABv3QtRoaxolhq9tCpChfW1O5pRqJKSjOKkk0m1nD+zZ7SM+lVehceme2alvWp1oLSrem5QkpJSjTjGUcr7qSaa+zTRJjIXjltMNTSd6xIAD4fTJnxU6dQsfVR3NKdSU9QsKNzVUmsRknKliPXtxpRfee2/wCSqgvD4v8ATq9Ldui6vKdN0LmwlbQim+SlSqOUm1jGMVo47+z9us0eanR23wVn4ZzVxtmsAAko4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGovhEoUI7A1O5jRpqvU1WVOdVRXKUY0qTjFv3aTlJpfbk/1Zl02H8NlChR9HNHqUqNOnOvO4qVZRik6kvPOPKT+74xisv7RS+xXcTttg295T+HRvm/hY4AM8vAqz4pNT+Q9KK9r4PJ+I3lG25c8ePDdXljHf8AosY6/Nn7YdplF/GDqfi23oWjeDPzV5UufLz/AC+KHHjjHefNnOeuP3z1K0debPWPlH1duXDaWaQAahnAAAAAAAAAAAAAAAAAAAAAAAAAAAbH+HH9zOg/3j/eKpYZXnw4/uZ0H+8f7xVLDMpqf3r/AHn8tNp/2q/aAAHB1Z6+Mn/ZX++f8Az0aF+Mn/ZX++f8Az0abh//AF6/z+ZZ/Xfv2/j8AAJiIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABtj0S0z8J9KNu2vn83OzVzy4cceZurxxl+3PGfvjPXsYnN0+mX7t9sf2Paf5MCq4rM+nWPlZcMj9cz8JCACiXIZy+MW9tampbb06FXN1Qo3FepDi/phUlCMHn2eXTn179d+6NGmWfi5/eRp/8AY9L/ADqxP4dG+eP5Q9fO2CVNgA0agAAAAAAAAAAAAAAAAAAAAAAAAAABsf4cf3M6D/eP94qlhlefDj+5nQf7x/vFUsMymp/ev95/LTaf9qv2gABwdWevjJ/2V/vn/AM9GhfjJ/2V/vn/AADPRpuH/wDXr/P5ln9d+/b+PwAAmIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG6fTL92+2P7HtP8AJgYWN0+mX7t9sf2Paf5MCp4t9Ffus+GfXZIQAUa4DLPxc/vI0/8Asel/nVjUxln4uf3kaf8A2PS/zqxYcN/f/hC4h+ypsAGiUIAAAAAAAAAAAAAAAAAAAAAAAAAANj/Dj+5nQf7x/vFUsMivpFZWun+l+2qFpS8dOWm0a8lybzOpFVJvv9ZSk8eyz10SoyWeebLafmWnwxtjrHxAADk6M9fGT/sr/fP+AZ6L0+MHU/LuTQtG8GPlbOpc+Xn+byz48cY6x4c5z3y+2O6LNNoImNPXf/3VntbO+e3/ALwAAmIoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG6fTL92+2P7HtP8mBhY2h6A3t1qHpBt+vd1fJUjRqUIviliFOrOnBdfpGMVn3eO+yq4rH/HWflZcMn/AJJj4ToAFEuQyz8XP7yNP/sel/nVjUxnr4yf9lf75/wCdw6dtREe+6Hr43wSz0ADSKAAAAAAAAAAAAAAAAAAAAAAAAAAOzsWytdS3toWnXtLy2t1qVvQrQ5OPKEqkYyWVhrKb7XZ5ado3exG87NyaFp1DR9EsNItp1J0LG2p21KVRpycYRUU20ks4X2SPaAY+Z3neWqiNugADwZQ+K69tbr1QpULerzqWem0qFwuLXCblOol37/TUg8rK7/VMqQm3rrqNDVPVvcNzbwqRhC5Vs1NJPlRhGlJ9N9OUG1/DHt7EJNXpq8uGsfDNai3NltPyAA7uIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGu/hh1GhfekllbUoVIz0+5r21VySxKTm6uY9+3GrFd47T/m8iGmvhA1GhV2lrWkRhUVe2v43M5NLi41aajFJ5znNGWevuvfvFfxOu+Df2lO4fbbNt7wvAAGdXoUf8X+nUKu0tF1eU6ir21/K2hFNcXGrTcpNrGc5oxx39379YvArT4mbK1uvSDUq9xS51LOtQr275NcJurGm317/TUmsPK7/VIk6O3LnrPy4aqvNhtHwyAADUs2AAAAAAAAAAAAAAAAAAAAAAAAFn/DDp1e+9W7K5pTpxhp9tXuaqk3mUXB0sR69+VWL7x0n/ACdYGhfg+0T/AJd3HVtv+jsrav5P/HVjxz/3Ly1/J+5F1t+TBaf/AHVJ0lObNWGhQAZdogAAZZ+KXZ34NuynuayocbHV8+bhDEadzFfVnEUlzWJdtuUlUZTZuT1O2rQ3lsq/0Ooqar1IeS0qzx+yrx7hLPFuKz9MmlnjKSXuYfuqFe1uattc0alCvRm6dWlUi4yhJPDi0+00+sM0XDs/qYuWe8KLXYfTyc0dpfMAFgggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXp8H2p+Lcmu6N4M/NWdO58vP8vinx44x3nzZznrj989UWT74fNVhpXq3os613Ut6FzOdrU4uWKjqQlGnCSXunU8fv0mk3jGVH1dOfDaPh30tuTNWWzAAZVpA5W8NOr6xtLWNItp04V76wr21KVRtRUp05RTbSbxl/ZM6oPYnad4eTG8bPz1BIfUrRP6O7+1vRo23ytG3vJ/L0vJz40ZPlS7y2/olF9vP695I8a+totEWjyy1qzWZiQAH08AAAAAAAAAAAAAAAAAAAAAA2P8O+ifgvpRpXktvBcX/O9rftOXPm/2cvdpZpKn0sfxWcmRdC06vrGt2GkW06cK99c07alKo2oqU5KKbaTeMv7Jm9dMsrXTdNtdOsqXitbWjChRhycuMIpRisvLeEl2+yp4rk2rWnus+G03tN3oABRrgAAAzT8Uuw/kNSp7x0iw42d1mOpeGn9NOty+mrLvrnnDaSXKOW3Kfeljxa3pWn63pNzpWq2lO7srmHCrSmupL/FNPDTXaaTWGiRps84MkWj+XHUYYzUmrAQJd6q7I1DY26K2n3FGo7CtOc9PuW+SrUs9ZkklzimlJYWH37OLcRNRS8XrFq9pZy1ZpM1nuAA+nyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe3QtRr6Prdhq9tCnOvY3NO5pRqJuLlCSkk0mnjK+zR4geTG8bS9idp3foNa16F1bUrm2rU69CtBVKVWnJSjOLWVJNdNNd5R9CC+gms/jXpRodadS3da1ouzqQov8nibhBSWW1JwUJP/ALWUkmidGRyU5LzWfDUY7c9Yt7gAPh9Ms/FlonyO/rTWaVt46Op2a51fJny1qT4y6zlYg6K9kn/F5KbNXfFXo34h6aR1OFO38ml3lOrKpNfWqU/2bjB4+8pU21lJqOfdIyiaXh+TnwR8dGf11OTNPz1AATUQAAAAAAAAAAAAAAAAAAAAAXB8KWgT1H1Bq63ONRUNItpSU4zil5aqcIxkn204eV9ezisv7PVRWHw1bYnt/wBOKN5c06cbvWJ/OSahHkqTilSi5JvkuP1rOMeRrCec2eZnXZfUzTMdo6NDo8fp4Y389QAENKAAAAAEV9TNjaRvvQHp2ox8VxSzKzvIRzO3m/uv1i8LlH2aS9mk1jjee2dX2lr9fRdat/FcUvqjKPcK0HnFSD+8Xh/xTTTSaaW8SK+pmxtI33oD07UY+K4pZlZ3kI5nbzf3X6xeFyj7NJezSan6LWzgnlt9P4QtXpIzRzV+ph8HZ3ltnV9pa/X0XWrfxXFL6oyj3CtB5xUg/vF4f8U000mmlxjRVtFo3hRTE1naQAHrwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGhfg+1v8A5d25Vuf+jvbah4//AAVZcsf9ysN/yXuaFMT+i24f6M+pej6hUreO1qVvlrpyr+KHiqfQ5Tftxi2p4fWYL291tgz3EsfJm5vde8Pyc2Ll9gAFcnPFrunUNY0S/wBIuZ1IUL62qW1WVNpSUZxcW02ms4f3TMFanZXWm6ldade0vFdWtadCtDkpcZxk4yWVlPDT7XR+gRlX4rdAnp3qDS1uEajoavbRk5ynFry0koSjFLtJQ8T793J4f2VrwvLy3mk+VbxLFvSLx4U+AC9UwAAAAAAAAAAAAAAAAAAB3fT/AECe6N66ToMY1JQu7mMa3jnGMo0l9VSScusqCk/v7ez9jhGjfhF2zUoWWqbsurfj8zizspy5puEXyqtL8ri5KCT7eacl13mPqs3o4ps76bF6uSKr5taFC1tqVtbUadChRgqdKlTioxhFLCikukkusI+gBlmkAAeCj/iN9Rda2nujb1joF1UoVaEJX11TnBOjcRk3CEJd8mvpq5XX5otPkk42vszc2kbt0ChrWi3Hlt6v0yjLqdGaxmnNfaSyv4NNNNppvF/qRuP+lu+NV3AqXip3Vb9jBx4tUoxUIcll/VxjHOHjOcdHV9HN+19g7od9KjUudOuoKje28JtNxzlTisqLnHvGfs5LK5ZV5k4fvgrt9Uf7VGPXbZp3+mW1AeLRNV0/W9JttV0q7p3dlcw50qsH1Jf4pp5TT7TTTw0e0pJiYnaVvE79YAAeCPb62Zt7emmxstesvN4uTt60JOFWhKSw5Rkv/s8PMW4xynhGUPUz0u3Lseq61zS+f0t5cb+2hJwgufFKqsfs5PMem2m5YUpYeNoHzuqFC6tqttc0adehWg6dWlUipRnFrDi0+mmusMmabWXwTt3j2RdRpKZuvaX58g0j6q+gtC+qVtX2S6dtcznOpV06rNRoy+nOKLx9Dcl+WT4/V04KOHnK6oV7W5q21zRqUK9Gbp1aVSLjKEk8OLT7TT6wy/waimeN6ypM2C+GdrPmADu4gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABuD0o3NT3bsHS9X+Y8906Ko3rfBSVxBJVMxj1HL+pLr6ZReFnBh8vn4R9zzoatqO0bipTVC6g7y15TjF+WPGM4xWMycoYl79Kk3jtsr+JYefFzR3hO0GXky8s+WkQAZ1ehBfXfbNTdPppqNna2/nvrXjeWkVzy5w/MoqOXKTg5xSw03Je3up0D7x3mlotHh83pF6zWfL89QSb1T0qei+o+4NOlaU7SEL+rOjRpqKjClOXOnhR6S4Sj19vbrGCMmtraLVi0eWYtXlmYkAB9PkAAAAAAAAAAAAAAAB0dtaNfbh1+x0TTqfO6vK0aUMqTUc+8pcU2oxWZN4eEm/sbo21o1jt7QLHRNOp8LWzoxpQyopyx7ylxSTlJ5k3hZbb+5nL4RdG+a3jqmtzp286en2apR5rM4VasupQ66+mnUi3lPEsdps08UPFM02yRj8QuuHYoinP7gAKtYhWHxK7nnt/wBOK1nbVKcbvWJ/JxTnHkqTi3VkotPkuP0PGMeRPKeM2eY49ft4/wBLt/XHytfyaXp2bWz4zzCeH9dVYk4vlL2ksZjGGfYm6DD6uWN+0dUTW5vTxTt3lXgANKz6fejnqVqGwdWcJqpd6JczTu7RPuL9vLTz0ppY69pJYeMRlHX+iarp+t6TbarpV3Tu7K5hzpVYPqS/xTTymn2mmnhowESr0z3zq+xNfWo6dLy29XEbyznLELiC+z/SSy+MvdNv3TaddrNDGb9dOlvyn6TWTi/Tbt+G4ARn093voO+dJqaholaonRnwr21dKNai++PKKbWJJZTTafa900pMUFqzSeW0dV3W0WjeOwAD5ehlX4p9q0NE3rb65aKnToa3CdSdKOFxr0+KqSwopJSUoSzltyc2/saqM7fGPXoSudsW0a1N16cLqpOkpLlGMnSUZNe6TcZJP78X+jJ/DrTGeIjzuh6+sThmZ8M/AA0agAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADo7a1m+29r9jrenVOF1Z1o1YZckpY94y4tNxksxaysptfc5wPJiJjaXsTMTvD9AtMvbXUtNtdRsqvltbqjCvRnxceUJJSi8PDWU10+z0GWfQX1btdoWU9u7ihcVNLnW8lvcU8zds5NKScW/9H7z+lZT5dS5daZ0jVtL1i2lc6RqVnqFCM3TlVta8asVJJNxbi2s4aeP4oy+p018Ftp7e7R6fUVzV3ju9oPPqV9Y6bZVL3Uby3srWnjnWuKsacI5aSzKTSWW0v5sz968+sen6jpN9tHa06lZVZujeahGfGnKmsNxpOLzJSeYuT+lxTSUlJNfODT3zW2rD3NnphrvZS++r211Le2u6jZVfLa3WpXFejPi48oSqSlF4eGsprp9nGANVWOWIhm5nedwAHrwAAAAAAAAAAAAAAABcnwm638jv670arc+Ojqdm+FLx58tak+Ue8ZWIOs/dJ/xeDUx+fumXt1pupWuo2VXxXVrWhXoz4qXGcZKUXh5Tw0un0a39LPV/b27rK2tNRurfS9eliE7WpJxhWnmMU6UpdPk5LEM8s5WGlydLxLTWm3q1j7rfh+orFfTtP2WWAR7ee9NtbSsq9fWtUt6ValR80bSNSLuKybaXCnnLy01n2WHlpJtVNazadohZ2tFY3lyvW/c8NqenGpXkalSnd3UHZ2bpzlCSq1ItKSkk+LjFSn9vyYym0YrJt6x79r7+3Qr6NGpbadawdGyt5zbajnLnJZcVOXWcfZRWXxy4SaTQ6ecGPr3lQazP62Tp2gABMRAAAdHb2uavt7Uoajomo3FhdRwudGeOSUlLjJe0o5isxeU8do0r6W+umka9w07dXy+jak+bVxy4WdRLtLlKTcJYz1Lp8fzZkomWQRtRpceeP1d/d3wam+Gf09n6FAxXsT1S3js62pWOl39Otp1Kc5qyuqSqUsyXeH1OKz9WIySzl/d5l3/AMxe9v8A6Xt7/wDXrf8AulRfheaJ/TtMLWvEcUx16NM63qun6JpNzquq3dO0sraHOrVm+or/ABbbwkl220llsxh6t7xnvnetxrUadSjaRhGhZ0qnHlClHOM4Xu5OUvd45Yy0keffG+t0byuXU1zU6lWgp86VpT+ihS7ljEF02lJrlLMsdNsjJYaPReh+q3WUHV6z1v017AALBBAAAAAAAAAAAAAAAAf/2Q==`,
    'Back': `data:image/png;base64,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`,
    'Arms': `data:image/png;base64,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ZDTbt+O3gmXdjHP9ljHH3s/LB7Y8ea2K+pyvly1yf0JTREXE6hR56jv3M37+X/qIlIajz1HfuZv38v8A1ES743zoe6/JyyPlS9mU4REWrMyEREAREQBERASP0V6oT9P6mqpqmjkr7VWvY6WJspa6BwODIwH2klvBBxu2s9wAVmbb1G0HcKKOrg1dZmRyZw2oqmwPGCRyyQhw8fMDI58FUfRQcjArulzbMmUZs6ly7ovBcuo2g7fRSVc+rrM+OPGW09U2d5yQOGRkuPn5A4HPgKs3WrqhP1AqaWmpqOSgtVE97oonSlzp3E4EjwPaCG8ADO3c/wBxBUcImPgV0y5t2L82dseXZBERTiGEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBW/9N+mY7B00o6ySn7dddv2ydzthJYf7IAt527MOAJJBe7xnArl0a0l+mevqK1zM3UMX7TXc4/UsIy3hwPuJazLTkb8/JXYVPxS/sql7steG093Y/YIiKlLYKsPq6vPxWsbXZGSU747fRmV2w5eyWV3LX88e2ONwGAcOzyCFZqqngpaaWpqZo4IIWGSWWRwa1jQMlxJ4AA5yVRLW+oKrVWrLjqCrbskrJi9rMg9tgAaxmQBna0NbnAJxk8lWfC6ua1z9Cv4jZy1qPqXxREVYWAUeeo79zN+/l/6iJSGo89R37mb9/L/1ES743zoe6/JyyPlS9mU4REWrMyEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREARFOnpi6d/aNbFrm6jFLSTObQU74siaUDBlJcMbWk+0t53tPI2YdyvujTBzkdaapWzUUSx0L0Q/RGimU9dDGy71r+/XFpa7afDI9wAyGt+WSA5z8EgrvkRZWybsk5S3ZpIQUIqK8giLzqp4KWmlqamaOCCFhkllkcGtY0DJcSeAAOcleT0RZ6n9TssnT51nikkZW3p/ZZse5hbEwtdKcgYII2sLSRkSHyAQqmLsusurf0z19W3SF+6hi/ZqHjH6lhOHctB9xLn4cMjfj5LjVpsKjo1JPd92Z3Lu6tja2R9CkRFmDRBR56jv3M37+X/qIlIajz1HfuZv38v/AFES743zoe6/JyyPlS9mU4REWrMyEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAERd90c6a3DX12L3mSkslM8CrqwOXHz2o88F5GOfDQcnOWtd4ssjXFyk+x7hCU5csdx0c6a3DX12L3mSkslM8CrqwOXHz2o88F5GOfDQcnOWtdcilggpaaKmpoY4IIWCOKKNoa1jQMBoA4AA4wFjWS1W+yWmmtVqpI6SipmbIomDho/xJJySTySSTklZqzeXlSyJa+S2L/GxlRHTzCIiiEkKF/VHrdlo04NI0M0jLjdGNfUFocNlLkg+4Ecvc3bjkFu8HGRmS9eant+kNL1d8uMkYELCIInP2molwdkTcAnLiPODgZJ4BVI9S3mu1Df6693GTfVVkzpX4LiG58NbuJIa0YaBk4AA+SsuHY3Unzy2X5IGfkckeRbs1yIi0BRn0KREWNNWFHnqO/czfv5f+oiUhqPPUd+5m/fy/9REu+N86Huvycsj5UvZlOERFqzMhERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREARb3Rekr9q+7Mt1joZJyXtbLOWkQ04OTukfjDRhrvxOMAE8Ky3SrorZdKSQ3W9Pju95jeyWJ+0thpXBvhjc+8hxJD3D5NIa0jJi5GXXQu+/oSKMWdz7bepGHRrotXaj+C1BqUfC2N/wCsZTbnNnqmjG0+PZG7J92dxA4ADg9WZslqt9ktNNarVSR0lFTM2RRMHDR/iSTkknkkknJKzUVBkZM73rLb0LyjHhStI7hERRjuF51U8FLTS1NTNHBBCwySyyODWsaBkuJPAAHOSlVPBS00tTUzRwQQsMkssjg1rGgZLiTwABzkqqnX7qjVapuVRpy0S9qw0sxY90bw7457XffJaSDGCMtAODw487Q2TjY0r5aLY4ZGRGmOr3Oe6y9Q6rqBf45hB8La6LeyhgcBvAdjc95H+s7a3gHAAAGeXO4VEWmrhGuKjHZGdnOU5OUtwiIvZ5PoUiIsaasKPPUd+5m/fy/9REpDUeeo79zN+/l/6iJd8b50Pdfk5ZHypezKcIiLVmZCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgC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`
  };

  const getBodyPartIcon = (bodyPart) => {
    return bodyPartIcons[bodyPart] || bodyPartIcons['Biceps'];
  };

  const getWorkoutIcon = (type) => {
    // For Legs, return the image path, for others return Lucide icon components
    if (type === 'Legs') {
      return bodyPartIcons['Legs'];
    }
    const icons = {
      'Push': ArrowUp,
      'Pull': ArrowDown,
      'Upper': ArrowUp,
      'Lower': ArrowDown
    };
    return icons[type] || Move;
  };

  const isWorkoutIconImage = (type) => {
    return type === 'Legs';
  };

  const startWorkout = (dayType) => {
    console.log('🏋️ Starting workout:', dayType);
    console.log('📋 Programs:', programs);
    console.log('💪 Exercises:', exercises);
    
    const exerciseIds = programs[dayType] || [];
    console.log('🎯 Exercise IDs for', dayType, ':', exerciseIds);
    
    const workout = {};
    
    exerciseIds.forEach(id => {
      // Only add if exercise exists
      if (exercises[id]) {
        workout[id] = {
          sets: [{ weight: exercises[id].lastWeight, reps: exercises[id].lastReps }]
        };
        console.log('✅ Added:', exercises[id].name);
      } else {
        console.warn('⚠️ Exercise not found:', id);
      }
    });
    
    console.log('🏋️ Final workout:', workout);
    console.log('📊 Workout has', Object.keys(workout).length, 'exercises');
    
    setCurrentWorkout(workout);
  };

  const addSet = (exerciseId) => {
    if (!exercises[exerciseId]) return; // Safety check
    
    setCurrentWorkout(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        sets: [...prev[exerciseId].sets, { weight: exercises[exerciseId].lastWeight, reps: exercises[exerciseId].lastReps }]
      }
    }));
  };

  const updateSet = (exerciseId, setIndex, field, value) => {
    setCurrentWorkout(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        sets: prev[exerciseId].sets.map((set, idx) => 
          idx === setIndex ? { ...set, [field]: parseFloat(value) || 0 } : set
        )
      }
    }));
  };

  const saveWorkout = () => {
    const updatedExercises = { ...exercises };
    
    Object.entries(currentWorkout).forEach(([exerciseId, data]) => {
      const bestSet = data.sets.reduce((best, set) => 
        set.weight * set.reps > best.weight * best.reps ? set : best
      );
      
      // Add all sets to history
      updatedExercises[exerciseId] = {
        ...updatedExercises[exerciseId],
        lastWeight: bestSet.weight,
        lastReps: bestSet.reps,
        history: [...updatedExercises[exerciseId].history, { date: selectedDate, sets: data.sets }]
      };
    });

    setExercises(updatedExercises);
    setWorkoutHistory([...workoutHistory, { date: selectedDate, type: selectedDay, exercisesCompleted: Object.keys(currentWorkout).length }]);
    setCurrentWorkout({});
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setActiveTab('dashboard');
  };

  const deleteHistoryEntry = (exerciseId, dateToDelete) => {
    const updatedExercises = { ...exercises };
    updatedExercises[exerciseId] = {
      ...updatedExercises[exerciseId],
      history: updatedExercises[exerciseId].history.filter(entry => entry.date !== dateToDelete)
    };
    
    // Update lastWeight and lastReps based on most recent remaining entry
    if (updatedExercises[exerciseId].history.length > 0) {
      const lastEntry = updatedExercises[exerciseId].history[updatedExercises[exerciseId].history.length - 1];
      const bestSet = lastEntry.sets.reduce((best, set) => 
        set.weight * set.reps > best.weight * best.reps ? set : best
      );
      updatedExercises[exerciseId].lastWeight = bestSet.weight;
      updatedExercises[exerciseId].lastReps = bestSet.reps;
    }
    
    setExercises(updatedExercises);
  };

  const updateHistoryEntry = (exerciseId, dateToUpdate, setIndex, newWeight, newReps) => {
    const updatedExercises = { ...exercises };
    updatedExercises[exerciseId] = {
      ...updatedExercises[exerciseId],
      history: updatedExercises[exerciseId].history.map(entry => {
        if (entry.date === dateToUpdate) {
          const newSets = [...entry.sets];
          newSets[setIndex] = { weight: newWeight, reps: newReps };
          return { ...entry, sets: newSets };
        }
        return entry;
      })
    };
    
    // Update lastWeight and lastReps if this is the most recent entry
    const lastEntry = updatedExercises[exerciseId].history[updatedExercises[exerciseId].history.length - 1];
    if (lastEntry.date === dateToUpdate) {
      const bestSet = lastEntry.sets.reduce((best, set) => 
        set.weight * set.reps > best.weight * best.reps ? set : best
      );
      updatedExercises[exerciseId].lastWeight = bestSet.weight;
      updatedExercises[exerciseId].lastReps = bestSet.reps;
    }
    
    setExercises(updatedExercises);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0604',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
      color: '#f5f1ed'
    }}>
      {/* Glowy gradient background */}
      <div style={{
        position: 'fixed',
        top: '-20%',
        left: '-10%',
        width: '120%',
        height: '140%',
        background: 'radial-gradient(circle at 30% 20%, rgba(180, 100, 50, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(120, 60, 30, 0.3) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(80, 40, 20, 0.25) 0%, transparent 40%)',
        filter: 'blur(60px)',
        opacity: 0.6,
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        .workout-container {
          animation: fadeIn 0.8s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .stat-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideUp 0.8s ease;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }
        
        .exercise-card {
          transition: all 0.3s ease;
        }
        
        .exercise-card:hover {
          background: rgba(205, 160, 110, 0.05);
        }
        
        .tab-btn {
          transition: all 0.3s ease;
          position: relative;
        }
        
        .tab-btn::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #cda06e, transparent);
          transition: width 0.3s ease;
        }
        
        .tab-btn.active::after {
          width: 100%;
        }
        
        input[type="number"],
        input[type="date"] {
          background: rgba(205, 160, 110, 0.05);
          border: 1px solid rgba(205, 160, 110, 0.2);
          color: #f5f1ed;
          padding: 10px 14px;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s ease;
          font-weight: 300;
        }
        
        input[type="number"]:focus,
        input[type="date"]:focus {
          outline: none;
          border-color: #cda06e;
          background: rgba(205, 160, 110, 0.08);
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.7) sepia(0.3) saturate(2) hue-rotate(5deg);
          cursor: pointer;
        }
        
        .breathe {
          animation: breathe 4s infinite ease-in-out;
        }
        
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div className="header-container" style={{
        background: 'rgba(10, 6, 4, 0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(205, 160, 110, 0.1)',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <svg width="28" height="28" viewBox="0 0 100 100" style={{ animation: 'breathe 4s infinite ease-in-out' }}>
            <defs>
              <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff8c42" />
                <stop offset="100%" stopColor="#ff6b35" />
              </linearGradient>
            </defs>
            <path 
              d="M 50 50 
                 A 5 5 0 0 1 55 50
                 A 10 10 0 0 1 50 60
                 A 15 15 0 0 1 35 50
                 A 20 20 0 0 1 50 30
                 A 25 25 0 0 1 70 50
                 A 30 30 0 0 1 50 80
                 A 35 35 0 0 1 20 50" 
              fill="none" 
              stroke="url(#orangeGradient)" 
              strokeWidth="5" 
              strokeLinecap="round"
              opacity="0.95"
            />
          </svg>
          <h1 style={{ 
            margin: 0, 
            fontSize: '28px',
            fontWeight: 200,
            letterSpacing: '2px',
            color: '#f5f1ed'
          }}>
            Movement
          </h1>
        </div>
        
        {!gDriveConnected ? (
          <button
            onClick={connectGoogleDrive}
            disabled={isLoading}
            style={{
              background: gapiLoaded 
                ? 'linear-gradient(135deg, rgba(205, 160, 110, 0.15) 0%, rgba(205, 160, 110, 0.05) 100%)'
                : 'rgba(100, 100, 100, 0.1)',
              border: gapiLoaded 
                ? '1px solid rgba(205, 160, 110, 0.3)'
                : '1px solid rgba(100, 100, 100, 0.2)',
              padding: '10px 24px',
              borderRadius: '24px',
              color: gapiLoaded ? '#cda06e' : '#666',
              fontWeight: 400,
              cursor: isLoading ? 'wait' : (gapiLoaded ? 'pointer' : 'not-allowed'),
              fontSize: '13px',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              opacity: gapiLoaded ? 1 : 0.5
            }}
          >
            {isLoading ? 'Connecting...' : (gapiLoaded ? 'Sync Drive' : 'Loading API...')}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(205, 160, 110, 0.1)',
              border: '1px solid rgba(205, 160, 110, 0.3)',
              padding: '8px 18px',
              borderRadius: '24px',
              color: '#cda06e',
              fontWeight: 400,
              fontSize: '12px',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#cda06e',
                boxShadow: '0 0 8px rgba(205, 160, 110, 0.8)'
              }} />
              Synced
            </div>
            
            <button
              onClick={signOutGoogleDrive}
              style={{
                background: 'rgba(184, 125, 94, 0.08)',
                border: '1px solid rgba(184, 125, 94, 0.2)',
                padding: '8px 18px',
                borderRadius: '24px',
                color: '#b87d5e',
                fontWeight: 400,
                fontSize: '12px',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Sign Out
            </button>
          </div>
        )}

      </div>

      {/* Navigation */}
      <div className="nav-tabs-container" style={{
        display: 'flex',
        gap: '0',
        padding: '0 40px',
        background: 'rgba(10, 6, 4, 0.3)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(205, 160, 110, 0.05)',
        position: 'relative',
        zIndex: 100
      }}>
        {[
          { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { key: 'workout', label: 'Workout', icon: Dumbbell },
          { key: 'programs', label: 'Programs', icon: Layout },
          { key: 'manage', label: 'Manage', icon: Target }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`tab-btn ${activeTab === key ? 'active' : ''}`}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '18px 32px',
              color: activeTab === key ? '#d4a574' : '#6b5d52',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: activeTab === key ? 400 : 200,
              letterSpacing: '0.5px',
              textTransform: 'capitalize',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="workout-container" style={{ padding: '60px 40px', position: 'relative', zIndex: 1 }}>
        {activeTab === 'dashboard' && (
          <div style={{ animation: 'fadeIn 0.8s ease' }}>
            {/* Overview Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '60px'
            }}>
              <div className="stat-card" style={{
                background: 'rgba(205, 160, 110, 0.04)',
                border: '1px solid rgba(205, 160, 110, 0.15)',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#8b7566', fontWeight: 300 }}>
                    Total Sessions
                  </p>
                  <Activity size={20} color="#d4a574" strokeWidth={1} style={{ opacity: 0.6 }} />
                </div>
                <h2 style={{ margin: 0, fontSize: '56px', fontWeight: 200, color: '#d4a574', lineHeight: 1 }}>
                  {stats.totalWorkouts}
                </h2>
              </div>

              <div className="stat-card" style={{
                background: 'rgba(205, 160, 110, 0.04)',
                border: '1px solid rgba(205, 160, 110, 0.15)',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#8b7566', fontWeight: 300 }}>
                    Last 30 Days
                  </p>
                  <Calendar size={20} color="#d4a574" strokeWidth={1} style={{ opacity: 0.6 }} />
                </div>
                <h2 style={{ margin: 0, fontSize: '56px', fontWeight: 200, color: '#d4a574', lineHeight: 1 }}>
                  {stats.last30Days}
                </h2>
              </div>

              <div className="stat-card" style={{
                background: 'rgba(205, 160, 110, 0.04)',
                border: '1px solid rgba(205, 160, 110, 0.15)',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#8b7566', fontWeight: 300 }}>
                    Weekly Average
                  </p>
                  <TrendingUp size={20} color="#d4a574" strokeWidth={1} style={{ opacity: 0.6 }} />
                </div>
                <h2 style={{ margin: 0, fontSize: '56px', fontWeight: 200, color: '#d4a574', lineHeight: 1 }}>
                  {(stats.last30Days / 4.3).toFixed(1)}
                </h2>
              </div>
            </div>

            {/* Workouts by Type */}
            <div style={{
              background: 'rgba(10, 6, 4, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(205, 160, 110, 0.1)',
              borderRadius: '24px',
              padding: '40px',
              marginBottom: '60px'
            }}>
              <h3 style={{
                margin: '0 0 32px 0',
                fontSize: '15px',
                letterSpacing: '1px',
                color: '#d4a574',
                fontWeight: 200
              }}>
                Sessions by Type
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} style={{
                    background: 'rgba(205, 160, 110, 0.03)',
                    border: '1px solid rgba(205, 160, 110, 0.1)',
                    borderRadius: '20px',
                    padding: '24px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ fontSize: '36px', fontWeight: 200, color: '#d4a574', marginBottom: '8px' }}>
                      {count}
                    </div>
                    <div style={{ fontSize: '11px', letterSpacing: '1px', color: '#8b7566', fontWeight: 300 }}>
                      {type}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Body Part Progress */}
            <div style={{
              background: 'rgba(10, 6, 4, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(205, 160, 110, 0.1)',
              borderRadius: '24px',
              padding: '40px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '15px',
                  letterSpacing: '1px',
                  color: '#d4a574',
                  fontWeight: 200
                }}>
                  Progress by Body Part
                </h3>
                <div style={{
                  fontSize: '10px',
                  color: '#6b5d52',
                  background: 'rgba(205, 160, 110, 0.05)',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(205, 160, 110, 0.1)',
                  fontWeight: 200,
                  letterSpacing: '0.5px'
                }}>
                  % = Average weight increase
                </div>
              </div>
              <div style={{ display: 'grid', gap: '20px' }}>
                {bodyPartProgress.map(({ bodyPart, avgProgress, totalVolume, exercises: exCount }) => {
                  const iconSrc = getBodyPartIcon(bodyPart);
                  return (
                    <div key={bodyPart} style={{
                      background: 'rgba(205, 160, 110, 0.02)',
                      border: '1px solid rgba(205, 160, 110, 0.08)',
                      borderRadius: '20px',
                      padding: '24px',
                      display: 'grid',
                      gridTemplateColumns: '180px 1fr auto',
                      alignItems: 'center',
                      gap: '24px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'transparent',
                          border: '1px solid rgba(205, 160, 110, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <img 
                            src={iconSrc} 
                            alt={bodyPart}
                            style={{ 
                              width: '22px', 
                              height: '22px',
                              objectFit: 'contain',
                              display: 'block',
                              mixBlendMode: 'lighten'
                            }} 
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: '17px', fontWeight: 300, marginBottom: '4px', letterSpacing: '0.5px', color: '#f5f1ed' }}>
                            {bodyPart}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b5d52', fontWeight: 200 }}>
                            {exCount} exercises
                          </div>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6b5d52', marginBottom: '10px', fontWeight: 200 }}>
                          Volume: {totalVolume}kg
                        </div>
                        <div style={{
                          background: 'rgba(205, 160, 110, 0.1)',
                          borderRadius: '12px',
                          height: '6px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            background: 'linear-gradient(90deg, #d4a574 0%, #b88a5e 100%)',
                            height: '100%',
                            width: `${Math.min(100, Math.abs(avgProgress))}%`,
                            borderRadius: '12px',
                            transition: 'width 0.8s ease'
                          }} />
                        </div>
                      </div>
                      <div style={{
                        fontSize: '28px',
                        fontWeight: 200,
                        color: avgProgress >= 0 ? '#d4a574' : '#b87d5e',
                      }}>
                        {avgProgress >= 0 ? '+' : ''}{avgProgress}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workout' && (
          <div style={{ animation: 'fadeIn 0.8s ease' }}>
            {Object.keys(currentWorkout).length === 0 ? (
              <div>
                <div style={{ marginBottom: '48px' }}>
                  <h2 style={{
                    fontSize: '26px',
                    letterSpacing: '1px',
                    marginBottom: '20px',
                    color: '#d4a574',
                    fontWeight: 200
                  }}>
                    Begin Session
                  </h2>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div>
                      <label style={{ 
                        fontSize: '11px', 
                        color: '#8b8175', 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '10px',
                        letterSpacing: '1px',
                        fontWeight: 500
                      }}>
                        <Calendar size={12} strokeWidth={1.5} />
                        DATE
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        style={{
                          fontSize: '14px',
                          cursor: 'pointer',
                          width: '200px'
                        }}
                      />
                    </div>
                    <button
                      onClick={() => setViewingHistory(!viewingHistory)}
                      style={{
                        marginTop: '24px',
                        background: 'rgba(205, 160, 110, 0.08)',
                        border: '1px solid rgba(205, 160, 110, 0.2)',
                        padding: '12px 24px',
                        borderRadius: '24px',
                        color: '#cda06e',
                        fontWeight: 400,
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontFamily: "'Inter', sans-serif",
                        letterSpacing: '0.5px',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Clock size={14} strokeWidth={1.5} />
                      {viewingHistory ? 'New Session' : 'View History'}
                    </button>
                  </div>
                </div>

                {!viewingHistory ? (
                  <div className="workout-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                    {Object.keys(programs).map(day => {
                      const workoutIcon = getWorkoutIcon(day);
                      const isImage = isWorkoutIconImage(day);
                      return (
                        <button
                          key={day}
                          onClick={() => {
                            setSelectedDay(day);
                            startWorkout(day);
                          }}
                          style={{
                            background: 'rgba(205, 160, 110, 0.04)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(205, 160, 110, 0.15)',
                            borderRadius: '24px',
                            padding: '36px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(205, 160, 110, 0.15)';
                            e.currentTarget.style.background = 'rgba(205, 160, 110, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.background = 'rgba(205, 160, 110, 0.04)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: 'transparent',
                              border: '1px solid rgba(205, 160, 110, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {isImage ? (
                                <img 
                                  src={workoutIcon} 
                                  alt={day}
                                  style={{ 
                                    width: '24px', 
                                    height: '24px',
                                    objectFit: 'contain',
                                    display: 'block',
                                    mixBlendMode: 'lighten'
                                  }} 
                                />
                              ) : (
                                React.createElement(workoutIcon, { size: 20, color: "#d4a574", strokeWidth: 1.5 })
                              )}
                            </div>
                            <div style={{
                              fontSize: '32px',
                              fontWeight: 200,
                              color: '#d4a574',
                              letterSpacing: '0.5px',
                              lineHeight: '1.2',
                              paddingTop: '2px'
                            }}>
                              {day}
                            </div>
                          </div>
                          <div style={{ color: '#6b5d52', fontSize: '12px', marginBottom: '20px', fontWeight: 200, marginLeft: '52px' }}>
                            {programs[day].length} exercises
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginLeft: '52px' }}>
                            {programs[day].map(exId => (
                              <div key={exId} style={{
                                fontSize: '13px',
                                color: '#8b7566',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: 200
                              }}>
                                <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#d4a574', opacity: 0.6 }} />
                                {exercises[exId].name}
                              </div>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <h3 style={{
                      fontSize: '22px',
                      letterSpacing: '1px',
                      marginBottom: '32px',
                      color: '#d4a574',
                      fontWeight: 200
                    }}>
                      History
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {Object.values(exercises).map(exercise => (
                        <div key={exercise.id} style={{
                          background: 'rgba(10, 6, 4, 0.4)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(205, 160, 110, 0.1)',
                          borderRadius: '20px',
                          padding: '28px'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                          }}>
                            <h4 style={{
                              margin: 0,
                              fontSize: '18px',
                              letterSpacing: '0.3px',
                              fontWeight: 300,
                              color: '#f5f1ed'
                            }}>
                              {exercise.name}
                            </h4>
                            <div style={{
                              background: 'rgba(205, 160, 110, 0.1)',
                              padding: '6px 12px',
                              borderRadius: '10px',
                              fontSize: '10px',
                              letterSpacing: '1px',
                              color: '#d4a574',
                              fontWeight: 300
                            }}>
                              {exercise.bodyPart}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {exercise.history.slice().reverse().map((entry, idx) => (
                              <div key={idx} style={{
                                background: 'rgba(205, 160, 110, 0.02)',
                                padding: '14px 16px',
                                borderRadius: '12px'
                              }}>
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: '#8b8175', 
                                  fontWeight: 300,
                                  marginBottom: '10px'
                                }}>
                                  {new Date(entry.date).toLocaleDateString()}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                                  {entry.sets.map((set, setIdx) => (
                                    <span key={setIdx} style={{ 
                                      background: 'rgba(205, 160, 110, 0.1)', 
                                      padding: '4px 10px', 
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      color: '#f5f1ed',
                                      fontWeight: 300
                                    }}>
                                      {set.weight}kg × {set.reps}
                                    </span>
                                  ))}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => deleteHistoryEntry(exercise.id, entry.date)}
                                    style={{
                                      background: 'rgba(184, 125, 94, 0.08)',
                                      border: '1px solid rgba(184, 125, 94, 0.2)',
                                      padding: '6px 14px',
                                      borderRadius: '8px',
                                      color: '#b87d5e',
                                      cursor: 'pointer',
                                      fontSize: '11px',
                                      fontFamily: "'Inter', sans-serif",
                                      fontWeight: 400,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    <X size={11} strokeWidth={1.5} />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '40px'
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '26px',
                      letterSpacing: '0.5px',
                      margin: '0 0 10px 0',
                      color: '#d4a574',
                      fontWeight: 200
                    }}>
                      {selectedDay}
                    </h2>
                    <div style={{ fontSize: '13px', color: '#6b5d52', fontWeight: 200 }}>
                      {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => setCurrentWorkout({})}
                      style={{
                        background: 'rgba(184, 125, 94, 0.1)',
                        border: '1px solid rgba(184, 125, 94, 0.2)',
                        padding: '12px 24px',
                        borderRadius: '24px',
                        color: '#b87d5e',
                        fontWeight: 400,
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontFamily: "'Inter', sans-serif",
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <X size={14} strokeWidth={1.5} />
                      Cancel
                    </button>
                    <button
                      onClick={saveWorkout}
                      style={{
                        background: 'linear-gradient(135deg, rgba(205, 160, 110, 0.2) 0%, rgba(205, 160, 110, 0.1) 100%)',
                        border: '1px solid rgba(205, 160, 110, 0.3)',
                        padding: '12px 28px',
                        borderRadius: '24px',
                        color: '#cda06e',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontFamily: "'Inter', sans-serif",
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Save size={14} strokeWidth={1.5} />
                      Save Session
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {Object.keys(currentWorkout).length === 0 ? (
                    <div style={{
                      background: 'rgba(205, 160, 110, 0.05)',
                      border: '2px dashed rgba(205, 160, 110, 0.2)',
                      borderRadius: '24px',
                      padding: '48px',
                      textAlign: 'center'
                    }}>
                      <h3 style={{ color: '#d4a574', fontSize: '20px', marginBottom: '16px', fontWeight: 300 }}>
                        No Exercises in This Program
                      </h3>
                      <p style={{ color: '#8b7566', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                        This workout program doesn't have any exercises yet.
                        <br />
                        Go to the Programs tab to add exercises to {selectedDay}.
                      </p>
                      <button
                        onClick={() => {
                          setActiveTab('programs');
                          setCurrentWorkout({});
                        }}
                        style={{
                          background: 'rgba(205, 160, 110, 0.15)',
                          border: '1px solid rgba(205, 160, 110, 0.3)',
                          padding: '12px 24px',
                          borderRadius: '16px',
                          color: '#cda06e',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 400
                        }}
                      >
                        Go to Programs →
                      </button>
                    </div>
                  ) : (
                    <>
                      {Object.entries(currentWorkout).map(([exerciseId, data]) => {
                    const exercise = exercises[exerciseId];
                    if (!exercise) return null; // Skip if exercise doesn't exist
                    
                    return (
                      <div key={exerciseId} className="exercise-card" style={{
                        background: 'rgba(10, 6, 4, 0.4)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(205, 160, 110, 0.1)',
                        borderRadius: '24px',
                        padding: '28px'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '24px'
                        }}>
                          <div>
                            <h3 style={{
                              margin: '0 0 10px 0',
                              fontSize: '20px',
                              letterSpacing: '0.3px',
                              fontWeight: 300,
                              color: '#f5f1ed'
                            }}>
                              {exercise.name}
                            </h3>
                            <div style={{ fontSize: '12px', color: '#6b5d52', fontWeight: 200 }}>
                              {exercise.history.length > 0 ? (
                                <>
                                  Last workout ({new Date(exercise.history[exercise.history.length - 1].date).toLocaleDateString()}):
                                  <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {exercise.history[exercise.history.length - 1].sets.map((set, idx) => (
                                      <span key={idx} style={{ 
                                        background: 'rgba(205, 160, 110, 0.1)', 
                                        padding: '3px 8px', 
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        color: '#8b7566'
                                      }}>
                                        {set.weight}kg × {set.reps}
                                      </span>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                'No previous data'
                              )}
                            </div>
                          </div>
                          <div style={{
                            background: 'rgba(205, 160, 110, 0.1)',
                            padding: '6px 14px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            letterSpacing: '1px',
                            color: '#d4a574',
                            fontWeight: 300
                          }}>
                            {exercise.bodyPart}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {data.sets.map((set, idx) => (
                            <div key={idx} style={{
                              display: 'grid',
                              gridTemplateColumns: '80px 1fr 1fr auto',
                              gap: '14px',
                              alignItems: 'center',
                              background: 'rgba(205, 160, 110, 0.03)',
                              padding: '14px 16px',
                              borderRadius: '16px'
                            }}>
                              <div style={{
                                fontSize: '13px',
                                fontWeight: 200,
                                color: '#6b5d52',
                                letterSpacing: '0.3px'
                              }}>
                                Set {idx + 1}
                              </div>
                              <div>
                                <label style={{ fontSize: '10px', color: '#6b5d52', display: 'block', marginBottom: '6px', letterSpacing: '0.5px', fontWeight: 200 }}>
                                  WEIGHT (KG)
                                </label>
                                <input
                                  type="number"
                                  value={set.weight}
                                  onChange={(e) => updateSet(exerciseId, idx, 'weight', e.target.value)}
                                  step="0.5"
                                  style={{ width: '100%', fontSize: '14px', fontWeight: 200 }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '10px', color: '#6b5d52', display: 'block', marginBottom: '6px', letterSpacing: '0.5px', fontWeight: 200 }}>
                                  REPS
                                </label>
                                <input
                                  type="number"
                                  value={set.reps}
                                  onChange={(e) => updateSet(exerciseId, idx, 'reps', e.target.value)}
                                  style={{ width: '100%', fontSize: '14px', fontWeight: 200 }}
                                />
                              </div>
                              <div style={{
                                fontSize: '13px',
                                fontWeight: 200,
                                color: '#d4a574',
                                textAlign: 'right',
                                whiteSpace: 'nowrap'
                              }}>
                                {(set.weight * set.reps).toFixed(0)}kg
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => addSet(exerciseId)}
                          style={{
                            marginTop: '16px',
                            background: 'rgba(205, 160, 110, 0.05)',
                            border: '1px dashed rgba(205, 160, 110, 0.25)',
                            padding: '14px',
                            borderRadius: '16px',
                            color: '#d4a574',
                            fontWeight: 200,
                            cursor: 'pointer',
                            fontSize: '13px',
                            letterSpacing: '0.3px',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Plus size={14} strokeWidth={1.5} />
                          Add Set
                        </button>
                      </div>
                    );
                  })}
                  
                  {/* Add Exercise On-The-Fly */}
                  <div style={{
                    background: 'rgba(10, 6, 4, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(205, 160, 110, 0.1)',
                    borderRadius: '24px',
                    padding: '28px',
                    borderStyle: 'dashed'
                  }}>
                    <h3 style={{
                      margin: '0 0 20px 0',
                      fontSize: '18px',
                      letterSpacing: '0.3px',
                      fontWeight: 300,
                      color: '#d4a574'
                    }}>
                      Add Exercise to This Workout
                    </h3>
                    
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {/* Choose from existing */}
                      <div>
                        <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                          FROM YOUR EXERCISES
                        </label>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              const updated = {...currentWorkout};
                              updated[e.target.value] = { sets: [{ weight: exercises[e.target.value].lastWeight, reps: exercises[e.target.value].lastReps }] };
                              setCurrentWorkout(updated);
                              e.target.value = '';
                            }
                          }}
                          style={{
                            width: '100%',
                            background: 'rgba(205, 160, 110, 0.05)',
                            border: '1px solid rgba(205, 160, 110, 0.2)',
                            padding: '12px',
                            borderRadius: '12px',
                            color: '#f5f1ed',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">Select exercise...</option>
                          {Object.values(exercises)
                            .filter(ex => !currentWorkout[ex.id])
                            .map(ex => (
                              <option key={ex.id} value={ex.id}>
                                {ex.name} ({ex.bodyPart})
                              </option>
                            ))}
                        </select>
                      </div>
                      
                      {/* Quick add new exercise */}
                      <div style={{
                        borderTop: '1px solid rgba(205, 160, 110, 0.1)',
                        paddingTop: '16px'
                      }}>
                        <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                          OR QUICK ADD NEW EXERCISE
                        </label>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                          <input
                            type="text"
                            placeholder="Exercise name"
                            value={tempExercise.name}
                            onChange={(e) => setTempExercise({...tempExercise, name: e.target.value})}
                            style={{
                              background: 'rgba(205, 160, 110, 0.05)',
                              border: '1px solid rgba(205, 160, 110, 0.2)',
                              padding: '12px',
                              borderRadius: '12px',
                              color: '#f5f1ed',
                              fontSize: '14px'
                            }}
                          />
                          
                          <select
                            value={tempExercise.bodyPart}
                            onChange={(e) => setTempExercise({...tempExercise, bodyPart: e.target.value})}
                            style={{
                              background: 'rgba(205, 160, 110, 0.05)',
                              border: '1px solid rgba(205, 160, 110, 0.2)',
                              padding: '12px',
                              borderRadius: '12px',
                              color: '#f5f1ed',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Chest">Chest</option>
                            <option value="Back">Back</option>
                            <option value="Shoulders">Shoulders</option>
                            <option value="Biceps">Biceps</option>
                            <option value="Triceps">Triceps</option>
                            <option value="Legs">Legs</option>
                            <option value="Abs">Abs</option>
                            <option value="Cardio">Cardio</option>
                          </select>
                          
                          <input
                            type="number"
                            placeholder="Weight"
                            value={tempExercise.weight || ''}
                            onChange={(e) => setTempExercise({...tempExercise, weight: parseFloat(e.target.value) || 0})}
                            step="0.5"
                            style={{
                              background: 'rgba(205, 160, 110, 0.05)',
                              border: '1px solid rgba(205, 160, 110, 0.2)',
                              padding: '12px',
                              borderRadius: '12px',
                              color: '#f5f1ed',
                              fontSize: '14px'
                            }}
                          />
                          
                          <input
                            type="number"
                            placeholder="Reps"
                            value={tempExercise.reps || ''}
                            onChange={(e) => setTempExercise({...tempExercise, reps: parseInt(e.target.value) || 0})}
                            style={{
                              background: 'rgba(205, 160, 110, 0.05)',
                              border: '1px solid rgba(205, 160, 110, 0.2)',
                              padding: '12px',
                              borderRadius: '12px',
                              color: '#f5f1ed',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        
                        <button
                          onClick={() => {
                            if (tempExercise.name && tempExercise.weight && tempExercise.reps) {
                              // Create new exercise
                              const newId = tempExercise.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
                              const newExercise = {
                                id: newId,
                                name: tempExercise.name,
                                bodyPart: tempExercise.bodyPart,
                                lastWeight: tempExercise.weight,
                                lastReps: tempExercise.reps,
                                history: []
                              };
                              
                              // Add to exercises
                              setExercises({...exercises, [newId]: newExercise});
                              
                              // Add to current workout
                              const updated = {...currentWorkout};
                              updated[newId] = { sets: [{ weight: tempExercise.weight, reps: tempExercise.reps }] };
                              setCurrentWorkout(updated);
                              
                              // Reset form
                              setTempExercise({ name: '', bodyPart: 'Chest', weight: 0, reps: 0 });
                            }
                          }}
                          disabled={!tempExercise.name || !tempExercise.weight || !tempExercise.reps}
                          style={{
                            background: tempExercise.name && tempExercise.weight && tempExercise.reps 
                              ? 'rgba(205, 160, 110, 0.15)'
                              : 'rgba(100, 100, 100, 0.1)',
                            border: tempExercise.name && tempExercise.weight && tempExercise.reps
                              ? '1px solid rgba(205, 160, 110, 0.3)'
                              : '1px solid rgba(100, 100, 100, 0.2)',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            color: tempExercise.name && tempExercise.weight && tempExercise.reps ? '#cda06e' : '#666',
                            fontWeight: 400,
                            cursor: tempExercise.name && tempExercise.weight && tempExercise.reps ? 'pointer' : 'not-allowed',
                            fontSize: '13px',
                            letterSpacing: '0.3px',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <Plus size={14} strokeWidth={1.5} />
                          Add to Workout
                        </button>
                      </div>
                    </div>
                  </div>
                  </>
                )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'programs' && (
          <div style={{ animation: 'fadeIn 0.8s ease' }}>
            <h2 style={{
              fontSize: '26px',
              letterSpacing: '1px',
              marginBottom: '40px',
              color: '#d4a574',
              fontWeight: 200
            }}>
              Program Builder
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {Object.entries(programs).map(([programName, exerciseIds]) => (
                <div key={programName} style={{
                  background: 'rgba(10, 6, 4, 0.4)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(205, 160, 110, 0.15)',
                  borderRadius: '24px',
                  padding: '32px',
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    color: '#d4a574',
                    fontWeight: 300,
                    marginBottom: '24px',
                    letterSpacing: '0.5px'
                  }}>
                    {programName}
                  </h3>
                  
                  {/* Current exercises in program */}
                  <div style={{ marginBottom: '24px' }}>
                    {exerciseIds.length === 0 ? (
                      <div style={{ 
                        color: '#6b5d52', 
                        fontSize: '14px', 
                        fontStyle: 'italic',
                        padding: '16px',
                        background: 'rgba(205, 160, 110, 0.03)',
                        borderRadius: '12px'
                      }}>
                        No exercises in this program yet
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {exerciseIds.map(exerciseId => {
                          const exercise = exercises[exerciseId];
                          if (!exercise) return null;
                          
                          return (
                            <div key={exerciseId} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '16px',
                              background: 'rgba(205, 160, 110, 0.05)',
                              borderRadius: '12px',
                              border: '1px solid rgba(205, 160, 110, 0.1)'
                            }}>
                              <div>
                                <div style={{ fontSize: '15px', color: '#f5f1ed', fontWeight: 300 }}>
                                  {exercise.name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#8b7566', marginTop: '4px' }}>
                                  {exercise.bodyPart} • {exercise.lastWeight}kg × {exercise.lastReps}
                                </div>
                              </div>
                              
                              <button
                                onClick={() => {
                                  const updated = {...programs};
                                  updated[programName] = updated[programName].filter(id => id !== exerciseId);
                                  setPrograms(updated);
                                }}
                                style={{
                                  background: 'rgba(184, 125, 94, 0.1)',
                                  border: '1px solid rgba(184, 125, 94, 0.2)',
                                  padding: '8px 16px',
                                  borderRadius: '10px',
                                  color: '#b87d5e',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Add exercise dropdown */}
                  <div style={{
                    borderTop: '1px solid rgba(205, 160, 110, 0.1)',
                    paddingTop: '24px'
                  }}>
                    <label style={{ 
                      fontSize: '11px', 
                      color: '#8b7566', 
                      letterSpacing: '1px',
                      marginBottom: '12px',
                      display: 'block'
                    }}>
                      ADD EXERCISE
                    </label>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <select
                        onChange={(e) => {
                          if (e.target.value && !exerciseIds.includes(e.target.value)) {
                            const updated = {...programs};
                            updated[programName] = [...updated[programName], e.target.value];
                            setPrograms(updated);
                            e.target.value = '';
                          }
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(205, 160, 110, 0.05)',
                          border: '1px solid rgba(205, 160, 110, 0.2)',
                          padding: '12px',
                          borderRadius: '12px',
                          color: '#f5f1ed',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Select exercise to add...</option>
                        {Object.values(exercises)
                          .filter(ex => !exerciseIds.includes(ex.id))
                          .map(ex => (
                            <option key={ex.id} value={ex.id}>
                              {ex.name} ({ex.bodyPart})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
                </div>
                
                {/* Add New Exercise Button */}
                {editingExercise && editingExercise.isNew ? (
                  // Add New Exercise Form (inline at bottom)
                  <div style={{
                    background: 'rgba(10, 6, 4, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(205, 160, 110, 0.2)',
                    borderRadius: '24px',
                    padding: '32px',
                    marginTop: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '20px', color: '#d4a574', fontWeight: 300 }}>
                        Add New Exercise
                      </h3>
                      <button
                        onClick={() => setEditingExercise(null)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#8b7566',
                          cursor: 'pointer',
                          padding: '8px'
                        }}
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '20px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                          EXERCISE NAME
                        </label>
                        <input
                          type="text"
                          value={editingExercise.name}
                          onChange={(e) => setEditingExercise({...editingExercise, name: e.target.value})}
                          placeholder="e.g., Bench Press"
                          style={{
                            width: '100%',
                            background: 'rgba(10, 6, 4, 0.4)',
                            border: '1px solid rgba(205, 160, 110, 0.2)',
                            padding: '14px',
                            borderRadius: '12px',
                            color: '#f5f1ed',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                          BODY PART
                        </label>
                        <select
                          value={editingExercise.bodyPart}
                          onChange={(e) => setEditingExercise({...editingExercise, bodyPart: e.target.value})}
                          style={{
                            width: '100%',
                            background: 'rgba(10, 6, 4, 0.4)',
                            border: '1px solid rgba(205, 160, 110, 0.2)',
                            padding: '14px',
                            borderRadius: '12px',
                            color: '#f5f1ed',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Chest">Chest</option>
                          <option value="Back">Back</option>
                          <option value="Legs">Legs</option>
                          <option value="Shoulders">Shoulders</option>
                          <option value="Arms">Arms</option>
                          <option value="Core">Core</option>
                        </select>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                            LAST WEIGHT (LBS)
                          </label>
                          <input
                            type="number"
                            value={editingExercise.lastWeight}
                            onChange={(e) => setEditingExercise({...editingExercise, lastWeight: parseFloat(e.target.value) || 0})}
                            style={{
                              width: '100%',
                              background: 'rgba(10, 6, 4, 0.4)',
                              border: '1px solid rgba(205, 160, 110, 0.2)',
                              padding: '14px',
                              borderRadius: '12px',
                              color: '#f5f1ed',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        
                        <div>
                          <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                            LAST REPS
                          </label>
                          <input
                            type="number"
                            value={editingExercise.lastReps}
                            onChange={(e) => setEditingExercise({...editingExercise, lastReps: parseInt(e.target.value) || 0})}
                            style={{
                              width: '100%',
                              background: 'rgba(10, 6, 4, 0.4)',
                              border: '1px solid rgba(205, 160, 110, 0.2)',
                              padding: '14px',
                              borderRadius: '12px',
                              color: '#f5f1ed',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button
                          onClick={() => {
                            const updated = {...exercises};
                            
                            // Generate ID for new exercises
                            const exerciseId = editingExercise.id || editingExercise.name.toLowerCase().replace(/\s+/g, '-');
                            
                            // Save exercise with proper ID
                            updated[exerciseId] = {
                              ...editingExercise,
                              id: exerciseId
                            };
                            
                            setExercises(updated);
                            setEditingExercise(null);
                          }}
                          style={{
                            flex: 1,
                            background: 'rgba(205, 160, 110, 0.2)',
                            border: '1px solid rgba(205, 160, 110, 0.3)',
                            padding: '14px',
                            borderRadius: '16px',
                            color: '#d4a574',
                            fontWeight: 400,
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <Save size={16} />
                          Save Exercise
                        </button>
                        
                        <button
                          onClick={() => setEditingExercise(null)}
                          style={{
                            background: 'rgba(184, 125, 94, 0.1)',
                            border: '1px solid rgba(184, 125, 94, 0.2)',
                            padding: '14px 24px',
                            borderRadius: '16px',
                            color: '#b87d5e',
                            fontWeight: 400,
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingExercise({ 
                      id: '', 
                      name: '', 
                      bodyPart: 'Chest', 
                      lastWeight: 0, 
                      lastReps: 0, 
                      isNew: true 
                    })}
                    style={{
                      background: 'linear-gradient(135deg, rgba(205, 160, 110, 0.15) 0%, rgba(205, 160, 110, 0.05) 100%)',
                      border: '2px dashed rgba(205, 160, 110, 0.2)',
                      borderRadius: '20px',
                      padding: '28px',
                      color: '#cda06e',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: 400,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'all 0.3s ease',
                      marginTop: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(205, 160, 110, 0.2) 0%, rgba(205, 160, 110, 0.1) 100%)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(205, 160, 110, 0.15) 0%, rgba(205, 160, 110, 0.05) 100%)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Plus size={20} strokeWidth={2} />
                    Add New Exercise
                  </button>
                )}
          </div>
        )}


        {activeTab === 'manage' && (
          <div style={{ animation: 'fadeIn 0.8s ease' }}>
            <h2 style={{
              fontSize: '26px',
              letterSpacing: '1px',
              marginBottom: '40px',
              color: '#d4a574',
              fontWeight: 200
            }}>
              Manage Exercises
            </h2>
            
            {false ? (
              // Edit Form (for existing exercises only)
              <div style={{
                background: 'rgba(10, 6, 4, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(205, 160, 110, 0.2)',
                borderRadius: '24px',
                padding: '32px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '20px', color: '#d4a574', fontWeight: 300 }}>
                    {editingExercise.isNew ? 'Add New Exercise' : 'Edit Exercise'}
                  </h3>
                  <button
                    onClick={() => setEditingExercise(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#8b7566',
                      cursor: 'pointer',
                      padding: '8px'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                      EXERCISE NAME
                    </label>
                    <input
                      type="text"
                      value={editingExercise.name}
                      onChange={(e) => setEditingExercise({...editingExercise, name: e.target.value})}
                      style={{
                        width: '100%',
                        background: 'rgba(205, 160, 110, 0.05)',
                        border: '1px solid rgba(205, 160, 110, 0.2)',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#f5f1ed',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                      BODY PART
                    </label>
                    <select
                      value={editingExercise.bodyPart}
                      onChange={(e) => setEditingExercise({...editingExercise, bodyPart: e.target.value})}
                      style={{
                        width: '100%',
                        background: 'rgba(205, 160, 110, 0.05)',
                        border: '1px solid rgba(205, 160, 110, 0.2)',
                        padding: '12px',
                        borderRadius: '12px',
                        color: '#f5f1ed',
                        fontSize: '15px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Chest">Chest</option>
                      <option value="Back">Back</option>
                      <option value="Shoulders">Shoulders</option>
                      <option value="Biceps">Biceps</option>
                      <option value="Triceps">Triceps</option>
                      <option value="Legs">Legs</option>
                      <option value="Abs">Abs</option>
                      <option value="Cardio">Cardio</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                        LAST WEIGHT (KG)
                      </label>
                      <input
                        type="number"
                        value={editingExercise.lastWeight}
                        onChange={(e) => setEditingExercise({...editingExercise, lastWeight: parseFloat(e.target.value)})}
                        step="0.5"
                        style={{
                          width: '100%',
                          background: 'rgba(205, 160, 110, 0.05)',
                          border: '1px solid rgba(205, 160, 110, 0.2)',
                          padding: '12px',
                          borderRadius: '12px',
                          color: '#f5f1ed',
                          fontSize: '15px'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                        LAST REPS
                      </label>
                      <input
                        type="number"
                        value={editingExercise.lastReps}
                        onChange={(e) => setEditingExercise({...editingExercise, lastReps: parseInt(e.target.value)})}
                        style={{
                          width: '100%',
                          background: 'rgba(205, 160, 110, 0.05)',
                          border: '1px solid rgba(205, 160, 110, 0.2)',
                          padding: '12px',
                          borderRadius: '12px',
                          color: '#f5f1ed',
                          fontSize: '15px'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                      onClick={() => {
                        const updated = {...exercises};
                        
                        // Generate ID for new exercises
                        const exerciseId = editingExercise.id || editingExercise.name.toLowerCase().replace(/\s+/g, '-');
                        
                        // Save exercise with proper ID
                        updated[exerciseId] = {
                          ...editingExercise,
                          id: exerciseId
                        };
                        
                        setExercises(updated);
                        setEditingExercise(null);
                      }}
                      style={{
                        flex: 1,
                        background: 'rgba(205, 160, 110, 0.2)',
                        border: '1px solid rgba(205, 160, 110, 0.3)',
                        padding: '14px',
                        borderRadius: '16px',
                        color: '#d4a574',
                        fontWeight: 400,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                    
                    <button
                      onClick={() => setEditingExercise(null)}
                      style={{
                        background: 'rgba(184, 125, 94, 0.1)',
                        border: '1px solid rgba(184, 125, 94, 0.2)',
                        padding: '14px 24px',
                        borderRadius: '16px',
                        color: '#b87d5e',
                        fontWeight: 400,
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            
            {Object.keys(exercises).length === 0 ? (
              editingExercise && editingExercise.isNew ? (
                // Form for first exercise
                <div style={{
                  background: 'rgba(10, 6, 4, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(205, 160, 110, 0.2)',
                  borderRadius: '24px',
                  padding: '32px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', color: '#d4a574', fontWeight: 300 }}>
                      Add Your First Exercise
                    </h3>
                    <button
                      onClick={() => setEditingExercise(null)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#8b7566',
                        cursor: 'pointer',
                        padding: '8px'
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                        EXERCISE NAME
                      </label>
                      <input
                        type="text"
                        value={editingExercise.name}
                        onChange={(e) => setEditingExercise({...editingExercise, name: e.target.value})}
                        placeholder="e.g., Bench Press"
                        style={{
                          width: '100%',
                          background: 'rgba(10, 6, 4, 0.4)',
                          border: '1px solid rgba(205, 160, 110, 0.2)',
                          padding: '14px',
                          borderRadius: '12px',
                          color: '#f5f1ed',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                        BODY PART
                      </label>
                      <select
                        value={editingExercise.bodyPart}
                        onChange={(e) => setEditingExercise({...editingExercise, bodyPart: e.target.value})}
                        style={{
                          width: '100%',
                          background: 'rgba(10, 6, 4, 0.4)',
                          border: '1px solid rgba(205, 160, 110, 0.2)',
                          padding: '14px',
                          borderRadius: '12px',
                          color: '#f5f1ed',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Chest">Chest</option>
                        <option value="Back">Back</option>
                        <option value="Legs">Legs</option>
                        <option value="Shoulders">Shoulders</option>
                        <option value="Arms">Arms</option>
                        <option value="Core">Core</option>
                      </select>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                          LAST WEIGHT (LBS)
                        </label>
                        <input
                          type="number"
                          value={editingExercise.lastWeight}
                          onChange={(e) => setEditingExercise({...editingExercise, lastWeight: parseFloat(e.target.value) || 0})}
                          style={{
                            width: '100%',
                            background: 'rgba(10, 6, 4, 0.4)',
                            border: '1px solid rgba(205, 160, 110, 0.2)',
                            padding: '14px',
                            borderRadius: '12px',
                            color: '#f5f1ed',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                          LAST REPS
                        </label>
                        <input
                          type="number"
                          value={editingExercise.lastReps}
                          onChange={(e) => setEditingExercise({...editingExercise, lastReps: parseInt(e.target.value) || 0})}
                          style={{
                            width: '100%',
                            background: 'rgba(10, 6, 4, 0.4)',
                            border: '1px solid rgba(205, 160, 110, 0.2)',
                            padding: '14px',
                            borderRadius: '12px',
                            color: '#f5f1ed',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button
                        onClick={() => {
                          const updated = {...exercises};
                          const exerciseId = editingExercise.name.toLowerCase().replace(/\s+/g, '-');
                          updated[exerciseId] = {
                            ...editingExercise,
                            id: exerciseId
                          };
                          setExercises(updated);
                          setEditingExercise(null);
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(205, 160, 110, 0.2)',
                          border: '1px solid rgba(205, 160, 110, 0.3)',
                          padding: '14px',
                          borderRadius: '16px',
                          color: '#d4a574',
                          fontWeight: 400,
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <Save size={16} />
                        Save Exercise
                      </button>
                      
                      <button
                        onClick={() => setEditingExercise(null)}
                        style={{
                          background: 'rgba(184, 125, 94, 0.1)',
                          border: '1px solid rgba(184, 125, 94, 0.2)',
                          padding: '14px 24px',
                          borderRadius: '16px',
                          color: '#b87d5e',
                          fontWeight: 400,
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(205, 160, 110, 0.05)',
                  border: '2px dashed rgba(205, 160, 110, 0.2)',
                  borderRadius: '24px',
                  padding: '60px 40px',
                  textAlign: 'center'
                }}>
                  <Dumbbell size={48} strokeWidth={1} style={{ color: '#cda06e', opacity: 0.5, marginBottom: '24px' }} />
                  <h3 style={{ color: '#d4a574', fontSize: '24px', marginBottom: '16px', fontWeight: 300 }}>
                    No Exercises Yet
                  </h3>
                  <p style={{ color: '#8b7566', fontSize: '15px', lineHeight: '1.8', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                    You haven't created any exercises yet.<br />
                    Click below to add your first exercise and start building your workout library.
                  </p>
                  <button
                    onClick={() => setEditingExercise({ 
                      id: '', 
                      name: '', 
                      bodyPart: 'Chest', 
                      lastWeight: 0, 
                      lastReps: 0, 
                      isNew: true 
                    })}
                  style={{
                    background: 'linear-gradient(135deg, rgba(205, 160, 110, 0.2) 0%, rgba(205, 160, 110, 0.1) 100%)',
                    border: '1px solid rgba(205, 160, 110, 0.3)',
                    padding: '16px 32px',
                    borderRadius: '16px',
                    color: '#cda06e',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 400,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(205, 160, 110, 0.3) 0%, rgba(205, 160, 110, 0.15) 100%)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(205, 160, 110, 0.2) 0%, rgba(205, 160, 110, 0.1) 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Plus size={18} strokeWidth={2} />
                  Add Your First Exercise
                </button>
              </div>
            ))
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {Object.values(exercises).map(exercise => (
                    editingExercise && editingExercise.id === exercise.id && !editingExercise.isNew ? (
                      // Inline Edit Form
                      <div key={exercise.id} style={{
                        background: 'rgba(10, 6, 4, 0.6)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(205, 160, 110, 0.2)',
                        borderRadius: '24px',
                        padding: '28px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h4 style={{ fontSize: '18px', color: '#d4a574', fontWeight: 300, margin: 0 }}>
                            Edit Exercise
                          </h4>
                          <button
                            onClick={() => setEditingExercise(null)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#8b7566',
                              cursor: 'pointer',
                              padding: '8px'
                            }}
                          >
                            <X size={18} />
                          </button>
                        </div>
                        
                        <div style={{ display: 'grid', gap: '16px' }}>
                          <div>
                            <label style={{ fontSize: '10px', color: '#8b7566', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>
                              EXERCISE NAME
                            </label>
                            <input
                              type="text"
                              value={editingExercise.name}
                              onChange={(e) => setEditingExercise({...editingExercise, name: e.target.value})}
                              style={{
                                width: '100%',
                                background: 'rgba(10, 6, 4, 0.4)',
                                border: '1px solid rgba(205, 160, 110, 0.2)',
                                padding: '12px',
                                borderRadius: '12px',
                                color: '#f5f1ed',
                                fontSize: '14px'
                              }}
                            />
                          </div>
                          
                          <div>
                            <label style={{ fontSize: '10px', color: '#8b7566', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>
                              BODY PART
                            </label>
                            <select
                              value={editingExercise.bodyPart}
                              onChange={(e) => setEditingExercise({...editingExercise, bodyPart: e.target.value})}
                              style={{
                                width: '100%',
                                background: 'rgba(10, 6, 4, 0.4)',
                                border: '1px solid rgba(205, 160, 110, 0.2)',
                                padding: '12px',
                                borderRadius: '12px',
                                color: '#f5f1ed',
                                fontSize: '14px',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="Chest">Chest</option>
                              <option value="Back">Back</option>
                              <option value="Legs">Legs</option>
                              <option value="Shoulders">Shoulders</option>
                              <option value="Arms">Arms</option>
                              <option value="Core">Core</option>
                            </select>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                              <label style={{ fontSize: '10px', color: '#8b7566', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>
                                WEIGHT (KG)
                              </label>
                              <input
                                type="number"
                                value={editingExercise.lastWeight}
                                onChange={(e) => setEditingExercise({...editingExercise, lastWeight: parseFloat(e.target.value) || 0})}
                                style={{
                                  width: '100%',
                                  background: 'rgba(10, 6, 4, 0.4)',
                                  border: '1px solid rgba(205, 160, 110, 0.2)',
                                  padding: '12px',
                                  borderRadius: '12px',
                                  color: '#f5f1ed',
                                  fontSize: '14px'
                                }}
                              />
                            </div>
                            
                            <div>
                              <label style={{ fontSize: '10px', color: '#8b7566', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>
                                REPS
                              </label>
                              <input
                                type="number"
                                value={editingExercise.lastReps}
                                onChange={(e) => setEditingExercise({...editingExercise, lastReps: parseInt(e.target.value) || 0})}
                                style={{
                                  width: '100%',
                                  background: 'rgba(10, 6, 4, 0.4)',
                                  border: '1px solid rgba(205, 160, 110, 0.2)',
                                  padding: '12px',
                                  borderRadius: '12px',
                                  color: '#f5f1ed',
                                  fontSize: '14px'
                                }}
                              />
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                            <button
                              onClick={() => {
                                const updated = {...exercises};
                                const exerciseId = editingExercise.id || editingExercise.name.toLowerCase().replace(/\s+/g, '-');
                                updated[exerciseId] = {
                                  ...editingExercise,
                                  id: exerciseId
                                };
                                setExercises(updated);
                                setEditingExercise(null);
                              }}
                              style={{
                                flex: 1,
                                background: 'rgba(205, 160, 110, 0.2)',
                                border: '1px solid rgba(205, 160, 110, 0.3)',
                                padding: '12px',
                                borderRadius: '12px',
                                color: '#d4a574',
                                fontWeight: 400,
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                            >
                              <Save size={14} />
                              Save Changes
                            </button>
                            
                            <button
                              onClick={() => setEditingExercise(null)}
                              style={{
                                background: 'rgba(184, 125, 94, 0.1)',
                                border: '1px solid rgba(184, 125, 94, 0.2)',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                color: '#b87d5e',
                                fontWeight: 400,
                                fontSize: '13px',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div key={exercise.id} style={{
                  background: 'rgba(10, 6, 4, 0.4)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(205, 160, 110, 0.1)',
                  borderRadius: '20px',
                  padding: '24px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '18px',
                        letterSpacing: '0.3px',
                        fontWeight: 300,
                        color: '#f5f1ed'
                      }}>
                        {exercise.name}
                      </h4>
                      <div style={{
                        background: 'rgba(205, 160, 110, 0.1)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        letterSpacing: '1px',
                        color: '#d4a574',
                        fontWeight: 300
                      }}>
                        {exercise.bodyPart}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b5d52', fontWeight: 200 }}>
                      Current: {exercise.lastWeight}kg × {exercise.lastReps} | 
                      Used in {Object.entries(programs).filter(([_, exs]) => exs.includes(exercise.id)).map(([day]) => day).join(', ') || 'None'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setEditingExercise({...exercise})}
                      style={{
                        background: 'rgba(205, 160, 110, 0.08)',
                        border: '1px solid rgba(205, 160, 110, 0.2)',
                        padding: '10px 20px',
                        borderRadius: '14px',
                        color: '#d4a574',
                        fontWeight: 200,
                        cursor: 'pointer',
                        fontSize: '12px',
                        letterSpacing: '0.3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Edit2 size={13} strokeWidth={1.5} />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${exercise.name}"? This cannot be undone.`)) {
                          const updated = {...exercises};
                          delete updated[exercise.id];
                          setExercises(updated);
                          
                          // Remove from programs
                          const updatedPrograms = {...programs};
                          Object.keys(updatedPrograms).forEach(day => {
                            updatedPrograms[day] = updatedPrograms[day].filter(id => id !== exercise.id);
                          });
                          setPrograms(updatedPrograms);
                        }
                      }}
                      style={{
                        background: 'rgba(184, 125, 94, 0.08)',
                        border: '1px solid rgba(184, 125, 94, 0.2)',
                        padding: '10px 16px',
                        borderRadius: '14px',
                        color: '#b87d5e',
                        fontWeight: 200,
                        cursor: 'pointer',
                        fontSize: '12px',
                        letterSpacing: '0.3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <X size={13} strokeWidth={1.5} />
                      Delete
                    </button>
                  </div>
                </div>
              )))}
                </div>
                
                {/* Add New Exercise Button */}
                {editingExercise && editingExercise.isNew ? (
                  // Add New Exercise Form (inline at bottom)
                  <div style={{
                    background: 'rgba(10, 6, 4, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(205, 160, 110, 0.2)',
                    borderRadius: '24px',
                    padding: '32px',
                    marginTop: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '20px', color: '#d4a574', fontWeight: 300 }}>
                        Add New Exercise
                      </h3>
                      <button
                        onClick={() => setEditingExercise(null)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#8b7566',
                          cursor: 'pointer',
                          padding: '8px'
                        }}
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '20px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                          EXERCISE NAME
                        </label>
                        <input
                          type="text"
                          value={editingExercise.name}
                          onChange={(e) => setEditingExercise({...editingExercise, name: e.target.value})}
                          placeholder="e.g., Bench Press"
                          style={{
                            width: '100%',
                            background: 'rgba(10, 6, 4, 0.4)',
                            border: '1px solid rgba(205, 160, 110, 0.2)',
                            padding: '14px',
                            borderRadius: '12px',
                            color: '#f5f1ed',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                          BODY PART
                        </label>
                        <select
                          value={editingExercise.bodyPart}
                          onChange={(e) => setEditingExercise({...editingExercise, bodyPart: e.target.value})}
                          style={{
                            width: '100%',
                            background: 'rgba(10, 6, 4, 0.4)',
                            border: '1px solid rgba(205, 160, 110, 0.2)',
                            padding: '14px',
                            borderRadius: '12px',
                            color: '#f5f1ed',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Chest">Chest</option>
                          <option value="Back">Back</option>
                          <option value="Legs">Legs</option>
                          <option value="Shoulders">Shoulders</option>
                          <option value="Arms">Arms</option>
                          <option value="Core">Core</option>
                        </select>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                            LAST WEIGHT (LBS)
                          </label>
                          <input
                            type="number"
                            value={editingExercise.lastWeight}
                            onChange={(e) => setEditingExercise({...editingExercise, lastWeight: parseFloat(e.target.value) || 0})}
                            style={{
                              width: '100%',
                              background: 'rgba(10, 6, 4, 0.4)',
                              border: '1px solid rgba(205, 160, 110, 0.2)',
                              padding: '14px',
                              borderRadius: '12px',
                              color: '#f5f1ed',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        
                        <div>
                          <label style={{ fontSize: '11px', color: '#8b7566', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                            LAST REPS
                          </label>
                          <input
                            type="number"
                            value={editingExercise.lastReps}
                            onChange={(e) => setEditingExercise({...editingExercise, lastReps: parseInt(e.target.value) || 0})}
                            style={{
                              width: '100%',
                              background: 'rgba(10, 6, 4, 0.4)',
                              border: '1px solid rgba(205, 160, 110, 0.2)',
                              padding: '14px',
                              borderRadius: '12px',
                              color: '#f5f1ed',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button
                          onClick={() => {
                            const updated = {...exercises};
                            
                            // Generate ID for new exercises
                            const exerciseId = editingExercise.id || editingExercise.name.toLowerCase().replace(/\s+/g, '-');
                            
                            // Save exercise with proper ID
                            updated[exerciseId] = {
                              ...editingExercise,
                              id: exerciseId
                            };
                            
                            setExercises(updated);
                            setEditingExercise(null);
                          }}
                          style={{
                            flex: 1,
                            background: 'rgba(205, 160, 110, 0.2)',
                            border: '1px solid rgba(205, 160, 110, 0.3)',
                            padding: '14px',
                            borderRadius: '16px',
                            color: '#d4a574',
                            fontWeight: 400,
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <Save size={16} />
                          Save Exercise
                        </button>
                        
                        <button
                          onClick={() => setEditingExercise(null)}
                          style={{
                            background: 'rgba(184, 125, 94, 0.1)',
                            border: '1px solid rgba(184, 125, 94, 0.2)',
                            padding: '14px 24px',
                            borderRadius: '16px',
                            color: '#b87d5e',
                            fontWeight: 400,
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingExercise({ 
                      id: '', 
                      name: '', 
                      bodyPart: 'Chest', 
                      lastWeight: 0, 
                      lastReps: 0, 
                      isNew: true 
                    })}
                    style={{
                      background: 'linear-gradient(135deg, rgba(205, 160, 110, 0.15) 0%, rgba(205, 160, 110, 0.05) 100%)',
                      border: '2px dashed rgba(205, 160, 110, 0.2)',
                      borderRadius: '20px',
                      padding: '28px',
                      color: '#cda06e',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: 400,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'all 0.3s ease',
                      marginTop: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(205, 160, 110, 0.2) 0%, rgba(205, 160, 110, 0.1) 100%)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(205, 160, 110, 0.15) 0%, rgba(205, 160, 110, 0.05) 100%)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Plus size={20} strokeWidth={2} />
                    Add New Exercise
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutTracker;
