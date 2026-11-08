/** Deterministic simulated GitHub events. Order is the simulation sequence. */

export const ACTIVITY_TEMPLATES = [
  {
    repoId: 'restaurant-management-system',
    type: 'push',
    title: 'Push to main',
    description: 'A push landed on restaurant-management-system. A push alone does not demonstrate a skill or publish the project.',
    metadata: { branch: 'main', meaningful: false },
  },
  {
    repoId: 'education-dashboard',
    type: 'commit',
    title: 'Commit: adjust gradebook copy',
    description: 'A small copy commit on education-dashboard. Minor commits are kept in history and are not treated as skill evidence.',
    metadata: { branch: 'main', meaningful: false },
  },
  {
    repoId: 'task-management-api',
    type: 'branch',
    title: 'Branch opened: audit-log-review',
    description: 'A new branch was opened on task-management-api. Opening a branch does not change lifecycle or skill evidence.',
    metadata: { branch: 'audit-log-review', meaningful: false },
  },
  {
    repoId: 'chat-widget-sdk',
    type: 'pull_request',
    title: 'Pull request: WebSocket presence updates',
    description: 'A pull request on chat-widget-sdk describes work in WebSocket, a technology already listed on this repository.',
    metadata: { branch: 'presence-updates', skill: 'WebSocket', meaningful: false },
  },
  {
    repoId: 'portfolio-website',
    type: 'release',
    title: 'Release: portfolio case-study refresh',
    description: 'A release was tagged on portfolio-website. The release notes mention Next.js, which is already part of this repository.',
    metadata: { tag: 'v1.4.0', skill: 'Next.js', meaningful: true, linkedinCategory: 'milestone' },
  },
  {
    repoId: 'car-rental-platform',
    type: 'deployment',
    title: 'Deployment recorded for the fleet app',
    description: 'A deployment event was observed for car-rental-platform. Incremental sync records it and does not rerun lifecycle analysis.',
    metadata: { environment: 'demo', meaningful: true, linkedinCategory: 'milestone' },
  },
  {
    repoId: 'ml-image-classifier',
    type: 'merge',
    title: 'Merge: PyTorch inference path',
    description: 'A merge on ml-image-classifier landed work in PyTorch, a technology already listed on this repository.',
    metadata: { branch: 'inference-path', skill: 'PyTorch', meaningful: true, linkedinCategory: 'new_feature' },
  },
  {
    repoId: 'infra-terraform-modules',
    type: 'repository_update',
    title: 'Repository metadata updated',
    description: 'Description metadata changed on infra-terraform-modules. Metadata updates are not skill evidence.',
    metadata: { meaningful: false },
  },
  {
    repoId: 'dev-portfolio-api',
    type: 'push',
    title: 'Push to feature/content-endpoints',
    description: 'A feature-branch push on dev-portfolio-api. A push does not publish the project or prove a skill.',
    metadata: { branch: 'feature/content-endpoints', meaningful: false },
  },
  {
    repoId: 'education-dashboard',
    type: 'pull_request',
    title: 'Pull request: responsive analytics dashboard layout',
    description: 'Responsive dashboard layout improvements on education-dashboard with clearer chart hierarchy.',
    metadata: { branch: 'dashboard-ui', meaningful: true, linkedinCategory: 'ui_ux' },
  },
  {
    repoId: 'task-management-api',
    type: 'merge',
    title: 'Merge: fix authentication token validation',
    description: 'Merged a fix for authentication token validation edge cases on task-management-api.',
    metadata: { branch: 'auth-fix', skill: 'Go', meaningful: true, linkedinCategory: 'bug_fix' },
  },
  {
    repoId: 'dev-portfolio-api',
    type: 'pull_request',
    title: 'Pull request: optimize content query batching',
    description: 'Refactored data loading paths in dev-portfolio-api to reduce redundant query batching in the demo timeline.',
    metadata: { branch: 'perf-batching', meaningful: true, linkedinCategory: 'performance' },
  },
];

export const EVENT_TYPES = ['push', 'commit', 'branch', 'pull_request', 'merge', 'release', 'deployment', 'repository_update'];
