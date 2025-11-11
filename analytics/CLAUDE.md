# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Retailytics analytics module - a secure, production-ready Streamlit application for PostgreSQL database analysis and visualization. It provides an interactive dashboard for exploring retail location data collected through the main Retailytics application.

## Key Commands

### Running the Application
```bash
# Run the main analytics application (production)
streamlit run app.py

# The app requires an ADMIN_SECRET environment variable for authentication
# Set up your .env file first (see Configuration section)
```

### Dependencies
```bash
# Install required packages
pip install -r requirements.txt

# Or using uv (recommended)
uv pip install -r requirements.txt
```

### Configuration
Create a `.env` file in the analytics directory with:
```env
# Database connection
DB_HOST=your-host
DB_PORT=5432
DB_NAME=your-database
DB_USER=your-username
DB_PASSWORD=your-password

# Admin authentication
ADMIN_SECRET=your-secure-secret-here
```

## Architecture

### Core Components

1. **PostgreSQLAnalyzer Class**: Secure database connection and query management
   - Handles PostgreSQL connections using SQLAlchemy with read-only mode
   - Provides methods for executing queries and retrieving table information
   - Advanced error handling with transaction recovery
   - Query validation to prevent write operations

2. **Main Application** ([app.py](app.py)):
   - Admin authentication with HMAC-based secret validation
   - Multi-tab interface for different analysis types
   - Interactive visualizations with Plotly
   - Custom SQL query execution with safety validation
   - Arrow-compatible data handling for UUIDs and datetimes

3. **Security Features**:
   - Admin secret authentication (HMAC comparison)
   - Read-only database session enforcement
   - SQL injection prevention with query validation
   - No hardcoded credentials (environment variables only)

### Database Integration

The application connects to PostgreSQL using environment variables:
- Connection string format: `postgresql://user:password@host:port/database`
- Environment variable loading via python-dotenv
- SSL mode support (configurable)
- Session-level read-only enforcement
- Automatic transaction recovery on errors

### Data Visualization Features

- Interactive charts using Plotly Express
- Histogram distributions for numeric data
- Bar charts for categorical data frequency (top 10)
- Box plots for outlier detection
- Correlation matrices (heatmaps) for numeric relationships
- Enhanced statistics display with metric cards
- Data download capabilities (CSV export)
- Optional ID column filtering for cleaner data views

### User Interface Structure

- **Admin Authentication Screen**: HMAC-based password protection
- **Multi-Tab Interface**:
  1. **Table Information**: Schema, column types, row counts with 3-column metrics layout
  2. **Data Preview**: Configurable sample size (10-1000 rows), optional ID column hiding
  3. **Statistics**: Descriptive statistics and missing value analysis
  4. **Visualizations**: Interactive charts for numeric/categorical analysis with stat cards
- **Custom SQL Query Section**:
  - SQL editor with validation
  - Read-only enforcement (SELECT/WITH only)
  - Multi-statement blocking
  - Error handling with transaction recovery
- Responsive wide layout optimized for data exploration

## Database Schema Expectations

The application expects:
- PostgreSQL database with `public` schema
- Standard `information_schema` tables available
- Tables with mixed data types (numeric, categorical, datetime, UUID)
- Compatible with TypeORM-generated schemas
- Connection via SSL (optional, configurable)

## Data Type Handling

The app includes advanced data type compatibility:
- **UUID Columns**: Automatically converted to strings for display
- **Datetime Fields**: Timezone normalization for Arrow compatibility
- **Mixed Types**: Intelligent coercion with 80% threshold for datetime detection
- **Nullable Integers**: Proper handling via pandas convert_dtypes()
- **Object Columns**: String conversion for problematic types

## Development Notes

- Uses Streamlit session state for connection persistence
- Implements comprehensive error handling with transaction recovery
- NEVER hardcode credentials - uses environment variables exclusively
- Configurable sampling (10-1000 rows) for performance
- Read-only enforcement at multiple levels (session + code validation)
- Arrow-compatible dataframes prevent Streamlit rendering errors

## Security Best Practices

1. **Never commit** `.env` files or hardcoded credentials
2. **Always validate** SQL queries before execution
3. **Use HMAC comparison** for admin secret verification
4. **Enforce read-only** mode at the database session level
5. **Block multiple statements** to prevent SQL injection chains