// Auto-detect environment and set server URL
// For Local:       http://localhost:8082
// For Deployment:  https://www.api.me-db.live
const isDevelopment = process.env.NODE_ENV === 'development';
const json = {
    'SERVER_URL': isDevelopment ? "http://localhost:8082" : "https://www.api.me-db.live",
    'currentYear': new Date().getFullYear(),
    'examples': {
        'type' : 'e.g. Restaurants',
    },
    'maxCustomTypes': 8,
    // 4 Basic Media Types
    'anime': {
        'title' : 'e.g. One Piece',
        'tags' : 'e.g. shonen, ongoing',
        'description' : '[How You Feel About Watching This]'
    },
    'tv' : {
        'title' : 'e.g. Friends',
        'tags' : 'e.g. sitcom, 90s, 2000s',
        'description' : '[How You Feel About Watching This]'
    },
    'movies': {
        'title' : 'e.g. Kung Fu Panda',
        'tags' : 'e.g. animation, dreamworks',
        'description' : '[How You Feel About Watching This]'
    },
    'games' : {
        'title' : 'e.g. Star Wars: Battlefront II',
        'tags' : 'e.g. shooter, ps4, star-wars',
        'description' : '[How You Feel About Playing This]'
    },
    // Common Types
    'restaurants' : {
        'title' : 'e.g. In n Out',
        'tags' : 'e.g. burgers, fast-food',
        'description' : '[Your Favorite Orders]'
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
    'snacks' : {
        'title' : 'e.g. Pringles',
        'tags' : 'e.g. chips',  // spicy, candy
        'description' : '[How You Feel About Nomming On Dis]'
    },
    'travel' : {
        'title' : 'e.g. Tokyo',
        'tags' : 'e.g. japan, asia, international',
        'description' : '[How You Feel About Visiting This]'
    },
    // Less Common Types
    'trends' : {
        'title' : 'e.g. Dabbing',         
        'tags' : 'e.g. slang, dance',
        'description' : '[How You Feel About Doing This]'
    },
    'products' : {
        'title' : 'e.g. Eye Mask',
        'tags' : 'e.g. sleep, routine',
        'description' : '[How You Feel About Using This]'
    },
    'alcohol' : {
        'title' : 'e.g. Sangria',
        'tags' : 'e.g. wine, fruity',
        'description' : '[How You Feel About Drinking This]'
    },
    'concerts' : {
        'title' : 'e.g. Avril Lavigne',
        'tags' : 'e.g. pop-punk, 2000s',
        'description' : '[How You Feel About Attending This]'
    },
    'other' : {
        'title' : 'e.g. Something-Cool',
        'tags' : 'Add a cool tag here to categorize this',
        'description' : '[How You Feel About Experiencing This]'
    }
};

module.exports = json;