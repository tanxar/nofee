#!/bin/bash

# Database Setup Script for NoFee Backend
# This script helps you setup the database (localhost or cloud)

echo "🚀 NoFee Database Setup"
echo "======================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your database credentials."
    echo ""
fi

# Load environment variables
source .env

echo "📊 Database Configuration:"
echo "   Host: ${DB_HOST:-localhost}"
echo "   Port: ${DB_PORT:-5432}"
echo "   Database: ${DB_NAME:-nofee}"
echo "   User: ${DB_USER:-postgres}"
echo ""

read -p "Do you want to run the migration? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Running database migration..."
    
    # Check if psql is available
    if command -v psql &> /dev/null; then
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/001_initial_schema.sql
        echo "✅ Migration completed!"
    else
        echo "❌ psql not found. Please install PostgreSQL client tools."
        echo "   Or run the migration manually:"
        echo "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/001_initial_schema.sql"
    fi
else
    echo "⏭️  Skipping migration. Run it manually when ready."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure PostgreSQL is running"
echo "2. Update .env with your database credentials"
echo "3. Run: npm install"
echo "4. Run: npm run dev"

