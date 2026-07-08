// ─── Ease-Moji Content Script ──────────────────────────────────────
// Floating emoji button → panel with emoji tabs + Premium stickers.

let activeInput = null;
let currentCategory = 'Smileys';
let searchQuery = '';
let currentPage = 'emoji';
let gifSearchController = null;
let stickerSearchController = null;
let wordSearchController = null;
let settings = {};

const CATEGORIES = ['Smileys','Gestures & People','Nature','Food & Drink',
  'Travel & Places','Activities','Objects','Symbols'];
const GIPHY_API_KEY = 'pqsgJ0H0jNyQJnCsqwgJCTBwlj35Ll2h';
const GIPHY_SEARCH_ENDPOINT = 'https://api.giphy.com/v1/gifs/search';
const GIPHY_STICKERS_API_KEY = 'VIwTwYNEcLkDwbEGE1svQGolBhYjmdLn';
const GIPHY_STICKERS_SEARCH_ENDPOINT = 'https://api.giphy.com/v1/stickers/search';
const API_NINJAS_KEY = 'gAyUtCGjfAXGJUJKohVk3tUPYYhehV68ONmg3uum';
const THESAURUS_ENDPOINT = 'https://api.api-ninjas.com/v1/thesaurus';
const DICTIONARY_ENDPOINT = 'https://api.api-ninjas.com/v1/dictionary';

// ── Inline emoji data (no dynamic imports needed) ─────────────

