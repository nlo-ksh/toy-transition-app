import logo from './logo.svg';
import './App.css';
import React from 'react';
import ButtonList from './ButtonList';
//import {observer} from 'mobx-react-lite';
import {observer as observerNew} from 'mobx-react-lite4';
import {observer as observerOld} from 'mobx-react-lite3';
import { createStore, mutatorAction } from 'satcheljs';
import {
  RecoilRoot,
  atom,
  useRecoilState,
} from 'recoil';
import { myStore } from './myStore';
import { MountCallback } from './MountCallback';

const store = createStore('text', {text: "TEST", count: 0});

const setText = mutatorAction('SET_TEXT', function(newText) {
  store().text = newText;
});

const upCount = mutatorAction('UP_COUNT', function() {
  store().count++;
});

const textAtom = atom({
  key: 'textAtom',
  default: 'TEST3',
});

let startTime = 0.0;
let counting = false;

const startTimer = function() {
  const d = new Date();
  startTime = d.getTime();
};

var accumulatedTimer = 0.0;
var timerCount = -1000;

const endTimer = function() {
  quietEndTimer();
  console.log(accumulatedTimer, ", ", timerCount);
  console.log("Average render time: ", accumulatedTimer/(timerCount == 0? 0.000001 : timerCount));
}

const printTimerData = function() {
  console.log(accumulatedTimer, ", ", timerCount);
  console.log("Average render time: ", accumulatedTimer/(timerCount == 0? 0.000001 : timerCount));
}

const quietEndTimer = function() {
  const d = new Date();
  accumulatedTimer += d.getTime() - startTime;
  timerCount++;
}

const resetTimer = function() {
  accumulatedTimer = 0.0;
  timerCount = 0;
  counting = true;
}

// State: x.0 for no startTransition. x.5 for startTransition
// 0.x for react managed state
// 1.x for mobx managed state directly used
// 2.x for mobx managed state through useDeferredValue
// 3.x for my state managed through useSyncExternalStore
// 4.x for running count experiment

  let x = 0;
  let kickedOff = false;
const AppBase = function AppBase() {
  const [getMode, setMode] = React.useState(0.0);
  const [getState, setState] = React.useState("TEST2");
  const [getAtom, setAtom] = useRecoilState(textAtom);

  let inputRef = null;
  const setRef = element => {
    inputRef = element;
  };

  const deferredText = React.useDeferredValue(store().text)
  const syncStore = React.useSyncExternalStore(myStore.subscribe, myStore.getSnapshot);
  const buttonVal = React.useMemo(() => {
    if (getMode < 1.0) {
      return getState;
    } else if (getMode < 2.0) {
      return store().text;
    } else if (getMode < 3.0) {
      return deferredText;
    } else if (getMode < 4.0) {
      return myStore.getText();
    } else if (getMode < 5.0) {
      return store().count;
    } else {
      return getAtom;
    }
  }, [getMode, getState, store().text, deferredText, myStore.getText(), store().count, getAtom]);

  const updateTextState = () => {
    if (getMode < 1.0) {
      setState(inputRef.value);
    } else if (getMode < 3.0) {
      setText(inputRef.value);
    } else if (getMode < 4.0) {
      myStore.changeText(parseInt(inputRef.value));
    } else if (getMode < 6.0) {
      setAtom(inputRef.value);
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
    performance.mark("startRender " + x)
    kickedOff = true;
    updateText();
  });

  React.useEffect(() => {
    console.log("New mode: ", getMode);
  }, [getMode]);

  const finishedRender = React.useCallback(async () => {
    if (kickedOff) {
    kickedOff = false;
    performance.mark("endRender " + x);
    x += 1;
    
    console.log(performance.getEntriesByType('mark'));
    
        // Initialize page timings
        var pageTimings = window._pageTimings || (window._pageTimings = {});

        // Collect perf metrics from page and add them to pageTimings object
        performance.getEntriesByType('mark').forEach(perfMark =>{
          pageTimings[perfMark.name] = Math.round(perfMark.startTime);
        }
      );
    }
    quietEndTimer();
    if (counting && store().count >= 0 && store().count < 5000) {
      if (store().count % 500 == 0) {
        printTimerData();
        resetTimer();
      }
      await new Promise(r => setTimeout(r, 500));
      startTimer();
    performance.mark("startRender " + x)
    kickedOff = true;
      upCount();
      console.log("here?");
    } else {
      counting = false;
    }
  });

  const runExperiment = React.useCallback(async () => {
    resetTimer();
    startTimer();
    performance.mark("startRender " + x)
    kickedOff = true;
    upCount(); 
  });

  return (
    <MountCallback callback={finishedRender}>
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

      <div>
        Current count: {store().count}
      </div>
      <div>
        <button onClick={runExperiment}>Run experiment</button>
      </div>
      <div>
        <button onClick={() => {setMode(getMode + (0 - parseInt(getMode)))}}>React state</button>
        <button onClick={() => {setMode(getMode + (1 - parseInt(getMode)))}}>Mobx state</button>
        <button onClick={() => {setMode(getMode + (2 - parseInt(getMode)))}}>Mobx state useDefferredValue</button>
        <button onClick={() => {setMode(getMode + (3 - parseInt(getMode)))}}>Custom sync state</button>
        <button onClick={() => {setMode(getMode + (4 - parseInt(getMode)))}}>Rerender experiment</button>
        <button onClick={() => {setMode(getMode + (5 - parseInt(getMode)))}}>Recoil</button>
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
    </MountCallback>
  );
};

const AppNew = observerNew(AppBase);
const AppOld = observerOld(AppBase);

const App = function App({startAsNewMobx}) {
  let initVersion = false;
  if (startAsNewMobx) {
    initVersion = true;
  }
  const [isNewVersion, setIsNewVersion] = React.useState(initVersion);

  const toggleVersion = React.useCallback(() => {setIsNewVersion(!isNewVersion);}, [isNewVersion]);
  console.log(isNewVersion);
  let VersionedApp = isNewVersion ? AppNew : AppOld;
  return (
    <RecoilRoot><div>
    Mobx version: {isNewVersion ? "new" : "old"}
        <button onClick={() => {const v = isNewVersion; setIsNewVersion(!v);}}>Toggle Version</button>
    <VersionedApp/>
  </div>
  </RecoilRoot>);
};

export default App;
