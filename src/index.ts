import * as dotenv from 'dotenv';
dotenv.config();
import logger from './logger';

import {app} from './app';
import { server } from './app';
import db from './sequelize-client';
const PORT = process.env.PORT || 8000

const startServer = async () => {
try {
    await db.sequelize.sync({force: false});
    logger.info('Database Connection Succeed');

    server.listen({
        port: PORT,
        host: '0.0.0.0'
    }, () => {
        logger.info(`Server Listening on port ${PORT}`);
    });
} catch(error) {
    logger.info("Unable to start the server:",error)
}
};

startServer();