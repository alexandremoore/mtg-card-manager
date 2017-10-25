import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import {
  ApolloClient,
  ApolloProvider,
  createNetworkInterface
} from 'react-apollo';

import App from './App';

const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: process.env.REACT_APP_GRAPHCOOL_URI
  })
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('root')
);
