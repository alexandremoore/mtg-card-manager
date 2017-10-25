import React, { Component } from 'react';
import { graphql, gql, compose, withApollo } from 'react-apollo';
import slug from 'slug';
import cx from 'classnames';
import differenceBy from 'lodash/differenceBy';
import pick from 'lodash/pick';

import SortBy from './SortBy';
import Scrollable from './Scrollable';
import CountBadge from './CountBadge';
import withFields from './withFields';

import { setsQuery } from './ImportedSets';

// TODO: need to deduplicate rulings and legalities
class Cards extends Component {
  state = {
    syncingCards: false
  };

  fetchSet = async code => {
    return fetch(`http://mtgjson.com/json/${code}-x.json`).then(res =>
      res.json()
    );
  };

  getLegalities = async (legalities = []) => {
    if (legalities.length === 0) {
      return [];
    }

    const { client } = this.props;

    return Promise.all(
      legalities.map(async item => {
        const { format, legality } = item;

        const query = gql`
          query legalities($format: String!, $legality: String!) {
            allCardLegalities(
              filter: { format: $format, legality: $legality }
              first: 1
            ) {
              id
            }
          }
        `;

        const variables = {
          format,
          legality
        };

        const result = await client.query({
          query,
          variables
        });

        if (result.data.allCardLegalities && result.data.allCardLegalities[0]) {
          return Promise.resolve(result.data.allCardLegalities[0].id);
        }

        const mutation = gql`
          mutation addLegality($format: String!, $legality: String!) {
            createCardLegality(format: $format, legality: $legality) {
              id
            }
          }
        `;

        const newLegality = await client.mutate({
          mutation,
          variables
        });

        return Promise.resolve(newLegality.data.createCardLegality.id);
      })
    );
  };

  getRulings = async (rulings = []) => {
    if (rulings.length === 0) {
      return Promise.resolve();
    }

    const { client } = this.props;

    return Promise.all(
      rulings.map(async ruling => {
        const query = gql`
          query rulings($date: DateTime!, $text: String!) {
            allCardRulings(filter: { date: $date, text: $text }) {
              id
            }
          }
        `;

        const variables = {
          date: new Date(ruling.date),
          text: ruling.text
        };

        const result = await client.query({
          query,
          variables
        });

        if (result.data.allCardRulings && result.data.allCardRulings[0]) {
          return result.data.allCardRulings[0].id;
        }

        // const createRulingMutation = gql`
        //   mutation createRuling($date: DateTime!, $text: String!) {
        //     createCardRuling(text: $text, date: $date) {
        //       id
        //     }
        //   }
        // `;

        // const newRuling = await client.mutate({
        //   mutation: createRulingMutation,
        //   variables
        // });

        // return newRuling.data.createCardRuling.id;
      })
    );
  };

  createCard = async (setId, card) => {
    const { createCard, fields: cardFields } = this.props;

    if (cardFields.length === 0) {
      return Promise.reject('card fields need to be loaded');
    }

    // prettier-ignore
    const {
      id,
      loyalty,
      // legalities,
      // rulings,
      ...rest
    } = card;

    const cleanCard = pick(rest, cardFields);

    const cardSlug = slug(card.name, {
      lower: true
    });

    // const legalitiesIds = await this.getLegalities(legalities);

    // console.log(legalitiesIds);

    // console.log(cleanCard);

    // const rulingsIds = await this.getRulings(rulings);

    // const filteredLegalities = legalities.filter(item =>
    //   ['Standard', 'Commander', 'Legacy', 'Modern', 'Vintage'].includes(
    //     item.format
    //   )
    // );

    const newCard = {
      mtgjsonId: id,
      slug: cardSlug,
      loyalty: loyalty ? String(loyalty) : null,
      // legalities: filteredLegalities,
      // legalitiesIds,
      // rulingsIds,
      setId,
      ...cleanCard
    };

    return createCard({
      variables: newCard
    });
  };

  importCard = async card => {
    const { match } = this.props;
    const { setId } = match.params;

    const graphcoolCard = await this.createCard(setId, card);

    return graphcoolCard;
  };

  importCards = async () => {
    const { match } = this.props;
    const { setCode } = match.params;

    this.setState({
      syncingCards: true
    });

    try {
      const { cards } = await this.fetchSet(setCode);

      if (cards.length === 0) {
        return Promise.reject('no cards');
      }

      const result = await Promise.all(cards.map(this.importCard));

      this.setState({
        syncingCards: false
      });
    } catch (err) {
      console.error(err);
      this.setState({
        syncingCards: false
      });
    }
  };

