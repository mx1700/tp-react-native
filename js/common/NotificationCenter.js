/**
 * @providesModule NotificationCenter
 */

let events = { };

function addLister(name, fun) {
    if (!events[name]) {
        events[name] = [];
    }
    events[name].push(fun);
}

function removeLister(name, fun) {
    events[name] = events[name].filter(it => it !== fun)
}

function trigger(name, args = null) {
    if (events[name]) {
        events[name].forEach(it => it(args));
    }
}

module.exports = {
    addLister: addLister,
    removeLister: removeLister,
    trigger: trigger,
};