// Onyx's mini dictionary: everyday English words with a part of speech, a plain definition, an example, similar and
// opposite words, and enough grammar to look up "ran" or "happier", to make up sentences with a word, and to let Onyx
// read what people tell it ("I have an exam tomorrow"). The tech glossary in onyx-data.js is consulted first.
(function () {
	'use strict';

	/*
	 * One entry per line: word|part of speech|definition|example|similar|opposite|hints. Trailing empty fields may be
	 * left off. Parts of speech: n, v, adj, adv, conj, prep, excl, pron. Hints are separated by ";":
	 *   plural=, past=, ing=        irregular forms (regular ones are worked out)
	 *   forms=, variants=           other spellings (neighbour) and informal forms (heya), comma-separated
	 *   kind=                       for nouns: person, animal, thing, food, place, idea, event, vehicle, body,
	 *                               furniture, nature, media, time
	 *   mass                        a noun with no plural ("bread")
	 *   at=                         the preposition a place takes: at, in, on, by
	 *   rel                         a relationship ("sister"), spoken of as "my sister"
	 *   event=                      what an event calls for: luck (an exam), joy (a birthday), sorry (a funeral),
	 *                               news (a promotion: congratulations)
	 *   obj=, act                   for verbs: what they act on in made-up sentences, or that they need nothing
	 *   use=                        for adjectives: feel, trait, object, place, weather; for adverbs: manner, often
	 *   mood=                       how a feeling or action sits: + good, - bad, -- heavy, 0 neither
	 *   tip=                        a short suggestion Onyx can add when someone says they feel this way
	 *   nogen                       defined, but never used in made-up sentences
	 */
	const DATA = `
# Core words
friend|n|a person you know well and like, who usually isn't family|My friend lent me her umbrella when it started to rain.|companion, pal, buddy|enemy, stranger|kind=person;rel
teacher|n|a person whose job is to help others learn|Our teacher read the last chapter aloud.|instructor, tutor|student|kind=person
doctor|n|a person trained to treat illness and injury|The doctor said I should rest for a few days.|physician||kind=person
neighbor|n|a person who lives next door or nearby|Our neighbor waters the plants when we're away.|||kind=person;forms=neighbour;rel
artist|n|a person who makes art, such as paintings, music or sculpture|The artist painted the harbor at sunrise.|||kind=person
stranger|n|a person you don't know|A stranger helped me carry the boxes upstairs.||friend|kind=person
child|n|a young person who isn't yet an adult|The child counted the stars out loud.|kid|adult|kind=person;plural=children
chef|n|a professional cook, especially the head cook in a restaurant|The chef tasted the sauce and added a pinch of salt.|cook||kind=person
pilot|n|a person who flies an aircraft|The pilot told us we would land early.|||kind=person
farmer|n|a person who grows crops or raises animals|The farmer was up before sunrise.|||kind=person
cat|n|a small, furry animal often kept as a pet, known for purring|The cat slept in a patch of sunlight.|kitty||kind=animal
dog|n|an animal related to the wolf, kept as a pet or for work|The dog waited by the door for its walk.|hound, puppy||kind=animal
bird|n|an animal with feathers, wings and a beak; most kinds can fly|A bird built a nest under the roof.|||kind=animal
horse|n|a large animal with hooves and a mane that people ride or use for work|The horse trotted across the field.|||kind=animal
owl|n|a bird with large eyes that hunts at night|An owl hooted somewhere in the dark.|||kind=animal
fox|n|a wild animal of the dog family with pointed ears and a bushy tail|A fox crossed the road in front of us.|||kind=animal
rabbit|n|a small animal with long ears and soft fur that lives in burrows|The rabbit froze, then darted into the hedge.|bunny||kind=animal
whale|n|a very large sea mammal that breathes air through a blowhole|We watched a whale surface near the boat.|||kind=animal
bee|n|a flying insect that makes honey and carries pollen between flowers|A bee buzzed from one flower to the next.|||kind=animal
book|n|pages of writing or pictures bound together between covers|I couldn't put the book down until the last page.|volume||kind=thing
book|v|to arrange to have something, like a seat, a room or a ticket, ahead of time|We booked a room by the sea.|reserve|cancel|obj=a table for two
chair|n|a seat for one person, with a back and usually four legs|Pull up a chair and join us.
lamp|n|a device that gives light, usually electric|She switched on the lamp beside her bed.|||kind=thing
key|n|a shaped piece of metal that opens a lock; also, a button on a keyboard|I keep a spare key under the flowerpot.|||kind=thing
umbrella|n|a folding cover on a stick that keeps the rain off you|Take an umbrella; it looks like rain.|||kind=thing
clock|n|a device that shows the time|The clock in the hall is five minutes fast.|||kind=thing
bottle|n|a container with a narrow neck, for holding liquids|He filled a bottle with water before the hike.|||kind=thing
letter|n|a written message sent to someone; also, one of the symbols of an alphabet|She wrote a letter to her grandmother.|note, message||kind=thing
phone|n|a device for talking to people far away; today, usually a small computer you carry|My phone buzzed with a new message.|telephone||kind=thing
window|n|an opening in a wall, usually filled with glass, that lets in light and air|Rain tapped against the window all night.
door|n|a panel that opens and closes the way into a room, building or vehicle|Please close the door behind you.
candle|n|a stick of wax with a wick that burns to give light|We lit a candle when the power went out.|||kind=thing
map|n|a drawing of an area that shows where places, roads and features are|We spread the map out on the hood of the car.|||kind=thing
blanket|n|a large, warm cover, used on a bed or wrapped around you|He pulled the blanket up to his chin.|||kind=thing
bicycle|n|a vehicle with two wheels that you ride by pushing pedals|She rides her bicycle to work.|bike||kind=vehicle;forms=bike
kite|n|a light frame covered in cloth or paper that flies in the wind on a long string|The kite climbed higher with every gust.|||kind=thing
camera|n|a device for taking photographs or recording video|He always carries a camera on holiday.|||kind=thing
mirror|n|a sheet of glass with a shiny back that shows a reflection|She checked her hair in the mirror.|||kind=thing
ladder|n|a set of steps between two long sides, used for climbing up and down|Hold the ladder steady while I climb.
hammer|n|a tool with a heavy head on a handle, used for hitting nails|Pass me the hammer and a few nails.|||kind=thing
box|n|a container with flat sides, often with a lid|The box was full of old photographs.|carton, crate||kind=thing
light|n|the brightness that lets you see, from the sun, a fire or a lamp|Open the curtains and let some light in.||dark, darkness
light|adj|not heavy; also, pale in color|The box was light enough to carry with one hand.||heavy, dark|use=object
watch|n|a small clock worn on the wrist|He glanced at his watch and hurried out.|||kind=thing
watch|v|to look at something for a while, paying attention to it|We watched the boats come into the harbor.|observe, view||obj=the sunset
apple|n|a round fruit with red, green or yellow skin and crisp white flesh|She packed an apple for lunch.|||kind=food
sandwich|n|two slices of bread with a filling between them|I made a cheese sandwich for the train.|||kind=food
cake|n|a sweet baked food made from flour, sugar, eggs and butter|We had cake to celebrate her birthday.|||kind=food
bread|n|a food made from flour, water and usually yeast, baked into a loaf|The kitchen smelled of fresh bread.|||kind=food;mass
cheese|n|a food made from milk, often aged to develop its flavor|He grated some cheese over the pasta.|||kind=food;mass
soup|n|a liquid food made by cooking vegetables, meat or fish in water or stock|A bowl of soup is perfect on a cold day.|||kind=food;mass
coffee|n|a hot drink made from roasted, ground coffee beans|I can't think before my first cup of coffee.|||kind=food;mass
tea|n|a drink made by pouring hot water over dried leaves of the tea plant|Would you like a cup of tea?|||kind=food;mass
rice|n|small grains from a cereal plant, cooked in water and eaten as food|We had rice with the curry.|||kind=food;mass
honey|n|a sweet, sticky food that bees make from flower nectar|She stirred a spoonful of honey into her tea.|||kind=food;mass
library|n|a building or room where books are kept for people to read or borrow|I returned my books to the library.|||kind=place;at=at
park|n|a public area of grass and trees in a town, for people to enjoy|We had a picnic in the park.|||kind=place;at=in
kitchen|n|the room where food is prepared and cooked|Everyone ends up in the kitchen at parties.|||kind=place;at=in
beach|n|a strip of sand or pebbles beside the sea or a lake|We walked along the beach at low tide.|shore, seaside||kind=place;at=at
mountain|n|a very high hill, often with steep sides|Snow still covered the top of the mountain.||valley|kind=place;at=on
river|n|a large, natural stream of water flowing to the sea or a lake|The river was high after the storm.|stream||kind=place;at=by
city|n|a large town where many people live and work|The city looks different at night.||village, countryside|kind=place;at=in
village|n|a small group of houses in the countryside, smaller than a town|Everyone in the village came to the fair.|hamlet|city|kind=place;at=in
garden|n|a piece of land by a house where flowers, plants or vegetables are grown|Tomatoes are ripening in the garden.|yard||kind=place;at=in
island|n|a piece of land with water all around it|The ferry to the island leaves at noon.|||kind=place;at=on
market|n|a place where people buy and sell goods, often from stalls|We bought peaches at the market.|bazaar||kind=place;at=at
museum|n|a building where objects of art, history or science are kept and shown|The museum has a whole room of dinosaur bones.|||kind=place;at=at
idea|n|a thought or plan that forms in your mind|Painting the door yellow was her idea.|thought, notion||kind=idea
plan|n|a set of steps decided in advance for doing something|The plan is to leave at seven.|scheme, strategy||kind=idea
dream|n|images and events you experience while asleep; also, something you hope for|Her dream is to sail around the world.|hope, wish||kind=idea
question|n|something you ask to get information or an answer|That's a good question; let me think.|query|answer|kind=idea
memory|n|something you remember from the past; also, the ability to remember|My earliest memory is of my grandfather's garden.|recollection||kind=idea
secret|n|something kept hidden from others|Can you keep a secret?|||kind=idea
story|n|an account of events, real or made up|Tell me the story of how you met.|tale, account||kind=idea;plural=stories
promise|n|a statement that you will certainly do something|He kept his promise and called every week.|vow, pledge||kind=idea
mistake|n|something done wrongly, often without meaning to|Everyone makes a mistake now and then.|error, slip||kind=idea
opinion|n|what you think or believe about something|In my opinion, the book was better than the film.|view, belief|fact|kind=idea
habit|n|something you do regularly, often without thinking|Reading before bed is a good habit.|routine, custom||kind=idea
adventure|n|an exciting or unusual experience, often a bit risky|Getting lost in the old town turned into an adventure.|||kind=idea
journey|n|a trip from one place to another, especially a long one|The journey took three days by train.|trip, voyage||kind=idea
paradox|n|a statement or situation that seems to contradict itself but may still be true|"Less is more" is a paradox that designers love.|||kind=idea
metaphor|n|a figure of speech that calls one thing another to suggest a likeness, like "time is a thief"|The poet used the sea as a metaphor for grief.|||kind=idea
simile|n|a figure of speech that compares two things using "like" or "as", like "as brave as a lion"|"She ran like the wind" is a simile.
idiom|n|a phrase whose meaning isn't clear from its words, like "break a leg" for "good luck"|"Under the weather" is an idiom for feeling ill.|expression, saying||kind=idea
cliche|n|a phrase or idea used so often it has lost its force|"Every cloud has a silver lining" has become a cliche.|platitude||forms=cliché
pun|n|a joke that plays on a word with two meanings or two words that sound alike|Her pun about the baker was so bad it was good.|wordplay||kind=idea
oxymoron|n|a phrase that puts two opposite words together, like "deafening silence"|"Jumbo shrimp" is a well-known oxymoron.
onomatopoeia|n|a word that sounds like what it describes, like "buzz", "sizzle" or "bang"|Comic books are full of onomatopoeia: pow, zap, whoosh.
music|n|sounds arranged in a pleasing or expressive way, sung or played on instruments|Music drifted up from the street below.|||kind=idea;mass
time|n|the ongoing passing of moments, measured in seconds, hours and years|We lost track of time talking.|||kind=idea;mass
love|n|a strong feeling of care and affection for someone or something|They wrote each other letters full of love.|affection, devotion|hate|kind=idea;mass
courage|n|the ability to do something even though it frightens you|It took courage to speak up.|bravery, nerve|fear, cowardice|kind=idea;mass
patience|n|the ability to wait or put up with difficulty without getting upset|Teaching a child to ride a bike takes patience.||impatience|kind=idea;mass
knowledge|n|facts, information and skills you have learned|Her knowledge of birds is remarkable.|understanding, learning|ignorance|kind=idea;mass
freedom|n|the power to act, speak or think as you want|Summer holidays meant freedom.|liberty, independence||kind=idea;mass
friendship|n|the relationship between friends|Their friendship lasted fifty years.|||kind=idea;mass
kindness|n|the quality of being friendly, generous and caring|I won't forget your kindness.|compassion, warmth|cruelty|kind=idea;mass
happiness|n|the feeling of being happy|Small things bring her a lot of happiness.|joy, contentment|sadness|kind=idea;mass
nostalgia|n|a fond, slightly sad longing for the past|The old song filled him with nostalgia.|||kind=idea;mass
serendipity|n|luck in finding good things you weren't looking for|Meeting her on the wrong train was pure serendipity.|chance, luck||kind=idea;mass
empathy|n|the ability to understand and share someone else's feelings|A good nurse needs plenty of empathy.|understanding, compassion||kind=idea;mass
curiosity|n|a strong wish to know or learn something|Curiosity got the better of me, and I opened the box.|||kind=idea;mass
sarcasm|n|saying the opposite of what you mean, to mock or tease|"Oh, great, more rain," she said with obvious sarcasm.|||mass
irony|n|a gap between what is expected and what happens, or between what is said and what is meant|The irony is that the fire station burned down.|||mass
weather|n|the state of the air outside: sun, rain, wind, temperature and so on|The weather turned cold overnight.|||mass
run|v|to move quickly on your feet, faster than walking|She runs by the river before work.|jog, sprint, dash|walk|past=ran;act
run|n|a period of running; also, a point scored in baseball or cricket|I go for a run every morning.
walk|v|to move along on foot at an ordinary pace|We walked home through the park.|stroll, wander|run|act
sleep|v|to rest with your eyes closed and your mind unaware|The baby slept through the night.|doze, nap|wake|past=slept;act
laugh|v|to make the sounds and face that show you find something funny|We laughed until our sides hurt.|chuckle, giggle|cry|act
smile|v|to turn up the corners of your mouth to show you're pleased or friendly|She smiled when she saw the card.|grin, beam|frown|act
swim|v|to move through water using your arms and legs|We swam out to the rocks and back.|||past=swam;act
dance|v|to move your body in time to music|They danced in the kitchen while dinner cooked.|||act
sing|v|to make music with your voice|He sings in the shower every morning.|||past=sang;act
cry|v|to shed tears, usually from sadness or pain; also, to shout|The film made me cry.|weep, sob|laugh|act;mood=-
travel|v|to go from one place to another, especially far away|They travel to a new country every summer.|journey, tour||act
wait|v|to stay where you are until something happens or someone comes|Wait here; I'll be right back.|stay, linger||act
rest|v|to stop working or moving so you can relax or recover|Rest for a minute before you carry on.|relax, pause||act
think|v|to use your mind to consider something or form an opinion|Let me think about it overnight.|consider, ponder||past=thought;act
wander|v|to walk around slowly without a particular aim|We wandered through the old streets all afternoon.|roam, stroll||act
relax|v|to rest and become calm, letting go of worry or tension|Sit down and relax; dinner's nearly ready.|unwind||act
listen|v|to pay attention to sounds or to what someone says|Listen carefully to the instructions.|hear, heed|ignore|act
procrastinate|v|to keep putting off something you should do|I procrastinated all week and wrote the essay in one night.|delay, stall||act
go|v|to move from one place to another|We go to the coast every August.|leave, travel|come, stay|past=went
arrive|v|to reach a place at the end of a journey|The train arrived ten minutes late.|reach, land|leave, depart
read|v|to look at written words and understand them|I read the whole book in one sitting.|||past=read;obj=the letter
write|v|to put words or symbols on paper or a screen|She writes in her journal every night.|||past=wrote;obj=a short note
build|v|to make something by putting parts together|They built a treehouse in the old oak.|construct, assemble|destroy|past=built;obj=a birdhouse
find|v|to discover something, by searching or by chance|I found a coin under the sofa.|discover, locate|lose|past=found;obj=her keys
fix|v|to repair something that is broken|He fixed the leaky tap himself.|repair, mend|break|obj=the bike
paint|v|to cover something with paint, or to make a picture with paint|We painted the bedroom a pale green.|||obj=the fence
open|v|to move something so it is no longer closed|Open the window and let some air in.||close, shut|obj=the window
carry|v|to hold something and take it somewhere|Can you carry the shopping inside?|bring, haul||obj=the boxes
borrow|v|to take something you will give back later|Can I borrow your pen?||lend|obj=a book
share|v|to let someone else have or use part of something|The twins share a bedroom.|||obj=her lunch
learn|v|to gain knowledge or a skill by studying, practice or experience|I'm learning to play the guitar.|study, master|forget|obj=the song
forget|v|to fail to remember something|Don't forget to lock the door.||remember|past=forgot;ing=forgetting;obj=his umbrella;mood=-
remember|v|to keep something in your mind, or bring it back to mind|I remember the day we met.|recall, recollect|forget|obj=the address
teach|v|to help someone learn something|She teaches music at the local school.|instruct, educate|learn|past=taught;obj=the class
buy|v|to get something by paying money for it|We bought a new kettle.|purchase|sell|past=bought;obj=some bread
make|v|to create or prepare something|He made pancakes for breakfast.|create, produce||past=made;obj=a sandwich
bake|v|to cook food in an oven with dry heat|We bake bread every Sunday.|||obj=a cake
cook|v|to prepare food by heating it|Who's cooking tonight?|||obj=dinner
clean|v|to remove dirt from something|We cleaned the house before the guests arrived.|wash, tidy||obj=the kitchen
catch|v|to take hold of something moving through the air; also, to get an illness|She caught the ball with one hand.||drop, throw|past=caught;obj=the ball
throw|v|to send something through the air with a movement of your arm|Throw the stick and the dog will fetch it.|toss, pitch|catch|past=threw;obj=the ball
explain|v|to make something clear by describing it in more detail|Can you explain how this works?|clarify, describe||obj=the rules
choose|v|to decide which of several things you want|Choose any card you like.|pick, select||past=chose;obj=a seat
break|v|to make something separate into pieces or stop working|Careful, you'll break the vase.|smash, shatter|fix, repair|past=broke;obj=a glass;mood=-
describe|v|to say what something or someone is like|Describe the man you saw.|portray, explain||obj=the view
organize|v|to arrange things in order, or to plan an event|She organized the books by color.|arrange, sort||obj=the shelves;forms=organise
ignore|v|to pay no attention to something on purpose|Just ignore the barking; he'll settle down.|disregard|notice|obj=the noise
admire|v|to look at something with pleasure, or to respect someone|I admire how calm she stays under pressure.|respect, appreciate||obj=the view
notice|v|to become aware of something|Did you notice the new sign?|spot, see|ignore, miss|obj=the change
see|v|to notice or take in something with your eyes|I saw a shooting star last night.|spot, notice||past=saw;obj=the comet
hear|v|to take in sounds with your ears|Did you hear that noise?|||past=heard;obj=the thunder
eat|v|to put food in your mouth, chew it and swallow it|We ate dinner on the porch.|||past=ate;obj=an apple
drink|v|to take liquid into your mouth and swallow it|Drink plenty of water when it's hot.|sip||past=drank;obj=a glass of water
help|v|to make it easier for someone to do something|Could you help me move this table?|assist, aid|hinder
imagine|v|to form a picture or idea of something in your mind|Imagine a house made entirely of glass.|picture, envision
happy|adj|feeling or showing pleasure|She was happy to see her old friend.|glad, cheerful, joyful|sad, unhappy|use=feel;mood=+
sad|adj|feeling unhappy or sorry|The ending of the film was sad.|unhappy, down, gloomy|happy, cheerful|use=feel;mood=-
tired|adj|needing rest or sleep|I was tired after the long drive.|sleepy, weary, exhausted|rested, energetic|use=feel;mood=-;tip=Rest when you can, even ten minutes helps.
hungry|adj|wanting or needing food|Swimming always makes me hungry.|starving, peckish|full|use=feel;mood=0;tip=A snack might help.
calm|adj|peaceful and not worried, angry or excited|She stayed calm when the alarm went off.|relaxed, serene|anxious, nervous|use=feel;mood=+
nervous|adj|worried or a little afraid about something that is going to happen|I always get nervous before an exam.|anxious, uneasy|calm, confident|use=feel;mood=-;tip=A few slow breaths can take the edge off.
excited|adj|very happy and eager about something|The kids were excited about the trip.|thrilled, eager|bored|use=feel;mood=+
bored|adj|tired and restless because nothing interests you|I got bored waiting at the airport.||interested, excited|use=feel;mood=-;tip=I can tell a joke or make up a sentence if you like.
curious|adj|wanting to know or learn about something|I'm curious about how it ends.|inquisitive, interested|indifferent|use=feel;mood=+
grateful|adj|feeling thankful for something someone did|I'm grateful for all your help.|thankful, appreciative|ungrateful|use=feel;mood=+
lonely|adj|sad because you are alone or feel no one is close to you|He felt lonely in the new city at first.|isolated||use=feel;mood=-;tip=A message to a friend can help, even a short one.
proud|adj|pleased about something you or someone close to you did|Her parents were proud of her.||ashamed, humble|use=feel;mood=+
confused|adj|unable to understand something or think clearly about it|I was confused by the directions.|puzzled, baffled||use=feel;mood=-
relieved|adj|happy because a worry or difficulty has gone away|We were relieved when the plane landed.|||use=feel;mood=+
kind|adj|friendly, generous and caring toward others|It was kind of you to wait for me.|caring, generous, gentle|cruel, unkind|use=trait
kind|n|a type or sort of something|What kind of music do you like?|type, sort
brave|adj|ready to face danger or difficulty without showing fear|The brave firefighter went back in for the dog.|courageous, bold, fearless|cowardly, timid|use=trait
clever|adj|quick to learn and understand|That was a clever way to solve it.|smart, bright, intelligent|foolish|use=trait
honest|adj|telling the truth and not cheating|Thanks for being honest with me.|truthful, sincere|dishonest|use=trait
patient|adj|able to wait or put up with difficulty without getting upset|Be patient; the bus will come.||impatient|use=trait
generous|adj|happy to give money, time or help to others|It was generous of them to pay for dinner.|giving, kind|mean, selfish|use=trait
polite|adj|behaving in a respectful, considerate way|It's polite to say thank you.|courteous, respectful|rude|use=trait
rude|adj|not polite; showing a lack of respect|It's rude to interrupt.|impolite|polite
wise|adj|having good judgment that comes from experience and knowledge|My grandmother gave me some wise advice.|sensible, shrewd|foolish|use=trait
humble|adj|not proud; not thinking you are better than others|Despite her success, she stayed humble.|modest|arrogant, proud|use=trait
gregarious|adj|fond of company; sociable|He's gregarious and knows everyone in town.|sociable, outgoing|shy, reserved|use=trait
meticulous|adj|very careful about small details|She keeps meticulous notes.|careful, thorough, precise|careless, sloppy|use=trait
pragmatic|adj|dealing with things in a practical, realistic way|We need a pragmatic solution, not a perfect one.|practical, realistic|idealistic|use=trait
candid|adj|honest and direct, even when it's uncomfortable|Thanks for your candid feedback.|frank, blunt, open|guarded|use=trait
eloquent|adj|speaking or writing clearly and persuasively|She gave an eloquent speech at the wedding.|articulate, expressive||use=trait
benevolent|adj|kind and wanting to do good for others|A benevolent stranger paid for our coffee.|kind, charitable|malevolent|use=trait
resilient|adj|able to recover quickly from difficulty|Children are often more resilient than we think.|tough, hardy|fragile|use=trait
big|adj|large in size or amount|That's a big suitcase for a weekend.|large, huge|small, little|use=object
small|adj|little in size or amount|They live in a small flat above a bakery.|little, tiny|big, large|use=object
old|adj|having lived or existed for a long time|The old bridge is made of stone.|ancient, aged|new, young|use=object
new|adj|recently made, bought or started|I need new shoes.|fresh, recent|old
heavy|adj|weighing a lot; hard to lift|This bag is too heavy for me.||light|use=object
tiny|adj|very small|A tiny spider spun a web on the mirror.|minute, little|huge, enormous|use=object
enormous|adj|very large|An enormous wave crashed over the pier.|huge, gigantic, vast|tiny|use=object
beautiful|adj|very pleasing to look at or listen to|What a beautiful view.|lovely, gorgeous|ugly|use=object;mood=+
ancient|adj|very old; from long ago|They found ancient coins in the field.|old, antique|modern|use=object
fragile|adj|easily broken or damaged|Careful, those glasses are fragile.|delicate, breakable|sturdy|use=object
shiny|adj|reflecting light; bright and polished|He bought a shiny red bike.|glossy, gleaming|dull|use=object
soft|adj|not hard or firm; gentle to touch or quiet to hear|The kitten's fur was soft.||hard, loud
quiet|adj|making little or no noise|The library is quiet in the mornings.|silent, hushed|loud, noisy|use=place
bright|adj|full of light; also, clever|The room was bright and warm.|sunny, radiant|dark, dim|use=place
dark|adj|with little or no light|It gets dark early in winter.|dim, gloomy|bright, light|use=place
warm|adj|pleasantly hot, but not very hot|Come inside where it's warm.||cool, cold|use=place
cold|adj|having a low temperature|The water was too cold for swimming.|chilly, freezing|hot, warm|use=place
empty|adj|with nothing or no one inside|The theater was empty after the show.|vacant, bare|full|use=place
crowded|adj|full of people|The train was crowded at rush hour.|packed, busy|empty, deserted|use=place
peaceful|adj|calm and quiet, without trouble|The lake is peaceful at dawn.|tranquil, serene|noisy, chaotic|use=place
noisy|adj|full of or making a lot of noise|The café was too noisy to talk.|loud, rowdy|quiet|use=place
cozy|adj|warm, comfortable and relaxing|We spent the evening in a cozy little pub.|snug, comfortable||use=place;forms=cosy
good|adj|of high quality, pleasant, or right|That was a good idea.|fine, great, excellent|bad, poor|mood=+
bad|adj|of low quality, unpleasant, or wrong|I had a bad night's sleep.|poor, awful|good|mood=-
fast|adj|moving or able to move quickly|She's the fastest runner in the club.|quick, rapid, swift|slow
slow|adj|moving or happening without much speed|The slow train stops at every station.||fast, quick
important|adj|mattering a lot|Sleep is important for your health.|significant, vital|trivial, unimportant
strange|adj|unusual or surprising; hard to explain|I heard a strange noise in the attic.|odd, peculiar, weird|normal, ordinary|mood=0
delicious|adj|tasting or smelling very good|The soup was delicious.|tasty, scrumptious|disgusting|mood=+
obvious|adj|easy to see or understand|The answer seems obvious now.|clear, plain, evident|hidden, subtle
ubiquitous|adj|found everywhere|Smartphones have become ubiquitous.|everywhere, omnipresent, widespread|rare, scarce
ephemeral|adj|lasting a very short time|Fame on the internet is often ephemeral.|fleeting, brief, short-lived|lasting, permanent
ambiguous|adj|having more than one possible meaning|The ending of the story was deliberately ambiguous.|unclear, vague|clear, definite
mundane|adj|ordinary and dull; part of everyday life|Even mundane chores feel better with music on.|ordinary, routine, humdrum|exciting, extraordinary
quintessential|adj|the most typical example of something|Fish and chips by the sea is the quintessential British seaside meal.|typical, classic
ironic|adj|happening in the opposite way to what you'd expect; also, saying the opposite of what you mean|It's ironic that the spelling bee poster had a typo.
quickly|adv|at a fast speed|She quickly packed her bag.|fast, rapidly, swiftly|slowly|use=manner
slowly|adv|at a slow speed; not quickly|The boat slowly drifted to shore.||quickly|use=manner
quietly|adv|making very little noise|He quietly closed the door behind him.|softly, silently|loudly|use=manner
carefully|adv|with attention, to avoid mistakes or damage|Carry the eggs carefully.|cautiously|carelessly|use=manner
gently|adv|in a soft, careful way|She gently lifted the kitten.|softly, tenderly|roughly|use=manner
happily|adv|in a happy way|The children played happily in the snow.|cheerfully, gladly|sadly|use=manner
suddenly|adv|quickly and without warning|Suddenly the lights went out.|abruptly, unexpectedly|gradually|use=manner
patiently|adv|without getting annoyed while waiting or dealing with difficulty|The dog waited patiently by the door.|||use=manner
always|adv|every time; at all times|He always takes the stairs.|forever, constantly|never|use=often
never|adv|at no time|I've never seen snow.||always|use=often
often|adv|many times; frequently|We often eat outside in summer.|frequently, regularly|rarely, seldom|use=often
sometimes|adv|on some occasions, but not always|Sometimes I walk to work.|occasionally||use=often
rarely|adv|not often|It rarely snows here.|seldom, hardly ever|often, frequently|use=often
usually|adv|in most cases; normally|I usually get up at seven.|normally, generally||use=often
however|adv|used to add something that contrasts with what was just said|It was raining. However, we still went for a walk.|but, nevertheless
because|conj|for the reason that|We stayed in because it was raining.|since, as
although|conj|despite the fact that|Although it was late, we kept talking.|though, even though
between|prep|in the space or time separating two things|The café is between the bank and the bakery.
hello|excl|a word used to greet someone or to start a phone call|Hello! It's good to see you.|hi, hey, greetings|goodbye|forms=hullo,hallo
hey|excl|an informal greeting, or a way to get someone's attention|Hey, how's it going?|hi, hello||variants=heya,hiya
goodbye|excl|a word said when leaving or ending a conversation|We said goodbye at the station.|farewell, bye, see you|hello|forms=good-bye;variants=bye
please|adv|a polite word added to a request|Could you pass the salt, please?
thanks|excl|an informal way of saying "thank you"|Thanks for the lift!|thank you, cheers
word|n|a single unit of language that means something and is written with a space on either side|"Onyx" is a short word.
sentence|n|a group of words that expresses a complete thought, starting with a capital letter and ending with a full stop, question mark or exclamation mark|Every sentence needs a verb.
noun|n|a word that names a person, place, thing or idea, like "cat", "city" or "courage"|In "the dog barked", "dog" is a noun.
verb|n|a word for an action, a state or something happening, like "run", "be" or "seem"|In "the dog barked", "barked" is the verb.
adjective|n|a word that describes a noun, like "blue", "tall" or "happy"|In "a red door", "red" is an adjective.
adverb|n|a word that describes a verb, an adjective or another adverb, often ending in "-ly"|In "she sang softly", "softly" is an adverb.
synonym|n|a word that means the same or nearly the same as another, like "big" and "large"|"Happy" is a synonym of "glad".||antonym
antonym|n|a word that means the opposite of another, like "hot" and "cold"|"Up" is the antonym of "down".||synonym
dictionary|n|a book or list of words in alphabetical order, with their meanings|Look it up in the dictionary.

# Feelings
joyful|adj|full of great happiness|The joyful crowd sang all the way home.|happy, elated, cheerful|sad, gloomy|use=feel;mood=+
cheerful|adj|noticeably happy and positive|She's always cheerful in the morning.|bright, sunny, upbeat|gloomy, grumpy|use=feel;mood=+
content|adj|quietly satisfied and at peace with things|He was content to sit and read all afternoon.|satisfied, pleased|dissatisfied|use=feel;mood=+
delighted|adj|very pleased|We were delighted to hear your news.|thrilled, overjoyed|disappointed|use=feel;mood=+
thrilled|adj|extremely pleased and excited|I'm thrilled you could come.|delighted, ecstatic|disappointed|use=feel;mood=+
ecstatic|adj|overwhelmingly happy|She was ecstatic when she passed her driving test.|elated, overjoyed|miserable|use=feel;mood=+
elated|adj|in very high spirits, usually after good news|The team was elated after the win.|ecstatic, jubilant|dejected|use=feel;mood=+
hopeful|adj|feeling that what you want will probably happen|I'm hopeful the weather will clear up.|optimistic, positive|hopeless, pessimistic|use=feel;mood=+
optimistic|adj|expecting good things to happen|She stays optimistic even on bad days.|hopeful, positive|pessimistic|use=feel;mood=+
relaxed|adj|calm and free from worry or tension|I feel relaxed after a long bath.|calm, at ease|tense, stressed|use=feel;mood=+
refreshed|adj|full of energy again after rest, food or drink|I woke up refreshed after a good night's sleep.|revived, rested|tired, drained|use=feel;mood=+
energetic|adj|full of energy and ready to do things|The kids are always energetic after breakfast.|lively, active|tired, sluggish|use=feel;mood=+
motivated|adj|keen to do something and willing to work at it|I feel motivated to finally clean the garage.|driven, eager|unmotivated|use=feel;mood=+
inspired|adj|filled with the urge or ability to do something creative|The trip left her inspired to paint again.|stimulated, moved|uninspired|use=feel;mood=+
confident|adj|sure of yourself and your abilities|He felt confident walking into the exam.|self-assured, sure|insecure, nervous|use=feel;mood=+
loved|adj|cared about deeply by others|The card made her feel loved.|cherished, adored|unloved|use=feel;mood=+
thankful|adj|pleased and relieved about something; grateful|I'm thankful nobody was hurt.|grateful, appreciative|ungrateful|use=feel;mood=+
amused|adj|finding something funny or entertaining|He looked amused by the puppy's antics.|entertained, tickled|bored|use=feel;mood=+
playful|adj|full of fun and wanting to play|The kitten was in a playful mood.|frisky, lively|serious|use=feel;mood=+
safe|adj|protected from danger or harm|We felt safe inside during the storm.|secure, protected|dangerous, unsafe|use=feel;mood=+
satisfied|adj|pleased because you got what you wanted or needed|I'm satisfied with how the cake turned out.|content, pleased|dissatisfied|use=feel;mood=+
accomplished|adj|pleased with yourself for having achieved something; also, highly skilled|I felt accomplished after finishing the marathon.|fulfilled, skilled|useless|use=feel;mood=+
productive|adj|getting a lot done|I had a productive morning and cleared my inbox.|efficient, busy|unproductive|use=feel;mood=+
surprised|adj|feeling sudden wonder at something unexpected|She was surprised to find a letter on the doormat.|astonished, startled|unsurprised|use=feel;mood=0
amazed|adj|very surprised, in a good way|I was amazed at how fast he learned to swim.|astonished, astounded|unimpressed|use=feel;mood=+
impressed|adj|admiring someone or something for being good|We were impressed by her paintings.|struck, moved|unimpressed|use=feel;mood=+
fascinated|adj|deeply interested in something|He's fascinated by old maps.|captivated, enthralled|bored|use=feel;mood=+
nostalgic|adj|fondly longing for the past|Old songs always make me nostalgic.|wistful, sentimental||use=feel;mood=0
sentimental|adj|easily moved by feelings of love, sadness or the past|She gets sentimental at weddings.|nostalgic, emotional||use=feel;mood=0
emotional|adj|feeling strong emotions, or easily moved by them|The goodbye at the airport was emotional.|moved, sentimental|unemotional|use=feel;mood=0
homesick|adj|missing your home and family while away|In her first week at university she felt homesick.|nostalgic||use=feel;mood=-;tip=A call home can help more than you'd expect.
jealous|adj|unhappy because someone has something you want, or worried about losing someone's affection|He was jealous of his brother's new bike.|envious|content|use=feel;mood=-
envious|adj|wanting what someone else has|I'm envious of your garden.|jealous, covetous||use=feel;mood=-
embarrassed|adj|awkward and self-conscious about something you did|I was embarrassed when I tripped on stage.|ashamed, mortified|proud|use=feel;mood=-;tip=Everyone has moments like that, and most people forget them quickly.
ashamed|adj|feeling bad about something wrong or foolish you did|He felt ashamed of how he'd spoken to her.|guilty, embarrassed|proud|use=feel;mood=-
guilty|adj|feeling you have done something wrong|I feel guilty for forgetting her birthday.|ashamed, remorseful|innocent|use=feel;mood=-
frustrated|adj|upset because you can't do or change something|I'm frustrated that the printer keeps jamming.|annoyed, exasperated|satisfied|use=feel;mood=-;tip=Stepping away for five minutes often helps more than pushing on.
annoyed|adj|a little angry|She was annoyed that the bus was late again.|irritated, bothered|pleased|use=feel;mood=-
irritated|adj|annoyed and impatient|He gets irritated when people talk during films.|annoyed, exasperated|calm|use=feel;mood=-
angry|adj|feeling strong displeasure at something|I was angry when I saw the mess.|mad, cross, furious|calm, pleased|use=feel;mood=-;tip=Breathing slowly or a short walk can take some of the heat out.
furious|adj|extremely angry|She was furious about the broken window.|enraged, livid|calm|use=feel;mood=-
mad|adj|angry; also, informally, very silly or unwise|Are you still mad at me?|angry, cross|calm|use=feel;mood=-
upset|adj|unhappy, worried or disappointed|He was upset about losing his wallet.|distressed, troubled|calm, happy|use=feel;mood=-
miserable|adj|very unhappy or uncomfortable|I felt miserable with the flu all week.|wretched, unhappy|happy, cheerful|use=feel;mood=--;nogen
gloomy|adj|sad and without hope; also, dark and dull|The rain put everyone in a gloomy mood.|glum, downcast|cheerful|use=feel;mood=-
depressed|adj|feeling very low and without hope, often for a long time; also a medical condition|He felt depressed after losing his job.|low, despondent|cheerful|use=feel;mood=--;nogen
heartbroken|adj|deeply sad, usually because of a loss or the end of a relationship|She was heartbroken when her dog died.|devastated, crushed|overjoyed|use=feel;mood=--;nogen
devastated|adj|shocked and extremely upset|They were devastated by the news.|crushed, heartbroken|elated|use=feel;mood=--;nogen
disappointed|adj|sad because something wasn't as good as you hoped|I was disappointed the museum was closed.|let down, dissatisfied|satisfied, delighted|use=feel;mood=-
discouraged|adj|having lost confidence or enthusiasm|Don't be discouraged by one bad result.|disheartened, deflated|encouraged|use=feel;mood=-
hopeless|adj|feeling there is no chance things will get better|He felt hopeless after another rejection.|despairing, defeated|hopeful|use=feel;mood=--;nogen
worried|adj|thinking anxiously about problems or what might happen|I'm worried about the exam.|anxious, concerned|calm, relaxed|use=feel;mood=-;tip=Writing the worry down sometimes makes it smaller.
anxious|adj|worried and uneasy about what might happen|She felt anxious before the interview.|nervous, uneasy|calm, relaxed|use=feel;mood=-;tip=A few slow breaths can take the edge off.
scared|adj|afraid|The thunder made the puppy scared.|afraid, frightened|brave, unafraid|use=feel;mood=-
afraid|adj|feeling fear|Don't be afraid to ask questions.|scared, frightened|brave, unafraid|use=feel;mood=-
frightened|adj|afraid, especially suddenly|The frightened cat hid under the bed.|scared, alarmed|calm|use=feel;mood=-
terrified|adj|extremely afraid|I'm terrified of heights.|petrified, horrified|calm|use=feel;mood=-
overwhelmed|adj|having too much to deal with at once|I'm overwhelmed with work this week.|swamped, overloaded||use=feel;mood=-;tip=Pick the one next task and let the rest wait a moment.
stressed|adj|under pressure and worried|She's stressed about moving house.|tense, strained|relaxed|use=feel;mood=-;tip=Pick the one next task and let the rest wait a moment.
exhausted|adj|extremely tired|We were exhausted after the hike.|drained, worn out|energetic, refreshed|use=feel;mood=-;tip=Rest when you can, even ten minutes helps.
sleepy|adj|ready to fall asleep|The warm room made me sleepy.|drowsy, tired|awake, alert|use=feel;mood=0;tip=Maybe an early night is in order.
sick|adj|ill; also, feeling like you might vomit|I stayed home because I was sick.|ill, unwell|healthy, well|use=feel;mood=-;tip=Plenty of fluids and rest, and see a doctor if it gets worse.
ill|adj|not well in body or mind|She's been ill with a cold.|sick, unwell|healthy|use=feel;mood=-;tip=Plenty of fluids and rest, and see a doctor if it gets worse.
unwell|adj|not feeling healthy|He felt unwell after lunch.|ill, sick|well, healthy|use=feel;mood=-;tip=Plenty of fluids and rest, and see a doctor if it gets worse.
sore|adj|painful, often from use or injury|My legs are sore after the run.|aching, tender||use=feel;mood=-;tip=Stretching gently and a warm bath can help.
thirsty|adj|needing something to drink|Gardening in the sun made me thirsty.|parched|quenched|use=feel;mood=0;tip=A glass of water might help.
full|adj|having eaten as much as you want; also, holding as much as possible|I'm too full for dessert.|stuffed, satisfied|hungry, empty|use=feel;mood=0
restless|adj|unable to stay still or relax|I felt restless waiting for the results.|fidgety, uneasy|calm|use=feel;mood=-;tip=A short walk can burn off some of that.
impatient|adj|unwilling to wait|The children grew impatient in the queue.|restless, eager|patient|use=feel;mood=-
shy|adj|nervous or uncomfortable with other people|He was shy at his first day of school.|timid, bashful|confident, outgoing|use=trait
awkward|adj|uncomfortable and embarrassed; also, clumsy|There was an awkward silence after the joke.|uncomfortable, clumsy|comfortable, graceful|use=feel;mood=-
insecure|adj|not confident about yourself|She felt insecure about her accent.|unsure, anxious|confident|use=feel;mood=-
lost|adj|unable to find your way; also, confused about what to do|We got lost in the old town.|stray, confused|found|use=feel;mood=-
stuck|adj|unable to move or make progress|I'm stuck on the last question.|trapped, stalled||use=feel;mood=-;tip=Explaining the problem out loud, even to me, sometimes shakes it loose.
numb|adj|unable to feel anything, in the body or emotionally|My fingers were numb from the cold.|deadened||use=feel;mood=-
shocked|adj|very surprised and upset by something unexpected|We were shocked by the price.|stunned, appalled|unsurprised|use=feel;mood=-
cranky|adj|easily annoyed, often because you're tired or hungry|The baby gets cranky before naps.|grumpy, irritable|cheerful|use=feel;mood=-
grumpy|adj|bad-tempered and sulky|He's grumpy until he's had his coffee.|cranky, grouchy|cheerful|use=feel;mood=-
moody|adj|having moods that change quickly, often bad ones|She's been moody all week.|temperamental|even-tempered|use=feel;mood=-
busy|adj|having a lot to do|I'm busy until Friday.|occupied, swamped|free, idle|use=feel;mood=0
free|adj|not busy; also, costing nothing; also, able to do as you like|Are you free on Saturday?|available, idle|busy|use=feel;mood=+
broke|adj|informal: having no money|I'm broke until payday.|penniless|rich|use=feel;mood=-
lucky|adj|having good things happen by chance|We were lucky to get the last two tickets.|fortunate|unlucky|use=feel;mood=+
unlucky|adj|having bad things happen by chance|He was unlucky to miss the bus by seconds.|unfortunate|lucky|use=feel;mood=-
silly|adj|playful and not serious; also, foolish|We played silly games all evening.|goofy, foolish|serious, sensible|use=feel;mood=+
alone|adj|without other people|She likes to walk alone in the mornings.|solo, by yourself|together|use=feel;mood=0

# People
mother|n|a female parent|My mother taught me to ride a bike.|mom, mum|father|kind=person;rel
mom|n|informal: mother|My mom makes the best pancakes.|mum, mother|dad|kind=person;forms=mum,mommy,mummy;rel
father|n|a male parent|Her father grows tomatoes in the garden.|dad, papa|mother|kind=person;rel
dad|n|informal: father|My dad fell asleep on the sofa again.|father, papa|mom|kind=person;forms=daddy;rel
parent|n|a mother or father|Every parent worries about their kids sometimes.|guardian|child|kind=person;rel
sister|n|a girl or woman who has the same parents as you|My sister lives in another city.|sibling|brother|kind=person;rel
brother|n|a boy or man who has the same parents as you|His brother taught him to play chess.|sibling|sister|kind=person;rel
sibling|n|a brother or sister|I have three siblings.|brother, sister||kind=person;rel
son|n|a person's male child|Their son just started school.||daughter|kind=person;rel
daughter|n|a person's female child|Her daughter wants to be a vet.||son|kind=person;rel
grandmother|n|the mother of your father or mother|My grandmother knits me a scarf every winter.|grandma, granny|grandfather|kind=person;rel
grandma|n|informal: grandmother|We visit grandma every Sunday.|granny, nana|grandpa|kind=person;forms=granny,nana,nan;rel
grandfather|n|the father of your father or mother|My grandfather fixed watches for a living.|grandpa|grandmother|kind=person;rel
grandpa|n|informal: grandfather|Grandpa tells the best stories.|granddad|grandma|kind=person;forms=granddad,grandad;rel
grandparent|n|a grandmother or grandfather|All four grandparents came to the wedding.|||kind=person;rel
grandchild|n|the child of your son or daughter|She has six grandchildren.|||kind=person;plural=grandchildren;rel
aunt|n|the sister of your mother or father, or your uncle's wife|My aunt sends postcards from every trip.||uncle|kind=person;forms=auntie;rel
uncle|n|the brother of your mother or father, or your aunt's husband|My uncle can juggle.||aunt|kind=person;rel
cousin|n|a child of your aunt or uncle|My cousin and I grew up on the same street.|||kind=person;rel
nephew|n|the son of your brother or sister|My nephew turns five next week.||niece|kind=person;rel
niece|n|the daughter of your brother or sister|My niece drew me a picture of a dragon.||nephew|kind=person;rel
wife|n|the woman someone is married to|His wife is a pilot.|spouse, partner|husband|kind=person;plural=wives;rel
husband|n|the man someone is married to|Her husband cooks on weekends.|spouse, partner|wife|kind=person;rel
partner|n|the person you live with or are in a relationship with; also, someone you work or play with|My partner and I adopted a cat.|spouse, companion||kind=person;rel
boyfriend|n|a man or boy someone is in a romantic relationship with|Her boyfriend plays in a band.|partner|girlfriend|kind=person;rel
girlfriend|n|a woman or girl someone is in a romantic relationship with|His girlfriend loves hiking.|partner|boyfriend|kind=person;rel
family|n|a group of people related to each other, especially parents and their children|My whole family came for dinner.|relatives, household||kind=idea;plural=families;nogen
baby|n|a very young child|The baby laughed at the dog.|infant, newborn|adult|kind=person;plural=babies;nogen
toddler|n|a young child who is just learning to walk|The toddler stacked blocks on the rug.|tot||kind=person;nogen
kid|n|informal: a child|The kids played outside until dark.|child, youngster|adult|kind=person
teenager|n|a person aged between thirteen and nineteen|Our neighbor's teenager mows our lawn.|teen, adolescent|adult|kind=person;forms=teen
adult|n|a fully grown person|Tickets are cheaper for children than for adults.|grown-up|child|kind=person
person|n|a human being|She's the kindest person I know.|individual, human||kind=person;plural=people
people|n|more than one person; also, everyone in general|People were queuing outside the bakery.|folk, public||mass
man|n|an adult male human|A man at the station asked for the time.|gentleman|woman|kind=person;plural=men
woman|n|an adult female human|The woman next to me was reading a map.|lady|man|kind=person;plural=women
boy|n|a male child|The boy climbed to the top of the tree.|lad|girl|kind=person
girl|n|a female child|The girl won the spelling contest.|lass|boy|kind=person
boss|n|the person in charge of you at work|My boss let us leave early on Friday.|manager, supervisor|employee|kind=person;rel
coworker|n|a person you work with|A coworker brought cookies to the office.|colleague||kind=person;forms=co-worker;rel
colleague|n|a person you work with, especially in a profession|She asked a colleague for advice.|coworker, associate||kind=person;rel
employee|n|a person paid to work for someone|The shop has five employees.|worker, staff member|employer|kind=person
classmate|n|a person in the same class as you at school|My classmate lent me her notes.|||kind=person;rel
roommate|n|a person you share a room or apartment with|My roommate always forgets to buy milk.|flatmate||kind=person;forms=flatmate;rel
student|n|a person who is studying at a school or university|The student raised her hand.|pupil, learner|teacher|kind=person
nurse|n|a person trained to care for sick or injured people|The nurse took my temperature.|||kind=person
dentist|n|a doctor who looks after teeth|I have to see the dentist on Tuesday.|||kind=person
lawyer|n|a person whose job is to advise people about the law and speak for them in court|She called a lawyer about the contract.|attorney, solicitor||kind=person
engineer|n|a person who designs and builds machines, structures or systems|An engineer inspected the bridge.|||kind=person
scientist|n|a person who studies the natural world through experiments and observation|The scientist looked at the sample under a microscope.|researcher||kind=person
writer|n|a person who writes books, articles or other texts|The writer signed copies of her new novel.|author||kind=person
author|n|the writer of a book or article|Who is the author of this book?|writer||kind=person
musician|n|a person who plays music|A musician played violin in the square.|player, performer||kind=person
singer|n|a person who sings, especially as a job|The singer forgot the words and laughed.|vocalist||kind=person
actor|n|a person who performs in plays, films or TV shows|The actor waved to the crowd.|performer|audience|kind=person;forms=actress
athlete|n|a person who is good at sports, especially one who competes|The athlete trained every morning at six.|sportsperson||kind=person
coach|n|a person who trains a sports team or helps someone improve; also, a long-distance bus|Our coach made us run laps.|trainer, instructor||kind=person;plural=coaches
firefighter|n|a person whose job is to put out fires|A firefighter carried the cat down the ladder.|fireman||kind=person
mechanic|n|a person who repairs engines and machines|The mechanic fixed the brakes on my car.|||kind=person
plumber|n|a person who fits and repairs water pipes|The plumber stopped the leak in an hour.|||kind=person
baker|n|a person who makes and sells bread and cakes|The baker starts work at four in the morning.|||kind=person
waiter|n|a person who serves food and drinks in a restaurant|The waiter brought us extra bread.|server|customer|kind=person;forms=waitress
cashier|n|a person who takes payments in a shop or bank|The cashier gave me the wrong change.|||kind=person
driver|n|a person who drives a vehicle|The bus driver waited for us.|chauffeur|passenger|kind=person
passenger|n|a person traveling in a vehicle who isn't driving it|The passenger fell asleep on the train.|traveler, rider|driver|kind=person
programmer|n|a person who writes computer programs|The programmer fixed the bug before lunch.|developer, coder||kind=person
designer|n|a person who plans how something will look or work|The designer chose a bright blue for the logo.|||kind=person
manager|n|a person in charge of a team, shop or business|The manager apologized for the delay.|boss, supervisor||kind=person
customer|n|a person who buys things from a shop or business|The customer asked for a receipt.|client, shopper|seller|kind=person
guest|n|a person who is invited to visit or stay|Our guests arrived just as dinner was ready.|visitor|host|kind=person
host|n|a person who invites and looks after guests|The host showed us to our seats.||guest|kind=person
visitor|n|a person who comes to see a person or place|The museum had thousands of visitors.|guest, tourist||kind=person
tourist|n|a person traveling for pleasure|A tourist asked me to take her photo.|traveler, sightseer|local|kind=person
hero|n|a person admired for bravery or great deeds|The lifeguard was the hero of the day.|champion|villain|kind=person;plural=heroes;nogen
king|n|a male ruler of a country, usually by birth|The king lived in a castle by the sea.|monarch|queen|kind=person;nogen
queen|n|a female ruler of a country, or the wife of a king|The queen waved from the balcony.|monarch|king|kind=person;nogen
everyone|pron|every person|Everyone laughed at the joke.|everybody|nobody
someone|pron|a person, without saying who|Someone left an umbrella at the door.|somebody|no one
nobody|pron|no person|Nobody knew the answer.|no one|everyone

# Animals
puppy|n|a young dog|The puppy chewed my shoelaces.|pup||kind=animal;plural=puppies
kitten|n|a young cat|The kitten fell asleep in a shoebox.|kitty||kind=animal
mouse|n|a small animal with a long tail and a pointed nose; also, the device you move to point on a computer screen|A mouse ran across the kitchen floor.|||kind=animal;plural=mice
rat|n|an animal like a large mouse|A rat scurried along the riverbank.|||kind=animal
hamster|n|a small furry animal often kept as a pet, with pouches in its cheeks|Our hamster runs on its wheel all night.|||kind=animal
parrot|n|a brightly colored bird with a curved beak that can copy sounds|The parrot said hello to everyone who came in.|||kind=animal
chicken|n|a bird kept for its eggs and meat; also, its meat|The chickens followed us around the farm.|hen||kind=animal
duck|n|a water bird with a flat beak and webbed feet|A duck swam across the pond with her ducklings.|||kind=animal
goose|n|a large water bird with a long neck|A goose honked at us from the riverbank.|||kind=animal;plural=geese
swan|n|a large, usually white water bird with a long, curved neck|A swan glided across the lake.|||kind=animal
pigeon|n|a gray bird common in towns and cities|A pigeon pecked at crumbs on the platform.|dove||kind=animal
crow|n|a large black bird with a harsh call|A crow watched us from the fence.|raven||kind=animal
eagle|n|a large bird of prey with sharp eyes|An eagle circled high above the valley.|||kind=animal
penguin|n|a black-and-white sea bird that can't fly but swims well|The penguin slid across the ice on its belly.|||kind=animal
cow|n|a large farm animal kept for milk or meat|The cows lay down in the field before the rain.|cattle||kind=animal
pig|n|a farm animal with a flat snout and a curly tail|The pig rolled happily in the mud.|hog, swine||kind=animal
sheep|n|a farm animal with a thick woolly coat|The sheep huddled together in the cold.|lamb, ewe||kind=animal;plural=sheep
lamb|n|a young sheep; also, its meat|A lamb wobbled after its mother.|||kind=animal
goat|n|an animal with horns and a beard, kept for milk or wool|The goat tried to eat my map.|||kind=animal
donkey|n|an animal like a small horse with long ears|The donkey refused to move.|||kind=animal
deer|n|a fast, graceful animal; the males often have antlers|A deer stood at the edge of the woods.|||kind=animal;plural=deer
bear|n|a large, heavy animal with thick fur and sharp claws|A bear was fishing in the river.|||kind=animal
wolf|n|a wild animal of the dog family that lives and hunts in packs|We heard a wolf howl in the distance.|||kind=animal;plural=wolves
lion|n|a large wild cat with a golden coat; the male has a mane|The lion yawned in the shade.|||kind=animal
tiger|n|a large wild cat with an orange coat and black stripes|The tiger paced along the fence.|||kind=animal
elephant|n|a huge gray animal with a long trunk and large ears|The elephant sprayed water over its back.|||kind=animal
giraffe|n|a very tall African animal with a long neck and spotted coat|The giraffe ate leaves from the top of the tree.|||kind=animal
zebra|n|an African animal like a horse, with black and white stripes|A zebra grazed beside the giraffes.|||kind=animal
monkey|n|a lively animal with long arms and usually a tail, that lives in trees|A monkey stole my sunglasses.|ape||kind=animal
gorilla|n|the largest ape, strong and mostly gentle|The gorilla watched us calmly.|ape||kind=animal
kangaroo|n|an Australian animal that hops on strong back legs and carries its young in a pouch|A kangaroo bounded across the road.|||kind=animal
koala|n|an Australian animal like a small bear that lives in eucalyptus trees|The koala slept in the fork of a tree.|||kind=animal
panda|n|a large black-and-white bear from China that eats bamboo|The panda chewed bamboo all morning.|||kind=animal
squirrel|n|a small animal with a bushy tail that lives in trees|A squirrel buried nuts in the lawn.|||kind=animal
hedgehog|n|a small animal covered in spines that rolls into a ball for protection|A hedgehog snuffled through the leaves.|||kind=animal
bat|n|a small flying animal that is active at night; also, a stick for hitting a ball|Bats flew out of the cave at dusk.|||kind=animal
frog|n|a small animal with smooth skin and long back legs for jumping, living near water|A frog jumped into the pond.|toad||kind=animal
turtle|n|a reptile with a hard shell that lives in water or on land|The turtle pulled its head into its shell.|tortoise||kind=animal;forms=tortoise
snake|n|a long reptile with no legs|A snake slid under the rock.|serpent||kind=animal
lizard|n|a small reptile with four legs and a long tail|A lizard warmed itself on the wall.|||kind=animal
crocodile|n|a large reptile with a long body and powerful jaws that lives in rivers|The crocodile lay perfectly still in the mud.|alligator||kind=animal;forms=alligator
shark|n|a large fish with sharp teeth|A shark's fin cut through the water.|||kind=animal
dolphin|n|a clever sea mammal with a curved fin, known for being playful|A dolphin leapt beside the boat.|porpoise||kind=animal
octopus|n|a sea animal with a soft body and eight arms|The octopus changed color to match the rock.|||kind=animal;plural=octopuses
crab|n|a sea animal with a hard shell and claws that walks sideways|A crab scuttled into a rock pool.|||kind=animal
fish|n|an animal that lives in water and breathes through gills; also, its meat|We watched the fish swim under the bridge.|||kind=animal;plural=fish
goldfish|n|a small orange fish often kept as a pet|Our goldfish is called Captain.|||kind=animal;plural=goldfish
butterfly|n|an insect with large colorful wings|A butterfly landed on my hand.|moth||kind=animal;plural=butterflies
ant|n|a small insect that lives in large groups|An ant carried a crumb twice its size.|||kind=animal
spider|n|a small creature with eight legs that spins webs|A spider spun a web across the doorway.|||kind=animal
fly|n|a small flying insect|A fly buzzed against the window.|||kind=animal;plural=flies
mosquito|n|a small flying insect that bites and sucks blood|A mosquito kept me awake all night.|||kind=animal;plural=mosquitoes
ladybug|n|a small round beetle, usually red with black spots|A ladybug crawled along the leaf.|ladybird||kind=animal;forms=ladybird
snail|n|a small soft animal with a spiral shell that moves slowly|A snail left a silver trail on the path.|slug||kind=animal
worm|n|a long, thin, soft animal with no legs that lives in soil|The bird pulled a worm out of the lawn.|||kind=animal
dinosaur|n|a reptile that lived millions of years ago, some of them enormous|The museum has the skeleton of a dinosaur.|||kind=animal;nogen
pet|n|an animal kept at home for company|Do you have any pets?|companion||kind=animal;nogen
animal|n|a living creature that can move and feel, like a dog, bird or fish|Which animal is your favorite?|creature, beast||kind=animal;nogen

# Food and drink
pizza|n|a flat round bread baked with toppings such as tomato and cheese|We ordered a pizza and watched a film.|||kind=food
pasta|n|an Italian food made from flour and water, shaped into noodles, tubes or other forms|She cooked pasta with garlic and olive oil.|noodles||kind=food;mass
spaghetti|n|pasta in long, thin strings|The kids slurped their spaghetti.|pasta||kind=food;mass
noodle|n|a long, thin strip of pasta or dough, usually boiled|He ate a big bowl of noodles.|||kind=food
burger|n|a flat cake of minced meat or vegetables, served in a bun|I'll have a burger with extra pickles.|hamburger||kind=food;forms=hamburger,cheeseburger
taco|n|a folded tortilla filled with meat, beans or vegetables|We had fish tacos at the beach.|||kind=food
burrito|n|a tortilla wrapped around a filling such as beans, rice and meat|The burrito was bigger than my hand.|||kind=food
sushi|n|a Japanese food of cold rice with raw fish, vegetables or egg|We had sushi for her birthday.|||kind=food;mass
salad|n|a dish of mixed raw vegetables or other cold foods|I had a salad with lunch.|||kind=food
steak|n|a thick slice of meat, especially beef|He grilled a steak for dinner.|||kind=food
egg|n|an oval object laid by a bird, used as food|I had a boiled egg for breakfast.|||kind=food
bacon|n|salted or smoked meat from a pig, usually sliced thin|The smell of bacon woke everyone up.|||kind=food;mass
sausage|n|minced meat with spices, packed into a long thin skin|We cooked sausages on the barbecue.|||kind=food
toast|n|bread browned by heat|I had toast with jam.|||kind=food;mass
cereal|n|a breakfast food made from grain, eaten with milk; also, a grain crop|She poured a bowl of cereal.|||kind=food;mass
oatmeal|n|a warm breakfast of oats cooked in water or milk|A bowl of oatmeal keeps me going until lunch.|porridge||kind=food;mass;forms=porridge
pancake|n|a thin, flat cake fried in a pan|We stacked the pancakes and poured syrup on top.|crepe||kind=food
waffle|n|a crisp batter cake with a grid pattern|She topped her waffle with strawberries.|||kind=food
muffin|n|a small, soft, sweet cake, often with fruit|I grabbed a blueberry muffin on the way.|cupcake||kind=food
cookie|n|a small, flat, sweet baked treat|The cookies were still warm from the oven.|biscuit||kind=food;forms=biscuit
brownie|n|a small square of rich chocolate cake|She brought brownies to the party.|||kind=food
pie|n|a baked dish of fruit, meat or vegetables in pastry|Grandma's apple pie is famous.|tart||kind=food
cupcake|n|a small cake baked in a paper cup, often with icing|We decorated cupcakes for the bake sale.|||kind=food
donut|n|a small fried cake, often ring-shaped|He bought a box of donuts for the office.|||kind=food;forms=doughnut
bagel|n|a dense ring-shaped bread roll|I had a bagel with cream cheese.|||kind=food
croissant|n|a flaky, crescent-shaped pastry|We had coffee and a croissant at the café.|||kind=food
ice cream|n|a sweet frozen food made from milk or cream|We ate ice cream on the pier.|gelato||kind=food;mass
chocolate|n|a sweet brown food made from roasted cocoa beans|He hid the chocolate at the back of the cupboard.|cocoa||kind=food;mass
candy|n|sweet food made with sugar|The kids traded candy after trick-or-treating.|sweets||kind=food;mass
popcorn|n|corn kernels heated until they burst into light, fluffy pieces|We shared a bucket of popcorn at the cinema.|||kind=food;mass
chips|n|thin slices of fried potato; in British English, thick fried potato strips|We ate chips at the picnic.|crisps, fries||kind=food;mass
fries|n|long thin pieces of fried potato|I'll have fries with that.|chips||kind=food;mass
potato|n|a round root vegetable with brown or red skin|She mashed the potatoes with butter.|||kind=food;plural=potatoes
tomato|n|a soft red fruit eaten as a vegetable|He sliced a tomato for the sandwich.|||kind=food;plural=tomatoes
carrot|n|a long orange root vegetable|The rabbit nibbled a carrot.|||kind=food
onion|n|a round vegetable with a strong smell and taste, in layers|Chopping onions always makes me cry.|||kind=food
garlic|n|a plant bulb with a strong taste, used in cooking|The kitchen smelled of garlic.|||kind=food;mass
lettuce|n|a leafy green vegetable used in salads|Wash the lettuce before you use it.|||kind=food;mass
broccoli|n|a green vegetable with a thick stem and tight flower heads|He finally admitted he likes broccoli.|||kind=food;mass
spinach|n|a vegetable with dark green leaves|She stirred spinach into the soup.|||kind=food;mass
corn|n|a tall plant with yellow seeds that grow on a cob; also, the seeds|We grilled corn at the barbecue.|maize||kind=food;mass
bean|n|a seed or pod of certain plants, eaten as a vegetable|We had beans on toast.|||kind=food;nogen
mushroom|n|a fungus with a stem and a cap, some kinds eaten as food|She fried mushrooms in butter.|||kind=food
cucumber|n|a long green vegetable with watery flesh|I put slices of cucumber in my water.|||kind=food
pepper|n|a hollow vegetable, red, green or yellow; also, a hot spice|Add a pinch of black pepper.|||kind=food
banana|n|a long curved fruit with yellow skin|I always have a banana before I run.|||kind=food
orange|n|a round citrus fruit with a thick orange skin|She peeled an orange for each of us.|||kind=food
orange|adj|having the color of an orange, between red and yellow|The sky turned orange at sunset.|||use=object
grape|n|a small round fruit, green or purple, that grows in bunches|We ate grapes in the shade.|||kind=food
strawberry|n|a soft red fruit with tiny seeds on its surface|We picked strawberries at the farm.|||kind=food;plural=strawberries
blueberry|n|a small round dark-blue berry|She added blueberries to her cereal.|||kind=food;plural=blueberries
cherry|n|a small round red fruit with a stone inside|The cherry tree is covered in blossom.|||kind=food;plural=cherries
lemon|n|a sour yellow citrus fruit|Squeeze some lemon over the fish.|||kind=food
lime|n|a small green citrus fruit with a sour taste|Add a slice of lime to the drink.|||kind=food
peach|n|a soft round fruit with fuzzy skin and a large stone|The peach was so ripe the juice ran down my arm.|||kind=food
pear|n|a sweet fruit, narrow at the top and wider at the bottom|He packed a pear in his lunch box.|||kind=food
pineapple|n|a large tropical fruit with rough skin and sweet yellow flesh|We grilled slices of pineapple.|||kind=food
watermelon|n|a large fruit with green skin and juicy red flesh|We cut a watermelon on the hottest day of the year.|||kind=food
mango|n|a sweet tropical fruit with orange flesh and a large flat stone|The mango was perfectly ripe.|||kind=food;plural=mangoes
avocado|n|a pear-shaped fruit with dark skin and soft green flesh|She mashed an avocado onto her toast.|||kind=food
coconut|n|a large nut with a hard hairy shell, white flesh and watery juice|We drank from a coconut on the beach.|||kind=food
nut|n|a dry fruit with a hard shell and an edible kernel|Squirrels bury nuts for the winter.|||kind=food;nogen
peanut|n|a nut that grows underground in a thin shell|The elephant took a peanut with its trunk.|groundnut||kind=food;nogen
butter|n|a soft yellow food made from cream, spread on bread or used in cooking|Spread some butter on the toast.|||kind=food;mass
milk|n|the white liquid made by cows, goats and other mammals, used as a drink|We're out of milk again.|||kind=food;mass
yogurt|n|a thick, slightly sour food made from milk|I had yogurt with honey.|||kind=food;mass;forms=yoghurt
juice|n|the liquid from fruit or vegetables|Would you like some orange juice?|||kind=food;mass
water|n|the clear liquid that falls as rain and fills rivers and seas|Drink plenty of water.|||kind=food;mass
soda|n|a sweet fizzy drink|He ordered a soda with his burger.|pop, soft drink||kind=food;mass
lemonade|n|a sweet drink made from lemons, sugar and water|We sold lemonade on the corner.|||kind=food;mass
smoothie|n|a thick drink of blended fruit, often with milk or yogurt|I made a banana smoothie for breakfast.|shake||kind=food
salt|n|a white substance used to flavor and preserve food|Could you pass the salt?|||kind=food;mass
sugar|n|a sweet substance from plants, used in food and drinks|Do you take sugar in your tea?|||kind=food;mass
flour|n|a powder made from ground grain, used for baking|Sift the flour into the bowl.|||kind=food;mass
jam|n|a sweet spread of fruit boiled with sugar; also, a traffic jam|She makes jam from the plums in her garden.|jelly, preserve||kind=food;mass
sauce|n|a thick liquid served with food to add flavor|The pasta sauce simmered for an hour.|gravy, dressing||kind=food
curry|n|a dish of meat or vegetables cooked in a spicy sauce|We made a big pot of curry.|||kind=food;mass
dumpling|n|a small ball of dough, often filled and boiled or steamed|We folded dumplings for the new year.|||kind=food
snack|n|a small amount of food eaten between meals|I need a snack before the meeting.|bite, nibble||kind=food;nogen
meal|n|an occasion when food is eaten, or the food itself|Breakfast is my favorite meal.|dish, repast||kind=food;nogen
breakfast|n|the first meal of the day|We had breakfast on the balcony.|||kind=food;mass
lunch|n|a meal eaten in the middle of the day|Let's have lunch by the river.|||kind=food;mass
dinner|n|the main meal of the day, usually eaten in the evening|What's for dinner?|supper||kind=food;mass;forms=supper
dessert|n|sweet food eaten at the end of a meal|We had cake for dessert.|pudding, sweet||kind=food;mass
food|n|what people and animals eat|The food at the festival was amazing.|nourishment, grub||kind=food;mass
fruit|n|the sweet, fleshy part of a plant that contains seeds, eaten as food|Have some fruit after lunch.|||kind=food;mass
vegetable|n|a plant or part of one eaten as food, like a carrot or a pea|Eat your vegetables.|veg||kind=food;nogen
meat|n|the flesh of an animal, eaten as food|They don't eat meat.|||kind=food;mass
recipe|n|a set of instructions for making a dish|This is my grandmother's recipe for bread.|||kind=thing
spicy|adj|strongly flavored with spices that taste hot|The curry was too spicy for me.|hot, fiery|mild
sweet|adj|tasting of sugar; also, kind and pleasant|This tea is too sweet.|sugary|sour, bitter
sour|adj|having a sharp taste like lemon|The lemonade was very sour.|tart, sharp|sweet
bitter|adj|having a strong, sharp taste that isn't sweet, like dark coffee|Black coffee is too bitter for me.|sharp|sweet
salty|adj|tasting of salt|The soup was a little salty.|briny
crunchy|adj|firm and making a noise when you bite it|I like my toast crunchy.|crisp|soft, soggy
juicy|adj|full of juice|The peaches were sweet and juicy.|succulent|dry
tasty|adj|having a pleasant flavor|That was a tasty lunch.|delicious, flavorful|bland|mood=+
fresh|adj|recently made, picked or prepared; also, cool and clean|We bought fresh bread from the bakery.|new, crisp|stale
stale|adj|no longer fresh, especially dry and hard|The bread had gone stale.||fresh

# Things and vehicles
pen|n|a tool for writing or drawing with ink|Can I borrow a pen?|||kind=thing
pencil|n|a thin stick of wood with graphite inside, for writing or drawing|She sharpened her pencil before the test.|||kind=thing
paper|n|thin sheets made from wood pulp, for writing, printing or wrapping|I need a piece of paper.|||kind=thing;mass
notebook|n|a book of blank pages for writing notes|He jots ideas in a small notebook.|journal, notepad||kind=thing
bag|n|a soft container with an opening at the top, for carrying things|She packed her bag the night before.|sack||kind=thing
backpack|n|a bag carried on your back with straps over the shoulders|He stuffed a sweater into his backpack.|rucksack||kind=thing;forms=rucksack
wallet|n|a small flat case for money and cards|I left my wallet at home.|purse||kind=thing
purse|n|a small bag for money; in American English, a handbag|She found a coin at the bottom of her purse.|wallet, handbag||kind=thing
coin|n|a small flat piece of metal used as money|He flipped a coin to decide.|||kind=thing
money|n|coins and paper notes used to buy things|I'm saving money for a new bike.|cash, funds||kind=thing;mass
ticket|n|a piece of paper or digital pass that lets you travel or enter somewhere|I bought two tickets for the concert.|pass||kind=thing
card|n|a piece of stiff paper with a message or picture; also, a playing card or bank card|She sent me a card for my birthday.|||kind=thing
gift|n|something given without asking for payment|Thanks for the lovely gift.|present||kind=thing
present|n|a gift; also, the time happening now|I wrapped her present in blue paper.|gift||kind=thing
toy|n|an object for children to play with|The puppy stole the baby's toy.|plaything||kind=thing
ball|n|a round object used in games; also, a formal dance|Throw the ball for the dog.|||kind=thing
doll|n|a toy shaped like a small person|She dressed her doll in a tiny raincoat.|||kind=thing
puzzle|n|a game or problem that tests your thinking; also, a jigsaw|We finished the thousand-piece puzzle at last.|riddle, jigsaw||kind=thing
game|n|an activity played for fun, usually with rules|Let's play a board game.|pastime||kind=thing
guitar|n|a musical instrument with strings that you pluck or strum|He played guitar by the fire.|||kind=thing
piano|n|a large musical instrument played by pressing keys|She practices the piano every evening.|keyboard||kind=thing
drum|n|a musical instrument you hit with sticks or hands|The drums were too loud.|||kind=thing
violin|n|a small string instrument played with a bow|She plays violin in an orchestra.|fiddle||kind=thing
headphones|n|a device worn over the ears for listening privately|I can't find my headphones.|earphones||kind=thing;mass
laptop|n|a small computer that folds open and can be carried|My laptop battery is almost empty.|notebook||kind=thing
computer|n|an electronic machine that stores and processes information|The computer needs an update.|PC||kind=thing
tablet|n|a flat, handheld computer with a touch screen; also, a pill|She reads books on her tablet.|||kind=thing
screen|n|the flat surface on a device where pictures and text appear|The screen is cracked.|display, monitor||kind=thing
television|n|a device that shows programs and films|They watched the news on television.|TV, telly||forms=tv,telly;kind=furniture
radio|n|a device for listening to broadcast programs and music|We listened to the radio in the car.|||kind=thing
battery|n|a device that stores electricity to power things|The remote needs a new battery.|cell||kind=thing;plural=batteries
charger|n|a device for refilling a battery with electricity|Have you seen my phone charger?|||kind=thing
plate|n|a flat dish for serving or eating food from|He stacked the plates by the sink.|dish||kind=thing
bowl|n|a deep round dish for food like soup or cereal|She filled a bowl with cherries.|dish||kind=thing
cup|n|a small container with a handle, for drinking|Would you like a cup of tea?|mug||kind=thing
mug|n|a large cup with straight sides and a handle|He drinks coffee from a giant mug.|cup||kind=thing
glass|n|a hard clear material; also, a drinking container made of it|She poured a glass of water.|tumbler||kind=thing;plural=glasses
spoon|n|a tool with a small bowl on a handle, for eating or stirring|Stir it with a wooden spoon.|||kind=thing
fork|n|a tool with prongs, for picking up food|I dropped my fork on the floor.|||kind=thing
knife|n|a tool with a sharp blade for cutting|Use the bread knife.|blade||kind=thing;plural=knives
pan|n|a metal container for cooking, usually shallow with a handle|Heat the oil in a pan.|skillet, frying pan||kind=thing
pot|n|a deep round container for cooking; also, a container for plants|A pot of soup bubbled on the stove.|saucepan||kind=thing
kettle|n|a container for boiling water|Put the kettle on.|||kind=thing
oven|n|an enclosed space for baking or roasting food|The cake is in the oven.|stove||kind=furniture
fridge|n|a cold cupboard for keeping food fresh|There's juice in the fridge.|refrigerator||forms=refrigerator;kind=furniture
towel|n|a piece of thick cloth for drying yourself|She wrapped her hair in a towel.|||kind=thing
soap|n|a substance used with water for washing|Wash your hands with soap.|||kind=thing;mass
toothbrush|n|a small brush for cleaning your teeth|I forgot my toothbrush.|||kind=thing;plural=toothbrushes
pillow|n|a soft cushion for your head in bed|He fluffed up his pillow.|cushion||kind=thing
bed|n|a piece of furniture for sleeping on|I'm going to bed early tonight.|||kind=furniture
sofa|n|a long, soft seat for two or more people|The dog sleeps on the sofa.|couch, settee||forms=couch;kind=furniture
table|n|a piece of furniture with a flat top and legs|Dinner's on the table.|||kind=furniture
desk|n|a table for working or studying at|Her desk is covered in sticky notes.|||kind=furniture
shelf|n|a flat board fixed to a wall or in a cupboard, for holding things|Put the books back on the shelf.|ledge||plural=shelves;kind=furniture
drawer|n|a box-shaped part of furniture that slides in and out|The spoons are in the top drawer.|||kind=furniture
curtain|n|a piece of cloth that hangs over a window|Open the curtains, it's sunny.|drape||kind=furniture
rug|n|a small carpet|The cat sleeps on the rug by the fire.|mat, carpet||kind=furniture
plant|n|a living thing that grows in soil, like a tree, flower or grass|She waters her plants every morning.|||kind=thing
flower|n|the colorful part of a plant that produces seeds|He picked a flower for his mother.|bloom, blossom||kind=thing
tree|n|a tall plant with a wooden trunk and branches|We sat under a tree to eat lunch.|||kind=nature
leaf|n|one of the flat green parts that grow from a plant's stem|A leaf drifted into my coffee.|||kind=thing;plural=leaves
rock|n|a large piece of stone; also, a style of loud music|We sat on a rock by the stream.|stone, boulder||kind=nature
stone|n|a small piece of rock; also, the hard seed in some fruit|He skipped a stone across the lake.|pebble, rock||kind=thing
shell|n|the hard outer covering of an egg, nut or sea creature|She collected shells on the beach.|||kind=thing
feather|n|one of the light, soft parts that cover a bird's body|A feather floated down from the tree.|plume||kind=thing
rope|n|thick, strong cord made of twisted strands|Tie the boat with a rope.|cord||kind=thing
scissors|n|a cutting tool with two blades joined in the middle|Pass me the scissors, please.|||kind=thing;mass
glue|n|a sticky substance for joining things together|The glue hasn't dried yet.|adhesive, paste||kind=thing;mass
brush|n|a tool with bristles, for painting, cleaning or tidying hair|She dipped the brush in blue paint.|||kind=thing;plural=brushes
picture|n|a painting, drawing or photograph|There's a picture of a lighthouse on the wall.|image||kind=thing
photo|n|a photograph: a picture taken with a camera|We took a photo by the fountain.|photograph, snapshot||kind=thing;forms=photograph
painting|n|a picture made with paint|The painting shows a boat at dawn.|artwork||kind=thing
poster|n|a large printed picture or notice put up on a wall|He hung a poster of the moon above his bed.|||kind=thing
sign|n|a board with words or symbols that gives information|The sign said the shop was closed.|notice||kind=thing
flag|n|a piece of cloth with a pattern that stands for a country or group|The flag flapped in the wind.|banner||kind=thing
hat|n|something worn on the head|Wear a hat, it's sunny.|cap||kind=thing
cap|n|a soft hat with a peak at the front; also, a lid|He wore his cap backwards.|hat||kind=thing
scarf|n|a strip of cloth worn around the neck|She wrapped a scarf around her neck.|||kind=thing;plural=scarves
glove|n|a covering for the hand with a part for each finger|I lost a glove on the bus.|mitten||kind=thing
coat|n|a long piece of clothing worn over others to keep warm|Hang your coat by the door.|jacket, overcoat||kind=thing
jacket|n|a short coat|Bring a jacket in case it gets cold.|coat||kind=thing
sweater|n|a warm knitted top with long sleeves|Grandma knitted me a sweater.|jumper, pullover||kind=thing;forms=jumper
shirt|n|a piece of clothing for the upper body, usually with a collar and buttons|He ironed his shirt for the interview.|blouse, top||kind=thing
dress|n|a piece of clothing for women and girls that covers the body and part of the legs|She wore a green dress to the wedding.|gown, frock||kind=thing;plural=dresses
jeans|n|trousers made of denim|He wears jeans almost every day.|denims||kind=thing;mass
shoe|n|a covering for the foot, usually with a stiff sole|I need new running shoes.|||kind=thing
boot|n|a strong shoe that covers the ankle and sometimes the leg|Wear your boots, it's muddy.|||kind=thing
sock|n|a soft covering for the foot, worn inside a shoe|I can never find a matching sock.|||kind=thing
clothes|n|things you wear, like shirts, trousers and dresses|I packed enough clothes for a week.|clothing, outfit||kind=thing;mass
ring|n|a small circle of metal worn on a finger; also, the sound of a bell|She wore her grandmother's ring.|band||kind=thing
necklace|n|a piece of jewelry worn around the neck|He gave her a silver necklace.|pendant, chain||kind=thing
glasses|n|two lenses in a frame, worn to help you see|I can't read without my glasses.|spectacles||kind=thing;mass
tent|n|a shelter of cloth held up by poles, used for camping|We put the tent up before dark.|||kind=thing
flashlight|n|a small electric light you carry in your hand|Bring a flashlight for the walk home.|torch||kind=thing;forms=torch
basket|n|a container woven from thin strips, often with a handle|She filled the basket with apples.|||kind=thing
bucket|n|an open container with a handle, for carrying water or sand|The kids built castles with a bucket and spade.|pail||kind=thing
broom|n|a brush on a long handle for sweeping floors|Sweep up the leaves with the broom.|||kind=thing
gift card|n|a card loaded with money to spend at a particular shop|I got a gift card for the bookshop.|voucher||kind=thing
email|n|a message sent electronically from one computer or phone to another|I'll send you an email with the details.|message||forms=e-mail;kind=media
message|n|a piece of written or spoken information sent to someone|She left me a message.|note, text||kind=media
text|n|written words; also, a message sent by phone|I'll send you a text when I arrive.|message||kind=media
website|n|a set of pages on the internet about one subject or organization|The website has the opening times.|site, web page||kind=media
internet|n|the worldwide network that connects computers|The internet was down all morning.|web, net||mass;kind=media
video|n|a recording of moving pictures and sound|She posted a video of the puppy.|clip, film||kind=media
song|n|a short piece of music with words|This song always makes me smile.|tune, track||kind=media
movie|n|a story told in moving pictures, shown in cinemas or on TV|Let's watch a movie tonight.|film||kind=media
film|n|a movie; also, a thin layer covering something|We saw a funny film last night.|movie||kind=media
show|n|a performance or TV program|The show starts at eight.|program, performance||kind=media
novel|n|a long story written in prose|She's writing her first novel.|book||kind=media
poem|n|a piece of writing arranged in lines, often with rhythm or rhyme|He wrote her a poem for her birthday.|verse||kind=media
joke|n|something said to make people laugh|He told a joke about a penguin.|gag, quip||kind=media
riddle|n|a puzzling question with a clever answer|Can you solve this riddle?|puzzle, brainteaser||kind=media
car|n|a road vehicle with an engine and four wheels|We drove to the coast in my car.|automobile, vehicle||kind=vehicle
bus|n|a large road vehicle that carries many passengers|I take the bus to work.|coach||kind=vehicle;plural=buses
train|n|a line of carriages pulled along a railway|The train was ten minutes late.|||kind=vehicle
truck|n|a large road vehicle for carrying goods|A truck delivered the new sofa.|lorry||kind=vehicle;forms=lorry
boat|n|a small vessel for traveling on water|We rowed the boat across the lake.|vessel||kind=vehicle
ship|n|a large vessel for traveling on the sea|The ship sailed at dawn.|vessel, liner||kind=vehicle
plane|n|an airplane; also, a flat surface|Our plane leaves at noon.|airplane, aircraft||kind=vehicle;forms=airplane,aeroplane
motorcycle|n|a two-wheeled road vehicle with an engine|He rode his motorcycle along the coast.|motorbike, bike||kind=vehicle;forms=motorbike
scooter|n|a small two-wheeled vehicle you stand on, pushed or motor-driven|She rides a scooter to school.|||kind=vehicle
skateboard|n|a short board on wheels that you stand on and ride|He fell off his skateboard and laughed.|||kind=vehicle
helicopter|n|an aircraft with spinning blades on top that can hover|A helicopter hovered over the beach.|chopper||kind=vehicle
rocket|n|a vehicle or device pushed upward by burning fuel, used to travel into space|The rocket lifted off at dawn.|spacecraft||kind=vehicle
taxi|n|a car with a driver that you pay to take you somewhere|We took a taxi to the airport.|cab||kind=vehicle;forms=cab
subway|n|an underground railway in a city|The subway is the fastest way across town.|metro, underground||kind=vehicle;forms=metro,underground
tractor|n|a powerful vehicle used on farms|The tractor rumbled across the field.|||kind=vehicle

# Places and events
school|n|a place where children are taught|The kids walk to school together.|academy||kind=place;at=at
office|n|a room or building where people work at desks|I'll be in the office until six.|workplace||kind=place;at=at
hospital|n|a place where sick or injured people are treated|She works nights at the hospital.|clinic||kind=place;at=at
airport|n|a place where planes take off and land|We got to the airport two hours early.|airfield||kind=place;at=at
station|n|a place where trains or buses stop for passengers|Meet me at the station.|terminal, depot||kind=place;at=at
restaurant|n|a place where you buy and eat meals|We booked a table at a new restaurant.|eatery, diner||kind=place;at=at
cafe|n|a small restaurant serving drinks and light meals|Let's meet at the cafe on the corner.|coffee shop||kind=place;at=at;forms=café,coffee shop
bakery|n|a shop where bread and cakes are made or sold|The bakery sells out by noon.|||kind=place;at=at;plural=bakeries
shop|n|a building or room where things are sold|The shop on the corner sells newspapers.|store, boutique||kind=place;at=at
store|n|a shop, especially a large one|I'm going to the store for milk.|shop||kind=place;at=at
supermarket|n|a large shop that sells food and household goods|The supermarket is open until ten.|grocery store||kind=place;at=at
mall|n|a large building with many shops inside|We spent the afternoon at the mall.|shopping center||kind=place;at=at
bank|n|a business that keeps and lends money; also, the land beside a river|I need to go to the bank.|||kind=place;at=at
hotel|n|a building where people pay to stay the night|Our hotel had a view of the harbor.|inn, lodge||kind=place;at=at
cinema|n|a building where films are shown|There's a new film at the cinema.|movie theater||kind=place;at=at
theater|n|a building where plays and shows are performed|We saw a musical at the theater.|playhouse||kind=place;at=at;forms=theatre
stadium|n|a large sports ground surrounded by seats|The stadium was full for the final.|arena||kind=place;at=at
gym|n|a place with equipment for exercise|I go to the gym before work.|fitness center||kind=place;at=at
pool|n|a large tank of water for swimming; also, a small area of still water|The kids spent all day at the pool.|swimming pool||kind=place;at=at
zoo|n|a park where wild animals are kept for people to see|We saw the penguins at the zoo.|||kind=place;at=at
farm|n|land and buildings for growing crops or raising animals|My uncle has a farm with sheep.|ranch||kind=place;at=on
forest|n|a large area thick with trees|We got lost in the forest.|woods, woodland||kind=place;at=in;forms=woods
desert|n|a dry area with very little rain and few plants|It gets cold in the desert at night.|wasteland||kind=place;at=in
lake|n|a large area of water surrounded by land|We swam in the lake every morning.|||kind=place;at=by
ocean|n|one of the huge areas of salt water that cover most of the earth|The ocean was calm and blue.|sea||kind=place;at=by
sea|n|the salt water that covers much of the earth's surface|We live a short walk from the sea.|ocean||kind=place;at=by
valley|n|low land between hills or mountains|A river runs through the valley.|dale||kind=place;at=in
hill|n|an area of raised land, smaller than a mountain|We cycled up the hill.|||kind=place;at=on
cave|n|a large natural hollow in a hillside or underground|Bats live in the cave.|cavern||kind=place;at=in
field|n|an open area of land, often used for crops or grazing|Cows grazed in the field.|meadow||kind=place;at=in
jungle|n|a thick tropical forest|Monkeys called through the jungle.|rainforest||kind=place;at=in
castle|n|a large, strong building with thick walls, built in the past to defend against attack|We explored the ruins of a castle.|fortress||kind=place;at=at
bridge|n|a structure that carries a road or path across a river or gap|We watched boats from the bridge.|||kind=place;at=on
street|n|a road in a town, with buildings along it|The street was quiet on Sunday.|road, avenue||kind=place;at=on
road|n|a wide way for vehicles to travel along|The road winds along the coast.|street, highway||kind=place;at=on
town|n|a place with houses, shops and other buildings, smaller than a city|We drove into town for lunch.|||kind=place;at=in
country|n|a nation with its own government; also, land away from towns|Which country are you from?|nation, countryside||kind=place;at=in;plural=countries
house|n|a building where people live|They painted the house yellow.|home||kind=place;at=at
home|n|the place where you live|I'm heading home now.|house||kind=place;at=at;nogen
apartment|n|a set of rooms for living in, inside a larger building|Their apartment is on the fifth floor.|flat||kind=place;at=in;forms=flat
room|n|a part of a building with its own walls, floor and ceiling|This room gets the morning sun.|chamber||kind=place;at=in
bedroom|n|a room for sleeping in|My bedroom faces the garden.|||kind=place;at=in
bathroom|n|a room with a bath or shower, and usually a toilet|Someone's in the bathroom.|washroom||kind=place;at=in
garage|n|a building for keeping a car; also, a place where cars are repaired|The bikes are in the garage.|||kind=place;at=in
attic|n|the room or space just below the roof of a house|We found old letters in the attic.|loft||kind=place;at=in
basement|n|a room or floor below ground level|The washing machine is in the basement.|cellar||kind=place;at=in
playground|n|an outdoor area with swings and slides for children|The kids ran to the playground.|||kind=place;at=at
university|n|a place of higher education where people study for degrees|She's studying history at university.|college||kind=place;at=at;forms=college,uni;plural=universities
classroom|n|a room where students are taught|The classroom smelled of fresh paint.|||kind=place;at=in
church|n|a building for Christian worship|The church bells rang at noon.|chapel||kind=place;at=at;plural=churches
harbor|n|a sheltered area of water where boats are kept|Fishing boats bobbed in the harbor.|port, marina||kind=place;at=in;forms=harbour
world|n|the earth and everyone on it|I'd love to travel the world.|earth, globe||kind=place;at=in;nogen
space|n|the area beyond the earth's atmosphere; also, an empty area|Astronauts float in space.|cosmos, universe||mass
birthday|n|the day each year when you celebrate the day you were born|It's my birthday tomorrow!|||kind=event;event=joy
party|n|a social gathering for fun, often with food, drink and music|We're having a party on Saturday.|celebration, gathering||kind=event;event=joy;plural=parties
wedding|n|a ceremony at which two people get married|The wedding was in a garden.|marriage ceremony||kind=event;event=joy
anniversary|n|the date each year when something important happened|It's our tenth wedding anniversary.|||kind=event;event=joy;plural=anniversaries
graduation|n|finishing a course of study at school or university, and the ceremony for it|My parents came to my graduation.|||kind=event;event=joy
holiday|n|a day of celebration or rest; in British English, a vacation|Monday is a public holiday.|vacation, break||kind=event;event=joy;forms=hols
vacation|n|time spent away from work or school, often traveling|We're going on vacation next week.|holiday, break||kind=event;event=joy
trip|n|a journey to a place and back, usually short|We took a trip to the mountains.|outing, excursion||kind=event;event=joy
concert|n|a performance of music in front of an audience|The concert sold out in minutes.|gig, recital||kind=event;event=joy
festival|n|a day or period of celebration, or an organized series of events|The town has a music festival every summer.|fair, carnival||kind=event;event=joy
picnic|n|a meal eaten outdoors|We had a picnic by the river.|||kind=event;event=joy
reunion|n|a gathering of people who haven't seen each other for a long time|Our class reunion is in June.|get-together||kind=event;event=joy
date|n|a particular day of the month; also, a romantic meeting|I have a date on Friday.|appointment||kind=event;event=joy
sleepover|n|a night when children stay at a friend's house|The kids had a sleepover and stayed up late.|||kind=event;event=joy
celebration|n|an event held to mark something good|There was a big celebration when she came home.|party, festivity||kind=event;event=joy
exam|n|a formal test of knowledge or skill|I have a math exam on Monday.|test, examination||kind=event;event=luck;forms=examination
test|n|a set of questions or tasks to check what someone knows or can do|We have a spelling test tomorrow.|exam, quiz||kind=event;event=luck
quiz|n|a short test, or a game of questions|There's a pub quiz on Thursday.|test||kind=event;event=luck;plural=quizzes
interview|n|a formal meeting where someone is asked questions, especially for a job|I have a job interview tomorrow.|||kind=event;event=luck
meeting|n|an occasion when people come together to discuss something|The meeting ran late.|conference, session||kind=event;event=luck
presentation|n|a talk giving information to an audience|I'm giving a presentation at work.|talk, speech||kind=event;event=luck
appointment|n|an arranged time to meet someone, such as a doctor|I have a dentist appointment at three.|booking||kind=event;event=luck
deadline|n|the time by which something must be done|The deadline is Friday at noon.|due date||kind=event;event=luck
competition|n|an event where people try to win|She entered a baking competition.|contest, tournament||kind=event;event=luck
race|n|a competition of speed|He came second in the race.|contest, sprint||kind=event;event=luck
match|n|a game between two players or teams; also, a small stick for lighting fires|We have a football match on Sunday.|game, contest||kind=event;event=luck;plural=matches
audition|n|a short performance to try out for a part in a play, film or band|She has an audition for the school play.|tryout||kind=event;event=luck
surgery|n|treatment in which a doctor cuts into the body to repair it|My dad has surgery next week.|operation||kind=event;event=luck;forms=operation
recital|n|a performance of music or poetry, often by one person|My piano recital is on Saturday.|||kind=event;event=luck
driving test|n|a test you must pass to get a license to drive|I have my driving test tomorrow.|||kind=event;event=luck
funeral|n|a ceremony held for a person who has died|The funeral is on Thursday.|memorial||kind=event;event=sorry
class|n|a group of students taught together, or a lesson|I have a yoga class tonight.|lesson, course||kind=event;event=joy;plural=classes
lesson|n|a period of teaching|My guitar lesson is at four.|class||kind=event;event=joy
practice|n|doing something repeatedly to get better at it; also, a training session|Football practice is at five.|training, rehearsal||kind=event;event=joy
rehearsal|n|a practice of a play or concert before the real performance|The rehearsal ran until midnight.|practice||kind=event;event=luck
weekend|n|the two days, Saturday and Sunday, when many people don't work|What are you doing this weekend?|||kind=idea

# Actions
jog|v|to run at a slow, steady pace for exercise|I jog around the park before work.|run, trot|walk|act
hike|v|to go for a long walk in the countryside|We hiked to the top of the ridge.|trek, ramble||act
climb|v|to go up something using your hands and feet|The kids climbed the old oak tree.|scale, ascend|descend|obj=the hill
ski|v|to slide over snow on long, narrow boards|We ski in the mountains every winter.|||act
skate|v|to glide on ice skates or roller skates|They skated on the frozen pond.|glide||act
surf|v|to ride waves on a board; also, to browse the internet|He surfs every morning before work.|||act
cycle|v|to ride a bicycle|I cycle to the office when it's dry.|bike, pedal||act
ride|v|to sit on and control a horse, bicycle or motorcycle; also, to travel in a vehicle|She rides her horse along the beach.||walk|obj=her bike;past=rode
fly|v|to move through the air; also, to travel by plane|We fly to Spain next week.|soar, glide|land|act;past=flew
float|v|to rest on the surface of water or drift in the air|A leaf floated down the stream.|drift|sink|act
sit|v|to rest with your weight on your bottom|Come and sit with us.||stand|act;past=sat
stand|v|to be on your feet, upright|We stood in line for an hour.|rise|sit|act;past=stood
lie|v|to rest flat; also, to say something you know isn't true|I lay on the grass and watched the clouds.|recline||past=lay
sneeze|v|to force air out of your nose and mouth suddenly, usually without meaning to|Dust always makes me sneeze.
cough|v|to push air out of your throat noisily|He coughed all night.|hack||mood=-
yawn|v|to open your mouth wide and breathe in, because you're tired or bored|She yawned through the whole film.
breathe|v|to take air into your lungs and let it out|Breathe in slowly through your nose.|inhale, exhale
shout|v|to say something very loudly|He shouted across the field.|yell, call|whisper|act
scream|v|to make a loud, high cry from fear, pain or excitement|The kids screamed on the roller coaster.|shriek, yell
whisper|v|to speak very quietly|She whispered the answer to her friend.|murmur|shout|act
whistle|v|to make a high sound by blowing through your lips|He whistles while he works.|||act
hum|v|to sing with your lips closed|She hummed a tune while she cooked.|||act
giggle|v|to laugh lightly and nervously|The children giggled at the silly hat.|chuckle, titter||act
grin|v|to smile broadly|He grinned when he saw the cake.|smile, beam|frown
frown|v|to lower your eyebrows because you're worried, annoyed or thinking|She frowned at the bill.|scowl|smile|mood=-
sigh|v|to breathe out slowly and loudly, from relief, sadness or tiredness|He sighed and put down the phone.
nod|v|to move your head down and up, often to say yes|She nodded in agreement.
wave|v|to move your hand to say hello or goodbye|The kids waved at the passing train.
shrug|v|to raise your shoulders to show you don't know or don't care|He just shrugged when I asked.
stretch|v|to straighten your body or limbs to their full length; also, to make something longer|I stretch before every run.|extend||act
exercise|v|to move your body to stay fit|I try to exercise three times a week.|work out, train||act
train|v|to practice and prepare for a sport or skill; also, to teach a skill|She's training for a marathon.|practice, coach||act
practice|v|to do something often to get better at it|I practice the guitar every night.|rehearse, train||obj=her lines;forms=practise
study|v|to spend time learning about a subject|He's studying for his exams.|learn, revise||act
work|v|to do a job or tasks; also, to function properly|I work from home on Fridays.|labor|rest, play|act
play|v|to do something for fun; also, to make music on an instrument|The children played in the garden.|||act
shop|v|to go to shops to buy things|We shopped for shoes all afternoon.|browse||act
explore|v|to travel through a place to learn about it|We explored the old town on foot.|discover, roam||obj=the cave
camp|v|to stay in a tent or shelter outdoors|We camped by the lake.|||act
meditate|v|to sit quietly and focus your mind, often to relax|She meditates for ten minutes every morning.|reflect||act
pray|v|to speak to a god or gods, in thanks or to ask for help|They prayed for rain.|||act
wake|v|to stop sleeping|I woke at six this morning.|awaken|sleep|past=woke
nap|v|to sleep for a short time during the day|Grandpa naps after lunch.|doze, snooze||act
snore|v|to breathe noisily while asleep|My dog snores louder than me.
dream|v|to experience images and events in your sleep; also, to hope for something|I dreamed I could fly.|imagine, fantasize
worry|v|to keep thinking anxiously about problems|Don't worry, we'll find it.|fret, stress|relax|mood=-
hurry|v|to move or act quickly because there isn't much time|We hurried to catch the train.|rush, dash|dawdle
rush|v|to move or do something very quickly|She rushed out the door.|hurry, race|dawdle
stroll|v|to walk slowly and calmly, for pleasure|We strolled along the seafront.|amble, wander|march|act
crawl|v|to move on your hands and knees|The baby crawled across the rug.|creep
bounce|v|to spring back after hitting a surface; also, to jump up and down|The kids bounced on the trampoline.|rebound, spring
spin|v|to turn round and round quickly|The dancer spun on one foot.|twirl, rotate||past=spun
shake|v|to move quickly up and down or side to side|Shake the bottle before opening it.|wobble, tremble||obj=the bottle;past=shook
shiver|v|to shake slightly because you're cold or afraid|We shivered at the bus stop.|tremble, shudder||mood=-
sweat|v|to give off liquid through your skin when hot or nervous|I was sweating after the climb.|perspire
blush|v|to go red in the face from embarrassment|He blushed when she smiled at him.|redden
celebrate|v|to do something enjoyable for a special occasion|We celebrated her new job with dinner.|commemorate|mourn|act
argue|v|to disagree with someone in an angry way; also, to give reasons|They argued about whose turn it was.|quarrel, bicker|agree|act;mood=-
apologize|v|to say you are sorry|He apologized for being late.|||forms=apologise
complain|v|to say you are unhappy about something|She complained about the noise.|grumble, moan|praise|act;mood=-
chat|v|to talk in a friendly, informal way|We chatted over coffee.|talk, gossip||act
talk|v|to speak with someone|We talked for hours.|speak, chat||act
speak|v|to say words; to talk|Can I speak to the manager?|talk, say||past=spoke
commute|v|to travel regularly between home and work|I commute by train.
volunteer|v|to offer to do something without being paid|She volunteers at the animal shelter.|||act
grow|v|to get bigger; also, to make plants develop|Tomatoes grow well in the sun.|develop, expand|shrink|obj=tomatoes;past=grew
melt|v|to turn from solid to liquid with heat|The ice cream melted in the sun.|thaw, dissolve|freeze
freeze|v|to turn to ice from cold; also, to stop moving suddenly|The pond froze overnight.||melt|past=froze
rain|v|to fall as drops of water from the clouds|It rained all weekend.|pour, drizzle
snow|v|to fall as snow|It snowed on Christmas morning.
shine|v|to give out bright light|The sun is shining.|glow, gleam||past=shone
glow|v|to give out a soft, steady light|The embers glowed in the fireplace.|shine
sparkle|v|to shine with small, quick flashes of light|The lake sparkled in the sun.|glitter, twinkle
appear|v|to come into sight; also, to seem|A rainbow appeared over the hills.|emerge|disappear
disappear|v|to go out of sight|The cat disappeared under the bed.|vanish|appear
vanish|v|to disappear suddenly|The magician made the coin vanish.|disappear|appear
leave|v|to go away from a place|We leave at dawn.|depart, go|arrive, stay|past=left
return|v|to come or go back|She returned home after a year abroad.|come back|leave
stay|v|to remain in the same place|Stay here while I get the car.|remain|leave, go
hide|v|to put something or yourself where others can't see|The kids hid behind the curtains.|conceal|show, reveal|act;past=hid;ing=hiding
escape|v|to get away from somewhere or something|The parrot escaped through the window.|flee, break free
draw|v|to make a picture with a pencil, pen or crayon|She drew a map of the island.|sketch||obj=a map;past=drew
sketch|v|to draw quickly and roughly|He sketched the harbor from the café.|draw||obj=the view
cut|v|to divide or open with a knife or scissors|Cut the bread into thick slices.|slice, chop||obj=the bread;past=cut
chop|v|to cut into pieces with a knife or axe|Chop the onions finely.|cut, dice||obj=the onions
slice|v|to cut into thin, flat pieces|Slice the cucumber thinly.|cut||obj=the cake
peel|v|to remove the skin from fruit or vegetables|Peel the potatoes before boiling them.|skin||obj=an orange
stir|v|to mix a liquid by moving a spoon around in it|Stir the soup every few minutes.|mix||obj=the soup
pour|v|to make a liquid flow from a container|She poured the tea.|||obj=the tea
boil|v|to heat a liquid until it bubbles; also, to cook food in boiling water|Boil the water for the pasta.|||obj=the water
fry|v|to cook food in hot oil or fat|He fried an egg for breakfast.|||obj=an egg
grill|v|to cook food over or under direct heat|We grilled fish on the beach.|barbecue||obj=some fish
roast|v|to cook meat or vegetables in an oven|We roasted vegetables for dinner.|bake||obj=the potatoes
wash|v|to clean with water and usually soap|Wash your hands before dinner.|clean, rinse||obj=the dishes
dry|v|to make or become dry|Dry the dishes and put them away.||wet|obj=the dishes
fold|v|to bend something so one part lies over another|Fold the towels and put them on the shelf.|crease|unfold|obj=the laundry
iron|v|to make clothes smooth with a hot iron|He ironed his shirt for the interview.|press||obj=his shirt
sweep|v|to clean a floor with a brush|Sweep the kitchen floor, please.|brush||obj=the floor;past=swept
tidy|v|to make a place neat|Tidy your room before your friends come.|clean, organize|mess up|obj=her room
decorate|v|to make something look nicer by adding things to it|We decorated the cake with berries.|adorn||obj=the cake
water|v|to pour water on plants|Water the plants every evening.|||obj=the plants
feed|v|to give food to a person or animal|Can you feed the cat while I'm away?|nourish|starve|obj=the cat;past=fed
pet|v|to stroke an animal gently|The dog loves it when you pet her.|stroke||obj=the dog
hug|v|to put your arms around someone|She hugged her brother at the airport.|embrace, cuddle||obj=her brother
kiss|v|to touch someone with your lips as a sign of love or greeting|He kissed his daughter goodnight.|||obj=her cheek
call|v|to phone someone; also, to shout to someone|I'll call you tonight.|phone, ring||obj=her mother
visit|v|to go to see a person or place|We visit my grandparents every summer.|see, call on||obj=her grandmother
invite|v|to ask someone to come to an event or place|We invited the neighbors for dinner.|ask||obj=the neighbors
meet|v|to come together with someone|Let's meet at the station.|encounter, join||obj=an old friend;past=met
greet|v|to say hello to someone|The dog greets me at the door every day.|welcome, hail||obj=the guests
thank|v|to tell someone you are grateful|I thanked her for the flowers.|||obj=the driver
ask|v|to say something to get an answer or a favor|Can I ask you a question?|inquire, request|answer|obj=a question
answer|v|to reply to a question; also, to pick up a phone|She answered the phone on the first ring.|reply, respond|ask|obj=the phone
tell|v|to give information to someone in speech or writing|Tell me about your trip.|inform, say||obj=a story;past=told
say|v|to speak words|What did you say?|state, tell||past=said
memorize|v|to learn something so well you can remember it exactly|She memorized the whole poem.|learn by heart|forget|obj=the poem;forms=memorise
solve|v|to find the answer to a problem or puzzle|He solved the crossword in ten minutes.|figure out, crack||obj=the puzzle
count|v|to find the total number of something; also, to say numbers in order|Count the coins in the jar.|tally, add up||obj=the coins
measure|v|to find the size, length or amount of something|Measure the window before you buy curtains.|gauge||obj=the table
check|v|to look at something to make sure it's correct, safe or as expected|Check the time, we might be late.|inspect, verify||obj=the time
repair|v|to fix something that is broken|He repaired the roof before winter.|fix, mend|break|obj=the roof
replace|v|to put something new in place of something old or broken|We replaced the battery in the clock.|swap, substitute||obj=the battery
charge|v|to fill a battery with electricity; also, to ask a price|I need to charge my phone.|||obj=her phone
type|v|to write using a keyboard|She types faster than she talks.|key||obj=a message
print|v|to put words or pictures on paper with a machine|Print the tickets before we leave.|||obj=the tickets
download|v|to copy data from the internet to your device|I downloaded the map before the trip.||upload|obj=the file
send|v|to make something go to a person or place|I'll send you the photos.|post, mail|receive|obj=a letter;past=sent
receive|v|to get something someone gave or sent|Did you receive my message?|get, collect|send|obj=a package
deliver|v|to take something to the person or place it's for|They deliver groceries on Saturdays.|bring, drop off||obj=the parcel
pack|v|to put things into a bag or box to take somewhere|I packed my suitcase last night.|load|unpack|obj=her suitcase
unpack|v|to take things out of a bag or box|We unpacked as soon as we arrived.||pack|obj=the boxes
lift|v|to raise something to a higher position|Help me lift the sofa.|raise, hoist|lower|obj=the box
push|v|to press against something to move it away from you|Push the door, don't pull it.|shove|pull|obj=the cart
pull|v|to hold something and move it toward you|Pull the rope as hard as you can.|tug, drag|push|obj=the rope
kick|v|to hit something with your foot|He kicked the ball over the fence.|boot||obj=the ball
hit|v|to strike something with force|She hit the ball right out of the park.|strike, smack||obj=the ball;past=hit
drop|v|to let something fall|I dropped my keys down the drain.|let go|catch|obj=his keys;mood=-
hold|v|to have something in your hands or arms|Can you hold the baby for a moment?|grip, carry|release|obj=the baby;past=held
grab|v|to take hold of something suddenly|He grabbed his coat and ran.|snatch, seize|release|obj=her coat
wrap|v|to cover something completely in paper or cloth|I wrapped the present in gold paper.|cover|unwrap|obj=the present
close|v|to shut something|Close the window, it's cold.|shut|open|obj=the door
lock|v|to fasten something with a key|Did you lock the front door?|secure, fasten|unlock|obj=the door
fill|v|to make something full|Fill the bottle with water.|load|empty|obj=the bottle
spill|v|to let a liquid fall out of its container by accident|I spilled coffee on my shirt.|slop||obj=his coffee;mood=-
cross|v|to go from one side of something to the other|Look both ways before you cross the road.|traverse||obj=the road
follow|v|to go after someone or something; also, to understand|Follow the path to the lake.|trail, pursue|lead|obj=the path
lead|v|to show the way by going first; also, to be in charge|She led the team to victory.|guide, direct|follow|obj=the team;past=led
win|v|to come first in a game, race or competition|We won the quiz by one point.|triumph, succeed|lose|obj=the race;past=won
lose|v|to fail to win; also, to be unable to find something|I lost my umbrella again.|misplace|win, find|obj=the game;past=lost;mood=-
fail|v|to not succeed|He failed his driving test the first time.|flunk|succeed, pass|mood=-
pass|v|to succeed in a test; also, to go past|She passed her exam with top marks.||fail|obj=the test
finish|v|to come to the end of something|I finished the book last night.|complete, end|start|obj=the book
start|v|to begin|The film starts at eight.|begin|finish, stop|obj=the car
begin|v|to start|Let's begin with the easy questions.|start, commence|end, finish|past=began;ing=beginning
stop|v|to end a movement or action|The rain stopped at noon.|halt, cease|start
plan|v|to decide in detail what you will do|We planned the trip together.|arrange, organize||obj=the trip
prepare|v|to make something ready|She prepared a picnic for the beach.|get ready||obj=dinner
order|v|to ask for something to be made, supplied or delivered|Let's order a pizza.|request||obj=a pizza
pay|v|to give money for something|I'll pay for the coffee.|||obj=the bill;past=paid
sell|v|to give something in exchange for money|They sold their old car.||buy|past=sold
spend|v|to use money; also, to pass time|We spent the day at the beach.|use||obj=the money;past=spent
save|v|to keep money for later; also, to rescue; also, to store a file|I'm saving for a new bike.|keep, rescue|spend|obj=some money
earn|v|to get money for work|She earns extra money babysitting.|make||obj=some money
lend|v|to let someone use something for a while|Can you lend me a pen?||borrow|obj=a pen;past=lent
rent|v|to pay to use something that belongs to someone else|We rented a cabin by the lake.|hire, lease||obj=a cabin
wear|v|to have clothes or jewelry on your body|She wore a red dress.|||obj=her coat;past=wore
brush|v|to clean or tidy with a brush|Brush your teeth before bed.|||obj=her hair
rescue|v|to save someone from danger|Firefighters rescued the kitten from the tree.|save||obj=the kitten
protect|v|to keep someone or something safe|Sunscreen protects your skin.|guard, shield|endanger|obj=the plants
chase|v|to run after someone or something to catch it|The dog chased the ball.|pursue, run after||obj=the ball
collect|v|to bring things together; also, to pick someone up|He collects old stamps.|gather|scatter|obj=stamps
knit|v|to make clothes from yarn using two long needles|Grandma knitted me a scarf.|||obj=a scarf
sew|v|to join cloth with a needle and thread|Can you sew this button back on?|stitch||obj=a button
design|v|to plan how something will look or work|She designed her own website.|plan, create||obj=a poster
invent|v|to create something that didn't exist before|Who invented the telephone?|create, devise||obj=a new game
discover|v|to find something for the first time|We discovered a shortcut through the woods.|find, uncover||obj=a shortcut
enjoy|v|to get pleasure from something|I really enjoyed the film.|like, relish|dislike|obj=the show
love|v|to feel deep affection for someone, or to like something very much|I love this song.|adore, cherish|hate
like|v|to find something pleasant|Do you like jazz?|enjoy|dislike
hate|v|to dislike very much|I hate getting up in the dark.|detest, loathe|love|mood=-
miss|v|to fail to catch or hit; also, to feel sad that someone isn't there|I missed the bus by a minute.||catch|obj=the bus;mood=-
forgive|v|to stop being angry with someone for something they did|She forgave him for being late.|pardon, excuse|blame|past=forgave
trust|v|to believe someone is honest or reliable|I trust her completely.|rely on|distrust
believe|v|to think something is true|I believe you.|trust, accept|doubt
understand|v|to know what something means or how it works|I don't understand the question.|grasp, follow|misunderstand|past=understood
know|v|to have information in your mind|Do you know the way?|understand, realize||past=knew
recognize|v|to know someone or something because you've seen or heard them before|I recognized her voice at once.|identify||forms=recognise
guess|v|to give an answer without being sure|Guess what happened today!|estimate, suppose||obj=the answer
decide|v|to make a choice|We decided to stay in.|choose, settle
agree|v|to have the same opinion|I agree with you.|concur|disagree
want|v|to wish to have or do something|I want a cup of tea.|desire, wish for
need|v|to require something because it's important|I need some sleep.|require
hope|v|to want something to happen and think it might|I hope you feel better soon.|wish
wish|v|to want something that may not happen|I wish it were summer.|hope, long for
feel|v|to experience an emotion or a sensation|I feel much better today.|sense||past=felt
get|v|to receive or obtain; also, to become|Did you get my letter?|receive, obtain|give|past=got
give|v|to hand something to someone|She gave me a book for my birthday.|hand, present|take|past=gave
take|v|to get hold of something and carry it or use it|Take an umbrella.|grab, carry|give|past=took
put|v|to move something into a place|Put your shoes by the door.|place, set||past=put
bring|v|to carry something or come with someone to a place|Bring a jacket.|carry, fetch|take|past=brought
come|v|to move toward or arrive at a place|Come to the party!|arrive, approach|go|past=came
look|v|to turn your eyes toward something|Look at the sunset.|gaze, glance
smell|v|to notice something with your nose; also, to give off a smell|The bread smells wonderful.|sniff, scent||obj=the roses
taste|v|to notice flavor with your tongue|Taste the sauce and add salt if needed.|sample||obj=the soup
touch|v|to put your hand on something|Don't touch the oven, it's hot.|feel, handle||obj=the screen
move|v|to change position or place; also, to go to live somewhere else|We're moving to a new house.|shift, relocate|stay
change|v|to make or become different|The leaves change color in autumn.|alter, transform|keep
try|v|to make an effort to do something; also, to test something|Try the soup, it's good.|attempt, test||obj=the soup
use|v|to do something with a tool, machine or method|Use a sharp knife for the tomatoes.|employ, operate||obj=the map
keep|v|to continue to have or hold something|Keep the change.|hold, retain|lose|obj=the receipt;past=kept
show|v|to let someone see something|Show me your drawing.|display, reveal|hide|obj=the photos

# Describing words
red|adj|having the color of blood or ripe strawberries|She bought a red coat.|scarlet, crimson||use=object
blue|adj|having the color of a clear sky; informally, also sad|He painted the door blue.|azure, navy||use=object
green|adj|having the color of grass; also, not harmful to the environment|The hills turn green in spring.|emerald||use=object
yellow|adj|having the color of lemons or butter|A yellow taxi pulled up.|golden||use=object
purple|adj|having a color between red and blue|She wore a purple scarf.|violet, lilac||use=object
pink|adj|having a pale red color|The sky went pink at dawn.|rosy||use=object
black|adj|having the darkest color, like the night sky|He wore a black jacket.|dark, jet|white|use=object
white|adj|having the color of fresh snow or milk|The walls are painted white.|snowy, ivory|black|use=object
gray|adj|having a color between black and white, like rain clouds|It was a gray, drizzly day.|silver, ashen||use=object;forms=grey
brown|adj|having the color of chocolate or earth|The dog has big brown eyes.|chocolate, tan||use=object
golden|adj|having the color of gold; also, very special|The field was golden in the evening light.|gilded||use=object
round|adj|shaped like a circle or ball|We sat around a round table.|circular||use=object
square|adj|having four equal sides and four right angles|She cut the bread into square pieces.|||use=object
flat|adj|level and smooth, with no bumps|The road was long and flat.|level, even|bumpy
smooth|adj|having an even surface with no rough parts|The stones were smooth from the river.|sleek, silky|rough|use=object
rough|adj|having an uneven surface; also, difficult|The rough path was hard on our feet.|coarse, bumpy|smooth|use=object
sharp|adj|having a fine edge or point that can cut; also, clever|Careful, that knife is sharp.|keen|blunt, dull|use=object
sticky|adj|covered with something that makes things stick to it|My hands were sticky with honey.|tacky, gooey||use=object
wet|adj|covered with or full of water or another liquid|My shoes are wet from the rain.|damp, soaked|dry|use=object
dry|adj|without water or moisture|Keep the matches dry.|arid|wet|use=object
hard|adj|firm and not easy to bend or break; also, difficult|The bread was hard as a rock.|firm, solid|soft, easy|use=object;mood=-
long|adj|measuring a great distance from end to end; also, lasting a lot of time|It was a long walk home.|lengthy|short|use=object
short|adj|small in length, height or time|We took a short break.|brief|long, tall|use=object
tall|adj|of great height|The tall trees blocked the sun.|high, towering|short|use=object
huge|adj|extremely large|A huge wave crashed on the rocks.|enormous, giant|tiny|use=object
giant|adj|very large|A giant pumpkin won first prize.|huge, colossal|tiny|use=object
little|adj|small in size or amount|They live in a little house by the sea.|small, tiny|big|use=object
thick|adj|wide from one side to the other; also, dense|She read a thick book over the holidays.|wide, dense|thin|use=object
thin|adj|narrow from one side to the other; also, not fat|Slice the cucumber into thin rounds.|slim, slender|thick|use=object
wide|adj|large from side to side|The river is wide here.|broad|narrow
narrow|adj|small from side to side|We walked down a narrow alley.|thin, tight|wide
deep|adj|going a long way down|The lake is very deep in the middle.|bottomless|shallow
shallow|adj|not deep|The kids paddled in the shallow water.||deep
clean|adj|free from dirt|Put on a clean shirt.|spotless, fresh|dirty|use=object
dirty|adj|covered with dirt|His boots were dirty after the hike.|muddy, filthy|clean|use=object
broken|adj|damaged and in pieces, or not working|The vase was broken.|smashed, faulty|whole, working|use=object
perfect|adj|completely without faults|It was a perfect day for a picnic.|flawless, ideal|flawed|use=object;mood=+
simple|adj|easy to understand or do; also, plain|The instructions were simple.|easy, plain|complicated
complicated|adj|made of many parts and hard to understand|The rules are too complicated.|complex, tricky|simple
easy|adj|not difficult|The test was easier than I expected.|simple, effortless|hard, difficult|mood=+
difficult|adj|needing a lot of effort or skill|That was a difficult climb.|hard, tough|easy|mood=-
cheap|adj|low in price|We found a cheap hotel near the station.|inexpensive|expensive|use=object
expensive|adj|costing a lot of money|That watch looks expensive.|costly, pricey|cheap|use=object
modern|adj|of the present time or recent times|They live in a modern apartment.|contemporary|old-fashioned, ancient|use=object
famous|adj|known by a lot of people|The café is famous for its cakes.|well-known, renowned|unknown
popular|adj|liked by many people|The beach is popular with families.|well-liked|unpopular
rare|adj|not found or happening often|This bird is very rare here.|uncommon, scarce|common
common|adj|happening or found often|Colds are common in winter.|ordinary, frequent|rare
useful|adj|helpful for doing something|A torch is useful on a camping trip.|handy, helpful|useless|use=object
useless|adj|not helpful at all|This old map is useless.|pointless|useful|use=object
dangerous|adj|able to cause harm|The ice on the road is dangerous.|risky, hazardous|safe
loud|adj|making a lot of noise|The music was too loud.|noisy, booming|quiet|use=place
hot|adj|having a high temperature|Be careful, the plate is hot.|warm, boiling|cold|use=weather
cool|adj|a little cold; informally, also great|It's cool in the shade.|chilly|warm|use=weather;mood=+
sunny|adj|full of sunshine|It was a sunny afternoon.|bright, clear|cloudy|use=weather
cloudy|adj|full of clouds|It's cloudy, but it won't rain.|overcast, gray|sunny|use=weather
rainy|adj|with a lot of rain|It was a rainy weekend.|wet, drizzly|dry|use=weather
windy|adj|with a lot of wind|It's too windy for a picnic.|breezy, gusty|calm|use=weather
foggy|adj|full of fog|The harbor was foggy this morning.|misty, hazy|clear|use=weather
stormy|adj|with strong wind, rain or thunder|It was a stormy night.|rough, wild|calm|use=weather
messy|adj|untidy or dirty|His room is always messy.|untidy, cluttered|tidy, neat|use=place
tidy|adj|neat and in order|Her desk is always tidy.|neat, orderly|messy|use=place
neat|adj|tidy and carefully arranged; informally, also good|He has very neat handwriting.|tidy, orderly|messy|use=object
cute|adj|attractive in a sweet way|What a cute puppy!|adorable, sweet||use=object
pretty|adj|attractive in a delicate way; also, informally, quite|The village is very pretty.|lovely, attractive|ugly|use=object
ugly|adj|unpleasant to look at|It's an ugly building, but it's warm inside.|unattractive, hideous|beautiful|use=object
lovely|adj|very pleasant or beautiful|What a lovely garden.|beautiful, delightful|horrible|use=object;mood=+
wonderful|adj|extremely good|We had a wonderful time.|marvelous, fantastic|terrible|mood=+
amazing|adj|very surprising, often in a good way|The view from the top was amazing.|incredible, astonishing|ordinary|mood=+
awesome|adj|informal: very good; also, inspiring awe|That was an awesome concert.|amazing, great|awful|mood=+
great|adj|very good; also, very large or important|We had a great time.|excellent, superb|terrible|mood=+
excellent|adj|extremely good|She gave an excellent talk.|outstanding, superb|poor|mood=+
fantastic|adj|extremely good; also, imaginary|The food was fantastic.|wonderful, terrific|awful|mood=+
terrible|adj|very bad|The traffic was terrible.|awful, dreadful|wonderful|mood=-
awful|adj|very bad or unpleasant|I had an awful cold.|terrible, dreadful|wonderful|mood=-
horrible|adj|very unpleasant|What a horrible smell.|nasty, dreadful|lovely|mood=-
nice|adj|pleasant or kind|It's a nice day.|pleasant, lovely|nasty|mood=+
fine|adj|good or acceptable; also, very thin|The weather is fine today.|okay, good||mood=0
okay|adj|all right; acceptable|The food was okay.|fine, all right||forms=ok;mood=0
weird|adj|very strange|I had a weird dream last night.|strange, odd|normal|mood=0
normal|adj|usual and ordinary|It's a normal Tuesday.|ordinary, typical|strange|mood=0
special|adj|different from and better than usual|Tonight's dinner is special.|unique, exceptional|ordinary
real|adj|actually existing; not imaginary or fake|Is that a real diamond?|genuine, actual|fake
fake|adj|not real, but made to look real|The flowers are fake.|false, imitation|real, genuine
true|adj|correct and real|Is it true that you can juggle?|correct, accurate|false
false|adj|not true|That rumor is false.|untrue, wrong|true
right|adj|correct; also, on the side of the body opposite the left|You were right about the weather.|correct|wrong
wrong|adj|not correct|I took the wrong bus.|incorrect, mistaken|right
ready|adj|prepared for something|Are you ready to go?|prepared, set
late|adj|after the expected time|The train was late again.|delayed, overdue|early
early|adj|before the usual or expected time|We arrived early.|premature|late
quick|adj|fast, or done in a short time|Can I ask a quick question?|fast, speedy|slow
young|adj|having lived for a short time|The young tree needs support.|youthful|old
alive|adj|living|Is the plant still alive?|living|dead
healthy|adj|in good physical or mental condition; also, good for you|She eats a healthy breakfast.|well, fit|unhealthy, sick
strong|adj|having a lot of physical power; also, hard to break|He's strong enough to lift the sofa.|powerful, sturdy|weak
weak|adj|lacking strength or power|My legs felt weak after the flu.|feeble, frail|strong
rich|adj|having a lot of money; also, full of flavor|They became rich from the invention.|wealthy|poor
poor|adj|having little money; also, of low quality|The soil here is poor.|needy|rich
friendly|adj|kind and pleasant to others|The staff were very friendly.|kind, warm|unfriendly, hostile|use=trait
funny|adj|making you laugh; also, strange|He told a funny story.|amusing, hilarious|serious|use=trait
serious|adj|thinking carefully and not joking; also, important or bad|She looked serious for a moment.|solemn, grave|funny|use=trait
smart|adj|clever; also, neatly dressed|She's smart and works hard.|clever, intelligent|stupid|use=trait
creative|adj|good at having new and original ideas|He's very creative with leftovers.|imaginative, inventive||use=trait
lazy|adj|not willing to work or make an effort|I had a lazy Sunday.|idle, sluggish|hardworking
hardworking|adj|putting a lot of effort into work|She's the most hardworking person on the team.|diligent, industrious|lazy|use=trait;forms=hard-working
loyal|adj|always supporting a person, group or cause|The dog is loyal to its owner.|faithful, devoted|disloyal|use=trait
reliable|adj|able to be trusted to do what you expect|He's a reliable friend.|dependable, trustworthy|unreliable|use=trait
thoughtful|adj|thinking about other people's needs; also, thinking deeply|What a thoughtful gift.|considerate, caring|thoughtless|use=trait
caring|adj|kind and showing that you care about others|She's a caring nurse.|kind, compassionate|uncaring|use=trait
gentle|adj|kind, calm and careful not to hurt|He's gentle with the kitten.|tender, mild|rough|use=trait
cheeky|adj|rude in a playful or amusing way|The cheeky squirrel stole my sandwich.|sassy, impudent|polite|use=trait
quirky|adj|unusual in an interesting way|She has a quirky sense of style.|eccentric, offbeat|ordinary|use=trait
ambitious|adj|having a strong wish to succeed|He's ambitious and wants his own company.|driven, determined||use=trait
determined|adj|having firmly decided to do something|She was determined to finish the race.|resolute, persistent|hesitant|use=trait
stubborn|adj|refusing to change your mind|My cat is too stubborn to come when called.|obstinate, headstrong|flexible|use=trait
outgoing|adj|friendly and enjoying meeting people|She's outgoing and talks to everyone.|sociable, extroverted|shy|use=trait

# Ideas, time, nature and everyday words
hope|n|a feeling that something you want may happen|There's still hope we'll find the cat.|optimism, faith|despair|kind=idea;mass
fear|n|the unpleasant feeling that danger or harm is near|She has a fear of spiders.|dread, fright|courage|kind=idea
anger|n|a strong feeling of displeasure|He tried to hide his anger.|rage, fury|calm|kind=idea;mass;nogen
joy|n|great happiness|The puppy brought us so much joy.|delight, happiness|sorrow|kind=idea;mass
sadness|n|the feeling of being sad|There was a sadness in her voice.|sorrow, grief|happiness|kind=idea;mass;nogen
grief|n|deep sadness, especially after someone dies|Grief can take a long time to soften.|sorrow, mourning|joy|mass
peace|n|a state of calm and quiet; also, a time without war|I love the peace of early mornings.|calm, tranquility|war, chaos|kind=idea;mass
truth|n|what is true or real|Tell me the truth.|fact, honesty|lie|kind=idea;mass
lie|n|something said that you know isn't true|He told a lie about the broken vase.|fib, falsehood|truth|kind=idea
luck|n|good or bad things that happen by chance|Good luck with your exam!|fortune, chance|misfortune|kind=idea;mass
success|n|achieving what you wanted|The bake sale was a huge success.|achievement, triumph|failure|kind=idea;mass
failure|n|not succeeding|Every failure teaches you something.|defeat, flop|success|kind=idea
problem|n|something difficult that needs to be dealt with|We have a problem with the car.|issue, trouble|solution|kind=idea
solution|n|a way to solve a problem; also, a liquid with something dissolved in it|We found a simple solution.|answer, fix|problem|kind=idea
answer|n|a reply to a question, or the solution to a problem|Do you know the answer?|reply, response|question|kind=idea
reason|n|the cause or explanation for something|What's the reason for the delay?|cause, explanation||kind=idea
choice|n|the act of choosing, or the options you can choose from|You have a choice of tea or coffee.|option, selection||kind=idea
decision|n|a choice you make after thinking|Moving was a big decision.|choice, verdict||kind=idea
goal|n|something you want to achieve; also, a point scored in some sports|My goal is to run a marathon.|aim, target||kind=idea
wish|n|a feeling of wanting something; also, the thing wanted|Make a wish and blow out the candles.|desire, hope||kind=idea;plural=wishes
advice|n|an opinion about what someone should do|Can I give you some advice?|guidance, tip||kind=idea;mass
news|n|new information about recent events|Have you heard the news?|report, update||kind=idea;mass
fact|n|something known to be true|It's a fact that water boils at 100°C at sea level.|truth, reality|fiction, opinion|kind=idea
rule|n|a statement of what you must or must not do|The first rule is to have fun.|regulation, law||kind=idea
art|n|creative work such as painting, sculpture and music|She studies art at college.|||kind=idea;mass
science|n|knowledge about the natural world gained through observation and experiments|Science explains why the sky is blue.|||kind=idea;mass
history|n|the study of past events, or the past itself|I love reading about history.|past||kind=idea;mass
math|n|the study of numbers, shapes and patterns|Math was my favorite subject.|mathematics, arithmetic||kind=idea;mass;forms=maths,mathematics
language|n|a system of words used by a group of people to communicate|How many languages do you speak?|tongue||kind=idea;nogen
nature|n|the plants, animals and landscapes not made by people|We spent the weekend in nature.|wildlife, environment||kind=idea;mass
health|n|the condition of your body and mind|Sleep is important for your health.|wellbeing, fitness|illness|kind=idea;mass
energy|n|the strength to be active; also, power from electricity or fuel|I have no energy today.|vigor, power|tiredness|kind=idea;mass
job|n|work you do regularly for pay|She got a new job at the library.|work, position||kind=idea
career|n|a series of jobs in one field over a lifetime|He had a long career as a teacher.|profession, vocation||kind=idea;nogen
hobby|n|something you do for pleasure in your free time|My hobby is birdwatching.|pastime, interest||kind=idea;plural=hobbies;nogen
sport|n|a game or activity involving physical effort and skill|Tennis is my favorite sport.|game||kind=idea;nogen
football|n|a team game in which players kick a ball into a goal; in the US, a game with an oval ball|We played football in the park.|soccer||kind=idea;mass;forms=soccer
trust|n|belief that someone is honest and reliable|Trust takes time to build.|faith, confidence|distrust|kind=idea;mass
respect|n|a feeling of admiration for someone's qualities, or of care for their feelings|She treats everyone with respect.|regard, esteem|contempt|kind=idea;mass
pride|n|a feeling of satisfaction in something you or others did|He spoke with pride about his daughter.|satisfaction|shame|kind=idea;mass
silence|n|complete quiet|The silence in the forest was beautiful.|quiet, hush|noise|kind=idea;mass
noise|n|a sound, especially a loud or unpleasant one|What's that noise?|sound, racket|silence|kind=idea
change|n|the act of becoming different; also, coins|A change of plan is fine with me.|shift, transformation||kind=idea
future|n|the time that is still to come|Nobody knows what the future holds.|tomorrow|past|kind=idea;nogen
past|n|the time before now|In the past, people wrote letters.|history|future|kind=idea;nogen
moment|n|a very short time; also, a particular point in time|Wait a moment.|instant, second||kind=idea
life|n|the time a person or thing is alive; also, the state of being alive|She has lived here her whole life.|existence|death|kind=idea;plural=lives;nogen
day|n|a period of twenty-four hours; also, the time when it's light|It was a long day.|||kind=idea
night|n|the time when it is dark, between evening and morning|The stars were bright last night.|nighttime|day|kind=idea
morning|n|the early part of the day, until noon|I go for a run every morning.|dawn|evening|kind=idea
afternoon|n|the time between noon and evening|Let's meet this afternoon.|||kind=idea
evening|n|the end of the day, between afternoon and night|We walked by the river in the evening.|dusk|morning|kind=idea
week|n|seven days in a row|I'll see you next week.|||kind=idea
month|n|one of the twelve parts of a year|My birthday is next month.|||kind=idea
year|n|a period of twelve months|It's been a busy year.|||kind=idea
season|n|one of the four parts of the year: spring, summer, autumn and winter|Autumn is my favorite season.|||kind=idea
spring|n|the season after winter, when plants start to grow; also, a coiled piece of metal|The garden comes alive in spring.|||kind=idea;mass;nogen
summer|n|the warmest season of the year|We spend every summer at the beach.|||kind=idea;mass;nogen
autumn|n|the season after summer, when leaves fall|The leaves turn red in autumn.|fall||kind=idea;mass;forms=fall;nogen
winter|n|the coldest season of the year|It snows a lot here in winter.|||kind=idea;mass;nogen
today|adv|on this day|I'm working from home today.|now
tomorrow|adv|on the day after today|See you tomorrow.||yesterday
yesterday|adv|on the day before today|I saw her yesterday.||tomorrow
tonight|adv|during the evening or night of today|What are you doing tonight?|this evening
soon|adv|in a short time from now|Dinner will be ready soon.|shortly|later
later|adv|at a time after now|I'll call you later.|afterward|earlier
now|adv|at this moment|I'm busy now.|currently|then
already|adv|before now, or sooner than expected|I've already eaten.
still|adv|continuing until now; also, without moving|Are you still at work?|yet
again|adv|one more time|Can you say that again?|once more
together|adv|with each other|We cooked dinner together.|jointly|apart
almost|adv|very nearly|We're almost there.|nearly
really|adv|very; also, in fact|That was really kind of you.|truly, very
very|adv|to a great degree|It's very cold today.|extremely, really|slightly
maybe|adv|perhaps; possibly|Maybe we'll go to the beach.|perhaps, possibly|definitely
definitely|adv|without any doubt|I'll definitely be there.|certainly, surely|maybe
probably|adv|almost certainly|It'll probably rain later.|likely
finally|adv|after a long time; also, last of all|We finally found the keys.|at last, eventually||use=manner
loudly|adv|in a loud way|He laughed loudly at the film.|noisily|quietly|use=manner
softly|adv|in a quiet or gentle way|She spoke softly to the baby.|gently, quietly|loudly|use=manner
calmly|adv|in a calm way|He calmly explained what happened.|serenely|frantically|use=manner
proudly|adv|in a proud way|She proudly showed us her painting.|||use=manner
eagerly|adv|with keen interest or excitement|The kids eagerly opened their presents.|keenly|reluctantly|use=manner
nervously|adv|in a nervous way|He nervously checked his watch.|anxiously|calmly|use=manner
cheerfully|adv|in a cheerful way|She cheerfully waved goodbye.|happily|gloomily|use=manner
sadly|adv|in a sad way; also, unfortunately|He smiled sadly.|unhappily|happily|use=manner
politely|adv|in a polite way|She politely declined the offer.|courteously|rudely|use=manner
honestly|adv|in an honest way; also, used to stress that you mean it|Honestly, I don't mind.|truthfully||use=manner
frequently|adv|often|Buses run frequently on weekdays.|often, regularly|rarely|use=often
occasionally|adv|sometimes, but not often|We occasionally eat out.|sometimes, now and then|often|use=often
seldom|adv|rarely|We seldom see snow here.|rarely, hardly ever|often|use=often
weather|v|to come through something difficult safely; also, to change from exposure to wind and rain|The old boat had weathered many storms.|survive, withstand
sun|n|the star that the earth moves around, giving us light and heat|The sun set over the hills.|||kind=nature
moon|n|the natural object that circles the earth and shines at night|The moon was full and bright.|||kind=nature
star|n|a ball of burning gas seen as a point of light in the night sky; also, a famous performer|We counted the stars from the roof.|||kind=nature
sky|n|the space above the earth where you see the sun, clouds and stars|The sky was clear and blue.|heavens||plural=skies;kind=nature
cloud|n|a mass of tiny water drops floating in the sky|A cloud covered the sun.|||kind=nature
rainbow|n|an arc of colors in the sky, caused by sunlight shining through rain|We saw a rainbow over the bay.|||kind=nature
snowflake|n|a single piece of falling snow|A snowflake landed on her nose.|||kind=nature
storm|n|very bad weather with strong winds and usually rain or thunder|The storm knocked the power out.|tempest, gale|calm|kind=nature
thunder|n|the loud noise after a flash of lightning|The thunder made the dog hide.|rumble||mass;kind=nature
lightning|n|a bright flash of electricity in the sky during a storm|Lightning lit up the whole valley.|||mass;kind=nature
wind|n|moving air|The wind blew my hat off.|breeze, gust||kind=nature
fire|n|the heat, light and flames from something burning|We sat around the fire and told stories.|blaze, flame||kind=nature
ice|n|frozen water|Careful, there's ice on the path.|frost||mass;kind=nature
snow|n|soft white flakes of frozen water that fall from clouds|The snow was knee-deep.|||mass;kind=nature
rain|n|water falling from clouds in drops|The rain didn't stop all day.|drizzle, downpour||mass;kind=nature
sand|n|tiny loose grains of rock, found on beaches and in deserts|The kids built castles in the sand.|||mass;kind=nature
grass|n|a common plant with thin green leaves that covers lawns and fields|We lay on the grass and watched the clouds.|lawn||mass;kind=nature
mud|n|soft, wet earth|The dog came back covered in mud.|dirt, muck||mass;kind=nature
reading|n|the activity of looking at and understanding written words|Reading is my favorite way to relax.|||kind=idea;mass
gardening|n|the work of looking after a garden|Gardening keeps me calm.|||kind=idea;mass
photography|n|the art or hobby of taking photographs|He got into photography on his travels.|||kind=idea;mass
cooking|n|preparing food by heating it; also, the food prepared|Her cooking is the best in the family.|cuisine||kind=idea;mass
dance|n|a series of movements to music; also, a party for dancing|They had the first dance at their wedding.|||kind=event;event=joy
yes|excl|a word used to agree, accept or answer positively|"Do you want tea?" "Yes, please."|yeah, sure|no|forms=yeah,yep,yup
no|excl|a word used to refuse, disagree or answer negatively|"Are you tired?" "No, I'm fine."|nope, nah|yes|forms=nope,nah
sorry|adj|feeling regret or sympathy; also, a word used to apologize|Sorry I'm late!|apologetic, regretful||use=feel;mood=-
welcome|excl|a greeting to someone who has arrived|Welcome to our home!|hello, greetings
cheers|excl|informal: thanks; also, said when raising a glass|Cheers for the help!|thanks, thank you
wow|excl|a word showing surprise or admiration|Wow, look at that view!|whoa, gosh||forms=whoa
oops|excl|a word said after a small mistake|Oops, I spilled the milk.|whoops||forms=whoops
ouch|excl|a word said when you feel sudden pain|Ouch, that's hot!|ow||forms=ow
hooray|excl|a shout of joy or approval|Hooray, it's the weekend!|yay, hurrah||forms=yay,hurray,hurrah
lol|excl|internet slang: laughing out loud|That cat video was so funny, lol.|haha||forms=lmao
awesome|excl|informal: used to say something is great|"I got the tickets." "Awesome!"|great, brilliant
yikes|excl|informal: a word showing alarm or shock|Yikes, that spider is huge!|eek
cool|excl|informal: used to say you agree or that something is good|"Pizza tonight?" "Cool."|great, nice
dude|n|informal: a man; also, a friendly way to address someone|Dude, you have to see this.|guy, mate||kind=person;nogen
buddy|n|informal: a friend|He's my fishing buddy.|pal, mate, friend||kind=person;plural=buddies;rel
mate|n|informal, British and Australian: a friend; also, a partner|I'm going to the pub with my mates.|friend, pal, buddy||kind=person;rel
vibe|n|informal: the feeling or atmosphere of a place or person|This café has a nice vibe.|atmosphere, mood||kind=idea
chill|v|informal: to relax; also, to make cold|We just chilled at home all weekend.|relax, unwind|stress|act;forms=chillin
hang out|v|informal: to spend time somewhere or with someone, relaxing|We hung out at the park.|chill, spend time||past=hung out;ing=hanging out
sunrise|n|the time when the sun appears in the morning|We got up early to watch the sunrise.|dawn|sunset|kind=nature
sunset|n|the time when the sun goes down in the evening|We had dinner on the beach at sunset.|dusk|sunrise|kind=nature
weekday|n|any day from Monday to Friday|The shop is open on weekdays.|||kind=idea;nogen
Monday|n|the day of the week after Sunday|I start my new job on Monday.|||kind=time
Tuesday|n|the day of the week after Monday|We have yoga every Tuesday.|||kind=time
Wednesday|n|the day of the week after Tuesday|The market is on Wednesday.|||kind=time
Thursday|n|the day of the week after Wednesday|See you on Thursday.|||kind=time
Friday|n|the day of the week after Thursday|Pizza night is every Friday.|||kind=time
Saturday|n|the day of the week after Friday|Let's go hiking on Saturday.|||kind=time
Sunday|n|the day of the week after Saturday|We have a big lunch on Sunday.|||kind=time
January|n|the first month of the year|It's freezing here in January.|||kind=time
February|n|the second month of the year|February is the shortest month.|||kind=time
March|n|the third month of the year|The daffodils come out in March.|||kind=time
April|n|the fourth month of the year|It rains a lot in April.|||kind=time
May|n|the fifth month of the year|We're getting married in May.|||kind=time
June|n|the sixth month of the year|School ends in June.|||kind=time
July|n|the seventh month of the year|July was hot this year.|||kind=time
August|n|the eighth month of the year|We go to the coast every August.|||kind=time
September|n|the ninth month of the year|The new term starts in September.|||kind=time
October|n|the tenth month of the year|The leaves turn in October.|||kind=time
November|n|the eleventh month of the year|It gets dark early in November.|||kind=time
December|n|the twelfth month of the year|It snowed every day in December.|||kind=time

# Body and health
head|n|the top part of the body, with the face, eyes and brain|I bumped my head on the cupboard.|||kind=body
face|n|the front of the head, from the forehead to the chin|She had paint on her face.|||kind=body
eye|n|one of the two organs you see with|She has bright green eyes.|||kind=body
ear|n|one of the two organs you hear with|He whispered in my ear.|||kind=body
nose|n|the part of the face you breathe and smell through|My nose is cold.|||kind=body
mouth|n|the opening in the face for eating and speaking|Don't talk with your mouth full.|||kind=body
tooth|n|one of the hard white parts in your mouth for biting and chewing|I lost a tooth when I was six.|||kind=body;plural=teeth
tongue|n|the soft part inside the mouth used for tasting and speaking|I burned my tongue on the soup.|||kind=body
throat|n|the passage at the back of the mouth, and the front of the neck|My throat is sore.|||kind=body
neck|n|the part of the body joining the head to the shoulders|My neck is stiff from sleeping badly.|||kind=body
shoulder|n|the joint where the arm meets the body|She carried the bag over her shoulder.|||kind=body
arm|n|the part of the body from the shoulder to the hand|He broke his arm falling off a bike.|||kind=body
hand|n|the part at the end of the arm, with fingers and a thumb|Raise your hand if you know the answer.|||kind=body
finger|n|one of the long thin parts at the end of the hand|I cut my finger chopping onions.|digit||kind=body
back|n|the rear part of the body from the neck to the hips|My back hurts from gardening.|spine||kind=body
stomach|n|the organ where food is digested; also, the belly|My stomach is rumbling.|tummy, belly||kind=body;forms=tummy,belly
heart|n|the organ that pumps blood around the body; also, feelings|My heart was racing.|||kind=body
leg|n|one of the limbs you stand and walk on|My legs ache after the hike.|limb||kind=body
knee|n|the joint in the middle of the leg|She scraped her knee on the pavement.|||kind=body
foot|n|the part at the end of the leg that you stand on|My foot fell asleep.|||kind=body;plural=feet
toe|n|one of the five small parts at the end of the foot|I stubbed my toe on the bed.|||kind=body
skin|n|the outer covering of the body|Sunscreen protects your skin.|||kind=body;mass
hair|n|the fine threads that grow on the head and body|She cut her hair short.|||kind=body;mass
brain|n|the organ inside the head that controls thought and the body|My brain feels tired today.|mind||kind=body
headache|n|a pain in the head|I have a headache from staring at the screen.|migraine||kind=idea;nogen
cold|n|a common illness with a runny nose and sore throat|I caught a cold on the plane.|||kind=idea;nogen
flu|n|an illness like a bad cold, with fever and aching|Half the office has the flu.|influenza||mass;forms=influenza
fever|n|a body temperature that is higher than normal|The baby has a fever.|temperature||kind=idea;nogen
pain|n|the feeling you have when part of the body is hurt|The pain in my knee is getting better.|ache, hurt||kind=idea;nogen
hurt|v|to cause pain; also, to feel pain|My feet hurt after the walk.|ache, sting|heal|past=hurt;mood=-
ache|v|to feel a dull, steady pain|My back aches.|hurt, throb||mood=-
heal|v|to become healthy again, or to make someone healthy|The cut healed in a week.|recover, mend|hurt
rest|n|a time of relaxing or sleeping to recover strength|You need some rest.|break, relaxation||kind=idea;mass
sleep|n|the state of resting with your eyes closed and your mind unaware|I didn't get much sleep.|rest, slumber||kind=idea;mass
medicine|n|a substance you take to treat illness; also, the science of treating illness|Take your medicine after dinner.|medication, remedy||kind=thing;mass
gym class|n|a school lesson of physical exercise|We played basketball in gym class.|PE||kind=event;event=joy
yoga|n|exercises for the body and mind that include stretching and breathing|I do yoga on Sunday mornings.|||kind=idea;mass
walk|n|a journey on foot, especially for pleasure or exercise|Let's go for a walk after lunch.|stroll, hike||kind=event;event=joy
swim|n|a period of swimming|We had a swim before breakfast.|dip||kind=event;event=joy
nap|n|a short sleep during the day|I had a nap after lunch.|doze, snooze||kind=idea
shower|n|a spray of water you stand under to wash; also, a short fall of rain|I need a hot shower.|||kind=furniture
bath|n|a large container you sit in to wash, or the act of washing in it|I'm going to have a bath.|tub||kind=furniture
work|n|a job or the place where you do it; also, effort|I'm at work until six.|job, labor|rest, play|kind=idea;mass
homework|n|school work you do at home|I have so much homework tonight.|assignment||kind=idea;mass
chore|n|a routine job around the house, like washing up|Ironing is my least favorite chore.|task, job||kind=idea
project|n|a planned piece of work with a particular aim|Our class is doing a project on volcanoes.|plan, venture||kind=idea

# More feelings and character
blissful|adj|extremely happy and peaceful|We spent a blissful week by the sea.|serene, joyous|miserable|use=feel;mood=+
glad|adj|pleased and happy about something|I'm glad you came.|pleased, happy|sorry, sad|use=feel;mood=+
pleased|adj|happy and satisfied|She was pleased with her new haircut.|glad, content|displeased|use=feel;mood=+
overjoyed|adj|extremely happy|They were overjoyed at the news of the baby.|elated, ecstatic|devastated|use=feel;mood=+
upbeat|adj|cheerful and positive|He stayed upbeat despite the rain.|positive, cheerful|downbeat|use=feel;mood=+
comfortable|adj|physically relaxed, without pain; also, at ease|Are you comfortable in that chair?|cozy, at ease|uncomfortable|use=feel;mood=+
uncomfortable|adj|not physically relaxed; also, uneasy|I felt uncomfortable in the stiff new shoes.|awkward, uneasy|comfortable|use=feel;mood=-
rested|adj|refreshed after sleep or relaxation|I feel rested after the long weekend.|refreshed|tired|use=feel;mood=+
awake|adj|not asleep|I'm wide awake now.|alert|asleep|use=feel;mood=0
alert|adj|quick to notice things; fully awake|The coffee left me alert and ready.|attentive, awake|drowsy|use=feel;mood=+
focused|adj|giving all your attention to one thing|I feel focused this morning.|concentrated|distracted|use=feel;mood=+;forms=focussed
distracted|adj|unable to concentrate|I'm so distracted by the noise.|preoccupied|focused|use=feel;mood=-;tip=Closing a few tabs or putting the phone in another room can help.
eager|adj|wanting very much to do or have something|The kids were eager to open their presents.|keen, enthusiastic|reluctant|use=feel;mood=+
enthusiastic|adj|showing great interest and excitement|She's enthusiastic about her new job.|keen, eager|apathetic|use=feel;mood=+
keen|adj|eager and interested|I'm keen to try the new café.|eager, enthusiastic|reluctant|use=feel;mood=+
interested|adj|wanting to know more about something|I'm interested in learning Spanish.|curious, keen|uninterested, bored|use=feel;mood=+
reluctant|adj|unwilling and hesitant|He was reluctant to leave the party.|unwilling, hesitant|eager|use=feel;mood=-
hesitant|adj|unsure and slow to act or speak|She was hesitant to ask for help.|uncertain, unsure|decisive|use=feel;mood=-
unsure|adj|not certain|I'm unsure which train to take.|uncertain, doubtful|sure, certain|use=feel;mood=-
uncertain|adj|not sure; also, not yet known|I'm uncertain about the future.|unsure, doubtful|certain|use=feel;mood=-
certain|adj|completely sure|I'm certain I locked the door.|sure, positive|uncertain|use=feel;mood=+
sure|adj|confident that something is true|Are you sure about the time?|certain, confident|unsure|use=feel;mood=+
puzzled|adj|confused because you can't understand something|He looked puzzled by the instructions.|baffled, confused||use=feel;mood=-
baffled|adj|totally confused|I'm baffled by this crossword clue.|puzzled, perplexed||use=feel;mood=-
tense|adj|nervous and unable to relax; also, stretched tight|I felt tense before the meeting.|stressed, uptight|relaxed|use=feel;mood=-;tip=Dropping your shoulders and breathing out slowly can loosen it a little.
uneasy|adj|worried that something is wrong|I have an uneasy feeling about this.|anxious, troubled|calm|use=feel;mood=-
panicked|adj|suddenly very frightened and unable to think calmly|I panicked when I couldn't find my passport.|frantic, alarmed|calm|use=feel;mood=-;tip=Slow breaths first, then one step at a time.
desperate|adj|feeling that a situation is so bad you'll try anything|We were desperate for some shade.|frantic||use=feel;mood=-
helpless|adj|unable to do anything to help yourself or others|I felt helpless watching the storm.|powerless|capable|use=feel;mood=-
powerless|adj|without the ability to control or change things|I felt powerless to stop it.|helpless|powerful|use=feel;mood=-
trapped|adj|unable to escape a place or situation|I feel trapped in this job.|stuck, confined|free|use=feel;mood=-
lonesome|adj|lonely|The house felt lonesome after the kids left.|lonely||use=feel;mood=-
isolated|adj|far from others, or feeling cut off from people|I feel isolated working from home.|alone, lonely|connected|use=feel;mood=-
rejected|adj|feeling unwanted or turned down|He felt rejected when no one called back.|unwanted|accepted|use=feel;mood=-
betrayed|adj|hurt because someone you trusted let you down|She felt betrayed by her friend.|deceived||use=feel;mood=-
hurt|adj|upset by something someone said or did; also, injured|I was hurt that they didn't invite me.|wounded, upset||use=feel;mood=-
offended|adj|upset because something seemed rude or disrespectful|He was offended by the joke.|insulted|pleased|use=feel;mood=-
resentful|adj|bitter about being treated unfairly|He was resentful of the extra work.|bitter, aggrieved||use=feel;mood=-
grouchy|adj|in a bad mood and complaining|I'm grouchy when I'm tired.|grumpy, cranky|cheerful|use=feel;mood=-
irritable|adj|easily annoyed|The heat made everyone irritable.|cranky, testy|easygoing|use=feel;mood=-
exasperated|adj|very annoyed and frustrated|I'm exasperated with this slow computer.|frustrated, fed up||use=feel;mood=-
fed up|adj|annoyed and bored with something that has gone on too long|I'm fed up with the rain.|sick of, tired of||use=feel;mood=-
drained|adj|having no energy left|I feel drained after that meeting.|exhausted, worn out|energized|use=feel;mood=-;tip=Rest when you can, even ten minutes helps.
burnt out|adj|exhausted from too much work or stress over a long time|After the project I felt burnt out.|exhausted, spent|refreshed|use=feel;mood=--;forms=burned out,burnout
weary|adj|very tired|We were weary after the long journey.|tired, fatigued|fresh|use=feel;mood=-
groggy|adj|weak and confused, especially after sleep|I'm always groggy in the morning.|dazed, sleepy|alert|use=feel;mood=-;tip=Water, light and a little movement usually clear it.
dizzy|adj|feeling as if everything is spinning|I felt dizzy after the ride.|light-headed||use=feel;mood=-;tip=Sit down and have some water, and see a doctor if it keeps happening.
nauseous|adj|feeling like you might vomit|The boat made me nauseous.|queasy, sick||use=feel;mood=-;tip=Small sips of water and fresh air can help.
feverish|adj|having a fever|The baby feels feverish.|hot||use=feel;mood=-;tip=Plenty of fluids and rest, and see a doctor if it gets worse.
achy|adj|feeling dull pain all over|I feel achy after the flu shot.|sore||use=feel;mood=-
stiff|adj|hard to bend or move; also, sore after exercise|My neck is stiff this morning.|rigid, tight|supple|use=feel;mood=-
better|adj|less ill or upset than before; also, improved|I feel much better today.|improved, recovered|worse|use=feel;mood=+
worse|adj|more ill or upset than before; also, of lower quality|I feel worse than yesterday.||better|use=feel;mood=-
well|adj|in good health|I hope you're well.|healthy, fine|ill, unwell|use=feel;mood=+
meh|adj|informal: unimpressed or indifferent|I feel kind of meh today.|indifferent, so-so||use=feel;mood=0
indifferent|adj|not caring either way|He seemed indifferent to the result.|unconcerned, apathetic|interested|use=feel;mood=0
fearless|adj|not afraid of anything|The fearless kid jumped straight in.|brave, bold|timid|use=trait
bold|adj|confident and willing to take risks; also, strong in color|That was a bold decision.|daring, brave|timid|use=trait
timid|adj|shy and easily frightened|The timid puppy hid behind the sofa.|shy, nervous|bold|use=trait
cautious|adj|careful to avoid danger or mistakes|She's a cautious driver.|careful, wary|reckless|use=trait
careful|adj|taking care to avoid mistakes or harm|Be careful on the stairs.|cautious, attentive|careless|use=trait
careless|adj|not giving enough attention to avoid mistakes|It was careless of me to leave the door open.|sloppy, negligent|careful|use=trait
reckless|adj|doing dangerous things without thinking about the results|Reckless driving causes accidents.|rash, careless|cautious|use=trait
easygoing|adj|relaxed and not easily upset|My roommate is very easygoing.|laid-back, relaxed|uptight|use=trait;forms=easy-going
laid-back|adj|relaxed and calm|He has a laid-back attitude to deadlines.|easygoing, relaxed|uptight|use=trait;forms=laid back
optimist|n|a person who expects good things to happen|She's an optimist even on rainy days.||pessimist|kind=person
pessimist|n|a person who expects bad things to happen|Don't be such a pessimist.||optimist|kind=person
pessimistic|adj|expecting bad things to happen|He's pessimistic about the weather.|gloomy, negative|optimistic|use=feel;mood=-
positive|adj|hopeful and confident; also, sure; also, greater than zero|Try to stay positive.|optimistic, hopeful|negative|use=feel;mood=+
negative|adj|seeing the bad side of things; also, less than zero|Don't be so negative.|pessimistic|positive|use=feel;mood=-
sensible|adj|having good judgment|That's a sensible plan.|wise, practical|foolish|use=trait
foolish|adj|lacking good sense|It was foolish to go out without a coat.|silly, unwise|wise|use=trait
clumsy|adj|moving awkwardly and often dropping or bumping into things|I'm so clumsy, I spilled it again.|awkward, bumbling|graceful|use=trait
graceful|adj|moving in a smooth, elegant way|The dancer was graceful.|elegant, poised|clumsy|use=trait
modest|adj|not talking much about your own achievements|She's modest about her prize.|humble|boastful|use=trait
arrogant|adj|believing you are better than others|He's too arrogant to ask for help.|conceited, proud|humble|use=trait
selfish|adj|caring only about yourself|It was selfish to eat the last slice.|self-centered|generous|use=trait
considerate|adj|thinking about other people's feelings|It was considerate of you to call.|thoughtful, kind|inconsiderate|use=trait
respectful|adj|showing respect|The students were respectful during the talk.|polite, courteous|disrespectful|use=trait
mean|adj|unkind; also, unwilling to share|That was a mean thing to say.|unkind, nasty|kind|use=trait
nasty|adj|very unpleasant or unkind|He has a nasty cold.|horrible, mean|nice|mood=-
cruel|adj|causing pain or suffering on purpose|It's cruel to tease the cat.|heartless, vicious|kind|use=trait
sincere|adj|meaning what you say|Her apology was sincere.|genuine, honest|insincere|use=trait
trustworthy|adj|able to be trusted|He's the most trustworthy person I know.|reliable, honest|untrustworthy|use=trait
talented|adj|having a natural ability to do something well|She's a talented painter.|gifted, skilled||use=trait
skilled|adj|having the training and experience to do something well|He's a skilled carpenter.|expert, capable|unskilled|use=trait
intelligent|adj|able to learn, understand and think well|Dolphins are intelligent animals.|clever, smart|stupid|use=trait
adventurous|adj|eager to try new and exciting things|She's adventurous and loves trying new food.|daring, bold|cautious|use=trait
lively|adj|full of energy and enthusiasm|It was a lively party.|energetic, vibrant|dull|use=trait
talkative|adj|liking to talk a lot|Our taxi driver was very talkative.|chatty|quiet|use=trait
chatty|adj|liking to chat in a friendly way|The baker is always chatty in the morning.|talkative|quiet|use=trait
helpful|adj|willing to help; also, useful|The staff were very helpful.|useful, obliging|unhelpful|use=trait
supportive|adj|giving help and encouragement|My family is very supportive.|encouraging, helpful||use=trait
independent|adj|not needing help from others|She's very independent for her age.|self-reliant|dependent|use=trait
responsible|adj|reliable and sensible; also, in charge of something|He's responsible for the keys.|dependable, accountable|irresponsible|use=trait
mature|adj|behaving in a sensible, adult way; also, fully grown|She's very mature for twelve.|grown-up, sensible|childish|use=trait
childish|adj|silly in a way that suits a child, not an adult|Stop being childish.|immature, silly|mature|use=trait
organized|adj|neat and well planned|She's the most organized person in the office.|orderly, methodical|disorganized|use=trait;forms=organised
punctual|adj|arriving or doing things at the expected time|He's always punctual.|on time, prompt|late|use=trait
forgetful|adj|often forgetting things|I'm so forgetful, I left my keys again.|absent-minded|mindful|use=trait
nosy|adj|too interested in other people's business|Our nosy neighbor watches from the window.|prying, inquisitive||use=trait;forms=nosey

# Family, groups and jobs
fiance|n|the person someone is engaged to marry|Her fiance is a chef.|betrothed||kind=person;rel;forms=fiancé,fiancee,fiancée
spouse|n|a husband or wife|Spouses are welcome at the dinner.|husband, wife, partner||kind=person;rel
stepmother|n|the wife of your father, who is not your mother|My stepmother taught me to drive.|stepmom||kind=person;rel;forms=stepmom
stepfather|n|the husband of your mother, who is not your father|My stepfather loves fishing.|stepdad||kind=person;rel;forms=stepdad
twin|n|one of two children born to the same mother at the same time|My twin and I share a birthday.|||kind=person;rel
godmother|n|a woman who promises to help guide a child, especially in religious matters|My godmother sends me a book every birthday.|||kind=person;rel
in-laws|n|the parents and relatives of your husband or wife|We're spending the holidays with my in-laws.|||kind=person;mass;forms=in laws
relative|n|a member of your family|We have relatives coming for dinner.|relation, family member||kind=person
ancestor|n|a person in your family who lived long before you|My ancestors were farmers.|forebear|descendant|kind=person
neighbour|n|a person who lives next door or nearby|Our neighbour lent us a ladder.|||nogen
best friend|n|your closest friend|My best friend lives across town.|bestie||kind=person;rel;forms=bff,bestie
pal|n|informal: a friend|He's an old pal from school.|friend, buddy, mate||kind=person;rel
acquaintance|n|a person you know a little but not well|She's more of an acquaintance than a friend.|||kind=person
crowd|n|a large group of people together|A crowd gathered to watch the parade.|throng, mob||kind=idea
team|n|a group of people who work or play together|Our team won the match.|squad, group||kind=idea
group|n|a number of people or things together|A group of us went hiking.|band, set||kind=idea
club|n|a group of people who meet for a shared interest; also, a heavy stick|I joined a book club.|society, association||kind=idea
community|n|the people living in one place, or a group with something in common|The whole community helped clean the park.|neighborhood, society||kind=idea;plural=communities
audience|n|the people watching or listening to a performance|The audience clapped for five minutes.|crowd, spectators||kind=idea
volunteer|n|a person who offers to work without being paid|Volunteers cleaned the beach.|helper||kind=person
leader|n|a person who leads a group|She's a natural leader.|head, chief|follower|kind=person
expert|n|a person with great knowledge or skill in something|Ask an expert about the roof.|specialist, authority|beginner|kind=person
beginner|n|a person who is just starting to learn something|This class is for beginners.|novice, learner|expert|kind=person
champion|n|a person or team that has won a competition|She's the chess champion.|winner, victor|loser|kind=person
winner|n|a person or team that wins|The winner gets a trophy.|victor, champion|loser|kind=person
fan|n|a person who admires someone or something very much; also, a machine that moves air|I'm a big fan of her books.|admirer, supporter||kind=person
genius|n|a very clever or talented person|She's a genius with numbers.|prodigy||kind=person;plural=geniuses
celebrity|n|a famous person|A celebrity was spotted in the café.|star||kind=person;plural=celebrities
villain|n|a bad character in a story|The villain stole the crown.|baddie|hero|kind=person
princess|n|a daughter of a king or queen|The princess rode through the town.|||kind=person;plural=princesses;nogen
prince|n|a son of a king or queen|The prince waved from the carriage.|||kind=person;nogen
wizard|n|a man in stories who has magic powers|The wizard cast a spell.|sorcerer, magician||kind=person
witch|n|a woman in stories who has magic powers|The witch flew over the moon.|sorceress||kind=person;plural=witches
ghost|n|the spirit of a dead person that some people believe can be seen|The castle is said to have a ghost.|spirit, phantom||kind=person
pirate|n|a person who attacks and robs ships at sea|The pirate buried his treasure.|buccaneer||kind=person
astronaut|n|a person trained to travel into space|The astronaut floated in the space station.|cosmonaut||kind=person
vet|n|a doctor for animals|We took the dog to the vet.|veterinarian||kind=person;forms=veterinarian
pharmacist|n|a person trained to prepare and sell medicines|The pharmacist explained how to take the pills.|chemist||kind=person
surgeon|n|a doctor who performs operations|The surgeon washed her hands.|||kind=person
therapist|n|a person trained to help with mental or physical problems through talking or treatment|Talking to a therapist really helped.|counselor||kind=person
counselor|n|a person trained to listen and give advice about problems|The school counselor was easy to talk to.|adviser, therapist||kind=person;forms=counsellor
paramedic|n|a person trained to give emergency medical care|The paramedic checked his pulse.|||kind=person
police officer|n|a member of the police|A police officer helped us find the station.|cop, officer||kind=person;forms=cop,policeman,policewoman
detective|n|a person whose job is to solve crimes|The detective found a clue.|investigator||kind=person
judge|n|a person who decides cases in a court of law, or who decides who wins a competition|The judge read the verdict.|||kind=person
soldier|n|a member of an army|The soldier stood at the gate.|||kind=person
sailor|n|a person who works on a ship or sails a boat|The sailor tied a knot.|seaman||kind=person
fisherman|n|a person who catches fish, as a job or for fun|The fisherman mended his nets.|angler||kind=person;plural=fishermen
gardener|n|a person who looks after a garden|The gardener planted roses.|||kind=person
carpenter|n|a person who makes and repairs things made of wood|The carpenter built us a bookcase.|woodworker||kind=person
electrician|n|a person who fits and repairs electrical wiring|The electrician fixed the lights.|||kind=person
builder|n|a person who builds houses and other buildings|The builders finished the roof.|||kind=person
architect|n|a person who designs buildings|The architect drew plans for the library.|designer||kind=person
librarian|n|a person who works in a library|The librarian found the book for me.|||kind=person
professor|n|a senior teacher at a university|The professor gave a lecture on history.|lecturer||kind=person
principal|n|the head of a school|The principal gave a speech at assembly.|headteacher||kind=person
tutor|n|a private teacher|My tutor helps me with math.|teacher, coach||kind=person
babysitter|n|a person who looks after children while their parents are out|The babysitter read them a story.|sitter, nanny||kind=person
nanny|n|a person employed to look after children in their home|The nanny took the kids to the park.|babysitter||kind=person;plural=nannies
receptionist|n|a person who greets visitors and answers phones in an office or hotel|The receptionist gave us our room keys.|||kind=person
secretary|n|a person who types letters, keeps records and arranges appointments|Ask the secretary for a form.|assistant||kind=person;plural=secretaries
accountant|n|a person whose job is to keep or check financial accounts|Our accountant does the taxes.|||kind=person
banker|n|a person who works for a bank|The banker approved the loan.|||kind=person
salesperson|n|a person whose job is selling things|The salesperson showed us three sofas.|seller, clerk||kind=person
shopkeeper|n|a person who owns or runs a shop|The shopkeeper knew everyone by name.|merchant||kind=person
cook|n|a person who prepares food|My uncle is a great cook.|chef||kind=person
butcher|n|a person who cuts and sells meat|The butcher wrapped the sausages.|||kind=person
journalist|n|a person who writes news for newspapers, magazines, TV or websites|The journalist interviewed the mayor.|reporter||kind=person
reporter|n|a person who reports news|A reporter stood outside in the rain.|journalist||kind=person
photographer|n|a person who takes photographs|The photographer asked us to smile.|||kind=person
painter|n|an artist who paints pictures; also, a person who paints walls|The painter set up her easel by the river.|artist||kind=person
dancer|n|a person who dances|The dancer spun across the stage.|ballerina||kind=person
poet|n|a person who writes poems|The poet read from her new book.|||kind=person
comedian|n|a person whose job is making people laugh|The comedian had the whole room laughing.|comic||kind=person
magician|n|a person who performs magic tricks|The magician pulled a coin from my ear.|conjurer||kind=person
clown|n|a performer who wears funny clothes and makeup to make people laugh|The clown juggled at the party.|jester||kind=person
captain|n|the person in charge of a ship, plane or team|The captain welcomed us aboard.|skipper, leader||kind=person
flight attendant|n|a person who looks after passengers on a plane|The flight attendant brought us water.|steward, stewardess||kind=person
mail carrier|n|a person who delivers letters and parcels|The mail carrier waved as she passed.|postman, mailman||kind=person;forms=postman,mailman,postwoman
delivery driver|n|a person who delivers goods to homes and businesses|The delivery driver left the parcel at the door.|courier||kind=person;forms=courier
cleaner|n|a person whose job is cleaning|The cleaner comes on Tuesdays.|||kind=person
janitor|n|a person who looks after a building and keeps it clean|The janitor unlocked the gym.|caretaker||kind=person
security guard|n|a person paid to protect a building or people|The security guard checked our bags.|guard||kind=person
lifeguard|n|a person who watches swimmers and rescues people in danger|The lifeguard blew her whistle.|||kind=person
intern|n|a student or trainee who works, sometimes without pay, to gain experience|The intern made great coffee.|trainee, apprentice||kind=person
freelancer|n|a person who works for several companies rather than one employer|As a freelancer, she sets her own hours.|contractor||kind=person
entrepreneur|n|a person who starts a business|The entrepreneur opened her third café.|founder||kind=person
owner|n|a person who owns something|The owner of the dog came running.|||kind=person
farmer's market|n|a market where farmers sell food directly to people|We buy eggs at the farmer's market.|||kind=place;at=at;forms=farmers market

# More animals, and plants
alpaca|n|a South American animal like a small llama, kept for its soft wool|The alpaca peered over the fence.|||kind=animal
llama|n|a South American animal with a long neck, used for carrying loads and for wool|The llama carried our bags up the trail.|||kind=animal
camel|n|a large desert animal with one or two humps|The camel knelt so we could climb on.|dromedary||kind=animal
hippo|n|a hippopotamus: a huge African animal that lives near rivers|A hippo yawned in the river.|hippopotamus||kind=animal;forms=hippopotamus
rhino|n|a rhinoceros: a large, heavy animal with one or two horns on its nose|The rhino charged across the plain.|rhinoceros||kind=animal;forms=rhinoceros
cheetah|n|a wild cat with spots, the fastest land animal|The cheetah sprinted after the gazelle.|||kind=animal
leopard|n|a large wild cat with spots that climbs trees|A leopard rested on a branch.|||kind=animal
jaguar|n|a large wild cat with spots, from Central and South America|A jaguar swam across the river.|||kind=animal
panther|n|a black leopard or jaguar|The panther slipped into the shadows.|||kind=animal
fawn|n|a young deer|A fawn hid in the long grass.|||kind=animal
moose|n|a very large deer with wide flat antlers|A moose stood in the middle of the road.|elk||kind=animal;plural=moose
raccoon|n|an animal with a striped tail and dark markings around its eyes|A raccoon tipped over our bin.|||kind=animal
skunk|n|a black and white animal that sprays a bad smell when threatened|The dog came back smelling of skunk.|||kind=animal
badger|n|an animal with a striped face that digs burrows|A badger crossed the lane at night.|||kind=animal
otter|n|a playful animal that swims in rivers and the sea|An otter floated on its back.|||kind=animal
beaver|n|an animal with a flat tail that builds dams across rivers|The beaver gnawed through the branch.|||kind=animal
mole|n|a small animal that digs tunnels underground; also, a dark spot on the skin|A mole dug up the lawn.|||kind=animal
seal|n|a sea animal with flippers that lives partly on land|A seal barked from the rocks.|sea lion||kind=animal
walrus|n|a large sea animal with long tusks|The walrus lay on the ice.|||kind=animal;plural=walruses
polar bear|n|a large white bear that lives in the Arctic|A polar bear hunted on the sea ice.|||kind=animal
jellyfish|n|a soft, see-through sea animal that can sting|A jellyfish washed up on the beach.|||kind=animal;plural=jellyfish
starfish|n|a sea animal shaped like a star|We found a starfish in a rock pool.|sea star||kind=animal;plural=starfish
lobster|n|a sea animal with a hard shell and large claws|The lobster was bright red when cooked.|||kind=animal
shrimp|n|a small sea animal with a long tail, eaten as food|We had shrimp on the barbecue.|prawn||kind=animal;plural=shrimp;forms=prawn
clam|n|a shellfish with two shells that close tightly|We dug for clams at low tide.|||kind=animal
salmon|n|a large fish with pink flesh that swims up rivers to lay eggs|Salmon leapt up the waterfall.|||kind=animal;plural=salmon
tuna|n|a large sea fish used as food|We had tuna sandwiches.|||kind=animal;plural=tuna
seahorse|n|a small fish with a head shaped like a horse's|A seahorse clung to the seaweed.|||kind=animal
hawk|n|a bird of prey with sharp claws and a hooked beak|A hawk circled over the field.|falcon||kind=animal
falcon|n|a fast bird of prey|The falcon dived at great speed.|hawk||kind=animal
vulture|n|a large bird that eats dead animals|Vultures circled overhead.|buzzard||kind=animal
peacock|n|a large bird; the male has a long, colorful tail|The peacock spread its tail.|peafowl||kind=animal
flamingo|n|a tall pink bird with long legs|A flamingo stood on one leg.|||kind=animal;plural=flamingos
ostrich|n|a very large bird that can't fly but runs fast|The ostrich ran faster than the car.|||kind=animal;plural=ostriches
hummingbird|n|a tiny bird that hovers and beats its wings very fast|A hummingbird hovered at the feeder.|||kind=animal
robin|n|a small bird with a red or orange breast|A robin sang from the fence.|||kind=animal
sparrow|n|a small brown bird, common in towns|Sparrows hopped around the café tables.|||kind=animal
seagull|n|a large white and gray sea bird|A seagull stole my chips.|gull||kind=animal;forms=gull
woodpecker|n|a bird that taps holes in trees with its beak|We heard a woodpecker in the forest.|||kind=animal
turkey|n|a large bird raised for its meat|We roasted a turkey for the holiday.|||kind=animal
rooster|n|an adult male chicken|The rooster crowed at dawn.|cockerel||kind=animal
hen|n|a female chicken|The hen laid an egg.|chicken||kind=animal
chick|n|a baby bird, especially a baby chicken|The chicks followed their mother.|||kind=animal
duckling|n|a baby duck|Five ducklings swam behind their mother.|||kind=animal
calf|n|a young cow; also, the back of the lower leg|The calf stayed close to its mother.|||kind=animal;plural=calves
foal|n|a young horse|The foal wobbled on its long legs.|colt||kind=animal
pony|n|a small horse|The kids took turns riding the pony.|||kind=animal;plural=ponies
bull|n|an adult male cow|The bull stood in the middle of the field.|||kind=animal
ox|n|a cow or bull used for pulling heavy loads|The ox pulled the cart.|||kind=animal;plural=oxen
gerbil|n|a small rodent with long back legs, often kept as a pet|Our gerbil hides in its tunnel.|||kind=animal
guinea pig|n|a small furry rodent with no tail, often kept as a pet|The guinea pig squeaked for lettuce.|cavy||kind=animal
ferret|n|a small, thin, playful animal sometimes kept as a pet|The ferret stole my sock.|||kind=animal
tortoise|n|a slow land reptile with a hard shell|The tortoise munched a strawberry.|turtle||kind=animal
chameleon|n|a lizard that can change its color|The chameleon turned green on the leaf.|||kind=animal
gecko|n|a small lizard that can climb walls|A gecko ran up the wall.|||kind=animal;plural=geckos
iguana|n|a large tropical lizard|An iguana sunned itself on the rock.|||kind=animal
toad|n|an animal like a frog with dry, bumpy skin|A toad sat by the pond.|frog||kind=animal
tadpole|n|a young frog or toad that lives in water and has a tail|The pond was full of tadpoles.|||kind=animal
beetle|n|an insect with hard wing covers|A beetle crawled across the path.|||kind=animal
caterpillar|n|the young form of a butterfly or moth, like a small worm|The caterpillar munched a leaf.|||kind=animal
moth|n|an insect like a butterfly that usually flies at night|A moth fluttered around the lamp.|||kind=animal
dragonfly|n|an insect with a long body and two pairs of clear wings|A dragonfly hovered over the pond.|||kind=animal;plural=dragonflies
wasp|n|a flying insect with a sting and yellow and black stripes|A wasp buzzed around the jam.|hornet||kind=animal
grasshopper|n|a jumping insect that makes a chirping sound|A grasshopper leapt out of the grass.|cricket||kind=animal
firefly|n|a beetle whose tail glows in the dark|Fireflies blinked in the garden.|lightning bug||kind=animal;plural=fireflies
scorpion|n|a small creature with claws and a curved stinging tail|A scorpion hid under the rock.|||kind=animal
unicorn|n|an imaginary horse with a single horn on its forehead|The story was about a lost unicorn.|||kind=animal
dragon|n|an imaginary creature like a large lizard with wings that breathes fire|The dragon guarded the treasure.|||kind=animal
rose|n|a flower with a sweet smell and thorny stems|He gave her a red rose.|||kind=thing
tulip|n|a brightly colored cup-shaped flower that grows from a bulb|The tulips came up in April.|||kind=thing
daisy|n|a small flower with white petals and a yellow center|She made a chain of daisies.|||kind=thing;plural=daisies
sunflower|n|a very tall plant with a large yellow flower|The sunflower was taller than me.|||kind=thing
lily|n|a flower with large, often trumpet-shaped petals|A lily floated on the pond.|||kind=thing;plural=lilies
daffodil|n|a yellow flower with a trumpet shape that blooms in spring|Daffodils lined the path.|||kind=thing
lavender|n|a plant with small purple flowers and a sweet smell|The garden smelled of lavender.|||kind=thing;mass
cactus|n|a desert plant with a thick stem and spines instead of leaves|A cactus sits on my windowsill.|||kind=thing;plural=cacti;forms=cactuses
fern|n|a green plant with feathery leaves and no flowers|Ferns grew in the shade.|bracken||kind=thing
moss|n|a small, soft green plant that grows on stones and trees|Moss covered the old wall.|lichen||kind=nature;mass
weed|n|a wild plant growing where it isn't wanted|I spent the morning pulling weeds.|||kind=thing
bush|n|a plant like a small tree with many branches|A bird nested in the bush.|shrub, hedge||kind=nature;plural=bushes
hedge|n|a line of bushes forming a fence|The rabbit ran into the hedge.|||kind=nature
oak|n|a large tree that produces acorns|An old oak stands in the park.|||kind=nature
pine|n|an evergreen tree with needle-shaped leaves|The air smelled of pine.|fir||kind=nature
palm|n|a tropical tree with large leaves at the top of a tall trunk; also, the inside of your hand|We sat under a palm on the beach.|palm tree||kind=nature
maple|n|a tree with leaves that have five points, some giving a sweet syrup|The maple turned bright red in autumn.|||kind=nature
willow|n|a tree with long, thin branches that hang down, often near water|A willow trailed its branches in the river.|||kind=nature
bamboo|n|a tall tropical grass with hard hollow stems|The panda ate bamboo all day.|||kind=nature;mass
seed|n|a small part of a plant from which a new plant grows|We planted sunflower seeds.|pip, kernel||kind=thing
root|n|the part of a plant that grows underground|The tree's roots cracked the path.|||kind=nature
branch|n|a part of a tree that grows out from the trunk|A squirrel ran along the branch.|bough, limb||kind=nature;plural=branches
petal|n|one of the colored parts of a flower|A petal fell into my tea.|||kind=thing
thorn|n|a sharp point on a plant's stem|I pricked my finger on a thorn.|prickle, spine||kind=thing
acorn|n|the nut of an oak tree|The squirrel buried an acorn.|||kind=thing
pinecone|n|the hard, scaly fruit of a pine tree|The kids collected pinecones.|cone||kind=thing;forms=pine cone

# More food and drink
hot dog|n|a sausage served in a long bread roll|We had hot dogs at the game.|frankfurter||kind=food
wrap|n|a soft flatbread rolled around a filling|I had a chicken wrap for lunch.|||kind=food
quesadilla|n|a tortilla filled with cheese and folded, then toasted|She made quesadillas for the kids.|||kind=food
nachos|n|tortilla chips covered with melted cheese and toppings|We shared a plate of nachos.|||kind=food;mass
tortilla|n|a thin, flat round bread made from corn or wheat|Warm the tortillas in a pan.|flatbread||kind=food
lasagna|n|layers of flat pasta baked with sauce and cheese|Grandma's lasagna feeds ten people.|||kind=food;mass;forms=lasagne
ramen|n|a Japanese dish of noodles in a hot broth|We slurped ramen on a rainy night.|||kind=food;mass
risotto|n|an Italian dish of rice cooked slowly in broth|He stirred the risotto for twenty minutes.|||kind=food;mass
omelet|n|beaten eggs cooked flat in a pan, often folded around a filling|I had a cheese omelet for breakfast.|||kind=food;forms=omelette
scrambled eggs|n|eggs beaten and stirred as they cook|We had scrambled eggs on toast.|||kind=food;mass
porridge|n|oats cooked in water or milk|A bowl of porridge warms you up.|oatmeal||kind=food;mass;nogen
granola|n|a breakfast food of baked oats, nuts and dried fruit|I sprinkled granola on my yogurt.|muesli||kind=food;mass
syrup|n|a thick sweet liquid|Pour some syrup on your pancakes.|||kind=food;mass
honeycomb|n|the wax structure that bees make to store honey|We ate honey straight from the honeycomb.|||kind=food
biscuit|n|a small, flat, dry baked food, usually sweet; in American English, a soft bread roll|Have a biscuit with your tea.|cookie, cracker||kind=food
cracker|n|a thin, crisp, dry biscuit, often eaten with cheese|She put cheese on a cracker.|biscuit||kind=food
pretzel|n|a crisp or soft salted bread twisted into a knot|We bought a warm pretzel at the market.|||kind=food
roll|n|a small round loaf of bread for one person|Butter the rolls while they're warm.|bun||kind=food
bun|n|a small round bread roll, often sweet|He ate a cinnamon bun on the train.|roll||kind=food
loaf|n|bread shaped and baked in one piece|She baked a loaf of rye bread.|||kind=food;plural=loaves
pastry|n|dough made from flour, fat and water, baked for pies; also, a sweet baked cake|The bakery's pastries sell out early.|||kind=food;plural=pastries
tart|n|a pastry case filled with fruit or another filling|She made a lemon tart.|pie||kind=food
cheesecake|n|a rich cake made with soft cheese on a biscuit base|We shared a slice of cheesecake.|||kind=food
pudding|n|a sweet, soft dessert; in British English, any dessert|We had chocolate pudding.|dessert||kind=food
custard|n|a sweet sauce or dessert made with milk and eggs|Pour custard over the pie.|||kind=food;mass
jelly|n|a sweet, wobbly dessert; in American English, also jam|The kids love strawberry jelly.|jello, jam||kind=food;mass
marshmallow|n|a soft, spongy sweet|We toasted marshmallows over the fire.|||kind=food
lollipop|n|a hard sweet on a stick|The doctor gave her a lollipop.|lolly||kind=food
gum|n|a sweet you chew but don't swallow|He offered me a piece of gum.|chewing gum||kind=food;mass
caramel|n|sugar heated until brown, used as a sweet or sauce|The apples were dipped in caramel.|toffee||kind=food;mass
vanilla|n|a flavoring made from the pod of a tropical plant|I'll have vanilla ice cream.|||kind=food;mass
cinnamon|n|a sweet brown spice made from tree bark|Sprinkle cinnamon on the toast.|||kind=food;mass
ginger|n|a hot-tasting root used in cooking|Ginger tea is good for a cold.|||kind=food;mass
spice|n|a dried part of a plant used to flavor food|Cumin is my favorite spice.|seasoning||kind=food
herb|n|a plant whose leaves are used to flavor food or as medicine|Add fresh herbs at the end.|||kind=food
basil|n|a fragrant herb used in Italian cooking|Tear some basil over the pasta.|||kind=food;mass
mint|n|a herb with a fresh, cool taste; also, a sweet with that taste|She added mint to the lemonade.|peppermint||kind=food;mass
parsley|n|a herb with curly or flat green leaves|Chop some parsley for the soup.|||kind=food;mass
olive|n|a small green or black fruit eaten whole or pressed for oil|I don't like olives on pizza.|||kind=food
oil|n|a thick liquid from plants or animals, used in cooking; also, fuel|Fry the onions in a little oil.|||kind=food;mass
vinegar|n|a sour liquid used to flavor or preserve food|Add a splash of vinegar to the salad.|||kind=food;mass
ketchup|n|a thick sauce made from tomatoes|He puts ketchup on everything.|tomato sauce||kind=food;mass
mustard|n|a hot yellow or brown sauce made from seeds|I'd like mustard on my hot dog.|||kind=food;mass
mayonnaise|n|a thick, creamy sauce made from eggs and oil|Spread mayonnaise on the bread.|mayo||kind=food;mass;forms=mayo
gravy|n|a sauce made from the juices of cooked meat|Pour gravy over the potatoes.|sauce||kind=food;mass
salsa|n|a spicy sauce of chopped tomatoes, onions and peppers; also, a dance|We dipped chips in salsa.|||kind=food;mass
hummus|n|a creamy dip made from chickpeas|We had hummus with warm bread.|||kind=food;mass
cream|n|the thick fatty part of milk|Would you like cream in your coffee?|||kind=food;mass
cottage cheese|n|soft, lumpy white cheese|I had cottage cheese with fruit.|||kind=food;mass
beef|n|meat from a cow|We had beef stew for dinner.|||kind=food;mass
pork|n|meat from a pig|The pork was roasted with apples.|||kind=food;mass
ham|n|meat from a pig's leg, salted or smoked|I made ham sandwiches.|||kind=food;mass
meatball|n|a small ball of minced meat|We had spaghetti and meatballs.|||kind=food
stew|n|meat or vegetables cooked slowly in liquid|A pot of stew simmered all afternoon.|casserole||kind=food;mass
chili|n|a hot pepper; also, a spicy stew of beans and meat|She made a big pot of chili.|||kind=food;mass;forms=chilli
kebab|n|pieces of meat or vegetables cooked on a stick|We grilled kebabs on the beach.|skewer||kind=food;forms=kabob
fish and chips|n|fried fish served with fried potatoes|We ate fish and chips on the pier.|||kind=food;mass
dim sum|n|small Chinese dishes, often steamed dumplings, eaten together|We had dim sum on Sunday.|||kind=food;mass
falafel|n|fried balls of ground chickpeas, often in pita bread|I had a falafel wrap.|||kind=food
pita|n|a flat bread that opens to make a pocket|Stuff the pita with salad.|pitta||kind=food;forms=pitta
apricot|n|a small orange fruit like a peach|She made apricot jam.|||kind=food
plum|n|a soft, round fruit with smooth purple or red skin and a stone|The plums are ripe.|||kind=food
kiwi|n|a small fruit with brown hairy skin and green flesh|I cut a kiwi in half and ate it with a spoon.|kiwifruit||kind=food
melon|n|a large round fruit with a hard skin and sweet juicy flesh|We had melon for breakfast.|cantaloupe||kind=food
raspberry|n|a soft red berry|She picked raspberries in the garden.|||kind=food;plural=raspberries
blackberry|n|a soft dark purple berry that grows on brambles|We picked blackberries on the walk.|bramble||kind=food;plural=blackberries
cranberry|n|a small, sour red berry|We had cranberry sauce with the turkey.|||kind=food;plural=cranberries
fig|n|a soft sweet fruit full of tiny seeds|Figs are lovely with cheese.|||kind=food
pomegranate|n|a round fruit with a hard red skin and many juicy seeds|Sprinkle pomegranate seeds on the salad.|||kind=food
papaya|n|a large tropical fruit with orange flesh and black seeds|The papaya was sweet and soft.|||kind=food
grapefruit|n|a large sour citrus fruit|She has half a grapefruit for breakfast.|||kind=food
tangerine|n|a small, sweet, easy-to-peel orange|He put a tangerine in my lunchbox.|mandarin, clementine||kind=food;forms=mandarin,clementine
raisin|n|a dried grape|There are raisins in the muffins.|||kind=food
almond|n|a flat oval nut|She snacks on almonds.|||kind=food
walnut|n|a wrinkled nut in a hard round shell|Add walnuts to the brownies.|||kind=food
cashew|n|a curved nut|He ate a handful of cashews.|||kind=food
pea|n|a small round green seed eaten as a vegetable|The kids hid their peas under the potato.|||kind=food
chickpea|n|a round, pale bean used in hummus and curries|She roasted chickpeas with spices.|garbanzo||kind=food
lentil|n|a small flat seed cooked in soups and stews|We made lentil soup.|||kind=food
cabbage|n|a large round vegetable with tightly packed leaves|She shredded cabbage for the slaw.|||kind=food
cauliflower|n|a vegetable with a large white head of tight flowers|Roast the cauliflower until golden.|||kind=food
celery|n|a vegetable with long, crisp, pale green stalks|Dip the celery in peanut butter.|||kind=food;mass
asparagus|n|a vegetable with long green spears|We grilled asparagus with lemon.|||kind=food;mass
zucchini|n|a long green vegetable like a small marrow|Slice the zucchini thinly.|courgette||kind=food;forms=courgette
eggplant|n|a vegetable with smooth, dark purple skin|She baked eggplant with cheese.|aubergine||kind=food;forms=aubergine
pumpkin|n|a large round orange vegetable with a hard skin|We carved a pumpkin for Halloween.|squash||kind=food
sweet potato|n|a root vegetable with orange flesh and a sweet taste|She baked sweet potatoes for dinner.|yam||kind=food;plural=sweet potatoes
beet|n|a dark red root vegetable|The beet stained my fingers purple.|beetroot||kind=food;forms=beetroot
radish|n|a small, crisp red root with a sharp taste|She sliced radishes into the salad.|||kind=food;plural=radishes
kale|n|a leafy green vegetable like cabbage|He blends kale into his smoothies.|||kind=food;mass
leek|n|a long vegetable like an onion, with layers of leaves|We made leek and potato soup.|||kind=food
seaweed|n|plants that grow in the sea, some eaten as food|Sushi is wrapped in seaweed.|kelp||kind=food;mass
tofu|n|a soft food made from soybeans|She stir-fried tofu with vegetables.|bean curd||kind=food;mass
rice cake|n|a light, crisp cake of puffed rice|He snacks on rice cakes.|||kind=food
cocoa|n|a powder made from cacao beans; also, a hot chocolate drink|We drank cocoa by the fire.|hot chocolate||kind=food;mass;forms=hot chocolate
tea bag|n|a small paper bag holding tea leaves|Leave the tea bag in for three minutes.|||kind=thing
espresso|n|strong coffee made by forcing steam through ground beans|She ordered a double espresso.|||kind=food;mass
latte|n|coffee made with a lot of steamed milk|I'll have an oat milk latte.|||kind=food
cappuccino|n|coffee topped with foamy milk|He drew a heart in the cappuccino foam.|||kind=food
milkshake|n|a cold drink of milk blended with ice cream or flavoring|We shared a chocolate milkshake.|shake||kind=food
cola|n|a sweet, dark, fizzy drink|He ordered a cola with ice.|soda||kind=food;mass
wine|n|an alcoholic drink made from grapes|They opened a bottle of wine.|||kind=food;mass
beer|n|an alcoholic drink made from grain and hops|He had a beer after work.|ale, lager||kind=food;mass
broth|n|a thin soup made by boiling meat, fish or vegetables in water|Sip some warm broth.|stock||kind=food;mass
leftovers|n|food that wasn't eaten at a meal and is kept for later|We had leftovers for lunch.|||kind=food;mass
takeout|n|a cooked meal bought to eat at home|Let's get takeout tonight.|takeaway||kind=food;mass;forms=takeaway,take-out
brunch|n|a late morning meal that combines breakfast and lunch|We met for brunch on Sunday.|||kind=food;mass
feast|n|a large, special meal for many people|The wedding feast went on for hours.|banquet||kind=event;event=joy
barbecue|n|a meal cooked outdoors over a fire or grill; also, the grill|We're having a barbecue on Saturday.|cookout, BBQ||kind=event;event=joy;forms=bbq,barbeque
bake sale|n|an event where people sell homemade cakes and cookies to raise money|The school bake sale raised two hundred dollars.|||kind=event;event=joy
dinner party|n|a party where guests are invited to dinner|We're hosting a dinner party on Friday.|||kind=event;event=joy
appetite|n|the feeling of wanting to eat|The walk gave me an appetite.|hunger||kind=idea
hunger|n|the feeling of needing food|Hunger kept him awake.|appetite||kind=idea;mass
flavor|n|the taste of food or drink|This soup has a lovely flavor.|taste||kind=idea;forms=flavour
slice|n|a thin, flat piece cut from something larger|Can I have a slice of cake?|piece||kind=food;nogen
crumb|n|a very small piece of bread or cake|There are crumbs all over the sofa.|||kind=thing

# Home, clothes, tools and tech
armchair|n|a comfortable chair with supports for your arms|Grandpa dozed in his armchair.|easy chair||kind=furniture
bench|n|a long seat for several people|We sat on a bench in the park.|seat||kind=furniture;plural=benches
stool|n|a seat without a back or arms|She perched on a stool at the counter.|||kind=furniture
cupboard|n|a piece of furniture or a small space with doors and shelves for storing things|The cups are in the cupboard.|cabinet, closet||kind=furniture
closet|n|a small room or cupboard for storing clothes or other things|Hang your coat in the closet.|wardrobe, cupboard||kind=furniture
wardrobe|n|a tall cupboard for hanging clothes; also, all the clothes a person owns|Her wardrobe is full of dresses.|closet||kind=furniture
bookcase|n|a piece of furniture with shelves for books|The bookcase is crammed with novels.|bookshelf||kind=furniture;forms=bookshelf
mattress|n|the soft, thick part of a bed that you lie on|This mattress is too soft.|||kind=furniture;plural=mattresses
carpet|n|a thick woven covering for a floor|We spilled juice on the carpet.|rug||kind=furniture
floor|n|the surface of a room that you walk on|The toys are all over the floor.|||kind=furniture
wall|n|one of the sides of a room or building; also, a structure of brick or stone|She hung a painting on the wall.|||kind=furniture
ceiling|n|the top surface of a room|A spider hung from the ceiling.|||kind=furniture
roof|n|the covering on top of a building|Rain dripped through the roof.|||kind=furniture
stairs|n|a set of steps going from one floor to another|He ran up the stairs.|staircase, steps||kind=furniture;mass;forms=staircase
fence|n|a barrier of wood or wire around a garden or field|The dog jumped over the fence.|railing||kind=furniture
gate|n|a door in a fence or wall|Close the gate behind you.|||kind=furniture
mailbox|n|a box where letters are delivered or posted|There's a parcel in the mailbox.|letterbox, postbox||kind=furniture;plural=mailboxes;forms=letterbox,postbox
doorbell|n|a bell outside a door that visitors ring|The doorbell rang twice.|||kind=furniture
lamp post|n|a tall post with a light at the top, beside a road|The dog stopped at every lamp post.|streetlight||kind=furniture
sink|n|a basin with taps, for washing|The dishes are piled in the sink.|basin||kind=furniture
tap|n|a device for controlling the flow of water from a pipe|Turn off the tap.|faucet||kind=furniture;forms=faucet
toilet|n|a bowl with a seat, used for getting rid of body waste; also, the room with it|Where's the toilet, please?|bathroom, restroom||kind=furniture
bathtub|n|a large container that you fill with water and sit in to wash|The bathtub is full of bubbles.|tub, bath||kind=furniture
dishwasher|n|a machine that washes dishes|Load the dishwasher after dinner.|||kind=furniture
washing machine|n|a machine for washing clothes|The washing machine is making a strange noise.|washer||kind=furniture
microwave|n|an oven that cooks food very fast using electric waves|Heat the soup in the microwave.|||kind=furniture
stove|n|a device for cooking on, with burners or hot plates|The kettle is on the stove.|cooker, hob||kind=furniture
toaster|n|an electric machine for toasting bread|The toaster burned my bread again.|||kind=furniture
blender|n|an electric machine for mixing food into a liquid|She made soup in the blender.|mixer||kind=thing
freezer|n|a very cold cupboard for keeping food frozen|The ice cream is in the freezer.|||kind=furniture
heater|n|a device for warming a room|Turn on the heater, it's freezing.|radiator||kind=furniture
air conditioner|n|a machine that cools the air in a room or car|The air conditioner broke during the heatwave.|AC||kind=furniture
light bulb|n|a glass object that gives light when electricity passes through it|The light bulb in the hall has gone.|bulb||kind=thing
switch|n|a small control for turning a device on or off|The switch is by the door.|||kind=thing;plural=switches
plug|n|a device on the end of a wire that connects it to the electricity supply; also, a stopper for a sink|Pull out the plug before you clean it.|||kind=thing
remote|n|a small device for controlling a television from a distance|I can't find the remote.|remote control, clicker||kind=thing;forms=remote control
vacuum|n|a vacuum cleaner: a machine that sucks up dust|The vacuum is in the closet.|hoover||kind=thing;forms=vacuum cleaner,hoover
mop|n|a tool with a long handle and soft strings for washing floors|Get the mop, I spilled the milk.|||kind=thing
sponge|n|a soft object with holes that soaks up water, used for cleaning|Wipe the table with a sponge.|||kind=thing
bin|n|a container for rubbish|Put it in the bin.|trash can, garbage can||kind=thing;forms=trash can,garbage can
trash|n|things that are thrown away|Take out the trash, please.|rubbish, garbage, litter||kind=thing;mass;forms=rubbish,garbage
jar|n|a glass container with a wide opening and a lid|She keeps cookies in a jar.|pot||kind=thing
can|n|a metal container for food or drink|Open a can of beans.|tin||kind=thing;forms=tin
tissue|n|a piece of soft paper for blowing your nose|Do you have a tissue?|hanky||kind=thing
napkin|n|a piece of cloth or paper for wiping your mouth and hands at a meal|She folded the napkins into swans.|serviette||kind=thing;forms=serviette
tray|n|a flat board with raised edges for carrying food or drinks|He brought breakfast on a tray.|||kind=thing
teapot|n|a container with a spout for making and pouring tea|The teapot is still warm.|||kind=thing
thermos|n|a container that keeps drinks hot or cold|I took a thermos of coffee on the hike.|flask||kind=thing;plural=thermoses;forms=flask
lunchbox|n|a box for carrying a packed lunch|He forgot his lunchbox at home.|||kind=thing;plural=lunchboxes
water bottle|n|a bottle for carrying drinking water|Fill up your water bottle before we go.|||kind=thing
cutting board|n|a flat board on which you cut food|Put the onions on the cutting board.|chopping board||kind=thing;forms=chopping board
whisk|n|a kitchen tool of wire loops for beating eggs or cream|Beat the eggs with a whisk.|beater||kind=thing;plural=whisks
oven glove|n|a thick glove for holding hot dishes|Use an oven glove, the tray is hot.|oven mitt||kind=thing;forms=oven mitt
key ring|n|a ring for keeping keys together|My key ring has a tiny penguin on it.|keychain||kind=thing;forms=keychain
lock|n|a device that keeps a door or box closed until opened with a key or code|The lock on the shed is rusty.|padlock||kind=thing
alarm clock|n|a clock that makes a noise to wake you up|My alarm clock goes off at six.|alarm||kind=thing
calendar|n|a chart showing the days, weeks and months of a year|I wrote her birthday on the calendar.|planner, diary||kind=thing
diary|n|a book in which you write what happens each day, or your appointments|She writes in her diary every night.|journal||kind=thing;plural=diaries
journal|n|a book for writing down thoughts or events; also, a magazine about a subject|He keeps a travel journal.|diary, log||kind=thing
magazine|n|a thin printed publication with articles and pictures, published regularly|I read a magazine on the plane.|periodical||kind=media
newspaper|n|a printed publication with news, usually daily|Dad reads the newspaper with breakfast.|paper||kind=media
comic|n|a magazine or book that tells stories in pictures|He reads comics on the bus.|comic book, graphic novel||kind=media;forms=comic book
envelope|n|a paper cover for a letter|Write the address on the envelope.|||kind=thing
stamp|n|a small sticker you put on a letter to pay for posting it|I need a stamp for this letter.|postage||kind=thing
package|n|something wrapped up to be sent or delivered|A package arrived for you.|parcel||kind=thing;forms=parcel
crayon|n|a stick of colored wax for drawing|The kids drew with crayons.|||kind=thing
marker|n|a pen with a thick tip|Write your name with a marker.|felt-tip, highlighter||kind=thing
eraser|n|a small piece of rubber for removing pencil marks|Can I borrow your eraser?|rubber||kind=thing
ruler|n|a straight strip for measuring and drawing lines; also, a person who rules|Draw the line with a ruler.|||kind=thing
calculator|n|a small electronic device for doing math|I checked the sum on a calculator.|||kind=thing
folder|n|a cover for keeping papers together; also, a place for files on a computer|Put the forms in the blue folder.|file||kind=thing
sticky note|n|a small piece of paper with a sticky strip on the back|Her desk is covered in sticky notes.|post-it||kind=thing;forms=post-it
stapler|n|a device for fastening papers together with metal staples|The stapler is out of staples.|||kind=thing
tape|n|a long thin strip of sticky material for fixing things together|Fix the poster with tape.|sticky tape||kind=thing;mass
string|n|thin cord for tying things|Tie the parcel with string.|cord, twine||kind=thing;mass
needle|n|a thin pointed piece of metal with a hole for thread, used for sewing|Thread the needle with red cotton.|||kind=thing
thread|n|a long thin strand of cotton or other material, used for sewing|I need some blue thread.|cotton, yarn||kind=thing;mass
button|n|a small round object that fastens clothes; also, something you press to operate a machine|A button fell off my coat.|||kind=thing
zipper|n|a fastener with two rows of teeth that lock together|The zipper on my bag is stuck.|zip||kind=thing;forms=zip
pocket|n|a small bag sewn into clothes|I found a coin in my pocket.|||kind=thing
belt|n|a strip of leather or cloth worn around the waist|He tightened his belt.|strap||kind=thing
tie|n|a long, narrow piece of cloth worn around the neck under a shirt collar|He wore a blue tie to the wedding.|necktie||kind=thing
suit|n|a jacket with matching trousers or a skirt|He bought a new suit for the interview.|||kind=thing
uniform|n|special clothes worn by everyone in a group|The school uniform is green.|||kind=thing
pajamas|n|loose clothes worn in bed|I'm still in my pajamas.|pyjamas, PJs||kind=thing;mass;forms=pyjamas,pjs
hoodie|n|a sweatshirt with a hood|He pulled up the hood of his hoodie.|sweatshirt||kind=thing
sweatshirt|n|a loose cotton top with long sleeves|I live in my old sweatshirt on weekends.|hoodie, jumper||kind=thing
t-shirt|n|a casual top with short sleeves and no collar|He wore a faded t-shirt.|tee||kind=thing;forms=tshirt,tee
shorts|n|short trousers that end above the knee|It's warm enough for shorts.|||kind=thing;mass
skirt|n|a piece of clothing that hangs from the waist|She wore a long yellow skirt.|||kind=thing
trousers|n|clothing covering each leg separately, from the waist to the ankles|These trousers are too long.|pants, slacks||kind=thing;mass;forms=pants
leggings|n|tight stretchy trousers|She wore leggings to yoga.|||kind=thing;mass
raincoat|n|a waterproof coat|Wear your raincoat, it's pouring.|mac||kind=thing
swimsuit|n|clothing worn for swimming|Don't forget your swimsuit.|bathing suit, swimming costume||kind=thing;forms=swimming costume,bathing suit
slippers|n|soft, comfortable shoes worn indoors|I put on my slippers and made tea.|||kind=thing;mass
sandal|n|a light, open shoe with straps|She wore sandals to the beach.|flip-flop||kind=thing
sneaker|n|a soft sports shoe|My new sneakers are bright white.|trainer, running shoe||kind=thing;forms=trainer
mitten|n|a glove with one part for the thumb and one for the fingers|The child lost a mitten in the snow.|glove||kind=thing
earring|n|a piece of jewelry worn on the ear|She lost an earring at the party.|||kind=thing
bracelet|n|a piece of jewelry worn around the wrist|He gave her a silver bracelet.|bangle||kind=thing
jewelry|n|necklaces, rings, bracelets and other decorations you wear|She keeps her jewelry in a little box.|jewels||kind=thing;mass;forms=jewellery
makeup|n|creams and powders put on the face to change how it looks|She put on her makeup in the mirror.|cosmetics||kind=thing;mass;forms=make-up
perfume|n|a liquid with a pleasant smell that you put on your skin|Her perfume smelled of roses.|scent, fragrance||kind=thing;mass
shampoo|n|liquid soap for washing hair|We're out of shampoo.|||kind=thing;mass
toothpaste|n|a paste for cleaning teeth|Squeeze the toothpaste from the bottom.|||kind=thing;mass
comb|n|a strip of plastic or metal with teeth, for tidying hair|He pulled a comb through his hair.|||kind=thing
hairbrush|n|a brush for tidying hair|She can never find her hairbrush.|||kind=thing;plural=hairbrushes
razor|n|a sharp tool for shaving|He cut himself with the razor.|shaver||kind=thing
suitcase|n|a case with a handle for carrying clothes when you travel|My suitcase is too heavy.|case, luggage||kind=thing
luggage|n|the bags and cases you take on a journey|We collected our luggage at the airport.|baggage||kind=thing;mass;forms=baggage
passport|n|an official document that lets you travel to other countries|Don't forget your passport.|||kind=thing
sunscreen|n|cream that protects your skin from the sun|Put on some sunscreen before you go out.|sunblock, suncream||kind=thing;mass;forms=suncream,sunblock
sunglasses|n|dark glasses that protect your eyes from the sun|I left my sunglasses in the car.|shades||kind=thing;mass
binoculars|n|a device with two lenses for seeing things far away|We watched the birds through binoculars.|field glasses||kind=thing;mass
telescope|n|a tube with lenses that makes distant things look closer|We looked at the moon through a telescope.|||kind=thing
microscope|n|an instrument that makes tiny things look much bigger|She looked at the cells under a microscope.|||kind=thing
compass|n|a device with a needle that points north|We used a compass to find the trail.|||kind=thing;plural=compasses
lantern|n|a lamp in a case, often carried|We hung a lantern outside the tent.|lamp||kind=thing
sleeping bag|n|a warm bag you sleep in when camping|My sleeping bag is too thin for winter.|||kind=thing
hammock|n|a bed of cloth or net hung between two supports|He napped in the hammock all afternoon.|||kind=thing
balloon|n|a small rubber bag filled with air or gas, used as a decoration or toy|The child let go of her balloon.|||kind=thing
candlestick|n|a holder for a candle|She polished the brass candlestick.|||kind=thing
vase|n|a container for holding flowers|Put the roses in a vase.|||kind=thing
frame|n|a border around a picture or window; also, a structure that supports something|The photo is in a silver frame.|||kind=thing
screwdriver|n|a tool for turning screws|Hand me the small screwdriver.|||kind=thing
wrench|n|a tool for gripping and turning nuts and bolts|He tightened the bolt with a wrench.|spanner||kind=thing;plural=wrenches;forms=spanner
saw|n|a tool with a sharp toothed blade for cutting wood|He cut the plank with a saw.|||kind=thing
drill|n|a tool for making holes|We need a drill to put up the shelf.|||kind=thing
nail|n|a thin pointed piece of metal hit into wood with a hammer; also, the hard covering on a finger or toe|Hammer the nail into the wall.|tack||kind=thing
screw|n|a metal pin with a spiral thread, turned into wood or metal to hold things together|One screw is loose.|bolt||kind=thing
shovel|n|a tool with a broad blade for digging or moving earth or snow|We cleared the path with a shovel.|spade||kind=thing;forms=spade
rake|n|a garden tool with a row of teeth for gathering leaves|Rake the leaves into a pile.|||kind=thing
hose|n|a long flexible tube for carrying water|Water the garden with the hose.|hosepipe||kind=thing;forms=hosepipe
watering can|n|a container with a spout for watering plants|Fill the watering can at the tap.|||kind=thing
wheelbarrow|n|a small cart with one wheel, pushed by hand|He wheeled the soil in a wheelbarrow.|barrow||kind=thing
smartphone|n|a mobile phone that works like a small computer|She checks her smartphone constantly.|phone, mobile||kind=thing;forms=mobile,cellphone,cell phone
keyboard|n|the set of keys used to type on a computer; also, an electronic piano|My keyboard is missing the letter J.|||kind=thing
monitor|n|a computer screen|I work with two monitors.|screen, display||kind=thing
printer|n|a machine that prints on paper|The printer is out of ink.|||kind=thing
speaker|n|a device that turns electrical signals into sound; also, a person speaking|Turn up the speaker.|loudspeaker||kind=thing
earbuds|n|small headphones that fit inside the ears|I lost one of my earbuds.|earphones||kind=thing;mass;forms=earphones
webcam|n|a small camera connected to a computer|My webcam makes me look green.|camera||kind=thing
router|n|a device that connects computers to the internet and to each other|Restart the router if the internet is down.|modem||kind=thing
cable|n|a thick wire that carries electricity or signals|Plug in the cable.|wire, cord||kind=thing
console|n|a machine for playing video games|We played on the console all evening.|games console||kind=thing
video game|n|a game played on a screen|He finished the video game in a weekend.|||kind=media
app|n|a program for a phone or computer|There's an app for that.|application, program||kind=media
password|n|a secret word or phrase that lets you use something|Don't share your password.|passcode, PIN||kind=idea
file|n|a collection of information stored on a computer; also, a folder for papers|Save the file before you close it.|document||kind=thing
photo album|n|a book for keeping photographs|We looked through the old photo album.|||kind=thing
podcast|n|a recorded audio show you can listen to online|I listen to a podcast on my commute.|||kind=media
playlist|n|a list of songs to play in order|I made a playlist for the road trip.|||kind=media
channel|n|a television station; also, a way for information to travel|What channel is the match on?|station||kind=media
series|n|a set of TV episodes or books that continue a story|We binged the whole series.|show, season||kind=media;plural=series
episode|n|one part of a TV series or podcast|One more episode, then bed.|installment||kind=media
cartoon|n|a film made of drawings; also, a funny drawing|The kids watch cartoons on Saturday.|animation||kind=media
documentary|n|a film or program about real events or facts|We watched a documentary about whales.|||kind=media;plural=documentaries
board game|n|a game played with pieces on a board|We played a board game after dinner.|||kind=thing
chess|n|a board game for two players with kings, queens and other pieces|My grandpa taught me chess.|||kind=idea;mass
cards|n|a game played with a pack of playing cards|We played cards all evening.|card game||mass
jigsaw|n|a puzzle of many interlocking pieces that make a picture|The jigsaw has a thousand pieces.|jigsaw puzzle||kind=thing
teddy bear|n|a soft toy bear|She sleeps with her teddy bear.|teddy||kind=thing;forms=teddy
blocks|n|toy building pieces|The toddler stacked the blocks.|||kind=thing;mass
swing|n|a seat hung from ropes or chains that you sit on and move back and forth|The kids took turns on the swing.|||kind=thing
slide|n|a smooth slope children slide down; also, a picture in a presentation|She went down the slide headfirst.|chute||kind=thing
trampoline|n|a sheet of strong fabric on springs that you jump on|They bounced on the trampoline all afternoon.|||kind=thing

# More places, events, sports and hobbies
living room|n|the room in a house for relaxing and spending time together|We watched a film in the living room.|lounge, sitting room||kind=place;at=in;forms=lounge
dining room|n|a room where meals are eaten|The dining room seats eight.|||kind=place;at=in
hallway|n|a passage in a building with rooms leading off it|Leave your shoes in the hallway.|hall, corridor||kind=place;at=in;forms=corridor
porch|n|a covered area at the entrance to a house|We drank lemonade on the porch.|veranda||kind=place;at=on;plural=porches
balcony|n|a platform on the outside of a building, above the ground|We had breakfast on the balcony.|terrace||kind=place;at=on;plural=balconies
backyard|n|the garden or yard behind a house|The kids played in the backyard.|yard, garden||kind=place;at=in;forms=back garden
yard|n|an area of land beside a house; also, a unit of length|The dog sleeps in the yard.|garden||kind=place;at=in
shed|n|a small building for storing tools or garden things|The bikes are in the shed.|hut||kind=place;at=in
driveway|n|a short road from a street to a house|There's a van in the driveway.|drive||kind=place;at=in
cottage|n|a small house, usually in the country|We rented a cottage by the sea.|cabin||kind=place;at=at
cabin|n|a small wooden house; also, a room on a ship or the passenger area of a plane|We stayed in a cabin in the woods.|cottage, hut||kind=place;at=at
campsite|n|a place where people camp|We found a campsite near the river.|campground||kind=place;at=at;forms=campground
lighthouse|n|a tower with a bright light that guides ships|We climbed to the top of the lighthouse.|||kind=place;at=at
pier|n|a long platform built out over the sea|We fished off the end of the pier.|jetty, wharf||kind=place;at=on
port|n|a town or place where ships load and unload|The ship stayed in port for two days.|harbor||kind=place;at=in
dock|n|a place where ships are loaded or repaired|The boat is at the dock.|wharf, pier||kind=place;at=at
marina|n|a harbor for small boats and yachts|We walked along the marina.|harbor||kind=place;at=at
coast|n|the land next to the sea|We drove along the coast.|shore, seaside||kind=place;at=on
shore|n|the land along the edge of a sea or lake|We walked along the shore.|beach, coast||kind=place;at=on
cliff|n|a high, steep rock face, often at the coast|Seabirds nest on the cliff.|bluff||kind=place;at=on
bay|n|part of the sea that curves into the land|Boats bobbed in the bay.|cove, inlet||kind=place;at=in
waterfall|n|a place where a river falls over rocks|We swam under the waterfall.|cascade, falls||kind=place;at=at
stream|n|a small, narrow river|We crossed the stream on stepping stones.|brook, creek||kind=place;at=by
pond|n|a small area of still water|Ducks swam on the pond.|pool||kind=place;at=by
volcano|n|a mountain with an opening that can throw out hot lava|The volcano last erupted a hundred years ago.|||kind=place;at=on;plural=volcanoes
glacier|n|a huge slow-moving mass of ice|We hiked up to the glacier.|||kind=place;at=on
canyon|n|a deep valley with steep sides|The river carved a deep canyon.|gorge, ravine||kind=place;at=in
meadow|n|a field of grass and wildflowers|Cows grazed in the meadow.|field||kind=place;at=in
woods|n|an area of land covered with trees, smaller than a forest|We walked through the woods.|forest, woodland||kind=place;at=in;mass
countryside|n|land away from towns and cities|We drove through the countryside.|country||kind=place;at=in;mass
suburb|n|an area where people live on the edge of a city|They moved to a quiet suburb.|||kind=place;at=in
neighborhood|n|the area around where you live|It's a friendly neighborhood.|area, district||kind=place;at=in;forms=neighbourhood
downtown|n|the main business area of a city|We had dinner downtown.|city center||kind=place;at=in;mass;forms=city centre
square|n|an open area in a town with buildings around it|We met in the town square.|plaza||kind=place;at=in
plaza|n|an open public square in a town|We sat by the fountain in the plaza.|square||kind=place;at=in
fountain|n|a structure that sends water up into the air|The kids splashed in the fountain.|||kind=place;at=by
statue|n|a figure of a person or animal made of stone or metal|We met by the statue in the park.|sculpture||kind=thing
monument|n|a building or statue that honors a person or event|The monument marks the old battle.|memorial||kind=place;at=at
tower|n|a tall, narrow building or part of a building|We climbed the clock tower.|||kind=place;at=in
skyscraper|n|a very tall building in a city|The skyscraper has a hundred floors.|tower||kind=place;at=in
palace|n|a large, grand house where a king, queen or important person lives|We toured the palace gardens.|castle||kind=place;at=at
temple|n|a building for worship in some religions|The temple was quiet and cool.|shrine||kind=place;at=at
mosque|n|a building where Muslims worship|The call to prayer came from the mosque.|||kind=place;at=at
synagogue|n|a building where Jewish people worship|We attended a wedding at the synagogue.|||kind=place;at=at
post office|n|a place where you can send letters and parcels|I need to go to the post office.|||kind=place;at=at
police station|n|the office of the local police|They reported the theft at the police station.|||kind=place;at=at
fire station|n|a building where fire engines and firefighters are based|The kids visited the fire station.|||kind=place;at=at
pharmacy|n|a shop where medicines are prepared and sold|Pick up my prescription at the pharmacy.|chemist, drugstore||kind=place;at=at;plural=pharmacies;forms=drugstore,chemist
clinic|n|a place where people get medical advice or treatment|She works at a dental clinic.|surgery||kind=place;at=at
salon|n|a place where people get their hair cut or beauty treatments|She's at the salon getting her hair done.|hairdresser's||kind=place;at=at
barbershop|n|a shop where men's hair is cut|He gets a haircut at the barbershop every month.|barber's||kind=place;at=at
laundromat|n|a place with washing machines you pay to use|We do our washing at the laundromat.|launderette||kind=place;at=at
gas station|n|a place where you buy fuel for cars|We stopped at a gas station for snacks.|petrol station||kind=place;at=at;forms=petrol station
parking lot|n|an area where cars are parked|I can't find the car in the parking lot.|car park||kind=place;at=in;forms=car park
bus stop|n|a place where a bus stops for passengers|I'll wait for you at the bus stop.|||kind=place;at=at
train station|n|a place where trains stop for passengers|Meet me at the train station.|railway station||kind=place;at=at
bookshop|n|a shop that sells books|I could spend all day in a bookshop.|bookstore||kind=place;at=at;forms=bookstore
toy shop|n|a shop that sells toys|The kids pressed their noses against the toy shop window.|toy store||kind=place;at=at;forms=toy store
florist|n|a shop that sells flowers, or the person who runs it|I bought tulips at the florist.|flower shop||kind=place;at=at
pub|n|a place where drinks, especially alcohol, are sold and drunk; also, food|We met friends at the pub.|bar, tavern||kind=place;at=at
bar|n|a place that serves drinks; also, a long block of something|We had a drink at the bar.|pub||kind=place;at=at
nightclub|n|a place open late at night where people dance|We danced at a nightclub until two.|club, disco||kind=place;at=at
bowling alley|n|a place where people go bowling|We had a birthday party at the bowling alley.|||kind=place;at=at
arcade|n|a place with video and coin-operated games|We spent our coins at the arcade.|||kind=place;at=at
amusement park|n|a large park with rides and games|We rode the roller coaster at the amusement park.|theme park, funfair||kind=place;at=at;forms=theme park,funfair
aquarium|n|a building where fish and sea animals are kept for people to see|We saw sharks at the aquarium.|||kind=place;at=at
gallery|n|a building or room for showing art|There's a new exhibition at the gallery.|museum||kind=place;at=at;plural=galleries
concert hall|n|a large building for musical performances|The orchestra played at the concert hall.|||kind=place;at=at
studio|n|a room where an artist works, or where music, films or broadcasts are made|She paints in a studio by the sea.|workshop||kind=place;at=in
workshop|n|a room where things are made or repaired; also, a session where people learn a skill|He built the chair in his workshop.|studio||kind=place;at=in
factory|n|a building where goods are made by machines|The factory makes chocolate.|plant, works||kind=place;at=at;plural=factories
warehouse|n|a large building for storing goods|The furniture is kept in a warehouse.|depot, storehouse||kind=place;at=in
lab|n|a laboratory: a room for scientific experiments|She works in a research lab.|laboratory||kind=place;at=in;forms=laboratory
court|n|a place where legal cases are decided; also, an area for games like tennis|We played on the tennis court.|||kind=place;at=on
track|n|a path or a circuit for racing; also, a song on an album|She runs laps on the track.|path, trail||kind=place;at=on
trail|n|a path through the countryside|We followed the trail to the lake.|path, track||kind=place;at=on
path|n|a narrow way for walking|Follow the path along the river.|track, trail||kind=place;at=on
highway|n|a main road between towns|The highway was jammed with traffic.|motorway, freeway||kind=place;at=on;forms=motorway,freeway
tunnel|n|a passage under the ground or through a hill|The train went through a long tunnel.|underpass||kind=place;at=in
continent|n|one of the large land masses of the earth, such as Africa or Asia|Have you visited every continent?|||kind=place;at=in
planet|n|a large round object in space that moves around a star|Mars is the red planet.|world||kind=place;at=on
earth|n|the planet we live on; also, soil|The earth goes around the sun.|world, globe||kind=place;at=on;forms=the earth
universe|n|everything that exists, including all of space|The universe is unimaginably big.|cosmos||kind=place;at=in
abroad|adv|in or to a foreign country|She's studying abroad this year.|overseas|at home
outside|adv|not inside a building|Let's eat outside.|outdoors|inside
inside|adv|in or into a building or room|Come inside, it's raining.|indoors|outside
upstairs|adv|on or to a higher floor|The kids are upstairs.||downstairs
downstairs|adv|on or to a lower floor|Breakfast is downstairs.||upstairs
nearby|adv|not far away|There's a café nearby.|close by|far away
everywhere|adv|in every place|There were flowers everywhere.|all over|nowhere
somewhere|adv|in or to some place|I left my keys somewhere.
anywhere|adv|in or to any place|Sit anywhere you like.
housewarming|n|a party for people who have moved into a new home|We're having a housewarming on Saturday.|||kind=event;event=joy
baby shower|n|a party with gifts for someone who is expecting a baby|We're throwing her a baby shower.|||kind=event;event=joy
bridal shower|n|a party with gifts for a woman who is about to get married|The bridal shower was in the garden.|||kind=event;event=joy
engagement|n|an agreement to marry; also, an arranged meeting|They announced their engagement at dinner.|||kind=event;event=news
honeymoon|n|a holiday taken by two people just after they marry|They went to Italy on their honeymoon.|||kind=event;event=joy
christening|n|a ceremony in which a baby is named and welcomed into a church|The christening is next Sunday.|baptism||kind=event;event=joy;forms=baptism
retirement|n|the time when someone stops working for good|We threw a party for his retirement.|||kind=event;event=joy
promotion|n|a move to a more important job; also, a special offer|She got a promotion at work.|advancement||kind=event;event=news
road trip|n|a long journey by car for fun|We're going on a road trip this summer.|||kind=event;event=joy
day trip|n|a trip to a place and back on the same day|We took a day trip to the coast.|outing||kind=event;event=joy
cruise|n|a holiday on a large ship that visits several places|They went on a cruise around the islands.|voyage||kind=event;event=joy
tour|n|a journey visiting several places, or a walk around a building to see it|We took a tour of the castle.|trip, visit||kind=event;event=joy
camping trip|n|a trip where you stay in a tent|We're going on a camping trip this weekend.|||kind=event;event=joy
playdate|n|an arranged time for children to play together|The kids have a playdate on Friday.|||kind=event;event=joy;forms=play date
movie night|n|an evening spent watching films|We're having a movie night with popcorn.|||kind=event;event=joy
game night|n|an evening spent playing games with friends or family|Game night is at my place.|||kind=event;event=joy
karaoke|n|singing along to recorded music, often in front of friends|We sang karaoke until midnight.|||kind=event;event=joy;mass
parade|n|a procession of people, bands or floats through the streets|We watched the parade from the balcony.|procession, march||kind=event;event=joy
fair|n|an outdoor event with rides, games and stalls|We won a goldfish at the fair.|carnival, fete||kind=event;event=joy
carnival|n|a festival with music, dancing and costumes in the streets|The carnival lasted all weekend.|festival, fair||kind=event;event=joy
fireworks|n|small explosives that make colorful lights and noise in the sky|We watched the fireworks from the hill.|||kind=event;event=joy;mass
gig|n|informal: a performance by a band or comedian|We're going to a gig tonight.|concert, show||kind=event;event=joy
play|n|a story performed by actors on a stage|The school play is on Friday.|drama||kind=event;event=luck
musical|n|a play or film with lots of singing and dancing|We saw a musical in the city.|||kind=event;event=joy
opera|n|a play in which the words are sung|We went to the opera for her birthday.|||kind=event;event=joy
ballet|n|a form of dance that tells a story with music, or a performance of it|My daughter has ballet on Saturday.|||kind=event;event=joy
exhibition|n|a public show of art or objects|There's a dinosaur exhibition at the museum.|show, display||kind=event;event=joy
conference|n|a large formal meeting for people to discuss a subject|I'm speaking at a conference next month.|convention, summit||kind=event;event=luck
seminar|n|a class or meeting for discussion and training|I have a seminar on Thursday.|workshop||kind=event;event=luck
lecture|n|a talk to students or an audience on a subject|The history lecture starts at nine.|talk||kind=event;event=luck
assignment|n|a piece of work given to a student or employee|The assignment is due on Monday.|task, homework||kind=event;event=luck
essay|n|a short piece of writing on a subject|I have an essay due tomorrow.|paper, composition||kind=event;event=luck
report|n|a written account of something; also, a school report card|My report is due on Friday.|account, paper||kind=event;event=luck
review|n|an assessment of something; also, a performance review at work|I have my annual review tomorrow.|appraisal||kind=event;event=luck
final|n|the last and most important game in a competition; also, a final exam|We're in the final!|||kind=event;event=luck
tournament|n|a series of games to find a winner|The chess tournament is this weekend.|competition, championship||kind=event;event=luck
marathon|n|a running race of about 42 kilometers|She's running a marathon in April.|||kind=event;event=luck
triathlon|n|a race that combines swimming, cycling and running|He's training for a triathlon.|||kind=event;event=luck
tryout|n|a test of someone's ability before they join a team or cast|I have soccer tryouts tomorrow.|audition, trial||kind=event;event=luck;forms=tryouts
first day|n|the day you start something new, such as a job or school|It's my first day at the new job.|||kind=event;event=luck
operation|n|a medical treatment in which a surgeon cuts into the body; also, a planned activity|Her operation went well.|surgery||kind=event;event=luck
check-up|n|a medical or dental examination to see that you are healthy|I have a check-up at the dentist.|examination||kind=event;event=luck;forms=checkup
vaccination|n|an injection to protect against a disease|The kids have their vaccinations on Friday.|jab, shot||kind=event;event=luck;forms=vaccine
haircut|n|cutting someone's hair, or the style it is cut in|I'm getting a haircut tomorrow.|trim||kind=event;event=joy
move|n|moving to a new home|The move is next week.|relocation||kind=event;event=luck;nogen
breakup|n|the end of a relationship|She's still sad about the breakup.|split||kind=event;event=sorry;forms=break-up
divorce|n|the legal end of a marriage|Her parents' divorce was hard on everyone.|separation||kind=event;event=sorry
memorial|n|a ceremony or object that remembers a person who has died|The memorial service is on Sunday.|tribute||kind=event;event=sorry
accident|n|something bad that happens unexpectedly, often causing injury or damage|He had a small accident on his bike.|crash, mishap||kind=event;event=sorry
loss|n|losing something or someone; also, failing to win|I'm sorry for your loss.|defeat|win, gain|kind=event;event=sorry
emergency|n|a sudden dangerous situation that needs action at once|In an emergency, call for help.|crisis||kind=event;event=sorry;plural=emergencies
basketball|n|a team game in which players score by throwing a ball through a high hoop|We play basketball after school.|||kind=idea;mass
baseball|n|a game played with a bat and ball by two teams of nine|We watched a baseball game.|||kind=idea;mass
soccer|n|football: a team game in which players kick a ball into a goal|He plays soccer on Saturdays.|football||kind=idea;mass;nogen
tennis|n|a game in which players hit a ball over a net with rackets|We played tennis in the park.|||kind=idea;mass
volleyball|n|a team game in which players hit a ball over a high net with their hands|We played volleyball on the beach.|||kind=idea;mass
golf|n|a game in which players hit a small ball into holes with clubs|My dad plays golf on Sundays.|||kind=idea;mass
hockey|n|a team game played with sticks and a ball or puck|She plays hockey for the school.|||kind=idea;mass
rugby|n|a team game played with an oval ball that can be carried and kicked|We watched the rugby on TV.|||kind=idea;mass
cricket|n|a game played by two teams with a bat and ball; also, a chirping insect|They played cricket on the village green.|||kind=idea;mass
badminton|n|a game in which players hit a shuttlecock over a high net|We played badminton in the garden.|||kind=idea;mass
boxing|n|a sport in which two people fight with their fists in padded gloves|He took up boxing to get fit.|||kind=idea;mass
swimming|n|the sport or activity of moving through water|Swimming is great exercise.|||kind=idea;mass
running|n|the sport or activity of running|Running clears my head.|jogging||kind=idea;mass
cycling|n|the sport or activity of riding a bicycle|Cycling is my favorite way to get to work.|biking||kind=idea;mass
hiking|n|walking long distances in the countryside for pleasure|We go hiking every weekend.|trekking, rambling||kind=idea;mass
climbing|n|the sport of climbing rocks or mountains|She does climbing at the indoor wall.|bouldering||kind=idea;mass
skiing|n|the sport of moving over snow on skis|We went skiing in the Alps.|||kind=idea;mass
surfing|n|the sport of riding waves on a board|He learned surfing in Portugal.|||kind=idea;mass
skating|n|moving on ice skates or roller skates|We went skating on the frozen lake.|||kind=idea;mass
dancing|n|moving to music|She loves dancing in the kitchen.|||kind=idea;mass
fishing|n|catching fish, for food or for sport|My grandpa took me fishing.|angling||kind=idea;mass
camping|n|staying in a tent or caravan on holiday|We go camping every summer.|||kind=idea;mass
knitting|n|making clothes from yarn with two needles; also, the thing being knitted|Knitting helps me relax.|||kind=idea;mass
baking|n|making bread, cakes and other food in an oven|Baking is my weekend hobby.|||kind=idea;mass
drawing|n|making pictures with a pencil or pen; also, a picture made this way|Drawing is how he unwinds.|sketching||kind=idea;mass
writing|n|putting words on paper or a screen; also, written work|She does her writing in the morning.|||kind=idea;mass
singing|n|making music with your voice|Singing in a choir makes me happy.|||kind=idea;mass
birdwatching|n|watching wild birds as a hobby|Birdwatching needs patience and binoculars.|birding||kind=idea;mass
gaming|n|playing video games|Gaming is how I relax after work.|||kind=idea;mass
crafts|n|making things by hand, like pottery or sewing|We did crafts on the rainy afternoon.|handicrafts||kind=idea;mass
pottery|n|making pots and dishes from clay, or the things made|She takes a pottery class on Tuesdays.|ceramics||kind=idea;mass
sewing|n|joining cloth with a needle and thread|I learned sewing from my grandmother.|stitching||kind=idea;mass
shopping|n|buying things in shops|We did some shopping in town.|||kind=idea;mass
traveling|n|going to different places, especially far away|Traveling teaches you a lot.|travel||kind=idea;mass;forms=travelling
volunteering|n|working without pay to help others|Volunteering at the shelter is rewarding.|||kind=idea;mass
meditation|n|sitting quietly and focusing your mind|Meditation helps me sleep.|mindfulness||kind=idea;mass
exercise|n|physical activity to stay healthy|A little exercise every day goes a long way.|workout, training||kind=idea;mass
workout|n|a session of physical exercise|I had a great workout this morning.|exercise, training||kind=idea

# More actions
add|v|to put something with something else; also, to find the total of numbers|Add the sugar to the flour.|include, total|subtract, remove|obj=a pinch of salt
mix|v|to combine things so they become one|Mix the paint until it's even.|blend, combine|separate|obj=the batter
blend|v|to mix things together thoroughly|Blend the fruit with yogurt.|mix, combine||obj=the soup
toast|v|to make bread brown with heat; also, to raise a glass to someone|Toast the bread lightly.|grill||obj=the bread
steam|v|to cook food with steam from boiling water|Steam the broccoli for five minutes.|||obj=the vegetables
microwave|v|to cook or heat food in a microwave oven|Microwave the soup for two minutes.|heat||obj=the leftovers
serve|v|to give food or drink to someone; also, to work for someone|Serve the soup hot.|dish up||obj=dinner
chew|v|to bite food again and again before swallowing|Chew your food properly.|munch||obj=the gum
swallow|v|to make food or drink go down your throat|He swallowed the pill with water.|gulp||obj=the pill
sip|v|to drink slowly in small amounts|She sipped her tea by the window.|||obj=her tea
gulp|v|to swallow quickly|He gulped down his juice.|swig||obj=his water
bite|v|to cut into something with your teeth|The dog bit my sandwich.|nibble, chomp||obj=the apple;past=bit;ing=biting
lick|v|to move your tongue over something|The cat licked its paws.|||obj=the spoon
nibble|v|to eat something in small bites|The rabbit nibbled a carrot.|munch||obj=a cookie
munch|v|to eat steadily and noisily|We munched popcorn through the film.|chomp, crunch||obj=some popcorn
starve|v|to suffer or die from lack of food; informally, to be very hungry|I'm starving, let's eat.|||act;mood=-
dine|v|to eat dinner|We dined by candlelight.|eat||act
feast|v|to eat a large meal with enjoyment|We feasted on the fish we caught.|||act
clean up|v|to make a place tidy and clean|Let's clean up after dinner.|tidy up||past=cleaned up;ing=cleaning up
dust|v|to remove dust from furniture|I dust the shelves every Sunday.|wipe||obj=the shelves
wipe|v|to rub a surface to clean or dry it|Wipe the table after dinner.|clean, mop||obj=the table
scrub|v|to clean something by rubbing hard|Scrub the pan with hot water.|scour||obj=the pan
rinse|v|to wash something quickly in clean water|Rinse the rice before cooking.|wash||obj=the cups
vacuum|v|to clean with a vacuum cleaner|I vacuum the stairs on Saturdays.|hoover||obj=the carpet
mop|v|to wash a floor with a mop|Mop the kitchen floor, please.|||obj=the floor
laundry|n|clothes that need washing, or have just been washed|I have a pile of laundry to do.|washing||kind=thing;mass
hang|v|to attach something at the top so it hangs down|Hang your coat on the hook.|suspend||obj=the washing;past=hung
arrange|v|to put things in order; also, to plan|She arranged the flowers in a vase.|organize, set out||obj=the flowers
assemble|v|to put the parts of something together|We assembled the bookshelf ourselves.|build, put together|dismantle|obj=the shelf
install|v|to put equipment or software in place so it's ready to use|I installed the new app.|set up, fit|remove|obj=the update
update|v|to make something more modern or add the latest information|Update your phone tonight.|upgrade, refresh||obj=the app
upload|v|to send data from your device to the internet|She uploaded the photos.||download|obj=the photos
delete|v|to remove something, especially from a computer|I deleted the old messages.|erase, remove|save|obj=the file
click|v|to press a button on a computer mouse; also, to make a short sharp sound|Click the link to open it.|tap, press||obj=the link
scroll|v|to move text or pictures up or down on a screen|I scrolled through the photos.|||act
search|v|to look carefully for something|We searched everywhere for the cat.|look, hunt||obj=the drawer
browse|v|to look through things casually; also, to look at websites|We browsed the bookshop for an hour.|look around||act
text|v|to send a written message by phone|I'll text you when I get there.|message||obj=her friend
email|v|to send a message by email|Email me the details.|||obj=the teacher
post|v|to send a letter; also, to put something online|I posted the photos online.|mail, share||obj=a letter
reply|v|to answer|She replied to my message right away.|answer, respond||act
revise|v|to study again before an exam; also, to change and improve|I'm revising for my exams.|study, review||act
review|v|to look at something again carefully|Review your notes before the test.|go over, check||obj=her notes
quiz|v|to ask someone lots of questions|My mom quizzed me on my spelling.|question, test||obj=her brother
graduate|v|to complete a course at a school or university|She graduated last summer.|||act
pass out|v|to faint|He passed out from the heat.|faint||past=passed out;ing=passing out;mood=-
faint|v|to suddenly become unconscious for a short time|She fainted in the heat.|pass out||act;mood=-
injure|v|to hurt someone or a part of the body|He injured his knee playing football.|hurt, wound|heal|obj=his knee;mood=-
sprain|v|to injure a joint by twisting it|I sprained my ankle on the stairs.|twist||obj=her ankle;mood=-
bleed|v|to lose blood|My finger is bleeding.|||act;past=bled;mood=-
recover|v|to get better after an illness or difficulty|She recovered quickly from the flu.|heal, get better|worsen|act
sleep in|v|to sleep later than usual in the morning|I slept in on Sunday.|lie in||past=slept in;ing=sleeping in
oversleep|v|to sleep longer than you meant to|I overslept and missed the train.|||act;past=overslept;mood=-
stay up|v|to not go to bed|We stayed up late talking.|||past=stayed up;ing=staying up
get up|v|to rise from bed or from sitting|I get up at seven.|rise||past=got up;ing=getting up
wake up|v|to stop sleeping|I woke up to the sound of rain.|awaken||past=woke up;ing=waking up
fall asleep|v|to start sleeping|I fell asleep on the sofa.|nod off, drift off||past=fell asleep;ing=falling asleep
fall|v|to drop down toward the ground by accident|I fell on the ice.|tumble, trip|rise|act;past=fell;mood=-
trip|v|to catch your foot and almost fall|I tripped over the cat.|stumble||act;mood=-
slip|v|to slide by accident and lose your balance|She slipped on the wet floor.|skid||act;mood=-
crash|v|to hit something hard, especially in a vehicle|He crashed his bike into a hedge.|collide||obj=the car;mood=-
burn|v|to be on fire, or to damage something with heat|I burned the toast again.|scorch||obj=the toast;past=burnt;mood=-
crack|v|to break without coming apart; also, to solve|I cracked my phone screen.|split, fracture||obj=her phone screen;mood=-
tear|v|to pull something apart; also, to rip by accident|I tore my jeans on the fence.|rip||obj=the paper;past=tore;mood=-
ruin|v|to spoil something completely|The rain ruined our picnic.|spoil, wreck||obj=the picnic;mood=-
waste|v|to use something carelessly or without purpose|Don't waste food.|squander|save|obj=the time;mood=-
mess up|v|informal: to do something badly; also, to make untidy|I messed up the recipe.|botch, ruin||past=messed up;ing=messing up;mood=-
struggle|v|to try very hard to do something difficult|I'm struggling with this assignment.|strain, labor||act;mood=-
cope|v|to deal with something difficult|She's coping well with the new job.|manage, handle||act
manage|v|to succeed in doing something difficult; also, to be in charge of|We managed to catch the last bus.|cope, run||obj=the team
handle|v|to deal with something; also, to hold in your hands|She handled the problem calmly.|deal with, manage||obj=the problem
deal with|v|to take action to solve a problem|I'll deal with the emails tomorrow.|handle, sort out||past=dealt with;ing=dealing with
sort out|v|to solve a problem or tidy something|Let's sort out the garage.|organize, fix||past=sorted out;ing=sorting out
figure out|v|to understand or solve something by thinking|I finally figured out the puzzle.|work out, solve||past=figured out;ing=figuring out
give up|v|to stop trying or stop doing something|Don't give up now.|quit|persevere|past=gave up;ing=giving up;mood=-
quit|v|to stop doing something; also, to leave a job|She quit her job to travel.|stop, leave|start|act;past=quit;ing=quitting
succeed|v|to manage to do what you tried to do|She succeeded on her third try.|triumph, win|fail|act
achieve|v|to succeed in doing something after effort|He achieved his goal of running a marathon.|accomplish, reach|fail|obj=her goal
improve|v|to get better or make something better|My cooking has improved a lot.|get better, enhance|worsen|act
cheer|v|to shout to show support or happiness|The crowd cheered for the runners.|applaud, root for|boo|act
clap|v|to hit your hands together to show you enjoyed something|Everyone clapped at the end.|applaud||act
joke|v|to say things to make people laugh|He's always joking around.|kid, tease||act
tease|v|to laugh at someone in a playful or unkind way|My brother teases me about my hair.|mock, kid||obj=her brother
cuddle|v|to hold someone or something close and warmly|The kids cuddled the puppy.|hug, snuggle||obj=the puppy
snuggle|v|to get into a warm, comfortable position close to someone|We snuggled under the blanket.|cuddle, nestle||act
comfort|v|to make someone feel less sad or worried|She comforted her friend after the news.|console, soothe|upset|obj=her friend
encourage|v|to give someone confidence or hope|My teacher encouraged me to enter the contest.|support, inspire|discourage|obj=her friend
support|v|to help someone or something; also, to hold up|Thanks for supporting me.|help, back||obj=the team
care|v|to feel that someone or something matters; also, to look after|I really care about my friends.|mind, look after||act
panic|v|to suddenly feel so frightened that you can't think clearly|Don't panic, we have time.|freak out||act;past=panicked;ing=panicking;mood=-
sob|v|to cry noisily|She sobbed into her pillow.|weep, cry||act;mood=-
yell|v|to shout loudly|He yelled for help.|shout, holler|whisper|act
mumble|v|to speak quietly and unclearly|He mumbled an apology.|mutter|enunciate|act
mutter|v|to speak quietly, often to complain|She muttered about the weather.|mumble, grumble||act
rap|v|to speak words in rhythm to music; also, to knock|He raps with his friends.|||act
perform|v|to entertain an audience by acting, singing, dancing or playing|The band performed for two hours.|play, act||act
act|v|to do something; also, to perform in a play or film|She acts in the school play.|perform||act
direct|v|to manage a film or play; also, to show someone the way|She directed her first film last year.|lead, manage||obj=the play
film|v|to record moving pictures with a camera|We filmed the whole wedding.|record, shoot||obj=the wedding
record|v|to store sound or pictures so they can be played later|I recorded a song on my phone.|tape, capture||obj=a song
photograph|v|to take a picture with a camera|He photographed the sunset.|shoot, snap||obj=the sunset
listen to|v|to pay attention to sounds or to what someone says|I listen to music while I work.|hear||past=listened to;ing=listening to
binge|v|informal: to do too much of something at once, like watching a whole TV series|We binged the whole series in a weekend.|||act
stream|v|to watch or listen to something over the internet as it arrives|We streamed the match on my laptop.|||obj=a film
game|v|to play video games|He games every evening after work.|||act;ing=gaming
paddle|v|to walk in shallow water; also, to move a boat with a paddle|The kids paddled at the edge of the sea.|wade||act
row|v|to move a boat through water using oars|We rowed across the lake.|paddle||act
sail|v|to travel on water in a ship or boat, especially with sails|We sailed to the island.|cruise||act
dive|v|to jump into water headfirst; also, to swim underwater|She dived off the rocks.|plunge||act;past=dove
splash|v|to make water fly around in drops|The kids splashed in the puddles.|spatter||act
skip|v|to move along with small hops; also, to leave something out|I skipped breakfast this morning.|hop, miss||obj=breakfast
hop|v|to jump on one foot, or jump in small steps|The rabbit hopped across the lawn.|bounce, skip||act
jump|v|to push yourself off the ground with your legs|The kids jumped into the pool.|leap, spring||nogen
leap|v|to jump high or a long way|The deer leapt over the fence.|jump, spring||act;past=leapt
march|v|to walk with regular steps, like soldiers|The band marched down the street.|stride||act
roam|v|to travel without a fixed plan|Goats roamed the hillside.|wander, rove||act
drive|v|to control a car or other vehicle|I drive to work every day.|steer||obj=the car;past=drove
park|v|to leave a vehicle in a place for a while|Park the car in the shade.|||obj=the car
board|v|to get onto a plane, train or ship|We boarded the plane at noon.|embark|disembark|obj=the train
land|v|to come down onto the ground after flying|Our plane landed early.|touch down|take off|act
take off|v|to leave the ground and start flying; also, to remove clothes|The plane took off on time.|depart|land|past=took off;ing=taking off
check in|v|to arrive and register at a hotel or airport|We checked in at the hotel.|register|check out|past=checked in;ing=checking in
cancel|v|to say that something planned won't happen|They cancelled the match because of the rain.|call off|book|obj=the meeting;mood=-;forms=cancelled,cancelling
postpone|v|to move an event to a later time|We postponed the trip until spring.|delay, put off||obj=the party
reschedule|v|to change the time of a planned event|Can we reschedule our meeting?|move||obj=the appointment
attend|v|to go to an event|Over a hundred people attended the wedding.|go to, be at|miss|obj=the meeting
join|v|to become a member of a group; also, to connect|I joined a running club.|enter, sign up for|leave|obj=the club
sign up|v|to agree to take part in something|I signed up for a cooking class.|enroll, register||past=signed up;ing=signing up
apply|v|to ask formally for something such as a job; also, to put on|I applied for three jobs this week.|request||act
interview|v|to ask someone questions for a job or an article|They interviewed five people for the job.|question||obj=the candidates
hire|v|to give someone a job; also, to rent|The café hired two new waiters.|employ|fire|obj=a new assistant
fire|v|to make someone leave their job; also, to shoot|The manager fired him for being late.|dismiss, sack|hire|obj=the cook;mood=-
retire|v|to stop working because of age|My grandpa retired last year.|||act
work out|v|to exercise; also, to solve|I work out three times a week.|exercise, train||past=worked out;ing=working out
lift weights|v|to exercise by raising heavy weights|I lift weights at the gym.|||past=lifted weights;ing=lifting weights
warm up|v|to prepare your body for exercise with gentle movement|Always warm up before a run.|limber up||past=warmed up;ing=warming up
unwind|v|to relax after work or stress|I unwind with a good book.|relax, chill||act;past=unwound
date|v|to go out regularly with someone you're romantically interested in|They've been dating for a year.|go out with, see||act
marry|v|to become someone's husband or wife|They married in the spring.|wed||act
propose|v|to ask someone to marry you; also, to suggest|He proposed on the beach at sunset.|suggest||act
break up|v|to end a romantic relationship|They broke up last month.|split up||past=broke up;ing=breaking up;mood=-
fight|v|to use force against someone; also, to argue|The cats fought over the fish.|battle, quarrel||act;past=fought;mood=-
blame|v|to say someone is responsible for something bad|Don't blame yourself.|accuse||obj=the weather
welcome|v|to greet someone in a friendly way when they arrive|They welcomed us with tea and cake.|greet, receive||obj=the guests
host|v|to invite and look after guests at an event|We're hosting a party on Saturday.|throw, hold||obj=a party
wrap up|v|to cover a present in paper; also, to finish something|Let's wrap up the meeting.|finish, conclude||past=wrapped up;ing=wrapping up
gift|v|to give something as a present|She gifted me a plant.|give, present||obj=a book
donate|v|to give money or goods to help others|We donated our old clothes.|give, contribute||obj=some books
lend a hand|v|to help|Can you lend a hand with these boxes?|help||past=lent a hand;ing=lending a hand
babysit|v|to look after children while their parents are out|I babysit for the neighbors.|mind||act;past=babysat
adopt|v|to take a child or animal into your family; also, to start using an idea|We adopted a cat from the shelter.|take in||obj=a kitten
garden|v|to work in a garden|She gardens every morning.|||act
plant|v|to put a seed or plant into the ground to grow|We planted tulips by the fence.|sow||obj=some seeds
pick|v|to choose; also, to pull fruit or flowers from a plant|We picked apples in the orchard.|choose, gather||obj=the apples
harvest|v|to gather crops when they're ripe|We harvested the potatoes in September.|gather, reap|plant|obj=the potatoes
mow|v|to cut grass with a machine|I mow the lawn on Saturdays.|cut, trim||obj=the lawn
prune|v|to cut off parts of a tree or bush to help it grow|Prune the roses in winter.|trim, cut back||obj=the roses
walk the dog|v|to take a dog out for exercise|I walk the dog before breakfast.|||past=walked the dog;ing=walking the dog
fetch|v|to go and get something and bring it back|The dog fetched the stick.|retrieve, get||obj=the stick
bark|v|to make the short loud sound a dog makes|The dog barked at the mail carrier.|woof, yap||act
purr|v|to make the low, happy sound a cat makes|The cat purred on my lap.|||act
meow|v|to make the crying sound a cat makes|The cat meowed at the door.|mew||act;forms=miaow
growl|v|to make a low, rough sound, as an angry dog does|The dog growled at the stranger.|snarl||act
tweet|v|to make the high sound a small bird makes; also, to post on a social media site|Birds tweeted in the hedge.|chirp, twitter||act
buzz|v|to make a low humming sound, as a bee does|A bee buzzed past my ear.|hum, drone||act
howl|v|to make a long, loud cry, as a wolf does|The wind howled all night.|wail||act
fly away|v|to leave by flying|The bird flew away when I got close.|||past=flew away;ing=flying away
shop around|v|to compare prices in different shops before buying|Shop around before you buy a phone.|||past=shopped around;ing=shopping around
afford|v|to have enough money for something|I can't afford a new car.|||obj=the trip
budget|v|to plan how to spend money|We budget for a holiday every year.|plan||act
owe|v|to have to pay or give back something|I owe you five dollars.|||obj=her money
invest|v|to put money into something hoping to make a profit; also, to put time or effort into something|She invested in a small bakery.|||act
count on|v|to rely on someone|You can count on me.|rely on, depend on||past=counted on;ing=counting on
depend|v|to need someone or something for support; also, to be decided by|It depends on the weather.|rely||act
wonder|v|to think about something and want to know more|I wonder what time it is.|ponder||act
pretend|v|to act as if something is true when it isn't|The kids pretended to be pirates.|make believe||act
plan ahead|v|to make plans for the future in advance|It pays to plan ahead.|||past=planned ahead;ing=planning ahead
expect|v|to think something will happen|I expect it will rain.|anticipate||act
remind|v|to make someone remember something|Remind me to call mom.|prompt||obj=her brother
realize|v|to suddenly understand or become aware of something|I realized I'd left my keys inside.|understand, notice||act;forms=realise
compare|v|to look at how things are the same or different|Compare the two prices.|contrast||obj=the prices
prefer|v|to like one thing more than another|I prefer tea to coffee.|favor||act;past=preferred;ing=preferring
suggest|v|to put forward an idea|I suggest we leave early.|propose, recommend||act
recommend|v|to suggest that something is good or right|Can you recommend a good book?|suggest, advise||obj=a good book
promise|v|to say that you will certainly do something|I promise I'll call.|swear, vow||act
admit|v|to agree that something is true, often unwillingly; also, to let in|He admitted he was wrong.|confess|deny|act;past=admitted;ing=admitting
deny|v|to say something isn't true|She denied eating the last cookie.||admit|act
confess|v|to admit you did something wrong|He confessed to breaking the vase.|admit|deny|act
gossip|v|to talk about other people's private lives|They gossiped over coffee.|chat, chatter||act
praise|v|to say good things about someone or something|The teacher praised her drawing.|compliment, applaud|criticize|obj=her work
criticize|v|to say what you think is wrong with someone or something|He criticized the plan.|find fault with|praise|act;forms=criticise;mood=-
compliment|v|to say something nice about someone|She complimented my shoes.|praise, flatter|insult|obj=her friend
insult|v|to say something rude to someone|He insulted the referee.|offend|compliment|act;mood=-
interrupt|v|to stop someone while they are speaking or doing something|Sorry to interrupt.|cut in||act
hurry up|v|to move faster|Hurry up, we're late!|rush||past=hurried up;ing=hurrying up
slow down|v|to move or do something more slowly|Slow down, you'll trip.||speed up|past=slowed down;ing=slowing down
wait for|v|to stay until someone or something comes|I'll wait for you at the corner.|||past=waited for;ing=waiting for
queue|v|to wait in a line|We queued for an hour.|line up||act;ing=queuing
head|v|to go in a particular direction|We headed home after dinner.|go, make for||act
stay over|v|to spend the night at someone's home|Can I stay over on Friday?|sleep over||past=stayed over;ing=staying over
move in|v|to start living in a new home|We moved in last week.||move out|past=moved in;ing=moving in
move out|v|to leave the home where you live|She moved out of her parents' house.||move in|past=moved out;ing=moving out
settle in|v|to become comfortable in a new place|We're still settling in.|||past=settled in;ing=settling in
grow up|v|to become an adult|I grew up by the sea.|||past=grew up;ing=growing up

# More describing words
brilliant|adj|very bright; also, very clever or very good|That was a brilliant idea.|excellent, superb|terrible|mood=+
superb|adj|extremely good|The food was superb.|excellent, outstanding|poor|mood=+
outstanding|adj|extremely good; also, not yet paid or done|She gave an outstanding performance.|excellent, exceptional|ordinary|mood=+
incredible|adj|so good or surprising it's hard to believe|The view was incredible.|amazing, unbelievable|ordinary|mood=+
marvelous|adj|extremely good|We had a marvelous time.|wonderful, splendid|awful|mood=+;forms=marvellous
splendid|adj|very good or impressive|What a splendid garden.|magnificent, wonderful|shabby|mood=+
magnificent|adj|very beautiful or impressive|The cathedral is magnificent.|splendid, grand|modest|mood=+
gorgeous|adj|very beautiful or pleasant|It's a gorgeous day.|beautiful, stunning|ugly|use=object;mood=+
stunning|adj|extremely beautiful or impressive|The sunset was stunning.|gorgeous, breathtaking||mood=+
fabulous|adj|extremely good|You look fabulous.|fantastic, wonderful||mood=+
terrific|adj|very good; also, very great in amount|You did a terrific job.|great, excellent|awful|mood=+
fun|adj|enjoyable|That was a fun party.|enjoyable, entertaining|boring|mood=+
enjoyable|adj|giving pleasure|We had an enjoyable evening.|pleasant, fun|unpleasant|mood=+
pleasant|adj|nice and enjoyable|It was a pleasant walk.|nice, agreeable|unpleasant|mood=+
unpleasant|adj|not nice or enjoyable|There's an unpleasant smell in here.|nasty, disagreeable|pleasant|mood=-
exciting|adj|making you feel excited|It was an exciting match.|thrilling, gripping|boring|mood=+
thrilling|adj|very exciting|The roller coaster was thrilling.|exciting, exhilarating|dull|mood=+
interesting|adj|holding your attention|It's an interesting book.|fascinating, engaging|boring|mood=+
fascinating|adj|extremely interesting|The documentary was fascinating.|captivating, gripping|dull|mood=+
boring|adj|not interesting|The meeting was so boring.|dull, tedious|interesting|mood=-
dull|adj|not interesting; also, not bright or shiny|It was a dull film.|boring, tedious|exciting, bright|mood=-
tedious|adj|long, slow and boring|Filling in forms is tedious.|boring, monotonous|interesting|mood=-
relaxing|adj|making you feel calm and rested|It was a relaxing weekend.|restful, soothing|stressful|mood=+
stressful|adj|causing worry and pressure|It's been a stressful week.|tense, hectic|relaxing|mood=-
exhausting|adj|making you very tired|The hike was exhausting.|tiring, draining|refreshing|mood=-
tiring|adj|making you tired|It was a tiring day.|exhausting|restful|mood=-
hectic|adj|very busy and full of activity|Mornings are hectic in our house.|frantic, busy|calm|mood=-
chaotic|adj|completely confused and disorganized|The kitchen was chaotic before the party.|messy, frantic|orderly|mood=-
tough|adj|difficult; also, strong and hard to break|It's been a tough day.|hard, difficult|easy|mood=-
challenging|adj|difficult in an interesting way|The puzzle was challenging.|demanding, tricky|easy|mood=0
tricky|adj|difficult to deal with|That's a tricky question.|difficult, awkward|simple|mood=-
successful|adj|achieving what was wanted|The bake sale was very successful.|triumphant, effective|unsuccessful|mood=+
disastrous|adj|very bad and causing a lot of harm or trouble|The first attempt was disastrous.|catastrophic|successful|mood=-
rubbish|adj|informal, British: very bad|That film was rubbish.|awful, terrible|great|mood=-
lame|adj|informal: boring or disappointing; also, unable to walk properly|That excuse is lame.|weak, feeble|cool|mood=-
so-so|adj|neither very good nor very bad|The food was so-so.|okay, average|excellent|mood=0;forms=so so
average|adj|ordinary; also, the typical amount|It was an average day.|ordinary, typical|exceptional|mood=0
alright|adj|all right; acceptable|The hotel was alright.|okay, fine||mood=0;forms=all right
decent|adj|good enough; also, honest and kind|We found a decent place to eat.|fair, adequate|poor|mood=+
ordinary|adj|normal and not special|It was an ordinary Tuesday.|normal, usual|special|mood=0
unusual|adj|not common or normal|That's an unusual name.|strange, rare|usual
usual|adj|normal; happening most of the time|I'll have my usual coffee.|normal, typical|unusual
typical|adj|having the usual features of a type of thing|It was a typical rainy Monday.|normal, classic|unusual
odd|adj|strange; also, not even, like 3 or 7|That's odd, the door was locked.|strange, weird|normal, even
crazy|adj|informal: very strange or silly; also, very enthusiastic|It was a crazy day.|wild, mad|sane
wild|adj|living in nature, not looked after by people; also, uncontrolled|We saw wild horses on the hills.|untamed, feral|tame
tame|adj|used to people and not dangerous|The deer were surprisingly tame.|gentle, domesticated|wild
colorful|adj|full of bright colors|She wore a colorful dress.|vivid, vibrant|dull|use=object;forms=colourful
vivid|adj|very bright; also, very clear and detailed|I had a vivid dream.|bright, intense|faint
pale|adj|light in color; also, having less color in your face than usual|You look pale, are you okay?|faint, light|dark|use=object
transparent|adj|clear enough to see through|The jar is transparent.|clear, see-through|opaque|use=object
sparkly|adj|shining with small flashes of light|She wore sparkly shoes.|glittery|dull|use=object
fluffy|adj|soft and light like fur or feathers|The kitten is so fluffy.|fuzzy, downy||use=object
furry|adj|covered with fur|A furry caterpillar crawled on my arm.|hairy, fuzzy||use=object
fuzzy|adj|covered with short soft hair; also, unclear|The peach has fuzzy skin.|fluffy, blurry|sharp|use=object
silky|adj|soft and smooth like silk|Her hair is silky.|smooth, sleek|rough|use=object
bumpy|adj|having an uneven surface; also, shaky|It was a bumpy ride.|uneven, rough|smooth|use=object
slippery|adj|smooth or wet and hard to hold or stand on|The floor is slippery.|slick, greasy||use=object
muddy|adj|covered with mud|My boots are muddy.|dirty, mucky|clean|use=object
dusty|adj|covered with dust|The attic is dusty.|grimy|clean|use=object
rusty|adj|covered with rust; also, out of practice|The gate is rusty.|corroded||use=object
crispy|adj|hard and dry in a pleasant way|The bacon was crispy.|crunchy, crisp|soggy
soggy|adj|wet and soft in an unpleasant way|The cereal went soggy.|mushy, sodden|crisp
creamy|adj|smooth and rich like cream|The soup was creamy.|smooth, rich
cheesy|adj|tasting of cheese; informally, also silly and overdone|That song is so cheesy.|corny
greasy|adj|covered with or containing a lot of oil or fat|The chips were greasy.|oily
bland|adj|without much flavor|The soup was bland.|tasteless|tasty, spicy
mild|adj|not strong or harsh; also, gently warm|I like mild curry.|gentle|strong, harsh
ripe|adj|ready to eat|These bananas are ripe.|mature|unripe
rotten|adj|gone bad and soft|The apple was rotten.|bad, decayed|fresh|mood=-
frozen|adj|turned to ice; also, kept very cold|The lake is frozen.|icy, chilled|thawed
boiling|adj|very hot|It's boiling outside today.|scorching, sweltering|freezing|use=weather
freezing|adj|very cold|It's freezing outside.|icy, bitter|boiling|use=weather
chilly|adj|unpleasantly cold|It's a bit chilly this morning.|cool, nippy|warm|use=weather
humid|adj|warm and damp|It's so humid today.|muggy, sticky|dry|use=weather
breezy|adj|with a light wind|It was a breezy afternoon.|windy, fresh|still|use=weather
snowy|adj|covered with or full of snow|It was a snowy morning.|||use=weather
icy|adj|very cold; also, covered with ice|The roads are icy.|freezing, frosty|warm|use=weather
misty|adj|with light fog|It was misty by the river.|foggy, hazy|clear|use=weather
clear|adj|easy to see through or understand; also, without clouds|It's a clear night.|bright, plain|cloudy, unclear|use=weather
spacious|adj|having a lot of space|The new apartment is spacious.|roomy|cramped|use=place
cramped|adj|not having enough space|The room was cramped.|crowded, tight|spacious|use=place
deserted|adj|empty of people|The beach was deserted.|empty, abandoned|crowded|use=place
private|adj|for one person or group only; also, secret|This is a private beach.|personal|public
public|adj|for everyone to use or know|There's a public library nearby.|common, shared|private
local|adj|belonging to the area where you live|We shop at the local market.|nearby, neighborhood|foreign
foreign|adj|from another country|She speaks three foreign languages.|international, overseas|local
international|adj|involving more than one country|It's an international airport.|global, worldwide|national
massive|adj|very large and heavy|They live in a massive house.|huge, enormous|tiny|use=object
mini|adj|very small|We made mini pizzas.|small, tiny|giant|use=object
compact|adj|small and neatly made|The camera is compact.|small, neat|bulky|use=object
loose|adj|not tight or firmly fixed|One of the buttons is loose.|slack|tight|use=object
tight|adj|fitting closely; also, firmly fixed|These jeans are too tight.|snug|loose|use=object
straight|adj|without bends or curves|Draw a straight line.|direct|curved, crooked|use=object
curly|adj|having curls|She has curly hair.|wavy|straight|use=object
open|adj|not closed|The door is open.|ajar|closed, shut
closed|adj|not open|The shop is closed on Sundays.|shut|open
risky|adj|involving a chance of harm or loss|Climbing without a rope is risky.|dangerous, unsafe|safe
necessary|adj|needed|Is it necessary to book?|essential, required|unnecessary
possible|adj|able to happen or be done|Is it possible to change the date?|feasible|impossible
impossible|adj|not able to happen or be done|It's impossible to sleep with this noise.|hopeless|possible
likely|adj|probably going to happen|It's likely to rain later.|probable|unlikely
unlikely|adj|probably not going to happen|It's unlikely we'll make it in time.|improbable|likely
fortunate|adj|lucky|We're fortunate to live near the sea.|lucky|unfortunate
unfortunate|adj|unlucky; also, regrettable|It was an unfortunate mistake.|unlucky|fortunate
correct|adj|right; without mistakes|That's the correct answer.|right, accurate|wrong
accurate|adj|correct in every detail|The forecast was accurate.|exact, precise|inaccurate
exact|adj|completely correct in every detail|What's the exact time?|precise, accurate|approximate
fair|adj|treating people equally and reasonably; also, light in color|That's not fair!|just, equal|unfair
unfair|adj|not treating people equally|It's unfair that he gets more.|unjust|fair|mood=-
whole|adj|complete; with nothing missing|She ate the whole pizza.|entire, complete|partial
entire|adj|whole|I spent the entire day reading.|whole, complete
extra|adj|more than usual or needed|Bring an extra jumper.|additional, spare
spare|adj|extra and available to use|Do you have a spare pen?|extra
main|adj|most important|The main entrance is around the corner.|chief, principal|minor
own|adj|belonging to a particular person|I have my own room.|personal
same|adj|not different|We have the same shoes.|identical|different
different|adj|not the same|They have different ideas.|unlike, distinct|same
similar|adj|almost the same|Our dogs look similar.|alike|different
favorite|adj|liked more than others|What's your favorite color?|preferred|least favorite|forms=favourite
precious|adj|very valuable or loved|These photos are precious to me.|treasured, valuable|worthless
valuable|adj|worth a lot of money; also, very useful|The ring is valuable.|precious, prized|worthless
worthless|adj|having no value|The old coin turned out to be worthless.||valuable
handy|adj|useful and easy to use; also, nearby|A torch is handy in a power cut.|useful, convenient
convenient|adj|easy and suitable|The station is very convenient.|handy|inconvenient
comfy|adj|informal: comfortable|This sofa is so comfy.|comfortable, cozy|uncomfortable|use=feel;mood=+
spotless|adj|completely clean|The kitchen was spotless.|immaculate|filthy|use=place
filthy|adj|very dirty|His boots were filthy.|grimy|spotless|use=object
old-fashioned|adj|no longer modern|She has old-fashioned ideas.|outdated|modern|use=object
classic|adj|of high quality and lasting; also, typical|It's a classic film.|timeless|
brand-new|adj|completely new|He bought a brand-new bike.|new|used|use=object;forms=brand new
secondhand|adj|owned by someone before|I bought a secondhand bike.|used|new|use=object;forms=second-hand
homemade|adj|made at home|She brought homemade cookies.|||forms=home-made
handmade|adj|made by hand, not by machine|She sells handmade jewelry.|||use=object;forms=hand-made
natural|adj|existing in nature, not made by people|The food uses only natural colors.|organic|artificial
artificial|adj|made by people, not natural|The flowers are artificial.|fake|natural
digital|adj|using computers or electronic signals|I prefer digital books.|electronic|analog
electric|adj|powered by electricity|We bought an electric car.|electrical
online|adj|connected to or available through the internet|I did an online course.|virtual|offline
offline|adj|not connected to the internet|I work offline on the train.||online
wireless|adj|working without wires|The headphones are wireless.
portable|adj|light and easy to carry|It's a portable speaker.|mobile||use=object
waterproof|adj|not letting water through|My jacket is waterproof.|water-resistant||use=object
broken-hearted|adj|very sad, usually because of a loss|She was broken-hearted after the breakup.|heartbroken||use=feel;mood=--;forms=brokenhearted

# Ideas, school, work and money
gratitude|n|the feeling of being thankful|She wrote a note of gratitude.|thankfulness, appreciation|ingratitude|kind=idea;mass
humor|n|the quality of being funny, or the ability to see what's funny|He has a great sense of humor.|wit, comedy||kind=idea;mass;forms=humour
imagination|n|the ability to form pictures and ideas in your mind|The story shows great imagination.|creativity, fancy||kind=idea;mass
creativity|n|the ability to make or think of new things|The class encourages creativity.|imagination, inventiveness||kind=idea;mass
inspiration|n|something that gives you new ideas or makes you want to create|The sea is her inspiration.|influence, spark||kind=idea;mass
motivation|n|the reason or wish to do something|I've lost my motivation to exercise.|drive, incentive||kind=idea;mass
ambition|n|a strong wish to achieve something|Her ambition is to be a pilot.|aspiration, goal||kind=idea
confidence|n|belief in yourself and your abilities|Practice gives you confidence.|self-assurance|doubt|kind=idea;mass
anxiety|n|a feeling of worry and unease|Exams always give me anxiety.|worry, nervousness|calm|kind=idea;mass
stress|n|worry and pressure caused by a difficult situation|Work stress is keeping me awake.|pressure, strain|relaxation|kind=idea;mass
comfort|n|a pleasant feeling of being relaxed and free from pain; also, consolation|The blanket gave him comfort.|ease, relief|discomfort|kind=idea;mass
relief|n|the good feeling when worry or pain stops|It was a relief to get home.|ease, comfort||kind=idea;mass
mood|n|how you feel at a particular time|I'm in a good mood today.|temper, spirits||kind=idea
emotion|n|a strong feeling such as joy, anger or love|She hid her emotions well.|feeling||kind=idea
feeling|n|an emotion; also, something you sense physically|I have a good feeling about this.|emotion, sense||kind=idea
excitement|n|the feeling of being excited|The kids couldn't hide their excitement.|thrill, eagerness|boredom|kind=idea;mass
boredom|n|the feeling of being bored|Boredom set in by the third hour.|tedium|excitement|kind=idea;mass
loneliness|n|the feeling of being lonely|Loneliness can be hard in a new city.|isolation||kind=idea;mass
jealousy|n|the feeling of being jealous|Jealousy can spoil a friendship.|envy||kind=idea;mass
shame|n|a painful feeling of having done something wrong; also, something regrettable|It's a shame you can't come.|guilt, pity|pride|kind=idea;mass
guilt|n|the feeling of having done something wrong|He felt guilt for missing her party.|shame, remorse|innocence|kind=idea;mass
surprise|n|something unexpected; also, the feeling it causes|We have a surprise for you.|shock, astonishment||kind=idea
wonder|n|a feeling of amazement; also, something amazing|The kids stared at the snow in wonder.|awe, amazement||kind=idea;mass
awe|n|a feeling of great respect and wonder|We stood in awe of the mountains.|wonder, amazement||kind=idea;mass
compassion|n|a feeling of sympathy and wanting to help|She treats every patient with compassion.|empathy, kindness|cruelty|kind=idea;mass
sympathy|n|the feeling of being sorry for someone's trouble|You have my sympathy.|compassion, pity||kind=idea;mass
forgiveness|n|stopping being angry with someone for something they did|She asked for forgiveness.|pardon, mercy|blame|kind=idea;mass
honesty|n|the quality of being honest|I appreciate your honesty.|truthfulness, sincerity|dishonesty|kind=idea;mass
loyalty|n|being loyal to someone|The dog's loyalty was touching.|faithfulness, devotion|betrayal|kind=idea;mass
relationship|n|the way two people or things are connected; also, a romantic partnership|They have a close relationship.|connection, bond||kind=idea
marriage|n|the relationship between two people who are married|Their marriage has lasted forty years.|partnership||kind=idea
childhood|n|the time when you are a child|I had a happy childhood by the sea.|youth|adulthood|kind=idea
tradition|n|a custom or belief passed down over time|It's a family tradition to bake on Sundays.|custom, ritual||kind=idea
culture|n|the way of life, arts and ideas of a group of people|I love learning about other cultures.|civilization, heritage||kind=idea
religion|n|belief in a god or gods and the practices that go with it|They respect each other's religion.|faith, belief||kind=idea
belief|n|something you think is true|It's my belief that people are mostly kind.|opinion, conviction|doubt|kind=idea
doubt|n|a feeling of not being sure|I have my doubts about the plan.|uncertainty|certainty|kind=idea
mystery|n|something that is hard to explain or understand|Where the cat went is a mystery.|puzzle, enigma||kind=idea;plural=mysteries
miracle|n|a wonderful event that seems impossible|It was a miracle no one was hurt.|marvel, wonder||kind=idea
magic|n|power in stories to make impossible things happen; also, tricks that seem impossible|The magician did some magic.|sorcery, wizardry||kind=idea;mass
experience|n|knowledge or skill from doing something; also, something that happens to you|Swimming with dolphins was an amazing experience.|event, knowledge||kind=idea
opportunity|n|a chance to do something|This job is a great opportunity.|chance, opening||kind=idea;plural=opportunities
chance|n|a possibility or opportunity; also, luck|There's a chance of rain.|possibility, opportunity||kind=idea
risk|n|the possibility of something bad happening|There's a risk of flooding.|danger, hazard|safety|kind=idea
danger|n|the possibility of harm|The sign warns of danger.|risk, threat|safety|kind=idea
safety|n|being safe from harm|Wear a helmet for safety.|security|danger|kind=idea;mass
health care|n|the services that look after people's health|Health care is free here.|medical care||kind=idea;mass;forms=healthcare
fitness|n|being healthy and strong, especially from exercise|She cycles for fitness.|health, strength||kind=idea;mass
diet|n|the food you usually eat; also, eating less to lose weight|A balanced diet keeps you healthy.|||kind=idea
routine|n|the usual order in which you do things|My morning routine starts with coffee.|habit, schedule||kind=idea
schedule|n|a plan of when things will happen|My schedule is full this week.|timetable, agenda||kind=idea
topic|n|a subject that people talk or write about|What's the topic of your essay?|subject, theme||kind=idea
subject|n|a thing being discussed; also, an area of study at school|My favorite subject is art.|topic, course||kind=idea
education|n|teaching and learning, especially at school|Education opens doors.|schooling, learning||kind=idea;mass
grade|n|a mark for school work; also, a year or level at school|I got a good grade in math.|mark, score||kind=idea
score|n|the number of points someone gets in a game or test|What's the score?|result, points||kind=idea
result|n|what happens because of something; also, a final score|The results come out on Friday.|outcome, consequence|cause|kind=idea
mark|n|a grade for school work; also, a small spot or stain|She got full marks on the test.|grade, score||kind=idea
degree|n|a qualification from a university; also, a unit for measuring temperature or angles|She has a degree in biology.|qualification||kind=idea
certificate|n|an official document that proves something|I got a certificate for finishing the course.|diploma||kind=thing
diploma|n|a document showing you have completed a course of study|He framed his diploma.|certificate||kind=thing
scholarship|n|money given to a student to help pay for their education|She won a scholarship to university.|grant, bursary||kind=idea
break|n|a short rest from work or school|Let's take a five-minute break.|rest, pause||kind=idea
recess|n|a break between lessons at school|The kids played tag at recess.|break, playtime||kind=idea;mass
semester|n|half of a school or university year|The new semester starts in January.|term||kind=idea
term|n|a part of the school year; also, a word with a particular meaning|The summer term ends in July.|semester, session||kind=idea
salary|n|money paid to someone for their work, usually every month|She got a higher salary at her new job.|pay, wages||kind=idea;plural=salaries
pay|n|money you get for working|The pay is good but the hours are long.|wages, salary||kind=idea;mass
bill|n|a statement of money owed; also, a banknote|Can we have the bill, please?|check, invoice||kind=thing
receipt|n|a piece of paper showing that you have paid|Keep the receipt in case it breaks.|proof of purchase||kind=thing
price|n|the amount of money something costs|The price of coffee went up.|cost, charge||kind=idea
cost|n|the amount of money needed to buy or do something|The cost of the trip was high.|price, expense||kind=idea
budget|n|a plan for how to spend money|We're on a tight budget this month.|allowance||kind=idea
savings|n|money you have saved|I spent my savings on a bike.|nest egg||kind=idea;mass
debt|n|money that you owe|They paid off their debts.|loan||kind=idea
loan|n|money that you borrow and must pay back|We took out a loan for the car.|credit||kind=idea
rent|n|money paid regularly to use a house or room|The rent is due on the first.|||kind=idea;mass
tax|n|money paid to the government|Prices include tax.|duty||kind=idea;plural=taxes
discount|n|a reduction in the usual price|Students get a discount.|reduction, sale||kind=idea
sale|n|selling something; also, a time when prices are lower|The shoes were on sale.|discount||kind=event;event=joy
bargain|n|something bought for less than its usual price|The bike was a bargain.|deal, steal||kind=idea
cash|n|money in coins or notes|Do you take cash?|money||kind=thing;mass
credit card|n|a card you use to buy things now and pay later|Can I pay by credit card?|||kind=thing
business|n|buying and selling things; also, a company|She runs a small business.|company, firm||kind=idea;plural=businesses
company|n|a business; also, being with other people|He works for a tech company.|business, firm||kind=idea;plural=companies
shift|n|a period of work, especially at a particular time; also, a change|I'm working the night shift.|stint||kind=event;event=luck
overtime|n|extra time worked beyond normal hours|I worked overtime this week.|||kind=idea;mass
commute|n|the regular journey between home and work|My commute takes an hour.|journey||kind=idea
task|n|a piece of work to be done|My first task is to answer emails.|job, chore||kind=idea
progress|n|movement toward finishing or improving something|We're making good progress.|advance, headway||kind=idea;mass
excuse|n|a reason given to explain something you did or didn't do|What's your excuse for being late?|reason, explanation||kind=idea
apology|n|a statement saying you are sorry|She accepted his apology.|||kind=idea;plural=apologies
compliment|n|something nice said about someone|Thanks for the compliment.|praise, flattery|insult|kind=idea
complaint|n|a statement that something is wrong or not good enough|We made a complaint about the noise.|grievance|praise|kind=idea
argument|n|an angry disagreement; also, a reason given for an opinion|They had an argument about money.|quarrel, row||kind=idea
conversation|n|a talk between two or more people|We had a long conversation.|chat, talk||kind=idea
chat|n|a friendly, informal talk|We had a chat over coffee.|talk, conversation||kind=idea
discussion|n|a conversation about a particular subject|The discussion went on for hours.|debate, talk||kind=idea
speech|n|a formal talk to an audience; also, the ability to speak|She gave a speech at the wedding.|address, talk||kind=event;event=luck;plural=speeches
rumor|n|a story passed around that may not be true|There's a rumor the café is closing.|gossip, hearsay||kind=idea;forms=rumour
information|n|facts about something|The website has more information.|details, data||kind=idea;mass
detail|n|a small fact or feature|She remembered every detail.|particular, point||kind=idea
example|n|something that shows what others of its kind are like|Can you give me an example?|instance, sample||kind=idea
instruction|n|a statement telling you how to do something|Read the instructions first.|direction, guideline||kind=idea
warning|n|a statement that something bad might happen|There's a storm warning tonight.|alert, caution||kind=idea
address|n|the details of where someone lives; also, a formal speech|What's your address?|||kind=idea;plural=addresses
direction|n|the way something is going or facing; also, an instruction|Which direction is the station?|way, route||kind=idea
distance|n|the amount of space between two places|What's the distance to the coast?|length, span||kind=idea
traffic|n|vehicles moving on roads|The traffic was terrible this morning.|congestion||kind=idea;mass
delay|n|a time when something happens later than expected|There's a delay on the trains.|holdup, wait||kind=idea
queue|n|a line of people waiting|There was a long queue at the bakery.|line||kind=idea
reservation|n|a booking for a seat, table or room|We have a reservation for eight.|booking||kind=idea
invitation|n|a request to come to an event|Thanks for the invitation.|invite||kind=idea;forms=invite
reminder|n|something that makes you remember|I set a reminder for her birthday.|prompt, note||kind=idea
alarm|n|a loud warning sound; also, a clock that wakes you|My alarm goes off at six.|siren||kind=thing
getaway|n|a short holiday; also, an escape|We booked a beach getaway.|break, trip||kind=event;event=joy
staycation|n|a holiday spent at home or near home|We're having a staycation this year.|||kind=event;event=joy
day off|n|a day when you don't have to work|Tomorrow's my day off.|holiday||kind=event;event=joy;plural=days off
sick day|n|a day off work or school because you are ill|I'm taking a sick day.|||kind=event;event=sorry
power cut|n|a time when the electricity supply stops|We had a power cut during the storm.|blackout, outage||kind=event;event=sorry;forms=power outage,blackout
flat tire|n|a tire with no air in it|We had a flat tire on the highway.|puncture||kind=event;event=sorry;forms=flat tyre
hangover|n|feeling ill after drinking too much alcohol|He woke up with a hangover.|||kind=idea
jet lag|n|tiredness after flying across time zones|I still have jet lag.|||kind=idea;mass
nightmare|n|a frightening dream; also, a very unpleasant experience|I had a nightmare about spiders.|bad dream||kind=idea
daydream|n|pleasant thoughts that take your mind away from what you're doing|She was lost in a daydream.|reverie||kind=idea
bucket list|n|a list of things you want to do in your life|Skydiving is on my bucket list.|||kind=idea
challenge|n|something difficult that tests your ability|Running a marathon is a big challenge.|test, trial||kind=idea
victory|n|winning a game, competition or fight|The team celebrated their victory.|win, triumph|defeat|kind=idea;plural=victories
defeat|n|losing a game, competition or fight|It was a narrow defeat.|loss|victory|kind=idea
prize|n|something given to the winner|She won first prize.|award, trophy||kind=thing
award|n|a prize for achievement|He got an award for bravery.|prize, honor||kind=thing
trophy|n|a cup or other object given as a prize|The trophy sits on the shelf.|cup, award||kind=thing;plural=trophies
medal|n|a piece of metal given as a prize or honor|She won a gold medal.|||kind=thing
record|n|the best ever result; also, a written account|He broke the world record.|||kind=idea
skill|n|the ability to do something well|Cooking is a useful skill.|ability, talent||kind=idea
talent|n|a natural ability to do something well|She has a talent for music.|gift, flair||kind=idea
ability|n|the power or skill to do something|He has the ability to make anyone laugh.|skill, capacity||kind=idea;plural=abilities
strength|n|being strong; also, a good quality|Patience is one of her strengths.|power, might|weakness|kind=idea
weakness|n|being weak; also, a fault|Chocolate is my weakness.|flaw|strength|kind=idea
attention|n|careful watching or listening|Pay attention to the road.|focus, notice||kind=idea;mass
focus|n|the center of attention; also, concentration|Her focus is on her studies.|concentration||kind=idea;mass
balance|n|being steady and not falling; also, a fair mix|It's all about balance.|equilibrium, stability||kind=idea;mass
chaos|n|complete confusion and disorder|The kitchen was chaos.|disorder, mayhem|order|kind=idea;mass
order|n|neat arrangement; also, a request for something|The books are in alphabetical order.|arrangement|chaos|kind=idea
mess|n|an untidy or dirty state|Sorry about the mess.|clutter, muddle||kind=idea
sound|n|something you hear|I love the sound of rain.|noise, tone|silence|kind=idea
smell|n|what you notice with your nose|The smell of bread filled the house.|scent, aroma||kind=idea
taste|n|the flavor of something; also, what you like|This has a sweet taste.|flavor||kind=idea
touch|n|the sense of feeling with your skin; also, a small amount|A touch of salt.|feel, contact||kind=idea
sight|n|the ability to see; also, something seen|The sunset was a beautiful sight.|vision, view||kind=idea
view|n|what you can see from a place; also, an opinion|The view from the top is amazing.|scene, outlook||kind=idea
shape|n|the form of the outside of something|It's in the shape of a heart.|form, outline||kind=idea
size|n|how big or small something is|What size shoes do you wear?|dimensions||kind=idea
color|n|red, blue, green and so on|What color is your car?|shade, hue||kind=idea;forms=colour
weight|n|how heavy something is|What's the weight of the parcel?|heaviness||kind=idea
height|n|how tall or high something is|What's your height?|tallness||kind=idea
age|n|how old someone or something is|What age is your daughter?|||kind=idea
birthday party|n|a party to celebrate someone's birthday|We're having a birthday party on Sunday.|||kind=event;event=joy

# Adverbs, little words, numbers and holidays
well|adv|in a good or satisfactory way|The interview went well.|nicely, smoothly|badly|mood=+
badly|adv|in a bad or poor way; also, very much|The exam went badly.|poorly|well|mood=-
brilliantly|adv|extremely well|She played brilliantly.|superbly|poorly|use=manner;mood=+
terribly|adv|very badly; also, very|I slept terribly last night.|awfully, dreadfully|well|mood=-
perfectly|adv|in a perfect way; also, completely|It went perfectly.|flawlessly, completely||use=manner;mood=+
smoothly|adv|without problems|The move went smoothly.|easily||use=manner;mood=+
easily|adv|without difficulty|She won easily.|effortlessly|with difficulty|use=manner
fast|adv|quickly|Don't drive so fast.|quickly, rapidly|slowly
hard|adv|with a lot of effort|She works hard.|diligently
gladly|adv|willingly and happily|I'll gladly help.|happily, willingly|reluctantly|use=manner
kindly|adv|in a kind way; also, please|She kindly offered me a lift.|generously|unkindly|use=manner
angrily|adv|in an angry way|He slammed the door angrily.|furiously|calmly|use=manner
bravely|adv|in a brave way|She bravely stepped forward.|courageously|timidly|use=manner
carelessly|adv|without enough care|He carelessly dropped his phone.|recklessly|carefully|use=manner
gracefully|adv|in a smooth, elegant way|The swan glided gracefully.|elegantly|clumsily|use=manner
clumsily|adv|in an awkward way|He clumsily knocked over the vase.|awkwardly|gracefully|use=manner
silently|adv|without any sound|The cat crept silently across the room.|quietly, noiselessly|loudly|use=manner
quick|adv|informal: quickly|Come here quick!|fast
slow|adv|informal: slowly|Go slow on the ice.
early|adv|before the usual or expected time|We left early to beat the traffic.||late
late|adv|after the expected time|I woke up late.||early
recently|adv|not long ago|I recently started running.|lately, newly
lately|adv|recently|Have you seen her lately?|recently
nowadays|adv|at the present time, compared with the past|Nowadays everyone has a phone.|these days|
someday|adv|at some time in the future|I'd love to visit Japan someday.|one day, eventually|
eventually|adv|in the end, after a long time|We eventually found the hotel.|finally, ultimately
immediately|adv|at once|Call me immediately if anything happens.|instantly, right away|later
instantly|adv|at once|The pain stopped instantly.|immediately|
once|adv|one time; also, in the past|I've been there once.|formerly
twice|adv|two times|I've seen that film twice.
forever|adv|for all time; informally, for a very long time|This queue is taking forever.|always, eternally|briefly
ever|adv|at any time|Have you ever been to Paris?|at any time|never
yet|adv|until now; also, still|Have you eaten yet?|so far, still
just|adv|only; also, very recently; also, exactly|I just got home.|only, simply
only|adv|no more than; also, solely|I only have five dollars.|just, merely
even|adv|used to emphasize something surprising|Even the dog was excited.
also|adv|in addition; too|I also bought some milk.|too, as well
too|adv|also; also, more than enough|It's too hot.|also, excessively
quite|adv|fairly; also, completely|It's quite cold today.|fairly, rather
rather|adv|fairly; also, more willingly|It's rather late.|quite, fairly
pretty|adv|informal: fairly|It's pretty good.|fairly, quite
fairly|adv|to a moderate degree; also, in a fair way|The film was fairly good.|quite, reasonably
extremely|adv|to a very great degree|It's extremely cold.|very, exceedingly|slightly
totally|adv|completely|I totally forgot.|completely, entirely|partly
completely|adv|in every way|I completely agree.|totally, fully|partly
absolutely|adv|completely; also, used to strongly agree|Absolutely, let's go.|completely, definitely
exactly|adv|precisely; also, used to agree|That's exactly what I meant.|precisely
nearly|adv|almost|I'm nearly finished.|almost
hardly|adv|almost not|I can hardly hear you.|barely, scarcely
barely|adv|only just; almost not|I barely slept.|hardly, scarcely
slightly|adv|a little|I'm slightly worried.|a little, somewhat|very
especially|adv|more than usual or more than others|I love summer, especially the long evenings.|particularly
actually|adv|in fact; really|Actually, I'm quite tired.|really, in fact
basically|adv|in the most important ways; also, simply|It's basically a big sandwich.|essentially
certainly|adv|without doubt|I'll certainly be there.|definitely, surely
clearly|adv|in a clear way; also, obviously|She spoke clearly.|plainly, obviously
obviously|adv|in a way that is easy to see|Obviously, we need more chairs.|clearly, evidently
seriously|adv|in a serious way; also, informally, really|Seriously, that was amazing.|gravely
luckily|adv|by good luck|Luckily, it stopped raining.|fortunately|unfortunately
fortunately|adv|luckily|Fortunately, nobody was hurt.|luckily|unfortunately
unfortunately|adv|sadly; by bad luck|Unfortunately, the shop was closed.|sadly|fortunately
hopefully|adv|it is hoped that|Hopefully it'll be sunny.
apparently|adv|it seems; according to what people say|Apparently it's going to snow.|seemingly
anyway|adv|in any case; also, used to change the subject|It's raining, but let's go anyway.|regardless||forms=anyhow
otherwise|adv|if not; also, in a different way|Hurry, otherwise we'll miss it.|or else
instead|adv|in place of something else|Let's walk instead.|rather
therefore|adv|for that reason|It's raining, therefore we'll stay in.|so, thus
meanwhile|adv|at the same time|Meanwhile, the soup was boiling over.|at the same time
afterward|adv|later; after something|We had dinner and went for a walk afterward.|later|beforehand|forms=afterwards
beforehand|adv|before something else happens|Call me beforehand.|in advance|afterward
alone|adv|without other people|She lives alone.|by yourself|together
away|adv|to or at a distance; also, not at home|We're away next week.|gone
back|adv|to an earlier place or state|I'll be back soon.
home|adv|to or at the place where you live|I'm going home.
here|adv|in or to this place|Come here.||there
there|adv|in or to that place|Put it over there.||here
up|adv|toward a higher place|Look up at the stars.|upward|down
down|adv|toward a lower place|Sit down.|downward|up
along|adv|forward; also, with someone|Come along with us.|onward
around|adv|in a circle; also, nearby|Turn around.|about
straight|adv|directly; also, in a straight line|Go straight home.|directly
and|conj|used to join words or ideas|I like tea and cake.|plus
but|conj|used to add something different or surprising|It's sunny but cold.|however, yet
or|conj|used to give a choice|Tea or coffee?
so|conj|for that reason; also, in order that|It was raining, so we stayed in.|therefore
if|conj|on the condition that|We'll go if it's sunny.|provided
unless|conj|except if|We'll go unless it rains.|except if
while|conj|during the time that; also, although|I read while he cooked.|whilst, whereas
when|conj|at the time that|Call me when you arrive.
before|conj|earlier than the time that|Wash your hands before you eat.||after
after|conj|later than the time that|We'll go after lunch.||before
until|conj|up to the time that|Wait until the light is green.|till||forms=till
since|conj|from a time in the past until now; also, because|I've lived here since I was five.|because
though|conj|although; despite the fact that|It was cold, though sunny.|although
whether|conj|used to show a choice between possibilities|I don't know whether to go.|if
in|prep|inside; also, during|The cat is in the box.|inside|out
on|prep|touching the top surface of something; also, about|The book is on the table.|upon|off
under|prep|below something|The dog is under the table.|beneath, below|over
over|prep|above or across something|A plane flew over the house.|above, across|under
behind|prep|at the back of|The garden is behind the house.||in front of
beside|prep|next to|Sit beside me.|next to
near|prep|not far from|We live near the beach.|close to|far from
through|prep|from one side to the other of|We walked through the forest.
across|prep|from one side to the other|We swam across the lake.
toward|prep|in the direction of|She walked toward the door.|towards||forms=towards
without|prep|not having|I can't sleep without my pillow.||with
with|prep|in the company of; also, using|I went with my sister.||without
during|prep|all through a period of time|It rained during the night.|throughout
against|prep|touching for support; also, opposed to|Lean the bike against the wall.||for
among|prep|in the middle of a group|She was among friends.|amid||forms=amongst
around|prep|on every side of; also, approximately|We sat around the fire.|about
it|pron|the thing already mentioned|I bought a book and loved it.
they|pron|the people or things already mentioned; also, one person whose gender isn't known|They said they'd be late.
we|pron|the speaker and others|We went to the beach.
you|pron|the person or people being spoken to|Are you coming?
I|pron|the person speaking|I like this song.
something|pron|a thing that isn't named|I need something to eat.
nothing|pron|not anything|There's nothing in the fridge.|zero|everything
everything|pron|all things|Everything is ready.|all|nothing
anything|pron|any thing at all|Do you need anything?
anyone|pron|any person|Is anyone home?|anybody||forms=anybody
somebody|pron|a person, without saying who|Somebody left the door open.|someone
everybody|pron|every person|Everybody loved the cake.|everyone
zero|n|the number 0; nothing|The score was zero.|nought, nil||kind=idea
one|n|the number 1|One is the loneliest number.|||kind=idea;nogen
hundred|n|the number 100|There were a hundred people there.|||kind=idea;nogen
thousand|n|the number 1,000|A thousand thanks.|||kind=idea;nogen
million|n|the number 1,000,000|A million people live there.|||kind=idea;nogen
half|n|one of two equal parts|I ate half of the pizza.|||kind=idea;plural=halves
quarter|n|one of four equal parts; also, fifteen minutes|A quarter of the cake is left.|||kind=idea
dozen|n|twelve|I bought a dozen eggs.|||kind=idea
couple|n|two people in a relationship; also, two or a few|A couple of friends came over.|pair, duo||kind=idea
pair|n|two things that go together|I need a new pair of shoes.|couple, set||kind=idea
lot|n|a large number or amount|I have a lot of work.|plenty, heaps||kind=idea
bit|n|a small amount|I'm a bit tired.|little, touch||kind=idea;nogen
piece|n|a part of something|Can I have a piece of cake?|slice, bit||kind=idea
second|n|a sixtieth of a minute; also, a very short time|Wait a second.|moment, instant||kind=idea
minute|n|sixty seconds; also, a short time|I'll be there in a minute.|moment||kind=idea
hour|n|sixty minutes|The film lasts two hours.|||kind=idea
midnight|n|twelve o'clock at night|We stayed up until midnight.|||kind=time;mass
noon|n|twelve o'clock in the middle of the day|Let's meet at noon.|midday||kind=time;mass;forms=midday
dawn|n|the first light of day|We set off at dawn.|daybreak, sunrise|dusk|kind=time;mass
dusk|n|the time just before it gets dark|The bats come out at dusk.|twilight, sunset|dawn|kind=time;mass
decade|n|a period of ten years|They've lived here for a decade.|||kind=idea
century|n|a period of a hundred years|The house is a century old.|||kind=idea;plural=centuries
Christmas|n|the Christian festival on December 25, celebrating the birth of Jesus|We spend Christmas with my grandparents.|xmas||kind=event;event=joy;mass
Halloween|n|the festival on October 31, when children dress up and collect sweets|What are you dressing up as for Halloween?|||kind=event;event=joy;mass
New Year|n|the start of a calendar year, and its celebration|Happy new year!|||kind=event;event=joy;mass;forms=new year's,new years
Thanksgiving|n|a holiday for giving thanks, in the US in November and in Canada in October|We cook a turkey at Thanksgiving.|||kind=event;event=joy;mass
Easter|n|the Christian festival celebrating Jesus rising from the dead, in spring|We painted eggs for Easter.|||kind=event;event=joy;mass
Valentine's Day|n|the day, February 14, when people send cards and gifts to someone they love|We had dinner out for Valentine's Day.|valentines||kind=event;event=joy;mass;forms=valentines day
Eid|n|either of two Muslim festivals, one marking the end of Ramadan|We visited family for Eid.|||kind=event;event=joy;mass
Diwali|n|the Hindu festival of lights, in autumn|We lit lamps for Diwali.|||kind=event;event=joy;mass
Hanukkah|n|the eight-day Jewish festival of lights, in winter|We light candles for Hanukkah.|chanukah||kind=event;event=joy;mass;forms=chanukah
Lunar New Year|n|the new year festival of the lunar calendar, celebrated in China and elsewhere|We had dumplings for Lunar New Year.|chinese new year||kind=event;event=joy;mass;forms=chinese new year

# Weather, materials, science and the body
breeze|n|a gentle wind|A cool breeze came off the sea.|draft, puff|gale|kind=nature
gale|n|a very strong wind|The gale blew down the fence.|storm, gust|breeze|kind=nature
hurricane|n|a violent storm with very strong winds|The hurricane hit the coast overnight.|cyclone, typhoon||kind=nature;forms=cyclone,typhoon
tornado|n|a violent spinning column of wind|The tornado tore the roof off the barn.|twister||kind=nature;plural=tornadoes
flood|n|a large amount of water covering land that is usually dry|The flood reached the doorstep.|deluge|drought|kind=nature
drought|n|a long period with little or no rain|The drought dried up the river.|dry spell|flood|kind=nature
earthquake|n|a sudden shaking of the ground|The earthquake rattled the windows.|tremor, quake||kind=nature
heatwave|n|a period of unusually hot weather|We had a heatwave in August.|hot spell||kind=nature;forms=heat wave
frost|n|a thin layer of ice on surfaces in very cold weather|There was frost on the car this morning.|ice, rime||kind=nature;mass
fog|n|thick cloud close to the ground that is hard to see through|The fog rolled in from the sea.|mist, haze||kind=nature;mass
mist|n|a thin fog|A mist hung over the lake.|haze, fog||kind=nature;mass
hail|n|small balls of ice that fall like rain|Hail bounced off the car roof.|||kind=nature;mass
drizzle|n|light, fine rain|It's only a drizzle, let's go.|spitting||kind=nature;mass
puddle|n|a small pool of water on the ground|The kids jumped in every puddle.|pool||kind=nature
wave|n|a moving ridge of water on the sea|A big wave knocked me over.|breaker, swell||kind=nature
tide|n|the regular rise and fall of the sea|The tide is coming in.|current||kind=nature
current|n|a flow of water or air in one direction; also, a flow of electricity|The current pulled the boat out to sea.|flow, stream||kind=nature
sunshine|n|the light and warmth of the sun|We sat in the sunshine.|sunlight||kind=nature;mass
sunlight|n|the light from the sun|Sunlight streamed through the window.|daylight, sunshine||kind=nature;mass
shade|n|an area out of direct sunlight; also, a slight difference in color|Let's sit in the shade.|shadow||kind=nature;mass
shadow|n|a dark shape made when something blocks light|The tree cast a long shadow.|shade||kind=nature
darkness|n|the absence of light|We walked home in the darkness.|dark, gloom|light|kind=nature;mass
air|n|the mixture of gases around the earth that we breathe|Let's get some fresh air.|atmosphere||kind=nature;mass
oxygen|n|a gas in the air that people and animals need to live|Plants give off oxygen.|||kind=idea;mass
smoke|n|the gray or black gas that rises from something burning|Smoke curled up from the chimney.|fumes||kind=nature;mass
steam|n|the hot gas that water turns into when it boils|Steam rose from the kettle.|vapor||kind=nature;mass
soil|n|the earth that plants grow in|The soil here is rich and dark.|earth, dirt||kind=nature;mass
dirt|n|soil; also, anything that makes something unclean|The kids were covered in dirt.|soil, grime||kind=nature;mass
dust|n|tiny dry particles of earth or dirt|The shelf is covered in dust.|||kind=nature;mass
pebble|n|a small smooth stone|She skimmed a pebble across the lake.|stone||kind=thing
crystal|n|a clear mineral like glass; also, a regular shape some substances form|She hung a crystal in the window.|||kind=thing
diamond|n|a very hard, clear, valuable stone; also, a shape with four equal sides|Her ring has a tiny diamond.|gem||kind=thing
gold|n|a precious yellow metal|The ring is made of gold.|||kind=thing;mass
silver|n|a precious shiny gray metal; also, its color|She polished the silver.|||kind=thing;mass
metal|n|a hard, shiny material such as iron, steel or gold|The gate is made of metal.|||kind=thing;mass
iron|n|a strong metal; also, a device for smoothing clothes|The old bridge is made of iron.|||kind=thing;mass;nogen
steel|n|a strong metal made from iron|The pan is stainless steel.|||kind=thing;mass
wood|n|the hard material of a tree's trunk and branches|The table is made of oak wood.|timber, lumber||kind=thing;mass
plastic|n|a light, man-made material that can be shaped|Try to use less plastic.|||kind=thing;mass
cotton|n|a soft material made from the fibers of a plant|My shirt is made of cotton.|||kind=thing;mass
wool|n|the soft hair of sheep, or yarn and cloth made from it|She knitted a scarf from blue wool.|yarn||kind=thing;mass
silk|n|a smooth, shiny cloth made from threads spun by silkworms|Her scarf is made of silk.|||kind=thing;mass
leather|n|material made from animal skin|He has a leather jacket.|hide||kind=thing;mass
rubber|n|a stretchy material made from the sap of a tree or chemicals|The boots are made of rubber.|||kind=thing;mass
concrete|n|a hard building material made from cement, sand and water|The path is made of concrete.|cement||kind=thing;mass
brick|n|a block of baked clay used for building|The house is built of red brick.|||kind=thing
clay|n|soft earth that can be shaped and baked hard|We made bowls out of clay.|||kind=thing;mass
fabric|n|cloth|She chose a bright fabric for the curtains.|cloth, material||kind=thing
electricity|n|the power that makes lights, heaters and machines work|The storm cut off the electricity.|power||kind=idea;mass
fuel|n|something burned to make heat or power, like gas or petrol|The car is low on fuel.|gas, petrol||kind=thing;mass
gas|n|a substance like air; in American English, also petrol|We need to stop for gas.|fuel, petrol||kind=thing;mass;forms=petrol,gasoline
experiment|n|a scientific test to find something out|We did an experiment with magnets.|test, trial||kind=idea
theory|n|an idea that explains something; also, the principles of a subject|Darwin's theory of evolution.|hypothesis, idea|practice|kind=idea;plural=theories
discovery|n|finding something for the first time|The discovery of penicillin saved millions.|find||kind=idea;plural=discoveries
invention|n|something new that someone has made or designed|The telephone was a great invention.|creation, innovation||kind=idea
atom|n|the smallest part of a chemical element|Everything is made of atoms.|particle||kind=idea
gravity|n|the force that pulls things toward the earth|Gravity keeps our feet on the ground.|||kind=idea;mass
magnet|n|a piece of metal that pulls iron toward it|The fridge is covered in magnets.|||kind=thing
robot|n|a machine that can do tasks by itself|The robot vacuums the floor.|android, automaton||kind=thing
machine|n|a device with moving parts that does work|The machine makes coffee.|device, appliance||kind=thing
engine|n|a machine that makes something move, like a car|The engine won't start.|motor||kind=thing
wheel|n|a round object that turns to help something move|The car has a flat wheel.|||kind=thing
tool|n|an object you hold and use to do a job|A hammer is a useful tool.|implement, device||kind=thing
technology|n|machines and devices made using science; also, the study of them|Technology changes so fast.|tech||kind=idea;plural=technologies
science fiction|n|stories about imagined future science and technology|She loves reading science fiction.|sci-fi||kind=idea;mass;forms=sci-fi
fiction|n|stories about imaginary people and events|I mostly read fiction.|stories|fact, nonfiction|kind=idea;mass
poetry|n|poems in general|She writes poetry in the evenings.|verse||kind=idea;mass
literature|n|written works such as novels, poems and plays, especially of lasting value|She studies English literature.|writing||kind=idea;mass
geography|n|the study of the earth's surface, countries and people|We learned about rivers in geography.|||kind=idea;mass
biology|n|the study of living things|Biology is my favorite subject.|||kind=idea;mass
chemistry|n|the study of substances and how they react|We mixed colors in chemistry.|||kind=idea;mass
physics|n|the study of matter, energy, force and motion|Physics explains how bridges stand up.|||kind=idea;mass
astronomy|n|the study of stars, planets and space|Astronomy is my hobby.|||kind=idea;mass
economics|n|the study of how money, goods and services work in society|She studied economics at university.|||kind=idea;mass
psychology|n|the study of the mind and behavior|Psychology helps explain why we dream.|||kind=idea;mass
philosophy|n|the study of the nature of knowledge, reality and how to live|We argued about philosophy all night.|||kind=idea;mass
chin|n|the part of the face below the mouth|He rested his chin on his hand.|||kind=body
cheek|n|the side of the face below the eye|She kissed him on the cheek.|||kind=body
forehead|n|the part of the face above the eyes|I bumped my forehead on the shelf.|brow||kind=body
lip|n|one of the two soft edges of the mouth|My lips are chapped.|||kind=body
eyebrow|n|the line of hair above the eye|He raised an eyebrow.|brow||kind=body
eyelash|n|one of the small hairs on the edge of the eyelid|You have an eyelash on your cheek.|lash||kind=body
jaw|n|the bones that hold the teeth|My jaw aches after the dentist.|||kind=body
elbow|n|the joint in the middle of the arm|I banged my elbow on the door.|||kind=body
wrist|n|the joint between the hand and the arm|I sprained my wrist playing tennis.|||kind=body
thumb|n|the short thick finger at the side of the hand|I hit my thumb with the hammer.|||kind=body
fingernail|n|the hard covering at the end of a finger|I broke a fingernail.|nail||kind=body
chest|n|the front of the body between the neck and the stomach|My chest feels tight.|breast||kind=body;plural=chests
belly|n|the stomach|The puppy rolled over for a belly rub.|tummy, stomach||kind=body;plural=bellies
hip|n|the part of the body where the leg joins it|My hip aches when it's cold.|||kind=body
ankle|n|the joint between the foot and the leg|I twisted my ankle on the stairs.|||kind=body
heel|n|the back part of the foot|My new shoes hurt my heel.|||kind=body
muscle|n|a part of the body that tightens to move bones|My muscles are sore after the gym.|||kind=body
bone|n|one of the hard parts inside the body|He broke a bone in his foot.|||kind=body
blood|n|the red liquid that moves around the body|He gave blood at the hospital.|||kind=body;mass
lung|n|one of the two organs in the chest used for breathing|Swimming is good for your lungs.|||kind=body
voice|n|the sound you make when you speak or sing|She has a lovely voice.|||kind=body
body|n|the whole physical form of a person or animal|Listen to your body.|physique||kind=body;plural=bodies
mind|n|the part of you that thinks, feels and remembers|Let me clear my mind.|brain, intellect||kind=idea
breath|n|air going in and out of your lungs|Take a deep breath.|||kind=idea
sneeze|n|a sudden burst of air from the nose and mouth|Bless you, that was a big sneeze.|||kind=idea
cough|n|a noisy push of air from the throat; also, an illness with coughing|I have a bad cough.|||kind=idea
sore throat|n|a painful throat, often from a cold|I have a sore throat.|||kind=idea
toothache|n|a pain in a tooth|I have a toothache.|||kind=idea
stomachache|n|a pain in the stomach|I have a stomachache after all that cake.|tummy ache||kind=idea;forms=stomach ache,tummy ache
backache|n|a pain in the back|Gardening gives me backache.|||kind=idea
earache|n|a pain inside the ear|The baby has an earache.|||kind=idea
migraine|n|a very bad headache, often with feeling sick|She gets migraines when she's stressed.|headache||kind=idea
allergy|n|a bad reaction of the body to something like pollen, food or animals|I have an allergy to cats.|||kind=idea;plural=allergies
rash|n|an area of red spots on the skin|The baby has a rash.|||kind=idea;plural=rashes
bruise|n|a dark mark on the skin from being hit|I have a bruise on my knee.|||kind=idea
cut|n|a wound where the skin is broken by something sharp|I have a cut on my finger.|wound, gash||kind=idea
scar|n|a mark left on the skin after a wound heals|He has a scar on his chin.|||kind=idea
blister|n|a small bubble on the skin filled with liquid, often from rubbing|My new shoes gave me blisters.|||kind=idea
sunburn|n|red, sore skin from too much sun|I got sunburn on the beach.|||kind=idea;mass
infection|n|an illness caused by germs|She has an ear infection.|||kind=idea
virus|n|a tiny germ that causes illness; also, a harmful computer program|There's a virus going around the office.|bug||kind=idea;plural=viruses
germ|n|a tiny living thing that can cause illness|Wash your hands to kill germs.|bacteria, bug||kind=idea
pill|n|a small solid piece of medicine you swallow|Take one pill with water.|tablet||kind=thing
bandage|n|a strip of cloth for covering a wound|The nurse wrapped a bandage around my wrist.|dressing||kind=thing
plaster|n|a small sticky bandage; in American English, a band-aid|Put a plaster on that cut.|band-aid||kind=thing;forms=band-aid,bandaid
crutch|n|a stick you lean on when you have an injured leg|He's on crutches after the accident.|||kind=thing;plural=crutches
wheelchair|n|a chair with wheels for someone who can't walk easily|The museum is wheelchair friendly.|||kind=thing
prescription|n|a doctor's written instruction for medicine|I picked up my prescription.|||kind=thing

# Everyday actions, places and phrases
accept|v|to agree to take something offered; also, to agree that something is true|She accepted the job.|take, agree to|refuse, reject|obj=the offer
refuse|v|to say you won't do or accept something|He refused to eat his peas.|decline, reject|accept|act
allow|v|to let someone do something|Dogs aren't allowed in the shop.|let, permit|forbid|act
let|v|to allow|Let me help you.|allow, permit|prevent|past=let;ing=letting
prevent|v|to stop something from happening|Sunscreen prevents sunburn.|stop, avoid|allow|obj=accidents
avoid|v|to keep away from something|I avoid the main road at rush hour.|dodge, steer clear of|seek|obj=the traffic
warn|v|to tell someone about a possible danger|They warned us about the ice.|alert, caution||obj=the hikers
survive|v|to stay alive through something dangerous|The plant survived the frost.|endure, outlast||act
belong|v|to be owned by someone; also, to fit in a place or group|This book belongs to my sister.|||act
contain|v|to have something inside|The box contains old letters.|hold, include||obj=the gifts
include|v|to have as part of the whole|Breakfast is included.|contain, cover|exclude|act
weigh|v|to find out how heavy something is; also, to have a particular weight|Weigh the flour first.|||obj=the parcel
cover|v|to put something over something else|Cover the pot with a lid.|wrap, conceal|uncover|obj=the bowl
uncover|v|to remove a cover; also, to discover|Uncover the dish and bake for ten minutes.|reveal|cover|obj=the dish
reveal|v|to show something hidden|She revealed the surprise.|uncover, show|hide|obj=the secret
spread|v|to cover a surface with a layer of something; also, to open out|Spread the butter thinly.|smear, extend||obj=the jam;past=spread
squeeze|v|to press something firmly|Squeeze the lemon over the fish.|press, crush||obj=the lemon
press|v|to push something firmly|Press the button to start.|push||obj=the button
turn|v|to move round; also, to change direction|Turn left at the bakery.|rotate, twist||act
turn on|v|to start a machine or light|Turn on the lights.|switch on|turn off|past=turned on;ing=turning on
turn off|v|to stop a machine or light|Turn off the TV.|switch off|turn on|past=turned off;ing=turning off
switch|v|to change from one thing to another|Let's switch seats.|swap, change||act
swap|v|to exchange one thing for another|Can we swap places?|switch, trade||act
exchange|v|to give something and get something else in return|I exchanged the shirt for a bigger one.|swap, trade||obj=the shirt
offer|v|to say you are willing to do or give something|She offered me a lift.|propose||obj=a lift
provide|v|to give something someone needs|The hotel provides towels.|supply, give||act
pick up|v|to lift; also, to collect someone or something|Can you pick up the kids from school?|collect, fetch|drop off|past=picked up;ing=picking up
drop off|v|to take someone or something to a place and leave them|I'll drop off the kids at school.|deliver|pick up|past=dropped off;ing=dropping off
look after|v|to take care of|Can you look after the cat this weekend?|care for, mind||past=looked after;ing=looking after
look for|v|to try to find|I'm looking for my glasses.|search for, seek||past=looked for;ing=looking for
look forward to|v|to feel happy about something that is going to happen|I'm looking forward to the holidays.|anticipate||past=looked forward to;ing=looking forward to
find out|v|to discover information|I found out the shop is closed.|learn, discover||past=found out;ing=finding out
check out|v|to leave a hotel; also, informally, to look at|We checked out at noon.||check in|past=checked out;ing=checking out
set up|v|to arrange or prepare something|We set up the tent by the lake.|arrange, assemble||past=set up;ing=setting up
put on|v|to dress yourself in clothes|Put on your coat.|wear|take off|past=put on;ing=putting on
try on|v|to put on clothes to see if they fit|Can I try on these shoes?|||past=tried on;ing=trying on
dress up|v|to put on special clothes or a costume|We dressed up as pirates.|||past=dressed up;ing=dressing up
get dressed|v|to put your clothes on|I got dressed in a hurry.|dress|undress|past=got dressed;ing=getting dressed
shower|v|to wash under a shower|I showered after my run.|wash||act
bathe|v|to wash in a bath; also, to swim|The kids bathed in the sea.|wash, swim||act
shave|v|to cut hair off the skin with a razor|He shaves every morning.|||act
style|v|to arrange hair in a particular way|She styled her hair for the party.|||obj=her hair
glue|v|to stick things together with glue|Glue the pieces together.|stick, attach||obj=the pieces
stick|v|to attach something with glue or tape; also, to stay in one place|Stick the stamp on the envelope.|attach, glue||obj=the stamp;past=stuck
attach|v|to fix one thing to another|Attach the photo to the email.|fasten, connect|detach|obj=the file
connect|v|to join things together|Connect the printer to the laptop.|link, join|disconnect|obj=the cable
break down|v|to stop working, especially a car or machine; also, to start crying|The car broke down on the highway.|fail, stall||past=broke down;ing=breaking down;mood=-
run out|v|to have none left|We ran out of milk.|||past=ran out;ing=running out;mood=-
run late|v|to be behind schedule|I'm running late, sorry.|||past=ran late;ing=running late;mood=-
catch up|v|to reach someone ahead of you; also, to talk with a friend after time apart|Let's catch up over coffee.|||past=caught up;ing=catching up
keep up|v|to move or work at the same speed as others|I can't keep up with the class.|||past=kept up;ing=keeping up
calm down|v|to become less upset or excited|Take a breath and calm down.|relax, settle|wind up|past=calmed down;ing=calming down
cheer up|v|to become or make someone happier|A good walk will cheer up anyone.|brighten|upset|past=cheered up;ing=cheering up
freak out|v|informal: to become very upset or scared|I freaked out when I saw the spider.|panic||past=freaked out;ing=freaking out;mood=-
show up|v|to arrive, often unexpectedly|Ten people showed up early.|turn up, arrive||past=showed up;ing=showing up
turn up|v|to arrive; also, to increase volume|Turn up the music.|show up, arrive||past=turned up;ing=turning up
go out|v|to leave home to go somewhere social|We're going out tonight.|||past=went out;ing=going out
eat out|v|to eat at a restaurant|Let's eat out tonight.|dine out||past=ate out;ing=eating out
order in|v|to have food delivered to your home|We ordered in pizza.|||past=ordered in;ing=ordering in
take care|v|to be careful; also, a way to say goodbye|Take care on the roads.|||past=took care;ing=taking care
look up|v|to find information in a book or online; also, to look upward|Look up the word in the dictionary.|search||past=looked up;ing=looking up
write down|v|to write something so you remember it|Write down your address.|note||past=wrote down;ing=writing down
read aloud|v|to read so others can hear|She likes to read aloud to her kids.|||past=read aloud;ing=reading aloud
spell|v|to say or write the letters of a word in order|How do you spell your name?|||act;past=spelled
translate|v|to change words from one language into another|Can you translate this menu?|interpret||obj=the menu
pronounce|v|to make the sound of a word|How do you pronounce that?|say||obj=the word
color|v|to fill a drawing with color|The kids colored the pictures.|||obj=the picture;forms=colour
cut out|v|to remove a shape by cutting around it|Cut out the star shapes.|||past=cut out;ing=cutting out
lean|v|to rest against something; also, to bend|Lean the ladder against the wall.|rest, tilt||act;past=leaned
bend|v|to make something curved; also, to lower your body|Bend your knees.|curve, flex|straighten|act;past=bent
kneel|v|to go down on your knees|She knelt to tie his shoelace.|||act;past=knelt
reach|v|to stretch out your arm; also, to arrive at|I can't reach the top shelf.|stretch, arrive at||obj=the shelf
point|v|to show where something is with your finger|He pointed at the map.|indicate||act
tap|v|to hit something lightly|Tap the screen twice.|knock, pat||obj=the screen
knock|v|to hit a door to show you're there|Someone knocked at the door.|rap, tap||act
ring|v|to make a bell sound; also, to phone|The phone rang twice.|chime, call||act;past=rang
beep|v|to make a short high sound|The microwave beeped.|||act
honk|v|to sound a car horn|The driver honked at the cyclist.|toot||act
glance|v|to look quickly|She glanced at her watch.|peek, peep|stare|act
stare|v|to look at something for a long time|Don't stare, it's rude.|gaze|glance|act
peek|v|to look quickly and secretly|No peeking at your presents!|peep, glance||act
watch out|v|to be careful|Watch out for the step.|look out||past=watched out;ing=watching out
pay attention|v|to watch, listen or think carefully|Pay attention to the road.|concentrate||past=paid attention;ing=paying attention
concentrate|v|to give all your attention to something|I can't concentrate with this noise.|focus|daydream|act
focus|v|to give all your attention to one thing|Focus on one task at a time.|concentrate||act
daydream|v|to think pleasant thoughts that take your mind away from what you're doing|He daydreamed through the meeting.|||act
calculate|v|to work out a number using math|Calculate the total.|work out, compute||obj=the bill
estimate|v|to guess the size, cost or amount of something|I estimate it'll take an hour.|guess, judge||act
predict|v|to say what will happen in the future|They predict snow tomorrow.|forecast||act
test|v|to try something to see if it works|Test the smoke alarm monthly.|check, try||obj=the alarm
prove|v|to show that something is true|Can you prove it?|show, confirm|disprove|act
beat|v|to defeat someone in a game; also, to hit repeatedly|We beat them three to one.|defeat|lose to|obj=the champions;past=beat
score|v|to get a point or goal in a game|She scored the winning goal.|||act
compete|v|to take part in a contest|She competes in swimming races.|contend||act
coach|v|to train someone in a sport or skill|He coaches the kids' football team.|train, teach||obj=the team
cheer on|v|to shout to encourage someone|We cheered on the runners.|support||past=cheered on;ing=cheering on
raise|v|to lift up; also, to bring up children; also, to collect money|We raised money for the shelter.|lift, collect|lower|obj=some money
keyhole|n|the hole in a lock where a key goes|I couldn't fit the key in the keyhole.|||kind=thing
doorway|n|the opening where a door is|He stood in the doorway.|entrance||kind=place;at=in
entrance|n|a door or way in|Meet me at the main entrance.|way in, door|exit|kind=place;at=at
exit|n|a door or way out|Where's the exit?|way out|entrance|kind=place;at=at
corner|n|the point where two edges or streets meet|There's a café on the corner.|||kind=place;at=on
edge|n|the outside limit of something|Don't stand so close to the edge.|border, rim|center|kind=idea
middle|n|the center of something|There's a tree in the middle of the field.|center|edge|kind=idea
center|n|the middle point; also, a building for a special activity|The town center is busy on Saturdays.|middle||kind=idea;forms=centre
side|n|a left or right part of something; also, a team|Which side are you on?|||kind=idea
top|n|the highest part of something|We reached the top of the hill.|peak, summit|bottom|kind=idea
bottom|n|the lowest part of something|The keys were at the bottom of my bag.|base|top|kind=idea
front|n|the part of something that faces forward|Sit at the front of the bus.|||kind=idea
end|n|the last part of something|I cried at the end of the film.|finish, close|beginning|kind=idea
beginning|n|the start of something|The beginning of the book is slow.|start|end|kind=idea
start|n|the beginning of something|We missed the start of the film.|beginning|end|kind=idea
step|n|a movement of your foot when walking; also, one stage in a process|Take it one step at a time.|stage, pace||kind=idea
way|n|a method of doing something; also, a route|Is this the way to the beach?|route, method||kind=idea
kind of|adv|informal: somewhat|I'm kind of tired.|sort of, a bit
sort of|adv|informal: somewhat|It's sort of complicated.|kind of
a bit|adv|a little|I'm a bit cold.|slightly
a lot|adv|very much; often|Thanks a lot.|very much
by the way|adv|used to add something not directly related|By the way, I loved your cake.|incidentally
of course|adv|certainly; used to agree|Of course you can come.|certainly, sure
no problem|excl|used to say you're happy to help, or that something doesn't matter|"Thanks!" "No problem."|you're welcome
you're welcome|excl|a polite reply when someone thanks you|"Thanks for the tea." "You're welcome."|no problem||forms=youre welcome
excuse me|excl|a polite phrase to get attention or say sorry|Excuse me, is this seat free?|pardon me
congratulations|excl|used to say you're pleased about someone's success|Congratulations on the new job!|well done||forms=congrats
bless you|excl|said when someone sneezes|"Achoo!" "Bless you."
good luck|excl|said to wish someone success|Good luck with your exam!
happy birthday|excl|said to someone on their birthday|Happy birthday, I hope it's a great one!
good morning|excl|a greeting used in the morning|Good morning, did you sleep well?|morning
good night|excl|said when someone is going to bed or leaving at night|Good night, sleep well.|night||forms=goodnight
see you|excl|informal: goodbye|See you tomorrow!|bye, later||forms=see ya,cya
ugh|excl|a sound showing disgust or annoyance|Ugh, it's raining again.|yuck, ew
yuck|excl|a word showing disgust|Yuck, this milk is sour.|ew, gross||forms=yuk,ew
yay|excl|a word showing excitement or happiness|Yay, it's snowing!|hooray||nogen
phew|excl|a word showing relief or tiredness|Phew, we made it.|whew
hmm|excl|a sound showing you are thinking or unsure|Hmm, let me think.
huh|excl|a sound showing surprise or confusion|Huh, I didn't know that.
oh no|excl|a phrase showing alarm or disappointment|Oh no, I forgot my keys!
oh well|excl|a phrase showing you accept something disappointing|Oh well, maybe next time.
amazing|excl|informal: used to show you're impressed|"I passed!" "Amazing!"|||nogen
whatever|pron|anything at all; informally, also shows you don't care|Eat whatever you like.|anything
sincerely|adv|in a way that means what it says|I sincerely hope you feel better.|genuinely, truly
secretly|adv|without others knowing|She secretly ate the last cookie.|privately|openly|use=manner
safely|adv|without harm or danger|We arrived safely.|securely||use=manner
harsh|adj|cruel or severe; also, unpleasantly strong|The light was too harsh.|severe, cruel|gentle
still|adj|not moving|The lake was still and clear.|motionless, calm|moving
silent|adj|without any sound|The house was silent.|quiet, hushed|noisy|use=place
remote|adj|far from towns or people|They live in a remote village.|isolated, distant|central|use=place
distant|adj|far away|We heard distant thunder.|far, faraway|near
close|adj|near; also, emotionally connected|We live close to the school.|near, nearby|far
far|adj|a long way away|The beach isn't far.|distant|near
nearby|adj|not far away|There's a nearby park.|close
central|adj|in the middle; also, most important|We stayed in a central hotel.|middle|remote
available|adj|able to be used or bought; also, free|Is this seat available?|free|unavailable
free time|n|time when you aren't working or busy|What do you do in your free time?|spare time, leisure||kind=idea;mass
leisure|n|free time for relaxing|Reading is my favorite leisure activity.|free time, recreation|work|kind=idea;mass
hometown|n|the town where you were born or grew up|I visited my hometown last summer.|||kind=place;at=in
homeland|n|the country where someone was born|He returned to his homeland.|native land||kind=place;at=in
holiday home|n|a house you stay in on holiday|They have a holiday home by the lake.|cottage||kind=place;at=at
seaside|n|the area beside the sea, especially for holidays|We spent a week at the seaside.|coast, beach||kind=place;at=at;mass
die|v|to stop living; also, of a battery or machine, to stop working|My phone died halfway through the call.|pass away|live|past=died;ing=dying;mood=--
pass away|v|to die, said gently|Her grandfather passed away last year.|die||past=passed away;ing=passing away;mood=--
stop working|v|of a machine, to break down|The heater stopped working last night.|break down||past=stopped working;ing=stopping working;mood=-

# Countries, languages, music and shapes
France|n|a country in western Europe, known for Paris and its food|We cycled through France last summer.|||kind=place;at=in
Spain|n|a country in southwestern Europe|We're going to Spain in June.|||kind=place;at=in
Italy|n|a country in southern Europe shaped like a boot|They honeymooned in Italy.|||kind=place;at=in
Germany|n|a country in central Europe|My cousin lives in Germany.|||kind=place;at=in
Portugal|n|a country in southwestern Europe, on the Atlantic coast|We surfed in Portugal.|||kind=place;at=in
Greece|n|a country in southeastern Europe with many islands|We island-hopped around Greece.|||kind=place;at=in
England|n|a country that is part of the United Kingdom|She grew up in England.|||kind=place;at=in
Scotland|n|a country in the north of the United Kingdom|We hiked the hills of Scotland.|||kind=place;at=in
Ireland|n|an island and country west of Great Britain|My grandparents came from Ireland.|||kind=place;at=in
Netherlands|n|a country in northwestern Europe, known for canals and tulips|We rode bikes all over the Netherlands.|Holland||kind=place;at=in;forms=holland
Sweden|n|a country in northern Europe|We saw the northern lights in Sweden.|||kind=place;at=in
Norway|n|a country in northern Europe with deep fjords|The fjords of Norway are stunning.|||kind=place;at=in
Japan|n|an island country in East Asia|I'm going to Japan next spring.|||kind=place;at=in
China|n|a large country in East Asia|She's studying Mandarin in China.|||kind=place;at=in
Korea|n|a peninsula in East Asia, divided into North and South Korea|We ate amazing food in Korea.|||kind=place;at=in
India|n|a large country in South Asia|They traveled across India by train.|||kind=place;at=in
Thailand|n|a country in Southeast Asia|We learned to cook in Thailand.|||kind=place;at=in
Vietnam|n|a country in Southeast Asia|We took a boat trip in Vietnam.|||kind=place;at=in
Australia|n|a country and continent in the southern hemisphere|Kangaroos live in Australia.|||kind=place;at=in
New Zealand|n|an island country in the southwest Pacific Ocean|We went hiking in New Zealand.|||kind=place;at=in
Canada|n|a large country in North America|It snows a lot in Canada.|||kind=place;at=in
America|n|the United States of America; also, the continents of North and South America|My aunt lives in America.|the US, the USA||kind=place;at=in;forms=usa,us,united states
Mexico|n|a country in North America, south of the United States|We ate tacos in Mexico.|||kind=place;at=in
Brazil|n|a large country in South America|The carnival in Brazil is famous.|||kind=place;at=in
Argentina|n|a country in South America|We danced tango in Argentina.|||kind=place;at=in
Peru|n|a country in South America with the Andes mountains|We hiked to Machu Picchu in Peru.|||kind=place;at=in
Egypt|n|a country in northeast Africa, known for its pyramids|We saw the pyramids in Egypt.|||kind=place;at=in
Kenya|n|a country in East Africa|We went on safari in Kenya.|||kind=place;at=in
South Africa|n|a country at the southern tip of Africa|They visited Cape Town in South Africa.|||kind=place;at=in
Morocco|n|a country in North Africa|We wandered the markets of Morocco.|||kind=place;at=in
Africa|n|the second-largest continent|She's backpacking across Africa.|||kind=place;at=in
Europe|n|the continent that includes countries like France, Germany and Italy|We traveled around Europe by train.|||kind=place;at=in
Asia|n|the largest continent|He spent a year in Asia.|||kind=place;at=in
Paris|n|the capital city of France|We saw the Eiffel Tower in Paris.|||kind=place;at=in
London|n|the capital city of England and the United Kingdom|We rode a red bus in London.|||kind=place;at=in
New York|n|a large city in the United States|We saw a show in New York.|||kind=place;at=in;forms=nyc
Tokyo|n|the capital city of Japan|Tokyo is huge and full of neon.|||kind=place;at=in
Rome|n|the capital city of Italy|We ate gelato in Rome.|||kind=place;at=in
English|n|the language of England, the US, Australia and many other countries|Do you speak English?|||kind=idea;mass
Spanish|n|the language of Spain, Mexico and much of Latin America|I'm learning Spanish.|||kind=idea;mass
French|n|the language of France and parts of Canada, Belgium, Switzerland and Africa|She speaks French at home.|||kind=idea;mass
German|n|the language of Germany, Austria and parts of Switzerland|He's learning German for work.|||kind=idea;mass
Italian|n|the language of Italy|She sings opera in Italian.|||kind=idea;mass
Portuguese|n|the language of Portugal and Brazil|He speaks Portuguese.|||kind=idea;mass
Japanese|n|the language of Japan|I'm learning Japanese before my trip.|||kind=idea;mass
Chinese|n|the language of China, especially Mandarin|She's taking Chinese lessons.|Mandarin||kind=idea;mass;forms=mandarin
Korean|n|the language of Korea|He learned Korean from TV shows.|||kind=idea;mass
Hindi|n|one of the main languages of India|She speaks Hindi with her grandparents.|||kind=idea;mass
Arabic|n|the language of many countries in the Middle East and North Africa|He's studying Arabic at university.|||kind=idea;mass
Russian|n|the language of Russia|She reads novels in Russian.|||kind=idea;mass
flute|n|a musical instrument you play by blowing across a hole|She plays the flute in the band.|||kind=thing
trumpet|n|a brass instrument you blow into|He plays the trumpet loudly.|horn||kind=thing
saxophone|n|a curved brass instrument with keys, common in jazz|He practices the saxophone at night.|sax||kind=thing;forms=sax
clarinet|n|a woodwind instrument with a single reed|She plays clarinet in the orchestra.|||kind=thing
cello|n|a large string instrument played sitting down with a bow|The cello has a deep, warm sound.|||kind=thing;plural=cellos
harp|n|a large instrument with strings you pluck, played upright|The harp played softly at the wedding.|||kind=thing
ukulele|n|a small four-stringed guitar|He strummed a ukulele on the beach.|uke||kind=thing
banjo|n|a string instrument with a round body|Grandpa plays the banjo.|||kind=thing;plural=banjos
harmonica|n|a small instrument you blow into, moving it along your lips|He played the harmonica by the fire.|mouth organ||kind=thing
jazz|n|music with strong rhythms and improvised solos|We listened to jazz all evening.|||kind=idea;mass
pop|n|popular modern music|She listens to pop on the way to work.|pop music||kind=idea;mass
rock music|n|loud music with a strong beat, usually played on electric guitars and drums|He loves classic rock music.|rock||kind=idea;mass
hip hop|n|music with rhythmic rapping over beats|They danced to hip hop.|rap||kind=idea;mass;forms=hip-hop
classical music|n|serious music from the European tradition, such as Mozart or Bach|Classical music helps me study.|||kind=idea;mass
country music|n|music from the rural southern United States, often with guitars and stories|My dad loves country music.|||kind=idea;mass
blues|n|slow, sad music that started in African American communities|He sings the blues.|||kind=idea;mass
folk|n|traditional music of a people, or modern music in that style|They play folk at the pub.|folk music||kind=idea;mass
melody|n|a tune|The melody stuck in my head all day.|tune||kind=idea;plural=melodies
rhythm|n|a regular pattern of sounds or movements|Clap along to the rhythm.|beat||kind=idea
lyrics|n|the words of a song|I always forget the lyrics.|words||kind=idea;mass
band|n|a group of musicians who play together|My brother plays drums in a band.|group||kind=idea
orchestra|n|a large group of musicians playing classical instruments together|The orchestra tuned up.|||kind=idea
choir|n|a group of people who sing together|She sings in the church choir.|chorus||kind=idea
album|n|a collection of songs released together; also, a book for photos|Their new album is out.|record||kind=media
circle|n|a round shape|Draw a circle.|ring, loop||kind=idea
triangle|n|a shape with three straight sides|Cut the sandwich into triangles.|||kind=idea
rectangle|n|a shape with four straight sides and four right angles|The table is a long rectangle.|||kind=idea
oval|n|a shape like an egg|The mirror is an oval.|ellipse||kind=idea
cube|n|a solid shape with six square sides|Add an ice cube to my drink.|||kind=thing
sphere|n|a round solid shape like a ball|The earth is nearly a sphere.|globe, ball||kind=idea
line|n|a long, thin mark; also, a row of people|Draw a straight line.|stroke, row||kind=idea
dot|n|a small round mark|Join the dots.|spot, point||kind=idea
pattern|n|a repeated design; also, a regular way something happens|I love the pattern on your dress.|design, motif||kind=idea
number|n|a word or symbol for an amount, like 3 or seven|Pick a number between one and ten.|figure, digit||kind=idea
alphabet|n|the set of letters used to write a language|The kids sang the alphabet song.|ABC||kind=idea
spelling|n|the right way to write a word|Check your spelling.|||kind=idea;mass
grammar|n|the rules for how words are put together|Her grammar is perfect.|syntax||kind=idea;mass
vocabulary|n|all the words a person knows or uses|Reading builds your vocabulary.|lexicon, words||kind=idea;plural=vocabularies
phrase|n|a small group of words|"Break a leg" is a funny phrase.|expression||kind=idea
paragraph|n|a section of writing that starts on a new line|Read the first paragraph.|passage||kind=idea
chapter|n|a main section of a book|I read one chapter before bed.|section||kind=idea
page|n|one side of a sheet of paper in a book|Turn to page ten.|sheet, leaf||kind=idea
title|n|the name of a book, film or song; also, a word like Dr or Ms|What's the title of the book?|name, heading||kind=idea
name|n|the word someone or something is called|What's your name?|title||kind=idea
nickname|n|an informal name used by friends|My nickname is Sunny.|||kind=idea
gift wrap|n|decorative paper for wrapping presents|We ran out of gift wrap.|wrapping paper||kind=thing;mass
costume|n|clothes worn to look like someone or something else|What's your costume for the party?|outfit, disguise||kind=thing
mask|n|a covering for the face|She wore a cat mask to the party.|||kind=thing
crown|n|a circle of gold and jewels worn by a king or queen|The queen's crown sparkled.|tiara||kind=thing
treasure|n|a collection of gold, jewels or valuable things|The pirates buried their treasure.|riches, loot||kind=thing;mass

# School, travel and life events
kindergarten|n|a school or class for young children before primary school|My son started kindergarten this year.|preschool, nursery||kind=place;at=at;forms=preschool,nursery school
college|n|a place of education after secondary school|She's applying to college.|university||kind=place;at=at;nogen
textbook|n|a book used for studying a subject|Open your textbooks to page twenty.|coursebook||kind=thing
blackboard|n|a dark board that teachers write on with chalk|The teacher wrote the date on the blackboard.|chalkboard, whiteboard||kind=furniture;forms=whiteboard,chalkboard
chalk|n|a soft white stone used for writing on boards|The kids drew on the pavement with chalk.|||kind=thing;mass
glue stick|n|a stick of solid glue|Can I borrow your glue stick?|||kind=thing
pencil case|n|a small bag or box for pens and pencils|My pencil case is full of broken crayons.|||kind=thing
locker|n|a small cupboard that can be locked, at school, work or a gym|I left my coat in my locker.|||kind=furniture
lunch break|n|a break in the middle of the day for lunch|Let's go for a walk on our lunch break.|lunchtime||kind=idea;forms=lunchtime
playtime|n|a time for children to play, especially at school|The kids play tag at playtime.|recess||kind=idea;mass
bedtime|n|the time when someone usually goes to bed|It's past your bedtime.|||kind=time;mass
weekend trip|n|a short trip over a weekend|We took a weekend trip to the mountains.|getaway||kind=event;event=joy
sightseeing|n|visiting interesting places as a tourist|We did some sightseeing in Rome.|touring||kind=idea;mass
souvenir|n|something you keep to remember a place or event|I bought a mug as a souvenir.|keepsake, memento||kind=thing
postcard|n|a card with a picture on one side, sent by post|Send us a postcard from the beach.|card||kind=thing
guidebook|n|a book of information for tourists|The guidebook recommended the café.|guide||kind=thing
backpacking|n|traveling cheaply with a backpack|He went backpacking around Asia.|||kind=idea;mass
hostel|n|a cheap place to stay, often with shared rooms|We stayed in a hostel in the old town.|||kind=place;at=at
visa|n|an official document that lets you enter a country|You need a visa to visit.|permit||kind=thing
border|n|the line between two countries or areas; also, an edge|We crossed the border at noon.|frontier, edge||kind=place;at=at
flight|n|a journey on a plane|Our flight was delayed.|trip||kind=event;event=joy
layover|n|a short stop between flights|We had a three-hour layover.|stopover||kind=idea
seatbelt|n|a belt that holds you in your seat in a car or plane|Fasten your seatbelt.|safety belt||kind=thing;forms=seat belt
helmet|n|a hard hat that protects your head|Always wear a helmet on your bike.|||kind=thing
traffic light|n|a set of colored lights that control traffic|Turn left at the traffic light.|stoplight||kind=furniture
crosswalk|n|a marked place where people can cross a road|Cross at the crosswalk.|zebra crossing||kind=place;at=at;forms=zebra crossing
sidewalk|n|a path beside a road for people to walk on|Stay on the sidewalk.|pavement||kind=place;at=on;forms=pavement
roundabout|n|a circular junction where roads meet|Take the second exit at the roundabout.|traffic circle||kind=place;at=at
rush hour|n|the busy time when people travel to and from work|The trains are packed at rush hour.|||kind=time;mass
house party|n|a party held in someone's home|We're having a house party on Friday.|||kind=event;event=joy
pool party|n|a party held around a swimming pool|The kids had a pool party for her birthday.|||kind=event;event=joy
surprise party|n|a party organized secretly for someone|We're planning a surprise party for Dad.|||kind=event;event=joy
farewell|n|a goodbye, or a party to say goodbye|We had a farewell dinner for her.|goodbye, send-off||kind=event;event=joy
welcome party|n|a party to greet someone who has arrived|We threw a welcome party for the new neighbors.|||kind=event;event=joy
job offer|n|an offer of a job|I got a job offer today!|||kind=event;event=news
first date|n|the first romantic meeting between two people|I have a first date on Friday.|||kind=event;event=luck
blind date|n|a date with someone you haven't met before|My friend set me up on a blind date.|||kind=event;event=luck
parent-teacher meeting|n|a meeting between a teacher and a pupil's parents|We have a parent-teacher meeting tonight.|parents' evening||kind=event;event=luck;forms=parents evening
job hunt|n|the search for a new job|The job hunt is exhausting.|job search||kind=idea
cover letter|n|a letter sent with a job application|I'm writing a cover letter tonight.|||kind=thing
resume|n|a short document listing your education and work experience|I updated my resume.|CV||kind=thing;forms=cv,résumé
portfolio|n|a collection of someone's work, shown to others|She brought her portfolio to the interview.|||kind=thing;plural=portfolios
`;

	const POS = { n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb', conj: 'conjunction', prep: 'preposition', excl: 'exclamation', pron: 'pronoun' };
	const list = (s) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : undefined);

	function parse(text) {
		return text.split('\n').filter((line) => line.trim() && !line.startsWith('#')).map((line) => {
			const [w, pos, def, ex, syn, ant, hints] = line.split('|');
			const e = { w, pos: POS[pos], def, ex, syn: list(syn), ant: list(ant) };
			for (const hint of hints ? hints.split(';') : []) {
				const [k, v] = hint.split('=');
				e[k] = v === undefined ? true : k === 'forms' || k === 'variants' ? list(v) : v;
			}
			return e;
		});
	}

	const WORDS = parse(DATA);

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
	// A verb of more than one word changes only its first: "hang out" -> "hangs out".
	const verbForm = (fn) => (e) => {
		const [w, ...rest] = e.w.split(' ');
		return [fn(w), ...rest].join(' ');
	};
	const third = verbForm((w) => {
		if (w === 'go') return 'goes';
		if (/(s|x|z|ch|sh)$/.test(w)) return w + 'es';
		if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies';
		return w + 's';
	});
	const regularPast = verbForm((w) => {
		if (w.endsWith('e')) return w + 'd';
		if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ied';
		return (doubles(w) ? w + w.slice(-1) : w) + 'ed';
	});
	const regularIng = verbForm((w) => {
		if (w.endsWith('ie')) return w.slice(0, -2) + 'ying';
		if (/[^e]e$/.test(w) && w !== 'be') return w.slice(0, -1) + 'ing';
		return (doubles(w) ? w + w.slice(-1) : w) + 'ing';
	});
	const past = (e) => e.past || regularPast(e);
	const ing = (e) => e.ing || regularIng(e);
	/** happier, happiest; only for short adjectives, which take -er and -est. */
	function compare(e) {
		const w = e.w;
		if (w.includes(' ')) return [];
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
	const add = (spelling, e, label) => {
		const form = spelling.toLowerCase();
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

	// Adjectives that suit any object, for "she found a ___ ___ in the attic". Others ("sharp", "wet") only describe.
	const ANY_OBJECT = new Set(['old', 'small', 'tiny', 'little', 'big', 'huge', 'giant', 'enormous', 'beautiful', 'lovely', 'pretty', 'ugly', 'cute', 'shiny', 'broken', 'ancient', 'modern', 'fragile', 'expensive', 'cheap', 'perfect', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'black', 'white', 'gray', 'brown', 'golden', 'orange']);

	/* Each template takes the entry and a picker for filler words of a kind; all are written to read naturally with any word of their slot. */
	const TEMPLATES = {
		person: [(e) => `${cap(a(e.w))} lives just down the road from us.`, (e) => `${cap(a(e.w))} waved at us from across the street.`, (e) => `We met ${a(e.w)} on the train yesterday.`, (e) => `I asked ${a(e.w)} for directions.`],
		relative: [(e) => `My ${e.w} called last night.`, (e) => `I'm visiting my ${e.w} this weekend.`, (e) => `My ${e.w} always knows what to say.`],
		animal: [(e) => `Have you ever seen ${a(e.w)} up close?`, (e) => `The ${e.w} watched us from a distance.`, (e) => `We spotted ${a(e.w)} on our trip.`],
		thing: [(e) => `I left the ${e.w} on the kitchen table.`, (e) => `Could you pass me that ${e.w}?`, (e, pick) => `She found ${a(pick('object').w + ' ' + e.w)} in the attic.`, (e) => `There's ${a(e.w)} by the door if you need one.`],
		food: [(e) => `I had ${a(e.w)} with lunch.`, (e) => `There's one ${e.w} left if you want it.`, (e) => `Could you grab me ${a(e.w)} from the kitchen?`],
		foodMass: [(e) => `Could you pick up some ${e.w} on the way home?`, (e) => `We've run out of ${e.w} again.`, (e) => `There's some ${e.w} left if you want it.`],
		place: [(e) => `We spent the whole afternoon ${e.at} the ${e.w}.`, (e) => `The ${e.w} was quiet when we got there.`, (e) => `I hadn't been ${e.at} the ${e.w} in years.`],
		event: [(e) => `The ${e.w} is on Saturday.`, (e) => `Everyone is talking about the ${e.w}.`, (e) => `I've been thinking about the ${e.w} all week.`],
		idea: [(e) => `That ${e.w} stayed with me for days.`, (e) => `I keep coming back to that ${e.w}.`],
		ideaMass: [(e) => `${cap(e.w)} is worth more than people think.`, (e) => `A little ${e.w} goes a long way.`],
		act: [(e) => `She ${third(e)} whenever she gets the chance.`, (e) => `We ${past(e)} for most of the afternoon.`, (e) => `I didn't plan to ${e.w} today, but I did.`],
		obj: [(e) => `She ${past(e)} ${e.obj} before lunch.`, (e) => `I'll ${e.w} ${e.obj} tomorrow.`, (e) => `He ${third(e)} ${e.obj} every weekend.`],
		feel: [(e) => `I felt ${e.w} all afternoon.`, (e) => `She seemed ${e.w} when she got home.`, (e) => `Why do I always feel ${e.w} on Sundays?`],
		trait: [(e) => `My neighbor is very ${e.w}.`, (e) => `You have to be ${e.w} to do a job like that.`, (e) => `Everyone says she's ${e.w}.`],
		object: [(e, pick) => `The ${pick('thing').w} was surprisingly ${e.w}.`, (e, pick) => (ANY_OBJECT.has(e.w) ? `She found ${a(e.w + ' ' + pick('thing').w)} in the attic.` : `That ${pick('thing').w} is too ${e.w}.`)],
		placeAdj: [(e, pick) => `The ${pick('place').w} was ${e.w} when we got there.`, (e, pick) => {
			const p = pick('place');
			return `It was ${e.w} ${p.at} the ${p.w} that evening.`;
		}],
		weather: [(e) => `It was ${e.w} all weekend.`, (e) => `What ${a(e.w)} day.`],
		manner: [(e) => `She closed the door ${e.w}.`, (e) => `They walked home ${e.w}.`, (e) => `He ${e.w} folded the letter and put it away.`],
		often: [(e) => `I ${e.w} take the long way home.`, (e) => `She ${e.w} forgets her umbrella.`],
	};

	/** Which templates fit an entry, or null if it isn't meant for made-up sentences. */
	function slot(e) {
		if (e.nogen) return null;
		if (e.pos === 'noun' && e.kind) {
			if (e.kind === 'food') return e.mass ? 'foodMass' : 'food';
			if (e.kind === 'idea') return e.mass ? 'ideaMass' : 'idea';
			if (e.kind === 'person' && e.rel) return 'relative';
			if (e.kind === 'event') return e.event === 'sorry' || e.mass ? null : 'event';
			return e.mass || !TEMPLATES[e.kind] ? null : e.kind;
		}
		if (e.pos === 'verb') return e.obj ? 'obj' : e.act ? 'act' : null;
		if (e.pos === 'adjective') return { feel: 'feel', trait: 'trait', object: 'object', place: 'placeAdj', weather: 'weather' }[e.use] || null;
		if (e.pos === 'adverb') return { manner: 'manner', often: 'often' }[e.use] || null;
		return null;
	}

	const fillers = (kind, rand) => {
		const list = kind === 'object' ? WORDS.filter((e) => e.pos === 'adjective' && ANY_OBJECT.has(e.w)) : WORDS.filter((e) => e.pos === 'noun' && e.kind === kind && !e.mass && !e.nogen);
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

	Omni.onyxDictionary = { WORDS, lookup, define, related, partOfSpeech, sentence, forms: { plural, third, past, ing }, a, size: new Set(WORDS.map((e) => e.w.toLowerCase())).size };
})();
