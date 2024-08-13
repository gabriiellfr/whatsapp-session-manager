const initializeClient = require('./client');
const handleProcessEvents = require('./client-watch');

initializeClient();
handleProcessEvents();
