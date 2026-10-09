import { useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, AppAction, BabyProfile, Page } from '../types';
import { AppContext } from './appStateContext';
import { DEFAULT_EDD } from '../constants/babyDefaults';
import { APPLIED_EVENT } from '../lib/cloudSync';

const initialState: AppState = {
  babyProfile: null,
  achievedMilestones: [],
  selectedWeek: 0,
  growthEntries: [],
  knowledgeBase: [],
  currentPage: 'onboarding',
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_BABY_PROFILE':
      return { ...state, babyProfile: action.payload };
    case 'TOGGLE_MILESTONE':
      return {
        ...state,
        achievedMilestones: state.achievedMilestones.includes(action.payload)
          ? state.achievedMilestones.filter(id => id !== action.payload)
          : [...state.achievedMilestones, action.payload],
      };
    case 'SET_SELECTED_WEEK':
      return { ...state, selectedWeek: action.payload };
    case 'ADD_GROWTH_ENTRY': {
      const updated = [...state.growthEntries, action.payload]
        .sort((a, b) => a.date.localeCompare(b.date));
      return { ...state, growthEntries: updated };
    }
    case 'UPDATE_GROWTH_ENTRY': {
      const updatedEntries = state.growthEntries
        .map(e => e.id === action.payload.id ? action.payload : e)
        .sort((a, b) => a.date.localeCompare(b.date));
      return { ...state, growthEntries: updatedEntries };
    }
    case 'DELETE_GROWTH_ENTRY':
      return { ...state, growthEntries: state.growthEntries.filter(e => e.id !== action.payload) };
    case 'ADD_KNOWLEDGE_ENTRY':
      return { ...state, knowledgeBase: [...state.knowledgeBase, action.payload] };
    case 'UPDATE_KNOWLEDGE_ENTRY':
      return { ...state, knowledgeBase: state.knowledgeBase.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_KNOWLEDGE_ENTRY':
      return { ...state, knowledgeBase: state.knowledgeBase.filter(e => e.id !== action.payload) };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'HYDRATE': // cloud merge rewrote localStorage; keep this device's navigation state
      return { ...loadState(), selectedWeek: state.selectedWeek, currentPage: state.currentPage };
    default:
      return state;
  }
}

const defaultProfile: BabyProfile = {
  name: 'Hải Mi',
  birthDate: '2026-04-16',
  gender: 'girl',
  feedingMethod: 'breast',
  edd: DEFAULT_EDD,
};

function loadState(): AppState {
  try {
    const profile = localStorage.getItem('baby-day:profile');
    const milestones = localStorage.getItem('baby-day:achieved-milestones');
    const growth = localStorage.getItem('baby-day:growth-entries');
    const knowledgeBase = localStorage.getItem('baby-day:knowledge-base');
    const savedPage = localStorage.getItem('baby-day:current-page') as Page | null;
    const babyProfile = profile
      ? { ...defaultProfile, ...(JSON.parse(profile) as BabyProfile) }
      : defaultProfile;
    return {
      babyProfile,
      achievedMilestones: milestones ? (JSON.parse(milestones) as string[]) : [],
      selectedWeek: 0,
      growthEntries: growth ? (JSON.parse(growth) as import('../types').GrowthEntry[]) : [],
      knowledgeBase: knowledgeBase ? (JSON.parse(knowledgeBase) as import('../types').KnowledgeEntry[]) : [],
      currentPage: savedPage && babyProfile ? savedPage : (babyProfile ? 'today' : 'onboarding'),
    };
  } catch {
    return { ...initialState, babyProfile: defaultProfile };
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    const onApplied = () => dispatch({ type: 'HYDRATE' });
    window.addEventListener(APPLIED_EVENT, onApplied);
    return () => window.removeEventListener(APPLIED_EVENT, onApplied);
  }, []);

  useEffect(() => {
    if (state.babyProfile) {
      localStorage.setItem('baby-day:profile', JSON.stringify(state.babyProfile));
    }
  }, [state.babyProfile]);

  useEffect(() => {
    localStorage.setItem('baby-day:achieved-milestones', JSON.stringify(state.achievedMilestones));
  }, [state.achievedMilestones]);

  useEffect(() => {
    localStorage.setItem('baby-day:growth-entries', JSON.stringify(state.growthEntries));
  }, [state.growthEntries]);

  useEffect(() => {
    localStorage.setItem('baby-day:knowledge-base', JSON.stringify(state.knowledgeBase));
  }, [state.knowledgeBase]);

  useEffect(() => {
    localStorage.setItem('baby-day:current-page', state.currentPage);
  }, [state.currentPage]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}
