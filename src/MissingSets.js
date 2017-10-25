import React, { Component } from 'react';
import { graphql, gql, compose, withApollo } from 'react-apollo';
import differenceBy from 'lodash/differenceBy';
import pick from 'lodash/pick';
import slug from 'slug';

import SortBy from './SortBy';
import Scrollable from './Scrollable';
import { setsQuery, setFragment } from './ImportedSets';
import SetListItem from './SetListItem';
import withFields from './withFields';

class MissingSets extends Component {
  state = {
    importingSetCode: ''
  };

  handleImportClick = async code => {
    const { setsByCode, createSet } = this.props;

    this.setState({
      importingSetCode: code
    });

    const set = setsByCode[code];

    const cleanSet = pick(set, this.props.fields);

    // TODO: make graphcool service auto add slugs on set save
    cleanSet.slug = slug(set.name, {
      lower: true
    });

    const graphcoolSet = await createSet({
      variables: cleanSet
    });

    this.setState({
      importingSetCode: ''
    });
  };

  render() {
    const { sets, mtgJsonSets, loading } = this.props;

    const { importingSetCode } = this.state;

    const diff = differenceBy(mtgJsonSets, sets.allSets, 'code');

    if (loading) {
      return 'Loading...';
    }

    return (
      <SortBy items={diff} options={['releaseDate', 'name', 'type']}>
        {({ items, form }) => {
          const Header = (
            <div className="bg-light pb-2">
              <h5>
                Missing Sets{' '}
                <span className="badge badge-dark">{diff.length}</span>
              </h5>
              {form}
            </div>
          );

          return (
            <Scrollable header={Header}>
              <ul className="list-group">
                {items.map(set => {
                  const loading = importingSetCode === set.code;
                  return (
                    <li key={set.code} className="list-group-item">
                      <SetListItem name={set.name} type={set.type}>
                        <button
                          onClick={e => this.handleImportClick(set.code)}
                          className="btn btn-outline-primary btn-sm"
                          disabled={loading}>
                          {loading ? 'importing...' : 'import'}
                        </button>
                      </SetListItem>
                    </li>
                  );
                })}
              </ul>
            </Scrollable>
          );
        }}
      </SortBy>
    );
  }
}

const createSetMutation = gql`
  mutation createSet(
    $name: String!
    $code: String!
    $slug: String!
    $magicCardsInfoCode: String
    $gathererCode: String
    $oldCode: String
    $releaseDate: DateTime!
    $border: String
    $type: String
    $block: String
  ) {
    createSet(
      name: $name
      code: $code
      slug: $slug
      magicCardsInfoCode: $magicCardsInfoCode
      gathererCode: $gathererCode
      oldCode: $oldCode
      releaseDate: $releaseDate
      border: $border
      type: $type
      block: $block
    ) {
      ...SetItem
    }
  }
  ${setFragment}
`;

const withCreateSet = graphql(createSetMutation, {
  name: 'createSet',
  options: {
    update: (proxy, { data: { createSet } }) => {
      const data = proxy.readQuery({ query: setsQuery });

      data.allSets.push(createSet);

      proxy.writeQuery({ data, query: setsQuery });
    }
  }
});

const withSets = graphql(setsQuery, {
  name: 'sets',
  options: {
    fetchPolicy: 'cache-only'
  }
});

const withSetFields = withFields('Set', ['id']);

export default compose(withSets, withSetFields, withApollo, withCreateSet)(
  MissingSets
);
