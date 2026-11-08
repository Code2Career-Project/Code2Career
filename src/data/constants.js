/** Mock workspace data ported from the existing Code2Career demo. */

export const GH_USER = {
  login: 'alexrivera',
  name: 'Alex Rivera',
  email: 'alex.rivera.dev@example.com',
  avatarInitials: 'AR',
  company: '@northwind-labs',
  location: 'Barcelona, Spain',
  publicRepos: 34,
  followers: 128,
  following: 46,
  joined: 'March 2016',
};

export const LANG_COLORS = {
  JavaScript: '#F1E05A',
  TypeScript: '#3178C6',
  Python: '#3572A5',
  Java: '#B07219',
  PHP: '#4F5D95',
  CSS: '#563D7C',
  HTML: '#E34C26',
  Go: '#00ADD8',
  Rust: '#DEA584',
  C: '#555555',
  'C++': '#F34B7D',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Ruby: '#701516',
  'C#': '#178600',
  Dart: '#00B4AB',
  Vue: '#41B883',
  HCL: '#8B949E',
};

export const langColor = (language) => LANG_COLORS[language] || '#8B949E';

export const REPOS = [
  {
    id: 'restaurant-management-system',
    name: 'restaurant-management-system',
    description: 'Full-stack restaurant ordering and table management platform with real-time order tracking.',
    visibility: 'Private',
    language: 'TypeScript',
    stars: 24,
    forks: 6,
    updated: '2025-10-14',
    size: '12.4 MB',
    branches: 8,
    skills: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'Express', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Docker', 'GitHub Actions', 'REST API', 'Redis'],
  },
  {
    id: 'car-rental-platform',
    name: 'car-rental-platform',
    description: 'Vehicle fleet booking system with pricing rules, availability calendars and admin tooling.',
    visibility: 'Public',
    language: 'Java',
    stars: 63,
    forks: 19,
    updated: '2025-11-02',
    size: '8.1 MB',
    branches: 6,
    skills: ['Java', 'Spring Boot', 'MySQL', 'Hibernate', 'Docker', 'Maven', 'REST API', 'JUnit'],
  },
  {
    id: 'education-dashboard',
    name: 'education-dashboard',
    description: 'Analytics dashboard for school performance, attendance tracking and gradebook management.',
    visibility: 'Public',
    language: 'TypeScript',
    stars: 41,
    forks: 7,
    updated: '2025-09-28',
    size: '6.7 MB',
    branches: 5,
    skills: ['TypeScript', 'React', 'Vue', 'TanStack Query', 'Chart.js', 'Tailwind CSS', 'Node.js', 'Express', 'PostgreSQL', 'Redis', 'Vite'],
  },
  {
    id: 'portfolio-website',
    name: 'portfolio-website',
    description: 'Personal developer portfolio with blog, case studies and a lightweight CMS.',
    visibility: 'Public',
    language: 'JavaScript',
    stars: 118,
    forks: 22,
    updated: '2025-11-05',
    size: '2.3 MB',
    branches: 4,
    skills: ['JavaScript', 'React', 'Next.js', 'Tailwind CSS', 'GSAP', 'Vercel', 'HTML', 'CSS'],
  },
  {
    id: 'task-management-api',
    name: 'task-management-api',
    description: 'Production REST API for team task boards with RBAC, rate limiting and audit logging.',
    visibility: 'Private',
    language: 'Go',
    stars: 37,
    forks: 8,
    updated: '2025-10-30',
    size: '4.9 MB',
    branches: 9,
    skills: ['Go', 'PostgreSQL', 'Docker', 'Kubernetes', 'gRPC', 'REST API', 'OpenAPI', 'GitHub Actions', 'Prometheus', 'Grafana'],
  },
  {
    id: 'ecommerce-platform',
    name: 'ecommerce-platform',
    description: 'Multi-vendor marketplace with catalogue, cart, payments and order fulfilment.',
    visibility: 'Public',
    language: 'PHP',
    stars: 92,
    forks: 31,
    updated: '2025-10-21',
    size: '22.8 MB',
    branches: 12,
    skills: ['PHP', 'Laravel', 'MySQL', 'Redis', 'Docker', 'RabbitMQ', 'Tailwind CSS', 'Blade', 'Elasticsearch', 'Stripe SDK'],
  },
  {
    id: 'university-management-system',
    name: 'university-management-system',
    description: 'Campus information system covering admissions, faculty records and course scheduling.',
    visibility: 'Private',
    language: 'Python',
    stars: 15,
    forks: 4,
    updated: '2025-08-19',
    size: '10.2 MB',
    branches: 7,
    skills: ['Python', 'Django', 'PostgreSQL', 'Celery', 'Redis', 'Docker', 'REST API', 'GraphQL', 'Pytest'],
  },
  {
    id: 'dev-portfolio-api',
    name: 'dev-portfolio-api',
    description: 'Headless API serving portfolio content with a public GraphQL schema and caching.',
    visibility: 'Public',
    language: 'TypeScript',
    stars: 29,
    forks: 5,
    updated: '2025-11-01',
    size: '3.2 MB',
    branches: 3,
    skills: ['TypeScript', 'Node.js', 'Fastify', 'PostgreSQL', 'Prisma', 'Redis', 'Docker', 'OpenAPI'],
  },
  {
    id: 'chat-widget-sdk',
    name: 'chat-widget-sdk',
    description: 'Embeddable customer chat widget with presence, typing indicators and offline queueing.',
    visibility: 'Public',
    language: 'JavaScript',
    stars: 54,
    forks: 11,
    updated: '2025-09-15',
    size: '1.9 MB',
    branches: 4,
    skills: ['JavaScript', 'TypeScript', 'React', 'WebSocket', 'Node.js', 'Vite', 'Vitest'],
  },
  {
    id: 'ml-image-classifier',
    name: 'ml-image-classifier',
    description: 'Image classification service with a FastAPI inference layer and scheduled retraining.',
    visibility: 'Private',
    language: 'Python',
    stars: 21,
    forks: 6,
    updated: '2025-07-28',
    size: '15.6 MB',
    branches: 5,
    skills: ['Python', 'FastAPI', 'PyTorch', 'Docker', 'PostgreSQL', 'Celery', 'MLflow'],
  },
  {
    id: 'react-native-notes',
    name: 'react-native-notes',
    description: 'Cross-platform note-taking app with offline sync and biometric lock.',
    visibility: 'Public',
    language: 'JavaScript',
    stars: 33,
    forks: 9,
    updated: '2025-08-04',
    size: '5.4 MB',
    branches: 6,
    skills: ['JavaScript', 'React Native', 'Expo', 'TypeScript', 'SQLite', 'Firebase'],
  },
  {
    id: 'infra-terraform-modules',
    name: 'infra-terraform-modules',
    description: 'Reusable Terraform modules for VPC provisioning, observability and CI runners.',
    visibility: 'Public',
    language: 'HCL',
    stars: 47,
    forks: 13,
    updated: '2025-10-09',
    size: '1.1 MB',
    branches: 8,
    skills: ['Terraform', 'AWS', 'Docker', 'GitHub Actions', 'Helm', 'Bash'],
  },
];

