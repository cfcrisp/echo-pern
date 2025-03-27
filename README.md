# Echo Application

## Docker Setup

This project uses Docker to set up the PostgreSQL database for the Echo application.

### Prerequisites

- Docker and Docker Compose installed on your machine

### Getting Started

1. Start the PostgreSQL database container:

```bash
docker-compose up -d --build
```

2. The database will be initialized with the schema defined in `database-setup.sql`

```bash
docker exec -it <container_id> psql -U admin -d echodb
```

3. Start the server:

```bash
cd server
npm install
node index.js
```

4. Start the client:

```bash
cd client
npm install
npm run serve
```

### Stopping the Containers

To stop the containers:

```bash
docker-compose down
```

To stop and remove volumes (this will delete all data):

```bash
docker-compose down -v
```