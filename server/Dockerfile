# -------------------------
# Stage 1: Build
# -------------------------
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm ci

# Copy files required for Prisma
COPY prisma ./prisma
COPY prisma.config.ts ./

# Copy TypeScript configuration and source
COPY tsconfig.json ./
COPY src ./src

# Generate Prisma Client
RUN DATABASE_URL="postgresql://linkup:linkup_dev_password@localhost:5432/linkup" npx prisma generate

# Compile TypeScript
RUN npm run build


# -------------------------
# Stage 2: Production
# -------------------------
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled application
COPY --from=build /app/dist ./dist

# Copy Prisma files
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./
COPY --from=build /app/src/generated ./src/generated

# Backend listens on port 5000
EXPOSE 5000

# Start the server
CMD ["npm", "start"]