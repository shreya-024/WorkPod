// Re-export scenario data (loaded via Vite's JSON import)
import sde from './sde.json';
import hr from './hr.json';
import pm from './pm.json';

export const scenarios = { sde, hr, pm };

export function getScenario(role) {
  return scenarios[role] || null;
}

export const ROLES = [
  {
    id: 'sde',
    label: 'Software Engineer',
    icon: '💻',
    description: 'Debug production issues, review PRs, design APIs, and ship features with your engineering squad.',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
  },
  {
    id: 'hr',
    label: 'HR Manager',
    icon: '👥',
    description: 'Handle performance reviews, talent acquisition, conflict resolution, and culture initiatives.',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
  {
    id: 'pm',
    label: 'Product Manager',
    icon: '🚀',
    description: 'Drive roadmap decisions, align stakeholders, analyze metrics, and ship the right product.',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
  },
];
