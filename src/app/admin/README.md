# Questly Admin Dashboard

## 🎯 Overview

The Questly Admin Dashboard is a comprehensive management interface built with Next.js 14, Supabase, and shadcn/ui components. It provides administrators with powerful tools to manage users, content, and system analytics.

## 🚀 Features

### 📊 Dashboard

- **Real-time Statistics**: Total users, quizzes, plays, and rooms
- **Recent Activity**: Latest users, quizzes, and plays
- **Performance Metrics**: System health and usage trends

### 👥 User Management

- **User Overview**: Complete user list with search and filtering
- **Role Management**: Assign admin/user roles
- **Status Control**: Activate/deactivate user accounts
- **User Analytics**: Registration trends and activity stats

### 📝 Content Management

- **Quiz Management**: View, edit, and moderate all quizzes
- **Publishing Control**: Publish/unpublish quizzes
- **Content Moderation**: Review and approve quiz content
- **Performance Tracking**: Play counts and engagement metrics

### 📈 Analytics

- **Interactive Charts**: Daily plays, user growth, quiz popularity
- **Data Visualization**: Pie charts, bar charts, and line graphs
- **Export Capabilities**: Download reports and data
- **Trend Analysis**: Historical data and growth patterns

### ⚙️ System Settings

- **Site Configuration**: Basic system settings
- **Email Settings**: SMTP configuration
- **Security Policies**: Authentication and access control
- **Maintenance Mode**: System maintenance controls

## 🛠️ Technical Stack

### Frontend

- **Next.js 14** with App Router
- **React Hook Form** for form management
- **Zod** for validation
- **shadcn/ui** components
- **Recharts** for data visualization
- **TailwindCSS** for styling

### Backend

- **Supabase** for database and authentication
- **PostgreSQL** with RLS policies
- **Real-time subscriptions**

### Database Schema

```sql
-- Profiles table with admin roles
profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)

-- Quiz table with publishing control
quiz (
  id UUID PRIMARY KEY,
  title TEXT,
  is_published BOOLEAN DEFAULT true,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP
)

-- Admin actions audit log
admin_actions (
  id UUID PRIMARY KEY,
  admin_id UUID,
  action_type TEXT,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP
)
```

## 🔐 Authentication & Authorization

### Admin Access

- Users with `role = 'admin'` in profiles table
- Automatic role checking via Supabase RLS
- Protected routes with middleware

### Security Features

- Row Level Security (RLS) policies
- Admin action audit logging
- Secure API endpoints
- Role-based access control

## 📱 Responsive Design

- **Mobile-first** approach
- **Responsive tables** with horizontal scroll
- **Adaptive sidebar** for mobile devices
- **Touch-friendly** interface elements

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- Admin user account

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run migrations: `npm run db:migrate`
5. Start development server: `npm run dev`

### Admin Setup

1. Create admin user in Supabase
2. Update user role to 'admin' in profiles table
3. Access admin dashboard at `/admin`

## 📊 Analytics Features

### Charts Available

- **Daily Plays**: Line chart showing quiz plays over time
- **User Growth**: Bar chart of new user registrations
- **Quiz Popularity**: Horizontal bar chart of top quizzes
- **Difficulty Distribution**: Pie chart of quiz difficulties

### Data Sources

- Real-time data from Supabase
- Aggregated statistics
- Historical trends
- Performance metrics

## 🔧 Configuration

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Admin Settings

- Site name and description
- User limits and restrictions
- Email configuration
- Security policies
- Feature flags

## 📈 Performance

### Optimization Features

- **Lazy loading** for large datasets
- **Pagination** for tables
- **Caching** for frequently accessed data
- **Real-time updates** via Supabase subscriptions

### Monitoring

- Error tracking and logging
- Performance metrics
- User activity monitoring
- System health checks

## 🛡️ Security

### Data Protection

- Encrypted data transmission
- Secure authentication
- Role-based permissions
- Audit logging

### Best Practices

- Input validation with Zod
- SQL injection prevention
- XSS protection
- CSRF protection

## 📝 API Endpoints

### Admin APIs

- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/quizzes` - Quiz management
- `POST /api/admin/actions` - Admin actions

### Supabase Functions

- `handle_new_user()` - Auto-create profiles
- `update_play_count()` - Update quiz statistics
- `admin_audit_log()` - Log admin actions

## 🚀 Deployment

### Production Setup

1. Deploy to Vercel/Netlify
2. Configure Supabase production
3. Set up monitoring
4. Configure backups

### Environment Configuration

- Production database
- CDN setup
- Error tracking
- Performance monitoring

## 📞 Support

### Documentation

- Component documentation
- API reference
- Database schema
- Deployment guide

### Troubleshooting

- Common issues
- Error codes
- Performance optimization
- Security best practices

---

**Built with ❤️ using Next.js, Supabase, and shadcn/ui**
