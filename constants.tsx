
import { SampleTemplate } from './types';

export const TEMPLATE_CATEGORIES = [
  "All", "Business", "Marketing", "Finance", "Personal", "Health", "Engineering", "Sales"
];

export const SAMPLE_TEMPLATES: (SampleTemplate & { category: string })[] = [
  // --- BUSINESS & OPERATIONS ---
  {
    id: 'saas-metrics',
    category: 'Business',
    name: 'SaaS North Star',
    icon: '🚀',
    prompt: 'A SaaS executive dashboard tracking MRR growth (area chart), Churn rate (line), ARPU (stat), and Customer Acquisition Cost by channel (bar chart).'
  },
  {
    id: 'inventory-mgt',
    category: 'Business',
    name: 'Inventory & Logistics',
    icon: '📦',
    prompt: 'Dashboard for warehouse operations: Stock levels (bar chart), low stock alerts (stat), delivery times (line chart), and supplier performance (radar).'
  },
  {
    id: 'hr-people',
    category: 'Business',
    name: 'HR & People Ops',
    icon: '👥',
    prompt: 'Dashboard for HR: Headcount growth (line), employee satisfaction score (stat), turnover by department (bar chart), and diversity distribution (pie chart).'
  },
  {
    id: 'project-tracking',
    category: 'Business',
    name: 'Project Portfolio',
    icon: '📅',
    prompt: 'Project management dashboard: Tasks completed vs planned (area), budget burn rate (line), active projects (stat), and team workload (bar chart).'
  },
  {
    id: 'customer-support',
    category: 'Business',
    name: 'Customer Support',
    icon: '🎧',
    prompt: 'Support metrics: Average response time (line), CSAT score (stat), ticket volume by category (pie chart), and resolution rate (bar chart).'
  },

  // --- MARKETING & GROWTH ---
  {
    id: 'seo-performance',
    category: 'Marketing',
    name: 'SEO & Organic Growth',
    icon: '🔍',
    prompt: 'SEO dashboard: Organic traffic over time (line chart), keyword rankings (bar chart), domain authority (stat), and bounce rate (area chart).'
  },
  {
    id: 'social-media',
    category: 'Marketing',
    name: 'Social Media Impact',
    icon: '📱',
    prompt: 'Social metrics: Total engagement (stat), follower growth (line), post reach by platform (bar chart), and sentiment analysis (pie chart).'
  },
  {
    id: 'email-marketing',
    category: 'Marketing',
    name: 'Email Campaign Hub',
    icon: '📧',
    prompt: 'Email marketing dashboard: Open rate vs click rate (line), total subscribers (stat), unsubscriptions (bar), and subscriber demographics (pie).'
  },
  {
    id: 'content-strategy',
    category: 'Marketing',
    name: 'Content Marketing',
    icon: '✍️',
    prompt: 'Content performance: Top performing articles (bar chart), average time on page (line), total leads generated (stat), and content types (pie).'
  },
  {
    id: 'ad-spend',
    category: 'Marketing',
    name: 'Ad Spend & ROI',
    icon: '🎯',
    prompt: 'Paid media dashboard: Spend vs ROI (area chart), Cost per Click (line), conversion rate by ad set (bar), and total conversions (stat).'
  },

  // --- FINANCE & SALES ---
  {
    id: 'sales-pipeline',
    category: 'Sales',
    name: 'Sales Pipeline',
    icon: '💰',
    prompt: 'A corporate sales pipeline dashboard showing total revenue (stat), monthly growth (area chart), deals by stage (bar chart), and conversion rate.'
  },
  {
    id: 'cryptocurrency',
    category: 'Finance',
    name: 'Crypto Portfolio',
    icon: '₿',
    prompt: 'Crypto tracker: Bitcoin & Ethereum price trends (line chart), total portfolio value (stat), asset allocation (pie chart), and daily P&L (bar).'
  },
  {
    id: 'expense-tracking',
    category: 'Finance',
    name: 'Corporate Expenses',
    icon: '🧾',
    prompt: 'Expense management: Spending by category (pie chart), monthly budget vs actual (bar chart), top vendors (bar), and cash runway (stat).'
  },
  {
    id: 'ecommerce-sales',
    category: 'Sales',
    name: 'E-commerce Store',
    icon: '🛒',
    prompt: 'Store analytics: Daily sales (area chart), average order value (stat), cart abandonment rate (line), and top selling products (bar chart).'
  },
  {
    id: 'real-estate',
    category: 'Finance',
    name: 'Real Estate Portfolio',
    icon: '🏠',
    prompt: 'Real estate dashboard: Rental income (line), occupancy rate (stat), maintenance costs (bar), and property value appreciation (area).'
  },

  // --- PERSONAL & LIFESTYLE ---
  {
    id: 'productivity',
    category: 'Personal',
    name: 'Personal Productivity',
    icon: '⚡',
    prompt: 'A dashboard for personal productivity tracking tasks completed, deep work hours (line chart), focus score (stat), and category distribution (pie chart).'
  },
  {
    id: 'budgeting',
    category: 'Personal',
    name: 'Personal Finance',
    icon: '💸',
    prompt: 'Personal budget: Monthly income vs savings (line), net worth (stat), spending by category (pie chart), and savings goal progress (bar).'
  },
  {
    id: 'travel-stats',
    category: 'Personal',
    name: 'Travel Journal',
    icon: '✈️',
    prompt: 'Travel dashboard: Countries visited (stat), miles traveled (line), budget spent per trip (bar chart), and travel bucket list progress (pie).'
  },
  {
    id: 'reading-list',
    category: 'Personal',
    name: 'Reading Tracker',
    icon: '📚',
    prompt: 'Book tracker: Pages read per month (line chart), total books completed (stat), genres distribution (pie), and rating by author (bar).'
  },
  {
    id: 'smart-home',
    category: 'Personal',
    name: 'Smart Home Energy',
    icon: '🏠',
    prompt: 'Smart home: Energy consumption per appliance (bar), daily electricity cost (line), solar power generation (area), and average temperature (stat).'
  },

  // --- HEALTH & FITNESS ---
  {
    id: 'learning',
    category: 'Health',
    name: 'Fitness & Gym',
    icon: '💪',
    prompt: 'Fitness tracker: Daily step count (bar), weight trend (line chart), body fat percentage (stat), and workout frequency (pie chart).'
  },
  {
    id: 'sleep-quality',
    category: 'Health',
    name: 'Sleep & Recovery',
    icon: '😴',
    prompt: 'Sleep dashboard: Deep sleep vs REM hours (line), average sleep duration (stat), heart rate variability (area), and mood score (bar).'
  },
  {
    id: 'nutrition-log',
    category: 'Health',
    name: 'Nutrition & Macros',
    icon: '🥗',
    prompt: 'Nutrition tracker: Calorie intake vs goals (line chart), protein/carb/fat ratio (pie chart), water intake (stat), and micronutrient score (radar).'
  },
  {
    id: 'mental-health',
    category: 'Health',
    name: 'Mindfulness & Zen',
    icon: '🧘',
    prompt: 'Mental wellness: Meditation minutes (line), stress level (area chart), total mindfulness sessions (stat), and mood distribution (pie).'
  },
  {
    id: 'biohacking',
    category: 'Health',
    name: 'Biohacking Bio-Stats',
    icon: '🧬',
    prompt: 'Biohacking dashboard: Blood glucose levels (line), ketone levels (stat), supplementation consistency (bar), and biological age estimate (area).'
  },

  // --- ENGINEERING & TECH ---
  {
    id: 'devops-monitor',
    category: 'Engineering',
    name: 'DevOps & SRE',
    icon: '⚙️',
    prompt: 'Infrastructure monitoring: CPU/Memory usage (area chart), server uptime (stat), error rates (line chart), and deployment frequency (bar).'
  },
  {
    id: 'api-performance',
    category: 'Engineering',
    name: 'API Health Hub',
    icon: '📡',
    prompt: 'API analytics: Request latency (line), total requests (stat), response codes distribution (pie chart), and top endpoints (bar).'
  },
  {
    id: 'github-stats',
    category: 'Engineering',
    name: 'Code Repository',
    icon: '💻',
    prompt: 'Github dashboard: Commits per day (line), pull requests open (stat), language distribution (pie), and code churn (area chart).'
  },
  {
    id: 'security-audit',
    category: 'Engineering',
    name: 'Security & Compliance',
    icon: '🛡️',
    prompt: 'Security dashboard: Active threats (stat), vulnerability count (bar), patching status (pie chart), and login attempt locations (scatter).'
  },
  {
    id: 'cloud-costs',
    category: 'Engineering',
    name: 'Cloud Infrastructure',
    icon: '☁️',
    prompt: 'Cloud billing: AWS/GCP spend over time (area chart), database usage (line), estimated monthly bill (stat), and cost by service (pie).'
  },

  // --- ADDITIONAL 20 TEMPLATES FOR VARIETY ---
  { id: 'gaming', category: 'Personal', name: 'Gaming Stats', icon: '🎮', prompt: 'Gaming dashboard: Win/Loss ratio (stat), playtime over time (line), top played games (pie), and achievements unlocked (bar).' },
  { id: 'real-estate-sales', category: 'Sales', name: 'Property Sales', icon: '🏗️', prompt: 'Real estate sales: Leads by source (pie), closed deals value (line), average time to close (stat), and agent performance (bar).' },
  { id: 'non-profit', category: 'Business', name: 'Non-Profit Impacts', icon: '🌍', prompt: 'Non-profit dashboard: Total donations (stat), impact metrics by region (pie), donor retention (line), and volunteer hours (bar).' },
  { id: 'influencer', category: 'Marketing', name: 'Influencer Collabs', icon: '✨', prompt: 'Influencer marketing: Campaign engagement (line), ROI per influencer (bar), total reach (stat), and audience interests (pie).' },
  { id: 'event-planning', category: 'Business', name: 'Event Success', icon: '🎟️', prompt: 'Event management: Ticket sales (line), attendee registration count (stat), budget utilization (bar), and feedback scores (radar).' },
  { id: 'coffee-shop', category: 'Business', name: 'Boutique Coffee Shop', icon: '☕', prompt: 'Coffee shop: Peak hours traffic (area), top selling brews (bar), average transaction value (stat), and waste tracking (line).' },
  { id: 'legal-cases', category: 'Business', name: 'Law Firm Metrics', icon: '⚖️', prompt: 'Legal dashboard: Billable hours (line), active cases (stat), case success rate (pie), and client acquisition (bar).' },
  { id: 'music-streaming', category: 'Personal', name: 'Music Listening', icon: '🎵', prompt: 'Music stats: Hours listened (line), top genres (pie), total unique tracks (stat), and artist affinity (bar).' },
  { id: 'podcast-growth', category: 'Marketing', name: 'Podcast Analytics', icon: '🎙️', prompt: 'Podcast dashboard: Listeners by episode (bar), listener retention (line), total downloads (stat), and geographic distribution (pie).' },
  { id: 'fleet-mgt', category: 'Business', name: 'Fleet Tracking', icon: '🚚', prompt: 'Fleet management: Fuel consumption (line), active vehicles (stat), maintenance schedule (bar), and driver safety scores (radar).' },
  { id: 'university', category: 'Engineering', name: 'Academic Research', icon: '🔬', prompt: 'Research dashboard: Citations count (line), funding received (stat), publication distribution (pie), and grant application status (bar).' },
  { id: 'wedding', category: 'Personal', name: 'Wedding Planning', icon: '💍', prompt: 'Wedding dashboard: RSVP tracking (pie), budget spent vs remaining (bar), days until event (stat), and vendor communication (line).' },
  { id: 'energy-grid', category: 'Engineering', name: 'Public Utility Grid', icon: '⚡', prompt: 'Utility dashboard: Power demand (line), renewable vs non-renewable mix (pie), grid stability index (stat), and peak load periods (area).' },
  { id: 'hotel-mgt', category: 'Business', name: 'Hospitality Hub', icon: '🏨', prompt: 'Hotel metrics: Occupancy rate (line), RevPAR (stat), guest satisfaction (radar), and booking sources (pie).' },
  { id: 'app-usage', category: 'Engineering', name: 'Mobile App Usage', icon: '📱', prompt: 'App analytics: Daily Active Users (line), session length (stat), crash frequency (area), and user actions distribution (pie).' },
  { id: 'garden', category: 'Personal', name: 'Garden Vitality', icon: '🌿', prompt: 'Garden dashboard: Soil moisture (line), plant growth tracking (bar), total harvest weight (stat), and weather impact (area).' },
  { id: 'pet-health', category: 'Health', name: 'Pet Vitality', icon: '🐾', prompt: 'Pet wellness: Weight tracker (line), activity levels (bar), medication schedule (stat), and vet visit frequency (area).' },
  { id: 'gym-mgt', category: 'Business', name: 'Fitness Club Ops', icon: '🏢', prompt: 'Gym management: Membership growth (line), peak attendance hours (bar), churn rate (stat), and equipment usage (radar).' },
  { id: 'wine-cellar', category: 'Personal', name: 'Wine Collection', icon: '🍷', prompt: 'Wine cellar: Total bottles (stat), value over time (line), variety distribution (pie), and region of origin (bar).' },
  { id: 'carbon-footprint', category: 'Business', name: 'Sustainability Core', icon: '🌱', prompt: 'Sustainability dashboard: CO2 emissions (line), waste recycled percentage (stat), energy efficiency rating (bar), and carbon offset status (pie).' },
];

export const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
];
