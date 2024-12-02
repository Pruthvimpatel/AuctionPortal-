# AuctionPortal-
Creating the Auction portal using socket.io
AUCTION PORTAL
- [Getting Started](#-getting-started)
- [Scripts and Tasks](#-scripts-and-tasks)
- [API Routes](#-api-routes)
- [Project Structure](#-project-structure)
-  [Deployment](#-Deployment)

## ❯ Getting Started
### Step 1: Set up the Environment

You need to set up your environment before you can do anything.

Install [Node.js and NPM](https://nodejs.org/en/download/)

Install a database like postgres

### Step 2: Create new Project

Fork or download this project. Configure your package.json for your new project.

Then copy the `.env.example` file and rename it to `.env`. In this file you have to add your database connection information.

Create a new database with the name you have in your `.env`-file.

Then setup your application environment.

```PORT = 8000
NODE_ENV = development  // environment variable

DB_USERNAME =  // Database Username
DB_PASSWORD =  // Database Password
DB_NAME =      // Database Name
DB_HOSTNAME =  // Database HOST Name
DB_PORT =      // Database PORT
DB_DRIVER =    // Database type like (postgres)

SECRET =    // JWT scret key for auth token
```
installs all dependencies with npm.

### Step 3: Serve your App

Go to the project dir and start your app with this npm script.

```bash
npm run dev
```

## ❯ Scripts and Tasks

### Install

- Install all dependencies with `npm install`

### Linting

- Run code quality analysis using `npm run lint:check`. This runs tslint.
- Run code quality fix using `npm run lint:fix`. This runs tslint.

### Database Migration

- Run `npx sequelize migration:create --name <migration-file-name>` to create a new migration file.
- To migrate your database run `npx sequelize-cli db:migrate`.

## ❯ API Routes
The route prefix is /api/v1 by default.

| Route          | Description |
| -------------- | ----------- |
| **/api/v1/users/register** | Example entity endpoint |
| **/api/v1/players/player-register**  | Example entity endpoint |

## ❯ Project Structure
| Name                              | Description |
| --------------------------------- | ----------- |
| **src/**                          | Source files |
| **src/config/**          | REST API Configuration |
| **src/constants/**          | Message and API Constants |
| **src/controllers/**          | REST API Controllers |
| **src/middlewares/**          | Express Middlewares like helmet security features |
| **src/models/**               | Sequelize Models |
| **src/routes/**               | REST API Routing |
| **src/socket/**               | Socket.IO implementation |
| **src/types/**                | Common Type folder |
| **src/validation/**           | Custom validators, which can be used in the request classes |
| **src/utils/**                | store utility functions and helper modules |
| **src/app.ts/**               | Configures the Express server, routes, middleware, Socket.IO, and error handling for the Auction Portal.  |
| **src/index.ts/**             |  Establishes a database connection, synchronizes models, and starts the server on the specified port.|
| **src/sequelize-client/**     | Initializes Sequelize with database configurations, defines models, and sets up their associations. |
| .env                          | Environment configuration |
| .env.sample                   | Provides a template for environment variables required to configure the application |


## ❯ Deployment

#### Prerequisites
- GitHub account
- Vercel account
- Project pushed to a GitHub repository

#### Deployment Steps

1. **Install Vercel CLI (Optional but Recommended)**
   ```bash
   npm install -g vercel
2.Vercel Deployment

Option A: Via Vercel Website

- Go to vercel.com
- Log in with GitHub
- Click "New Project"
- Select your repository
- Configure build settings
- Click "Deploy"

Option B: Using Vercel CLI
 - Login to Vercel:- vercel login
 - Deploy (development):- vercel
 - Deploy to production:- vercel --prod


