# Retail Intelligence App

A form-based web application for collecting retail store data with real-time analytics


## Features

- **Form-based Data Collection**: Intuitive interface for enumerators to input retail store information
- **Admin Dashboard**: Manage users, view submissions, and monitor data quality
- **Real-time Analytics**: Visualize collected data through interactive dashboards
- **Database Integration**: Secure storage and retrieval of all collected information
- **Role-based Access**: Different permissions for enumerators, supervisors, and administrators

## Project Setup

```bash
# Install dependencies
$ npm install

# Set up environment variables
$ cp .env.example .env
```

## Running the Application

```bash
# Development server
$ npm run start:dev

# Production build
$ npm run build
$ npm run start:prod
```


## Testing

```bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e
```


## API Documentation

The application provides Swagger documentation at `/api/docs` 

## Support

For support, please open an issue in our [GitHub repository](https://github.com/Ajared/retailintelligence).

## License

[MIT](./LICENSE)