const FREE_EMOJIS = {
  "Smileys": [
    { e: "😀", n: "grinning face" },
    { e: "😃", n: "grinning face with big eyes" },
    { e: "😄", n: "grinning face with smiling eyes" },
    { e: "😁", n: "beaming face with smiling eyes" },
    { e: "😆", n: "grinning squinting face" },
    { e: "😅", n: "grinning face with sweat" },
    { e: "🤣", n: "rolling on the floor laughing" },
    { e: "😂", n: "face with tears of joy" },
    { e: "🙂", n: "slightly smiling face" },
    { e: "🙃", n: "upside-down face" },
    { e: "😉", n: "winking face" },
    { e: "😊", n: "smiling face with smiling eyes" },
    { e: "😇", n: "smiling face with halo" },
    { e: "🥰", n: "smiling face with hearts" },
    { e: "😍", n: "smiling face with heart-eyes" },
    { e: "🤩", n: "star-struck" },
    { e: "😘", n: "face blowing a kiss" },
    { e: "😗", n: "kissing face" },
    { e: "😚", n: "kissing face with closed eyes" },
    { e: "😙", n: "kissing face with smiling eyes" },
    { e: "😋", n: "face savoring food" },
    { e: "😛", n: "face with tongue" },
    { e: "😜", n: "winking face with tongue" },
    { e: "🤪", n: "zany face" },
    { e: "😝", n: "squinting face with tongue" },
    { e: "🤑", n: "money-mouth face" },
    { e: "🤗", n: "hugging face" },
    { e: "🤭", n: "face with hand over mouth" },
    { e: "🤫", n: "shushing face" },
    { e: "🤔", n: "thinking face" },
    { e: "🤐", n: "zipper-mouth face" },
    { e: "🤨", n: "face with raised eyebrow" },
    { e: "😐", n: "neutral face" },
    { e: "😑", n: "expressionless face" },
    { e: "😶", n: "face without mouth" },
    { e: "😏", n: "smirking face" },
    { e: "😒", n: "unamused face" },
    { e: "🙄", n: "face with rolling eyes" },
    { e: "😬", n: "grimacing face" },
    { e: "😮", n: "face with open mouth" },
    { e: "😯", n: "hushed face" },
    { e: "😲", n: "astonished face" },
    { e: "😳", n: "flushed face" },
    { e: "🥺", n: "pleading face" },
    { e: "😦", n: "frowning face with open mouth" },
    { e: "😧", n: "anguished face" },
    { e: "😨", n: "fearful face" },
    { e: "😰", n: "anxious face with sweat" },
    { e: "😥", n: "sad but relieved face" },
    { e: "😢", n: "crying face" },
    { e: "😭", n: "loudly crying face" },
    { e: "😱", n: "face screaming in fear" },
    { e: "😖", n: "confounded face" },
    { e: "😣", n: "persevering face" },
    { e: "😞", n: "disappointed face" },
    { e: "😓", n: "downcast face with sweat" },
    { e: "😩", n: "weary face" },
    { e: "😫", n: "tired face" },
    { e: "🥱", n: "yawning face" },
    { e: "😤", n: "face with steam from nose" },
    { e: "😡", n: "pouting face" },
    { e: "😠", n: "angry face" },
    { e: "🤬", n: "face with symbols on mouth" },
    { e: "😈", n: "smiling face with horns" },
    { e: "👿", n: "angry face with horns" },
    { e: "💀", n: "skull" },
    { e: "☠️", n: "skull and crossbones" },
    { e: "💩", n: "pile of poo" },
    { e: "🤡", n: "clown face" },
    { e: "👹", n: "ogre" },
    { e: "👺", n: "goblin" },
    { e: "👻", n: "ghost" },
    { e: "👽", n: "alien" },
    { e: "👾", n: "alien monster" },
    { e: "🤖", n: "robot" },
    { e: "😺", n: "grinning cat" },
    { e: "😸", n: "grinning cat with smiling eyes" },
    { e: "😹", n: "cat with tears of joy" },
    { e: "😻", n: "smiling cat with heart-eyes" },
    { e: "😼", n: "cat with wry smile" },
    { e: "😽", n: "kissing cat" },
    { e: "🙀", n: "weary cat" },
    { e: "😿", n: "crying cat" },
    { e: "😾", n: "pouting cat" },
    { e: "💋", n: "kiss mark" },
    { e: "💌", n: "love letter" },
    { e: "💘", n: "heart with arrow" },
    { e: "💝", n: "heart with ribbon" },
    { e: "💖", n: "sparkling heart" },
    { e: "💗", n: "growing heart" },
    { e: "💓", n: "beating heart" },
    { e: "💞", n: "revolving hearts" },
    { e: "💕", n: "two hearts" },
    { e: "💟", n: "heart decoration" },
    { e: "❤️", n: "red heart" },
    { e: "🧡", n: "orange heart" },
    { e: "💛", n: "yellow heart" },
    { e: "💚", n: "green heart" },
    { e: "💙", n: "blue heart" },
    { e: "💜", n: "purple heart" },
    { e: "🖤", n: "black heart" },
    { e: "🤍", n: "white heart" },
    { e: "🤎", n: "brown heart" },
    { e: "💔", n: "broken heart" },
    { e: "❣️", n: "heart exclamation" },
    { e: "💯", n: "hundred points" },
    { e: "💢", n: "anger symbol" },
    { e: "💥", n: "collision" },
    { e: "💫", n: "dizzy" },
    { e: "💦", n: "sweat droplets" },
    { e: "💨", n: "dashing away" },
  ],

  "Gestures & People": [
    { e: "👋", n: "waving hand" },
    { e: "🤚", n: "raised back of hand" },
    { e: "🖐️", n: "hand with fingers splayed" },
    { e: "✋", n: "raised hand" },
    { e: "🖖", n: "vulcan salute" },
    { e: "👌", n: "OK hand" },
    { e: "🤌", n: "pinched fingers" },
    { e: "🤏", n: "pinching hand" },
    { e: "✌️", n: "victory hand" },
    { e: "🤞", n: "crossed fingers" },
    { e: "🤟", n: "love-you gesture" },
    { e: "🤘", n: "sign of the horns" },
    { e: "🤙", n: "call me hand" },
    { e: "👈", n: "backhand index pointing left" },
    { e: "👉", n: "backhand index pointing right" },
    { e: "👆", n: "backhand index pointing up" },
    { e: "🖕", n: "middle finger" },
    { e: "👇", n: "backhand index pointing down" },
    { e: "☝️", n: "index pointing up" },
    { e: "🫵", n: "index pointing at the viewer" },
    { e: "👍", n: "thumbs up" },
    { e: "👎", n: "thumbs down" },
    { e: "✊", n: "raised fist" },
    { e: "👊", n: "oncoming fist" },
    { e: "🤛", n: "left-facing fist" },
    { e: "🤜", n: "right-facing fist" },
    { e: "👏", n: "clapping hands" },
    { e: "🙌", n: "raising hands" },
    { e: "👐", n: "open hands" },
    { e: "🤲", n: "palms up together" },
    { e: "🤝", n: "handshake" },
    { e: "🙏", n: "folded hands" },
    { e: "✍️", n: "writing hand" },
    { e: "💅", n: "nail polish" },
    { e: "🤳", n: "selfie" },
    { e: "💪", n: "flexed biceps" },
    { e: "🦵", n: "leg" },
    { e: "🦶", n: "foot" },
    { e: "👂", n: "ear" },
    { e: "👃", n: "nose" },
    { e: "🧠", n: "brain" },
    { e: "🫀", n: "anatomical heart" },
    { e: "🫁", n: "lungs" },
    { e: "🦷", n: "tooth" },
    { e: "👅", n: "tongue" },
    { e: "👁️", n: "eye" },
    { e: "👀", n: "eyes" },
    { e: "👤", n: "bust in silhouette" },
    { e: "👥", n: "busts in silhouette" },
    { e: "🗣️", n: "speaking head" },
    { e: "👶", n: "baby" },
    { e: "🧒", n: "child" },
    { e: "👦", n: "boy" },
    { e: "👧", n: "girl" },
    { e: "🧑", n: "person" },
    { e: "👨", n: "man" },
    { e: "👩", n: "woman" },
    { e: "🧔", n: "person: beard" },
    { e: "👴", n: "old man" },
    { e: "👵", n: "old woman" },
  ],

  "Nature": [
    { e: "🐶", n: "dog face" },
    { e: "🐱", n: "cat face" },
    { e: "🐭", n: "mouse face" },
    { e: "🐹", n: "hamster" },
    { e: "🐰", n: "rabbit face" },
    { e: "🦊", n: "fox" },
    { e: "🐻", n: "bear" },
    { e: "🐼", n: "panda" },
    { e: "🐨", n: "koala" },
    { e: "🐯", n: "tiger face" },
    { e: "🦁", n: "lion" },
    { e: "🐮", n: "cow face" },
    { e: "🐷", n: "pig face" },
    { e: "🐸", n: "frog" },
    { e: "🐵", n: "monkey face" },
    { e: "🐔", n: "chicken" },
    { e: "🐧", n: "penguin" },
    { e: "🐦", n: "bird" },
    { e: "🐤", n: "baby chick" },
    { e: "🦆", n: "duck" },
    { e: "🦅", n: "eagle" },
    { e: "🦉", n: "owl" },
    { e: "🦇", n: "bat" },
    { e: "🐺", n: "wolf" },
    { e: "🐗", n: "boar" },
    { e: "🐴", n: "horse face" },
    { e: "🦄", n: "unicorn" },
    { e: "🐝", n: "honeybee" },
    { e: "🐛", n: "bug" },
    { e: "🦋", n: "butterfly" },
    { e: "🐌", n: "snail" },
    { e: "🐞", n: "lady beetle" },
    { e: "🐜", n: "ant" },
    { e: "🦟", n: "mosquito" },
    { e: "🦗", n: "cricket" },
    { e: "🪳", n: "cockroach" },
    { e: "🦂", n: "scorpion" },
    { e: "🐢", n: "turtle" },
    { e: "🐍", n: "snake" },
    { e: "🦎", n: "lizard" },
    { e: "🦖", n: "T-Rex" },
    { e: "🦕", n: "sauropod" },
    { e: "🐙", n: "octopus" },
    { e: "🦑", n: "squid" },
    { e: "🦐", n: "shrimp" },
    { e: "🐠", n: "tropical fish" },
    { e: "🐟", n: "fish" },
    { e: "🐡", n: "blowfish" },
    { e: "🐬", n: "dolphin" },
    { e: "🐳", n: "spouting whale" },
    { e: "🐋", n: "whale" },
    { e: "🦈", n: "shark" },
    { e: "🌱", n: "seedling" },
    { e: "🌿", n: "herb" },
    { e: "☘️", n: "shamrock" },
    { e: "🍀", n: "four leaf clover" },
    { e: "🌲", n: "evergreen tree" },
    { e: "🌳", n: "deciduous tree" },
    { e: "🌴", n: "palm tree" },
    { e: "🌵", n: "cactus" },
    { e: "🌾", n: "sheaf of rice" },
    { e: "🌻", n: "sunflower" },
    { e: "🌹", n: "rose" },
    { e: "🌷", n: "tulip" },
    { e: "🌸", n: "cherry blossom" },
    { e: "💐", n: "bouquet" },
    { e: "🍄", n: "mushroom" },
    { e: "🌍", n: "globe showing Europe-Africa" },
    { e: "🌎", n: "globe showing Americas" },
    { e: "🌏", n: "globe showing Asia-Australia" },
    { e: "🌕", n: "full moon" },
    { e: "🌙", n: "crescent moon" },
    { e: "⭐", n: "star" },
    { e: "🌟", n: "glowing star" },
    { e: "☀️", n: "sun" },
    { e: "🌈", n: "rainbow" },
    { e: "☁️", n: "cloud" },
    { e: "⛅", n: "sun behind cloud" },
    { e: "⚡", n: "high voltage" },
    { e: "❄️", n: "snowflake" },
    { e: "🔥", n: "fire" },
    { e: "💧", n: "droplet" },
    { e: "🌊", n: "water wave" },
  ],

  "Food & Drink": [
    { e: "🍏", n: "green apple" },
    { e: "🍎", n: "red apple" },
    { e: "🍐", n: "pear" },
    { e: "🍊", n: "tangerine" },
    { e: "🍋", n: "lemon" },
    { e: "🍌", n: "banana" },
    { e: "🍉", n: "watermelon" },
    { e: "🍇", n: "grapes" },
    { e: "🍓", n: "strawberry" },
    { e: "🫐", n: "blueberries" },
    { e: "🍈", n: "melon" },
    { e: "🍒", n: "cherries" },
    { e: "🍑", n: "peach" },
    { e: "🥭", n: "mango" },
    { e: "🍍", n: "pineapple" },
    { e: "🥝", n: "kiwi" },
    { e: "🍅", n: "tomato" },
    { e: "🥑", n: "avocado" },
    { e: "🥦", n: "broccoli" },
    { e: "🥬", n: "leafy green" },
    { e: "🥒", n: "cucumber" },
    { e: "🌽", n: "ear of corn" },
    { e: "🥕", n: "carrot" },
    { e: "🧅", n: "onion" },
    { e: "🧄", n: "garlic" },
    { e: "🥔", n: "potato" },
    { e: "🍠", n: "roasted sweet potato" },
    { e: "🥜", n: "peanuts" },
    { e: "🍞", n: "bread" },
    { e: "🥐", n: "croissant" },
    { e: "🥖", n: "baguette bread" },
    { e: "🧀", n: "cheese wedge" },
    { e: "🥚", n: "egg" },
    { e: "🍳", n: "cooking" },
    { e: "🥓", n: "bacon" },
    { e: "🥩", n: "cut of meat" },
    { e: "🍔", n: "hamburger" },
    { e: "🍟", n: "french fries" },
    { e: "🌭", n: "hot dog" },
    { e: "🍕", n: "pizza" },
    { e: "🫓", n: "flatbread" },
    { e: "🥪", n: "sandwich" },
    { e: "🌮", n: "taco" },
    { e: "🌯", n: "burrito" },
    { e: "🥗", n: "salad" },
    { e: "🍜", n: "steaming bowl" },
    { e: "🍝", n: "spaghetti" },
    { e: "🍣", n: "sushi" },
    { e: "🍱", n: "bento box" },
    { e: "🍛", n: "curry rice" },
    { e: "🍙", n: "rice ball" },
    { e: "🍚", n: "cooked rice" },
    { e: "🍘", n: "rice cracker" },
    { e: "🥟", n: "dumpling" },
    { e: "🥠", n: "fortune cookie" },
    { e: "🍦", n: "soft ice cream" },
    { e: "🍧", n: "shaved ice" },
    { e: "🍨", n: "ice cream" },
    { e: "🍩", n: "doughnut" },
    { e: "🍪", n: "cookie" },
    { e: "🎂", n: "birthday cake" },
    { e: "🍰", n: "shortcake" },
    { e: "🧁", n: "cupcake" },
    { e: "🥧", n: "pie" },
    { e: "🍫", n: "chocolate bar" },
    { e: "🍬", n: "candy" },
    { e: "🍭", n: "lollipop" },
    { e: "🍮", n: "custard" },
    { e: "🍯", n: "honey pot" },
    { e: "☕", n: "hot beverage" },
    { e: "🫖", n: "teapot" },
    { e: "🍵", n: "teacup without handle" },
    { e: "🧋", n: "bubble tea" },
    { e: "🥤", n: "cup with straw" },
    { e: "🧃", n: "beverage box" },
    { e: "🍺", n: "beer mug" },
    { e: "🍻", n: "clinking beer mugs" },
    { e: "🥂", n: "clinking glasses" },
    { e: "🍷", n: "wine glass" },
    { e: "🥃", n: "tumbler glass" },
    { e: "🍸", n: "cocktail glass" },
    { e: "🍹", n: "tropical drink" },
    { e: "🧊", n: "ice" },
  ],

  "Travel & Places": [
    { e: "🚗", n: "car" },
    { e: "🚕", n: "taxi" },
    { e: "🚙", n: "SUV" },
    { e: "🚌", n: "bus" },
    { e: "🚎", n: "trolleybus" },
    { e: "🚓", n: "police car" },
    { e: "🚑", n: "ambulance" },
    { e: "🚒", n: "fire engine" },
    { e: "🚐", n: "minibus" },
    { e: "🚚", n: "delivery truck" },
    { e: "🚛", n: "articulated lorry" },
    { e: "🚜", n: "tractor" },
    { e: "🏎️", n: "racing car" },
    { e: "🏍️", n: "motorcycle" },
    { e: "🛵", n: "motor scooter" },
    { e: "🛴", n: "kick scooter" },
    { e: "🚲", n: "bicycle" },
    { e: "🛹", n: "skateboard" },
    { e: "🚏", n: "bus stop" },
    { e: "🛣️", n: "motorway" },
    { e: "🛤️", n: "railway track" },
    { e: "🚂", n: "locomotive" },
    { e: "🚃", n: "railway car" },
    { e: "🚄", n: "high-speed train" },
    { e: "🚅", n: "bullet train" },
    { e: "🚇", n: "metro" },
    { e: "🚉", n: "station" },
    { e: "✈️", n: "airplane" },
    { e: "🛫", n: "airplane departure" },
    { e: "🛬", n: "airplane arrival" },
    { e: "🛩️", n: "small airplane" },
    { e: "🚁", n: "helicopter" },
    { e: "🛸", n: "flying saucer" },
    { e: "🚀", n: "rocket" },
    { e: "🛰️", n: "satellite" },
    { e: "💺", n: "seat" },
    { e: "🚢", n: "ship" },
    { e: "⛵", n: "sailboat" },
    { e: "🛶", n: "canoe" },
    { e: "🚤", n: "speedboat" },
    { e: "🛳️", n: "passenger ship" },
    { e: "🗺️", n: "world map" },
    { e: "🏠", n: "house" },
    { e: "🏡", n: "house with garden" },
    { e: "🏢", n: "office building" },
    { e: "🏣", n: "Japanese post office" },
    { e: "🏤", n: "post office" },
    { e: "🏥", n: "hospital" },
    { e: "🏦", n: "bank" },
    { e: "🏨", n: "hotel" },
    { e: "🏩", n: "love hotel" },
    { e: "🏪", n: "convenience store" },
    { e: "🏫", n: "school" },
    { e: "🏬", n: "department store" },
    { e: "🏭", n: "factory" },
    { e: "🏯", n: "Japanese castle" },
    { e: "🏰", n: "castle" },
    { e: "💒", n: "wedding" },
    { e: "🗼", n: "Tokyo Tower" },
    { e: "🗽", n: "Statue of Liberty" },
    { e: "⛪", n: "church" },
    { e: "🕌", n: "mosque" },
    { e: "🛕", n: "hindu temple" },
    { e: "🕍", n: "synagogue" },
    { e: "⛩️", n: "shinto shrine" },
    { e: "🏛️", n: "classical building" },
    { e: "🌄", n: "sunrise over mountains" },
    { e: "🌅", n: "sunrise" },
    { e: "🌇", n: "sunset" },
    { e: "🏖️", n: "beach with umbrella" },
    { e: "🏔️", n: "snow-capped mountain" },
    { e: "🏕️", n: "camping" },
    { e: "🏜️", n: "desert" },
    { e: "🏝️", n: "desert island" },
    { e: "🏗️", n: "building construction" },
  ],

  "Activities": [
    { e: "⚽", n: "soccer ball" },
    { e: "🏀", n: "basketball" },
    { e: "🏈", n: "American football" },
    { e: "⚾", n: "baseball" },
    { e: "🥎", n: "softball" },
    { e: "🎾", n: "tennis" },
    { e: "🏐", n: "volleyball" },
    { e: "🏉", n: "rugby football" },
    { e: "🥏", n: "flying disc" },
    { e: "🎳", n: "bowling" },
    { e: "🏏", n: "cricket game" },
    { e: "🏑", n: "field hockey" },
    { e: "🥍", n: "lacrosse" },
    { e: "⛳", n: "flag in hole" },
    { e: "🏌️", n: "person golfing" },
    { e: "🎣", n: "fishing pole" },
    { e: "🤿", n: "diving mask" },
    { e: "🎽", n: "running shirt" },
    { e: "🎿", n: "skis" },
    { e: "🛷", n: "sled" },
    { e: "🥌", n: "curling stone" },
    { e: "🎯", n: "bullseye" },
    { e: "🎱", n: "pool 8 ball" },
    { e: "🎮", n: "video game" },
    { e: "🎰", n: "slot machine" },
    { e: "🎲", n: "game die" },
    { e: "♟️", n: "chess pawn" },
    { e: "🎭", n: "performing arts" },
    { e: "🎨", n: "artist palette" },
    { e: "🎬", n: "clapper board" },
    { e: "🎤", n: "microphone" },
    { e: "🎧", n: "headphone" },
    { e: "🎼", n: "musical score" },
    { e: "🎹", n: "musical keyboard" },
    { e: "🥁", n: "drum" },
    { e: "🎷", n: "saxophone" },
    { e: "🎺", n: "trumpet" },
    { e: "🎸", n: "guitar" },
    { e: "🎻", n: "violin" },
    { e: "🪕", n: "banjo" },
    { e: "🎙️", n: "studio microphone" },
    { e: "📻", n: "radio" },
    { e: "🎵", n: "musical note" },
    { e: "🎶", n: "musical notes" },
    { e: "📀", n: "DVD" },
    { e: "💿", n: "CD" },
    { e: "📸", n: "camera with flash" },
    { e: "📷", n: "camera" },
    { e: "🎥", n: "movie camera" },
    { e: "📹", n: "video camera" },
    { e: "📺", n: "television" },
    { e: "📱", n: "mobile phone" },
    { e: "💻", n: "laptop" },
    { e: "⌨️", n: "keyboard" },
    { e: "🖥️", n: "desktop computer" },
    { e: "🖨️", n: "printer" },
    { e: "🕹️", n: "joystick" },
  ],

  "Objects": [
    { e: "⌚", n: "watch" },
    { e: "📱", n: "mobile phone" },
    { e: "💻", n: "laptop" },
    { e: "⌨️", n: "keyboard" },
    { e: "🖥️", n: "desktop computer" },
    { e: "🖨️", n: "printer" },
    { e: "🖱️", n: "computer mouse" },
    { e: "🖲️", n: "trackball" },
    { e: "🔋", n: "battery" },
    { e: "🔌", n: "electric plug" },
    { e: "💡", n: "light bulb" },
    { e: "🔦", n: "flashlight" },
    { e: "🕯️", n: "candle" },
    { e: "📖", n: "open book" },
    { e: "📕", n: "closed book" },
    { e: "📗", n: "green book" },
    { e: "📘", n: "blue book" },
    { e: "📙", n: "orange book" },
    { e: "📚", n: "books" },
    { e: "📓", n: "notebook" },
    { e: "📒", n: "ledger" },
    { e: "📃", n: "page with curl" },
    { e: "📜", n: "scroll" },
    { e: "📄", n: "page facing up" },
    { e: "📰", n: "newspaper" },
    { e: "📑", n: "bookmark tabs" },
    { e: "🔖", n: "bookmark" },
    { e: "💰", n: "money bag" },
    { e: "💴", n: "yen banknote" },
    { e: "💵", n: "dollar banknote" },
    { e: "💶", n: "euro banknote" },
    { e: "💷", n: "pound banknote" },
    { e: "💳", n: "credit card" },
    { e: "🧾", n: "receipt" },
    { e: "✉️", n: "envelope" },
    { e: "📧", n: "e-mail" },
    { e: "📨", n: "incoming envelope" },
    { e: "📩", n: "envelope with arrow" },
    { e: "📤", n: "outbox tray" },
    { e: "📥", n: "inbox tray" },
    { e: "📦", n: "package" },
    { e: "📫", n: "closed mailbox with raised flag" },
    { e: "📪", n: "closed mailbox with lowered flag" },
    { e: "📬", n: "open mailbox with raised flag" },
    { e: "📭", n: "open mailbox with lowered flag" },
    { e: "📮", n: "postbox" },
    { e: "✏️", n: "pencil" },
    { e: "✒️", n: "black nib" },
    { e: "🖊️", n: "pen" },
    { e: "🖌️", n: "paintbrush" },
    { e: "🖍️", n: "crayon" },
    { e: "📎", n: "paperclip" },
    { e: "🖇️", n: "linked paperclips" },
    { e: "📏", n: "straight ruler" },
    { e: "📐", n: "triangular ruler" },
    { e: "✂️", n: "scissors" },
    { e: "🗃️", n: "card file box" },
    { e: "🗄️", n: "file cabinet" },
    { e: "🔑", n: "key" },
    { e: "🗝️", n: "old key" },
    { e: "🔨", n: "hammer" },
    { e: "🪓", n: "axe" },
    { e: "⛏️", n: "pick" },
    { e: "🔧", n: "wrench" },
    { e: "🔩", n: "nut and bolt" },
    { e: "🔫", n: "pistol" },
    { e: "🛠️", n: "hammer and wrench" },
    { e: "🧰", n: "toolbox" },
    { e: "🔗", n: "link" },
    { e: "⛓️", n: "chains" },
    { e: "🧲", n: "magnet" },
    { e: "🔬", n: "microscope" },
    { e: "🔭", n: "telescope" },
    { e: "📡", n: "satellite antenna" },
    { e: "💉", n: "syringe" },
    { e: "🩺", n: "stethoscope" },
    { e: "💊", n: "pill" },
    { e: "🩹", n: "adhesive bandage" },
    { e: "🚪", n: "door" },
    { e: "🛏️", n: "bed" },
    { e: "🛋️", n: "couch and lamp" },
    { e: "🚽", n: "toilet" },
    { e: "🚿", n: "shower" },
    { e: "🛁", n: "bathtub" },
    { e: "🧹", n: "broom" },
    { e: "🧻", n: "roll of paper" },
    { e: "🔪", n: "knife" },
    { e: "🍽️", n: "fork and knife with plate" },
    { e: "🪴", n: "potted plant" },
  ],

  "Symbols": [
    { e: "❤️", n: "red heart" },
    { e: "🧡", n: "orange heart" },
    { e: "💛", n: "yellow heart" },
    { e: "💚", n: "green heart" },
    { e: "💙", n: "blue heart" },
    { e: "💜", n: "purple heart" },
    { e: "🖤", n: "black heart" },
    { e: "🤍", n: "white heart" },
    { e: "🤎", n: "brown heart" },
    { e: "💔", n: "broken heart" },
    { e: "❣️", n: "heart exclamation" },
    { e: "💕", n: "two hearts" },
    { e: "💞", n: "revolving hearts" },
    { e: "💓", n: "beating heart" },
    { e: "💗", n: "growing heart" },
    { e: "💖", n: "sparkling heart" },
    { e: "💘", n: "heart with arrow" },
    { e: "💝", n: "heart with ribbon" },
    { e: "💟", n: "heart decoration" },
    { e: "☮️", n: "peace symbol" },
    { e: "✝️", n: "latin cross" },
    { e: "☪️", n: "star and crescent" },
    { e: "☸️", n: "wheel of dharma" },
    { e: "✡️", n: "star of David" },
    { e: "🔯", n: "six pointed star" },
    { e: "🕉️", n: "om" },
    { e: "☯️", n: "yin yang" },
    { e: "🛐", n: "place of worship" },
    { e: "♈", n: "Aries" },
    { e: "♉", n: "Taurus" },
    { e: "♊", n: "Gemini" },
    { e: "♋", n: "Cancer" },
    { e: "♌", n: "Leo" },
    { e: "♍", n: "Virgo" },
    { e: "♎", n: "Libra" },
    { e: "♏", n: "Scorpio" },
    { e: "♐", n: "Sagittarius" },
    { e: "♑", n: "Capricorn" },
    { e: "♒", n: "Aquarius" },
    { e: "♓", n: "Pisces" },
    { e: "⛎", n: "Ophiuchus" },
    { e: "🆔", n: "ID button" },
    { e: "🆕", n: "NEW button" },
    { e: "🆖", n: "NG button" },
    { e: "🆗", n: "OK button" },
    { e: "🆘", n: "SOS button" },
    { e: "🆙", n: "UP! button" },
    { e: "🆒", n: "COOL button" },
    { e: "🆓", n: "FREE button" },
    { e: "ℹ️", n: "information" },
    { e: "🆚", n: "VS button" },
    { e: "🚮", n: "litter in bin sign" },
    { e: "🚰", n: "potable water" },
    { e: "♻️", n: "recycling symbol" },
    { e: "🚹", n: "men's room" },
    { e: "🚺", n: "women's room" },
    { e: "🚻", n: "restroom" },
    { e: "🚼", n: "baby symbol" },
    { e: "🚾", n: "water closet" },
    { e: "⚠️", n: "warning" },
    { e: "🚸", n: "children crossing" },
    { e: "⛔", n: "no entry" },
    { e: "🚫", n: "prohibited" },
    { e: "🚳", n: "no bicycles" },
    { e: "🚭", n: "no smoking" },
    { e: "🚯", n: "no littering" },
    { e: "🚱", n: "non-potable water" },
    { e: "📵", n: "no mobile phones" },
    { e: "🔞", n: "no one under eighteen" },
    { e: "☢️", n: "radioactive" },
    { e: "☣️", n: "biohazard" },
    { e: "⬆️", n: "up arrow" },
    { e: "⬇️", n: "down arrow" },
    { e: "⬅️", n: "left arrow" },
    { e: "➡️", n: "right arrow" },
    { e: "🔃", n: "clockwise vertical arrows" },
    { e: "🔄", n: "counterclockwise arrows button" },
    { e: "🔙", n: "BACK arrow" },
    { e: "🔚", n: "END arrow" },
    { e: "🔛", n: "ON! arrow" },
    { e: "🔜", n: "SOON arrow" },
    { e: "🔝", n: "TOP arrow" },
    { e: "✅", n: "check mark button" },
    { e: "❌", n: "cross mark" },
    { e: "❓", n: "question mark" },
    { e: "❗", n: "exclamation mark" },
    { e: "➕", n: "plus" },
    { e: "➖", n: "minus" },
    { e: "➗", n: "divide" },
    { e: "♠️", n: "spade suit" },
    { e: "♥️", n: "heart suit" },
    { e: "♦️", n: "diamond suit" },
    { e: "♣️", n: "club suit" },
    { e: "♟️", n: "chess pawn" },
    { e: "🃏", n: "joker" },
    { e: "🎴", n: "flower playing cards" },
    { e: "🔴", n: "red circle" },
    { e: "🟠", n: "orange circle" },
    { e: "🟡", n: "yellow circle" },
    { e: "🟢", n: "green circle" },
    { e: "🔵", n: "blue circle" },
    { e: "🟣", n: "purple circle" },
    { e: "⚪", n: "white circle" },
    { e: "🟤", n: "brown circle" },
    { e: "⚫", n: "black circle" },
    { e: "🟥", n: "red square" },
    { e: "🟧", n: "orange square" },
    { e: "🟨", n: "yellow square" },
    { e: "🟩", n: "green square" },
    { e: "🟦", n: "blue square" },
    { e: "🟪", n: "purple square" },
    { e: "⬜", n: "white large square" },
    { e: "🟫", n: "brown square" },
    { e: "⬛", n: "black large square" },
  ],
};


