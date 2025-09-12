# Retailytics

Retailytics is a data collection platform for gathering retail store information across different geographic areas.

## Overview

The platform enables data collection of retail businesses through a structured workflow:
- Admins can assign enumerators to specific local governments or districts
- Enumerators capture retail business details in their assigned areas  
- Data is stored and can be viewed through the web interface

## Current Features

**Data Collection**
- Form-based store data entry with location coordinates
- User role management (Admin/Enumerator)
- Geographic assignment by states, districts, and local governments

**Data Management** 
- Secure PostgreSQL database storage
- REST API for data operations
- User authentication and session management

**Visualization**
- Map-based store location display
- Basic store listing and search functionality
- Separate analytics dashboard (Streamlit-based)

## Technical Stack

- **Frontend**: Next.js with TypeScript, Tailwind CSS
- **Backend**: NestJS with TypeScript  
- **Database**: PostgreSQL
- **Analytics**: Streamlit (separate application)
- **Authentication**: NextAuth.js

## Access
Production: https://retailintelligence.ajared.ng/
