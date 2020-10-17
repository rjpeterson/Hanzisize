/*global chrome*/

import React from 'react';
import renderer from 'react-test-renderer';
 
import App from '../../components/App';

global.chrome = {
  runtime: {
    getManifest: () => {return {update_url: true}}
  },
  tabs: {
    query: ()=>{}
  },
  storage: {
    local: {
      get: ()=>{},
      set: ()=>{}
    }
  }
}
 
describe('App', () => {
  it('renders', () => {
    const component = renderer.create(<App />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});