  handleImportCardsClick = e => {
    this.importCards();
  };

  render() {
    const { setsByCode = {}, match, cards = { allCards: [] } } = this.props;

    const { syncingCards } = this.state;

    if (cards.loading) {
      return 'loading...';
    }

    const set = setsByCode[match.params.setCode] || {};

    const diff = differenceBy(set.cards, cards.allCards, 'name');

    const missing = diff ? diff.length : 0;

    return (
      <SortBy items={cards.allCards} options={['name']}>
        {({ items, form }) => {
          const Header = (
            <div style={{ background: '#fff' }}>
              <div>
                <h6>
                  {set.name}{' '}
                  <CountBadge
                    count={cards.allCards.length}
                    total={set.cards ? set.cards.length : 0}
                  />
                </h6>
              </div>
              {form}
            </div>
          );

          return (
            <Scrollable header={Header}>
              {missing > 0 && (
                <button
                  onClick={this.handleImportCardsClick}
                  className="btn btn-primary btn-sm"
                  disabled={syncingCards}>
                  {syncingCards
                    ? `importing ${missing} missing cards...`
                    : `import ${missing} missing cards`}
                </button>
              )}
              <ul className="list-group">
                {items.map(card => (
                  <li key={card.id} className="list-group-item">
                    {card.name}
                    <br />
                    <small>{card.type}</small>
                  </li>
                ))}
              </ul>
            </Scrollable>
          );
        }}
      </SortBy>
    );
  }
}

const setCardsQuery = gql`
  query cards($setCode: String) {
    allCards(filter: { set: { code: $setCode } }) {
      id
      name
      type
    }
  }
`;

const withSetCards = graphql(setCardsQuery, {
  name: 'cards',
  skip: props => !props.match.params.setCode,
  options: props => ({
    variables: {
      setCode: props.match.params.setCode
    }
  })
});

const createCardMutation = gql`
  mutation addCard(
    $setId: ID!
    $slug: String!
    $artist: String
    $cmc: Int
    $colorIdentity: [String!]
    $colors: [String!]
    $flavor: String
    $imageName: String
    $layout: String
    $legalities: [CardlegalitiesCardLegality!]
    $legalitiesIds: [ID!]
    $loyalty: String
    $manaCost: String
    $mciNumber: String
    $mtgjsonId: String
    $multiverseid: Int
    $name: String!
    $names: [String!]
    $number: String
    $originalText: String
    $originalType: String
    $power: String
    $printings: [String!]
    $rarity: String
    $rulings: [CardrulingsCardRuling!]
    $rulingsIds: [ID!]
    $side: String
    $source: String
    $subtype: String
    $subtypes: [String!]
    $supertypes: [String!]
    $text: String
    $toughness: String
    $type: String
    $types: [String!]
  ) {
    createCard(
      setId: $setId
      slug: $slug
      artist: $artist
      cmc: $cmc
      colorIdentity: $colorIdentity
      colors: $colors
      flavor: $flavor
      imageName: $imageName
      layout: $layout
      legalities: $legalities
      legalitiesIds: $legalitiesIds
      loyalty: $loyalty
      manaCost: $manaCost
      mciNumber: $mciNumber
      mtgjsonId: $mtgjsonId
      multiverseid: $multiverseid
      name: $name
      names: $names
      number: $number
      originalText: $originalText
      originalType: $originalType
      power: $power
      printings: $printings
      rarity: $rarity
      rulings: $rulings
      rulingsIds: $rulingsIds
      side: $side
      source: $source
      subtype: $subtype
      subtypes: $subtypes
      supertypes: $supertypes
      text: $text
      toughness: $toughness
      type: $type
      types: $types
    ) {
      id
      name
      type
      set {
        id
        code
        _cardsMeta {
          count
        }
      }
    }
  }
`;

const withCreateCard = graphql(createCardMutation, {
  name: 'createCard',
  options: {
    update: (proxy, { data: { createCard } }) => {
      const query = setCardsQuery;
      const variables = {
        setCode: createCard.set.code
      };
      const data = proxy.readQuery({
        query,
        variables
      });
      data.allCards.push(createCard);
      proxy.writeQuery({ query, variables, data });
    }
  }
});

const withCardFields = withFields('Card', ['id']);

export default compose(
  withApollo,
  withCardFields,
  withSetCards,
  withCreateCard
)(Cards);
