import 'dotenv/config'; // 1. MUST BE LINE 1 to load MONGODB_URI into process.env!
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Request, Response } from 'express';
import db from './config/connection.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schemas/index.js';
import { authenticateToken } from './utils/auth.js';

// ES modules __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();
  
  // Connect to MongoDB Atlas
  await db();

  const PORT = Number(process.env.PORT) || 3001;
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(
    '/graphql',
    expressMiddleware(server as any, {
      context: authenticateToken as any,
    })
  );

  if (process.env.NODE_ENV === 'production') {
    // 2. Adjust static file path relative to compiled dist output:
    const clientBuildPath = path.join(__dirname, '../client/dist');
    
    app.use(express.static(clientBuildPath));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  }

  // Bind to 0.0.0.0 for Render host binding
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://0.0.0.0:${PORT}/graphql`);
  });
};

startApolloServer();