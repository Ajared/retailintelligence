# Retailytics - Intelligent Retail Market Analysis Platform

Retailytics is a comprehensive retail intelligence platform that empowers businesses to collect, analyze, and share valuable market data about retail stores in urban and rural areas. Our platform democratizes access to local market intelligence, enabling small and medium-scale businesses to make data-driven decisions about market entry, expansion, and competitive positioning.

## 🎯 Problem Statement

Small and medium businesses often lack access to reliable, localized market data that larger corporations can afford. This information gap leads to:
- Poor location decisions for new stores
- Limited understanding of market competition
- Missed opportunities in underserved areas
- Inefficient resource allocation for market research

## 💡 Solution

Retailytics solves these challenges by creating a crowdsourced, technology-enabled platform that makes local market intelligence accessible and actionable for businesses of all sizes.

### How It Works

1. **Geographic Assignment**: Admins assign enumerators to specific local governments, districts, or territories
2. **Data Collection**: Enumerators use mobile-optimized forms to capture detailed retail business information in their assigned areas
3. **Quality Control**: Built-in validation and review processes ensure data accuracy and completeness
4. **Analytics & Insights**: Advanced dashboard provides real-time analytics, visualizations, and market insights
5. **Decision Support**: Users access comprehensive reports to answer critical business questions like "How many competing businesses exist in this area?"

### Key Stakeholder Benefits

**For Small & Medium Businesses:**
- Understand competitive landscape and market density
- Identify underserved market opportunities
- Make data-driven location and expansion decisions
- Access affordable market research previously only available to large corporations

**For Enumerators:**
- Flexible work opportunities with location-based assignments
- User-friendly mobile interface for efficient data collection
- Performance tracking and quality metrics

**For Administrators:**
- Comprehensive oversight of data collection operations
- Real-time monitoring of data quality and coverage
- Advanced analytics for strategic planning

**For Developers:**
- Extensible platform architecture
- APIs for integration with third-party systems
- Customizable data collection for various points of interest

## 🚀 Core Features

### Data Collection & Management
- **Intuitive Forms**: Mobile-optimized, offline-capable data entry interfaces
- **Geographic Assignment**: GPS-enabled territory management and assignment
- **Image Upload**: Visual documentation of retail establishments
- **Offline Sync**: Continuous operation even in low-connectivity areas
- **Data Validation**: Real-time validation and quality control measures

### Analytics & Visualization
- **Interactive Dashboards**: Real-time analytics with customizable views
- **Geographic Mapping**: Interactive maps with store density visualization
- **Statistical Analysis**: Comprehensive data analysis tools and reports
- **Custom Queries**: SQL-based custom analytics for advanced users
- **Export Capabilities**: Multiple format exports (CSV, PDF, Excel) for further analysis

### User Management & Security
- **Role-Based Access Control**: Granular permissions for different user types
- **Multi-Factor Authentication**: Enhanced security for sensitive operations
- **Audit Logging**: Comprehensive activity tracking and compliance
- **Data Privacy**: GDPR-compliant data handling and user privacy protection

### Advanced Capabilities
- **Real-Time Updates**: Live data synchronization across all interfaces
- **Predictive Analytics**: AI-powered insights for market trends and opportunities
- **API Integration**: RESTful and GraphQL APIs for system integration
- **Mobile PWA**: Progressive web app for native-like mobile experience

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js 15 with React 19 and TypeScript
- **Styling**: Tailwind CSS v4 with Radix UI component primitives
- **State Management**: React hooks and context for efficient state handling
- **Authentication**: NextAuth.js with JWT token management
- **Maps**: React Leaflet for interactive geographic visualization
- **Charts**: Plotly.js for advanced data visualization

### Backend Stack
- **Framework**: NestJS with TypeScript for scalable API development
- **Database**: PostgreSQL with TypeORM for robust data persistence
- **Authentication**: JWT-based authentication with role-based authorization
- **File Upload**: UploadThing integration for secure image handling
- **Background Jobs**: BullMQ for asynchronous task processing
- **API Documentation**: OpenAPI/Swagger for comprehensive API docs

### Analytics Engine
- **Platform**: Streamlit-based analytics dashboard
- **Visualization**: Plotly for interactive charts and graphs
- **Data Processing**: Pandas and NumPy for efficient data manipulation
- **Database Connectivity**: SQLAlchemy with PostgreSQL integration
- **Security**: Read-only SQL validation and admin authentication

### Infrastructure & DevOps
- **Containerization**: Docker for consistent deployment environments
- **Database Migrations**: Automated schema management and version control
- **Code Quality**: ESLint, Prettier, and automated testing
- **Version Control**: Git with GitHub Actions for CI/CD

## 📊 Project Structure

```
retailintelligence/
├── frontend/                 # Next.js React application
│   ├── src/app/             # App router pages and layouts
│   ├── src/components/      # Reusable UI components
│   ├── src/lib/             # Utility functions and configurations
│   └── src/types/           # TypeScript type definitions
├── backend/                 # NestJS API server
│   ├── src/modules/         # Feature modules (auth, user, store, etc.)
│   ├── src/database/        # Database entities, migrations, and seeders
│   ├── src/guards/          # Authentication and authorization guards
│   └── src/helpers/         # Utility functions and interceptors
├── analytics/               # Streamlit analytics dashboard
│   ├── app.py              # Main analytics application
│   ├── requirements.txt    # Python dependencies
│   └── pyproject.toml      # Project configuration
└── docs/                   # Documentation and guides
```

## 🌟 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.11 or higher)
- PostgreSQL (v14 or higher)
- pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ajared/retailintelligence.git
   cd retailintelligence
   ```

2. **Set up the backend**
   ```bash
   cd backend
   pnpm install
   cp .env.example .env
   # Configure your database and environment variables
   pnpm run migration:run
   pnpm run seed
   pnpm run start:dev
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   pnpm install
   cp .env.example .env.local
   # Configure your environment variables
   pnpm run dev
   ```

4. **Set up the analytics dashboard**
   ```bash
   cd ../analytics
   pip install -r requirements.txt
   cp .env.example .env
   # Configure your database connection
   streamlit run app.py
   ```

### Environment Configuration

Create the following environment files:

**Backend (.env)**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=retailytics
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
SMTP_HOST=your_smtp_host
UPLOADTHING_SECRET=your_uploadthing_secret
```

**Frontend (.env.local)**
```env
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001
UPLOADTHING_SECRET=your_uploadthing_secret
```

**Analytics (.env)**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=retailytics
DB_USER=your_username
DB_PASSWORD=your_password
ADMIN_SECRET=your_admin_secret
```

## 🔄 Development Workflow

### Running the Application
```bash
# Start backend (Port 3001)
cd backend && pnpm run start:dev

# Start frontend (Port 3000)
cd frontend && pnpm run dev

# Start analytics dashboard (Port 8501)
cd analytics && streamlit run app.py
```

### Code Quality
```bash
# Backend
pnpm run lint
pnpm run test
pnpm run test:e2e

# Frontend
pnpm run lint
pnpm run build
pnpm run type-check
```

## 🌐 Live Demo

Explore the live application at: **https://retailintelligence.ajared.ng/**

- **Frontend**: Modern, responsive interface for data collection and management
- **Backend API**: RESTful API powering the application with comprehensive documentation
- **Analytics Dashboard**: Advanced analytics and visualization tools for data insights

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to:
- Report bugs and feature requests
- Submit pull requests
- Follow our coding standards
- Participate in code reviews

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check our [documentation](docs/)
- Contact the development team

---

**Retailytics** - Democratizing retail market intelligence through technology and community collaboration.
