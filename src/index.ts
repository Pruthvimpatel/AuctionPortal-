import * as dotenv from 'dotenv';
dotenv.config();

import {app} from './app';
import { server } from './app';
import db from './sequelize-client';
const PORT = process.env.PORT || 8000

const startServer = async () => {
try {
    await db.sequelize.sync({force: false});
    console.log('Database Connection Succeed');

    server.listen(PORT, () => {
        console.log(`Server Listening on port ${PORT}`);
    });
} catch(error) {
    console.log("Unable to start the server:",error)
}
};

startServer();