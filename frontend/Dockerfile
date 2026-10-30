# Practical 11: Frontend Dockerfile
# Note: In this project, React frontend files are located at repository root.
# Build context for this Dockerfile should be the repository root (`..` or `.` if at root).
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host"]
