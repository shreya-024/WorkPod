// Re-export scenario data (loaded via Vite's JSON import)
import sde from './sde.json';
import hr from './hr.json';
import pm from './pm.json';
import ml_intern from './ml_intern.json';
import sde_intern from './sde_intern.json';

export const scenarios = { sde, hr, pm, ml_intern, sde_intern };

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
  {
    id: 'ml_intern',
    label: 'ML Intern',
    icon: '🧠',
    description: 'Onboard at an AI startup, explore datasets, build ML pipelines, and ship your first model.',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  },
  {
    id: 'sde_intern',
    label: 'SDE Intern',
    icon: '🛠️',
    description: 'Survive your first week — read the wiki, fix a bug, write tests, and submit your first PR.',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  },
];
