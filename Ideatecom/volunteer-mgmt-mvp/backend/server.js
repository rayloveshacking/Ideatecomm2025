const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory data storage (will be replaced with PostgreSQL in production)
let volunteers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'cycling-buddy',
    passionIndex: 75,
    commitmentPreferences: 'Weekends, mornings',
    skills: ['Biking', 'Communication'],
    assignedActivityId: null,
    hoursContributed: 24,
    consistency: 0.85,
    satisfaction: 4.2
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'mechanic',
    passionIndex: 8,
    commitmentPreferences: 'Weekdays, afternoons',
    skills: ['Bike repair', 'Maintenance'],
    assignedActivityId: null,
    hoursContributed: 42,
    consistency: 0.92,
    satisfaction: 4.7
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'logistics-support',
    passionIndex: 65,
    commitmentPreferences: 'Weekends, all day',
    skills: ['Event coordination', 'Setup'],
    assignedActivityId: null,
    hoursContributed: 18,
    consistency: 0.78,
    satisfaction: 3.9
  },
  {
    id: '4',
    name: 'Priya Chen',
    email: 'priya@example.com',
    role: 'cycling-buddy',
    passionIndex: 82,
    commitmentPreferences: 'Weekends, early mornings',
    skills: ['Active listening', 'Cycling', 'Sensory support'],
    assignedActivityId: null,
    hoursContributed: 36,
    consistency: 0.9,
    satisfaction: 4.9
  },
  {
    id: 'demo-buddy',
    name: 'Alex Martinez',
    email: 'alex.martinez@example.com',
    role: 'cycling-buddy',
    passionIndex: 95,
    commitmentPreferences: 'Flexible, all days',
    skills: ['ASD Support', 'Sensory Awareness', 'Patient Communication', 'Cycling'],
    assignedActivityId: null,
    hoursContributed: 120,
    consistency: 0.98,
    satisfaction: 5.0
  }
];

let activities = [
  {
    id: '101',
    name: 'Sunday Community Ride',
    date: '2025-06-01',
    roleNeeded: 'cycling-buddy',
    requiredVolunteers: 5,
    assignedVolunteerIds: [],
    description: 'Guided ride through the park for seniors'
  },
  {
    id: '102',
    name: 'Bike Maintenance Workshop',
    date: '2025-06-05',
    roleNeeded: 'mechanic',
    requiredVolunteers: 3,
    assignedVolunteerIds: [],
    description: 'Teaching basic bike maintenance skills'
  },
  {
    id: '103',
    name: 'Summer Festival Support',
    date: '2025-06-10',
    roleNeeded: 'logistics-support',
    requiredVolunteers: 8,
    assignedVolunteerIds: [],
    description: 'Helping with setup and coordination for the summer festival'
  }
];

let appraisals = [
  {
    id: '201',
    volunteerId: '1',
    activityId: '101',
    passionIndexEffect: 5,
    comment: 'Great team spirit, very supportive of seniors',
    timestamp: '2025-05-25T10:30:00Z'
  }
];

// Story Wall - Transformation stories from volunteers and participants
let stories = [
  {
    id: 's1',
    authorId: '1',
    authorName: 'John Doe',
    authorType: 'volunteer',
    title: 'Finding Joy in Every Pedal',
    content: 'Working with Sarah, a young woman on the autism spectrum, changed my perspective on communication. Her attention to detail and focus inspired me to become a better listener.',
    participantName: 'Sarah M.',
    tags: ['communication', 'inspiration', 'growth'],
    reactions: { hearts: 12, inspired: 8 },
    timestamp: '2025-09-15T14:30:00Z',
    featured: true
  }
];

