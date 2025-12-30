#!/bin/sh
set -e

echo "🔄 Running database migrations..."
bunx drizzle-kit migrate

echo "✅ Migrations complete"
echo "🚀 Starting production servers..."

# Start both Next.js and Socket.IO server
exec bun run start:servers
