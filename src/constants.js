// For Local:       http://localhost:8082
// For Deployment:  https://www.api.me-db.live
const json = {
    'SERVER_URL': "https://www.api.me-db.live",
    'currentYear': new Date().getFullYear(),
    'examples': {
        'type' : 'e.g. Restaurants',
    },
    // 4 Basic Media Types
    'anime': {
        'title' : 'e.g. One Piece',
        'tags' : 'e.g. shonen',
        'description' : '[How You Feel About Watching This]'
    },
    'tv' : {
        'title' : 'e.g. Friends',
        'tags' : 'e.g. sitcom',
        'description' : '[How You Feel About Watching This]'
    },
    'movies': {
        'title' : 'e.g. Kung Fu Panda',
        'tags' : 'e.g. animation',
        'description' : '[How You Feel About Watching This]'
    },
    'games' : {
        'title' : 'e.g. Star Wars: Battlefront II',
        'tags' : 'e.g. shooter',
        'description' : '[How You Feel About Playing This]'
    },
    // Common Types
    'restaurants' : {
        'title' : 'e.g. McDonald\'s',
        'tags' : 'e.g. burgers',
        'description' : '[What You Got Last Time]'
    },
    'dates' : {
        'title' : 'e.g. Rock Cafe',
        'tags' : 'e.g. live-music',
        'description' : '[How You Feel About Doing This]'
    },
    'meals' : {
        'title' : 'e.g. Dino Nuggies',
        'tags' : 'e.g. oven',
        'description' : '[How You Feel About Eating This]'
    },
    // Less Common Types
    'trends' : {
        'title' : 'e.g. Dabbing',          // tags=slang,dance
    },
    'references' : {
        'title' : 'e.g. Bing Chilling'
    },
    'names' : {
        'title' : 'e.g. Steve'
    },
    'nicknames' : {
        'title' : 'e.g. Steve-o',
    },
    'concerts' : {
        'title' : 'e.g. Halsey'
    },
    'other' : {
        'title' : 'e.g. Something-Cool',
        'tags' : 'Add a cool tag here',
        'description' : '[How You Feel About Experiencing This]'
    }
};

module.exports = json;