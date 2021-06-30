/*global chrome*/

import React from "react";
import renderer from "react-test-renderer";

import App from "../../components/App";
import testingTools from "../../utils/testingTools";

global.chrome = {
  tabs: {
    query: () => {},
  },
  storage: {
    local: {
      get: () => {},
      set: () => {},
    },
  },
};

describe("App", () => {
  it.only("renders", async () => {
    const component = renderer.create(<App />);
    await Promise.resolve();
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