// Buddy Matching Profiles - Extended volunteer/participant profiles for matching
let matchingProfiles = [
  {
    id: 'mp1',
    userId: '1',
    userType: 'volunteer',
    personalityTraits: {
      patience: 9,
      structure: 7,
      flexibility: 8,
      enthusiasm: 8
    },
    communicationStyle: 'visual-supports',
    sensoryPreferences: {
      noise: 'low',
      touch: 'moderate',
      visualStimulation: 'high'
    },
    experience: ['ASD', 'sensory-processing'],
    availability: ['weekends', 'mornings'],
    languages: ['English', 'ASL-basic']
  },
  {
    id: 'mp2',
    userId: '4',
    userType: 'volunteer',
    personalityTraits: {
      patience: 9,
      structure: 8,
      flexibility: 7,
      enthusiasm: 9
    },
    communicationStyle: 'visual-supports',
    sensoryPreferences: {
      noise: 'low',
      touch: 'low',
      visualStimulation: 'moderate'
    },
    experience: ['ASD', 'sensory-processing', 'trauma-informed'],
    availability: ['weekends', 'early-mornings'],
    languages: ['English', 'Mandarin']
  },
  {
    id: 'mp-demo-buddy',
    userId: 'demo-buddy',
    userType: 'volunteer',
    personalityTraits: {
      patience: 10,
      structure: 9,
      flexibility: 9,
      enthusiasm: 10
    },
    communicationStyle: 'visual-supports',
    sensoryPreferences: {
      noise: 'low',
      touch: 'low',
      visualStimulation: 'moderate'
    },
    experience: ['ASD', 'sensory-processing', 'trauma-informed', 'non-verbal-communication', 'de-escalation'],
    availability: ['weekends', 'weekdays', 'mornings', 'afternoons', 'evenings'],
    languages: ['English', 'Spanish', 'ASL-fluent']
  }
];

let participants = [
  {
    id: 'p1',
    name: 'Alex T.',
    ageGroup: '18-25',
    profileId: 'mpp1',
    assignedBuddyId: null,
    medicalNotes: 'Sensory sensitivities - prefers quiet environments',
    emergencyContact: { name: 'Parent/Guardian', phone: '***-***-****' }
  },
  {
    id: 'skyler-demo',
    name: 'Skyler Demo',
    ageGroup: '20-30',
    profileId: 'mpp-skyler',
    assignedBuddyId: null,
    medicalNotes: 'Demo account - sensory sensitivities, prefers structured activities',
    emergencyContact: { name: 'Demo Contact', phone: '555-DEMO' }
  }
];

let participantProfiles = [
  {
    id: 'mpp1',
    participantId: 'p1',
    communicationNeeds: 'visual-supports',
    sensoryProfile: {
      noise: 'sensitive',
      touch: 'sensitive',
      visualStimulation: 'moderate'
    },
    interests: ['cycling', 'nature', 'photography'],
    supportNeeds: ['structured-routine', 'clear-instructions', 'processing-time'],
    strengths: ['detail-oriented', 'reliable', 'creative']
  },
  {
    id: 'mpp-skyler',
    participantId: 'skyler-demo',
    communicationNeeds: 'visual-supports',
    sensoryProfile: {
      noise: 'sensitive',
      touch: 'moderate',
      visualStimulation: 'moderate'
    },
    interests: ['cycling', 'music', 'art', 'nature'],
    supportNeeds: ['structured-routine', 'clear-instructions', 'sensory-breaks'],
    strengths: ['creative', 'enthusiastic', 'friendly']
  }
];

// VR Training Modules
let vrModules = [
  {
    id: 'vr1',
    title: 'Communication Fundamentals with ASD Individuals',
    description: 'Learn effective communication strategies including visual supports, clear language, and processing time',
    duration: 20,
    scenarios: ['first-meeting', 'sensory-overload', 'routine-change'],
    difficulty: 'beginner',
    completionRate: 0.85
  },
  {
    id: 'vr2',
    title: 'Sensory Sensitivity Awareness',
    description: 'Experience common sensory challenges and learn accommodation strategies',
    duration: 15,
    scenarios: ['noise-sensitivity', 'tactile-sensitivity', 'visual-overload'],
    difficulty: 'beginner',
    completionRate: 0.78
  },
  {
    id: 'vr3',
    title: 'Emergency Response & De-escalation',
    description: 'Practice calm responses to meltdowns and emergency situations',
    duration: 25,
    scenarios: ['meltdown-response', 'medical-emergency', 'lost-participant'],
    difficulty: 'intermediate',
    completionRate: 0.72
  }
];

let vrProgress = [
  {
    id: 'vrp1',
    volunteerId: '1',
    moduleId: 'vr1',
    completed: true,
    score: 92,
    attempts: 1,
    completedAt: '2025-09-10T16:45:00Z'
  }
];

