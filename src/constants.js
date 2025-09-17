// For Local:       http://localhost:8082
// For Deployment:  https://www.api.me-db.app
const json = {
    'SERVER_URL': "http://localhost:8082",
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
    'books' : {
        'title' : 'e.g. Percy Jackson',
        'tags' : 'e.g. fiction, mythology, romance',
        'description' : '[How You Feel About Reading This]'
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
    },
    // Stats Page Configuration
    'statsPage': {
        'title': 'My Dashboard',
        'totalRecords': 'Total Records',
        'totalCollection': 'Total Collection',
        'totalToDo': 'Total To-Do',
        'noCustomTypes': 'No Custom Types to show',
        'yearFilter': {
            'all': 'All',
            'toDo': 'To Do',
            'collection': 'Collection'
        },
        'tierFilter': {
            'label': 'Select Tier:',
            'default': 'S'
        },
        'tierSort': {
            'sTier': 'S Tier % desc',
            'aTier': 'A Tier % desc',
            'bTier': 'B Tier % desc',
            'cTier': 'C Tier % desc',
            'dTier': 'D Tier % desc',
            'fTier': 'F Tier % desc',
            'type': 'Type'
        }
    },
    // Type Colors for Charts
    'typeColors': {
        'anime': '#FF6B6B',
        'tv': '#4ECDC4',
        'movies': '#45B7D1',
        'games': '#96CEB4',
        'restaurants': '#FFEAA7',
        'dates': '#DDA0DD',
        'meals': '#98D8C8',
        'snacks': '#F7DC6F',
        'travel': '#BB8FCE',
        'trends': '#85C1E9',
        'products': '#F8C471',
        'alcohol': '#E74C3C',
        'concerts': '#9B59B6'
    },
    // Custom Type Colors - will cycle through these for custom types
    'customTypeColors': [
        '#FF6B6B', // Red
        '#4ECDC4', // Teal
        '#45B7D1', // Blue
        '#96CEB4', // Green
        '#FFEAA7', // Yellow
        '#DDA0DD', // Plum
        '#98D8C8', // Mint
        '#F7DC6F', // Gold
        '#BB8FCE', // Lavender
        '#85C1E9', // Sky Blue
        '#F8C471', // Orange
        '#E74C3C', // Crimson
        '#9B59B6', // Purple
        '#95A5A6', // Gray
        '#E67E22', // Carrot
        '#27AE60', // Emerald
        '#8E44AD', // Wisteria
        '#D35400', // Pumpkin
        '#16A085', // Green Sea
        '#C0392B', // Pomegranate
        '#2980B9', // Belize Hole
        '#F39C12', // Orange
        '#1ABC9C', // Turquoise
        '#E91E63', // Pink
        '#673AB7', // Deep Purple
        '#3F51B5', // Indigo
        '#2196F3', // Blue
        '#00BCD4', // Cyan
        '#009688', // Teal
        '#4CAF50', // Green
        '#8BC34A', // Light Green
        '#CDDC39', // Lime
        '#FFEB3B', // Yellow
        '#FFC107', // Amber
        '#FF9800', // Orange
        '#FF5722', // Deep Orange
        '#795548', // Brown
        '#9E9E9E', // Blue Grey
        '#607D8B'  // Blue Grey
    ],
    // Main Colors for UI Components
    'mainColors': {
        'background': '#2c3e50', // Dark blue-gray background used in ShowMediaList and CreateMedia
        'buttons': '#ffc107',     // Warning/Orange color used for primary buttons
        'table': '#1a252f'        // Darker version of background for table fills
    },
    // Component Styling
    'components': {
        'navbar': {
            'hr': {
                'thickness': '2px',
                'color': '#9ca3af'
            }
        },
        'cards': {
            'desktop': {
                'height': '70px',
                'fontSize': '1rem',
                'titleFontSize': '1rem',
                'yearFontSize': '0.875rem',
                'padding': '8px',
                'minWidth': '140px',
                'maxWidth': '150px'
            }
        }
    }
};

module.exports = json;