export type { League } from "@/lib/types";

export const LEAGUES = [
  { id: "la-liga", name: "La Liga", country: "Spain", emoji: "🇪🇸" },
  { id: "liga-1-max", name: "Liga 1 Max", country: "Peru", emoji: "🇵🇪" },
  {
    id: "champions-league",
    name: "Champions League",
    country: "Europe",
    emoji: "🏆",
  },
  { id: "bundesliga", name: "Bundesliga", country: "Germany", emoji: "🇩🇪" },
  { id: "serie-a", name: "Serie A", country: "Italy", emoji: "🇮🇹" },
];

export type Match = {
  id: number;
  league: string;
  homeTeam: string;
  awayTeam: string;
  time: string;
  odds: { home: number; draw: number; away: number };
  homeLogo?: string;
  awayLogo?: string;
  localOptionId?: number;
  drawOptionId?: number;
  awayOptionId?: number;
};

export const MATCHES: Match[] = [
  {
    id: 1,
    league: "la-liga",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    time: "20:30",
    odds: { home: 1.85, draw: 3.6, away: 4.2 },
  },
  {
    id: 2,
    league: "la-liga",
    homeTeam: "Atlético Madrid",
    awayTeam: "Valencia",
    time: "18:00",
    odds: { home: 1.65, draw: 3.8, away: 5.0 },
  },
  {
    id: 3,
    league: "liga-1-max",
    homeTeam: "Alianza Lima",
    awayTeam: "Universitario",
    time: "19:30",
    odds: { home: 2.1, draw: 3.2, away: 3.5 },
  },
  {
    id: 4,
    league: "liga-1-max",
    homeTeam: "Sporting Cristal",
    awayTeam: "Boca Juniors",
    time: "20:00",
    odds: { home: 1.95, draw: 3.4, away: 3.8 },
  },
  {
    id: 5,
    league: "champions-league",
    homeTeam: "Bayern Munich",
    awayTeam: "PSG",
    time: "21:00",
    odds: { home: 2.05, draw: 3.5, away: 3.75 },
  },
  {
    id: 6,
    league: "champions-league",
    homeTeam: "Manchester City",
    awayTeam: "Liverpool",
    time: "20:30",
    odds: { home: 1.9, draw: 3.6, away: 4.0 },
  },
  {
    id: 7,
    league: "bundesliga",
    homeTeam: "Borussia Dortmund",
    awayTeam: "Bayern Munich",
    time: "19:30",
    odds: { home: 2.2, draw: 3.3, away: 3.4 },
  },
  {
    id: 8,
    league: "serie-a",
    homeTeam: "Juventus",
    awayTeam: "AC Milan",
    time: "18:00",
    odds: { home: 1.75, draw: 3.7, away: 4.8 },
  },
];

export const BET_OPTIONS = {
  goals: {
    label: "Total Goals",
    options: [
      { label: "Under 2.5", odds: 1.5, value: "under_2.5" },
      { label: "Over 2.5", odds: 2.6, value: "over_2.5" },
      { label: "Under 3.5", odds: 1.3, value: "under_3.5" },
      { label: "Over 3.5", odds: 3.2, value: "over_3.5" },
    ],
  },
  cards: {
    label: "Total Cards",
    options: [
      { label: "Under 3.5", odds: 1.6, value: "under_3.5" },
      { label: "Over 3.5", odds: 2.4, value: "over_3.5" },
      { label: "Under 4.5", odds: 1.4, value: "under_4.5" },
      { label: "Over 4.5", odds: 2.8, value: "over_4.5" },
    ],
  },
  corners: {
    label: "Total Corners",
    options: [
      { label: "Under 8.5", odds: 1.55, value: "under_8.5" },
      { label: "Over 8.5", odds: 2.45, value: "over_8.5" },
      { label: "Under 9.5", odds: 1.45, value: "under_9.5" },
      { label: "Over 9.5", odds: 2.65, value: "over_9.5" },
    ],
  },
  shots: {
    label: "Total Shots",
    options: [
      { label: "Under 12.5", odds: 1.5, value: "under_12.5" },
      { label: "Over 12.5", odds: 2.6, value: "over_12.5" },
      { label: "Under 15.5", odds: 1.4, value: "under_15.5" },
      { label: "Over 15.5", odds: 2.8, value: "over_15.5" },
    ],
  },
};

export type BetCategoryKey = keyof typeof BET_OPTIONS;
