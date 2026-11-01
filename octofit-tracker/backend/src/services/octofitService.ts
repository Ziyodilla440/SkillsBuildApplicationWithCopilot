import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: any) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Invalid activity input'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input;

  if (!userId || !teamId || !type || minutes === undefined || minutes === null) {
    throw Object.assign(new Error('Missing required fields: userId, teamId, type, minutes'), { status: 400 });
  }

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(teamId)) {
    throw Object.assign(new Error('Invalid userId or teamId format'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.findById(userId),
    Team.findById(teamId),
  ]);

  if (!user || !team) {
    throw Object.assign(new Error('User or team not found'), { status: 404 });
  }

  const numMinutes = Number(minutes);
  if (isNaN(numMinutes) || numMinutes <= 0) {
    throw Object.assign(new Error('Minutes must be a valid positive number'), { status: 400 });
  }

  const points = numMinutes;

  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes: numMinutes,
    points,
    occurredAt: new Date(),
  });

  return activity;
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: any) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Invalid team input'), { status: 400 });
  }

  const { name, mascot, members } = input;

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw Object.assign(new Error('Team name is required'), { status: 400 });
  }

  const team = await Team.create({
    name: name.trim(),
    mascot: mascot ? String(mascot).trim() : 'Mona',
    members: Array.isArray(members) ? members : [],
  });

  return team;
}

export async function getLeaderboard() {
  const [teams, activities] = await Promise.all([
    Team.find().lean(),
    Activity.find().lean(),
  ]);

  const pointsByTeam = new Map<string, number>();
  for (const team of teams) {
    pointsByTeam.set(team._id.toString(), 0);
  }

  for (const activity of activities) {
    const teamId = activity.team ? activity.team.toString() : '';
    if (teamId && pointsByTeam.has(teamId)) {
      pointsByTeam.set(teamId, (pointsByTeam.get(teamId) || 0) + (activity.points || 0));
    }
  }

  const leaderboard = teams
    .map((team) => ({
      teamId: team._id.toString(),
      teamName: team.name,
      mascot: team.mascot,
      totalPoints: pointsByTeam.get(team._id.toString()) || 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return leaderboard;
}

export async function suggestWorkouts(userEmail: string) {
  if (!userEmail) {
    throw Object.assign(new Error('userEmail is required'), { status: 400 });
  }

  const decodedEmail = decodeURIComponent(userEmail);
  const user = await User.findOne({ email: decodedEmail });

  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const workouts = await Workout.find().lean();

  const userGoal = (user.fitnessGoal || '').toLowerCase();
  const activityType = (recentActivity?.type || '').toLowerCase();

  const matchingWorkouts = workouts.filter((w) => {
    const focus = (w.focus || '').toLowerCase();
    if (userGoal && focus === userGoal) return true;
    if (activityType && (focus === activityType || (activityType === 'run' && focus === 'endurance'))) return true;
    return false;
  });

  const candidates = matchingWorkouts.length > 0 ? matchingWorkouts : workouts;

  return candidates.map((workout) => {
    let reason = 'Recommended activity based on your fitness routine';
    if (recentActivity && user.fitnessGoal) {
      reason = `Matches your recent ${recentActivity.type} activity and ${user.fitnessGoal} fitness goal`;
    } else if (recentActivity) {
      reason = `Matches your recent ${recentActivity.type} activity`;
    } else if (user.fitnessGoal) {
      reason = `Matches your ${user.fitnessGoal} fitness goal`;
    }

    return {
      ...workout,
      reason,
    };
  });
}

export { User };