// Helper function to calculate passion index
const calculatePassionIndex = (volunteer) => {
 // Base score is 50
  let score = 50;
  
  // Add points based on hours contributed (1 point per 2 hours, capped at 20)
  score += Math.min(volunteer.hoursContributed / 2, 20);
  
  // Add points based on consistency (20 points * consistency rate)
 score += volunteer.consistency * 20;
  
  // Add points based on satisfaction (10 points * satisfaction / 5)
  score += (volunteer.satisfaction / 5) * 10;
  
  // Add appraisal points
  const volunteerAppraisals = appraisals.filter(a => a.volunteerId === volunteer.id);
  const appraisalPoints = volunteerAppraisals.reduce((sum, appraisal) => sum + appraisal.passionIndexEffect, 0);
  score += appraisalPoints;
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
};

// API Routes

// Get all volunteers
app.get('/api/volunteers', (req, res) => {
  // Calculate and update passion index for each volunteer
  const updatedVolunteers = volunteers.map(volunteer => {
    const updatedVolunteer = { ...volunteer };
    updatedVolunteer.passionIndex = calculatePassionIndex(updatedVolunteer);
    return updatedVolunteer;
  });
  
  res.json(updatedVolunteers);
});

// Get all participants
app.get('/api/participants', (req, res) => {
  res.json(participants.map(p => {
    const profile = participantProfiles.find(pp => pp.id === p.profileId);
    return {
      ...p,
      sensoryProfile: profile?.sensoryProfile,
      supportNeeds: profile?.supportNeeds,
      strengths: profile?.strengths
    };
  }));
});

// Get volunteer by ID
app.get('/api/volunteers/:id', (req, res) => {
  const volunteer = volunteers.find(v => v.id === req.params.id);
  if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  
 const updatedVolunteer = { ...volunteer };
  updatedVolunteer.passionIndex = calculatePassionIndex(updatedVolunteer);
  res.json(updatedVolunteer);
});

// Create new volunteer
app.post('/api/volunteers', (req, res) => {
  const { name, email, role, commitmentPreferences, skills } = req.body;
  
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }
  
 // Check if email already exists
  if (volunteers.some(v => v.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
 }
  
  const newVolunteer = {
    id: Math.random().toString(36).substr(2, 9), // Simple ID generation
    name,
    email,
    role,
    commitmentPreferences: commitmentPreferences || '',
    skills: skills || [],
    passionIndex: 50, // Start with base passion index
    assignedActivityId: null,
    hoursContributed: 0,
    consistency: 0.0,
    satisfaction: 0.0
  };
  
  volunteers.push(newVolunteer);
  res.status(201).json(newVolunteer);
});

// Update volunteer
app.put('/api/volunteers/:id', (req, res) => {
  const volunteerIndex = volunteers.findIndex(v => v.id === req.params.id);
  if (volunteerIndex === -1) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  
  const { name, email, role, commitmentPreferences, skills } = req.body;
  const updatedVolunteer = {
    ...volunteers[volunteerIndex],
    name: name || volunteers[volunteerIndex].name,
    email: email || volunteers[volunteerIndex].email,
    role: role || volunteers[volunteerIndex].role,
    commitmentPreferences: commitmentPreferences || volunteers[volunteerIndex].commitmentPreferences,
    skills: skills || volunteers[volunteerIndex].skills
  };
  
  volunteers[volunteerIndex] = updatedVolunteer;
  res.json(updatedVolunteer);
});

// Get all activities
app.get('/api/activities', (req, res) => {
  res.json(activities);
});

// Get activity by ID
app.get('/api/activities/:id', (req, res) => {
 const activity = activities.find(a => a.id === req.params.id);
  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
 }
  res.json(activity);
});

// Create new activity
app.post('/api/activities', (req, res) => {
  const { name, date, roleNeeded, requiredVolunteers, description } = req.body;
  
  if (!name || !date || !roleNeeded || !requiredVolunteers) {
    return res.status(400).json({ error: 'Name, date, role needed, and required volunteers are required' });
 }
  
  const newActivity = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    date,
    roleNeeded,
    requiredVolunteers,
    assignedVolunteerIds: [],
    description: description || ''
  };
  
  activities.push(newActivity);
  res.status(201).json(newActivity);
});

