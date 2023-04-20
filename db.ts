import { MongoClient, Collection } from "mongodb";

export async function connectToDb(name: string) {
  const uri = `${process.env.DB_URI}`;
  const database = `${process.env.DB_DATABASE}`;
  const collection_name = name;

  const client = new MongoClient(uri);

  await client.connect();

  const collection: Collection = client
    .db(database)
    .collection(collection_name);

  return { client, collection };
}
