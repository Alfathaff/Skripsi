import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import Layout from './containers/Layout/Layout';
import Layout2 from './containers/Layout/Layout2';
import MapLayout from './containers/Map/Map';
import HowToUse from './components/HowToUse';
import About from './components/About';

class App extends Component {
  render() {
    return (
      <Layout>
        <Route path="/" exact component={MapLayout} />
        <Route path="/HowToUse" render={() => <Layout2><HowToUse /></Layout2>} />
        <Route path="/About" render={() => <Layout2><About /></Layout2>} />
      </Layout>
    );
  }
}

export default App;