// Register volunteer for activity
app.post('/api/activities/:activityId/register/:volunteerId', (req, res) => {
  const activity = activities.find(a => a.id === req.params.activityId);
  const volunteer = volunteers.find(v => v.id === req.params.volunteerId);
  
  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
  }
  
  if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  
  // Check if volunteer is already assigned to an activity
 if (volunteers.some(v => v.id !== volunteer.id && v.assignedActivityId === activity.id)) {
    return res.status(400).json({ error: 'Volunteer already assigned to this activity' });
  }
  
  // Check if activity is full
  if (activity.assignedVolunteerIds.length >= activity.requiredVolunteers) {
    return res.status(400).json({ error: 'Activity is full' });
  }
  
  // Check if volunteer is already assigned to another activity
 if (volunteer.assignedActivityId) {
    return res.status(400).json({ error: 'Volunteer already assigned to another activity' });
  }
  
  // Register the volunteer
 activity.assignedVolunteerIds.push(volunteer.id);
  volunteer.assignedActivityId = activity.id;
  
  res.json({ message: 'Successfully registered for activity', activity, volunteer });
});

// Unregister volunteer from activity
app.post('/api/activities/:activityId/unregister/:volunteerId', (req, res) => {
  const activity = activities.find(a => a.id === req.params.activityId);
  const volunteer = volunteers.find(v => v.id === req.params.volunteerId);
  
  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
  }
  
 if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  
  // Unregister the volunteer
  activity.assignedVolunteerIds = activity.assignedVolunteerIds.filter(id => id !== volunteer.id);
  volunteer.assignedActivityId = null;
  
  res.json({ message: 'Successfully unregistered from activity', activity, volunteer });
});

// Get all appraisals
app.get('/api/appraisals', (req, res) => {
  res.json(appraisals);
});

// Create new appraisal
app.post('/api/appraisals', (req, res) => {
  const { volunteerId, activityId, passionIndexEffect, comment } = req.body;
  
  if (!volunteerId || !activityId || passionIndexEffect === undefined) {
    return res.status(400).json({ error: 'Volunteer ID, Activity ID, and Passion Index Effect are required' });
  }
  
  const newAppraisal = {
    id: Math.random().toString(36).substr(2, 9),
    volunteerId,
    activityId,
    passionIndexEffect,
    comment: comment || '',
    timestamp: new Date().toISOString()
  };
  
  appraisals.push(newAppraisal);
  
  // Update the volunteer's passion index based on the new appraisal
  const volunteer = volunteers.find(v => v.id === volunteerId);
  if (volunteer) {
    volunteer.passionIndex = calculatePassionIndex(volunteer);
  }
  
  res.status(201).json(newAppraisal);
});

// Get volunteer leaderboard (sorted by passion index)
app.get('/api/leaderboard', (req, res) => {
  const sortedVolunteers = [...volunteers]
    .map(volunteer => {
      const updatedVolunteer = { ...volunteer };
      updatedVolunteer.passionIndex = calculatePassionIndex(updatedVolunteer);
      return updatedVolunteer;
    })
    .sort((a, b) => b.passionIndex - a.passionIndex);
  
  res.json(sortedVolunteers);
});

// Get engagement metrics for a volunteer
app.get('/api/volunteers/:id/engagement', (req, res) => {
  const volunteer = volunteers.find(v => v.id === req.params.id);
  if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  
  const volunteerAppraisals = appraisals.filter(a => a.volunteerId === volunteer.id);
  const totalAppraisalEffect = volunteerAppraisals.reduce((sum, appraisal) => sum + appraisal.passionIndexEffect, 0);
  
  const engagementData = {
    hoursContributed: volunteer.hoursContributed,
    consistency: volunteer.consistency,
    satisfaction: volunteer.satisfaction,
    totalAppraisalEffect,
    passionIndex: calculatePassionIndex(volunteer)
  };
  
  res.json(engagementData);
});

// ==================== STORY WALL API ====================

// Get all stories (with optional filters)
app.get('/api/stories', (req, res) => {
  let filteredStories = [...stories];
  
  if (req.query.featured === 'true') {
    filteredStories = filteredStories.filter(s => s.featured);
  }
  
  if (req.query.tag) {
    filteredStories = filteredStories.filter(s => s.tags.includes(req.query.tag));
  }
  
  // Sort by timestamp, newest first
  filteredStories.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.json(filteredStories);
});

// Get story by ID
app.get('/api/stories/:id', (req, res) => {
  const story = stories.find(s => s.id === req.params.id);
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }
  res.json(story);
});

