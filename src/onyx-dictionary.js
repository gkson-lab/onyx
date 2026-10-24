// Onyx's mini dictionary: everyday English words with a part of speech, a plain definition, an example, similar and
// opposite words, and enough grammar to look up "ran" or "happier" and to make up new sentences with a word.
// The tech glossary in onyx-data.js is consulted first; this covers ordinary English. No network, no word lists online.
(function () {
	'use strict';

	/*
	 * w: the word. pos: part of speech. def: what it means. ex: a sentence that uses it. syn, ant: similar and opposite words.
	 * plural, past, ing: irregular forms (regular ones are worked out).
	 * Hints for made-up sentences (an entry without one is defined but never used in them):
	 * forms: other spellings (neighbour). variants: informal forms (heya).
 *   nouns: kind (person, animal, thing, food, place, idea), mass for words with no plural, at for a place's preposition.
	 *   verbs: obj, the thing they act on ("the letter"), or act: true for verbs that need none.
	 *   adjectives: use (feel, trait, object, place). adverbs: use (manner, often).
	 */
	const WORDS = [
		// People
		{ w: 'friend', pos: 'noun', kind: 'person', def: 'a person you know well and like, who usually isn\'t family', ex: 'My friend lent me her umbrella when it started to rain.', syn: ['companion', 'pal', 'buddy'], ant: ['enemy', 'stranger'] },
		{ w: 'teacher', pos: 'noun', kind: 'person', def: 'a person whose job is to help others learn', ex: 'Our teacher read the last chapter aloud.', syn: ['instructor', 'tutor'], ant: ['student'] },
		{ w: 'doctor', pos: 'noun', kind: 'person', def: 'a person trained to treat illness and injury', ex: 'The doctor said I should rest for a few days.', syn: ['physician'] },
		{ w: 'neighbor', pos: 'noun', kind: 'person', forms: ['neighbour'], def: 'a person who lives next door or nearby', ex: 'Our neighbor waters the plants when we\'re away.' },
		{ w: 'artist', pos: 'noun', kind: 'person', def: 'a person who makes art, such as paintings, music or sculpture', ex: 'The artist painted the harbor at sunrise.' },
		{ w: 'stranger', pos: 'noun', kind: 'person', def: 'a person you don\'t know', ex: 'A stranger helped me carry the boxes upstairs.', ant: ['friend'] },
		{ w: 'child', pos: 'noun', kind: 'person', plural: 'children', def: 'a young person who isn\'t yet an adult', ex: 'The child counted the stars out loud.', syn: ['kid'], ant: ['adult'] },
		{ w: 'chef', pos: 'noun', kind: 'person', def: 'a professional cook, especially the head cook in a restaurant', ex: 'The chef tasted the sauce and added a pinch of salt.', syn: ['cook'] },
		{ w: 'pilot', pos: 'noun', kind: 'person', def: 'a person who flies an aircraft', ex: 'The pilot told us we would land early.' },
		{ w: 'farmer', pos: 'noun', kind: 'person', def: 'a person who grows crops or raises animals', ex: 'The farmer was up before sunrise.' },

		// Animals
		{ w: 'cat', pos: 'noun', kind: 'animal', def: 'a small, furry animal often kept as a pet, known for purring', ex: 'The cat slept in a patch of sunlight.', syn: ['kitty'] },
		{ w: 'dog', pos: 'noun', kind: 'animal', def: 'an animal related to the wolf, kept as a pet or for work', ex: 'The dog waited by the door for its walk.', syn: ['hound', 'puppy'] },
		{ w: 'bird', pos: 'noun', kind: 'animal', def: 'an animal with feathers, wings and a beak; most kinds can fly', ex: 'A bird built a nest under the roof.' },
		{ w: 'horse', pos: 'noun', kind: 'animal', def: 'a large animal with hooves and a mane that people ride or use for work', ex: 'The horse trotted across the field.' },
		{ w: 'owl', pos: 'noun', kind: 'animal', def: 'a bird with large eyes that hunts at night', ex: 'An owl hooted somewhere in the dark.' },
		{ w: 'fox', pos: 'noun', kind: 'animal', def: 'a wild animal of the dog family with pointed ears and a bushy tail', ex: 'A fox crossed the road in front of us.' },
		{ w: 'rabbit', pos: 'noun', kind: 'animal', def: 'a small animal with long ears and soft fur that lives in burrows', ex: 'The rabbit froze, then darted into the hedge.', syn: ['bunny'] },
		{ w: 'whale', pos: 'noun', kind: 'animal', def: 'a very large sea mammal that breathes air through a blowhole', ex: 'We watched a whale surface near the boat.' },
		{ w: 'bee', pos: 'noun', kind: 'animal', def: 'a flying insect that makes honey and carries pollen between flowers', ex: 'A bee buzzed from one flower to the next.' },

		// Things
		{ w: 'book', pos: 'noun', kind: 'thing', def: 'pages of writing or pictures bound together between covers', ex: 'I couldn\'t put the book down until the last page.', syn: ['volume'] },
		{ w: 'book', pos: 'verb', obj: 'a table for two', def: 'to arrange to have something, like a seat, a room or a ticket, ahead of time', ex: 'We booked a room by the sea.', syn: ['reserve'], ant: ['cancel'] },
		{ w: 'chair', pos: 'noun', def: 'a seat for one person, with a back and usually four legs', ex: 'Pull up a chair and join us.' },
		{ w: 'lamp', pos: 'noun', kind: 'thing', def: 'a device that gives light, usually electric', ex: 'She switched on the lamp beside her bed.' },
		{ w: 'key', pos: 'noun', kind: 'thing', def: 'a shaped piece of metal that opens a lock; also, a button on a keyboard', ex: 'I keep a spare key under the flowerpot.' },
		{ w: 'umbrella', pos: 'noun', kind: 'thing', def: 'a folding cover on a stick that keeps the rain off you', ex: 'Take an umbrella; it looks like rain.' },
		{ w: 'clock', pos: 'noun', kind: 'thing', def: 'a device that shows the time', ex: 'The clock in the hall is five minutes fast.' },
		{ w: 'bottle', pos: 'noun', kind: 'thing', def: 'a container with a narrow neck, for holding liquids', ex: 'He filled a bottle with water before the hike.' },
		{ w: 'letter', pos: 'noun', kind: 'thing', def: 'a written message sent to someone; also, one of the symbols of an alphabet', ex: 'She wrote a letter to her grandmother.', syn: ['note', 'message'] },
		{ w: 'phone', pos: 'noun', kind: 'thing', def: 'a device for talking to people far away; today, usually a small computer you carry', ex: 'My phone buzzed with a new message.', syn: ['telephone'] },
		{ w: 'window', pos: 'noun', def: 'an opening in a wall, usually filled with glass, that lets in light and air', ex: 'Rain tapped against the window all night.' },
		{ w: 'door', pos: 'noun', def: 'a panel that opens and closes the way into a room, building or vehicle', ex: 'Please close the door behind you.' },
		{ w: 'candle', pos: 'noun', kind: 'thing', def: 'a stick of wax with a wick that burns to give light', ex: 'We lit a candle when the power went out.' },
		{ w: 'map', pos: 'noun', kind: 'thing', def: 'a drawing of an area that shows where places, roads and features are', ex: 'We spread the map out on the hood of the car.' },
		{ w: 'blanket', pos: 'noun', kind: 'thing', def: 'a large, warm cover, used on a bed or wrapped around you', ex: 'He pulled the blanket up to his chin.' },
		{ w: 'bicycle', pos: 'noun', def: 'a vehicle with two wheels that you ride by pushing pedals', ex: 'She rides her bicycle to work.', syn: ['bike'] },
		{ w: 'kite', pos: 'noun', kind: 'thing', def: 'a light frame covered in cloth or paper that flies in the wind on a long string', ex: 'The kite climbed higher with every gust.' },
		{ w: 'camera', pos: 'noun', kind: 'thing', def: 'a device for taking photographs or recording video', ex: 'He always carries a camera on holiday.' },
		{ w: 'mirror', pos: 'noun', kind: 'thing', def: 'a sheet of glass with a shiny back that shows a reflection', ex: 'She checked her hair in the mirror.' },
		{ w: 'ladder', pos: 'noun', def: 'a set of steps between two long sides, used for climbing up and down', ex: 'Hold the ladder steady while I climb.' },
		{ w: 'hammer', pos: 'noun', kind: 'thing', def: 'a tool with a heavy head on a handle, used for hitting nails', ex: 'Pass me the hammer and a few nails.' },
		{ w: 'box', pos: 'noun', kind: 'thing', def: 'a container with flat sides, often with a lid', ex: 'The box was full of old photographs.', syn: ['carton', 'crate'] },
		{ w: 'light', pos: 'noun', def: 'the brightness that lets you see, from the sun, a fire or a lamp', ex: 'Open the curtains and let some light in.', ant: ['dark', 'darkness'] },
		{ w: 'light', pos: 'adjective', use: 'object', def: 'not heavy; also, pale in color', ex: 'The box was light enough to carry with one hand.', ant: ['heavy', 'dark'] },
		{ w: 'watch', pos: 'noun', kind: 'thing', def: 'a small clock worn on the wrist', ex: 'He glanced at his watch and hurried out.' },
		{ w: 'watch', pos: 'verb', obj: 'the sunset', def: 'to look at something for a while, paying attention to it', ex: 'We watched the boats come into the harbor.', syn: ['observe', 'view'] },

		// Food and drink
		{ w: 'apple', pos: 'noun', kind: 'food', def: 'a round fruit with red, green or yellow skin and crisp white flesh', ex: 'She packed an apple for lunch.' },
		{ w: 'sandwich', pos: 'noun', kind: 'food', def: 'two slices of bread with a filling between them', ex: 'I made a cheese sandwich for the train.' },
		{ w: 'cake', pos: 'noun', kind: 'food', def: 'a sweet baked food made from flour, sugar, eggs and butter', ex: 'We had cake to celebrate her birthday.' },
		{ w: 'bread', pos: 'noun', kind: 'food', mass: true, def: 'a food made from flour, water and usually yeast, baked into a loaf', ex: 'The kitchen smelled of fresh bread.' },
		{ w: 'cheese', pos: 'noun', kind: 'food', mass: true, def: 'a food made from milk, often aged to develop its flavor', ex: 'He grated some cheese over the pasta.' },
		{ w: 'soup', pos: 'noun', kind: 'food', mass: true, def: 'a liquid food made by cooking vegetables, meat or fish in water or stock', ex: 'A bowl of soup is perfect on a cold day.' },
		{ w: 'coffee', pos: 'noun', kind: 'food', mass: true, def: 'a hot drink made from roasted, ground coffee beans', ex: 'I can\'t think before my first cup of coffee.' },
		{ w: 'tea', pos: 'noun', kind: 'food', mass: true, def: 'a drink made by pouring hot water over dried leaves of the tea plant', ex: 'Would you like a cup of tea?' },
		{ w: 'rice', pos: 'noun', kind: 'food', mass: true, def: 'small grains from a cereal plant, cooked in water and eaten as food', ex: 'We had rice with the curry.' },
		{ w: 'honey', pos: 'noun', kind: 'food', mass: true, def: 'a sweet, sticky food that bees make from flower nectar', ex: 'She stirred a spoonful of honey into her tea.' },

		// Places
		{ w: 'library', pos: 'noun', kind: 'place', at: 'at', def: 'a building or room where books are kept for people to read or borrow', ex: 'I returned my books to the library.' },
		{ w: 'park', pos: 'noun', kind: 'place', at: 'in', def: 'a public area of grass and trees in a town, for people to enjoy', ex: 'We had a picnic in the park.' },
		{ w: 'kitchen', pos: 'noun', kind: 'place', at: 'in', def: 'the room where food is prepared and cooked', ex: 'Everyone ends up in the kitchen at parties.' },
		{ w: 'beach', pos: 'noun', kind: 'place', at: 'at', def: 'a strip of sand or pebbles beside the sea or a lake', ex: 'We walked along the beach at low tide.', syn: ['shore', 'seaside'] },
		{ w: 'mountain', pos: 'noun', kind: 'place', at: 'on', def: 'a very high hill, often with steep sides', ex: 'Snow still covered the top of the mountain.', ant: ['valley'] },
		{ w: 'river', pos: 'noun', kind: 'place', at: 'by', def: 'a large, natural stream of water flowing to the sea or a lake', ex: 'The river was high after the storm.', syn: ['stream'] },
		{ w: 'city', pos: 'noun', kind: 'place', at: 'in', def: 'a large town where many people live and work', ex: 'The city looks different at night.', ant: ['village', 'countryside'] },
		{ w: 'village', pos: 'noun', kind: 'place', at: 'in', def: 'a small group of houses in the countryside, smaller than a town', ex: 'Everyone in the village came to the fair.', syn: ['hamlet'], ant: ['city'] },
		{ w: 'garden', pos: 'noun', kind: 'place', at: 'in', def: 'a piece of land by a house where flowers, plants or vegetables are grown', ex: 'Tomatoes are ripening in the garden.', syn: ['yard'] },
		{ w: 'island', pos: 'noun', kind: 'place', at: 'on', def: 'a piece of land with water all around it', ex: 'The ferry to the island leaves at noon.' },
		{ w: 'market', pos: 'noun', kind: 'place', at: 'at', def: 'a place where people buy and sell goods, often from stalls', ex: 'We bought peaches at the market.', syn: ['bazaar'] },
		{ w: 'museum', pos: 'noun', kind: 'place', at: 'at', def: 'a building where objects of art, history or science are kept and shown', ex: 'The museum has a whole room of dinosaur bones.' },

		// Ideas you can count
		{ w: 'idea', pos: 'noun', kind: 'idea', def: 'a thought or plan that forms in your mind', ex: 'Painting the door yellow was her idea.', syn: ['thought', 'notion'] },
		{ w: 'plan', pos: 'noun', kind: 'idea', def: 'a set of steps decided in advance for doing something', ex: 'The plan is to leave at seven.', syn: ['scheme', 'strategy'] },
		{ w: 'dream', pos: 'noun', kind: 'idea', def: 'images and events you experience while asleep; also, something you hope for', ex: 'Her dream is to sail around the world.', syn: ['hope', 'wish'] },
		{ w: 'question', pos: 'noun', kind: 'idea', def: 'something you ask to get information or an answer', ex: 'That\'s a good question; let me think.', syn: ['query'], ant: ['answer'] },
		{ w: 'memory', pos: 'noun', kind: 'idea', def: 'something you remember from the past; also, the ability to remember', ex: 'My earliest memory is of my grandfather\'s garden.', syn: ['recollection'] },
		{ w: 'secret', pos: 'noun', kind: 'idea', def: 'something kept hidden from others', ex: 'Can you keep a secret?' },
		{ w: 'story', pos: 'noun', kind: 'idea', plural: 'stories', def: 'an account of events, real or made up', ex: 'Tell me the story of how you met.', syn: ['tale', 'account'] },
		{ w: 'promise', pos: 'noun', kind: 'idea', def: 'a statement that you will certainly do something', ex: 'He kept his promise and called every week.', syn: ['vow', 'pledge'] },
		{ w: 'mistake', pos: 'noun', kind: 'idea', def: 'something done wrongly, often without meaning to', ex: 'Everyone makes a mistake now and then.', syn: ['error', 'slip'] },
		{ w: 'opinion', pos: 'noun', kind: 'idea', def: 'what you think or believe about something', ex: 'In my opinion, the book was better than the film.', syn: ['view', 'belief'], ant: ['fact'] },
		{ w: 'habit', pos: 'noun', kind: 'idea', def: 'something you do regularly, often without thinking', ex: 'Reading before bed is a good habit.', syn: ['routine', 'custom'] },
		{ w: 'adventure', pos: 'noun', kind: 'idea', def: 'an exciting or unusual experience, often a bit risky', ex: 'Getting lost in the old town turned into an adventure.' },
		{ w: 'journey', pos: 'noun', kind: 'idea', def: 'a trip from one place to another, especially a long one', ex: 'The journey took three days by train.', syn: ['trip', 'voyage'] },
		{ w: 'paradox', pos: 'noun', kind: 'idea', def: 'a statement or situation that seems to contradict itself but may still be true', ex: '"Less is more" is a paradox that designers love.' },
		{ w: 'metaphor', pos: 'noun', kind: 'idea', def: 'a figure of speech that calls one thing another to suggest a likeness, like "time is a thief"', ex: 'The poet used the sea as a metaphor for grief.' },
		{ w: 'simile', pos: 'noun', def: 'a figure of speech that compares two things using "like" or "as", like "as brave as a lion"', ex: '"She ran like the wind" is a simile.' },
		{ w: 'idiom', pos: 'noun', kind: 'idea', def: 'a phrase whose meaning isn\'t clear from its words, like "break a leg" for "good luck"', ex: '"Under the weather" is an idiom for feeling ill.', syn: ['expression', 'saying'] },
		{ w: 'cliche', pos: 'noun', forms: ['cliché'], def: 'a phrase or idea used so often it has lost its force', ex: '"Every cloud has a silver lining" has become a cliche.', syn: ['platitude'] },
		{ w: 'pun', pos: 'noun', kind: 'idea', def: 'a joke that plays on a word with two meanings or two words that sound alike', ex: 'Her pun about the baker was so bad it was good.', syn: ['wordplay'] },
		{ w: 'oxymoron', pos: 'noun', def: 'a phrase that puts two opposite words together, like "deafening silence"', ex: '"Jumbo shrimp" is a well-known oxymoron.' },
		{ w: 'onomatopoeia', pos: 'noun', def: 'a word that sounds like what it describes, like "buzz", "sizzle" or "bang"', ex: 'Comic books are full of onomatopoeia: pow, zap, whoosh.' },

		// Ideas you can't count
		{ w: 'music', pos: 'noun', kind: 'idea', mass: true, def: 'sounds arranged in a pleasing or expressive way, sung or played on instruments', ex: 'Music drifted up from the street below.' },
		{ w: 'time', pos: 'noun', kind: 'idea', mass: true, def: 'the ongoing passing of moments, measured in seconds, hours and years', ex: 'We lost track of time talking.' },
		{ w: 'love', pos: 'noun', kind: 'idea', mass: true, def: 'a strong feeling of care and affection for someone or something', ex: 'They wrote each other letters full of love.', syn: ['affection', 'devotion'], ant: ['hate'] },
		{ w: 'courage', pos: 'noun', kind: 'idea', mass: true, def: 'the ability to do something even though it frightens you', ex: 'It took courage to speak up.', syn: ['bravery', 'nerve'], ant: ['fear', 'cowardice'] },
		{ w: 'patience', pos: 'noun', kind: 'idea', mass: true, def: 'the ability to wait or put up with difficulty without getting upset', ex: 'Teaching a child to ride a bike takes patience.', ant: ['impatience'] },
		{ w: 'knowledge', pos: 'noun', kind: 'idea', mass: true, def: 'facts, information and skills you have learned', ex: 'Her knowledge of birds is remarkable.', syn: ['understanding', 'learning'], ant: ['ignorance'] },
		{ w: 'freedom', pos: 'noun', kind: 'idea', mass: true, def: 'the power to act, speak or think as you want', ex: 'Summer holidays meant freedom.', syn: ['liberty', 'independence'] },
		{ w: 'friendship', pos: 'noun', kind: 'idea', mass: true, def: 'the relationship between friends', ex: 'Their friendship lasted fifty years.' },
		{ w: 'kindness', pos: 'noun', kind: 'idea', mass: true, def: 'the quality of being friendly, generous and caring', ex: 'I won\'t forget your kindness.', syn: ['compassion', 'warmth'], ant: ['cruelty'] },
		{ w: 'happiness', pos: 'noun', kind: 'idea', mass: true, def: 'the feeling of being happy', ex: 'Small things bring her a lot of happiness.', syn: ['joy', 'contentment'], ant: ['sadness'] },
		{ w: 'nostalgia', pos: 'noun', kind: 'idea', mass: true, def: 'a fond, slightly sad longing for the past', ex: 'The old song filled him with nostalgia.' },
		{ w: 'serendipity', pos: 'noun', kind: 'idea', mass: true, def: 'luck in finding good things you weren\'t looking for', ex: 'Meeting her on the wrong train was pure serendipity.', syn: ['chance', 'luck'] },
		{ w: 'empathy', pos: 'noun', kind: 'idea', mass: true, def: 'the ability to understand and share someone else\'s feelings', ex: 'A good nurse needs plenty of empathy.', syn: ['understanding', 'compassion'] },
		{ w: 'curiosity', pos: 'noun', kind: 'idea', mass: true, def: 'a strong wish to know or learn something', ex: 'Curiosity got the better of me, and I opened the box.' },
		{ w: 'sarcasm', pos: 'noun', mass: true, def: 'saying the opposite of what you mean, to mock or tease', ex: '"Oh, great, more rain," she said with obvious sarcasm.' },
		{ w: 'irony', pos: 'noun', mass: true, def: 'a gap between what is expected and what happens, or between what is said and what is meant', ex: 'The irony is that the fire station burned down.' },
		{ w: 'weather', pos: 'noun', mass: true, def: 'the state of the air outside: sun, rain, wind, temperature and so on', ex: 'The weather turned cold overnight.' },

		// Verbs that need nothing after them
		{ w: 'run', pos: 'verb', act: true, past: 'ran', def: 'to move quickly on your feet, faster than walking', ex: 'She runs by the river before work.', syn: ['jog', 'sprint', 'dash'], ant: ['walk'] },
		{ w: 'run', pos: 'noun', def: 'a period of running; also, a point scored in baseball or cricket', ex: 'I go for a run every morning.' },
		{ w: 'walk', pos: 'verb', act: true, def: 'to move along on foot at an ordinary pace', ex: 'We walked home through the park.', syn: ['stroll', 'wander'], ant: ['run'] },
		{ w: 'sleep', pos: 'verb', act: true, past: 'slept', def: 'to rest with your eyes closed and your mind unaware', ex: 'The baby slept through the night.', syn: ['doze', 'nap'], ant: ['wake'] },
		{ w: 'laugh', pos: 'verb', act: true, def: 'to make the sounds and face that show you find something funny', ex: 'We laughed until our sides hurt.', syn: ['chuckle', 'giggle'], ant: ['cry'] },
		{ w: 'smile', pos: 'verb', act: true, def: 'to turn up the corners of your mouth to show you\'re pleased or friendly', ex: 'She smiled when she saw the card.', syn: ['grin', 'beam'], ant: ['frown'] },
		{ w: 'swim', pos: 'verb', act: true, past: 'swam', def: 'to move through water using your arms and legs', ex: 'We swam out to the rocks and back.' },
		{ w: 'dance', pos: 'verb', act: true, def: 'to move your body in time to music', ex: 'They danced in the kitchen while dinner cooked.' },
		{ w: 'sing', pos: 'verb', act: true, past: 'sang', def: 'to make music with your voice', ex: 'He sings in the shower every morning.' },
		{ w: 'cry', pos: 'verb', act: true, def: 'to shed tears, usually from sadness or pain; also, to shout', ex: 'The film made me cry.', syn: ['weep', 'sob'], ant: ['laugh'] },
		{ w: 'travel', pos: 'verb', act: true, def: 'to go from one place to another, especially far away', ex: 'They travel to a new country every summer.', syn: ['journey', 'tour'] },
		{ w: 'wait', pos: 'verb', act: true, def: 'to stay where you are until something happens or someone comes', ex: 'Wait here; I\'ll be right back.', syn: ['stay', 'linger'] },
		{ w: 'rest', pos: 'verb', act: true, def: 'to stop working or moving so you can relax or recover', ex: 'Rest for a minute before you carry on.', syn: ['relax', 'pause'] },
		{ w: 'think', pos: 'verb', act: true, past: 'thought', def: 'to use your mind to consider something or form an opinion', ex: 'Let me think about it overnight.', syn: ['consider', 'ponder'] },
		{ w: 'wander', pos: 'verb', act: true, def: 'to walk around slowly without a particular aim', ex: 'We wandered through the old streets all afternoon.', syn: ['roam', 'stroll'] },
		{ w: 'relax', pos: 'verb', act: true, def: 'to rest and become calm, letting go of worry or tension', ex: 'Sit down and relax; dinner\'s nearly ready.', syn: ['unwind'] },
		{ w: 'listen', pos: 'verb', act: true, def: 'to pay attention to sounds or to what someone says', ex: 'Listen carefully to the instructions.', syn: ['hear', 'heed'], ant: ['ignore'] },
		{ w: 'procrastinate', pos: 'verb', act: true, def: 'to keep putting off something you should do', ex: 'I procrastinated all week and wrote the essay in one night.', syn: ['delay', 'stall'] },
		{ w: 'go', pos: 'verb', past: 'went', def: 'to move from one place to another', ex: 'We go to the coast every August.', syn: ['leave', 'travel'], ant: ['come', 'stay'] },
		{ w: 'arrive', pos: 'verb', def: 'to reach a place at the end of a journey', ex: 'The train arrived ten minutes late.', syn: ['reach', 'land'], ant: ['leave', 'depart'] },

		// Verbs that act on something
		{ w: 'read', pos: 'verb', obj: 'the letter', past: 'read', def: 'to look at written words and understand them', ex: 'I read the whole book in one sitting.' },
		{ w: 'write', pos: 'verb', obj: 'a short note', past: 'wrote', def: 'to put words or symbols on paper or a screen', ex: 'She writes in her journal every night.' },
		{ w: 'build', pos: 'verb', obj: 'a birdhouse', past: 'built', def: 'to make something by putting parts together', ex: 'They built a treehouse in the old oak.', syn: ['construct', 'assemble'], ant: ['destroy'] },
		{ w: 'find', pos: 'verb', obj: 'her keys', past: 'found', def: 'to discover something, by searching or by chance', ex: 'I found a coin under the sofa.', syn: ['discover', 'locate'], ant: ['lose'] },
		{ w: 'fix', pos: 'verb', obj: 'the bike', def: 'to repair something that is broken', ex: 'He fixed the leaky tap himself.', syn: ['repair', 'mend'], ant: ['break'] },
		{ w: 'paint', pos: 'verb', obj: 'the fence', def: 'to cover something with paint, or to make a picture with paint', ex: 'We painted the bedroom a pale green.' },
		{ w: 'open', pos: 'verb', obj: 'the window', def: 'to move something so it is no longer closed', ex: 'Open the window and let some air in.', ant: ['close', 'shut'] },
		{ w: 'carry', pos: 'verb', obj: 'the boxes', def: 'to hold something and take it somewhere', ex: 'Can you carry the shopping inside?', syn: ['bring', 'haul'] },
		{ w: 'borrow', pos: 'verb', obj: 'a book', def: 'to take something you will give back later', ex: 'Can I borrow your pen?', ant: ['lend'] },
		{ w: 'share', pos: 'verb', obj: 'her lunch', def: 'to let someone else have or use part of something', ex: 'The twins share a bedroom.' },
		{ w: 'learn', pos: 'verb', obj: 'the song', def: 'to gain knowledge or a skill by studying, practice or experience', ex: 'I\'m learning to play the guitar.', syn: ['study', 'master'], ant: ['forget'] },
		{ w: 'forget', pos: 'verb', obj: 'his umbrella', past: 'forgot', ing: 'forgetting', def: 'to fail to remember something', ex: 'Don\'t forget to lock the door.', ant: ['remember'] },
		{ w: 'remember', pos: 'verb', obj: 'the address', def: 'to keep something in your mind, or bring it back to mind', ex: 'I remember the day we met.', syn: ['recall', 'recollect'], ant: ['forget'] },
		{ w: 'teach', pos: 'verb', obj: 'the class', past: 'taught', def: 'to help someone learn something', ex: 'She teaches music at the local school.', syn: ['instruct', 'educate'], ant: ['learn'] },
		{ w: 'buy', pos: 'verb', obj: 'some bread', past: 'bought', def: 'to get something by paying money for it', ex: 'We bought a new kettle.', syn: ['purchase'], ant: ['sell'] },
		{ w: 'make', pos: 'verb', obj: 'a sandwich', past: 'made', def: 'to create or prepare something', ex: 'He made pancakes for breakfast.', syn: ['create', 'produce'] },
		{ w: 'bake', pos: 'verb', obj: 'a cake', def: 'to cook food in an oven with dry heat', ex: 'We bake bread every Sunday.' },
		{ w: 'cook', pos: 'verb', obj: 'dinner', def: 'to prepare food by heating it', ex: 'Who\'s cooking tonight?' },
		{ w: 'clean', pos: 'verb', obj: 'the kitchen', def: 'to remove dirt from something', ex: 'We cleaned the house before the guests arrived.', syn: ['wash', 'tidy'] },
		{ w: 'catch', pos: 'verb', obj: 'the ball', past: 'caught', def: 'to take hold of something moving through the air; also, to get an illness', ex: 'She caught the ball with one hand.', ant: ['drop', 'throw'] },
		{ w: 'throw', pos: 'verb', obj: 'the ball', past: 'threw', def: 'to send something through the air with a movement of your arm', ex: 'Throw the stick and the dog will fetch it.', syn: ['toss', 'pitch'], ant: ['catch'] },
		{ w: 'explain', pos: 'verb', obj: 'the rules', def: 'to make something clear by describing it in more detail', ex: 'Can you explain how this works?', syn: ['clarify', 'describe'] },
		{ w: 'choose', pos: 'verb', obj: 'a seat', past: 'chose', def: 'to decide which of several things you want', ex: 'Choose any card you like.', syn: ['pick', 'select'] },
		{ w: 'break', pos: 'verb', obj: 'a glass', past: 'broke', def: 'to make something separate into pieces or stop working', ex: 'Careful, you\'ll break the vase.', syn: ['smash', 'shatter'], ant: ['fix', 'repair'] },
		{ w: 'describe', pos: 'verb', obj: 'the view', def: 'to say what something or someone is like', ex: 'Describe the man you saw.', syn: ['portray', 'explain'] },
		{ w: 'organize', pos: 'verb', obj: 'the shelves', forms: ['organise'], def: 'to arrange things in order, or to plan an event', ex: 'She organized the books by color.', syn: ['arrange', 'sort'] },
		{ w: 'ignore', pos: 'verb', obj: 'the noise', def: 'to pay no attention to something on purpose', ex: 'Just ignore the barking; he\'ll settle down.', syn: ['disregard'], ant: ['notice'] },
		{ w: 'admire', pos: 'verb', obj: 'the view', def: 'to look at something with pleasure, or to respect someone', ex: 'I admire how calm she stays under pressure.', syn: ['respect', 'appreciate'] },
		{ w: 'notice', pos: 'verb', obj: 'the change', def: 'to become aware of something', ex: 'Did you notice the new sign?', syn: ['spot', 'see'], ant: ['ignore', 'miss'] },
		{ w: 'see', pos: 'verb', obj: 'the comet', past: 'saw', def: 'to notice or take in something with your eyes', ex: 'I saw a shooting star last night.', syn: ['spot', 'notice'] },
		{ w: 'hear', pos: 'verb', obj: 'the thunder', past: 'heard', def: 'to take in sounds with your ears', ex: 'Did you hear that noise?' },
		{ w: 'eat', pos: 'verb', obj: 'an apple', past: 'ate', def: 'to put food in your mouth, chew it and swallow it', ex: 'We ate dinner on the porch.' },
		{ w: 'drink', pos: 'verb', obj: 'a glass of water', past: 'drank', def: 'to take liquid into your mouth and swallow it', ex: 'Drink plenty of water when it\'s hot.', syn: ['sip'] },
		{ w: 'help', pos: 'verb', def: 'to make it easier for someone to do something', ex: 'Could you help me move this table?', syn: ['assist', 'aid'], ant: ['hinder'] },
		{ w: 'imagine', pos: 'verb', def: 'to form a picture or idea of something in your mind', ex: 'Imagine a house made entirely of glass.', syn: ['picture', 'envision'] },

		// Adjectives for feelings
		{ w: 'happy', pos: 'adjective', use: 'feel', def: 'feeling or showing pleasure', ex: 'She was happy to see her old friend.', syn: ['glad', 'cheerful', 'joyful'], ant: ['sad', 'unhappy'] },
		{ w: 'sad', pos: 'adjective', use: 'feel', def: 'feeling unhappy or sorry', ex: 'The ending of the film was sad.', syn: ['unhappy', 'down', 'gloomy'], ant: ['happy', 'cheerful'] },
		{ w: 'tired', pos: 'adjective', use: 'feel', def: 'needing rest or sleep', ex: 'I was tired after the long drive.', syn: ['sleepy', 'weary', 'exhausted'], ant: ['rested', 'energetic'] },
		{ w: 'hungry', pos: 'adjective', use: 'feel', def: 'wanting or needing food', ex: 'Swimming always makes me hungry.', syn: ['starving', 'peckish'], ant: ['full'] },
		{ w: 'calm', pos: 'adjective', use: 'feel', def: 'peaceful and not worried, angry or excited', ex: 'She stayed calm when the alarm went off.', syn: ['relaxed', 'serene'], ant: ['anxious', 'nervous'] },
		{ w: 'nervous', pos: 'adjective', use: 'feel', def: 'worried or a little afraid about something that is going to happen', ex: 'I always get nervous before an exam.', syn: ['anxious', 'uneasy'], ant: ['calm', 'confident'] },
		{ w: 'excited', pos: 'adjective', use: 'feel', def: 'very happy and eager about something', ex: 'The kids were excited about the trip.', syn: ['thrilled', 'eager'], ant: ['bored'] },
		{ w: 'bored', pos: 'adjective', use: 'feel', def: 'tired and restless because nothing interests you', ex: 'I got bored waiting at the airport.', ant: ['interested', 'excited'] },
		{ w: 'curious', pos: 'adjective', use: 'feel', def: 'wanting to know or learn about something', ex: 'I\'m curious about how it ends.', syn: ['inquisitive', 'interested'], ant: ['indifferent'] },
		{ w: 'grateful', pos: 'adjective', use: 'feel', def: 'feeling thankful for something someone did', ex: 'I\'m grateful for all your help.', syn: ['thankful', 'appreciative'], ant: ['ungrateful'] },
		{ w: 'lonely', pos: 'adjective', use: 'feel', def: 'sad because you are alone or feel no one is close to you', ex: 'He felt lonely in the new city at first.', syn: ['isolated'] },
		{ w: 'proud', pos: 'adjective', use: 'feel', def: 'pleased about something you or someone close to you did', ex: 'Her parents were proud of her.', ant: ['ashamed', 'humble'] },
		{ w: 'confused', pos: 'adjective', use: 'feel', def: 'unable to understand something or think clearly about it', ex: 'I was confused by the directions.', syn: ['puzzled', 'baffled'] },
		{ w: 'relieved', pos: 'adjective', use: 'feel', def: 'happy because a worry or difficulty has gone away', ex: 'We were relieved when the plane landed.' },

		// Adjectives for character
		{ w: 'kind', pos: 'adjective', use: 'trait', def: 'friendly, generous and caring toward others', ex: 'It was kind of you to wait for me.', syn: ['caring', 'generous', 'gentle'], ant: ['cruel', 'unkind'] },
		{ w: 'kind', pos: 'noun', def: 'a type or sort of something', ex: 'What kind of music do you like?', syn: ['type', 'sort'] },
		{ w: 'brave', pos: 'adjective', use: 'trait', def: 'ready to face danger or difficulty without showing fear', ex: 'The brave firefighter went back in for the dog.', syn: ['courageous', 'bold', 'fearless'], ant: ['cowardly', 'timid'] },
		{ w: 'clever', pos: 'adjective', use: 'trait', def: 'quick to learn and understand', ex: 'That was a clever way to solve it.', syn: ['smart', 'bright', 'intelligent'], ant: ['foolish'] },
		{ w: 'honest', pos: 'adjective', use: 'trait', def: 'telling the truth and not cheating', ex: 'Thanks for being honest with me.', syn: ['truthful', 'sincere'], ant: ['dishonest'] },
		{ w: 'patient', pos: 'adjective', use: 'trait', def: 'able to wait or put up with difficulty without getting upset', ex: 'Be patient; the bus will come.', ant: ['impatient'] },
		{ w: 'generous', pos: 'adjective', use: 'trait', def: 'happy to give money, time or help to others', ex: 'It was generous of them to pay for dinner.', syn: ['giving', 'kind'], ant: ['mean', 'selfish'] },
		{ w: 'polite', pos: 'adjective', use: 'trait', def: 'behaving in a respectful, considerate way', ex: 'It\'s polite to say thank you.', syn: ['courteous', 'respectful'], ant: ['rude'] },
		{ w: 'rude', pos: 'adjective', def: 'not polite; showing a lack of respect', ex: 'It\'s rude to interrupt.', syn: ['impolite'], ant: ['polite'] },
		{ w: 'wise', pos: 'adjective', use: 'trait', def: 'having good judgment that comes from experience and knowledge', ex: 'My grandmother gave me some wise advice.', syn: ['sensible', 'shrewd'], ant: ['foolish'] },
		{ w: 'humble', pos: 'adjective', use: 'trait', def: 'not proud; not thinking you are better than others', ex: 'Despite her success, she stayed humble.', syn: ['modest'], ant: ['arrogant', 'proud'] },
		{ w: 'gregarious', pos: 'adjective', use: 'trait', def: 'fond of company; sociable', ex: 'He\'s gregarious and knows everyone in town.', syn: ['sociable', 'outgoing'], ant: ['shy', 'reserved'] },
		{ w: 'meticulous', pos: 'adjective', use: 'trait', def: 'very careful about small details', ex: 'She keeps meticulous notes.', syn: ['careful', 'thorough', 'precise'], ant: ['careless', 'sloppy'] },
		{ w: 'pragmatic', pos: 'adjective', use: 'trait', def: 'dealing with things in a practical, realistic way', ex: 'We need a pragmatic solution, not a perfect one.', syn: ['practical', 'realistic'], ant: ['idealistic'] },
		{ w: 'candid', pos: 'adjective', use: 'trait', def: 'honest and direct, even when it\'s uncomfortable', ex: 'Thanks for your candid feedback.', syn: ['frank', 'blunt', 'open'], ant: ['guarded'] },
		{ w: 'eloquent', pos: 'adjective', use: 'trait', def: 'speaking or writing clearly and persuasively', ex: 'She gave an eloquent speech at the wedding.', syn: ['articulate', 'expressive'] },
		{ w: 'benevolent', pos: 'adjective', use: 'trait', def: 'kind and wanting to do good for others', ex: 'A benevolent stranger paid for our coffee.', syn: ['kind', 'charitable'], ant: ['malevolent'] },
		{ w: 'resilient', pos: 'adjective', use: 'trait', def: 'able to recover quickly from difficulty', ex: 'Children are often more resilient than we think.', syn: ['tough', 'hardy'], ant: ['fragile'] },

		// Adjectives for objects
		{ w: 'big', pos: 'adjective', use: 'object', def: 'large in size or amount', ex: 'That\'s a big suitcase for a weekend.', syn: ['large', 'huge'], ant: ['small', 'little'] },
		{ w: 'small', pos: 'adjective', use: 'object', def: 'little in size or amount', ex: 'They live in a small flat above a bakery.', syn: ['little', 'tiny'], ant: ['big', 'large'] },
		{ w: 'old', pos: 'adjective', use: 'object', def: 'having lived or existed for a long time', ex: 'The old bridge is made of stone.', syn: ['ancient', 'aged'], ant: ['new', 'young'] },
		{ w: 'new', pos: 'adjective', def: 'recently made, bought or started', ex: 'I need new shoes.', syn: ['fresh', 'recent'], ant: ['old'] },
		{ w: 'heavy', pos: 'adjective', use: 'object', def: 'weighing a lot; hard to lift', ex: 'This bag is too heavy for me.', ant: ['light'] },
		{ w: 'tiny', pos: 'adjective', use: 'object', def: 'very small', ex: 'A tiny spider spun a web on the mirror.', syn: ['minute', 'little'], ant: ['huge', 'enormous'] },
		{ w: 'enormous', pos: 'adjective', use: 'object', def: 'very large', ex: 'An enormous wave crashed over the pier.', syn: ['huge', 'gigantic', 'vast'], ant: ['tiny'] },
		{ w: 'beautiful', pos: 'adjective', use: 'object', def: 'very pleasing to look at or listen to', ex: 'What a beautiful view.', syn: ['lovely', 'gorgeous'], ant: ['ugly'] },
		{ w: 'ancient', pos: 'adjective', use: 'object', def: 'very old; from long ago', ex: 'They found ancient coins in the field.', syn: ['old', 'antique'], ant: ['modern'] },
		{ w: 'fragile', pos: 'adjective', use: 'object', def: 'easily broken or damaged', ex: 'Careful, those glasses are fragile.', syn: ['delicate', 'breakable'], ant: ['sturdy'] },
		{ w: 'shiny', pos: 'adjective', use: 'object', def: 'reflecting light; bright and polished', ex: 'He bought a shiny red bike.', syn: ['glossy', 'gleaming'], ant: ['dull'] },
		{ w: 'soft', pos: 'adjective', def: 'not hard or firm; gentle to touch or quiet to hear', ex: 'The kitten\'s fur was soft.', ant: ['hard', 'loud'] },

		// Adjectives for places
		{ w: 'quiet', pos: 'adjective', use: 'place', def: 'making little or no noise', ex: 'The library is quiet in the mornings.', syn: ['silent', 'hushed'], ant: ['loud', 'noisy'] },
		{ w: 'bright', pos: 'adjective', use: 'place', def: 'full of light; also, clever', ex: 'The room was bright and warm.', syn: ['sunny', 'radiant'], ant: ['dark', 'dim'] },
		{ w: 'dark', pos: 'adjective', use: 'place', def: 'with little or no light', ex: 'It gets dark early in winter.', syn: ['dim', 'gloomy'], ant: ['bright', 'light'] },
		{ w: 'warm', pos: 'adjective', use: 'place', def: 'pleasantly hot, but not very hot', ex: 'Come inside where it\'s warm.', ant: ['cool', 'cold'] },
		{ w: 'cold', pos: 'adjective', use: 'place', def: 'having a low temperature', ex: 'The water was too cold for swimming.', syn: ['chilly', 'freezing'], ant: ['hot', 'warm'] },
		{ w: 'empty', pos: 'adjective', use: 'place', def: 'with nothing or no one inside', ex: 'The theater was empty after the show.', syn: ['vacant', 'bare'], ant: ['full'] },
		{ w: 'crowded', pos: 'adjective', use: 'place', def: 'full of people', ex: 'The train was crowded at rush hour.', syn: ['packed', 'busy'], ant: ['empty', 'deserted'] },
		{ w: 'peaceful', pos: 'adjective', use: 'place', def: 'calm and quiet, without trouble', ex: 'The lake is peaceful at dawn.', syn: ['tranquil', 'serene'], ant: ['noisy', 'chaotic'] },
		{ w: 'noisy', pos: 'adjective', use: 'place', def: 'full of or making a lot of noise', ex: 'The café was too noisy to talk.', syn: ['loud', 'rowdy'], ant: ['quiet'] },
		{ w: 'cozy', pos: 'adjective', use: 'place', forms: ['cosy'], def: 'warm, comfortable and relaxing', ex: 'We spent the evening in a cozy little pub.', syn: ['snug', 'comfortable'] },

		// Adjectives for describing in general
		{ w: 'good', pos: 'adjective', def: 'of high quality, pleasant, or right', ex: 'That was a good idea.', syn: ['fine', 'great', 'excellent'], ant: ['bad', 'poor'] },
		{ w: 'bad', pos: 'adjective', def: 'of low quality, unpleasant, or wrong', ex: 'I had a bad night\'s sleep.', syn: ['poor', 'awful'], ant: ['good'] },
		{ w: 'fast', pos: 'adjective', def: 'moving or able to move quickly', ex: 'She\'s the fastest runner in the club.', syn: ['quick', 'rapid', 'swift'], ant: ['slow'] },
		{ w: 'slow', pos: 'adjective', def: 'moving or happening without much speed', ex: 'The slow train stops at every station.', ant: ['fast', 'quick'] },
		{ w: 'important', pos: 'adjective', def: 'mattering a lot', ex: 'Sleep is important for your health.', syn: ['significant', 'vital'], ant: ['trivial', 'unimportant'] },
		{ w: 'strange', pos: 'adjective', def: 'unusual or surprising; hard to explain', ex: 'I heard a strange noise in the attic.', syn: ['odd', 'peculiar', 'weird'], ant: ['normal', 'ordinary'] },
		{ w: 'delicious', pos: 'adjective', def: 'tasting or smelling very good', ex: 'The soup was delicious.', syn: ['tasty', 'scrumptious'], ant: ['disgusting'] },
		{ w: 'obvious', pos: 'adjective', def: 'easy to see or understand', ex: 'The answer seems obvious now.', syn: ['clear', 'plain', 'evident'], ant: ['hidden', 'subtle'] },
		{ w: 'ubiquitous', pos: 'adjective', def: 'found everywhere', ex: 'Smartphones have become ubiquitous.', syn: ['everywhere', 'omnipresent', 'widespread'], ant: ['rare', 'scarce'] },
		{ w: 'ephemeral', pos: 'adjective', def: 'lasting a very short time', ex: 'Fame on the internet is often ephemeral.', syn: ['fleeting', 'brief', 'short-lived'], ant: ['lasting', 'permanent'] },
		{ w: 'ambiguous', pos: 'adjective', def: 'having more than one possible meaning', ex: 'The ending of the story was deliberately ambiguous.', syn: ['unclear', 'vague'], ant: ['clear', 'definite'] },
		{ w: 'mundane', pos: 'adjective', def: 'ordinary and dull; part of everyday life', ex: 'Even mundane chores feel better with music on.', syn: ['ordinary', 'routine', 'humdrum'], ant: ['exciting', 'extraordinary'] },
		{ w: 'quintessential', pos: 'adjective', def: 'the most typical example of something', ex: 'Fish and chips by the sea is the quintessential British seaside meal.', syn: ['typical', 'classic'] },
		{ w: 'ironic', pos: 'adjective', def: 'happening in the opposite way to what you\'d expect; also, saying the opposite of what you mean', ex: 'It\'s ironic that the spelling bee poster had a typo.' },

		// Adverbs
		{ w: 'quickly', pos: 'adverb', use: 'manner', def: 'at a fast speed', ex: 'She quickly packed her bag.', syn: ['fast', 'rapidly', 'swiftly'], ant: ['slowly'] },
		{ w: 'slowly', pos: 'adverb', use: 'manner', def: 'at a slow speed; not quickly', ex: 'The boat slowly drifted to shore.', ant: ['quickly'] },
		{ w: 'quietly', pos: 'adverb', use: 'manner', def: 'making very little noise', ex: 'He quietly closed the door behind him.', syn: ['softly', 'silently'], ant: ['loudly'] },
		{ w: 'carefully', pos: 'adverb', use: 'manner', def: 'with attention, to avoid mistakes or damage', ex: 'Carry the eggs carefully.', syn: ['cautiously'], ant: ['carelessly'] },
		{ w: 'gently', pos: 'adverb', use: 'manner', def: 'in a soft, careful way', ex: 'She gently lifted the kitten.', syn: ['softly', 'tenderly'], ant: ['roughly'] },
		{ w: 'happily', pos: 'adverb', use: 'manner', def: 'in a happy way', ex: 'The children played happily in the snow.', syn: ['cheerfully', 'gladly'], ant: ['sadly'] },
		{ w: 'suddenly', pos: 'adverb', use: 'manner', def: 'quickly and without warning', ex: 'Suddenly the lights went out.', syn: ['abruptly', 'unexpectedly'], ant: ['gradually'] },
		{ w: 'patiently', pos: 'adverb', use: 'manner', def: 'without getting annoyed while waiting or dealing with difficulty', ex: 'The dog waited patiently by the door.' },
		{ w: 'always', pos: 'adverb', use: 'often', def: 'every time; at all times', ex: 'He always takes the stairs.', syn: ['forever', 'constantly'], ant: ['never'] },
		{ w: 'never', pos: 'adverb', use: 'often', def: 'at no time', ex: 'I\'ve never seen snow.', ant: ['always'] },
		{ w: 'often', pos: 'adverb', use: 'often', def: 'many times; frequently', ex: 'We often eat outside in summer.', syn: ['frequently', 'regularly'], ant: ['rarely', 'seldom'] },
		{ w: 'sometimes', pos: 'adverb', use: 'often', def: 'on some occasions, but not always', ex: 'Sometimes I walk to work.', syn: ['occasionally'] },
		{ w: 'rarely', pos: 'adverb', use: 'often', def: 'not often', ex: 'It rarely snows here.', syn: ['seldom', 'hardly ever'], ant: ['often', 'frequently'] },
		{ w: 'usually', pos: 'adverb', use: 'often', def: 'in most cases; normally', ex: 'I usually get up at seven.', syn: ['normally', 'generally'] },
		{ w: 'however', pos: 'adverb', def: 'used to add something that contrasts with what was just said', ex: 'It was raining. However, we still went for a walk.', syn: ['but', 'nevertheless'] },

		// Little words and greetings
		{ w: 'because', pos: 'conjunction', def: 'for the reason that', ex: 'We stayed in because it was raining.', syn: ['since', 'as'] },
		{ w: 'although', pos: 'conjunction', def: 'despite the fact that', ex: 'Although it was late, we kept talking.', syn: ['though', 'even though'] },
		{ w: 'between', pos: 'preposition', def: 'in the space or time separating two things', ex: 'The café is between the bank and the bakery.' },
		{ w: 'hello', pos: 'exclamation', forms: ['hullo', 'hallo'], def: 'a word used to greet someone or to start a phone call', ex: 'Hello! It\'s good to see you.', syn: ['hi', 'hey', 'greetings'], ant: ['goodbye'] },
		{ w: 'hey', pos: 'exclamation', variants: ['heya', 'hiya'], def: 'an informal greeting, or a way to get someone\'s attention', ex: 'Hey, how\'s it going?', syn: ['hi', 'hello'] },
		{ w: 'goodbye', pos: 'exclamation', forms: ['good-bye'], variants: ['bye'], def: 'a word said when leaving or ending a conversation', ex: 'We said goodbye at the station.', syn: ['farewell', 'bye', 'see you'], ant: ['hello'] },
		{ w: 'please', pos: 'adverb', def: 'a polite word added to a request', ex: 'Could you pass the salt, please?' },
		{ w: 'thanks', pos: 'exclamation', def: 'an informal way of saying "thank you"', ex: 'Thanks for the lift!', syn: ['thank you', 'cheers'] },

		// Words about words
		{ w: 'word', pos: 'noun', def: 'a single unit of language that means something and is written with a space on either side', ex: '"Onyx" is a short word.' },
		{ w: 'sentence', pos: 'noun', def: 'a group of words that expresses a complete thought, starting with a capital letter and ending with a full stop, question mark or exclamation mark', ex: 'Every sentence needs a verb.' },
		{ w: 'noun', pos: 'noun', def: 'a word that names a person, place, thing or idea, like "cat", "city" or "courage"', ex: 'In "the dog barked", "dog" is a noun.' },
		{ w: 'verb', pos: 'noun', def: 'a word for an action, a state or something happening, like "run", "be" or "seem"', ex: 'In "the dog barked", "barked" is the verb.' },
		{ w: 'adjective', pos: 'noun', def: 'a word that describes a noun, like "blue", "tall" or "happy"', ex: 'In "a red door", "red" is an adjective.' },
		{ w: 'adverb', pos: 'noun', def: 'a word that describes a verb, an adjective or another adverb, often ending in "-ly"', ex: 'In "she sang softly", "softly" is an adverb.' },
		{ w: 'synonym', pos: 'noun', def: 'a word that means the same or nearly the same as another, like "big" and "large"', ex: '"Happy" is a synonym of "glad".', ant: ['antonym'] },
		{ w: 'antonym', pos: 'noun', def: 'a word that means the opposite of another, like "hot" and "cold"', ex: '"Up" is the antonym of "down".', ant: ['synonym'] },
		{ w: 'dictionary', pos: 'noun', def: 'a book or list of words in alphabetical order, with their meanings', ex: 'Look it up in the dictionary.' },
	];

	/* ---------- Word forms ---------- */

	const VOWEL = /[aeiou]/;
	const syllables = (w) => (w.match(/[aeiouy]+/g) || []).length;
	// One syllable ending consonant-vowel-consonant doubles its last letter: run -> running, big -> bigger.
	const doubles = (w) => syllables(w) === 1 && /[^aeiou][aeiou][^aeiouwxy]$/.test(w);

	function plural(e) {
		if (e.plural) return e.plural;
		const w = e.w;
		if (/(s|x|z|ch|sh)$/.test(w)) return w + 'es';
		if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies';
		return w + 's';
	}
	function third(e) {
		const w = e.w;
		if (w === 'go') return 'goes';
		if (/(s|x|z|ch|sh)$/.test(w)) return w + 'es';
		if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies';
		return w + 's';
	}
	function past(e) {
		if (e.past) return e.past;
		const w = e.w;
		if (w.endsWith('e')) return w + 'd';
		if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ied';
		return (doubles(w) ? w + w.slice(-1) : w) + 'ed';
	}
	function ing(e) {
		if (e.ing) return e.ing;
		const w = e.w;
		if (w.endsWith('ie')) return w.slice(0, -2) + 'ying';
		if (/[^e]e$/.test(w) && w !== 'be') return w.slice(0, -1) + 'ing';
		return (doubles(w) ? w + w.slice(-1) : w) + 'ing';
	}
	/** happier, happiest; only for short adjectives, which take -er and -est. */
	function compare(e) {
		const w = e.w;
		if (syllables(w) > 2 || (syllables(w) === 2 && !/y$/.test(w))) return [];
		if (w === 'good') return ['better', 'best'];
		if (w === 'bad') return ['worse', 'worst'];
		if (/[^aeiou]y$/.test(w)) return [w.slice(0, -1) + 'ier', w.slice(0, -1) + 'iest'];
		if (w.endsWith('e')) return [w + 'r', w + 'st'];
		const stem = doubles(w) ? w + w.slice(-1) : w;
		return [stem + 'er', stem + 'est'];
	}

	/** Every spelling Onyx recognizes, mapped to the entries it belongs to and what form it is. */
	const index = new Map();
	const add = (form, e, label) => {
		if (!index.has(form)) index.set(form, []);
		if (!index.get(form).some((x) => x.e === e)) index.get(form).push({ e, label });
	};
	for (const e of WORDS) {
		add(e.w, e, null);
		(e.forms || []).forEach((f) => add(f, e, 'spelling'));
		(e.variants || []).forEach((f) => add(f, e, 'variant'));
	}
	// Inflections go in after base words, so "light" the noun stays a noun, not the plural of anything.
	for (const e of WORDS) {
		if (e.pos === 'noun' && !e.mass) add(plural(e), e, 'plural');
		if (e.pos === 'verb') {
			add(third(e), e, 'present');
			add(past(e), e, 'past tense');
			add(ing(e), e, '-ing form');
		}
		if (e.pos === 'adjective') {
			const [er, est] = compare(e);
			if (er) {
				add(er, e, 'comparative');
				add(est, e, 'superlative');
			}
		}
	}

	const clean = (s) => String(s).toLowerCase().trim().replace(/^["'“‘]+|["'”’.?!,]+$/g, '').replace(/^(?:the word|word)\s+/, '').replace(/^(?:an?|the|to)\s+(?=\S)/, '').trim();

	/** Finds a word, or any form of it: "ran" finds run, "children" finds child. Returns [{ e, label }] or null. */
	function lookup(word) {
		const w = clean(word);
		return index.get(w) || null;
	}

	const FORM_NAMES = { plural: 'the plural of', present: 'a present-tense form of', 'past tense': 'the past tense of', '-ing form': 'the -ing form of', comparative: 'the comparative of', superlative: 'the superlative of', spelling: 'another spelling of', variant: 'an informal form of' };

	/** "ran" -> "**Ran** is the past tense of **run**.\n\n", so the definition that follows makes sense. */
	function formNote(word, hits) {
		const h = hits.find((x) => x.label);
		if (!h || hits.some((x) => !x.label)) return '';
		const one = hits.every((x) => x.label === h.label);
		return `**${clean(word)}** is ${one ? FORM_NAMES[h.label] : 'a form of'} **${h.e.w}**.\n\n`;
	}

	const also = (e) => [e.syn && e.syn.length ? `Similar: ${e.syn.join(', ')}.` : '', e.ant && e.ant.length ? `Opposite: ${e.ant.join(', ')}.` : ''].filter(Boolean).join(' ');

	/** A dictionary entry for a word, as Markdown; null if the word isn't in it. */
	function define(word) {
		const hits = lookup(word);
		if (!hits) return null;
		const entries = hits.filter((x) => !x.label).length ? hits.filter((x) => !x.label).map((x) => x.e) : hits.map((x) => x.e);
		const sense = (e) => `${e.def[0].toUpperCase()}${e.def.slice(1)}.\n*"${e.ex}"*${also(e) ? '\n' + also(e) : ''}`;
		const body = entries.length === 1 ? `**${entries[0].w}** *(${entries[0].pos})*\n${sense(entries[0])}` : `**${entries[0].w}**\n\n${entries.map((e, i) => `${i + 1}. *(${e.pos})* ${sense(e)}`).join('\n\n')}`;
		return formNote(word, hits) + body;
	}

	/** "Some words like **happy**: glad, cheerful." or the opposites; null if the word is unknown. */
	function related(word, opposite) {
		const hits = lookup(word);
		if (!hits) return null;
		const list = [...new Set(hits.flatMap((x) => (opposite ? x.e.ant : x.e.syn) || []))];
		const w = hits[0].e.w;
		if (!list.length) return opposite ? `I don't have an opposite for **${w}**.` : `I don't have other words for **${w}**.`;
		return opposite ? `The opposite of **${w}**: ${list.join(', ')}.` : `Other words for **${w}**: ${list.join(', ')}.`;
	}

	function partOfSpeech(word) {
		const hits = lookup(word);
		if (!hits) return null;
		const kinds = [...new Set(hits.map((x) => x.e.pos))];
		const w = clean(word);
		const form = hits.find((x) => x.label);
		const note = form && !hits.some((x) => !x.label) ? ` (${FORM_NAMES[form.label]} "${form.e.w}")` : '';
		return kinds.length === 1 ? `"${w}" is ${/^[aeiou]/.test(kinds[0]) ? 'an' : 'a'} ${kinds[0]}${note}.` : `"${w}" can be ${kinds.map((k) => (/^[aeiou]/.test(k) ? 'an ' : 'a ') + k).join(' or ')}.`;
	}

	/* ---------- Making sentences ---------- */

	const a = (phrase) => (/^(hour|honest|honou?r|heir)/.test(phrase) || (VOWEL.test(phrase[0]) && !/^(u[nst]i|ubi|use|usu|eu|one\b)/.test(phrase)) ? 'an ' : 'a ') + phrase;
	const cap = (s) => s[0].toUpperCase() + s.slice(1);

	/* Each template takes the entry and a picker for filler words of a kind; all are written to read naturally with any word of their slot. */
	const TEMPLATES = {
		person: [(e) => `${cap(a(e.w))} lives just down the road from us.`, (e) => `${cap(a(e.w))} waved at us from across the street.`, (e) => `We met ${a(e.w)} on the train yesterday.`, (e) => `I asked ${a(e.w)} for directions.`],
		animal: [(e) => `${cap(a(e.w))} wandered into the garden this morning.`, (e) => `Have you ever seen ${a(e.w)} up close?`, (e) => `The ${e.w} watched us from a distance.`],
		thing: [(e) => `I left the ${e.w} on the kitchen table.`, (e) => `Could you pass me that ${e.w}?`, (e, pick) => `She found ${a(pick('object').w + ' ' + e.w)} in the attic.`, (e) => `There's ${a(e.w)} by the door if you need one.`],
		food: [(e) => `I had ${a(e.w)} with lunch.`, (e) => `She cut the ${e.w} in half.`, (e) => `There's one ${e.w} left on the plate.`],
		foodMass: [(e) => `There's nothing like fresh ${e.w} in the morning.`, (e) => `Could you pick up some ${e.w} on the way home?`, (e) => `We've run out of ${e.w} again.`],
		place: [(e) => `We spent the whole afternoon ${e.at} the ${e.w}.`, (e) => `The ${e.w} was quiet when we got there.`, (e) => `I hadn't been ${e.at} the ${e.w} in years.`],
		idea: [(e) => `That ${e.w} stayed with me for days.`, (e) => `I keep coming back to that ${e.w}.`],
		ideaMass: [(e) => `${cap(e.w)} is worth more than people think.`, (e) => `A little ${e.w} goes a long way.`],
		act: [(e) => `She ${third(e)} whenever she gets the chance.`, (e) => `We ${past(e)} for most of the afternoon.`, (e) => `I didn't plan to ${e.w} today, but I did.`],
		obj: [(e) => `She ${past(e)} ${e.obj} before lunch.`, (e) => `I'll ${e.w} ${e.obj} tomorrow.`, (e) => `He ${third(e)} ${e.obj} every weekend.`],
		feel: [(e) => `I felt ${e.w} all afternoon.`, (e) => `She seemed ${e.w} when she got home.`, (e) => `Why do I always feel ${e.w} on Sundays?`],
		trait: [(e) => `My neighbor is very ${e.w}.`, (e) => `You have to be ${e.w} to do a job like that.`, (e) => `Everyone says she's ${e.w}.`],
		object: [(e, pick) => `She found ${a(e.w + ' ' + pick('thing').w)} in the attic.`, (e, pick) => `The ${pick('thing').w} was surprisingly ${e.w}.`],
		placeAdj: [(e, pick) => `The ${pick('place').w} was ${e.w} when we got there.`, (e, pick) => {
			const p = pick('place');
			return `It was ${e.w} ${p.at} the ${p.w} that evening.`;
		}],
		manner: [(e) => `She closed the door ${e.w}.`, (e) => `They walked home ${e.w}.`, (e) => `He ${e.w} folded the letter and put it away.`],
		often: [(e) => `I ${e.w} take the long way home.`, (e) => `She ${e.w} forgets her umbrella.`],
	};

	/** Which templates fit an entry, or null if it isn't meant for made-up sentences. */
	function slot(e) {
		if (e.pos === 'noun' && e.kind) {
			if (e.kind === 'food') return e.mass ? 'foodMass' : 'food';
			if (e.kind === 'idea') return e.mass ? 'ideaMass' : 'idea';
			return e.mass ? null : e.kind;
		}
		if (e.pos === 'verb') return e.obj ? 'obj' : e.act ? 'act' : null;
		if (e.pos === 'adjective') return { feel: 'feel', trait: 'trait', object: 'object', place: 'placeAdj' }[e.use] || null;
		if (e.pos === 'adverb') return { manner: 'manner', often: 'often' }[e.use] || null;
		return null;
	}

	const fillers = (kind, rand) => {
		const list = kind === 'object' ? WORDS.filter((e) => e.pos === 'adjective' && e.use === 'object') : WORDS.filter((e) => e.pos === 'noun' && e.kind === kind && !e.mass);
		return list[Math.floor(rand() * list.length)];
	};

	/**
	 * A sentence using `word` (or a random word when none is given). The first sentence for a word is its dictionary
	 * example; `n` > 0 asks for a made-up one. Returns { text, word } or { missing } when the word is unknown.
	 */
	function sentence(word, n = 0, rand = Math.random) {
		let entries;
		if (word) {
			const hits = lookup(word);
			if (!hits) return { missing: clean(word) };
			entries = hits.map((x) => x.e);
		} else entries = WORDS.filter(slot);
		const made = entries.filter(slot);
		if (word && (n === 0 || !made.length)) {
			const e = entries[n % entries.length];
			return { text: e.ex, word: e.w, only: !made.length && n > 0 };
		}
		const e = made[Math.floor(rand() * made.length)];
		const list = TEMPLATES[slot(e)];
		const s = list[Math.floor(rand() * list.length)](e, (kind) => fillers(kind, rand));
		return { text: s, word: e.w };
	}

	Omni.onyxDictionary = { WORDS, lookup, define, related, partOfSpeech, sentence, size: new Set(WORDS.map((e) => e.w)).size };
})();