export const CATEGORIES = [
  { key: 'languages', label: 'Programming Languages', icon: 'code-2' },
  { key: 'frontend', label: 'Frontend Frameworks', icon: 'layout-template' },
  { key: 'backend', label: 'Backend Technologies', icon: 'server' },
  { key: 'databases', label: 'Databases', icon: 'database' },
  { key: 'devops', label: 'DevOps & Tools', icon: 'container' },
];

export const SKILL_CATEGORY = {
  TypeScript: 'languages', JavaScript: 'languages', Java: 'languages', Python: 'languages',
  PHP: 'languages', Go: 'languages', HCL: 'languages', HTML: 'languages', CSS: 'languages',
  React: 'frontend', 'Next.js': 'frontend', Vue: 'frontend', Nuxt: 'frontend', Svelte: 'frontend',
  'Tailwind CSS': 'frontend', 'Chart.js': 'frontend', GSAP: 'frontend', 'React Native': 'frontend',
  Expo: 'frontend', 'TanStack Query': 'frontend', Vite: 'frontend', Vitest: 'frontend', Blade: 'frontend',
  'Node.js': 'backend', Express: 'backend', 'Spring Boot': 'backend', Django: 'backend', FastAPI: 'backend',
  'REST API': 'backend', GraphQL: 'backend', gRPC: 'backend', WebSocket: 'backend', Celery: 'backend',
  OpenAPI: 'backend', Hibernate: 'backend', JUnit: 'backend', Pytest: 'backend', Fastify: 'backend',
  'Stripe SDK': 'backend', RabbitMQ: 'backend', Elasticsearch: 'backend', PyTorch: 'backend',
  MLflow: 'backend', Firebase: 'backend',
  PostgreSQL: 'databases', MySQL: 'databases', Redis: 'databases', SQLite: 'databases',
  MongoDB: 'databases', Prisma: 'databases',
  Docker: 'devops', Kubernetes: 'devops', Terraform: 'devops', AWS: 'devops', 'GitHub Actions': 'devops',
  Helm: 'devops', Prometheus: 'devops', Grafana: 'devops', Maven: 'devops', Nginx: 'devops',
  Vercel: 'devops', Linux: 'devops', Bash: 'devops',
};