// Create new story
app.post('/api/stories', (req, res) => {
  const { authorId, authorName, authorType, title, content, participantName, tags } = req.body;
  
  if (!authorId || !title || !content) {
    return res.status(400).json({ error: 'Author ID, title, and content are required' });
  }
  
  const newStory = {
    id: 's' + Math.random().toString(36).substr(2, 9),
    authorId,
    authorName,
    authorType: authorType || 'volunteer',
    title,
    content,
    participantName: participantName || '',
    tags: tags || [],
    reactions: { hearts: 0, inspired: 0 },
    timestamp: new Date().toISOString(),
    featured: false
  };
  
  stories.push(newStory);
  res.status(201).json(newStory);
});

// Add reaction to story
app.post('/api/stories/:id/react', (req, res) => {
  const { reactionType } = req.body;
  const story = stories.find(s => s.id === req.params.id);
  
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }
  
  if (!['hearts', 'inspired'].includes(reactionType)) {
    return res.status(400).json({ error: 'Invalid reaction type' });
  }
  
  story.reactions[reactionType]++;
  res.json(story);
});

// Recommendation engine - suggest activities for a volunteer
app.get('/api/volunteers/:id/recommendations', (req, res) => {
  const volunteer = volunteers.find(v => v.id === req.params.id);
  if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  
  // Find activities that:
  // 1. Need the volunteer's role
  // 2. Are not full
  // 3. Are in the future
  const today = new Date().toISOString().split('T')[0];
  const recommendations = activities
    .filter(activity => 
      activity.roleNeeded === volunteer.role && 
      activity.assignedVolunteerIds.length < activity.requiredVolunteers &&
      activity.date >= today &&
      !activity.assignedVolunteerIds.includes(volunteer.id)
    )
    .sort((a, b) => {
      // Sort by passion index (higher passion volunteers get priority for limited spots)
      // and then by date (soonest first)
      if (volunteer.passionIndex !== calculatePassionIndex(volunteers.find(v => v.id === volunteer.id))) {
        // If passion index has changed, recalculate
        const aVolunteers = volunteers.filter(v => v.role === a.roleNeeded);
        const bVolunteers = volunteers.filter(v => v.role === b.roleNeeded);
        const avgAPassion = aVolunteers.reduce((sum, v) => sum + calculatePassionIndex(v), 0) / aVolunteers.length || 0;
        const avgBPassion = bVolunteers.reduce((sum, v) => sum + calculatePassionIndex(v), 0) / bVolunteers.length || 0;
        return avgBPassion - avgAPassion || new Date(a.date) - new Date(b.date);
      }
      return new Date(a.date) - new Date(b.date);
    });
  
  res.json(recommendations);
});

// ==================== BUDDY MATCHING API ====================

