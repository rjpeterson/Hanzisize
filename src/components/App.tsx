/*global chrome*/
import React, { useState, useEffect } from "react";
import Upper from "./Upper/Upper";
import Lower from "./Lower/Lower";
import ErrorMessage from "./ErrorMessage";
import testingTools from "../utils/testingTools";
import { ContentResponse, ValidityCheck, StoredData } from "../../types";

import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import theme from "./theme";
import "fontsource-roboto";

testingTools.setupTestEnv();

const useStyles = makeStyles({
  container: {
    width: 340,
    backgroundColor: theme.palette.secondary.main,
    overflow: "hidden",
    flexDirection: "row",
  },
});

function App() {
  const classes = useStyles();

  const [minFontSize, setMinFontSize] = useState<StoredData["minFontSize"]>(0);
  const [language, setLanguage] = useState<StoredData["language"]>("chinese");
  const [iFrames, setiFrames] =
    useState<ContentResponse["multipleFrames"]>(false);
  const [errorMessage, setErrorMessage] =
    useState<ValidityCheck["message"]>("");

  useEffect(() => {
    const main = () => {
      testingTools.devLog('sending "get stored data" message to background.js');

      chrome.runtime.sendMessage(
        { message: "get stored data" },
        (response: StoredData) => {
          testingTools.devLog(
            `app.js received storedData: ${JSON.stringify(
              response
            )} from background.js`
          );

          const storedMinFontSize = response.minFontSize;
          const storedLanguage = response.language;
          setMinFontSize(storedMinFontSize);
          setLanguage(storedLanguage);

          // send content object to background.js
          testingTools.devLog(
            'sending "popup opened" message to background.js'
          );
          chrome.runtime.sendMessage(
            {
              message: "popup opened",
              data: {
                minFontSize: storedMinFontSize,
                language: storedLanguage,
              },
            },
            (response) => {
              if (response) {
                // disply any url invalid or injection error messages received
                if (response.invalidUrlMessage || response.injectionError) {
                  setErrorMessage(
                    response.invalidUrlMessage || response.injectionError
                  );
                } else {
                  // display iframe warning
                  setiFrames(response.multipleFrames);
                }
              }
            }
          );
        }
      );
    };

    main();
  }, []);

  // fire resizing when user selects a new language from dropdown
  const handleLangChange = (newLanguage: string) => {
    // first store new language
    testingTools.devLog("pushing new language to storage");

    // send lang object to background.js
    chrome.runtime.sendMessage(
      { message: "handle lang change", language: newLanguage },
      (response) => {
        testingTools.devLog(`handleLangChange: ${JSON.stringify(response)}`);
      }
    );

    // finally update state
    setLanguage(newLanguage);
  };

  // fire resizing when user inputs a new minimum font size
  const handleFSChange = (minFontSize: number) => {
    // first store new minfontsize
    testingTools.devLog("pushing new font size to storage");

    chrome.runtime.sendMessage(
      { message: "handle font size change", minFontSize: minFontSize },
      (response) => {
        testingTools.devLog(`handleFSChange: ${JSON.stringify(response)}`);
      }
    );

    // finally update state
    setMinFontSize(minFontSize);
  };

  // display any error messages recieved
  if (errorMessage) {
    testingTools.devLog("display error message");
    return <ErrorMessage errorMessage={errorMessage} />;
  }
  // display active interface
  else {
    testingTools.devLog("display active interface");
    return (
      <ThemeProvider theme={theme}>
        <Container
          className={classes.container}
          disableGutters
          fixed={true}
          maxWidth="xs"
        >
          <div className="App">
            <Upper language={language} changeHandler={handleLangChange} />
            <Lower
              minFontSize={minFontSize}
              changeHandler={handleFSChange}
              iFrames={iFrames}
            />
          </div>
        </Container>
      </ThemeProvider>
    );
  }
}

export default App;