const PREMIUM_EMOJIS = {
  "Flags": [
    { e: "🏳️", n: "white flag" },
    { e: "🏴", n: "black flag" },
    { e: "🏁", n: "checkered flag" },
    { e: "🚩", n: "triangular flag" },
    { e: "🏳️‍🌈", n: "rainbow flag" },
    { e: "🏳️‍⚧️", n: "transgender flag" },
    { e: "🇺🇳", n: "United Nations" },
    { e: "🇺🇸", n: "United States" },
    { e: "🇬🇧", n: "United Kingdom" },
    { e: "🇨🇦", n: "Canada" },
    { e: "🇦🇺", n: "Australia" },
    { e: "🇯🇵", n: "Japan" },
    { e: "🇩🇪", n: "Germany" },
    { e: "🇫🇷", n: "France" },
    { e: "🇮🇹", n: "Italy" },
    { e: "🇪🇸", n: "Spain" },
    { e: "🇧🇷", n: "Brazil" },
    { e: "🇮🇳", n: "India" },
    { e: "🇨🇳", n: "China" },
    { e: "🇰🇷", n: "South Korea" },
    { e: "🇲🇽", n: "Mexico" },
    { e: "🇷🇺", n: "Russia" },
    { e: "🇿🇦", n: "South Africa" },
    { e: "🇸🇪", n: "Sweden" },
    { e: "🇳🇴", n: "Norway" },
    { e: "🇩🇰", n: "Denmark" },
    { e: "🇫🇮", n: "Finland" },
    { e: "🇳🇱", n: "Netherlands" },
    { e: "🇧🇪", n: "Belgium" },
    { e: "🇨🇭", n: "Switzerland" },
    { e: "🇦🇹", n: "Austria" },
    { e: "🇮🇪", n: "Ireland" },
    { e: "🇵🇹", n: "Portugal" },
    { e: "🇬🇷", n: "Greece" },
    { e: "🇵🇱", n: "Poland" },
    { e: "🇨🇿", n: "Czechia" },
    { e: "🇭🇺", n: "Hungary" },
    { e: "🇹🇷", n: "Turkey" },
    { e: "🇮🇱", n: "Israel" },
    { e: "🇸🇦", n: "Saudi Arabia" },
    { e: "🇦🇪", n: "United Arab Emirates" },
    { e: "🇸🇬", n: "Singapore" },
    { e: "🇭🇰", n: "Hong Kong" },
    { e: "🇹🇼", n: "Taiwan" },
    { e: "🇦🇷", n: "Argentina" },
    { e: "🇨🇱", n: "Chile" },
    { e: "🇨🇴", n: "Colombia" },
    { e: "🇳🇬", n: "Nigeria" },
    { e: "🇰🇪", n: "Kenya" },
    { e: "🇪🇬", n: "Egypt" },
    { e: "🇹🇭", n: "Thailand" },
    { e: "🇻🇳", n: "Vietnam" },
    { e: "🇮🇩", n: "Indonesia" },
    { e: "🇵🇭", n: "Philippines" },
    { e: "🇲🇾", n: "Malaysia" },
    { e: "🇳🇿", n: "New Zealand" },
  ],

  "Skin Tones": [
    { e: "👋🏻", n: "waving hand: light" },
    { e: "👋🏼", n: "waving hand: medium-light" },
    { e: "👋🏽", n: "waving hand: medium" },
    { e: "👋🏾", n: "waving hand: medium-dark" },
    { e: "👋🏿", n: "waving hand: dark" },
    { e: "👍🏻", n: "thumbs up: light" },
    { e: "👍🏼", n: "thumbs up: medium-light" },
    { e: "👍🏽", n: "thumbs up: medium" },
    { e: "👍🏾", n: "thumbs up: medium-dark" },
    { e: "👍🏿", n: "thumbs up: dark" },
    { e: "👎🏻", n: "thumbs down: light" },
    { e: "👎🏼", n: "thumbs down: medium-light" },
    { e: "👎🏽", n: "thumbs down: medium" },
    { e: "👎🏾", n: "thumbs down: medium-dark" },
    { e: "👎🏿", n: "thumbs down: dark" },
    { e: "✊🏻", n: "raised fist: light" },
    { e: "✊🏼", n: "raised fist: medium-light" },
    { e: "✊🏽", n: "raised fist: medium" },
    { e: "✊🏾", n: "raised fist: medium-dark" },
    { e: "✊🏿", n: "raised fist: dark" },
    { e: "👊🏻", n: "oncoming fist: light" },
    { e: "👊🏼", n: "oncoming fist: medium-light" },
    { e: "👊🏽", n: "oncoming fist: medium" },
    { e: "👊🏾", n: "oncoming fist: medium-dark" },
    { e: "👊🏿", n: "oncoming fist: dark" },
    { e: "🙏🏻", n: "folded hands: light" },
    { e: "🙏🏼", n: "folded hands: medium-light" },
    { e: "🙏🏽", n: "folded hands: medium" },
    { e: "🙏🏾", n: "folded hands: medium-dark" },
    { e: "🙏🏿", n: "folded hands: dark" },
  ],

  "Premium Stickers": [
    { e: "🎉", n: "party popper" },
    { e: "🎊", n: "confetti ball" },
    { e: "🎈", n: "balloon" },
    { e: "🎁", n: "wrapped gift" },
    { e: "🏆", n: "trophy" },
    { e: "🥇", n: "1st place medal" },
    { e: "🥈", n: "2nd place medal" },
    { e: "🥉", n: "3rd place medal" },
    { e: "🎖️", n: "military medal" },
    { e: "🏅", n: "sports medal" },
    { e: "🎗️", n: "reminder ribbon" },
    { e: "👑", n: "crown" },
    { e: "💎", n: "gem stone" },
    { e: "🔮", n: "crystal ball" },
    { e: "🪄", n: "magic wand" },
    { e: "✨", n: "sparkles" },
    { e: "🌟", n: "glowing star" },
    { e: "⭐", n: "star" },
    { e: "🌈", n: "rainbow" },
    { e: "🦋", n: "butterfly" },
    { e: "🌸", n: "cherry blossom" },
    { e: "🌺", n: "hibiscus" },
    { e: "🌻", n: "sunflower" },
    { e: "🌹", n: "rose" },
    { e: "🌷", n: "tulip" },
    { e: "💐", n: "bouquet" },
    { e: "🦄", n: "unicorn" },
  ],
};


