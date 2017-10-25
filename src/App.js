import React, { Component } from 'react';

import MissingSets from './MissingSets';
import ImportedSets from './ImportedSets';

class App extends Component {
  state = {
    setsByCode: {},
    mtgJsonSets: [],
    loadingMtgJson: false
  };

  getMtgSets() {
    this.setState({
      loadingMtgJson: true
    });

    fetch('https://mtgjson.com/json/AllSets.json')
      .then(res => res.json())
      .then(data => {
        const sets = Object.keys(data).map(code => data[code]);

        this.setState({
          loadingMtgJson: false,
          setsByCode: data,
          mtgJsonSets: sets
        });
      })
      .catch(e => {
        console.log(e);
        this.setState({
          loadingMtgJson: false
        });
      });
  }

  componentDidMount() {
    this.getMtgSets();
  }

  render() {
    const { mtgJsonSets, setsByCode, loadingMtgJson } = this.state;

    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden'
        }}>
        <div className="p-3 bg-light w-25">
          <MissingSets
            setsByCode={setsByCode}
            mtgJsonSets={mtgJsonSets}
            loading={loadingMtgJson}
          />
        </div>
        <div className="p-3 w-75">
          <ImportedSets mtgJsonSets={mtgJsonSets} setsByCode={setsByCode} />
        </div>
      </div>
    );
  }
}

export default App;
