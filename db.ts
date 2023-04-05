
import { MongoClient, Collection } from 'mongodb';

export async function connectToDb() {
  const uri = `${process.env.DB_USER}`;
  const database =`${process.env.DB_DATABASE}`;
  const collection_name =`${process.env.DB_COLLECTION}`;

  const client = new MongoClient(uri);

  await client.connect();

  const collection: Collection = client.db(database).collection(collection_name);

  return { client, collection };
}