// ── Inline storage functions ─────────────────────────────────

// ─── Ease-Moji Storage ─────────────────────────────────────────────

const DEFAULTS = {
  theme: 'system',      // 'light' | 'dark' | 'system'
  emojiSize: 'medium',  // 'small' | 'medium' | 'large'
  recentEmojis: [],     // max 20 recent emojis
  premium: { active: false, token: null, expires: null },
  topTier: { active: false, token: null, expires: null },
  position: 'bottom',
  skinTone: 'default',
};

async function getSettings() {
  const r = await chrome.storage.local.get('settings');
  const saved = r.settings || {};
  return {
    ...DEFAULTS,
    ...saved,
    premium: { ...DEFAULTS.premium, ...(saved.premium || {}) },
    topTier: { ...DEFAULTS.topTier, ...(saved.topTier || {}) },
  };
}

async function updateSettings(patch) {
  const cur = await getSettings();
  const merged = { ...cur, ...patch };
  await chrome.storage.local.set({ settings: merged });
  return merged;
}

async function addRecent(emojiChar) {
  const s = await getSettings();
  let recents = s.recentEmojis || [];
  recents = recents.filter(e => e !== emojiChar);
  recents.unshift(emojiChar);
  if (recents.length > 20) recents = recents.slice(0, 20);
  await updateSettings({ recentEmojis: recents });
  return recents;
}