export const SKILL_SUBCAT = {
  React: 'Library', 'Next.js': 'Framework', Vue: 'Framework', 'Tailwind CSS': 'Styling',
  'Node.js': 'Runtime', Express: 'Framework', 'Spring Boot': 'Framework', Django: 'Framework',
  FastAPI: 'Framework', 'REST API': 'Protocol', GraphQL: 'Query Language', gRPC: 'Protocol',
  PostgreSQL: 'Relational', MySQL: 'Relational', Redis: 'Cache / KV', SQLite: 'Relational',
  Prisma: 'ORM', MongoDB: 'Document', Docker: 'Containerization', Kubernetes: 'Orchestration',
  Terraform: 'IaC', AWS: 'Cloud', 'GitHub Actions': 'CI/CD', Maven: 'Build Tool',
  Helm: 'Packaging', Prometheus: 'Monitoring', Grafana: 'Observability', Vercel: 'Platform',
  PyTorch: 'ML Framework', MLflow: 'ML Ops', 'Stripe SDK': 'Payments', Elasticsearch: 'Search',
  Celery: 'Task Queue', RabbitMQ: 'Message Broker', WebSocket: 'Protocol', OpenAPI: 'Specification',
  Hibernate: 'ORM', JUnit: 'Testing', Pytest: 'Testing', Fastify: 'Framework', Blade: 'Templating',
  'React Native': 'Mobile', Expo: 'Tooling', 'TanStack Query': 'Data Fetching', Vite: 'Build Tool',
  Vitest: 'Testing', 'Chart.js': 'Charting', GSAP: 'Animation', Firebase: 'BaaS', Linux: 'OS',
  Bash: 'Shell', Nginx: 'Web Server', HCL: 'Config', Java: 'JVM', TypeScript: 'Typed JS',
  JavaScript: 'Web', Python: 'Scripting', PHP: 'Web', Go: 'Compiled', HTML: 'Markup', CSS: 'Styling',
  Firewall: 'Network',
};

export const EVIDENCE_SEED = {
  TypeScript: 'demonstrated', React: 'demonstrated', JavaScript: 'demonstrated', 'Node.js': 'demonstrated',
  PostgreSQL: 'demonstrated', Docker: 'demonstrated', 'GitHub Actions': 'verified', 'REST API': 'demonstrated',
  Prisma: 'verified', Redis: 'verified', 'Tailwind CSS': 'demonstrated', 'Next.js': 'verified',
  Vue: 'verified', 'Spring Boot': 'verified', MySQL: 'verified', Go: 'demonstrated', gRPC: 'verified',
  Kubernetes: 'verified', Terraform: 'verified', Python: 'demonstrated', Django: 'verified',
  FastAPI: 'verified', PHP: 'demonstrated', Laravel: 'demonstrated', Java: 'demonstrated',
};

export const EVIDENCE_META = {
  detected: {
    label: 'Detected',
    desc: 'Simulated: technology listed in demo project data.',
  },
  verified: {
    label: 'Verified',
    desc: 'Simulated example of source-code usage evidence; no code was scanned.',
  },
  demonstrated: {
    label: 'Demonstrated',
    desc: 'Simulated example of meaningful usage; not a real assessment.',
  },
};

export const ANALYSIS_STEPS = [
  { key: 'structure', label: 'Repository structure inspection', desc: 'Mapping directories, entry points and manifests' },
  { key: 'languages', label: 'Programming language detection', desc: 'Classifying source files by language' },
  { key: 'frameworks', label: 'Framework and library identification', desc: 'Matching dependencies and import patterns' },
  { key: 'codebase', label: 'Codebase analysis', desc: 'Scanning implementation density across modules' },
  { key: 'skills', label: 'Technical skill extraction', desc: 'Deriving skills from matched evidence' },
  { key: 'stats', label: 'Statistics aggregation', desc: 'Aggregating per-repository and cross-repository metrics' },
  { key: 'profile', label: 'Developer Skill Profile generation', desc: 'Compiling the persistent skill profile' },
];

export const NOTIFICATIONS = [
  { id: 1, title: 'Welcome to Code2Career', body: 'Connect your GitHub account to begin building your developer skill profile.', time: '2 days ago', unread: true },
  { id: 2, title: 'Workspace preview build', body: 'Repository analysis, skill evidence levels and the profile page are now available.', time: '5 days ago', unread: true },
  { id: 3, title: 'Tip: choose repositories carefully', body: 'Skills are only demonstrated for repositories you explicitly select for analysis.', time: '1 week ago', unread: false },
];