// Calculate compatibility score breakdown between volunteer and participant
const calculateCompatibilityBreakdown = (volunteerProfile, participantProfile) => {
  const weights = {
    sensory: 0.4,
    communication: 0.3,
    personality: 0.2,
    experience: 0.1
  };

  const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
  const safeLower = (value) => (typeof value === 'string' ? value.toLowerCase() : '');

  // Communication style compatibility
  const volunteerComm = safeLower(volunteerProfile.communicationStyle);
  const participantComm = safeLower(participantProfile.communicationNeeds);
  let communicationScore = 0.5;
  if (volunteerComm && participantComm) {
    if (volunteerComm === participantComm) {
      communicationScore = 1;
    } else if (volunteerComm.includes('visual') && participantComm.includes('visual')) {
      communicationScore = 0.9;
    } else if (volunteerComm.includes('verbal') && participantComm.includes('verbal')) {
      communicationScore = 0.75;
    } else {
      communicationScore = 0.45;
    }
  }

  // Sensory compatibility across noise, touch, and visuals
  const volunteerSensory = volunteerProfile.sensoryPreferences || {};
  const participantSensory = participantProfile.sensoryProfile || {};
  const scoreFromDifference = (volValue, participantValue, volunteerScale, participantScale) => {
    if (!volValue || !participantValue) {
      return 0.5;
    }
    const vIndex = volunteerScale.indexOf(safeLower(volValue));
    const pIndex = participantScale.indexOf(safeLower(participantValue));
    if (vIndex === -1 || pIndex === -1) {
      return 0.5;
    }
    const diff = Math.abs(vIndex - pIndex);
    if (diff === 0) return 1;
    if (diff === 1) return 0.75;
    if (diff === 2) return 0.5;
    return 0.4;
  };

  const noiseScore = scoreFromDifference(
    volunteerSensory.noise,
    participantSensory.noise,
    ['low', 'moderate', 'high'],
    ['sensitive', 'moderate', 'comfortable']
  );
  const touchScore = scoreFromDifference(
    volunteerSensory.touch,
    participantSensory.touch,
    ['low', 'moderate', 'high'],
    ['sensitive', 'moderate', 'comfortable']
  );
  const visualScore = scoreFromDifference(
    volunteerSensory.visualStimulation,
    participantSensory.visualStimulation,
    ['low', 'moderate', 'high'],
    ['low', 'moderate', 'high']
  );
  const rawSensoryScore = clamp01(noiseScore * 0.4 + touchScore * 0.3 + visualScore * 0.3);

  // Personality alignment based on participant support needs
  const supportNeeds = participantProfile.supportNeeds || [];
  const traits = volunteerProfile.personalityTraits || {};
  const traitValue = (trait) => {
    const value = typeof traits[trait] === 'number' ? traits[trait] : 5;
    return clamp01(value / 10);
  };
  const targetedTraitScores = [];
  if (supportNeeds.includes('processing-time')) targetedTraitScores.push(traitValue('patience'));
  if (supportNeeds.includes('structured-routine')) targetedTraitScores.push(traitValue('structure'));
  if (supportNeeds.includes('clear-instructions')) targetedTraitScores.push(traitValue('structure'));
  if (supportNeeds.includes('flexible-support')) targetedTraitScores.push(traitValue('flexibility'));

  const defaultTraitScores = ['patience', 'structure', 'flexibility'].map(traitValue);
  const rawPersonalityScore = clamp01(
    (targetedTraitScores.length
      ? targetedTraitScores.reduce((sum, value) => sum + value, 0) / targetedTraitScores.length
      : defaultTraitScores.reduce((sum, value) => sum + value, 0) / defaultTraitScores.length)
  );

  // Experience with ASD or related needs
  const experiences = Array.isArray(volunteerProfile.experience)
    ? volunteerProfile.experience.map((item) => safeLower(item))
    : [];
  let rawExperienceScore = 0.3;
  if (experiences.includes('asd')) {
    rawExperienceScore = 1;
  } else if (experiences.includes('sensory-processing')) {
    rawExperienceScore = 0.8;
  } else if (experiences.length > 0) {
    rawExperienceScore = 0.6;
  }
  rawExperienceScore = clamp01(rawExperienceScore);

  const overall = clamp01(
    rawSensoryScore * weights.sensory +
    communicationScore * weights.communication +
    rawPersonalityScore * weights.personality +
    rawExperienceScore * weights.experience
  );

  return {
    overall: Number(overall.toFixed(2)),
    sensory: Number(rawSensoryScore.toFixed(2)),
    communication: Number(communicationScore.toFixed(2)),
    personality: Number(rawPersonalityScore.toFixed(2)),
    experience: Number(rawExperienceScore.toFixed(2))
  };
};

// Get matching profile for volunteer/participant
app.get('/api/matching-profiles/:userId', (req, res) => {
  const profile = matchingProfiles.find(p => p.userId === req.params.userId);
  if (!profile) {
    return res.status(404).json({ error: 'Matching profile not found' });
  }
  res.json(profile);
});

// Create/update matching profile
app.post('/api/matching-profiles', (req, res) => {
  const { userId, userType, personalityTraits, communicationStyle, sensoryPreferences, experience, availability, languages } = req.body;
  
  if (!userId || !userType) {
    return res.status(400).json({ error: 'User ID and user type are required' });
  }
  
  const existingIndex = matchingProfiles.findIndex(p => p.userId === userId);
  
  const profile = {
    id: existingIndex >= 0 ? matchingProfiles[existingIndex].id : 'mp' + Math.random().toString(36).substr(2, 9),
    userId,
    userType,
    personalityTraits: personalityTraits || {},
    communicationStyle: communicationStyle || '',
    sensoryPreferences: sensoryPreferences || {},
    experience: experience || [],
    availability: availability || [],
    languages: languages || []
  };
  
  if (existingIndex >= 0) {
    matchingProfiles[existingIndex] = profile;
  } else {
    matchingProfiles.push(profile);
  }
  
  res.status(existingIndex >= 0 ? 200 : 201).json(profile);
});

