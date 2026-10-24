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
	 *   event=                      what an event calls for: luck (an exam), joy (a birthday), sorry (a funeral)
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
beautiful|adj|very pleasing to look at or listen to|What a beautiful view.|lovely, gorgeous|ugly|use=object
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
good|adj|of high quality, pleasant, or right|That was a good idea.|fine, great, excellent|bad, poor
bad|adj|of low quality, unpleasant, or wrong|I had a bad night's sleep.|poor, awful|good
fast|adj|moving or able to move quickly|She's the fastest runner in the club.|quick, rapid, swift|slow
slow|adj|moving or happening without much speed|The slow train stops at every station.||fast, quick
important|adj|mattering a lot|Sleep is important for your health.|significant, vital|trivial, unimportant
strange|adj|unusual or surprising; hard to explain|I heard a strange noise in the attic.|odd, peculiar, weird|normal, ordinary
delicious|adj|tasting or smelling very good|The soup was delicious.|tasty, scrumptious|disgusting
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
tasty|adj|having a pleasant flavor|That was a tasty lunch.|delicious, flavorful|bland
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
flat|adj|level and smooth, with no bumps|The road was long and flat.|level, even|bumpy|
smooth|adj|having an even surface with no rough parts|The stones were smooth from the river.|sleek, silky|rough|use=object
rough|adj|having an uneven surface; also, difficult|The rough path was hard on our feet.|coarse, bumpy|smooth|use=object
sharp|adj|having a fine edge or point that can cut; also, clever|Careful, that knife is sharp.|keen|blunt, dull|use=object
sticky|adj|covered with something that makes things stick to it|My hands were sticky with honey.|tacky, gooey||use=object
wet|adj|covered with or full of water or another liquid|My shoes are wet from the rain.|damp, soaked|dry|use=object
dry|adj|without water or moisture|Keep the matches dry.|arid|wet|use=object
hard|adj|firm and not easy to bend or break; also, difficult|The bread was hard as a rock.|firm, solid|soft, easy|use=object
long|adj|measuring a great distance from end to end; also, lasting a lot of time|It was a long walk home.|lengthy|short|use=object
short|adj|small in length, height or time|We took a short break.|brief|long, tall|use=object
tall|adj|of great height|The tall trees blocked the sun.|high, towering|short|use=object
huge|adj|extremely large|A huge wave crashed on the rocks.|enormous, giant|tiny|use=object
giant|adj|very large|A giant pumpkin won first prize.|huge, colossal|tiny|use=object
little|adj|small in size or amount|They live in a little house by the sea.|small, tiny|big|use=object
thick|adj|wide from one side to the other; also, dense|She read a thick book over the holidays.|wide, dense|thin|use=object
thin|adj|narrow from one side to the other; also, not fat|Slice the cucumber into thin rounds.|slim, slender|thick|use=object
wide|adj|large from side to side|The river is wide here.|broad|narrow|
narrow|adj|small from side to side|We walked down a narrow alley.|thin, tight|wide|
deep|adj|going a long way down|The lake is very deep in the middle.|bottomless|shallow|
shallow|adj|not deep|The kids paddled in the shallow water.||deep|
clean|adj|free from dirt|Put on a clean shirt.|spotless, fresh|dirty|use=object
dirty|adj|covered with dirt|His boots were dirty after the hike.|muddy, filthy|clean|use=object
broken|adj|damaged and in pieces, or not working|The vase was broken.|smashed, faulty|whole, working|use=object
perfect|adj|completely without faults|It was a perfect day for a picnic.|flawless, ideal|flawed|use=object
simple|adj|easy to understand or do; also, plain|The instructions were simple.|easy, plain|complicated
complicated|adj|made of many parts and hard to understand|The rules are too complicated.|complex, tricky|simple
easy|adj|not difficult|The test was easier than I expected.|simple, effortless|hard, difficult
difficult|adj|needing a lot of effort or skill|That was a difficult climb.|hard, tough|easy
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
cool|adj|a little cold; informally, also great|It's cool in the shade.|chilly|warm|use=weather
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
lovely|adj|very pleasant or beautiful|What a lovely garden.|beautiful, delightful|horrible|use=object
wonderful|adj|extremely good|We had a wonderful time.|marvelous, fantastic|terrible
amazing|adj|very surprising, often in a good way|The view from the top was amazing.|incredible, astonishing|ordinary
awesome|adj|informal: very good; also, inspiring awe|That was an awesome concert.|amazing, great|awful
great|adj|very good; also, very large or important|We had a great time.|excellent, superb|terrible
excellent|adj|extremely good|She gave an excellent talk.|outstanding, superb|poor
fantastic|adj|extremely good; also, imaginary|The food was fantastic.|wonderful, terrific|awful
terrible|adj|very bad|The traffic was terrible.|awful, dreadful|wonderful
awful|adj|very bad or unpleasant|I had an awful cold.|terrible, dreadful|wonderful
horrible|adj|very unpleasant|What a horrible smell.|nasty, dreadful|lovely
nice|adj|pleasant or kind|It's a nice day.|pleasant, lovely|nasty
fine|adj|good or acceptable; also, very thin|The weather is fine today.|okay, good
okay|adj|all right; acceptable|The food was okay.|fine, all right||forms=ok
weird|adj|very strange|I had a weird dream last night.|strange, odd|normal
normal|adj|usual and ordinary|It's a normal Tuesday.|ordinary, typical|strange
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
young|adj|having lived for a short time|The young tree needs support.|youthful|old|
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