// ── Check if premium is active ──────────────────────────────

function isPremium(settings) {
  if (settings.premium?.active) return true;
  // Check paid license
  if (settings.licenseKey && (settings.licenseTier === 'basic' || settings.licenseTier === 'premium')) {
    if (!settings.licenseExpires || new Date(settings.licenseExpires) > new Date()) return true;
  }
  return false;
}

function isTopTier(settings) {
  if (settings.topTier?.active) return true;
  // Check paid license
  if (settings.licenseKey && settings.licenseTier === 'premium') {
    if (!settings.licenseExpires || new Date(settings.licenseExpires) > new Date()) return true;
  }
  return false;
}


// ── Init ──────────────────────────────────────────────────────

async function initSettings() {
  settings = await getSettings();
}
const bootReady = initSettings();

// ── Inject UI ─────────────────────────────────────────────────

const btn = document.createElement('button');
btn.className = 'em-btn';
btn.textContent = '😀';
btn.title = 'Ease-Moji';

const panel = document.createElement('div');
panel.className = 'em-panel';
document.documentElement.appendChild(btn);
document.documentElement.appendChild(panel);

async function refreshSettings() {
  try {
    await bootReady;
    settings = getSettings ? await getSettings() : {};
  } catch {}
}

// ── Build panel HTML ─────────────────────────────────────────

