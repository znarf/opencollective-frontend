import fetch from 'node-fetch';

export default async function handle(req, res) {
  const graphqlUrl = `${process.env.API_URL}/graphql/v1?api_key=${process.env.API_KEY}`;

  const Authorization = req.headers.authorization || req.headers.Authorization;

  const headers = Authorization ? { Authorization } : {};

  const json = await fetch(graphqlUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body),
  }).then(result => result.json());

  res.setHeader('Content-Type', 'application/json');
  res.json(json);
}