export const PROJECT_EVENTS = {
  'restaurant-management-system': [['setup', 'Repository initialized'], ['commit', 'Commit: Initialize restaurant ordering repository'], ['architecture', 'Ordering architecture established'], ['feature', 'Table management and order tracking implemented'], ['integration', 'PostgreSQL and Prisma integration completed'], ['testing', 'Order workflow tests added'], ['fix', 'Table booking defects corrected'], ['ci', 'CI build passed'], ['release', 'Release candidate prepared']],
  'car-rental-platform': [['setup', 'Fleet repository initialized'], ['commit', 'Commit: Initialize fleet booking repository'], ['architecture', 'Booking service architecture created'], ['feature', 'Availability calendars and pricing rules implemented'], ['integration', 'MySQL persistence integrated'], ['testing', 'Booking tests added'], ['fix', 'Availability edge cases fixed'], ['ci', 'Build passed'], ['release', 'Fleet release created'], ['deployment', 'Fleet application deployed successfully']],
  'education-dashboard': [['setup', 'Dashboard repository initialized'], ['commit', 'Commit: Initialize dashboard workspace'], ['architecture', 'School dashboard structure created'], ['feature', 'Attendance and gradebook views implemented'], ['integration', 'School data integration completed'], ['testing', 'Dashboard tests started'], ['fix', 'Grade calculation bug fixed']],
  'portfolio-website': [['setup', 'Portfolio repository initialized'], ['commit', 'Commit: Initialize portfolio workspace'], ['architecture', 'Portfolio layout and content architecture created'], ['feature', 'Case studies and blog implemented'], ['integration', 'Content management integration completed'], ['testing', 'Portfolio checks passed'], ['ci', 'Build passed'], ['release', 'Portfolio release created'], ['deployment', 'Portfolio deployed successfully'], ['maintenance', 'Published case studies updated after deployment']],
  'task-management-api': [['setup', 'Task API repository initialized'], ['commit', 'Commit: Initialize task API workspace'], ['architecture', 'Task board API architecture created'], ['feature', 'Task boards and access control implemented'], ['integration', 'PostgreSQL and rate limiting integrated']],
  'ecommerce-platform': [['setup', 'Marketplace repository initialized'], ['commit', 'Commit: Initialize marketplace repository'], ['architecture', 'Catalogue and order architecture created'], ['feature', 'Cart and vendor catalogue implemented'], ['integration', 'Payment integration completed'], ['testing', 'Checkout tests added'], ['ci', 'Build passed'], ['release', 'Marketplace release prepared']],
  'university-management-system': [['setup', 'Campus repository initialized'], ['commit', 'Commit: Initialize campus system'], ['architecture', 'Admissions and faculty architecture created'], ['feature', 'Course scheduling implemented'], ['integration', 'PostgreSQL integrated'], ['testing', 'Admissions tests started']],
  'dev-portfolio-api': [['setup', 'Portfolio API repository initialized'], ['commit', 'Commit: Initialize portfolio API'], ['architecture', 'GraphQL schema designed'], ['feature', 'Portfolio content endpoints implemented'], ['integration', 'Caching and PostgreSQL integrated'], ['testing', 'API tests added'], ['ci', 'Build passed'], ['release', 'API release created'], ['deployment', 'Portfolio API deployed successfully'], ['feature', 'New content endpoints started after deployment']],
  'chat-widget-sdk': [['setup', 'Chat widget repository initialized'], ['commit', 'Commit: Initialize chat widget SDK'], ['architecture', 'Widget architecture established'], ['feature', 'Presence and typing indicators implemented']],
  'ml-image-classifier': [['setup', 'Classifier repository initialized'], ['commit', 'Commit: Initialize classifier service'], ['architecture', 'Inference architecture designed']],
  'react-native-notes': [['setup', 'Notes application initialized'], ['commit', 'Commit: Initialize mobile notes app']],
  'infra-terraform-modules': [['setup', 'Infrastructure repository initialized'], ['commit', 'Commit: Initialize infrastructure modules'], ['architecture', 'VPC module structure created'], ['feature', 'CI runner modules implemented'], ['integration', 'AWS provisioning integrated'], ['testing', 'Module validation tests added'], ['ci', 'Build passed'], ['release', 'Module release created'], ['deployment', 'Infrastructure deployment succeeded'], ['maintenance', 'Observability modules improved'], ['archived', 'Project explicitly archived']],
};

export const STAGES = ['Published', 'In development'];

export const MILESTONES = { setup: 10, architecture: 20, feature: 30, integration: 15, testing: 15, release: 10 };

export const LIFECYCLE_STEPS = [
  'Read recent commits',
  'Decide whether it is ready for the CV',
];

export const repoById = (id) => REPOS.find((repo) => repo.id === id);

export const uniqueLanguages = () => Array.from(new Set(REPOS.map((repo) => repo.language))).sort();
