#!/bin/bash

read -p "Enter the database name to create: " DB_NAME
read -p "Do you want to use an existing user? (y/n): " USE_EXISTING_USER

if [ "$USE_EXISTING_USER" == "y" ]; then
    read -p "Enter the existing PostgreSQL username: " DB_USER
else
    read -p "Enter new username: " DB_USER
    read -s -p "Enter password for new user: " DB_PASS
    echo
    sudo psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
fi

sudo psql -U postgres -c "CREATE DATABASE $DB_NAME;"

read -p "Should this user be the owner of the database? (y/n): " MAKE_OWNER
if [ "$MAKE_OWNER" == "y" ]; then
    sudo psql -U postgres -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"
else
    sudo psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    sudo psql -U postgres -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON SCHEMA public TO $DB_USER;"
    sudo psql -U postgres -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
    sudo psql -U postgres -d "$DB_NAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO $DB_USER;"
    sudo psql -U postgres -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"
    sudo psql -U postgres -d "$DB_NAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO $DB_USER;"
fi

echo "Database $DB_NAME and user $DB_USER setup completed successfully."