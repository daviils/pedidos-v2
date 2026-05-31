import { provideHttpClient } from '@angular/common/http';
import { inject, type ApplicationConfig } from '@angular/core';
import { ApolloLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

const GRAPHQL_URI = 'http://localhost:3000/graphql';

export const graphqlProviders: ApplicationConfig['providers'] = [
  provideHttpClient(),
  provideApollo(() => {
    const httpLink = inject(HttpLink);
    const authLink = setContext((_, context) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return context;
      }
      return {
        headers: {
          ...context.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    });

    return {
      link: ApolloLink.from([
        authLink,
        httpLink.create({
          uri: GRAPHQL_URI,
        }),
      ]),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: 'no-cache',
        },
        watchQuery: {
          fetchPolicy: 'no-cache',
        },
      },
    };
  }),
];
