import path from 'node:path';
import { MedilogixApiServer } from './ApiServer';
import { loadEnvFile } from './Env';

loadEnvFile(path.join(process.cwd(), '.env'));

const apiServer = new MedilogixApiServer();

apiServer.start()
  .then((baseUrl) => {
    console.log(`MediLogiX API listening at ${baseUrl}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

process.on('SIGINT', () => {
  void apiServer.stop().finally(() => process.exit(0));
});

process.on('SIGTERM', () => {
  void apiServer.stop().finally(() => process.exit(0));
});
