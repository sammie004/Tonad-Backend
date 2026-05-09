const uuid = require('uuid');

function generatePublicId() {
    return uuid.v4(); // Generate a random UUID (version 4)
}

module.exports = generatePublicId;