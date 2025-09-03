import React from 'react';
import MyButton from './MyButton';

export default function ButtonList({name}) {
    let buttons = [];
      for (var i = 0; i < 1000; i++) {
        buttons.push(<MyButton name={name}></MyButton>)
    }

    return (<div>
        {buttons}
    </div>)
}