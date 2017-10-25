# Magic: The Gathering Cards Manager

> Import MTG cards from [mtgjson](http://mtgjson.com) to a [Graphcool](https://graph.cool) GraphQL database



## Acknowledgements

- This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) so follow their docs for editing and generally working with the app


Also added to this project and general knowledge required:

- [Graphcool](https://github.com/graphcool/graphcool) framework for creating a Graphql API
- [React Apollo](https://github.com/apollographql/react-apollo) for communicating with GraphQL 
- [React Router v4](https://github.com/ReactTraining/react-router) for some simple routing (not that complex right now but may be if we add card editing)

- [Bootstrap v4](https://github.com/twbs/bootstrap/) used for styles

## Getting started

### 1. GraphQL server


The whole point of this app is to import cards from [mtgjson.com](http://mtgjson.com) into a Graphcool service.

> At the time of this repo publishing, graphcool framework is still in early stages, so this is all built on using Graphcool CLI v0.8.2

1. Follow their [docs for setting up graphcool](https://github.com/graphcool/graphcool)

2. Copy the `types.graphql` from this repo into your graphcool service folder

3. Deploy the service `graphcool deploy`

### 2. Setting up the app

Clone the repo

```bash
git clone https://github.com/fateseal/mtg-cards-manager
```

Change directories into the repo

```bash
cd mtg-cards-manager
```

Install dependencies ([yarn](https://yarnpkg.com) recommended)

```bash
yarn
```

> Make sure you have your graphcool service running or deployed to their hosting

Create a `.env` file so you can point Apollo at the correct Graphql server

```
REACT_APP_GRAPHCOOL_URI="https://api.graph.cool/simple/v1/<PROJECT_ID_HERE>"
```



Run the development app
```bash
yarn start
```




### 3. Using the app to import cards

If you want to use the app for actual card management, it's recommended to build the production app and run it locally. There is a noticable performance difference compared to just running the app in development mode. 

As [create-react-app docs state](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#static-server), you can do this with the npm package `serve`.

Install `serve`
```bash
yarn global add serve
```

Build the app
```bash
yarn build
```

Serve the production build
```bash
serve -s build
```

# Permissions

The app has **no authorization rules** set up so this should only be used for importing the cards the first time around, then shut off permissions to editing sets/cards. 