function buildPanelHTML() {
  const prem = isPremium(settings);
  const top = isTopTier(settings);
  const tierLabel = top ? '👑 Premium' : prem ? '🚀 Basic' : '💎 Free';
  const extras = prem
    ? `<button class="em-tab" data-page="stickers">🎨 Stickers</button>`
    : '';
  const topExtras = top
    ? `<button class="em-tab" data-page="gifs">GIFs</button><button class="em-tab" data-page="dictionary">📖 Dictionary</button><button class="em-tab" data-page="thesaurus">📚 Thesaurus</button>`
    : '';

  return `
    <div class="em-search-wrap">
      <input class="em-search" type="text" id="emSearch" placeholder="Search emojis..." />
    </div>
    <div class="em-tabs" id="emTabs">
      ${CATEGORIES.map(c => `<button class="em-tab" data-page="emoji" data-cat="${c}">${c}</button>`).join('')}
      ${extras}
      ${topExtras}
    </div>
    <div class="em-grid-wrap">
      <div class="em-grid" id="emGrid"></div>
    </div>
    <div class="em-panel-footer">
      <span>${tierLabel}</span>
      <a href="#" id="emOptionsBtn">Settings</a>
    </div>
  `;
}

// ── Open panel ────────────────────────────────────────────────

async function openPanel() {
  await bootReady;
  await refreshSettings();
  if (!activeInput) return;
  panel.innerHTML = buildPanelHTML();
  positionPanel();
  panel.classList.add('open');
  applyTheme();

  document.getElementById('emSearch')?.addEventListener('input', onSearch);
  document.getElementById('emTabs')?.addEventListener('click', onTabClick);
  document.getElementById('emOptionsBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
  });

  const firstTab = document.querySelector('.em-tab');
  if (firstTab) {
    firstTab.classList.add('active');
    const cat = firstTab.dataset.cat;
    if (cat) { currentCategory = cat; renderEmojiGrid(cat); }
    else if (firstTab.dataset.page === 'stickers') renderStickers();
  }
}

function closePanel() {
  panel.classList.remove('open');
}

// ── Tab click handler ────────────────────────────────────────

function onTabClick(e) {
  const tab = e.target.closest('.em-tab');
  if (!tab) return;
  document.querySelectorAll('.em-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');

  const search = document.getElementById('emSearch');
  if (search) { search.value = ''; searchQuery = ''; }

  const grid = document.getElementById('emGrid');
  grid.className = 'em-grid';

  const cat = tab.dataset.cat;
  if (cat) {
    currentPage = 'emoji';
    currentCategory = cat;
    const searchInput = document.getElementById('emSearch');
    if (searchInput) searchInput.placeholder = 'Search emojis...';
    document.getElementById('emSearch')?.closest('.em-search-wrap')?.style.removeProperty('display');
    renderEmojiGrid(cat);
  } else if (tab.dataset.page === 'stickers') {
    currentPage = 'stickers';
    const searchInput = document.getElementById('emSearch');
    if (searchInput) searchInput.placeholder = 'Search stickers...';
    document.getElementById('emSearch')?.closest('.em-search-wrap')?.style.removeProperty('display');
    renderStickers('emoji');
  } else if (tab.dataset.page === 'gifs') {
    currentPage = 'gifs';
    const searchInput = document.getElementById('emSearch');
    if (searchInput) searchInput.placeholder = 'Search GIFs...';
    document.getElementById('emSearch')?.closest('.em-search-wrap')?.style.removeProperty('display');
    renderGifs('reaction');
  } else if (tab.dataset.page === 'dictionary') {
    currentPage = 'dictionary';
    const searchInput = document.getElementById('emSearch');
    if (searchInput) searchInput.placeholder = 'Search dictionary...';
    document.getElementById('emSearch')?.closest('.em-search-wrap')?.style.removeProperty('display');
    renderDictionary('define');
  } else if (tab.dataset.page === 'thesaurus') {
    currentPage = 'thesaurus';
    const searchInput = document.getElementById('emSearch');
    if (searchInput) searchInput.placeholder = 'Search thesaurus...';
    document.getElementById('emSearch')?.closest('.em-search-wrap')?.style.removeProperty('display');
    renderThesaurus('happy');
  }
}

function onSearch() {
  searchQuery = document.getElementById('emSearch')?.value?.trim().toLowerCase() || '';
  if (currentPage === 'gifs') renderGifs(searchQuery || 'reaction');
  else if (currentPage === 'stickers') renderStickers(searchQuery || 'emoji');
  else if (currentPage === 'dictionary') renderDictionary(searchQuery || 'define');
  else if (currentPage === 'thesaurus') renderThesaurus(searchQuery || 'happy');
  else renderEmojiGrid(currentCategory);
}

// ── Emoji Grid ────────────────────────────────────────────────

