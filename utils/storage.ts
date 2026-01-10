
import { DashboardData } from '../types';

const STORAGE_KEY = 'dashgen_library';

export const getSavedDashboards = (): DashboardData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load dashboards', error);
    return [];
  }
};

export const saveDashboardToLibrary = (dashboard: DashboardData): DashboardData => {
  try {
    const dashboards = getSavedDashboards();
    const timestamp = Date.now();
    
    let newDashboard = { ...dashboard };
    
    if (!newDashboard.id) {
      newDashboard.id = crypto.randomUUID();
    }
    newDashboard.lastModified = timestamp;

    const existingIndex = dashboards.findIndex(d => d.id === newDashboard.id);
    
    if (existingIndex >= 0) {
      dashboards[existingIndex] = newDashboard;
    } else {
      dashboards.unshift(newDashboard);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
    return newDashboard;
  } catch (error) {
    console.error('Failed to save dashboard', error);
    throw new Error('Storage limit reached or access denied');
  }
};

export const deleteDashboardFromLibrary = (id: string): void => {
  try {
    const dashboards = getSavedDashboards().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
  } catch (error) {
    console.error('Failed to delete dashboard', error);
  }
};
