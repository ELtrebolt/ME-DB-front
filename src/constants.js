// For Local:       http://localhost:8082
// For Deployment:  https://www.api.me-db.tech
const json = {
    'SERVER_URL': "http://localhost:8082",
    'examples': {
        // Constant Media
        'anime' : 'e.g. One Piece',
        'tv' : 'e.g. Friends',
        'movies': 'e.g. Kung Fu Panda',
        'games' : 'e.g. Star Wars: Battlefront II',
        // Sample Types
        'type' : 'e.g. Restaurants',
        'other' : 'e.g. Something-Cool',
        // Common Types
        'restaurants' : 'e.g. McDonald\'s',
        'dates' : 'e.g. Rock Cafe',
        'meals' : 'e.g. Dino Nuggies',
        // Less Common Types
        'trends' : 'e.g. Dabbing',          // tags=slang,dance
        'references' : 'e.g. Bing Chilling',
        'names' : 'e.g. Steve',
        'nicknames' : 'e.g. Steve-o',
        'concerts' : 'e.g. Halsey'
    },
    'currentYear': new Date().getFullYear()
};

module.exports = json;