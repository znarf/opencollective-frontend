import { ApolloClient, HTTPFetchNetworkInterface } from 'react-apollo'
import fetch from 'isomorphic-fetch'

let apolloClient = null

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

import { IntrospectionFragmentMatcher } from 'react-apollo';
const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: {
    __schema: {
      types: [
        {
          kind: "INTERFACE",
          name: "Transaction",
          possibleTypes: [
            { name: "Expense" },
            { name: "Donation" },
          ],
        }
      ],
    },
  }
})

class MyNetworkInterface extends HTTPFetchNetworkInterface {
  async fetchFromRemoteEndpoint(parameters) {
    let start;
    if (process && process.hrtime) {
      start = process.hrtime();
    }
    const result = await super.fetchFromRemoteEndpoint(parameters);
    if (process && process.hrtime) {
      const end = process.hrtime(start);
      const elapsed = end[0] + Math.round(end[1] / 1000000) / 1000;
      if (end[0] === 0) {
        console.log(`>>> GraphQL request in ${elapsed}s`);
      } else {
        console.log(`>>> Slow GraphQL request in ${elapsed}s`);
        console.log(parameters.request);
      }
    }
    return result;
  }
}

function createClient (initialState, options = {}) {

  const headers = {};
  if (options.accessToken) {
    headers.authorization = `Bearer ${options.accessToken}`;
  }

  const networkInterface = new MyNetworkInterface(options.uri, {
    credentials: 'same-origin',
    headers
  });

  return new ApolloClient({
    ssrMode: !process.browser,
    dataIdFromObject: result => `${result.__typename}:${result.id || result.name || result.slug || Math.floor(Math.random()*1000000)}`,
    fragmentMatcher,
    initialState,
    shouldBatch: true, // should speed up performance
    networkInterface: networkInterface
  })
}

export function initClient (initialState, options) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return createClient(initialState, options)
  }

  // Reuse client on the client-side unless we have an access token
  if (!apolloClient) {
    options.accessToken = process.browser && window.localStorage.getItem('accessToken');
    apolloClient = createClient(initialState, options)
  }

  return apolloClient
}