function renderEmojiGrid(category) {
  const grid = document.getElementById('emGrid');
  if (!grid) return;
  grid.className = 'em-grid';
  grid.innerHTML = '';

  if (searchQuery) { renderSearch(searchQuery, grid); return; }

  const cat = CATEGORIES.includes(category) ? category : CATEGORIES[0];
  let items = FREE_EMOJIS[cat] || [];
  if (isPremium(settings) && PREMIUM_EMOJIS[cat]) items = [...items, ...PREMIUM_EMOJIS[cat]];

  if (!items.length && PREMIUM_EMOJIS[cat] && !isPremium(settings)) {
    grid.innerHTML = `<div class="em-premium-overlay">✨ <strong>${cat}</strong> in <a class="em-premium-link" data-upgrade>Premium</a></div>`;
    grid.querySelector('[data-upgrade]')?.addEventListener('click', (e) => {
      e.preventDefault(); chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
    });
    return;
  }

  const recents = settings?.recentEmojis || [];
  if (recents.length > 0) {
    const h = document.createElement('div');
    h.className = 'em-section-header recent'; h.textContent = 'Recent';
    grid.appendChild(h);
    for (const em of recents.slice(0, 8)) {
      const b = document.createElement('button');
      b.className = 'em-cell'; b.textContent = em;
      b.addEventListener('click', () => insertEmoji(em));
      grid.appendChild(b);
    }
  }

  const h = document.createElement('div');
  h.className = 'em-section-header'; h.textContent = cat;
  grid.appendChild(h);

  for (const item of items) {
    const b = document.createElement('button');
    b.className = 'em-cell'; b.textContent = item.e; b.title = item.n;
    b.addEventListener('click', () => insertEmoji(item.e));
    grid.appendChild(b);
  }
}

function renderSearch(q, grid) {
  let count = 0;
  for (const [cat, items] of Object.entries(FREE_EMOJIS)) {
    for (const item of items) {
      if (item.n.toLowerCase().includes(q)) {
        const b = document.createElement('button');
        b.className = 'em-cell'; b.textContent = item.e; b.title = item.n;
        b.addEventListener('click', () => insertEmoji(item.e));
        grid.appendChild(b);
        if (++count >= 50) break;
      }
    }
    if (count >= 50) break;
  }
  if (isPremium(settings)) {
    for (const [cat, items] of Object.entries(PREMIUM_EMOJIS)) {
      for (const item of items) {
        if (item.n.toLowerCase().includes(q)) {
          const b = document.createElement('button');
          b.className = 'em-cell'; b.textContent = item.e; b.title = item.n;
          b.addEventListener('click', () => insertEmoji(item.e));
          grid.appendChild(b);
          if (++count >= 70) break;
        }
      }
      if (count >= 70) break;
    }
  }
  if (!count) {
    const empty = document.createElement('div');
    empty.className = 'em-no-results';
    empty.textContent = `No emojis for "${q}"`;
    grid.appendChild(empty);
  }
}

// ── Stickers (Premium) ────────────────────────────────────────

async function renderStickers(query) {
  const grid = document.getElementById('emGrid');
  if (!grid) return;
  grid.className = 'em-sticker-grid';
  grid.innerHTML = '<div class="em-sticker-label">Search and insert stickers</div><div class="em-loading">Loading stickers...</div>';

  if (stickerSearchController) stickerSearchController.abort();
  stickerSearchController = new AbortController();

  try {
    const params = new URLSearchParams({
      api_key: GIPHY_STICKERS_API_KEY,
      q: query,
      limit: '20',
      rating: 'pg',
      lang: 'en',
    });
    const res = await fetch(`${GIPHY_STICKERS_SEARCH_ENDPOINT}?${params}`, {
      signal: stickerSearchController.signal,
    });
    if (!res.ok) throw new Error(`GIPHY sticker search failed: ${res.status}`);

    const data = await res.json();
    const items = Array.isArray(data.data) ? data.data : [];
    grid.innerHTML = '<div class="em-sticker-label">Tap to insert sticker</div>';

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'em-no-results';
      empty.textContent = 'No stickers found';
      grid.appendChild(empty);
      return;
    }

    for (const sticker of items) {
      const preview = sticker.images?.fixed_width_small?.url || sticker.images?.downsized?.url;
      const insertUrl = sticker.images?.original?.url || sticker.images?.downsized?.url || preview;
      if (!preview || !insertUrl) continue;

      const wrap = document.createElement('button');
      wrap.className = 'em-sticker';
      wrap.title = sticker.title || 'Insert sticker';

      const img = document.createElement('img');
      img.src = preview;
      img.alt = sticker.title || 'Sticker';
      img.loading = 'lazy';

      wrap.appendChild(img);
      wrap.addEventListener('click', () => insertGif(insertUrl, sticker.title || 'Sticker'));
      grid.appendChild(wrap);
    }
  } catch (e) {
    if (e.name === 'AbortError') return;
    grid.innerHTML = '<div class="em-no-results">Sticker search is unavailable right now</div>';
  }
}

// ── GIFs (Premium) ─────────────────────────────────────────────

async function renderGifs(query) {
  const grid = document.getElementById('emGrid');
  if (!grid) return;
  grid.className = 'em-gif-grid';
  grid.innerHTML = '<div class="em-sticker-label">Search and insert GIFs</div><div class="em-loading">Loading GIFs...</div>';

  if (gifSearchController) gifSearchController.abort();
  gifSearchController = new AbortController();

  try {
    const params = new URLSearchParams({
      api_key: GIPHY_API_KEY,
      q: query,
      limit: '20',
      rating: 'pg',
      lang: 'en',
    });
    const res = await fetch(`${GIPHY_SEARCH_ENDPOINT}?${params}`, {
      signal: gifSearchController.signal,
    });
    if (!res.ok) throw new Error(`GIPHY search failed: ${res.status}`);

    const data = await res.json();
    const items = Array.isArray(data.data) ? data.data : [];
    grid.innerHTML = '<div class="em-sticker-label">Tap to insert GIF</div>';

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'em-no-results';
      empty.textContent = 'No GIFs found';
      grid.appendChild(empty);
      return;
    }

    for (const gif of items) {
      const preview = gif.images?.fixed_width_small?.url || gif.images?.downsized?.url;
      const insertUrl = gif.images?.original?.url || gif.images?.downsized?.url || preview;
      if (!preview || !insertUrl) continue;

      const b = document.createElement('button');
      b.className = 'em-gif-card';
      b.title = gif.title || 'Insert GIF';

      const img = document.createElement('img');
      img.src = preview;
      img.alt = gif.title || 'GIF';
      img.loading = 'lazy';

      b.appendChild(img);
      b.addEventListener('click', () => insertGif(insertUrl, gif.title || 'GIF'));
      grid.appendChild(b);
    }
  } catch (e) {
    if (e.name === 'AbortError') return;
    grid.innerHTML = '<div class="em-no-results">GIF search is unavailable right now</div>';
  }
}

// ── Dictionary & Thesaurus ───────────────────────────────────────

async function renderDictionary(query) {
  const grid = document.getElementById('emGrid');
  if (!grid) return;
  grid.className = 'em-word-panel';
  grid.innerHTML = '<div class="em-loading">Looking up definition...</div>';

  if (wordSearchController) wordSearchController.abort();
  wordSearchController = new AbortController();

  try {
    const params = new URLSearchParams({ word: query });
    const res = await fetch(`${DICTIONARY_ENDPOINT}?${params}`, {
      signal: wordSearchController.signal,
      headers: { 'X-Api-Key': API_NINJAS_KEY },
    });
    if (!res.ok) throw new Error(`Dictionary lookup failed: ${res.status}`);

    const data = await res.json();
    renderDictionaryResults(grid, query, data);
  } catch (e) {
    if (e.name === 'AbortError') return;
    grid.innerHTML = '<div class="em-no-results">Dictionary is unavailable right now</div>';
  }
}

function renderDictionaryResults(grid, query, data) {
  grid.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'em-word-title';
  title.textContent = query;
  grid.appendChild(title);

  const definition = data?.definition || data?.definitions?.[0]?.definition;
  const valid = data?.valid !== false;
  if (definition && valid) {
    const section = document.createElement('div');
    section.className = 'em-word-section';
    const h = document.createElement('h4');
    h.textContent = 'Definition';
    const p = document.createElement('p');
    p.textContent = definition;
    section.appendChild(h);
    section.appendChild(p);
    grid.appendChild(section);
  }

  if (!definition || !valid) {
    const empty = document.createElement('div');
    empty.className = 'em-no-results';
    empty.textContent = `No definition found for "${query}"`;
    grid.appendChild(empty);
  }
}

