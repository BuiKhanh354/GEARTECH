const { Storage } = require('@google-cloud/storage');
const serviceAccount = require('../firebase-service-account.json');

async function check() {
  const storage = new Storage({
    projectId: serviceAccount.project_id,
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key
    }
  });

  const [buckets] = await storage.getBuckets();
  console.log('Buckets count:', buckets.length);
  buckets.forEach(b => console.log(' -> Bucket Name:', b.name));
}

check().catch(e => console.error('Check error:', e.message));
