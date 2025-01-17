import logo from './logo.svg';
import './App.css';
import React from 'react';
import ButtonList from './ButtonList';
import {observer} from 'mobx-react-lite';
import { createStore, mutatorAction } from 'satcheljs';

const store = createStore('text', {text: "TEST"});

const setText = mutatorAction('SET_TEXT', function(newText) {
  store().text = newText;
});

// State: x.0 for no startTransition. x.5 for startTransition
// 0.x for react managed state
// 1.x for mobx managed state directly used
// 2.x for mobx managed state through useDeferredValue

const App = observer(function App() {
  const [getMode, setMode] = React.useState(0.0);
  const [getState, setState] = React.useState("TEST2");

  let inputRef = null;
  const setRef = element => {
    inputRef = element;
  };

  const deferredText = React.useDeferredValue(store().text)
  const buttonVal = React.useMemo(() => {
    if (getMode < 1.0) {
      return getState;
    } else if (getMode < 2.0) {
      return store().text;
    } else {
      return deferredText;
    }
  }, [getMode, getState, store().text, deferredText]);

  const updateTextState = () => {
    if (getMode < 1.0) {
      setState(inputRef.value);
    } else if (getMode < 3.0) {
      setText(inputRef.value);
    }
  }

  const updateText = () => {
    if (parseInt(getMode) != getMode) {
      React.startTransition(() => {updateTextState()});
    } else {
      updateTextState();
    }
  }

  const setButtons = React.useCallback(() => {
    updateText();
  });

  React.useEffect(() => {
    console.log("New mode: ", getMode);
  }, [getMode]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

      <div>
        <button onClick={() => {setMode(getMode + (0 - parseInt(getMode)))}}>React state</button>
        <button onClick={() => {setMode(getMode + (1 - parseInt(getMode)))}}>Mobx state</button>
        <button onClick={() => {setMode(getMode + (2 - parseInt(getMode)))}}>Mobx state useDefferredValue</button>
      </div>
      <div>
        <button onClick={() => {setMode(parseInt(getMode))}}>no startTransition</button>
        <button onClick={() => {setMode(0.5 + parseInt(getMode))}}>startTransition</button>
      </div>
      <input ref={setRef}></input>
      <button onClick={setButtons}>Reset</button>
      <ButtonList name={buttonVal}></ButtonList>
      </header>
    </div>
  );
});

export default App;