async function renderThesaurus(query) {
  const grid = document.getElementById('emGrid');
  if (!grid) return;
  grid.className = 'em-word-panel';
  grid.innerHTML = '<div class="em-loading">Looking up synonyms...</div>';

  if (wordSearchController) wordSearchController.abort();
  wordSearchController = new AbortController();

  try {
    const params = new URLSearchParams({ word: query });
    const res = await fetch(`${THESAURUS_ENDPOINT}?${params}`, {
      signal: wordSearchController.signal,
      headers: { 'X-Api-Key': API_NINJAS_KEY },
    });
    if (!res.ok) throw new Error(`Thesaurus lookup failed: ${res.status}`);

    const data = await res.json();
    renderThesaurusResults(grid, query, data);
  } catch (e) {
    if (e.name === 'AbortError') return;
    grid.innerHTML = '<div class="em-no-results">Thesaurus is unavailable right now</div>';
  }
}

function renderThesaurusResults(grid, query, data) {
  grid.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'em-word-title';
  title.textContent = query;
  grid.appendChild(title);

  const synonyms = Array.isArray(data?.synonyms) ? data.synonyms.slice(0, 18) : [];
  const antonyms = Array.isArray(data?.antonyms) ? data.antonyms.slice(0, 10) : [];

  if (synonyms.length) {
    appendWordChips(grid, 'Synonyms', synonyms);
  }
  if (antonyms.length) {
    appendWordChips(grid, 'Antonyms', antonyms);
  }

  if (!synonyms.length && !antonyms.length) {
    const empty = document.createElement('div');
    empty.className = 'em-no-results';
    empty.textContent = `No synonyms found for "${query}"`;
    grid.appendChild(empty);
  }
}

function appendWordChips(grid, label, words) {
  const section = document.createElement('div');
  section.className = 'em-word-section';
  const h = document.createElement('h4');
  h.textContent = label;
  const chips = document.createElement('div');
  chips.className = 'em-word-chips';

  for (const word of words) {
    const b = document.createElement('button');
    b.className = 'em-word-chip';
    b.textContent = word;
    b.title = `Insert ${word}`;
    b.addEventListener('click', () => insertWord(word));
    chips.appendChild(b);
  }

  section.appendChild(h);
  section.appendChild(chips);
  grid.appendChild(section);
}

// ── Emoji insertion ──────────────────────────────────────────

function insertEmoji(emoji) {
  if (!activeInput) return;
  addRecent(emoji).catch(() => {});
  insertTextAtCursor(emoji);
  closePanel();
}

function insertWord(word) {
  if (!activeInput) return;
  insertTextAtCursor(word);
  closePanel();
}

function insertGif(url, title) {
  if (!activeInput) return;
  insertGifAtCursor(url, title);
  closePanel();
}

function insertGifAtCursor(url, title) {
  const tag = activeInput.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea') {
    insertTextAtCursor(url);
    return;
  }

  if (activeInput.isContentEditable) {
    activeInput.focus();
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    // Simulate pasting the GIF URL — Facebook handles URL pastes natively
    // by creating rich preview cards, and React editors recognize paste events
    const dt = new DataTransfer();
    dt.setData('text/plain', url);
    dt.setData('text/uri-list', url);
    const event = new ClipboardEvent('paste', {
      clipboardData: dt,
      bubbles: true,
      cancelable: true,
    });
    activeInput.dispatchEvent(event);

    // If the paste was prevented/default didn't run, fall back to text insertion
    requestAnimationFrame(() => {
      activeInput.dispatchEvent(new Event('input', {bubbles:true}));
    });
  }
}

function insertTextAtCursor(text) {
  if (!activeInput) return;
  const tag = activeInput.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea') {
    const s = activeInput.selectionStart, e = activeInput.selectionEnd;
    const v = activeInput.value;
    activeInput.value = v.substring(0, s) + text + v.substring(e);
    const p = s + text.length;
    activeInput.selectionStart = activeInput.selectionEnd = p;
    activeInput.dispatchEvent(new Event('input', {bubbles:true}));
    activeInput.focus();
  } else if (activeInput.isContentEditable) {
    activeInput.focus();
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    // execCommand works with React-controlled contentEditables (Facebook, etc.)
    const success = document.execCommand('insertText', false, text);
    if (success) {
      activeInput.dispatchEvent(new Event('input', {bubbles:true}));
      return;
    }

    // Fallback: direct DOM manipulation for non-React editors
    const r = sel.getRangeAt(0);
    const node = document.createTextNode(text);
    r.deleteContents();
    r.insertNode(node);
    r.setStartAfter(node);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
    activeInput.dispatchEvent(new Event('input', {bubbles:true}));
    activeInput.focus();
  }
}

// ── UI helpers ────────────────────────────────────────────────

function showButton(input) {
  activeInput = input;
  const r = input.getBoundingClientRect();
  if (window.innerWidth < 500) {
    btn.style.left = Math.min(r.right - 36, window.innerWidth - 44) + 'px';
    btn.style.top = Math.max(r.top - 44, 4) + 'px';
  } else {
    btn.style.left = Math.min(r.right + 4, window.innerWidth - 44) + 'px';
    btn.style.top = Math.max(r.top, 4) + 'px';
  }
  btn.classList.add('visible');
}

function hideButton() { btn.classList.remove('visible'); }

function positionPanel() {
  const r = activeInput?.getBoundingClientRect();
  if (!r) return;
  const ph = Math.min(420, window.innerHeight - 60), pw = 340;
  let l = Math.min(r.right - pw, window.innerWidth - pw - 8);
  if (l < 8) l = 8;
  let t = r.bottom + 44 + ph < window.innerHeight ? r.bottom + 44
        : r.top - ph - 8 > 0 ? r.top - ph - 8
        : Math.max(8, window.innerHeight - ph - 8);
  panel.style.left = l + 'px'; panel.style.top = t + 'px';
}

function applyTheme() {
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = settings?.theme === 'dark' || (settings?.theme === 'system' && dark);
  panel.classList.toggle('em-dark', isDark);
  panel.classList.toggle('em-size-small', settings?.emojiSize === 'small');
  panel.classList.toggle('em-size-large', settings?.emojiSize === 'large');
}

// ── Events ────────────────────────────────────────────────────

btn.addEventListener('click', () => panel.classList.contains('open') ? closePanel() : openPanel());

document.addEventListener('click', e => {
  if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== btn) closePanel();
});

// Catch dynamically created contentEditables (Facebook composer, popouts, etc.)
// Facebook replaces the DOM on click → creates a contentEditable → focuses it
// focusin can miss this because it fires before React finishes rendering
document.addEventListener('click', () => {
  setTimeout(() => {
    if (panel.classList.contains('open')) return;
    const el = document.activeElement;
    if (!el || el === document.body) return;
    const tag = el.tagName.toLowerCase();
    if ((tag === 'input' && (!el.type || /text|email|search|url/.test(el.type))) || tag === 'textarea' || el.isContentEditable) {
      showButton(el);
    }
  }, 300);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && panel.classList.contains('open')) { closePanel(); activeInput?.focus(); }
});

document.addEventListener('focusin', e => {
  const el = e.target, tag = el.tagName.toLowerCase();
  if ((tag === 'input' && (!el.type || /text|email|search|url/.test(el.type))) || tag === 'textarea' || el.isContentEditable) showButton(el);
});

document.addEventListener('focusout', e => {
  if (e.relatedTarget && (panel.contains(e.relatedTarget) || e.relatedTarget === btn)) return;
  setTimeout(() => {
    if (!panel.contains(document.activeElement) && document.activeElement !== btn) {
      hideButton(); closePanel();
    }
  }, 150);
});

window.addEventListener('resize', () => {
  if (btn.classList.contains('visible') && activeInput) showButton(activeInput);
  if (panel.classList.contains('open')) positionPanel();
});
