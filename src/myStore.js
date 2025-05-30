let curText = 0;
let count = 0;
let listeners = [];

export const myStore = {
    changeText(newText) {
        curText = newText;
        emitChange();
    },

    addToCount() {
        count++;
        emitChange();
    },

    getText() {
        return curText;
    },

    getCount() {
        return count;
    },

    subscribe(listener) {
        listeners = [...listeners, listener];
        console.log("SUBSCRIBING");
        return () => {
            listeners = listeners.filter(l => l !== listener);
        }
    },
    getSnapshot() {
        return curText;
    }
};

function emitChange() {
    for (let listener of listeners) {
        listener();
    }
}