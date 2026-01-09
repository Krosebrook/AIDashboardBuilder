
import React from 'react';
import { SampleTemplate } from './types';

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: 'productivity',
    name: 'Personal Productivity',
    icon: '⚡',
    prompt: 'A dashboard for personal productivity tracking tasks completed, deep work hours (line chart), focus score (stat), and category distribution (pie chart).'
  },
  {
    id: 'sales',
    name: 'Sales Pipeline',
    icon: '💰',
    prompt: 'A corporate sales pipeline dashboard showing total revenue (stat), monthly growth (area chart), deals by stage (bar chart), and conversion rate.'
  },
  {
    id: 'learning',
    name: 'Learning Progress',
    icon: '🎓',
    prompt: 'A learning progress dashboard for a student showing hours studied per week (line chart), course completion percentages (bar chart), and total certificates earned.'
  }
];

export const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
];