// Get participant profiles
app.get('/api/participants', (req, res) => {
  res.json(participants);
});

// Get participant profile with matching data
app.get('/api/participants/:id/profile', (req, res) => {
  const participant = participants.find(p => p.id === req.params.id);
  if (!participant) {
    return res.status(404).json({ error: 'Participant not found' });
  }
  
  const profile = participantProfiles.find(p => p.id === participant.profileId);
  res.json({ ...participant, profile });
});

// Find best buddy matches for a participant
app.get('/api/participants/:id/matches', (req, res) => {
  const participant = participants.find(p => p.id === req.params.id);
  if (!participant) {
    return res.status(404).json({ error: 'Participant not found' });
  }
  
  const participantProfile = participantProfiles.find(p => p.id === participant.profileId);
  if (!participantProfile) {
    return res.status(404).json({ error: 'Participant profile not found' });
  }
  
  // Get all volunteer matching profiles
  const volunteerProfiles = matchingProfiles.filter(p => p.userType === 'volunteer');
  
  // Calculate compatibility scores
  let matches = volunteerProfiles
    .map(vProfile => {
      const volunteer = volunteers.find(v => v.id === vProfile.userId);
      if (!volunteer) {
        return null;
      }

      const score = calculateCompatibilityBreakdown(vProfile, participantProfile);
      const experiences = Array.isArray(vProfile.experience) ? vProfile.experience : [];

      return {
        volunteer: {
          id: volunteer.id,
          name: volunteer.name,
          email: volunteer.email,
          role: volunteer.role,
          commitmentPreferences: volunteer.commitmentPreferences,
          availability: vProfile.availability || [],
          languages: vProfile.languages || []
        },
        profile: {
          personalityTraits: vProfile.personalityTraits || {},
          sensoryPreferences: vProfile.sensoryPreferences || {},
          experience: experiences,
          communicationStyle: vProfile.communicationStyle || ''
        },
        score,
        available: !volunteer.assignedActivityId
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score.overall - a.score.overall);
  
  // For Skyler demo account, always ensure demo buddy is available
  if (participant.id === 'skyler-demo') {
    const demoBuddyVolunteer = volunteers.find(v => v.id === 'demo-buddy');
    const demoBuddyProfile = matchingProfiles.find(p => p.userId === 'demo-buddy');
    
    if (demoBuddyVolunteer && demoBuddyProfile) {
      // Check if demo buddy is already in matches
      const demoBuddyIndex = matches.findIndex(m => m.volunteer.id === 'demo-buddy');
      
      const demoBuddyMatch = {
        volunteer: {
          id: demoBuddyVolunteer.id,
          name: demoBuddyVolunteer.name,
          email: demoBuddyVolunteer.email,
          role: demoBuddyVolunteer.role,
          commitmentPreferences: demoBuddyVolunteer.commitmentPreferences,
          availability: demoBuddyProfile.availability || [],
          languages: demoBuddyProfile.languages || []
        },
        profile: {
          personalityTraits: demoBuddyProfile.personalityTraits || {},
          sensoryPreferences: demoBuddyProfile.sensoryPreferences || {},
          experience: Array.isArray(demoBuddyProfile.experience) ? demoBuddyProfile.experience : [],
          communicationStyle: demoBuddyProfile.communicationStyle || ''
        },
        score: { overall: 0.95, sensory: 0.95, communication: 0.98, personality: 0.92, experience: 0.98 },
        available: true,
        demo: true
      };
      
      if (demoBuddyIndex >= 0) {
        // Replace existing match with high-score version
        matches[demoBuddyIndex] = demoBuddyMatch;
      } else {
        // Add demo buddy to the top of the list
        matches.unshift(demoBuddyMatch);
      }
    }
  }
  
  // Fallback for when there are no matches at all
  if (matches.length === 0) {
    const fallbackVolunteer = volunteers.find(v => v.id === 'demo-buddy') || volunteers.find(v => v.id === '4') || {
      id: 'demo-buddy',
      name: 'Demo Buddy',
      email: 'demo.buddy@example.com',
      role: 'cycling-buddy',
      commitmentPreferences: 'Weekends, mornings',
      assignedActivityId: null
    };
    const fallbackProfile = matchingProfiles.find(p => p.userId === fallbackVolunteer.id) || {
      personalityTraits: { patience: 10, structure: 9, flexibility: 8, enthusiasm: 9 },
      sensoryPreferences: { noise: 'low', touch: 'low', visualStimulation: 'moderate' },
      experience: ['ASD', 'sensory-processing'],
      communicationStyle: 'visual-supports',
      availability: ['weekends'],
      languages: ['English']
    };

    matches = [{
      volunteer: {
        id: fallbackVolunteer.id,
        name: fallbackVolunteer.name,
        email: fallbackVolunteer.email,
        role: fallbackVolunteer.role,
        commitmentPreferences: fallbackVolunteer.commitmentPreferences || 'Flexible',
        availability: fallbackProfile.availability || ['weekends'],
        languages: fallbackProfile.languages || ['English']
      },
      profile: {
        personalityTraits: fallbackProfile.personalityTraits || {},
        sensoryPreferences: fallbackProfile.sensoryPreferences || {},
        experience: Array.isArray(fallbackProfile.experience) ? fallbackProfile.experience : [],
        communicationStyle: fallbackProfile.communicationStyle || 'visual-supports'
      },
      score: { overall: 0.95, sensory: 0.95, communication: 1, personality: 0.9, experience: 1 },
      available: true,
      demo: true
    }];
  }

  res.json(matches);
});

// Assign buddy to participant
app.post('/api/participants/:participantId/assign-buddy/:volunteerId', (req, res) => {
  const participant = participants.find(p => p.id === req.params.participantId);
  const volunteer = volunteers.find(v => v.id === req.params.volunteerId);
  
  if (!participant) {
    return res.status(404).json({ error: 'Participant not found' });
  }
  
  if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  
  participant.assignedBuddyId = volunteer.id;
  
  res.json({ message: 'Buddy assigned successfully', participant, volunteer });
});

// ==================== VR TRAINING API ====================

// Get all VR modules
app.get('/api/vr-modules', (req, res) => {
  res.json(vrModules);
});

// Get VR module by ID
app.get('/api/vr-modules/:id', (req, res) => {
  const module = vrModules.find(m => m.id === req.params.id);
  if (!module) {
    return res.status(404).json({ error: 'VR module not found' });
  }
  res.json(module);
});

// Get volunteer's VR training progress
app.get('/api/volunteers/:id/vr-progress', (req, res) => {
  const volunteer = volunteers.find(v => v.id === req.params.id);
  if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  
  const progress = vrProgress.filter(p => p.volunteerId === req.params.id);
  
  // Calculate overall completion percentage
  const completedModules = progress.filter(p => p.completed).length;
  const totalModules = vrModules.length;
  const completionPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  
  res.json({
    progress,
    completedModules,
    totalModules,
    completionPercentage
  });
});

// Record VR module completion
app.post('/api/vr-progress', (req, res) => {
  const { volunteerId, moduleId, completed, score } = req.body;
  
  if (!volunteerId || !moduleId) {
    return res.status(400).json({ error: 'Volunteer ID and module ID are required' });
  }
  
  const volunteer = volunteers.find(v => v.id === volunteerId);
  const module = vrModules.find(m => m.id === moduleId);
  
  if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }
  
  if (!module) {
    return res.status(404).json({ error: 'VR module not found' });
  }
  
  // Check if progress record exists
  const existingIndex = vrProgress.findIndex(p => 
    p.volunteerId === volunteerId && p.moduleId === moduleId
  );
  
  const progressRecord = {
    id: existingIndex >= 0 ? vrProgress[existingIndex].id : 'vrp' + Math.random().toString(36).substr(2, 9),
    volunteerId,
    moduleId,
    completed: completed || false,
    score: score || 0,
    attempts: existingIndex >= 0 ? vrProgress[existingIndex].attempts + 1 : 1,
    completedAt: completed ? new Date().toISOString() : null
  };
  
  if (existingIndex >= 0) {
    vrProgress[existingIndex] = progressRecord;
  } else {
    vrProgress.push(progressRecord);
  }
  
  res.status(existingIndex >= 0 ? 200 : 201).json(progressRecord);
});

// Serve static files from the frontend directory
const frontendSrcDir = path.join(__dirname, '../frontend/src');
const frontendPagesDir = path.join(frontendSrcDir, 'pages');
const frontendStyleDir = path.join(frontendSrcDir, 'style');

app.use(express.static(frontendPagesDir));
app.use('/style', express.static(frontendStyleDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPagesDir, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
