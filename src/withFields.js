import React, { Component } from 'react';
import { gql, withApollo } from 'react-apollo';

/**
 * Introspects a GraphQL type and returns the type's fields as an array of strings.
 * 
 * @param {string} typeName - the graphql type name
 * @param {Array.<string>} exclusions - a list of fields to
 * exclude when passing the fields on
 */
const withFields = (typeName, exclusions = []) => WrappedComponent => {
  class GraphqlFields extends Component {
    state = {
      loadingFields: false,
      fields: []
    };

    componentDidMount() {
      this.setState({
        loadingFields: true
      });

      this.props.client
        .query({
          query: gql`
            query fields($name: String!) {
              __type(name: $name) {
                fields {
                  name
                }
              }
            }
          `,
          variables: {
            name: typeName
          }
        })
        .then(result => {
          const fields = result.data.__type.fields
            .map(f => {
              if (exclusions.includes(f.name)) {
                return false;
              }
              return f.name;
            })
            .filter(Boolean);

          this.setState({
            loadingFields: false,
            fields
          });
        })
        .catch(error => {
          this.setState({
            error,
            loadingFields: false
          });
        });
    }

    render() {
      return <WrappedComponent {...this.props} {...this.state} />;
    }
  }

  return withApollo(GraphqlFields);
};

export default withFields;
