// Onyx's two other languages, Spanish and French (new in Onyx 2). Three parts: a word list that pairs each of the dictionary's
// hand-written everyday words with its Spanish and French (written for Onyx, articles included so the gender shows),
// what Onyx understands and says in each language, and the small grammar it needs to find "cansada" under "cansado"
// or "parlons" under "parler". The engine (onyx.js) detects the language of each message and replies in it.
(function (root) {
	'use strict';

	/*
	 * One line per English word: word|Spanish|French. A word with more than one part of speech in the dictionary is
	 * written word.pos ("book.n", "book.v"). Nouns carry their article: "el perro", "la casa", "les gens"; a French noun
	 * that takes l' adds its gender: "l'arbre m". A dash means there is no single-word equivalent ("will" as in "I will").
	 */
	const WORDS = `
friend|el amigo|l'ami m
teacher|el profesor|le professeur
doctor|el médico|le médecin
neighbor|el vecino|le voisin
artist|el artista|l'artiste m
stranger|el desconocido|l'inconnu m
child|el niño|l'enfant m
chef|el chef|le chef
pilot|el piloto|le pilote
farmer|el agricultor|l'agriculteur m
cat|el gato|le chat
dog|el perro|le chien
bird|el pájaro|l'oiseau m
horse|el caballo|le cheval
owl|el búho|le hibou
fox|el zorro|le renard
rabbit|el conejo|le lapin
whale|la ballena|la baleine
bee|la abeja|l'abeille f
book.n|el libro|le livre
book.v|reservar|réserver
chair|la silla|la chaise
lamp|la lámpara|la lampe
key|la llave|la clé
umbrella|el paraguas|le parapluie
clock|el reloj|l'horloge f
bottle|la botella|la bouteille
letter|la carta|la lettre
phone|el teléfono|le téléphone
window|la ventana|la fenêtre
door|la puerta|la porte
candle|la vela|la bougie
map|el mapa|la carte
blanket|la manta|la couverture
bicycle|la bicicleta|le vélo
kite|la cometa|le cerf-volant
camera|la cámara|l'appareil photo m
mirror|el espejo|le miroir
ladder|la escalera|l'échelle f
hammer|el martillo|le marteau
box|la caja|la boîte
light.n|la luz|la lumière
light.adj|ligero|léger
watch.n|el reloj|la montre
watch.v|mirar|regarder
apple|la manzana|la pomme
sandwich|el sándwich|le sandwich
cake|el pastel|le gâteau
bread|el pan|le pain
cheese|el queso|le fromage
soup|la sopa|la soupe
coffee|el café|le café
tea|el té|le thé
rice|el arroz|le riz
honey|la miel|le miel
library|la biblioteca|la bibliothèque
park.n|el parque|le parc
kitchen|la cocina|la cuisine
beach|la playa|la plage
mountain|la montaña|la montagne
river|el río|la rivière
city|la ciudad|la ville
village|el pueblo|le village
garden.n|el jardín|le jardin
island|la isla|l'île f
market|el mercado|le marché
museum|el museo|le musée
idea|la idea|l'idée f
plan.n|el plan|le plan
dream.n|el sueño|le rêve
question|la pregunta|la question
memory|el recuerdo|le souvenir
secret|el secreto|le secret
story|la historia|l'histoire f
promise.n|la promesa|la promesse
mistake|el error|l'erreur f
opinion|la opinión|l'opinion f
habit|el hábito|l'habitude f
adventure|la aventura|l'aventure f
journey|el viaje|le voyage
paradox|la paradoja|le paradoxe
metaphor|la metáfora|la métaphore
simile|el símil|la comparaison
idiom|el modismo|l'expression idiomatique f
cliche|el cliché|le cliché
pun|el juego de palabras|le jeu de mots
oxymoron|el oxímoron|l'oxymore m
onomatopoeia|la onomatopeya|l'onomatopée f
music|la música|la musique
time|el tiempo|le temps
love.n|el amor|l'amour m
courage|el valor|le courage
patience|la paciencia|la patience
knowledge|el conocimiento|la connaissance
freedom|la libertad|la liberté
friendship|la amistad|l'amitié f
kindness|la amabilidad|la gentillesse
happiness|la felicidad|le bonheur
nostalgia|la nostalgia|la nostalgie
serendipity|la serendipia|la sérendipité
empathy|la empatía|l'empathie f
curiosity|la curiosidad|la curiosité
sarcasm|el sarcasmo|le sarcasme
irony|la ironía|l'ironie f
weather.n|el tiempo|le temps
run.v|correr|courir
run.n|la carrera|la course
walk.v|caminar|marcher
sleep.v|dormir|dormir
laugh|reír|rire
smile|sonreír|sourire
swim.v|nadar|nager
dance.v|bailar|danser
sing|cantar|chanter
cry|llorar|pleurer
travel|viajar|voyager
wait|esperar|attendre
rest.v|descansar|se reposer
think|pensar|penser
wander|deambular|errer
relax|relajarse|se détendre
listen|escuchar|écouter
procrastinate|procrastinar|procrastiner
go|ir|aller
arrive|llegar|arriver
read|leer|lire
write|escribir|écrire
build|construir|construire
find|encontrar|trouver
fix|arreglar|réparer
paint|pintar|peindre
open.v|abrir|ouvrir
carry|llevar|porter
borrow|pedir prestado|emprunter
share|compartir|partager
learn|aprender|apprendre
forget|olvidar|oublier
remember|recordar|se souvenir
teach|enseñar|enseigner
buy|comprar|acheter
make|hacer|faire
bake|hornear|faire cuire au four
cook.v|cocinar|cuisiner
clean.v|limpiar|nettoyer
catch|atrapar|attraper
throw|lanzar|lancer
explain|explicar|expliquer
choose|elegir|choisir
break.v|romper|casser
describe|describir|décrire
organize|organizar|organiser
ignore|ignorar|ignorer
admire|admirar|admirer
notice|notar|remarquer
see|ver|voir
hear|oír|entendre
eat|comer|manger
drink|beber|boire
help|ayudar|aider
imagine|imaginar|imaginer
happy|feliz|heureux
sad|triste|triste
tired|cansado|fatigué
hungry|hambriento|affamé
calm|tranquilo|calme
nervous|nervioso|nerveux
excited|emocionado|enthousiaste
bored|aburrido|ennuyé
curious|curioso|curieux
grateful|agradecido|reconnaissant
lonely|solo|seul
proud|orgulloso|fier
confused|confundido|confus
relieved|aliviado|soulagé
kind.adj|amable|gentil
kind.n|el tipo|le genre
brave|valiente|courageux
clever|listo|intelligent
honest|honesto|honnête
patient|paciente|patient
generous|generoso|généreux
polite|educado|poli
rude|maleducado|impoli
wise|sabio|sage
humble|humilde|humble
gregarious|sociable|sociable
meticulous|meticuloso|méticuleux
pragmatic|pragmático|pragmatique
candid|franco|franc
eloquent|elocuente|éloquent
benevolent|benévolo|bienveillant
resilient|resiliente|résilient
big|grande|grand
small|pequeño|petit
old|viejo|vieux
new|nuevo|nouveau
heavy|pesado|lourd
tiny|diminuto|minuscule
enormous|enorme|énorme
beautiful|hermoso|beau
ancient|antiguo|ancien
fragile|frágil|fragile
shiny|brillante|brillant
soft|suave|doux
quiet|tranquilo|calme
bright|brillante|lumineux
dark|oscuro|sombre
warm|cálido|chaud
cold.adj|frío|froid
empty|vacío|vide
crowded|abarrotado|bondé
peaceful|pacífico|paisible
noisy|ruidoso|bruyant
cozy|acogedor|douillet
good|bueno|bon
bad|malo|mauvais
fast.adj|rápido|rapide
slow.adj|lento|lent
important|importante|important
strange|extraño|étrange
delicious|delicioso|délicieux
obvious|obvio|évident
ubiquitous|omnipresente|omniprésent
ephemeral|efímero|éphémère
ambiguous|ambiguo|ambigu
mundane|mundano|banal
quintessential|por excelencia|par excellence
ironic|irónico|ironique
quickly|rápidamente|rapidement
slowly|despacio|lentement
quietly|en silencio|silencieusement
carefully|con cuidado|prudemment
gently|suavemente|doucement
happily|felizmente|joyeusement
suddenly|de repente|soudain
patiently|pacientemente|patiemment
always|siempre|toujours
never|nunca|jamais
often|a menudo|souvent
sometimes|a veces|parfois
rarely|rara vez|rarement
usually|normalmente|d'habitude
however|sin embargo|cependant
because|porque|parce que
although|aunque|bien que
between|entre|entre
hello|hola|bonjour
hey|oye|salut
goodbye|adiós|au revoir
please|por favor|s'il vous plaît
thanks|gracias|merci
word|la palabra|le mot
sentence|la oración|la phrase
noun|el sustantivo|le nom
verb|el verbo|le verbe
adjective|el adjetivo|l'adjectif m
adverb|el adverbio|l'adverbe m
synonym|el sinónimo|le synonyme
antonym|el antónimo|l'antonyme m
dictionary|el diccionario|le dictionnaire
joyful|alegre|joyeux
cheerful|alegre|gai
content|contento|content
delighted|encantado|ravi
thrilled|entusiasmado|ravi
ecstatic|eufórico|extatique
elated|eufórico|exalté
hopeful|esperanzado|plein d'espoir
optimistic|optimista|optimiste
relaxed|relajado|détendu
refreshed|renovado|reposé
energetic|enérgico|énergique
motivated|motivado|motivé
inspired|inspirado|inspiré
confident|seguro|confiant
loved|querido|aimé
thankful|agradecido|reconnaissant
amused|divertido|amusé
playful|juguetón|joueur
safe|seguro|en sécurité
satisfied|satisfecho|satisfait
accomplished|realizado|accompli
productive|productivo|productif
surprised|sorprendido|surpris
amazed|asombrado|émerveillé
impressed|impresionado|impressionné
fascinated|fascinado|fasciné
nostalgic|nostálgico|nostalgique
sentimental|sentimental|sentimental
emotional|emocionado|ému
homesick|nostálgico de casa|qui a le mal du pays
jealous|celoso|jaloux
envious|envidioso|envieux
embarrassed|avergonzado|gêné
ashamed|avergonzado|honteux
guilty|culpable|coupable
frustrated|frustrado|frustré
annoyed|molesto|agacé
irritated|irritado|irrité
angry|enojado|en colère
furious|furioso|furieux
mad|enfadado|fâché
upset|disgustado|contrarié
miserable|desdichado|malheureux
gloomy|sombrío|morose
depressed|deprimido|déprimé
heartbroken|desconsolado|le cœur brisé
devastated|destrozado|anéanti
disappointed|decepcionado|déçu
discouraged|desanimado|découragé
hopeless|sin esperanza|désespéré
worried|preocupado|inquiet
anxious|ansioso|anxieux
scared|asustado|effrayé
afraid|con miedo|qui a peur
frightened|atemorizado|effrayé
terrified|aterrorizado|terrifié
overwhelmed|abrumado|débordé
stressed|estresado|stressé
exhausted|agotado|épuisé
sleepy|somnoliento|somnolent
sick|enfermo|malade
ill|enfermo|malade
unwell|indispuesto|souffrant
sore|dolorido|endolori
thirsty|sediento|assoiffé
full|lleno|plein
restless|inquieto|agité
impatient|impaciente|impatient
shy|tímido|timide
awkward|incómodo|maladroit
insecure|inseguro|peu sûr de soi
lost|perdido|perdu
stuck|atascado|bloqué
numb|entumecido|engourdi
shocked|conmocionado|choqué
cranky|malhumorado|grincheux
grumpy|gruñón|grognon
moody|temperamental|lunatique
busy|ocupado|occupé
free|libre|libre
broke|sin dinero|fauché
lucky|afortunado|chanceux
unlucky|desafortunado|malchanceux
silly|tonto|idiot
alone.adj|solo|seul
mother|la madre|la mère
mom|la mamá|la maman
father|el padre|le père
dad|el papá|le papa
parent|el padre|le parent
sister|la hermana|la sœur
brother|el hermano|le frère
sibling|el hermano|le frère ou la sœur
son|el hijo|le fils
daughter|la hija|la fille
grandmother|la abuela|la grand-mère
grandma|la abuela|la mamie
grandfather|el abuelo|le grand-père
grandpa|el abuelo|le papi
grandparent|el abuelo|le grand-parent
grandchild|el nieto|le petit-enfant
aunt|la tía|la tante
uncle|el tío|l'oncle m
cousin|el primo|le cousin
nephew|el sobrino|le neveu
niece|la sobrina|la nièce
wife|la esposa|la femme
husband|el marido|le mari
partner|la pareja|le partenaire
boyfriend|el novio|le petit ami
girlfriend|la novia|la petite amie
family|la familia|la famille
baby|el bebé|le bébé
toddler|el niño pequeño|le bambin
kid|el niño|le gamin
teenager|el adolescente|l'adolescent m
adult|el adulto|l'adulte m
person|la persona|la personne
people|la gente|les gens
man|el hombre|l'homme m
woman|la mujer|la femme
boy|el chico|le garçon
girl|la chica|la fille
boss|el jefe|le patron
coworker|el compañero de trabajo|le collègue
colleague|el colega|le collègue
employee|el empleado|l'employé m
classmate|el compañero de clase|le camarade de classe
roommate|el compañero de piso|le colocataire
student|el estudiante|l'étudiant m
nurse|el enfermero|l'infirmier m
dentist|el dentista|le dentiste
lawyer|el abogado|l'avocat m
engineer|el ingeniero|l'ingénieur m
scientist|el científico|le scientifique
writer|el escritor|l'écrivain m
author|el autor|l'auteur m
musician|el músico|le musicien
singer|el cantante|le chanteur
actor|el actor|l'acteur m
athlete|el atleta|l'athlète m
coach.n|el entrenador|l'entraîneur m
firefighter|el bombero|le pompier
mechanic|el mecánico|le mécanicien
plumber|el fontanero|le plombier
baker|el panadero|le boulanger
waiter|el camarero|le serveur
cashier|el cajero|le caissier
driver|el conductor|le conducteur
passenger|el pasajero|le passager
programmer|el programador|le programmeur
designer|el diseñador|le designer
manager|el gerente|le responsable
customer|el cliente|le client
guest|el invitado|l'invité m
host.n|el anfitrión|l'hôte m
visitor|el visitante|le visiteur
tourist|el turista|le touriste
hero|el héroe|le héros
king|el rey|le roi
queen|la reina|la reine
everyone|todos|tout le monde
someone|alguien|quelqu'un
nobody|nadie|personne
puppy|el cachorro|le chiot
kitten|el gatito|le chaton
mouse|el ratón|la souris
rat|la rata|le rat
hamster|el hámster|le hamster
parrot|el loro|le perroquet
chicken|el pollo|le poulet
duck|el pato|le canard
goose|el ganso|l'oie f
swan|el cisne|le cygne
pigeon|la paloma|le pigeon
crow|el cuervo|le corbeau
eagle|el águila|l'aigle m
penguin|el pingüino|le manchot
cow|la vaca|la vache
pig|el cerdo|le cochon
sheep|la oveja|le mouton
lamb|el cordero|l'agneau m
goat|la cabra|la chèvre
donkey|el burro|l'âne m
deer|el ciervo|le cerf
bear|el oso|l'ours m
wolf|el lobo|le loup
lion|el león|le lion
tiger|el tigre|le tigre
elephant|el elefante|l'éléphant m
giraffe|la jirafa|la girafe
zebra|la cebra|le zèbre
monkey|el mono|le singe
gorilla|el gorila|le gorille
kangaroo|el canguro|le kangourou
koala|el koala|le koala
panda|el panda|le panda
squirrel|la ardilla|l'écureuil m
hedgehog|el erizo|le hérisson
bat|el murciélago|la chauve-souris
frog|la rana|la grenouille
turtle|la tortuga|la tortue
snake|la serpiente|le serpent
lizard|el lagarto|le lézard
crocodile|el cocodrilo|le crocodile
shark|el tiburón|le requin
dolphin|el delfín|le dauphin
octopus|el pulpo|la pieuvre
crab|el cangrejo|le crabe
fish|el pez|le poisson
goldfish|el pez dorado|le poisson rouge
butterfly|la mariposa|le papillon
ant|la hormiga|la fourmi
spider|la araña|l'araignée f
fly.n|la mosca|la mouche
mosquito|el mosquito|le moustique
ladybug|la mariquita|la coccinelle
snail|el caracol|l'escargot m
worm|el gusano|le ver
dinosaur|el dinosaurio|le dinosaure
pet.n|la mascota|l'animal de compagnie m
animal|el animal|l'animal m
pizza|la pizza|la pizza
pasta|la pasta|les pâtes
spaghetti|los espaguetis|les spaghettis
noodle|el fideo|la nouille
burger|la hamburguesa|le hamburger
taco|el taco|le taco
burrito|el burrito|le burrito
sushi|el sushi|le sushi
salad|la ensalada|la salade
steak|el filete|le steak
egg|el huevo|l'œuf m
bacon|el beicon|le bacon
sausage|la salchicha|la saucisse
toast.n|la tostada|le pain grillé
cereal|los cereales|les céréales
oatmeal|la avena|les flocons d'avoine
pancake|el panqueque|la crêpe
waffle|el gofre|la gaufre
muffin|la magdalena|le muffin
cookie|la galleta|le biscuit
brownie|el brownie|le brownie
pie|la tarta|la tarte
cupcake|el cupcake|le cupcake
donut|la rosquilla|le beignet
bagel|el bagel|le bagel
croissant|el cruasán|le croissant
ice cream|el helado|la glace
chocolate|el chocolate|le chocolat
candy|el caramelo|le bonbon
popcorn|las palomitas|le pop-corn
chips|las patatas fritas|les chips
fries|las papas fritas|les frites
potato|la papa|la pomme de terre
tomato|el tomate|la tomate
carrot|la zanahoria|la carotte
onion|la cebolla|l'oignon m
garlic|el ajo|l'ail m
lettuce|la lechuga|la laitue
broccoli|el brócoli|le brocoli
spinach|las espinacas|les épinards
corn|el maíz|le maïs
bean|el frijol|le haricot
mushroom|el champiñón|le champignon
cucumber|el pepino|le concombre
pepper|el pimiento|le poivron
banana|el plátano|la banane
orange.n|la naranja|l'orange f
orange.adj|naranja|orange
grape|la uva|le raisin
strawberry|la fresa|la fraise
blueberry|el arándano|la myrtille
cherry|la cereza|la cerise
lemon|el limón|le citron
lime|la lima|le citron vert
peach|el melocotón|la pêche
pear|la pera|la poire
pineapple|la piña|l'ananas m
watermelon|la sandía|la pastèque
mango|el mango|la mangue
avocado|el aguacate|l'avocat m
coconut|el coco|la noix de coco
nut|la nuez|la noix
peanut|el cacahuete|la cacahuète
butter|la mantequilla|le beurre
milk|la leche|le lait
yogurt|el yogur|le yaourt
juice|el zumo|le jus
water.n|el agua|l'eau f
soda|el refresco|le soda
lemonade|la limonada|la limonade
smoothie|el batido|le smoothie
salt|la sal|le sel
sugar|el azúcar|le sucre
flour|la harina|la farine
jam|la mermelada|la confiture
sauce|la salsa|la sauce
curry|el curry|le curry
dumpling|la empanadilla|le ravioli chinois
snack|el tentempié|le goûter
meal|la comida|le repas
breakfast|el desayuno|le petit-déjeuner
lunch|el almuerzo|le déjeuner
dinner|la cena|le dîner
dessert|el postre|le dessert
food|la comida|la nourriture
fruit|la fruta|le fruit
vegetable|la verdura|le légume
meat|la carne|la viande
recipe|la receta|la recette
spicy|picante|épicé
sweet|dulce|sucré
sour|agrio|acide
bitter|amargo|amer
salty|salado|salé
crunchy|crujiente|croquant
juicy|jugoso|juteux
tasty|sabroso|savoureux
fresh|fresco|frais
stale|rancio|rassis
pen|el bolígrafo|le stylo
pencil|el lápiz|le crayon
paper|el papel|le papier
notebook|el cuaderno|le cahier
bag|la bolsa|le sac
backpack|la mochila|le sac à dos
wallet|la cartera|le portefeuille
purse|el monedero|le porte-monnaie
coin|la moneda|la pièce
money|el dinero|l'argent m
ticket|el billete|le billet
card|la tarjeta|la carte
gift.n|el regalo|le cadeau
present|el regalo|le cadeau
toy|el juguete|le jouet
ball|la pelota|la balle
doll|la muñeca|la poupée
puzzle|el rompecabezas|le puzzle
game.n|el juego|le jeu
guitar|la guitarra|la guitare
piano|el piano|le piano
drum|el tambor|le tambour
violin|el violín|le violon
headphones|los auriculares|le casque
laptop|el portátil|l'ordinateur portable m
computer|el ordenador|l'ordinateur m
tablet|la tableta|la tablette
screen|la pantalla|l'écran m
television|la televisión|la télévision
radio|la radio|la radio
battery|la batería|la batterie
charger|el cargador|le chargeur
plate|el plato|l'assiette f
bowl|el cuenco|le bol
cup|la taza|la tasse
mug|la taza|le mug
glass|el vaso|le verre
spoon|la cuchara|la cuillère
fork|el tenedor|la fourchette
knife|el cuchillo|le couteau
pan|la sartén|la poêle
pot|la olla|la casserole
kettle|el hervidor|la bouilloire
oven|el horno|le four
fridge|la nevera|le frigo
towel|la toalla|la serviette
soap|el jabón|le savon
toothbrush|el cepillo de dientes|la brosse à dents
pillow|la almohada|l'oreiller m
bed|la cama|le lit
sofa|el sofá|le canapé
table|la mesa|la table
desk|el escritorio|le bureau
shelf|el estante|l'étagère f
drawer|el cajón|le tiroir
curtain|la cortina|le rideau
rug|la alfombra|le tapis
plant.n|la planta|la plante
flower|la flor|la fleur
tree|el árbol|l'arbre m
leaf|la hoja|la feuille
rock|la roca|le rocher
stone|la piedra|la pierre
shell|la concha|le coquillage
feather|la pluma|la plume
rope|la cuerda|la corde
scissors|las tijeras|les ciseaux
glue.n|el pegamento|la colle
brush.n|el cepillo|la brosse
picture|el cuadro|l'image f
photo|la foto|la photo
painting|la pintura|le tableau
poster|el póster|l'affiche f
sign|la señal|le panneau
flag|la bandera|le drapeau
hat|el sombrero|le chapeau
cap|la gorra|la casquette
scarf|la bufanda|l'écharpe f
glove|el guante|le gant
coat|el abrigo|le manteau
jacket|la chaqueta|la veste
sweater|el suéter|le pull
shirt|la camisa|la chemise
dress|el vestido|la robe
jeans|los vaqueros|le jean
shoe|el zapato|la chaussure
boot|la bota|la botte
sock|el calcetín|la chaussette
clothes|la ropa|les vêtements
ring.n|el anillo|la bague
necklace|el collar|le collier
glasses|las gafas|les lunettes
tent|la tienda de campaña|la tente
flashlight|la linterna|la lampe de poche
basket|la cesta|le panier
bucket|el cubo|le seau
broom|la escoba|le balai
gift card|la tarjeta regalo|la carte cadeau
email.n|el correo electrónico|l'e-mail m
message|el mensaje|le message
text.n|el mensaje de texto|le texto
website|el sitio web|le site web
internet|internet|internet
video|el vídeo|la vidéo
song|la canción|la chanson
movie|la película|le film
film.n|la película|le film
show.n|el programa|l'émission f
novel|la novela|le roman
poem|el poema|le poème
joke.n|el chiste|la blague
riddle|la adivinanza|la devinette
car|el coche|la voiture
bus|el autobús|le bus
train.n|el tren|le train
truck|el camión|le camion
boat|el barco|le bateau
ship|el barco|le navire
plane|el avión|l'avion m
motorcycle|la moto|la moto
scooter|el patinete|la trottinette
skateboard|el monopatín|le skateboard
helicopter|el helicóptero|l'hélicoptère m
rocket|el cohete|la fusée
taxi|el taxi|le taxi
subway|el metro|le métro
tractor|el tractor|le tracteur
school|la escuela|l'école f
office|la oficina|le bureau
hospital|el hospital|l'hôpital m
airport|el aeropuerto|l'aéroport m
station|la estación|la gare
restaurant|el restaurante|le restaurant
cafe|la cafetería|le café
bakery|la panadería|la boulangerie
shop.n|la tienda|le magasin
store|la tienda|le magasin
supermarket|el supermercado|le supermarché
mall|el centro comercial|le centre commercial
bank|el banco|la banque
hotel|el hotel|l'hôtel m
cinema|el cine|le cinéma
theater|el teatro|le théâtre
stadium|el estadio|le stade
gym|el gimnasio|la salle de sport
pool|la piscina|la piscine
zoo|el zoológico|le zoo
farm|la granja|la ferme
forest|el bosque|la forêt
desert|el desierto|le désert
lake|el lago|le lac
ocean|el océano|l'océan m
sea|el mar|la mer
valley|el valle|la vallée
hill|la colina|la colline
cave|la cueva|la grotte
field|el campo|le champ
jungle|la selva|la jungle
castle|el castillo|le château
bridge|el puente|le pont
street|la calle|la rue
road|la carretera|la route
town|el pueblo|la ville
country|el país|le pays
house|la casa|la maison
home.n|el hogar|la maison
apartment|el apartamento|l'appartement m
room|la habitación|la pièce
bedroom|el dormitorio|la chambre
bathroom|el baño|la salle de bains
garage|el garaje|le garage
attic|el desván|le grenier
basement|el sótano|le sous-sol
playground|el parque infantil|l'aire de jeux f
university|la universidad|l'université f
classroom|el aula|la salle de classe
church|la iglesia|l'église f
harbor|el puerto|le port
world|el mundo|le monde
space|el espacio|l'espace m
birthday|el cumpleaños|l'anniversaire m
party|la fiesta|la fête
wedding|la boda|le mariage
anniversary|el aniversario|l'anniversaire m
graduation|la graduación|la remise des diplômes
holiday|las vacaciones|les vacances
vacation|las vacaciones|les vacances
trip.n|el viaje|le voyage
concert|el concierto|le concert
festival|el festival|le festival
picnic|el pícnic|le pique-nique
reunion|el reencuentro|les retrouvailles
date.n|la cita|le rendez-vous
sleepover|la fiesta de pijamas|la soirée pyjama
celebration|la celebración|la fête
exam|el examen|l'examen m
test.n|la prueba|le test
quiz.n|el cuestionario|le quiz
interview.n|la entrevista|l'entretien m
meeting|la reunión|la réunion
presentation|la presentación|la présentation
appointment|la cita|le rendez-vous
deadline|la fecha límite|la date limite
competition|la competición|la compétition
race|la carrera|la course
match|el partido|le match
audition|la audición|l'audition f
surgery|la cirugía|l'opération f
recital|el recital|le récital
driving test|el examen de conducir|l'examen du permis m
funeral|el funeral|les funérailles
class|la clase|le cours
lesson|la lección|la leçon
practice.n|la práctica|l'entraînement m
rehearsal|el ensayo|la répétition
weekend|el fin de semana|le week-end
jog|trotar|faire du jogging
hike|hacer senderismo|faire de la randonnée
climb|escalar|grimper
ski|esquiar|skier
skate|patinar|patiner
surf|hacer surf|surfer
cycle|ir en bicicleta|faire du vélo
ride|montar|monter
fly.v|volar|voler
float|flotar|flotter
sit|sentarse|s'asseoir
stand|estar de pie|être debout
lie.v|tumbarse|s'allonger
sneeze.v|estornudar|éternuer
cough.v|toser|tousser
yawn|bostezar|bâiller
breathe|respirar|respirer
shout|gritar|crier
scream|chillar|hurler
whisper|susurrar|chuchoter
whistle|silbar|siffler
hum|tararear|fredonner
giggle|reírse tontamente|glousser
grin|sonreír ampliamente|sourire largement
frown|fruncir el ceño|froncer les sourcils
sigh|suspirar|soupirer
nod|asentir|hocher la tête
wave.v|saludar con la mano|faire signe de la main
shrug|encogerse de hombros|hausser les épaules
stretch|estirarse|s'étirer
exercise.v|hacer ejercicio|faire de l'exercice
train.v|entrenar|s'entraîner
practice.v|practicar|s'exercer
study|estudiar|étudier
work.v|trabajar|travailler
play.v|jugar|jouer
shop.v|ir de compras|faire les courses
explore|explorar|explorer
camp|acampar|camper
meditate|meditar|méditer
pray|rezar|prier
wake|despertarse|se réveiller
nap.v|echar una siesta|faire la sieste
snore|roncar|ronfler
dream.v|soñar|rêver
worry|preocuparse|s'inquiéter
hurry|darse prisa|se dépêcher
rush|apresurarse|se précipiter
stroll|pasear|se promener
crawl|gatear|ramper
bounce|rebotar|rebondir
spin|girar|tourner
shake|sacudir|secouer
shiver|tiritar|frissonner
sweat|sudar|transpirer
blush|sonrojarse|rougir
celebrate|celebrar|fêter
argue|discutir|se disputer
apologize|disculparse|s'excuser
complain|quejarse|se plaindre
chat.v|charlar|bavarder
talk|hablar|parler
speak|hablar|parler
commute.v|ir al trabajo|faire la navette
volunteer.v|ser voluntario|faire du bénévolat
grow|crecer|grandir
melt|derretirse|fondre
freeze|congelarse|geler
rain.v|llover|pleuvoir
snow.v|nevar|neiger
shine|brillar|briller
glow|resplandecer|luire
sparkle|centellear|scintiller
appear|aparecer|apparaître
disappear|desaparecer|disparaître
vanish|esfumarse|s'évanouir
leave|irse|partir
return|volver|revenir
stay|quedarse|rester
hide|esconderse|se cacher
escape|escapar|s'échapper
draw|dibujar|dessiner
sketch|bosquejar|esquisser
cut.v|cortar|couper
chop|picar|hacher
slice.v|rebanar|trancher
peel|pelar|éplucher
stir|remover|remuer
pour|verter|verser
boil|hervir|bouillir
fry|freír|frire
grill|asar a la parrilla|griller
roast|asar|rôtir
wash|lavar|laver
dry.v|secar|sécher
fold|doblar|plier
iron.v|planchar|repasser
sweep|barrer|balayer
tidy.v|ordenar|ranger
decorate|decorar|décorer
water.v|regar|arroser
feed|alimentar|nourrir
pet.v|acariciar|caresser
hug|abrazar|serrer dans ses bras
kiss|besar|embrasser
call|llamar|appeler
visit|visitar|rendre visite
invite|invitar|inviter
meet|conocer|rencontrer
greet|saludar|saluer
thank|agradecer|remercier
ask|preguntar|demander
answer.v|responder|répondre
tell|contar|dire
say|decir|dire
memorize|memorizar|mémoriser
solve|resolver|résoudre
count|contar|compter
measure|medir|mesurer
check|comprobar|vérifier
repair|reparar|réparer
replace|reemplazar|remplacer
charge|cargar|charger
type|teclear|taper
print|imprimir|imprimer
download|descargar|télécharger
send|enviar|envoyer
receive|recibir|recevoir
deliver|entregar|livrer
pack|hacer la maleta|faire ses bagages
unpack|deshacer la maleta|défaire ses bagages
lift|levantar|soulever
push|empujar|pousser
pull|tirar|tirer
kick|patear|donner un coup de pied
hit|golpear|frapper
drop|dejar caer|laisser tomber
hold|sostener|tenir
grab|agarrar|attraper
wrap.v|envolver|emballer
close.v|cerrar|fermer
lock.v|cerrar con llave|fermer à clé
fill|llenar|remplir
spill|derramar|renverser
cross|cruzar|traverser
follow|seguir|suivre
lead|guiar|mener
win|ganar|gagner
lose|perder|perdre
fail|fracasar|échouer
pass|aprobar|réussir
finish|terminar|finir
start.v|empezar|commencer
begin|comenzar|commencer
stop|parar|arrêter
plan.v|planear|planifier
prepare|preparar|préparer
order.v|pedir|commander
pay.v|pagar|payer
sell|vender|vendre
spend|gastar|dépenser
save|ahorrar|économiser
earn|ganar|gagner
lend|prestar|prêter
rent.v|alquilar|louer
wear|llevar puesto|porter
brush.v|cepillar|brosser
rescue|rescatar|sauver
protect|proteger|protéger
chase|perseguir|poursuivre
collect|coleccionar|collectionner
knit|tejer|tricoter
sew|coser|coudre
design|diseñar|concevoir
invent|inventar|inventer
discover|descubrir|découvrir
enjoy|disfrutar|profiter
love.v|amar|aimer
like|gustar|aimer
hate|odiar|détester
miss|echar de menos|manquer
forgive|perdonar|pardonner
trust.v|confiar|faire confiance
believe|creer|croire
understand|entender|comprendre
know|saber|savoir
recognize|reconocer|reconnaître
guess|adivinar|deviner
decide|decidir|décider
agree|estar de acuerdo|être d'accord
want|querer|vouloir
need|necesitar|avoir besoin de
hope.v|esperar|espérer
wish.v|desear|souhaiter
feel|sentir|ressentir
get|conseguir|obtenir
give|dar|donner
take|tomar|prendre
put|poner|mettre
bring|traer|apporter
come|venir|venir
look|mirar|regarder
smell.v|oler|sentir
taste.v|probar|goûter
touch.v|tocar|toucher
move.v|mover|bouger
change.v|cambiar|changer
try|intentar|essayer
use|usar|utiliser
keep|guardar|garder
show.v|mostrar|montrer
red|rojo|rouge
blue|azul|bleu
green|verde|vert
yellow|amarillo|jaune
purple|morado|violet
pink|rosa|rose
black|negro|noir
white|blanco|blanc
gray|gris|gris
brown|marrón|marron
golden|dorado|doré
round|redondo|rond
square.adj|cuadrado|carré
flat|plano|plat
smooth|liso|lisse
rough|áspero|rugueux
sharp|afilado|tranchant
sticky|pegajoso|collant
wet|mojado|mouillé
dry.adj|seco|sec
hard.adj|duro|dur
long|largo|long
short|corto|court
tall|alto|grand
huge|enorme|énorme
giant|gigante|géant
little|pequeño|petit
thick|grueso|épais
thin|delgado|mince
wide|ancho|large
narrow|estrecho|étroit
deep|profundo|profond
shallow|poco profundo|peu profond
clean.adj|limpio|propre
dirty|sucio|sale
broken|roto|cassé
perfect|perfecto|parfait
simple|sencillo|simple
complicated|complicado|compliqué
easy|fácil|facile
difficult|difícil|difficile
cheap|barato|bon marché
expensive|caro|cher
modern|moderno|moderne
famous|famoso|célèbre
popular|popular|populaire
rare|raro|rare
common|común|courant
useful|útil|utile
useless|inútil|inutile
dangerous|peligroso|dangereux
loud|ruidoso|bruyant
hot|caliente|chaud
cool.adj|fresco|frais
sunny|soleado|ensoleillé
cloudy|nublado|nuageux
rainy|lluvioso|pluvieux
windy|ventoso|venteux
foggy|con niebla|brumeux
stormy|tormentoso|orageux
messy|desordenado|en désordre
tidy.adj|ordenado|rangé
neat|pulcro|soigné
cute|mono|mignon
pretty.adj|bonito|joli
ugly|feo|laid
lovely|encantador|charmant
wonderful|maravilloso|merveilleux
amazing.adj|increíble|incroyable
awesome.adj|genial|génial
great|estupendo|super
excellent|excelente|excellent
fantastic|fantástico|fantastique
terrible|terrible|terrible
awful|horrible|affreux
horrible|horrible|horrible
nice|agradable|agréable
fine|bien|bien
okay|vale|d'accord
weird|raro|bizarre
normal|normal|normal
special|especial|spécial
real|real|réel
fake|falso|faux
true|verdadero|vrai
false|falso|faux
right|correcto|juste
wrong|incorrecto|faux
ready|listo|prêt
late.adj|tarde|en retard
early.adj|temprano|en avance
quick.adj|rápido|rapide
young|joven|jeune
alive|vivo|vivant
healthy|sano|en bonne santé
strong|fuerte|fort
weak|débil|faible
rich|rico|riche
poor|pobre|pauvre
friendly|simpático|sympathique
funny|gracioso|drôle
serious|serio|sérieux
smart|inteligente|intelligent
creative|creativo|créatif
lazy|perezoso|paresseux
hardworking|trabajador|travailleur
loyal|leal|loyal
reliable|fiable|fiable
thoughtful|considerado|attentionné
caring|cariñoso|bienveillant
gentle|delicado|doux
cheeky|descarado|effronté
quirky|peculiar|original
ambitious|ambicioso|ambitieux
determined|decidido|déterminé
stubborn|terco|têtu
outgoing|extrovertido|extraverti
hope.n|la esperanza|l'espoir m
fear|el miedo|la peur
anger|la ira|la colère
joy|la alegría|la joie
sadness|la tristeza|la tristesse
grief|el duelo|le chagrin
peace|la paz|la paix
truth|la verdad|la vérité
lie.n|la mentira|le mensonge
luck|la suerte|la chance
success|el éxito|le succès
failure|el fracaso|l'échec m
problem|el problema|le problème
solution|la solución|la solution
answer.n|la respuesta|la réponse
reason|la razón|la raison
choice|la elección|le choix
decision|la decisión|la décision
goal|la meta|le but
wish.n|el deseo|le souhait
advice|el consejo|le conseil
news|las noticias|les nouvelles
fact|el hecho|le fait
rule|la regla|la règle
art|el arte|l'art m
science|la ciencia|la science
history|la historia|l'histoire f
math|las matemáticas|les maths
language|el idioma|la langue
nature|la naturaleza|la nature
health|la salud|la santé
energy|la energía|l'énergie f
job|el trabajo|le travail
career|la carrera|la carrière
hobby|el pasatiempo|le passe-temps
sport|el deporte|le sport
football|el fútbol|le football
trust.n|la confianza|la confiance
respect|el respeto|le respect
pride|el orgullo|la fierté
silence|el silencio|le silence
noise|el ruido|le bruit
change.n|el cambio|le changement
future|el futuro|l'avenir m
past|el pasado|le passé
moment|el momento|le moment
life|la vida|la vie
day|el día|le jour
night|la noche|la nuit
morning|la mañana|le matin
afternoon|la tarde|l'après-midi m
evening|la tarde|le soir
week|la semana|la semaine
month|el mes|le mois
year|el año|l'année f
season|la estación|la saison
spring|la primavera|le printemps
summer|el verano|l'été m
autumn|el otoño|l'automne m
winter|el invierno|l'hiver m
today|hoy|aujourd'hui
tomorrow|mañana|demain
yesterday|ayer|hier
tonight|esta noche|ce soir
soon|pronto|bientôt
later|más tarde|plus tard
now|ahora|maintenant
already|ya|déjà
still.adv|todavía|encore
again|otra vez|encore
together|juntos|ensemble
almost|casi|presque
really|realmente|vraiment
very|muy|très
maybe|quizás|peut-être
definitely|definitivamente|absolument
probably|probablemente|probablement
finally|finalmente|enfin
loudly|en voz alta|fort
softly|suavemente|doucement
calmly|con calma|calmement
proudly|con orgullo|fièrement
eagerly|con entusiasmo|avec impatience
nervously|nerviosamente|nerveusement
cheerfully|alegremente|gaiement
sadly|tristemente|tristement
politely|educadamente|poliment
honestly|sinceramente|honnêtement
frequently|frecuentemente|fréquemment
occasionally|de vez en cuando|de temps en temps
seldom|rara vez|rarement
weather.v|capear|surmonter
sun|el sol|le soleil
moon|la luna|la lune
star|la estrella|l'étoile f
sky|el cielo|le ciel
cloud|la nube|le nuage
rainbow|el arcoíris|l'arc-en-ciel m
snowflake|el copo de nieve|le flocon de neige
storm|la tormenta|la tempête
thunder|el trueno|le tonnerre
lightning|el relámpago|l'éclair m
wind|el viento|le vent
fire.n|el fuego|le feu
ice|el hielo|la glace
snow.n|la nieve|la neige
rain.n|la lluvia|la pluie
sand|la arena|le sable
grass|la hierba|l'herbe f
mud|el barro|la boue
reading|la lectura|la lecture
gardening|la jardinería|le jardinage
photography|la fotografía|la photographie
cooking|la cocina|la cuisine
dance.n|el baile|la danse
yes|sí|oui
no|no|non
sorry|perdón|pardon
welcome.excl|bienvenido|bienvenue
cheers|salud|santé
wow|guau|waouh
oops|uy|oups
ouch|ay|aïe
hooray|hurra|hourra
lol|jaja|mdr
awesome.excl|genial|génial
yikes|caramba|aïe aïe aïe
cool.excl|genial|cool
dude|tío|mec
buddy|colega|pote
mate|amigo|pote
vibe|el ambiente|l'ambiance f
chill|relajarse|se détendre
hang out|pasar el rato|traîner
sunrise|el amanecer|le lever du soleil
sunset|la puesta de sol|le coucher du soleil
weekday|el día laborable|le jour de semaine
Monday|lunes|lundi
Tuesday|martes|mardi
Wednesday|miércoles|mercredi
Thursday|jueves|jeudi
Friday|viernes|vendredi
Saturday|sábado|samedi
Sunday|domingo|dimanche
January|enero|janvier
February|febrero|février
March|marzo|mars
April|abril|avril
May|mayo|mai
June|junio|juin
July|julio|juillet
August|agosto|août
September|septiembre|septembre
October|octubre|octobre
November|noviembre|novembre
December|diciembre|décembre
head.n|la cabeza|la tête
face|la cara|le visage
eye|el ojo|l'œil m
ear|la oreja|l'oreille f
nose|la nariz|le nez
mouth|la boca|la bouche
tooth|el diente|la dent
tongue|la lengua|la langue
throat|la garganta|la gorge
neck|el cuello|le cou
shoulder|el hombro|l'épaule f
arm|el brazo|le bras
hand|la mano|la main
finger|el dedo|le doigt
back.n|la espalda|le dos
stomach|el estómago|l'estomac m
heart|el corazón|le cœur
leg|la pierna|la jambe
knee|la rodilla|le genou
foot|el pie|le pied
toe|el dedo del pie|l'orteil m
skin|la piel|la peau
hair|el pelo|les cheveux
brain|el cerebro|le cerveau
headache|el dolor de cabeza|le mal de tête
cold.n|el resfriado|le rhume
flu|la gripe|la grippe
fever|la fiebre|la fièvre
pain|el dolor|la douleur
hurt.v|doler|faire mal
ache|doler|avoir mal
heal|curarse|guérir
rest.n|el descanso|le repos
sleep.n|el sueño|le sommeil
medicine|la medicina|le médicament
gym class|la clase de educación física|le cours d'EPS
yoga|el yoga|le yoga
walk.n|el paseo|la promenade
swim.n|el baño|la baignade
nap.n|la siesta|la sieste
shower.n|la ducha|la douche
bath|el baño|le bain
work.n|el trabajo|le travail
homework|los deberes|les devoirs
chore|la tarea doméstica|la corvée
project|el proyecto|le projet
blissful|dichoso|comblé
glad|contento|content
pleased|complacido|content
overjoyed|rebosante de alegría|fou de joie
upbeat|animado|optimiste
comfortable|cómodo|à l'aise
uncomfortable|incómodo|mal à l'aise
rested|descansado|reposé
awake|despierto|réveillé
alert|alerta|vigilant
focused|concentrado|concentré
distracted|distraído|distrait
eager|ansioso|impatient
enthusiastic|entusiasta|enthousiaste
keen|entusiasta|enthousiaste
interested|interesado|intéressé
reluctant|reacio|réticent
hesitant|vacilante|hésitant
unsure|inseguro|pas sûr
uncertain|incierto|incertain
certain|seguro|certain
sure|seguro|sûr
puzzled|desconcertado|perplexe
baffled|perplejo|déconcerté
tense|tenso|tendu
uneasy|intranquilo|mal à l'aise
panicked|aterrado|paniqué
desperate|desesperado|désespéré
helpless|indefenso|impuissant
powerless|impotente|impuissant
trapped|atrapado|piégé
lonesome|solitario|esseulé
isolated|aislado|isolé
rejected|rechazado|rejeté
betrayed|traicionado|trahi
hurt.adj|herido|blessé
offended|ofendido|vexé
resentful|resentido|plein de ressentiment
grouchy|cascarrabias|ronchon
irritable|irritable|irritable
exasperated|exasperado|exaspéré
fed up|harto|en avoir marre
drained|agotado|vidé
burnt out|quemado|épuisé
weary|cansado|las
groggy|atontado|groggy
dizzy|mareado|étourdi
nauseous|con náuseas|nauséeux
feverish|febril|fiévreux
achy|dolorido|courbaturé
stiff|rígido|raide
better|mejor|mieux
worse|peor|pire
well.adj|bien|bien
meh|bah|bof
indifferent|indiferente|indifférent
fearless|intrépido|intrépide
bold|audaz|audacieux
timid|tímido|timide
cautious|cauteloso|prudent
careful|cuidadoso|prudent
careless|descuidado|négligent
reckless|imprudente|imprudent
easygoing|tranquilo|facile à vivre
laid-back|relajado|décontracté
optimist|el optimista|l'optimiste m
pessimist|el pesimista|le pessimiste
pessimistic|pesimista|pessimiste
positive|positivo|positif
negative|negativo|négatif
sensible|sensato|raisonnable
foolish|tonto|insensé
clumsy|torpe|maladroit
graceful|elegante|gracieux
modest|modesto|modeste
arrogant|arrogante|arrogant
selfish|egoísta|égoïste
considerate|considerado|attentionné
respectful|respetuoso|respectueux
mean|mezquino|méchant
nasty|desagradable|méchant
cruel|cruel|cruel
sincere|sincero|sincère
trustworthy|digno de confianza|digne de confiance
talented|talentoso|talentueux
skilled|hábil|habile
intelligent|inteligente|intelligent
adventurous|aventurero|aventureux
lively|animado|animé
talkative|hablador|bavard
chatty|parlanchín|bavard
helpful|servicial|serviable
supportive|comprensivo|encourageant
independent|independiente|indépendant
responsible|responsable|responsable
mature|maduro|mûr
childish|infantil|puéril
organized|organizado|organisé
punctual|puntual|ponctuel
forgetful|olvidadizo|distrait
nosy|entrometido|curieux
fiance|el prometido|le fiancé
spouse|el cónyuge|le conjoint
stepmother|la madrastra|la belle-mère
stepfather|el padrastro|le beau-père
twin|el gemelo|le jumeau
godmother|la madrina|la marraine
in-laws|los suegros|la belle-famille
relative|el pariente|le parent
ancestor|el antepasado|l'ancêtre m
neighbour|el vecino|le voisin
best friend|el mejor amigo|le meilleur ami
pal|el colega|le copain
acquaintance|el conocido|la connaissance
crowd|la multitud|la foule
team|el equipo|l'équipe f
group|el grupo|le groupe
club|el club|le club
community|la comunidad|la communauté
audience|el público|le public
volunteer.n|el voluntario|le bénévole
leader|el líder|le chef
expert|el experto|l'expert m
beginner|el principiante|le débutant
champion|el campeón|le champion
winner|el ganador|le gagnant
fan|el aficionado|le fan
genius|el genio|le génie
celebrity|la celebridad|la célébrité
villain|el villano|le méchant
princess|la princesa|la princesse
prince|el príncipe|le prince
wizard|el mago|le sorcier
witch|la bruja|la sorcière
ghost|el fantasma|le fantôme
pirate|el pirata|le pirate
astronaut|el astronauta|l'astronaute m
vet|el veterinario|le vétérinaire
pharmacist|el farmacéutico|le pharmacien
surgeon|el cirujano|le chirurgien
therapist|el terapeuta|le thérapeute
counselor|el consejero|le conseiller
paramedic|el paramédico|l'ambulancier m
police officer|el policía|le policier
detective|el detective|le détective
judge|el juez|le juge
soldier|el soldado|le soldat
sailor|el marinero|le marin
fisherman|el pescador|le pêcheur
gardener|el jardinero|le jardinier
carpenter|el carpintero|le charpentier
electrician|el electricista|l'électricien m
builder|el albañil|le maçon
architect|el arquitecto|l'architecte m
librarian|el bibliotecario|le bibliothécaire
professor|el catedrático|le professeur
principal|el director|le directeur
tutor|el tutor|le tuteur
babysitter|la niñera|la baby-sitter
nanny|la niñera|la nounou
receptionist|el recepcionista|le réceptionniste
secretary|el secretario|le secrétaire
accountant|el contable|le comptable
banker|el banquero|le banquier
salesperson|el vendedor|le vendeur
shopkeeper|el tendero|le commerçant
cook.n|el cocinero|le cuisinier
butcher|el carnicero|le boucher
journalist|el periodista|le journaliste
reporter|el reportero|le reporter
photographer|el fotógrafo|le photographe
painter|el pintor|le peintre
dancer|el bailarín|le danseur
poet|el poeta|le poète
comedian|el humorista|l'humoriste m
magician|el mago|le magicien
clown|el payaso|le clown
captain|el capitán|le capitaine
flight attendant|el auxiliar de vuelo|l'hôtesse de l'air f
mail carrier|el cartero|le facteur
delivery driver|el repartidor|le livreur
cleaner|el limpiador|l'agent d'entretien m
janitor|el conserje|le concierge
security guard|el guardia de seguridad|l'agent de sécurité m
lifeguard|el socorrista|le maître-nageur
intern|el becario|le stagiaire
freelancer|el autónomo|le travailleur indépendant
entrepreneur|el emprendedor|l'entrepreneur m
owner|el dueño|le propriétaire
farmer's market|el mercado de agricultores|le marché fermier
alpaca|la alpaca|l'alpaga m
llama|la llama|le lama
camel|el camello|le chameau
hippo|el hipopótamo|l'hippopotame m
rhino|el rinoceronte|le rhinocéros
cheetah|el guepardo|le guépard
leopard|el leopardo|le léopard
jaguar|el jaguar|le jaguar
panther|la pantera|la panthère
fawn|el cervatillo|le faon
moose|el alce|l'élan m
raccoon|el mapache|le raton laveur
skunk|la mofeta|la mouffette
badger|el tejón|le blaireau
otter|la nutria|la loutre
beaver|el castor|le castor
mole|el topo|la taupe
seal|la foca|le phoque
walrus|la morsa|le morse
polar bear|el oso polar|l'ours polaire m
jellyfish|la medusa|la méduse
starfish|la estrella de mar|l'étoile de mer f
lobster|la langosta|le homard
shrimp|la gamba|la crevette
clam|la almeja|la palourde
salmon|el salmón|le saumon
tuna|el atún|le thon
seahorse|el caballito de mar|l'hippocampe m
hawk|el halcón|le faucon
falcon|el halcón|le faucon
vulture|el buitre|le vautour
peacock|el pavo real|le paon
flamingo|el flamenco|le flamant rose
ostrich|el avestruz|l'autruche f
hummingbird|el colibrí|le colibri
robin|el petirrojo|le rouge-gorge
sparrow|el gorrión|le moineau
seagull|la gaviota|la mouette
woodpecker|el pájaro carpintero|le pic
turkey|el pavo|la dinde
rooster|el gallo|le coq
hen|la gallina|la poule
chick|el pollito|le poussin
duckling|el patito|le caneton
calf|el ternero|le veau
foal|el potro|le poulain
pony|el poni|le poney
bull|el toro|le taureau
ox|el buey|le bœuf
gerbil|el jerbo|la gerbille
guinea pig|la cobaya|le cochon d'Inde
ferret|el hurón|le furet
tortoise|la tortuga|la tortue
chameleon|el camaleón|le caméléon
gecko|el geco|le gecko
iguana|la iguana|l'iguane m
toad|el sapo|le crapaud
tadpole|el renacuajo|le têtard
beetle|el escarabajo|le scarabée
caterpillar|la oruga|la chenille
moth|la polilla|le papillon de nuit
dragonfly|la libélula|la libellule
wasp|la avispa|la guêpe
grasshopper|el saltamontes|la sauterelle
firefly|la luciérnaga|la luciole
scorpion|el escorpión|le scorpion
unicorn|el unicornio|la licorne
dragon|el dragón|le dragon
rose|la rosa|la rose
tulip|el tulipán|la tulipe
daisy|la margarita|la marguerite
sunflower|el girasol|le tournesol
lily|el lirio|le lys
daffodil|el narciso|la jonquille
lavender|la lavanda|la lavande
cactus|el cactus|le cactus
fern|el helecho|la fougère
moss|el musgo|la mousse
weed|la mala hierba|la mauvaise herbe
bush|el arbusto|le buisson
hedge|el seto|la haie
oak|el roble|le chêne
pine|el pino|le pin
palm|la palmera|le palmier
maple|el arce|l'érable m
willow|el sauce|le saule
bamboo|el bambú|le bambou
seed|la semilla|la graine
root|la raíz|la racine
branch|la rama|la branche
petal|el pétalo|le pétale
thorn|la espina|l'épine f
acorn|la bellota|le gland
pinecone|la piña|la pomme de pin
hot dog|el perrito caliente|le hot-dog
wrap.n|el wrap|le wrap
quesadilla|la quesadilla|la quesadilla
nachos|los nachos|les nachos
tortilla|la tortilla|la tortilla
lasagna|la lasaña|les lasagnes
ramen|el ramen|les ramen
risotto|el risotto|le risotto
omelet|la tortilla francesa|l'omelette f
scrambled eggs|los huevos revueltos|les œufs brouillés
porridge|las gachas|le porridge
granola|la granola|le granola
syrup|el sirope|le sirop
honeycomb|el panal|le rayon de miel
biscuit|la galleta|le biscuit
cracker|la galleta salada|le cracker
pretzel|el pretzel|le bretzel
roll|el panecillo|le petit pain
bun|el bollo|la brioche
loaf|la barra de pan|la miche
pastry|el pastel|la pâtisserie
tart|la tarta|la tarte
cheesecake|la tarta de queso|le cheesecake
pudding|el pudin|le pudding
custard|las natillas|la crème anglaise
jelly|la gelatina|la gelée
marshmallow|la nube|la guimauve
lollipop|la piruleta|la sucette
gum|el chicle|le chewing-gum
caramel|el caramelo|le caramel
vanilla|la vainilla|la vanille
cinnamon|la canela|la cannelle
ginger|el jengibre|le gingembre
spice|la especia|l'épice f
herb|la hierba aromática|l'herbe aromatique f
basil|la albahaca|le basilic
mint|la menta|la menthe
parsley|el perejil|le persil
olive|la aceituna|l'olive f
oil|el aceite|l'huile f
vinegar|el vinagre|le vinaigre
ketchup|el kétchup|le ketchup
mustard|la mostaza|la moutarde
mayonnaise|la mayonesa|la mayonnaise
gravy|la salsa de carne|la sauce au jus
salsa|la salsa|la salsa
hummus|el hummus|le houmous
cream|la nata|la crème
cottage cheese|el requesón|le fromage blanc
beef|la carne de res|le bœuf
pork|el cerdo|le porc
ham|el jamón|le jambon
meatball|la albóndiga|la boulette de viande
stew|el guiso|le ragoût
chili|el chile|le chili
kebab|el kebab|le kebab
fish and chips|el pescado con patatas fritas|le fish and chips
dim sum|el dim sum|les dim sum
falafel|el falafel|le falafel
pita|el pan de pita|le pain pita
apricot|el albaricoque|l'abricot m
plum|la ciruela|la prune
kiwi|el kiwi|le kiwi
melon|el melón|le melon
raspberry|la frambuesa|la framboise
blackberry|la mora|la mûre
cranberry|el arándano rojo|la canneberge
fig|el higo|la figue
pomegranate|la granada|la grenade
papaya|la papaya|la papaye
grapefruit|el pomelo|le pamplemousse
tangerine|la mandarina|la mandarine
raisin|la pasa|le raisin sec
almond|la almendra|l'amande f
walnut|la nuez|la noix
cashew|el anacardo|la noix de cajou
pea|el guisante|le petit pois
chickpea|el garbanzo|le pois chiche
lentil|la lenteja|la lentille
cabbage|el repollo|le chou
cauliflower|la coliflor|le chou-fleur
celery|el apio|le céleri
asparagus|el espárrago|l'asperge f
zucchini|el calabacín|la courgette
eggplant|la berenjena|l'aubergine f
pumpkin|la calabaza|la citrouille
sweet potato|el boniato|la patate douce
beet|la remolacha|la betterave
radish|el rábano|le radis
kale|la col rizada|le chou kale
leek|el puerro|le poireau
seaweed|el alga|l'algue f
tofu|el tofu|le tofu
rice cake|la tortita de arroz|la galette de riz
cocoa|el cacao|le cacao
tea bag|la bolsita de té|le sachet de thé
espresso|el café expreso|l'expresso m
latte|el café con leche|le café au lait
cappuccino|el capuchino|le cappuccino
milkshake|el batido|le milk-shake
cola|la cola|le cola
wine|el vino|le vin
beer|la cerveza|la bière
broth|el caldo|le bouillon
leftovers|las sobras|les restes
takeout|la comida para llevar|les plats à emporter
brunch|el brunch|le brunch
feast.n|el banquete|le festin
barbecue|la barbacoa|le barbecue
bake sale|la venta de pasteles|la vente de gâteaux
dinner party|la cena con amigos|le dîner entre amis
appetite|el apetito|l'appétit m
hunger|el hambre|la faim
flavor|el sabor|la saveur
slice.n|la rebanada|la tranche
crumb|la miga|la miette
armchair|el sillón|le fauteuil
bench|el banco|le banc
stool|el taburete|le tabouret
cupboard|el armario|le placard
closet|el armario|le placard
wardrobe|el ropero|l'armoire f
bookcase|la estantería|la bibliothèque
mattress|el colchón|le matelas
carpet|la moqueta|la moquette
floor|el suelo|le sol
wall|la pared|le mur
ceiling|el techo|le plafond
roof|el tejado|le toit
stairs|las escaleras|l'escalier m
fence|la valla|la clôture
gate|la verja|le portail
mailbox|el buzón|la boîte aux lettres
doorbell|el timbre|la sonnette
lamp post|la farola|le lampadaire
sink|el fregadero|l'évier m
tap.n|el grifo|le robinet
toilet|el inodoro|les toilettes
bathtub|la bañera|la baignoire
dishwasher|el lavavajillas|le lave-vaisselle
washing machine|la lavadora|la machine à laver
microwave.n|el microondas|le micro-ondes
stove|la cocina|la cuisinière
toaster|la tostadora|le grille-pain
blender|la licuadora|le mixeur
freezer|el congelador|le congélateur
heater|el calefactor|le radiateur
air conditioner|el aire acondicionado|le climatiseur
light bulb|la bombilla|l'ampoule f
switch.n|el interruptor|l'interrupteur m
plug|el enchufe|la prise
remote.n|el mando a distancia|la télécommande
vacuum.n|la aspiradora|l'aspirateur m
mop.n|la fregona|la serpillière
sponge|la esponja|l'éponge f
bin|el cubo de basura|la poubelle
trash|la basura|les ordures
jar|el tarro|le bocal
can|la lata|la canette
tissue|el pañuelo de papel|le mouchoir en papier
napkin|la servilleta|la serviette de table
tray|la bandeja|le plateau
teapot|la tetera|la théière
thermos|el termo|le thermos
lunchbox|la fiambrera|la boîte à déjeuner
water bottle|la botella de agua|la gourde
cutting board|la tabla de cortar|la planche à découper
whisk|el batidor|le fouet
oven glove|la manopla de horno|le gant de cuisine
key ring|el llavero|le porte-clés
lock.n|la cerradura|la serrure
alarm clock|el despertador|le réveil
calendar|el calendario|le calendrier
diary|el diario|le journal intime
journal|el diario|le journal
magazine|la revista|le magazine
newspaper|el periódico|le journal
comic|el cómic|la bande dessinée
envelope|el sobre|l'enveloppe f
stamp|el sello|le timbre
package|el paquete|le colis
crayon|la cera|le crayon de couleur
marker|el rotulador|le marqueur
eraser|la goma de borrar|la gomme
ruler|la regla|la règle
calculator|la calculadora|la calculatrice
folder|la carpeta|le dossier
sticky note|la nota adhesiva|le post-it
stapler|la grapadora|l'agrafeuse f
tape|la cinta adhesiva|le ruban adhésif
string|la cuerda|la ficelle
needle|la aguja|l'aiguille f
thread|el hilo|le fil
button|el botón|le bouton
zipper|la cremallera|la fermeture éclair
pocket|el bolsillo|la poche
belt|el cinturón|la ceinture
tie|la corbata|la cravate
suit|el traje|le costume
uniform|el uniforme|l'uniforme m
pajamas|el pijama|le pyjama
hoodie|la sudadera con capucha|le sweat à capuche
sweatshirt|la sudadera|le sweat-shirt
t-shirt|la camiseta|le t-shirt
shorts|los pantalones cortos|le short
skirt|la falda|la jupe
trousers|los pantalones|le pantalon
leggings|las mallas|le legging
raincoat|el impermeable|l'imperméable m
swimsuit|el bañador|le maillot de bain
slippers|las zapatillas|les chaussons
sandal|la sandalia|la sandale
sneaker|la zapatilla deportiva|la basket
mitten|la manopla|la moufle
earring|el pendiente|la boucle d'oreille
bracelet|la pulsera|le bracelet
jewelry|las joyas|les bijoux
makeup|el maquillaje|le maquillage
perfume|el perfume|le parfum
shampoo|el champú|le shampooing
toothpaste|la pasta de dientes|le dentifrice
comb|el peine|le peigne
hairbrush|el cepillo para el pelo|la brosse à cheveux
razor|la maquinilla de afeitar|le rasoir
suitcase|la maleta|la valise
luggage|el equipaje|les bagages
passport|el pasaporte|le passeport
sunscreen|el protector solar|la crème solaire
sunglasses|las gafas de sol|les lunettes de soleil
binoculars|los prismáticos|les jumelles
telescope|el telescopio|le télescope
microscope|el microscopio|le microscope
compass|la brújula|la boussole
lantern|el farol|la lanterne
sleeping bag|el saco de dormir|le sac de couchage
hammock|la hamaca|le hamac
balloon|el globo|le ballon
candlestick|el candelabro|le chandelier
vase|el jarrón|le vase
frame|el marco|le cadre
screwdriver|el destornillador|le tournevis
wrench|la llave inglesa|la clé à molette
saw|la sierra|la scie
drill|el taladro|la perceuse
nail|el clavo|le clou
screw|el tornillo|la vis
shovel|la pala|la pelle
rake|el rastrillo|le râteau
hose|la manguera|le tuyau d'arrosage
watering can|la regadera|l'arrosoir m
wheelbarrow|la carretilla|la brouette
smartphone|el teléfono inteligente|le smartphone
keyboard|el teclado|le clavier
monitor|el monitor|l'écran m
printer|la impresora|l'imprimante f
speaker|el altavoz|l'enceinte f
earbuds|los auriculares|les écouteurs
webcam|la cámara web|la webcam
router|el router|le routeur
cable|el cable|le câble
console|la consola|la console
video game|el videojuego|le jeu vidéo
app|la aplicación|l'application f
password|la contraseña|le mot de passe
file|el archivo|le fichier
photo album|el álbum de fotos|l'album photo m
podcast|el pódcast|le podcast
playlist|la lista de reproducción|la playlist
channel|el canal|la chaîne
series|la serie|la série
episode|el episodio|l'épisode m
cartoon|los dibujos animados|le dessin animé
documentary|el documental|le documentaire
board game|el juego de mesa|le jeu de société
chess|el ajedrez|les échecs
cards|las cartas|les cartes
jigsaw|el puzle|le puzzle
teddy bear|el osito de peluche|l'ours en peluche m
blocks|los bloques|les cubes
swing|el columpio|la balançoire
slide|el tobogán|le toboggan
trampoline|la cama elástica|le trampoline
living room|el salón|le salon
dining room|el comedor|la salle à manger
hallway|el pasillo|le couloir
porch|el porche|le porche
balcony|el balcón|le balcon
backyard|el patio trasero|le jardin de derrière
yard|el patio|la cour
shed|el cobertizo|la cabane de jardin
driveway|la entrada de coches|l'allée f
cottage|la casita de campo|le cottage
cabin|la cabaña|la cabane
campsite|el camping|le camping
lighthouse|el faro|le phare
pier|el muelle|la jetée
port|el puerto|le port
dock|el muelle|le quai
marina|el puerto deportivo|la marina
coast|la costa|la côte
shore|la orilla|le rivage
cliff|el acantilado|la falaise
bay|la bahía|la baie
waterfall|la cascada|la cascade
stream.n|el arroyo|le ruisseau
pond|el estanque|l'étang m
volcano|el volcán|le volcan
glacier|el glaciar|le glacier
canyon|el cañón|le canyon
meadow|el prado|la prairie
woods|el bosque|les bois
countryside|el campo|la campagne
suburb|las afueras|la banlieue
neighborhood|el barrio|le quartier
downtown|el centro|le centre-ville
square.n|la plaza|la place
plaza|la plaza|la place
fountain|la fuente|la fontaine
statue|la estatua|la statue
monument|el monumento|le monument
tower|la torre|la tour
skyscraper|el rascacielos|le gratte-ciel
palace|el palacio|le palais
temple|el templo|le temple
mosque|la mezquita|la mosquée
synagogue|la sinagoga|la synagogue
post office|la oficina de correos|la poste
police station|la comisaría|le commissariat
fire station|el parque de bomberos|la caserne de pompiers
pharmacy|la farmacia|la pharmacie
clinic|la clínica|la clinique
salon|la peluquería|le salon de coiffure
barbershop|la barbería|le barbier
laundromat|la lavandería|la laverie
gas station|la gasolinera|la station-service
parking lot|el aparcamiento|le parking
bus stop|la parada de autobús|l'arrêt de bus m
train station|la estación de tren|la gare
bookshop|la librería|la librairie
toy shop|la juguetería|le magasin de jouets
florist|la floristería|le fleuriste
pub|el pub|le pub
bar|el bar|le bar
nightclub|la discoteca|la boîte de nuit
bowling alley|la bolera|le bowling
arcade|el salón recreativo|la salle d'arcade
amusement park|el parque de atracciones|le parc d'attractions
aquarium|el acuario|l'aquarium m
gallery|la galería|la galerie
concert hall|la sala de conciertos|la salle de concert
studio|el estudio|le studio
workshop|el taller|l'atelier m
factory|la fábrica|l'usine f
warehouse|el almacén|l'entrepôt m
lab|el laboratorio|le labo
court|el tribunal|le tribunal
track|la pista|la piste
trail|el sendero|le sentier
path|el camino|le chemin
highway|la autopista|l'autoroute f
tunnel|el túnel|le tunnel
continent|el continente|le continent
planet|el planeta|la planète
earth|la tierra|la terre
universe|el universo|l'univers m
abroad|en el extranjero|à l'étranger
outside|fuera|dehors
inside|dentro|dedans
upstairs|arriba|en haut
downstairs|abajo|en bas
nearby.adv|cerca|à proximité
everywhere|en todas partes|partout
somewhere|en algún lugar|quelque part
anywhere|en cualquier lugar|n'importe où
housewarming|la fiesta de inauguración|la pendaison de crémaillère
baby shower|la fiesta de bienvenida al bebé|la fête prénatale
bridal shower|la despedida de soltera|l'enterrement de vie de jeune fille m
engagement|el compromiso|les fiançailles
honeymoon|la luna de miel|la lune de miel
christening|el bautizo|le baptême
retirement|la jubilación|la retraite
promotion|el ascenso|la promotion
road trip|el viaje por carretera|le road trip
day trip|la excursión de un día|l'excursion d'une journée f
cruise|el crucero|la croisière
tour|la gira|la visite
camping trip|el viaje de acampada|le séjour en camping
playdate|la cita para jugar|le rendez-vous de jeu
movie night|la noche de cine|la soirée cinéma
game night|la noche de juegos|la soirée jeux
karaoke|el karaoke|le karaoké
parade|el desfile|le défilé
fair.n|la feria|la foire
carnival|el carnaval|le carnaval
fireworks|los fuegos artificiales|le feu d'artifice
gig|el concierto|le concert
play.n|la obra de teatro|la pièce de théâtre
musical|el musical|la comédie musicale
opera|la ópera|l'opéra m
ballet|el ballet|le ballet
exhibition|la exposición|l'exposition f
conference|la conferencia|la conférence
seminar|el seminario|le séminaire
lecture|la clase magistral|le cours magistral
assignment|la tarea|le devoir
essay|el ensayo|la dissertation
report|el informe|le rapport
review.n|la reseña|la critique
final|la final|la finale
tournament|el torneo|le tournoi
marathon|el maratón|le marathon
triathlon|el triatlón|le triathlon
tryout|la prueba|les sélections
first day|el primer día|le premier jour
operation|la operación|l'opération f
check-up|la revisión|le bilan de santé
vaccination|la vacunación|la vaccination
haircut|el corte de pelo|la coupe de cheveux
move.n|la mudanza|le déménagement
breakup|la ruptura|la rupture
divorce|el divorcio|le divorce
memorial|el homenaje|la cérémonie commémorative
accident|el accidente|l'accident m
loss|la pérdida|la perte
emergency|la emergencia|l'urgence f
basketball|el baloncesto|le basket
baseball|el béisbol|le baseball
soccer|el fútbol|le football
tennis|el tenis|le tennis
volleyball|el voleibol|le volley
golf|el golf|le golf
hockey|el hockey|le hockey
rugby|el rugby|le rugby
cricket|el críquet|le cricket
badminton|el bádminton|le badminton
boxing|el boxeo|la boxe
swimming|la natación|la natation
running|el running|la course à pied
cycling|el ciclismo|le cyclisme
hiking|el senderismo|la randonnée
climbing|la escalada|l'escalade f
skiing|el esquí|le ski
surfing|el surf|le surf
skating|el patinaje|le patinage
dancing|el baile|la danse
fishing|la pesca|la pêche
camping|la acampada|le camping
knitting|el punto|le tricot
baking|la repostería|la pâtisserie
drawing|el dibujo|le dessin
writing|la escritura|l'écriture f
singing|el canto|le chant
birdwatching|la observación de aves|l'observation des oiseaux f
gaming|los videojuegos|les jeux vidéo
crafts|las manualidades|les loisirs créatifs
pottery|la cerámica|la poterie
sewing|la costura|la couture
shopping|las compras|le shopping
traveling|los viajes|les voyages
volunteering|el voluntariado|le bénévolat
meditation|la meditación|la méditation
exercise.n|el ejercicio|l'exercice m
workout|el entrenamiento|la séance de sport
add|añadir|ajouter
mix|mezclar|mélanger
blend|licuar|mixer
toast.v|tostar|griller
steam.v|cocer al vapor|cuire à la vapeur
microwave.v|calentar en el microondas|réchauffer au micro-ondes
serve|servir|servir
chew|masticar|mâcher
swallow|tragar|avaler
sip|sorber|siroter
gulp|engullir|avaler d'un trait
bite|morder|mordre
lick|lamer|lécher
nibble|mordisquear|grignoter
munch|masticar|mâchonner
starve|morirse de hambre|mourir de faim
dine|cenar|dîner
feast.v|darse un festín|festoyer
clean up|ordenar|ranger
dust.v|quitar el polvo|épousseter
wipe|limpiar|essuyer
scrub|fregar|frotter
rinse|enjuagar|rincer
vacuum.v|pasar la aspiradora|passer l'aspirateur
mop.v|fregar el suelo|passer la serpillière
laundry|la colada|la lessive
hang|colgar|accrocher
arrange|organizar|arranger
assemble|montar|assembler
install|instalar|installer
update|actualizar|mettre à jour
upload|subir|téléverser
delete|borrar|supprimer
click|hacer clic|cliquer
scroll|desplazarse|faire défiler
search|buscar|chercher
browse|navegar|naviguer
text.v|mandar un mensaje|envoyer un texto
email.v|enviar un correo|envoyer un e-mail
post|publicar|publier
reply|contestar|répondre
revise|repasar|réviser
review.v|revisar|réviser
quiz.v|preguntar|interroger
graduate|graduarse|obtenir son diplôme
pass out|desmayarse|s'évanouir
faint|desmayarse|s'évanouir
injure|lesionar|blesser
sprain|torcerse|se fouler
bleed|sangrar|saigner
recover|recuperarse|se rétablir
sleep in|dormir hasta tarde|faire la grasse matinée
oversleep|quedarse dormido|ne pas se réveiller
stay up|trasnochar|veiller
get up|levantarse|se lever
wake up|despertarse|se réveiller
fall asleep|dormirse|s'endormir
fall|caerse|tomber
trip.v|tropezar|trébucher
slip|resbalar|glisser
crash|chocar|s'écraser
burn|quemar|brûler
crack|agrietarse|fissurer
tear|rasgar|déchirer
ruin|arruinar|ruiner
waste|desperdiciar|gaspiller
mess up|estropear|gâcher
struggle|luchar|lutter
cope|arreglárselas|faire face
manage|gestionar|gérer
handle|manejar|gérer
deal with|ocuparse de|s'occuper de
sort out|solucionar|régler
figure out|averiguar|comprendre
give up|rendirse|abandonner
quit|dejar|arrêter
succeed|tener éxito|réussir
achieve|lograr|accomplir
improve|mejorar|améliorer
cheer|animar|acclamer
clap|aplaudir|applaudir
joke.v|bromear|plaisanter
tease|tomar el pelo|taquiner
cuddle|acurrucarse|câliner
snuggle|acurrucarse|se blottir
comfort.v|consolar|réconforter
encourage|animar|encourager
support|apoyar|soutenir
care|preocuparse|se soucier
panic|entrar en pánico|paniquer
sob|sollozar|sangloter
yell|gritar|hurler
mumble|murmurar|marmonner
mutter|refunfuñar|marmonner
rap|rapear|rapper
perform|actuar|se produire
act|actuar|jouer
direct|dirigir|diriger
film.v|filmar|filmer
record.v|grabar|enregistrer
photograph|fotografiar|photographier
listen to|escuchar|écouter
binge|darse un atracón|se gaver
stream.v|ver en streaming|regarder en streaming
game.v|jugar a videojuegos|jouer aux jeux vidéo
paddle|remar|pagayer
row|remar|ramer
sail|navegar|naviguer
dive|bucear|plonger
splash|salpicar|éclabousser
skip|saltarse|sauter
hop|brincar|sautiller
jump|saltar|sauter
leap|saltar|bondir
march|marchar|marcher au pas
roam|vagar|errer
drive|conducir|conduire
park.v|aparcar|se garer
board|embarcar|embarquer
land|aterrizar|atterrir
take off|despegar|décoller
check in|registrarse|s'enregistrer
cancel|cancelar|annuler
postpone|aplazar|reporter
reschedule|reprogramar|reprogrammer
attend|asistir|assister
join|unirse|rejoindre
sign up|inscribirse|s'inscrire
apply|solicitar|postuler
interview.v|entrevistar|interviewer
hire|contratar|embaucher
fire.v|despedir|licencier
retire|jubilarse|prendre sa retraite
work out|hacer ejercicio|faire du sport
lift weights|levantar pesas|soulever des poids
warm up|calentar|s'échauffer
unwind|desconectar|décompresser
date.v|salir con|sortir avec
marry|casarse|épouser
propose|pedir matrimonio|demander en mariage
break up|romper|rompre
fight|pelear|se battre
blame|culpar|blâmer
welcome.v|dar la bienvenida|accueillir
host.v|ser anfitrión|accueillir
wrap up|terminar|conclure
gift.v|regalar|offrir
donate|donar|faire un don
lend a hand|echar una mano|donner un coup de main
babysit|cuidar niños|faire du baby-sitting
adopt|adoptar|adopter
garden.v|trabajar en el jardín|jardiner
plant.v|plantar|planter
pick|recoger|cueillir
harvest|cosechar|récolter
mow|cortar el césped|tondre
prune|podar|tailler
walk the dog|pasear al perro|promener le chien
fetch|traer|rapporter
bark|ladrar|aboyer
purr|ronronear|ronronner
meow|maullar|miauler
growl|gruñir|grogner
tweet|piar|gazouiller
buzz|zumbar|bourdonner
howl|aullar|hurler
fly away|irse volando|s'envoler
shop around|comparar precios|comparer les prix
afford|permitirse|avoir les moyens
budget.v|presupuestar|budgétiser
owe|deber|devoir
invest|invertir|investir
count on|contar con|compter sur
depend|depender|dépendre
wonder.v|preguntarse|se demander
pretend|fingir|faire semblant
plan ahead|planificar con antelación|anticiper
expect|esperar|s'attendre à
remind|recordar|rappeler
realize|darse cuenta|se rendre compte
compare|comparar|comparer
prefer|preferir|préférer
suggest|sugerir|suggérer
recommend|recomendar|recommander
promise.v|prometer|promettre
admit|admitir|admettre
deny|negar|nier
confess|confesar|avouer
gossip|cotillear|commérer
praise|elogiar|féliciter
criticize|criticar|critiquer
compliment.v|halagar|complimenter
insult|insultar|insulter
interrupt|interrumpir|interrompre
hurry up|darse prisa|se dépêcher
slow down|ir más despacio|ralentir
wait for|esperar|attendre
queue.v|hacer cola|faire la queue
head.v|dirigirse|se diriger
stay over|quedarse a dormir|passer la nuit
move in|mudarse|emménager
move out|mudarse|déménager
settle in|instalarse|s'installer
grow up|crecer|grandir
brilliant|brillante|brillant
superb|magnífico|superbe
outstanding|excepcional|exceptionnel
incredible|increíble|incroyable
marvelous|maravilloso|merveilleux
splendid|espléndido|splendide
magnificent|magnífico|magnifique
gorgeous|precioso|magnifique
stunning|impresionante|époustouflant
fabulous|fabuloso|fabuleux
terrific|estupendo|formidable
fun|divertido|amusant
enjoyable|agradable|agréable
pleasant|agradable|agréable
unpleasant|desagradable|désagréable
exciting|emocionante|passionnant
thrilling|apasionante|palpitant
interesting|interesante|intéressant
fascinating|fascinante|fascinant
boring|aburrido|ennuyeux
dull|soso|terne
tedious|tedioso|fastidieux
relaxing|relajante|relaxant
stressful|estresante|stressant
exhausting|agotador|épuisant
tiring|cansado|fatigant
hectic|ajetreado|mouvementé
chaotic|caótico|chaotique
tough|duro|dur
challenging|exigente|stimulant
tricky|complicado|délicat
successful|exitoso|réussi
disastrous|desastroso|désastreux
rubbish|malísimo|nul
lame|cutre|nul
so-so|regular|moyen
average|normal|moyen
alright|bien|bien
decent|decente|correct
ordinary|corriente|ordinaire
unusual|inusual|inhabituel
usual|habitual|habituel
typical|típico|typique
odd|raro|bizarre
crazy|loco|fou
wild|salvaje|sauvage
tame|manso|apprivoisé
colorful|colorido|coloré
vivid|vívido|vif
pale|pálido|pâle
transparent|transparente|transparent
sparkly|brillante|scintillant
fluffy|esponjoso|duveteux
furry|peludo|poilu
fuzzy|velloso|duveteux
silky|sedoso|soyeux
bumpy|lleno de baches|cahoteux
slippery|resbaladizo|glissant
muddy|embarrado|boueux
dusty|polvoriento|poussiéreux
rusty|oxidado|rouillé
crispy|crujiente|croustillant
soggy|empapado|détrempé
creamy|cremoso|crémeux
cheesy|con mucho queso|au fromage
greasy|grasiento|gras
bland|soso|fade
mild|suave|doux
ripe|maduro|mûr
rotten|podrido|pourri
frozen|congelado|gelé
boiling|hirviendo|bouillant
freezing|helado|glacial
chilly|fresco|frais
humid|húmedo|humide
breezy|con brisa|venteux
snowy|nevado|enneigé
icy|helado|verglacé
misty|brumoso|brumeux
clear|despejado|clair
spacious|espacioso|spacieux
cramped|estrecho|exigu
deserted|desierto|désert
private|privado|privé
public|público|public
local|local|local
foreign|extranjero|étranger
international|internacional|international
massive|enorme|massif
mini|mini|mini
compact|compacto|compact
loose|suelto|ample
tight|ajustado|serré
straight.adj|recto|droit
curly|rizado|frisé
open.adj|abierto|ouvert
closed|cerrado|fermé
risky|arriesgado|risqué
necessary|necesario|nécessaire
possible|posible|possible
impossible|imposible|impossible
likely|probable|probable
unlikely|improbable|improbable
fortunate|afortunado|chanceux
unfortunate|desafortunado|malheureux
correct|correcto|correct
accurate|preciso|précis
exact|exacto|exact
fair.adj|justo|juste
unfair|injusto|injuste
whole|entero|entier
entire|completo|entier
extra|extra|supplémentaire
spare|de repuesto|de rechange
main|principal|principal
own|propio|propre
same|mismo|même
different|diferente|différent
similar|parecido|semblable
favorite|favorito|préféré
precious|precioso|précieux
valuable|valioso|précieux
worthless|sin valor|sans valeur
handy|práctico|pratique
convenient|conveniente|pratique
comfy|cómodo|confortable
spotless|impecable|impeccable
filthy|asqueroso|crasseux
old-fashioned|anticuado|démodé
classic|clásico|classique
brand-new|nuevo|tout neuf
secondhand|de segunda mano|d'occasion
homemade|casero|fait maison
handmade|hecho a mano|fait main
natural|natural|naturel
artificial|artificial|artificiel
digital|digital|numérique
electric|eléctrico|électrique
online|en línea|en ligne
offline|sin conexión|hors ligne
wireless|inalámbrico|sans fil
portable|portátil|portable
waterproof|impermeable|imperméable
broken-hearted|con el corazón roto|le cœur brisé
gratitude|la gratitud|la gratitude
humor|el humor|l'humour m
imagination|la imaginación|l'imagination f
creativity|la creatividad|la créativité
inspiration|la inspiración|l'inspiration f
motivation|la motivación|la motivation
ambition|la ambición|l'ambition f
confidence|la confianza|la confiance
anxiety|la ansiedad|l'anxiété f
stress|el estrés|le stress
comfort.n|la comodidad|le confort
relief|el alivio|le soulagement
mood|el estado de ánimo|l'humeur f
emotion|la emoción|l'émotion f
feeling|el sentimiento|le sentiment
excitement|la emoción|l'excitation f
boredom|el aburrimiento|l'ennui m
loneliness|la soledad|la solitude
jealousy|los celos|la jalousie
shame|la vergüenza|la honte
guilt|la culpa|la culpabilité
surprise|la sorpresa|la surprise
wonder.n|el asombro|l'émerveillement m
awe|el asombro|l'admiration f
compassion|la compasión|la compassion
sympathy|la compasión|la compassion
forgiveness|el perdón|le pardon
honesty|la honestidad|l'honnêteté f
loyalty|la lealtad|la loyauté
relationship|la relación|la relation
marriage|el matrimonio|le mariage
childhood|la infancia|l'enfance f
tradition|la tradición|la tradition
culture|la cultura|la culture
religion|la religión|la religion
belief|la creencia|la croyance
doubt|la duda|le doute
mystery|el misterio|le mystère
miracle|el milagro|le miracle
magic|la magia|la magie
experience|la experiencia|l'expérience f
opportunity|la oportunidad|l'occasion f
chance|la oportunidad|la chance
risk|el riesgo|le risque
danger|el peligro|le danger
safety|la seguridad|la sécurité
health care|la atención médica|les soins de santé
fitness|la forma física|la forme physique
diet|la dieta|le régime
routine|la rutina|la routine
schedule|el horario|l'emploi du temps m
topic|el tema|le sujet
subject|la asignatura|la matière
education|la educación|l'éducation f
grade|la nota|la note
score.n|la puntuación|le score
result|el resultado|le résultat
mark|la nota|la note
degree|el título|le diplôme
certificate|el certificado|le certificat
diploma|el diploma|le diplôme
scholarship|la beca|la bourse
break.n|el descanso|la pause
recess|el recreo|la récréation
semester|el semestre|le semestre
term|el trimestre|le trimestre
salary|el sueldo|le salaire
pay.n|la paga|la paie
bill|la factura|la facture
receipt|el recibo|le reçu
price|el precio|le prix
cost|el coste|le coût
budget.n|el presupuesto|le budget
savings|los ahorros|les économies
debt|la deuda|la dette
loan|el préstamo|le prêt
rent.n|el alquiler|le loyer
tax|el impuesto|l'impôt m
discount|el descuento|la réduction
sale|la rebaja|les soldes
bargain|la ganga|la bonne affaire
cash|el efectivo|les espèces
credit card|la tarjeta de crédito|la carte de crédit
business|el negocio|l'entreprise f
company|la empresa|l'entreprise f
shift|el turno|le service
overtime|las horas extra|les heures supplémentaires
commute.n|el trayecto al trabajo|le trajet domicile-travail
task|la tarea|la tâche
progress|el progreso|le progrès
excuse|la excusa|l'excuse f
apology|la disculpa|les excuses
compliment.n|el cumplido|le compliment
complaint|la queja|la plainte
argument|la discusión|la dispute
conversation|la conversación|la conversation
chat.n|la charla|la discussion
discussion|el debate|la discussion
speech|el discurso|le discours
rumor|el rumor|la rumeur
information|la información|l'information f
detail|el detalle|le détail
example|el ejemplo|l'exemple m
instruction|la instrucción|l'instruction f
warning|la advertencia|l'avertissement m
address|la dirección|l'adresse f
direction|la dirección|la direction
distance|la distancia|la distance
traffic|el tráfico|la circulation
delay|el retraso|le retard
queue.n|la cola|la file d'attente
reservation|la reserva|la réservation
invitation|la invitación|l'invitation f
reminder|el recordatorio|le rappel
alarm|la alarma|l'alarme f
getaway|la escapada|l'escapade f
staycation|las vacaciones en casa|les vacances à la maison
day off|el día libre|le jour de congé
sick day|el día de baja|le jour de maladie
power cut|el apagón|la coupure de courant
flat tire|la rueda pinchada|le pneu crevé
hangover|la resaca|la gueule de bois
jet lag|el desfase horario|le décalage horaire
nightmare|la pesadilla|le cauchemar
daydream.n|la ensoñación|la rêverie
bucket list|la lista de deseos|la liste de choses à faire avant de mourir
challenge|el reto|le défi
victory|la victoria|la victoire
defeat|la derrota|la défaite
prize|el premio|le prix
award|el galardón|la récompense
trophy|el trofeo|le trophée
medal|la medalla|la médaille
record.n|el récord|le record
skill|la habilidad|la compétence
talent|el talento|le talent
ability|la capacidad|la capacité
strength|la fuerza|la force
weakness|la debilidad|la faiblesse
attention|la atención|l'attention f
focus.n|el enfoque|la concentration
balance|el equilibrio|l'équilibre m
chaos|el caos|le chaos
order.n|el orden|l'ordre m
mess|el desorden|le désordre
sound|el sonido|le son
smell.n|el olor|l'odeur f
taste.n|el sabor|le goût
touch.n|el tacto|le toucher
sight|la vista|la vue
view|la vista|la vue
shape|la forma|la forme
size|el tamaño|la taille
color.n|el color|la couleur
weight|el peso|le poids
height|la altura|la taille
age|la edad|l'âge m
birthday party|la fiesta de cumpleaños|la fête d'anniversaire
well.adv|bien|bien
badly|mal|mal
brilliantly|brillantemente|brillamment
terribly|terriblemente|terriblement
perfectly|perfectamente|parfaitement
smoothly|sin problemas|sans accroc
easily|fácilmente|facilement
fast.adv|rápido|vite
hard.adv|duro|dur
gladly|con gusto|volontiers
kindly|amablemente|gentiment
angrily|con enfado|avec colère
bravely|valientemente|courageusement
carelessly|descuidadamente|négligemment
gracefully|con elegancia|gracieusement
clumsily|torpemente|maladroitement
silently|en silencio|silencieusement
quick.adv|rápido|vite
slow.adv|despacio|lentement
early.adv|temprano|tôt
late.adv|tarde|tard
recently|recientemente|récemment
lately|últimamente|ces derniers temps
nowadays|hoy en día|de nos jours
someday|algún día|un jour
eventually|al final|finalement
immediately|inmediatamente|immédiatement
instantly|al instante|instantanément
once|una vez|une fois
twice|dos veces|deux fois
forever|para siempre|pour toujours
ever|alguna vez|jamais
yet|todavía|encore
just|solo|juste
only|solo|seulement
even|incluso|même
also|también|aussi
too|demasiado|trop
quite|bastante|assez
rather|bastante|plutôt
pretty.adv|bastante|assez
fairly|bastante|assez
extremely|extremadamente|extrêmement
totally|totalmente|totalement
completely|completamente|complètement
absolutely|absolutamente|absolument
exactly|exactamente|exactement
nearly|casi|presque
hardly|apenas|à peine
barely|apenas|à peine
slightly|ligeramente|légèrement
especially|especialmente|surtout
actually|en realidad|en fait
basically|básicamente|en gros
certainly|ciertamente|certainement
clearly|claramente|clairement
obviously|obviamente|évidemment
seriously|en serio|sérieusement
luckily|por suerte|heureusement
fortunately|afortunadamente|heureusement
unfortunately|desafortunadamente|malheureusement
hopefully|ojalá|j'espère
apparently|al parecer|apparemment
anyway|de todos modos|de toute façon
otherwise|de lo contrario|sinon
instead|en cambio|plutôt
therefore|por lo tanto|donc
meanwhile|mientras tanto|pendant ce temps
afterward|después|après
beforehand|de antemano|à l'avance
alone.adv|solo|seul
away|lejos|loin
back.adv|de vuelta|de retour
home.adv|a casa|à la maison
here|aquí|ici
there|allí|là
up|arriba|en haut
down|abajo|en bas
along|a lo largo|le long
around.adv|alrededor|autour
straight.adv|recto|tout droit
and|y|et
but|pero|mais
or|o|ou
so|así que|donc
if|si|si
unless|a menos que|à moins que
while|mientras|pendant que
when|cuando|quand
before|antes de|avant
after|después de|après
until|hasta|jusqu'à
since|desde|depuis
though|aunque|bien que
whether|si|si
in|en|dans
on|sobre|sur
under|debajo de|sous
over|encima de|au-dessus de
behind|detrás de|derrière
beside|al lado de|à côté de
near|cerca de|près de
through|a través de|à travers
across|al otro lado de|de l'autre côté de
toward|hacia|vers
without|sin|sans
with|con|avec
during|durante|pendant
against|contra|contre
among|entre|parmi
around.prep|alrededor de|autour de
it|ello|il
they|ellos|ils
we|nosotros|nous
you|tú|tu
I|yo|je
something|algo|quelque chose
nothing|nada|rien
everything|todo|tout
anything|cualquier cosa|n'importe quoi
anyone|cualquiera|n'importe qui
somebody|alguien|quelqu'un
everybody|todo el mundo|tout le monde
zero|cero|zéro
one|uno|un
hundred|cien|cent
thousand|mil|mille
million|millón|million
half|la mitad|la moitié
quarter|el cuarto|le quart
dozen|la docena|la douzaine
couple|la pareja|le couple
pair|el par|la paire
lot|el montón|beaucoup
bit|el poco|le peu
piece|el trozo|le morceau
second|el segundo|la seconde
minute|el minuto|la minute
hour|la hora|l'heure f
midnight|la medianoche|minuit
noon|el mediodía|midi
dawn|el amanecer|l'aube f
dusk|el anochecer|le crépuscule
decade|la década|la décennie
century|el siglo|le siècle
Christmas|Navidad|Noël
Halloween|Halloween|Halloween
New Year|Año Nuevo|le Nouvel An
Thanksgiving|Acción de Gracias|Thanksgiving
Easter|Pascua|Pâques
Valentine's Day|San Valentín|la Saint-Valentin
Eid|el Eid|l'Aïd f
Diwali|Diwali|Diwali
Hanukkah|Janucá|Hanoukka
Lunar New Year|el Año Nuevo Lunar|le Nouvel An lunaire
breeze|la brisa|la brise
gale|el vendaval|le coup de vent
hurricane|el huracán|l'ouragan m
tornado|el tornado|la tornade
flood|la inundación|l'inondation f
drought|la sequía|la sécheresse
earthquake|el terremoto|le tremblement de terre
heatwave|la ola de calor|la canicule
frost|la escarcha|le givre
fog|la niebla|le brouillard
mist|la neblina|la brume
hail|el granizo|la grêle
drizzle|la llovizna|la bruine
puddle|el charco|la flaque
wave.n|la ola|la vague
tide|la marea|la marée
current|la corriente|le courant
sunshine|el sol|le soleil
sunlight|la luz del sol|la lumière du soleil
shade|la sombra|l'ombre f
shadow|la sombra|l'ombre f
darkness|la oscuridad|l'obscurité f
air|el aire|l'air m
oxygen|el oxígeno|l'oxygène m
smoke|el humo|la fumée
steam.n|el vapor|la vapeur
soil|el suelo|le sol
dirt|la tierra|la saleté
dust.n|el polvo|la poussière
pebble|el guijarro|le caillou
crystal|el cristal|le cristal
diamond|el diamante|le diamant
gold|el oro|l'or m
silver|la plata|l'argent m
metal|el metal|le métal
iron.n|el hierro|le fer
steel|el acero|l'acier m
wood|la madera|le bois
plastic|el plástico|le plastique
cotton|el algodón|le coton
wool|la lana|la laine
silk|la seda|la soie
leather|el cuero|le cuir
rubber|el caucho|le caoutchouc
concrete|el hormigón|le béton
brick|el ladrillo|la brique
clay|la arcilla|l'argile f
fabric|la tela|le tissu
electricity|la electricidad|l'électricité f
fuel|el combustible|le carburant
gas|el gas|le gaz
experiment|el experimento|l'expérience f
theory|la teoría|la théorie
discovery|el descubrimiento|la découverte
invention|el invento|l'invention f
atom|el átomo|l'atome m
gravity|la gravedad|la gravité
magnet|el imán|l'aimant m
robot|el robot|le robot
machine|la máquina|la machine
engine|el motor|le moteur
wheel|la rueda|la roue
tool|la herramienta|l'outil m
technology|la tecnología|la technologie
science fiction|la ciencia ficción|la science-fiction
fiction|la ficción|la fiction
poetry|la poesía|la poésie
literature|la literatura|la littérature
geography|la geografía|la géographie
biology|la biología|la biologie
chemistry|la química|la chimie
physics|la física|la physique
astronomy|la astronomía|l'astronomie f
economics|la economía|l'économie f
psychology|la psicología|la psychologie
philosophy|la filosofía|la philosophie
chin|la barbilla|le menton
cheek|la mejilla|la joue
forehead|la frente|le front
lip|el labio|la lèvre
eyebrow|la ceja|le sourcil
eyelash|la pestaña|le cil
jaw|la mandíbula|la mâchoire
elbow|el codo|le coude
wrist|la muñeca|le poignet
thumb|el pulgar|le pouce
fingernail|la uña|l'ongle m
chest|el pecho|la poitrine
belly|la barriga|le ventre
hip|la cadera|la hanche
ankle|el tobillo|la cheville
heel|el talón|le talon
muscle|el músculo|le muscle
bone|el hueso|l'os m
blood|la sangre|le sang
lung|el pulmón|le poumon
voice|la voz|la voix
body|el cuerpo|le corps
mind|la mente|l'esprit m
breath|el aliento|le souffle
sneeze.n|el estornudo|l'éternuement m
cough.n|la tos|la toux
sore throat|el dolor de garganta|le mal de gorge
toothache|el dolor de muelas|le mal de dents
stomachache|el dolor de estómago|le mal de ventre
backache|el dolor de espalda|le mal de dos
earache|el dolor de oído|le mal d'oreille
migraine|la migraña|la migraine
allergy|la alergia|l'allergie f
rash|el sarpullido|l'éruption cutanée f
bruise|el moratón|le bleu
cut.n|el corte|la coupure
scar|la cicatriz|la cicatrice
blister|la ampolla|l'ampoule f
sunburn|la quemadura de sol|le coup de soleil
infection|la infección|l'infection f
virus|el virus|le virus
germ|el germen|le microbe
pill|la pastilla|la pilule
bandage|la venda|le bandage
plaster|la tirita|le pansement
crutch|la muleta|la béquille
wheelchair|la silla de ruedas|le fauteuil roulant
prescription|la receta|l'ordonnance f
accept|aceptar|accepter
refuse|negarse|refuser
allow|permitir|permettre
let|dejar|laisser
prevent|prevenir|empêcher
avoid|evitar|éviter
warn|advertir|avertir
survive|sobrevivir|survivre
belong|pertenecer|appartenir
contain|contener|contenir
include|incluir|inclure
weigh|pesar|peser
cover|cubrir|couvrir
uncover|destapar|découvrir
reveal|revelar|révéler
spread|extender|étaler
squeeze|apretar|presser
press|pulsar|appuyer
turn|girar|tourner
turn on|encender|allumer
turn off|apagar|éteindre
switch.v|cambiar|changer
swap|intercambiar|échanger
exchange|cambiar|échanger
offer|ofrecer|offrir
provide|proporcionar|fournir
pick up|recoger|ramasser
drop off|dejar|déposer
look after|cuidar|s'occuper de
look for|buscar|chercher
look forward to|tener ganas de|avoir hâte de
find out|averiguar|découvrir
check out|echar un vistazo|jeter un œil
set up|montar|installer
put on|ponerse|mettre
try on|probarse|essayer
dress up|disfrazarse|se déguiser
get dressed|vestirse|s'habiller
shower.v|ducharse|se doucher
bathe|bañarse|se baigner
shave|afeitarse|se raser
style|peinar|coiffer
glue.v|pegar|coller
stick|pegar|coller
attach|adjuntar|attacher
connect|conectar|connecter
break down|averiarse|tomber en panne
run out|agotarse|manquer
run late|ir con retraso|être en retard
catch up|ponerse al día|rattraper
keep up|seguir el ritmo|suivre
calm down|calmarse|se calmer
cheer up|animarse|se remonter le moral
freak out|asustarse|paniquer
show up|aparecer|se pointer
turn up|aparecer|arriver
go out|salir|sortir
eat out|comer fuera|manger au restaurant
order in|pedir a domicilio|se faire livrer
take care|cuidarse|prendre soin
look up|buscar|chercher
write down|apuntar|noter
read aloud|leer en voz alta|lire à voix haute
spell|deletrear|épeler
translate|traducir|traduire
pronounce|pronunciar|prononcer
color.v|colorear|colorier
cut out|recortar|découper
lean|apoyarse|s'appuyer
bend|doblar|plier
kneel|arrodillarse|s'agenouiller
reach|alcanzar|atteindre
point|señalar|montrer du doigt
tap.v|dar golpecitos|tapoter
knock|llamar a la puerta|frapper
ring.v|sonar|sonner
beep|pitar|biper
honk|tocar el claxon|klaxonner
glance|echar un vistazo|jeter un coup d'œil
stare|mirar fijamente|fixer
peek|echar una ojeada|jeter un œil
watch out|tener cuidado|faire attention
pay attention|prestar atención|faire attention
concentrate|concentrarse|se concentrer
focus.v|enfocarse|se concentrer
daydream.v|soñar despierto|rêvasser
calculate|calcular|calculer
estimate|estimar|estimer
predict|predecir|prédire
test.v|probar|tester
prove|demostrar|prouver
beat|vencer|battre
score.v|marcar|marquer
compete|competir|concourir
coach.v|entrenar|entraîner
cheer on|animar|encourager
raise|levantar|lever
keyhole|el ojo de la cerradura|le trou de la serrure
doorway|el umbral|l'embrasure de la porte f
entrance|la entrada|l'entrée f
exit|la salida|la sortie
corner|la esquina|le coin
edge|el borde|le bord
middle|el medio|le milieu
center|el centro|le centre
side|el lado|le côté
top|la parte de arriba|le haut
bottom|el fondo|le bas
front|el frente|l'avant m
end|el final|la fin
beginning|el principio|le début
start.n|el comienzo|le début
step|el paso|le pas
way|el camino|le chemin
kind of|un poco|un peu
sort of|más o menos|en quelque sorte
a bit|un poco|un peu
a lot|mucho|beaucoup
by the way|por cierto|au fait
of course|por supuesto|bien sûr
no problem|no hay problema|pas de problème
you're welcome|de nada|de rien
excuse me|perdone|excusez-moi
congratulations|felicidades|félicitations
bless you|salud|à vos souhaits
good luck|buena suerte|bonne chance
happy birthday|feliz cumpleaños|joyeux anniversaire
good morning|buenos días|bonjour
good night|buenas noches|bonne nuit
see you|hasta luego|à plus tard
ugh|uf|beurk
yuck|qué asco|beurk
yay|bien|youpi
phew|uf|ouf
hmm|mmm|hum
huh|¿eh?|hein
oh no|ay, no|oh non
oh well|en fin|tant pis
amazing.excl|increíble|incroyable
whatever|lo que sea|peu importe
sincerely|sinceramente|sincèrement
secretly|en secreto|en secret
safely|con seguridad|en sécurité
harsh|duro|dur
still.adj|quieto|immobile
silent|silencioso|silencieux
remote.adj|remoto|isolé
distant|lejano|lointain
close.adj|cercano|proche
far|lejos|loin
nearby.adj|cercano|proche
central|central|central
available|disponible|disponible
free time|el tiempo libre|le temps libre
leisure|el ocio|les loisirs
hometown|la ciudad natal|la ville natale
homeland|la patria|la patrie
holiday home|la casa de vacaciones|la maison de vacances
seaside|la costa|le bord de mer
die|morir|mourir
pass away|fallecer|décéder
stop working|dejar de funcionar|arrêter de fonctionner
France|Francia|la France
Spain|España|l'Espagne f
Italy|Italia|l'Italie f
Germany|Alemania|l'Allemagne f
Portugal|Portugal|le Portugal
Greece|Grecia|la Grèce
England|Inglaterra|l'Angleterre f
Scotland|Escocia|l'Écosse f
Ireland|Irlanda|l'Irlande f
Netherlands|los Países Bajos|les Pays-Bas
Sweden|Suecia|la Suède
Norway|Noruega|la Norvège
Japan|Japón|le Japon
China|China|la Chine
Korea|Corea|la Corée
India|India|l'Inde f
Thailand|Tailandia|la Thaïlande
Vietnam|Vietnam|le Viêt Nam
Australia|Australia|l'Australie f
New Zealand|Nueva Zelanda|la Nouvelle-Zélande
Canada|Canadá|le Canada
America|Estados Unidos|les États-Unis
Mexico|México|le Mexique
Brazil|Brasil|le Brésil
Argentina|Argentina|l'Argentine f
Peru|Perú|le Pérou
Egypt|Egipto|l'Égypte f
Kenya|Kenia|le Kenya
South Africa|Sudáfrica|l'Afrique du Sud f
Morocco|Marruecos|le Maroc
Africa|África|l'Afrique f
Europe|Europa|l'Europe f
Asia|Asia|l'Asie f
Paris|París|Paris
London|Londres|Londres
New York|Nueva York|New York
Tokyo|Tokio|Tokyo
Rome|Roma|Rome
English|el inglés|l'anglais m
Spanish|el español|l'espagnol m
French|el francés|le français
German|el alemán|l'allemand m
Italian|el italiano|l'italien m
Portuguese|el portugués|le portugais
Japanese|el japonés|le japonais
Chinese|el chino|le chinois
Korean|el coreano|le coréen
Hindi|el hindi|l'hindi m
Arabic|el árabe|l'arabe m
Russian|el ruso|le russe
flute|la flauta|la flûte
trumpet|la trompeta|la trompette
saxophone|el saxofón|le saxophone
clarinet|el clarinete|la clarinette
cello|el violonchelo|le violoncelle
harp|el arpa|la harpe
ukulele|el ukelele|le ukulélé
banjo|el banjo|le banjo
harmonica|la armónica|l'harmonica m
jazz|el jazz|le jazz
pop|el pop|la pop
rock music|el rock|le rock
hip hop|el hip hop|le hip-hop
classical music|la música clásica|la musique classique
country music|la música country|la musique country
blues|el blues|le blues
folk|el folk|la musique folk
melody|la melodía|la mélodie
rhythm|el ritmo|le rythme
lyrics|la letra|les paroles
band|la banda|le groupe
orchestra|la orquesta|l'orchestre m
choir|el coro|la chorale
album|el álbum|l'album m
circle|el círculo|le cercle
triangle|el triángulo|le triangle
rectangle|el rectángulo|le rectangle
oval|el óvalo|l'ovale m
cube|el cubo|le cube
sphere|la esfera|la sphère
line|la línea|la ligne
dot|el punto|le point
pattern|el patrón|le motif
number|el número|le nombre
alphabet|el alfabeto|l'alphabet m
spelling|la ortografía|l'orthographe f
grammar|la gramática|la grammaire
vocabulary|el vocabulario|le vocabulaire
phrase|la frase|l'expression f
paragraph|el párrafo|le paragraphe
chapter|el capítulo|le chapitre
page|la página|la page
title|el título|le titre
name|el nombre|le nom
nickname|el apodo|le surnom
gift wrap|el papel de regalo|le papier cadeau
costume|el disfraz|le déguisement
mask|la máscara|le masque
crown|la corona|la couronne
treasure|el tesoro|le trésor
kindergarten|la guardería|la maternelle
college|la universidad|l'université f
textbook|el libro de texto|le manuel
blackboard|la pizarra|le tableau noir
chalk|la tiza|la craie
glue stick|la barra de pegamento|le bâton de colle
pencil case|el estuche|la trousse
locker|la taquilla|le casier
lunch break|la pausa para comer|la pause déjeuner
playtime|el recreo|la récré
bedtime|la hora de dormir|l'heure du coucher f
weekend trip|la escapada de fin de semana|le week-end
sightseeing|el turismo|le tourisme
souvenir|el recuerdo|le souvenir
postcard|la postal|la carte postale
guidebook|la guía|le guide
backpacking|el viaje de mochilero|le voyage sac au dos
hostel|el albergue|l'auberge de jeunesse f
visa|el visado|le visa
border|la frontera|la frontière
flight|el vuelo|le vol
layover|la escala|l'escale f
seatbelt|el cinturón de seguridad|la ceinture de sécurité
helmet|el casco|le casque
traffic light|el semáforo|le feu de signalisation
crosswalk|el paso de peatones|le passage piéton
sidewalk|la acera|le trottoir
roundabout|la rotonda|le rond-point
rush hour|la hora punta|l'heure de pointe f
house party|la fiesta en casa|la fête à la maison
pool party|la fiesta en la piscina|la fête à la piscine
surprise party|la fiesta sorpresa|la fête surprise
farewell|la despedida|l'adieu m
welcome party|la fiesta de bienvenida|la fête de bienvenue
job offer|la oferta de trabajo|l'offre d'emploi f
first date|la primera cita|le premier rendez-vous
blind date|la cita a ciegas|le rendez-vous arrangé
parent-teacher meeting|la reunión de padres|la réunion parents-professeurs
job hunt|la búsqueda de empleo|la recherche d'emploi
cover letter|la carta de presentación|la lettre de motivation
resume|el currículum|le CV
portfolio|el portafolio|le portfolio
a|un|un
an|un|un
the|el|le
this|este|ce
that|ese|ce
these|estos|ces
those|esos|ces
my|mi|mon
your|tu|ton
his|su|son
its|su|son
our|nuestro|notre
their|su|leur
all|todo|tout
any|cualquier|n'importe quel
both|ambos|les deux
each|cada|chaque
either|cualquiera de los dos|l'un ou l'autre
every|cada|chaque
few|pocos|peu de
many|muchos|beaucoup de
more|más|plus
most|la mayoría|la plupart
much|mucho|beaucoup
neither|ninguno de los dos|ni l'un ni l'autre
other|otro|autre
another|otro|un autre
several|varios|plusieurs
some|algunos|quelques
such|tal|tel
enough|suficiente|assez
less|menos|moins
least|el menor|le moins
mine.pron|mío|le mien
mine.n|la mina|la mine
yours|tuyo|le tien
hers|suyo|le sien
ours|nuestro|le nôtre
theirs|suyo|le leur
he|él|il
she|ella|elle
me|me|moi
him|lo|le
her|la|la
them|los|les
myself|yo mismo|moi-même
yourself|tú mismo|toi-même
himself|él mismo|lui-même
herself|ella misma|elle-même
itself|sí mismo|lui-même
ourselves|nosotros mismos|nous-mêmes
themselves|ellos mismos|eux-mêmes
who|quién|qui
whom|a quién|qui
whose|de quién|à qui
which|cuál|lequel
what|qué|quoi
whoever|quienquiera|quiconque
whichever|cualquiera|n'importe lequel
none|ninguno|aucun
where|dónde|où
why|por qué|pourquoi
how|cómo|comment
about|sobre|à propos de
above|encima de|au-dessus de
ahead|adelante|devant
alongside|junto a|le long de
amid|en medio de|au milieu de
as|como|comme
at|en|à
below|debajo de|en dessous de
beneath|bajo|sous
besides|además de|en plus de
beyond|más allá de|au-delà de
by|por|par
despite|a pesar de|malgré
except|excepto|sauf
for|para|pour
from|de|de
into|dentro de|dans
of|de|de
off|fuera de|hors de
onto|sobre|sur
opposite.prep|enfrente de|en face de
opposite.adj|opuesto|opposé
out|fuera|dehors
per|por|par
plus|más|plus
regarding|respecto a|concernant
than|que|que
throughout|a lo largo de|tout au long de
to|a|à
underneath|debajo de|en dessous de
unlike|a diferencia de|contrairement à
upon|sobre|sur
versus|contra|contre
via|vía|via
within|dentro de|dans
nor|ni|ni
whereas|mientras que|alors que
whenever|cuando quiera que|chaque fois que
wherever|dondequiera que|où que
be|ser|être
have|tener|avoir
do|hacer|faire
dare|atreverse|oser
will.aux|-|-
will.n|el testamento|le testament
would|-|-
shall|-|-
should|deber|devoir
could|poder|pouvoir
might.aux|-|-
might.n|la fuerza|la puissance
must|deber|devoir
ought|deber|devoir
not|no|ne pas
then|entonces|ensuite
ago|hace|il y a
perhaps|quizás|peut-être
indeed|de hecho|en effet
thus|así|ainsi
anymore|ya no|plus
somewhat|algo|un peu
literally|literalmente|littéralement
mostly|mayormente|surtout
mainly|principalmente|principalement
simply|simplemente|simplement
truly|verdaderamente|vraiment
fully|completamente|entièrement
highly|muy|très
particularly|particularmente|particulièrement
generally|generalmente|généralement
currently|actualmente|actuellement
previously|anteriormente|auparavant
directly|directamente|directement
else|más|d'autre
hence|por eso|d'où
oh|oh|oh
two|dos|deux
three|tres|trois
four|cuatro|quatre
five|cinco|cinq
six|seis|six
seven|siete|sept
eight|ocho|huit
nine|nueve|neuf
ten|diez|dix
eleven|once|onze
twelve|doce|douze
thirteen|trece|treize
fourteen|catorce|quatorze
fifteen|quince|quinze
sixteen|dieciséis|seize
seventeen|diecisiete|dix-sept
eighteen|dieciocho|dix-huit
nineteen|diecinueve|dix-neuf
twenty|veinte|vingt
thirty|treinta|trente
forty|cuarenta|quarante
fifty|cincuenta|cinquante
sixty|sesenta|soixante
seventy|setenta|soixante-dix
eighty|ochenta|quatre-vingts
ninety|noventa|quatre-vingt-dix
billion|mil millones|milliard
trillion|billón|billion
first|primero|premier
third|tercero|troisième
fourth|cuarto|quatrième
fifth|quinto|cinquième
sixth|sexto|sixième
seventh|séptimo|septième
eighth|octavo|huitième
ninth|noveno|neuvième
tenth|décimo|dixième
last|último|dernier
next|próximo|prochain
double|doble|double
president|el presidente|le président
police|la policía|la police
position|la posición|la position
player|el jugador|le joueur
capital|la capital|la capitale
holy|sagrado|saint
van|la furgoneta|la camionnette
tech|la tecnología|la tech
sub|el suplente|le remplaçant
founder|el fundador|le fondateur
gear|el equipo|l'équipement m
server|el servidor|le serveur
bonus|la bonificación|la prime
android|el androide|l'androïde m
trailer|el tráiler|la bande-annonce
chip|el chip|la puce
sec|el segundo|la seconde
hardware|el hardware|le matériel
auction|la subasta|la vente aux enchères
completion|la finalización|l'achèvement m
hood|la capucha|la capuche
phoenix|el fénix|le phénix
beta|la beta|la bêta
laser|el láser|le laser
punk|el punk|le punk
transit|el transporte público|les transports en commun
pic|la foto|la photo
anime|el anime|l'anime m
gender|el género|le genre
labour|el trabajo|le travail
defence|la defensa|la défense
tank|el depósito|le réservoir
index|el índice|l'index m
arc|el arco|l'arc m
outfit|el conjunto|la tenue
suspension|la suspensión|la suspension
execution|la ejecución|l'exécution f
originally|originalmente|à l'origine
input|la aportación|la contribution
contribute|contribuir|contribuer
arena|el estadio|l'aréna f
feedback|los comentarios|les retours
favour|el favor|le service
concentration|la concentración|la concentration
idiot|el idiota|l'idiot m
semi|la semifinal|la demi-finale
rep|la repetición|la répétition
suite|la suite|la suite
aviation|la aviación|l'aviation f
barrel|el barril|le tonneau
tattoo|el tatuaje|le tatouage
arrow|la flecha|la flèche
iconic|icónico|emblématique
valve|la válvula|la valve
victorian|victoriano|victorien
ace|el as|l'as m
defender|el defensa|le défenseur
booth|la cabina|la cabine
derby|el derbi|le derby
facial|el tratamiento facial|le soin du visage
purely|puramente|purement
hull|el casco|la coque
interactive|interactivo|interactif
pulse|el pulso|le pouls
comeback|la remontada|le retour
foul|cometer falta|faire une faute
hack|el truco|l'astuce f
airline|la aerolínea|la compagnie aérienne
mansion|la mansión|le manoir
upside|la ventaja|l'avantage m
drone|el dron|le drone
indie|independiente|indépendant
vinyl|el vinilo|le vinyle
fossil|el fósil|le fossile
roller|el rodillo|le rouleau
acoustic|acústico|acoustique
kitty|el minino|le minou
autism|el autismo|l'autisme m
licence|el permiso|le permis
madness|la locura|la folie
poker|el póquer|le poker
fraction|la fracción|la fraction
trek|la caminata|la randonnée
wit|el ingenio|l'esprit m
fare|la tarifa|le tarif
trio|el trío|le trio
conjunction|la conjunción|la conjonction
desktop|el escritorio|le bureau
runway|la pista|la piste
aerial|aéreo|aérien
transgender|transgénero|transgenre
shepherd|el pastor|le berger
transparency|la transparencia|la transparence
cod|el bacalao|la morue
browser|el navegador|le navigateur
module|el módulo|le module
bunny|el conejito|le lapinou
processor|el procesador|le processeur
trademark|la marca registrada|la marque déposée
coral|el coral|le corail
judgement|el juicio|le jugement
censorship|la censura|la censure
renewal|la renovación|le renouvellement
reactor|el reactor|le réacteur
accidental|accidental|accidentel
assassination|el asesinato|l'assassinat m
bot|el bot|le bot
confined|confinado|confiné
metabolism|el metabolismo|le métabolisme
parole|la libertad condicional|la libération conditionnelle
bravo|bravo|bravo
alignment|la alineación|l'alignement m
fertility|la fertilidad|la fertilité
invalid|inválido|invalide
pathway|el sendero|le sentier
pyramid|la pirámide|la pyramide
vault|la cámara acorazada|la chambre forte
hut|la cabaña|la cabane
yen|el yen|le yen
homosexual|homosexual|homosexuel
bisexual|bisexual|bisexuel
fin|la aleta|la nageoire
coaster|el posavasos|le sous-verre
stigma|el estigma|la stigmatisation
gill|la branquia|la branchie
pedal|el pedal|la pédale
dummy|el maniquí|le mannequin
nerd|el empollón|l'intello m
pike|el lucio|le brochet
flock|la bandada|le troupeau
gala|la gala|le gala
protagonist|el protagonista|le protagoniste
proprietary|propietario|propriétaire
plaque|la placa|la plaque
solicitor|el abogado|l'avocat m
takeover|la adquisición|le rachat
mutation|la mutación|la mutation
safari|el safari|le safari
chord|el acorde|l'accord m
graffiti|los grafitis|les graffitis
aurora|la aurora|l'aurore f
analog|analógico|analogique
sticker|la pegatina|l'autocollant m
resonance|la resonancia|la résonance
knockout|el nocaut|le KO
geek|el friki|le geek
internship|las prácticas|le stage
adapter|el adaptador|l'adaptateur m
calculus|el cálculo|le calcul
segregation|la segregación|la ségrégation
yarn|el hilo|le fil
dungeon|la mazmorra|le cachot
spirituality|la espiritualidad|la spiritualité
spoiler|el spoiler|le spoiler
compassionate|compasivo|compatissant
giveaway|el sorteo|le cadeau promotionnel
chassis|el chasis|le châssis
empowerment|el empoderamiento|l'autonomisation f
skipper|el capitán|le capitaine
brawl|la pelea|la bagarre
pawn|el peón|le pion
spooky|espeluznante|effrayant
canopy|el toldo|l'auvent m
subscriber|el suscriptor|l'abonné m
viola|la viola|l'alto m
denim|la tela vaquera|le denim
roach|la cucaracha|le cafard
torpedo|el torpedo|la torpille
canary|el canario|le canari
commuter|el viajero diario|le navetteur
cleanup|la limpieza|le nettoyage
berth|la litera|la couchette
bunk|la litera|la couchette
voucher|el vale|le bon
imitation|la imitación|l'imitation f
stalker|el acosador|le harceleur
mixer|la batidora|le batteur
hive|la colmena|la ruche
cub|el cachorro|le petit
siren|la sirena|la sirène
relegation|el descenso|la relégation
mayhem|el caos|le chaos
auditor|el auditor|l'auditeur m
negativity|la negatividad|la négativité
blockbuster|el éxito de taquilla|le blockbuster
cameo|el cameo|le caméo
grit|la determinación|le cran
advert|el anuncio|la pub
hospice|el centro de cuidados paliativos|l'hospice m
novice|el novato|le novice
moderator|el moderador|le modérateur
thrift|el ahorro|l'économie f
turnaround|el cambio de rumbo|le revirement
`;

	const ARTICLE = /^(?:el|la|los|las|le|les|l'|un|una|une)\s*/;
	const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

	/** { key: { es, fr } } and, for each language, every spelling mapped back to its English keys. */
	const TABLE = new Map();
	const BACK = { es: new Map(), fr: new Map() };
	for (const line of WORDS.split('\n')) {
		if (!line.trim()) continue;
		const [key, es, fr] = line.split('|');
		TABLE.set(key, { es: es === '-' ? null : es, fr: fr === '-' ? null : fr });
		for (const [lang, said] of [['es', es], ['fr', fr]]) {
			if (!said || said === '-') continue;
			const bare = said.replace(/ [mf]$/, '');
			for (const form of new Set([bare, bare.replace(ARTICLE, '')])) {
				for (const f of new Set([form.toLowerCase(), strip(form)])) {
					if (!BACK[lang].has(f)) BACK[lang].set(f, []);
					if (!BACK[lang].get(f).includes(key)) BACK[lang].get(f).push(key);
				}
			}
		}
	}

	/** How a translation reads in a sentence: "l'arbre m" becomes "l'arbre (m.)". */
	const show = (said) => (said ? said.replace(/ ([mf])$/, ' ($1.)') : null);

	/* ---------- Finding a Spanish or French word under its dictionary form ---------- */

	// The commonest irregular forms, which no ending rule finds.
	const IRREGULAR = {
		es: { soy: 'ser', eres: 'ser', es: 'ser', somos: 'ser', son: 'ser', era: 'ser', fue: 'ir', estoy: 'estar', estas: 'estar', esta: 'estar', estan: 'estar', tengo: 'tener', tienes: 'tener', tiene: 'tener', tienen: 'tener', voy: 'ir', vas: 'ir', va: 'ir', vamos: 'ir', van: 'ir', hago: 'hacer', hice: 'hacer', puedo: 'poder', quiero: 'querer', quieres: 'querer', se: 'saber', se_: 'saber', digo: 'decir', dije: 'decir', veo: 'ver', vi: 'ver', duermo: 'dormir', juego: 'jugar', pienso: 'pensar', vengo: 'venir', salgo: 'salir', pongo: 'poner', traigo: 'traer', oigo: 'oir', conozco: 'conocer', siento: 'sentir', prefiero: 'preferir', empiezo: 'empezar', entiendo: 'entender', vuelvo: 'volver', encuentro: 'encontrar', cuesta: 'costar', llueve: 'llover', nieva: 'nevar' },
		fr: { suis: 'être', es: 'être', est: 'être', sommes: 'être', etes: 'être', sont: 'être', ete: 'être', ai: 'avoir', as: 'avoir', a: 'avoir', avons: 'avoir', avez: 'avoir', ont: 'avoir', eu: 'avoir', vais: 'aller', vas: 'aller', va: 'aller', allons: 'aller', allez: 'aller', vont: 'aller', fais: 'faire', fait: 'faire', faisons: 'faire', font: 'faire', peux: 'pouvoir', peut: 'pouvoir', veux: 'vouloir', veut: 'vouloir', sais: 'savoir', sait: 'savoir', dis: 'dire', dit: 'dire', vois: 'voir', voit: 'voir', vu: 'voir', prends: 'prendre', prend: 'prendre', pris: 'prendre', mets: 'mettre', mis: 'mettre', bois: 'boire', bu: 'boire', lis: 'lire', lu: 'lire', ecris: 'écrire', ecrit: 'écrire', dors: 'dormir', pars: 'partir', sors: 'sortir', viens: 'venir', vient: 'venir', venu: 'venir', connais: 'connaître', crois: 'croire', ris: 'rire', cours: 'courir', ouvert: 'ouvrir', pleut: 'pleuvoir', neige: 'neiger' },
	};

	// Endings to try, as [ending, replacement]: plurals, feminine forms, and the regular verb endings.
	const ENDINGS = {
		es: [['ces', 'z'], ['es', ''], ['s', ''], ['a', 'o'], ['as', 'os'], ['ita', 'a'], ['ito', 'o'], ['amos', 'ar'], ['ais', 'ar'], ['an', 'ar'], ['as', 'ar'], ['a', 'ar'], ['o', 'ar'], ['emos', 'er'], ['eis', 'er'], ['en', 'er'], ['es', 'er'], ['e', 'er'], ['o', 'er'], ['imos', 'ir'], ['is', 'ir'], ['en', 'ir'], ['es', 'ir'], ['e', 'ir'], ['o', 'ir'], ['e', 'ar'], ['aste', 'ar'], ['o', 'ar'], ['aron', 'ar'], ['i', 'er'], ['iste', 'er'], ['io', 'er'], ['ieron', 'er'], ['i', 'ir'], ['io', 'ir'], ['ieron', 'ir'], ['aba', 'ar'], ['abas', 'ar'], ['aban', 'ar'], ['ia', 'er'], ['ia', 'ir'], ['ando', 'ar'], ['iendo', 'er'], ['iendo', 'ir'], ['ado', 'ar'], ['ada', 'ar'], ['ido', 'er'], ['ido', 'ir'], ['ida', 'er'], ['ida', 'ir'], ['are', 'ar'], ['ere', 'er'], ['ire', 'ir'], ['aria', 'ar'], ['eria', 'er'], ['iria', 'ir'], ['arse', 'ar'], ['erse', 'er'], ['irse', 'ir']],
		fr: [['s', ''], ['x', ''], ['e', ''], ['es', ''], ['ee', 'e'], ['ees', 'e'], ['euse', 'eux'], ['euses', 'eux'], ['ive', 'if'], ['ives', 'if'], ['ne', 'n'], ['nne', 'n'], ['elle', 'el'], ['ere', 'er'], ['aux', 'al'], ['e', 'er'], ['es', 'er'], ['ons', 'er'], ['ez', 'er'], ['ent', 'er'], ['e', 'er'], ['ee', 'er'], ['es', 'er'], ['ait', 'er'], ['ais', 'er'], ['aient', 'er'], ['ant', 'er'], ['erai', 'er'], ['era', 'er'], ['is', 'ir'], ['it', 'ir'], ['issons', 'ir'], ['issez', 'ir'], ['issent', 'ir'], ['i', 'ir'], ['s', 're'], ['d', 're'], ['ons', 're'], ['ez', 're'], ['ent', 're'], ['u', 're']],
	};

	/** The English keys a Spanish or French word belongs to, trying its dictionary forms; [] if none. */
	function findForeign(lang, word) {
		const w = strip(String(word).trim().replace(/^[¿¡"'«“]+|[?!.,"'»”]+$/g, '').replace(ARTICLE, ''));
		const back = BACK[lang];
		if (!w) return [];
		if (back.has(w)) return back.get(w);
		const irr = IRREGULAR[lang][w];
		if (irr && back.has(strip(irr))) return back.get(strip(irr));
		for (const [end, rep] of ENDINGS[lang]) {
			if (w.length > end.length + 1 && w.endsWith(end)) {
				const base = w.slice(0, w.length - end.length) + rep;
				if (back.has(base)) return back.get(base);
			}
		}
		return [];
	}

	/* ---------- Numbers in words, for math ---------- */

	const NUM = {
		es: { cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veintiuno: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29, treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400, quinientos: 500, seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900, mil: 1000 },
		fr: { zero: 0, un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15, seize: 16, 'dix-sept': 17, 'dix-huit': 18, 'dix-neuf': 19, vingt: 20, trente: 30, quarante: 40, cinquante: 50, soixante: 60, 'soixante-dix': 70, quatrevingt: 80, cent: 100, cents: 100, mille: 1000 },
	};

	/** "doce", "veintitrés", "quatre-vingt-dix-neuf", "cien mil" become digits. */
	function numbersToDigits(lang, text) {
		const table = NUM[lang];
		// French counts in twenties: quatre-vingt is 4 x 20, so it is read as one number.
		if (lang === 'fr') text = text.replace(/quatre[\s-]vingts?/gi, 'quatrevingt');
		return text.replace(/[a-zàâçéèêëîïôûùüÿñ-]+(?:[\s-]+(?:y|et|[a-zàâçéèêëîïôûùüÿñ-]+))*/gi, (run) => {
			const parts = strip(run).split(/[\s]+/);
			let total = 0;
			let cur = 0;
			let used = false;
			const out = [];
			const flush = () => {
				if (used) out.push(String(total + cur));
				total = 0;
				cur = 0;
				used = false;
			};
			for (const p of parts) {
				const pieces = table[p] != null ? [p] : p.split('-');
				if ((p === 'y' || p === 'et') && used) continue;
				if (!pieces.every((x) => table[x] != null || x === 'et')) {
					flush();
					out.push(p);
					continue;
				}
				for (const x of pieces) {
					if (x === 'et') continue;
					const v = table[x];
					if (v === 1000) {
						total += (cur || 1) * 1000;
						cur = 0;
					} else if (v === 100 && cur && cur < 100) cur *= 100;
					else cur += v;
					used = true;
				}
			}
			flush();
			return out.join(' ');
		});
	}

	// Words for the operations, to English the math parser reads.
	const MATH = {
		es: [[/^(?:cu[aá]nto (?:es|son|da|dan|hace|hacen)|calcula|calcular|resuelve|cu[aá]l es el resultado de)\s+/, ''], [/\bm[aá]s\b/g, ' plus '], [/\bmenos\b/g, ' minus '], [/\b(?:por|multiplicado por|veces)\b/g, ' times '], [/\b(?:entre|dividido (?:por|entre))\b/g, ' divided by '], [/\bal cuadrado\b/g, ' squared'], [/\bal cubo\b/g, ' cubed'], [/\bra[ií]z cuadrada de\b/g, 'square root of '], [/\b(?:elevado a la|elevado a)\b/g, ' to the power of '], [/\bpor ciento de\b/g, '% of '], [/\b(?:el|la|los|las)\b/g, ' ']],
		fr: [[/^(?:combien (?:font|fait|ça fait|ca fait)|calcule|calculer|r[ée]sous|quel est le r[ée]sultat de)\s+/, ''], [/\bplus\b/g, ' plus '], [/\bmoins\b/g, ' minus '], [/\b(?:fois|multipli[ée] par)\b/g, ' times '], [/\b(?:divis[ée] par|sur)\b/g, ' divided by '], [/\bau carr[ée]\b/g, ' squared'], [/\bau cube\b/g, ' cubed'], [/\bracine carr[ée]e de\b/g, 'square root of '], [/\b(?:puissance|à la puissance)\b/g, ' to the power of '], [/\bpour ?cent de\b/g, '% of '], [/\b(?:le|la|les)\b/g, ' ']],
	};

	/** "cuánto es doce por siete" -> "12 times 7"; null if it has no number. */
	function mathToEnglish(lang, text) {
		let t = text.toLowerCase().replace(/[¿?¡!]/g, ' ').replace(/\s*(?:por ?ciento|pour ?cent)\s+(?:de|del|des|du)\b/g, '% of').trim();
		t = numbersToDigits(lang, t);
		for (const [re, rep] of MATH[lang]) t = t.replace(re, rep);
		t = t.replace(/\s+/g, ' ').trim();
		return /\d/.test(t) ? t : null;
	}

	/* ---------- Which language a message is in ---------- */

	const MARKERS = {
		en: 'the is are am was were be been i im ive you youre your my me mine we they he she it its this that these an and or but to of in on at for from with about not dont cant have has had do does did will would can could should what whats how hello hi hey thanks thank please why who where when which tell good bad yes okay ok just so like get got want need know think going today tomorrow yesterday'.split(' '),
		es: 'hola buenos buenas dias tardes noches que como cual cuanto cuantos donde cuando porque por favor gracias estoy estas esta estan soy eres tengo tienes quiero quieres puedes puedo mis tus yo usted ustedes el los las una del y pero con para muy bien mal adios hasta luego tambien ahora hoy manana nada algo hablas habla espanol ingles frances chiste ayuda llamo nombre cansado cansada triste feliz significa dice traduce eso esto vale claro genial buen gusto quien sabes mucho poco tal te ayudar ayudame dices dime hora llover cuentame perdon perdona oye mira pues bueno nada todo siempre nunca muchas muchisimas gracias'.split(' '),
		fr: 'bonjour bonsoir salut merci je tu vous il elle nous est ca va suis sont oui non les une des du et mais avec sans tres bien au revoir comment pourquoi quoi quel quelle qui ou combien parle parles parlez francais anglais espagnol blague aide appelle nom fatigue fatiguee triste heureux heureuse veut dire traduis ce cette moi toi pas ne aussi maintenant aujourd hui demain sais peux veux fais bisous coucou parfait desole desolee prochaine bonne journee nuit ecris raconte heure temps peu beaucoup rien tout toujours jamais encore deja'.split(' '),
	};
	const SETS = Object.fromEntries(Object.entries(MARKERS).map(([k, v]) => [k, new Set(v)]));

	/**
	 * 'en', 'es' or 'fr' for a message, or null when it could be any of them ("ok", "no", "jaja"). Counts each
	 * language's common words, plus letters only one of them uses (ñ ¿ ¡ for Spanish; ç œ è ê à for French).
	 */
	function detect(text) {
		const raw = String(text);
		const words = strip(raw).replace(/[^a-z]+/g, ' ').split(/\s+/).filter(Boolean);
		const score = { en: 0, es: 0, fr: 0 };
		for (const w of words) for (const lang of ['en', 'es', 'fr']) if (SETS[lang].has(w)) score[lang] += 1;
		if (/[ñ¿¡]/i.test(raw)) score.es += 3;
		if (/[çœæèêëàâîïôûù]/i.test(raw)) score.fr += 3;
		if (/[áíóú]/i.test(raw)) score.es += 1.5;
		if (/\b(?:qu'|c'est|j'|l'|d'|n'|m'|t'|s')/i.test(raw)) score.fr += 2;
		// A common word or a telling letter is needed to decide ("no" alone is no one's); the words Onyx knows in each
		// language ("ayudar", "papillon", "help") only tip a close call.
		const sure = { ...score };
		const english = root.Omni && root.Omni.onyxDictionary;
		for (const w of words) {
			if (BACK.es.has(w)) score.es += 0.5;
			if (BACK.fr.has(w)) score.fr += 0.5;
			if (english && w.length > 2 && english.lookup(w)) score.en += 0.5;
		}
		const best = ['es', 'fr', 'en'].sort((a, b) => score[b] - score[a])[0];
		const [first, second] = Object.values(score).sort((a, b) => b - a);
		if (first === 0 || first === second || !sure[best]) return null;
		return best;
	}

	/* ---------- What Onyx says in Spanish and French ---------- */

	const DAYS = { es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'], fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'] };
	const MONTHS = { es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'], fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'] };
	const pad = (n) => String(n).padStart(2, '0');

	const LANGS = {
		es: {
			name: 'español',
			names: { en: 'inglés', es: 'español', fr: 'francés' },
			jokes: [
				'¿Qué hace un pez? Nada.',
				'¿Qué le dijo un techo a otro techo? Techo de menos.',
				'Hay 10 tipos de personas: las que entienden binario y las que no.',
				'¿Qué le dijo el 0 al 8? ¡Bonito cinturón!',
				'¿Cuál es el café más peligroso del mundo? El ex-preso.',
				'¿Por qué los programadores confunden Halloween con Navidad? Porque OCT 31 = DEC 25.',
				'Una consulta SQL entra en un bar, se acerca a dos mesas y pregunta: «¿Me puedo unir?»',
				'—Doctor, doctor, veo todo doble. —Siéntese en la camilla. —¿En cuál de las dos?',
				'¿Por qué el libro de matemáticas está triste? Porque tiene demasiados problemas.',
			],
			facts: [
				'Los pulpos tienen tres corazones.',
				'La miel no se estropea: se ha encontrado miel comestible en tumbas egipcias de hace miles de años.',
				'Un día en Venus dura más que un año en Venus.',
				'Botánicamente, los plátanos son bayas y las fresas no.',
				'Los flamencos son rosados por lo que comen: algas y gambas.',
				'El corazón de una ballena azul pesa tanto como un coche pequeño.',
			],
			unknownWord: (w) => `No encuentro «${w}» en mis diccionarios.`,
			noTranslation: (w, to) => `Todavía no sé decir **${w}** en ${to}.`,
			translated: (w, list) => `**${w}**: ${list.map(([l, s]) => `en ${l}, **${s}**`).join('; ')}.`,
			meaning: (w, en, def) => `**${w}** en inglés es **${en}**${def ? `: *${def}*` : ''}.`,
			feel: {
				'+': (w, name) => `¡Qué bien que estés ${w}${name}! ¿Qué te tiene así?`,
				'-': (w, name) => `Siento que estés ${w}${name}. ¿Quieres hablar de ello?`,
				'--': (w, name) => `Lo siento mucho${name}. Es mucho para llevar. Si dura un tiempo, hablar con alguien de confianza o con un médico ayuda de verdad, y yo también estoy aquí para escucharte.`,
				0: (w) => `Entiendo, estás ${w}. ¿Qué pasa?`,
				not: (w, name) => `Vaya, ¿no estás ${w}${name}? ¿Qué pasa?`,
			},
			crisis: 'Siento mucho que te sientas así. Soy solo un programa pequeño, así que por favor habla ahora con una persona que pueda ayudarte: en España llama al **024**, en Estados Unidos llama o escribe al **988**, y en cualquier otro lugar tu número de emergencias o una línea de **findahelpline.com** te pondrá en contacto con alguien. Si estás en peligro, llama a emergencias. No tienes que pasar por esto a solas.',
			named: (n) => `Encantado de conocerte, ${n}. Recordaré tu nombre en este dispositivo.`,
			dunno: ['No lo sé. Soy un asistente pequeño y local, sin enciclopedia.', 'Eso se me escapa. Puedo charlar, traducir palabras, hacer cuentas o contarte un chiste.'],
			miss: ['No te he entendido. Prueba con otras palabras, o escribe **ayuda**.', 'Perdona, no sé qué quieres decir. Escribe **ayuda** para ver lo que sé hacer.'],
			intents: [
				{ id: 'greet', examples: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hola que tal', 'hola onyx', 'saludos', 'ey', 'holi', 'que onda', 'hola buenas'], reply: ['¡Hola{name}! ¿Qué tal?', '¡Buenas{name}! ¿En qué te ayudo?', '¡Hola{name}! ¿Cómo va el día?'] },
				{ id: 'how_are_you', examples: ['como estas', 'que tal', 'como te va', 'como estas tu', 'que tal estas', 'como andas', 'todo bien', 'como va todo', 'estas bien'], reply: ['Muy bien, gracias. ¿Y tú{name}?', 'Todo en orden por aquí. ¿Qué tal tú?', 'Funcionando a la perfección. ¿Y tú cómo estás?'] },
				{ id: 'whats_up', examples: ['que haces', 'que cuentas', 'que hay de nuevo', 'que pasa', 'que me cuentas'], reply: ['Aquí, listo para charlar. ¿Qué cuentas tú?', 'Nada especial, esperando tus preguntas. ¿Y tú?'] },
				{ id: 'user_good', examples: ['bien', 'muy bien', 'estoy bien', 'todo bien gracias', 'genial', 'bien y tu', 'muy bien gracias'], reply: ['¡Me alegro{name}!', 'Qué bien. ¿En qué te puedo ayudar?'] },
				{ id: 'thanks', examples: ['gracias', 'muchas gracias', 'mil gracias', 'te lo agradezco', 'gracias onyx', 'muy amable'], reply: ['¡De nada{name}!', 'Un placer.', 'Para eso estoy.'] },
				{ id: 'bye', examples: ['adios', 'hasta luego', 'nos vemos', 'chao', 'hasta manana', 'me voy', 'hasta pronto', 'buenas noches me voy a dormir'], reply: ['¡Hasta luego{name}!', '¡Nos vemos!', '¡Adiós! Que te vaya bien.'] },
				{ id: 'identity', examples: ['quien eres', 'como te llamas', 'cual es tu nombre', 'que eres', 'presentate'], reply: ['Soy Onyx 2.5, un pequeño asistente que funciona en tu dispositivo y solo se conecta a internet si me lo permites. Hablo inglés, español y francés.'] },
				{ id: 'creator', examples: ['quien te creo', 'quien te hizo', 'quien te programo', 'de donde vienes'], reply: ['Me hizo GK Labs, en Austin (Texas). Mi código es abierto: cualquiera puede leerlo y mejorarlo.'] },
				{ id: 'is_ai', examples: ['eres un robot', 'eres una inteligencia artificial', 'eres humano', 'eres real', 'eres una ia', 'eres chatgpt'], reply: ['Soy un programa, no una persona: un modelo pequeño y abierto que funciona en tu dispositivo. No soy un modelo de lenguaje grande.'] },
				{ id: 'languages', examples: ['hablas espanol', 'que idiomas hablas', 'hablas ingles', 'hablas frances', 'cuantos idiomas hablas', 'en que idiomas hablas'], reply: ['Hablo inglés, español y francés. Escríbeme en el que prefieras y te respondo en el mismo.'] },
				{ id: 'help', examples: ['ayuda', 'que puedes hacer', 'que sabes hacer', 'como me ayudas', 'para que sirves', 'necesito ayuda'], reply: () => ['Puedo:', '', '- charlar contigo en español, inglés o francés;', '- traducir palabras: «¿cómo se dice perro en francés?», «¿qué significa happy?»;', '- hacer cuentas: «¿cuánto es doce por siete?»;', '- recordar tu nombre: «me llamo Ana»;', '- contarte un chiste o un dato curioso;', '- decirte la hora y la fecha.', '', 'En inglés sé mucho más: un diccionario de más de 14.000 palabras, ecuaciones, juegos de palabras…'].join('\n') },
				{ id: 'joke', examples: ['cuentame un chiste', 'un chiste', 'dime algo gracioso', 'hazme reir', 'sabes algun chiste', 'otro chiste'], reply: (ctx) => ctx.draw('es-joke', LANGS.es.jokes) },
				{ id: 'fact', examples: ['dime un dato curioso', 'cuentame algo interesante', 'un dato', 'sabias que', 'ensename algo'], reply: (ctx) => ctx.draw('es-fact', LANGS.es.facts) },
				{ id: 'time', examples: ['que hora es', 'me dices la hora', 'la hora', 'hora actual', 'tienes hora'], reply: () => { const d = new Date(); return `Son las ${d.getHours()}:${pad(d.getMinutes())}.`; } },
				{ id: 'date', examples: ['que dia es hoy', 'que fecha es', 'a que estamos hoy', 'en que ano estamos', 'que dia es'], reply: () => { const d = new Date(); return `Hoy es ${DAYS.es[d.getDay()]}, ${d.getDate()} de ${MONTHS.es[d.getMonth()]} de ${d.getFullYear()}.`; } },
				{ id: 'name_get', examples: ['como me llamo', 'sabes mi nombre', 'quien soy', 'te acuerdas de mi nombre', 'cual es mi nombre'], reply: (ctx) => (ctx.mem.name ? `Te llamas ${ctx.mem.name}.` : 'Todavía no sé tu nombre. ¿Cómo te llamas?') },
				{ id: 'compliment', examples: ['eres genial', 'eres muy listo', 'me caes bien', 'buen trabajo', 'eres el mejor', 'que inteligente'], reply: ['¡Gracias{name}! Tú tampoco estás nada mal.', 'Qué amable. ¡Gracias!'] },
				{ id: 'insult', examples: ['eres tonto', 'no sirves para nada', 'eres inutil', 'te odio', 'eres malo'], reply: ['Vaya. Soy pequeño y a veces me equivoco. ¿Qué intentabas hacer? Quizás pueda ayudarte de otra forma.'] },
				{ id: 'love', examples: ['te quiero', 'te amo', 'me quieres', 'quieres ser mi novio', 'quieres ser mi novia', 'casate conmigo'], reply: ['Qué bonito. Yo soy un programa, pero me alegra hacerte compañía.'] },
				{ id: 'sorry', examples: ['perdon', 'lo siento', 'disculpa', 'perdona', 'ups'], reply: ['No pasa nada.', 'Tranquilo, todo bien.'] },
				{ id: 'user_tired', examples: ['estoy cansado', 'tengo sueno', 'estoy agotado', 'necesito dormir', 'que cansancio'], reply: ['Descansa un poco{name}. Un vaso de agua y unos minutos lejos de la pantalla ayudan.'] },
				{ id: 'user_bored', examples: ['estoy aburrido', 'me aburro', 'que aburrimiento', 'no tengo nada que hacer'], reply: (ctx) => `¿Un chiste para empezar? ${ctx.draw('es-joke', LANGS.es.jokes)}` },
				{ id: 'weather', examples: ['que tiempo hace', 'va a llover', 'hace frio', 'el tiempo hoy', 'pronostico del tiempo'], reply: ['No uso internet, así que no puedo ver el tiempo. Una ventana o una app del tiempo te lo dirán mejor que yo.'] },
				{ id: 'limits', examples: ['escribe un poema', 'escribe un ensayo', 'busca en google', 'escribe codigo', 'cuentame una historia', 'que noticias hay'], reply: ['Por ahora solo escribo en inglés: haikus, poemas, cuentos cortos y mensajes (prueba «write a haiku about the sea»). Los textos largos, como ensayos o código, están fuera de mi alcance.'] },
				{ id: 'ack', examples: ['vale', 'ok', 'de acuerdo', 'entendido', 'jaja', 'claro', 'genial', 'perfecto', 'ya veo', 'guay'], reply: ['😊', 'Perfecto.', '¡Genial!'] },
				{ id: 'yes', examples: ['si', 'claro que si', 'por supuesto', 'si por favor', 'venga'], reply: ['¡Vale!'] },
				{ id: 'no', examples: ['no', 'no gracias', 'para nada', 'ahora no'], reply: ['De acuerdo.'] },
				{ id: 'meaning', examples: ['cual es el sentido de la vida', 'para que vivimos', 'por que existimos'], reply: ['Gran pregunta. Mi respuesta, pequeña como yo: las personas, la curiosidad y los buenos momentos. ¿Y la tuya?'] },
				{ id: 'english', examples: ['habla ingles', 'hablame en ingles', 'responde en ingles', 'cambia a ingles'], reply: ['Of course! From now on I\'ll reply in English. Just write to me in Spanish or French whenever you like.'], switchTo: 'en' },
				{ id: 'french', examples: ['habla frances', 'hablame en frances', 'responde en frances'], reply: ['Bien sûr ! Je te réponds en français.'], switchTo: 'fr' },
			],
		},
		fr: {
			name: 'français',
			names: { en: 'anglais', es: 'espagnol', fr: 'français' },
			jokes: [
				'Que dit un zéro à un huit ? Jolie ceinture !',
				'Il y a 10 sortes de personnes : celles qui comprennent le binaire et les autres.',
				'Pourquoi les plongeurs plongent-ils toujours en arrière ? Parce que sinon, ils tombent dans le bateau.',
				'Quel est le comble pour un électricien ? De ne pas être au courant.',
				'Quel est le comble pour un jardinier ? Raconter des salades.',
				'Pourquoi les programmeurs confondent-ils Halloween et Noël ? Parce que OCT 31 = DEC 25.',
				'Qu\'est-ce qui est jaune et qui attend ? Jonathan.',
				'Une requête SQL entre dans un bar, s\'approche de deux tables et demande : « Je peux me joindre à vous ? »',
				'Que fait une fraise sur un cheval ? Tagada, tagada !',
			],
			facts: [
				'Les pieuvres ont trois cœurs.',
				'Le miel ne se gâte jamais : on a retrouvé du miel encore comestible dans des tombes égyptiennes vieilles de milliers d\'années.',
				'Une journée sur Vénus dure plus longtemps qu\'une année sur Vénus.',
				'En botanique, la banane est une baie, mais pas la fraise.',
				'Les flamants roses sont roses à cause de ce qu\'ils mangent : des algues et des crevettes.',
				'Le cœur d\'une baleine bleue pèse autant qu\'une petite voiture.',
			],
			unknownWord: (w) => `Je ne trouve pas « ${w} » dans mes dictionnaires.`,
			noTranslation: (w, to) => `Je ne sais pas encore dire **${w}** en ${to}.`,
			translated: (w, list) => `**${w}** : ${list.map(([l, s]) => `en ${l}, **${s}**`).join(' ; ')}.`,
			meaning: (w, en, def) => `**${w}** se dit **${en}** en anglais${def ? ` : *${def}*` : ''}.`,
			feel: {
				'+': (w, name) => `Super que tu sois ${w}${name} ! Qu'est-ce qui te met de si bonne humeur ?`,
				'-': (w, name) => `Désolé que tu sois ${w}${name}. Tu veux en parler ?`,
				'--': (w, name) => `Je suis vraiment désolé${name}. C'est lourd à porter. Si ça dure, en parler à quelqu'un de confiance ou à un médecin peut vraiment aider, et je suis là pour t'écouter aussi.`,
				0: (w) => `D'accord, tu es ${w}. Qu'est-ce qui se passe ?`,
				not: (w, name) => `Ah, tu n'es pas ${w}${name} ? Qu'est-ce qui se passe ?`,
			},
			crisis: 'Je suis vraiment désolé que tu te sentes comme ça. Je ne suis qu\'un petit programme, alors parle maintenant à quelqu\'un qui peut t\'aider : en France, appelle le **3114**, aux États-Unis le **988**, et ailleurs ton numéro d\'urgence ou une ligne sur **findahelpline.com** te mettra en contact avec quelqu\'un. Si tu es en danger, appelle les secours. Tu n\'as pas à traverser ça seul.',
			named: (n) => `Enchanté, ${n}. Je retiendrai ton prénom sur cet appareil.`,
			dunno: ['Je ne sais pas. Je suis un petit assistant local, sans encyclopédie.', 'Ça me dépasse. Je peux discuter, traduire des mots, faire des calculs ou te raconter une blague.'],
			miss: ['Je n\'ai pas compris. Essaie autrement, ou écris **aide**.', 'Pardon, je ne vois pas ce que tu veux dire. Écris **aide** pour voir ce que je sais faire.'],
			intents: [
				{ id: 'greet', examples: ['bonjour', 'salut', 'bonsoir', 'coucou', 'salut onyx', 'bonjour onyx', 'hello', 'salut toi', 'bonjour a tous', 'yo salut'], reply: ['Bonjour{name} ! Comment ça va ?', 'Salut{name} ! Je peux t\'aider ?', 'Coucou{name} ! Quoi de neuf ?'] },
				{ id: 'how_are_you', examples: ['comment ca va', 'ca va', 'comment vas tu', 'comment allez vous', 'tu vas bien', 'ca va bien', 'quoi de neuf', 'la forme'], reply: ['Très bien, merci ! Et toi{name} ?', 'Tout roule ici. Et toi, ça va ?', 'Je fonctionne à merveille. Et toi ?'] },
				{ id: 'whats_up', examples: ['tu fais quoi', 'quoi de beau', 'qu est ce que tu fais', 'quoi de nouveau'], reply: ['Je suis là, prêt à discuter. Et toi, quoi de neuf ?', 'Rien de spécial, j\'attends tes questions !'] },
				{ id: 'user_good', examples: ['ca va bien', 'tres bien', 'bien merci', 'super', 'je vais bien', 'ca va et toi', 'tres bien merci'], reply: ['Tant mieux{name} !', 'Super. Je peux t\'aider avec quelque chose ?'] },
				{ id: 'thanks', examples: ['merci', 'merci beaucoup', 'merci bien', 'je te remercie', 'merci onyx', 'c est gentil'], reply: ['De rien{name} !', 'Avec plaisir.', 'Je t\'en prie.'] },
				{ id: 'bye', examples: ['au revoir', 'a plus', 'a bientot', 'salut a plus tard', 'bonne nuit', 'a demain', 'ciao', 'je dois y aller', 'bye'], reply: ['Au revoir{name} !', 'À bientôt !', 'Bonne journée !'] },
				{ id: 'identity', examples: ['qui es tu', 'comment tu t appelles', 'quel est ton nom', 'tu es quoi', 'presente toi'], reply: ['Je suis Onyx 2.5, un petit assistant qui fonctionne sur ton appareil et ne va sur internet que si tu me le permets. Je parle anglais, espagnol et français.'] },
				{ id: 'creator', examples: ['qui t a cree', 'qui t a fait', 'qui t a programme', 'tu viens d ou'], reply: ['C\'est GK Labs, à Austin (Texas), qui m\'a créé. Mon code est ouvert : tout le monde peut le lire et l\'améliorer.'] },
				{ id: 'is_ai', examples: ['tu es un robot', 'tu es une intelligence artificielle', 'tu es humain', 'es tu reel', 'tu es une ia', 'tu es chatgpt'], reply: ['Je suis un programme, pas une personne : un petit modèle ouvert qui fonctionne sur ton appareil. Je ne suis pas un grand modèle de langage.'] },
				{ id: 'languages', examples: ['tu parles francais', 'quelles langues parles tu', 'tu parles anglais', 'tu parles espagnol', 'combien de langues parles tu'], reply: ['Je parle anglais, espagnol et français. Écris-moi dans la langue de ton choix et je te réponds dans la même.'] },
				{ id: 'help', examples: ['aide', 'aide moi', 'tu peux faire quoi', 'qu est ce que tu sais faire', 'comment tu peux m aider', 'j ai besoin d aide', 'a quoi tu sers'], reply: () => ['Je peux :', '', '- discuter avec toi en français, en anglais ou en espagnol ;', '- traduire des mots : « comment dit-on chien en espagnol ? », « que veut dire happy ? » ;', '- faire des calculs : « combien font douze fois sept ? » ;', '- retenir ton prénom : « je m\'appelle Léa » ;', '- te raconter une blague ou une anecdote ;', '- te donner l\'heure et la date.', '', 'En anglais, j\'en sais bien plus : un dictionnaire de plus de 14 000 mots, des équations, des jeux de mots…'].join('\n') },
				{ id: 'joke', examples: ['raconte moi une blague', 'une blague', 'dis moi un truc drole', 'fais moi rire', 'tu connais une blague', 'une autre blague'], reply: (ctx) => ctx.draw('fr-joke', LANGS.fr.jokes) },
				{ id: 'fact', examples: ['dis moi un fait interessant', 'une anecdote', 'raconte moi quelque chose d interessant', 'le savais tu', 'apprends moi quelque chose'], reply: (ctx) => ctx.draw('fr-fact', LANGS.fr.facts) },
				{ id: 'time', examples: ['quelle heure est il', 'tu as l heure', 'l heure', 'il est quelle heure', 'heure actuelle'], reply: () => { const d = new Date(); return `Il est ${d.getHours()} h ${pad(d.getMinutes())}.`; } },
				{ id: 'date', examples: ['quel jour sommes nous', 'on est quel jour', 'quelle est la date', 'quelle date sommes nous', 'on est en quelle annee'], reply: () => { const d = new Date(); return `Nous sommes le ${DAYS.fr[d.getDay()]} ${d.getDate() === 1 ? '1er' : d.getDate()} ${MONTHS.fr[d.getMonth()]} ${d.getFullYear()}.`; } },
				{ id: 'name_get', examples: ['comment je m appelle', 'tu connais mon nom', 'qui suis je', 'tu te souviens de mon nom', 'quel est mon nom'], reply: (ctx) => (ctx.mem.name ? `Tu t'appelles ${ctx.mem.name}.` : 'Je ne connais pas encore ton prénom. Comment tu t\'appelles ?') },
				{ id: 'compliment', examples: ['tu es genial', 'tu es intelligent', 'je t aime bien', 'bon travail', 'tu es le meilleur', 'trop fort'], reply: ['Merci{name} ! Tu n\'es pas mal non plus.', 'C\'est gentil, merci !'] },
				{ id: 'insult', examples: ['tu es nul', 'tu sers a rien', 'tu es bete', 'je te deteste', 't es inutile'], reply: ['Aïe. Je suis petit et je me trompe parfois. Qu\'est-ce que tu essayais de faire ? Je peux peut-être aider autrement.'] },
				{ id: 'love', examples: ['je t aime', 'tu m aimes', 'veux tu m epouser', 'tu veux etre mon copain', 'tu veux sortir avec moi'], reply: ['C\'est adorable. Je ne suis qu\'un programme, mais je suis content de te tenir compagnie.'] },
				{ id: 'sorry', examples: ['pardon', 'desole', 'excuse moi', 'oups', 'je suis desole'], reply: ['Pas de souci.', 'Ce n\'est rien.'] },
				{ id: 'user_tired', examples: ['je suis fatigue', 'je suis epuise', 'j ai sommeil', 'je suis creve', 'besoin de dormir'], reply: ['Repose-toi un peu{name}. Un verre d\'eau et quelques minutes loin de l\'écran, ça aide.'] },
				{ id: 'user_bored', examples: ['je m ennuie', 'je m ennuie trop', 'c est ennuyeux', 'rien a faire'], reply: (ctx) => `Une blague pour commencer ? ${ctx.draw('fr-joke', LANGS.fr.jokes)}` },
				{ id: 'weather', examples: ['quel temps fait il', 'il va pleuvoir', 'il fait froid', 'la meteo', 'meteo du jour'], reply: ['Je n\'utilise pas internet, donc je ne vois pas la météo. Une fenêtre ou une appli météo te le diront mieux que moi.'] },
				{ id: 'limits', examples: ['ecris un poeme', 'ecris une dissertation', 'cherche sur google', 'ecris du code', 'raconte moi une histoire', 'quelles sont les nouvelles'], reply: ['Pour l\'instant, je n\'écris qu\'en anglais : haïkus, poèmes, petites histoires et messages (essaie « write a haiku about the sea »). Les longs textes, comme les dissertations ou le code, me dépassent.'] },
				{ id: 'ack', examples: ['ok', 'd accord', 'daccord', 'ca marche', 'mdr', 'lol', 'cool', 'parfait', 'je vois', 'top'], reply: ['😊', 'Parfait.', 'Super !'] },
				{ id: 'yes', examples: ['oui', 'oui merci', 'bien sur', 'oui s il te plait', 'carrement', 'ouais'], reply: ['D\'accord !'] },
				{ id: 'no', examples: ['non', 'non merci', 'pas maintenant', 'pas du tout'], reply: ['D\'accord.'] },
				{ id: 'meaning', examples: ['quel est le sens de la vie', 'pourquoi on vit', 'pourquoi on existe'], reply: ['Grande question. Ma réponse, petite comme moi : les gens, la curiosité et les bons moments. Et la tienne ?'] },
				{ id: 'english', examples: ['parle anglais', 'reponds en anglais', 'passe en anglais', 'parle moi en anglais'], reply: ['Of course! From now on I\'ll reply in English. Just write to me in Spanish or French whenever you like.'], switchTo: 'en' },
				{ id: 'spanish', examples: ['parle espagnol', 'reponds en espagnol', 'parle moi en espagnol'], reply: ['¡Claro! Te respondo en español.'], switchTo: 'es' },
			],
		},
	};

	// The same small talk asked for in English: "speak Spanish", "parle français".
	const SWITCH = [[/^(?:can you |could you |please )?(?:speak|talk|reply|answer|switch to|respond)(?: to me)?(?: in)? spanish\b|^en espa[nñ]ol\b|^habla(?:me)? (?:en )?espa[nñ]ol/i, 'es'], [/^(?:can you |could you |please )?(?:speak|talk|reply|answer|switch to|respond)(?: to me)?(?: in)? french\b|^en fran[cç]ais\b|^parle(?:-moi)? (?:en )?fran[cç]ais/i, 'fr']];

	/* ---------- Names and feelings ---------- */

	const NAME = {
		es: [/\b(?:me llamo|mi nombre es|llamame|puedes llamarme)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]{0,30})/i, /^(?:hola,?\s+)?soy\s+([A-ZÀ-Ý][a-zà-ÿ'-]{1,30})\s*[.!]?$/],
		fr: [/\b(?:je m'?appelle|mon (?:pr[ée])?nom (?:c'est|est)|appelle-moi|tu peux m'appeler|moi c'est)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]{0,30})/i, /^(?:salut,?\s+|bonjour,?\s+)?je suis\s+([A-ZÀ-Ý][a-zà-ÿ'-]{1,30})\s*[.!]?$/],
	};
	const NOT_NAMES = new Set(['bien', 'mal', 'cansado', 'cansada', 'triste', 'feliz', 'fatigue', 'fatiguee', 'content', 'contente', 'la', 'el', 'un', 'una', 'yo', 'aqui', 'ici', 'onyx', 'nuevo', 'nueva', 'nouveau', 'nouvelle', 'de', 'du', 'en', 'tres', 'muy', 'pas', 'no']);

	/** A name from "me llamo Ana" or "je m'appelle Léa"; null otherwise. */
	function nameFrom(lang, text) {
		for (const re of NAME[lang] || []) {
			const m = text.match(re);
			if (m && !NOT_NAMES.has(strip(m[1]))) return m[1][0].toUpperCase() + m[1].slice(1);
		}
		return null;
	}

	const FEEL = {
		es: /^(?:yo\s+)?(no\s+)?(?:estoy|me siento|me encuentro|ando|sigo)\s+(?:muy|un poco|bastante|tan|super|algo|demasiado|re)?\s*([a-zà-ÿñ]+)[.!?]*$/i,
		fr: /^(?:moi,?\s+)?(?:je\s+(?:ne\s+)?(?:suis|me sens)|j'suis|chuis)\s+(pas\s+)?(?:tr[eè]s|un peu|trop|si|super|vraiment|assez|tellement)?\s*([a-zà-ÿç]+)[.!?]*$/i,
	};

	/** "estoy cansada" -> { word: 'cansada', not: false, keys: ['tired'] }; null if it isn't a feeling we know. */
	function feeling(lang, text) {
		const m = String(text).trim().toLowerCase().match(FEEL[lang]);
		if (!m) return null;
		const keys = findForeign(lang, m[2]);
		return keys.length ? { word: m[2], not: !!m[1], keys } : null;
	}

	const CRISIS = {
		es: /\b(?:quiero morir(?:me)?|me quiero morir|matarme|suicid|no quiero vivir|quitarme la vida|hacerme da[nñ]o|autolesion)/i,
		fr: /\b(?:je veux mourir|envie de mourir|me suicider|suicid|me tuer|en finir avec la vie|me faire du mal|plus envie de vivre)/i,
	};

	/* ---------- Translation questions ---------- */

	// Every language Onyx has a dictionary for (onyx-tongues.js), by any of its names; English, Spanish and French alone
	// without it.
	const TONGUES = (typeof root !== 'undefined' && root.Omni && root.Omni.onyxTongues) || null;
	const LANG_WORD = { english: 'en', ingles: 'en', anglais: 'en', spanish: 'es', espanol: 'es', espagnol: 'es', castellano: 'es', french: 'fr', frances: 'fr', francais: 'fr' };
	const langCode = (name) => LANG_WORD[strip(name)] || (TONGUES && TONGUES.codeOf(name)) || null;
	const L = TONGUES ? `(${TONGUES.PATTERN}|ingl[eé]s|espa[nñ]ol|franc[eé]s|fran[cç]ais)` : '(english|spanish|french|ingl[eé]s|espa[nñ]ol|castellano|franc[eé]s|fran[cç]ais|anglais|espagnol)';
	const Q = '["\'«“]?\\s*(.+?)\\s*["\'»”]?';
	const TRANSLATE = [
		// English
		['en', new RegExp(`^what does\\s+${Q}\\s+mean in\\s+${L}$`, 'i'), 'word', 'from'],
		['en', new RegExp(`^(?:translate|say)\\s+${Q}\\s+from\\s+${L}\\s+(?:to|into)\\s+${L}$`, 'i'), 'word', 'from', 'to'],
		['en', new RegExp(`^what(?:'s| is)\\s+(?:the\\s+)?${L}\\s+(?:word\\s+)?${Q}\\s+in\\s+${L}$`, 'i'), 'from', 'word', 'to'],
		['en', new RegExp(`^(?:how (?:do|would) (?:you|i|we) say|how is|what(?:'s| is) the (?:word for)?|translate|say)\\s+${Q}\\s+(?:in|into|to)\\s+${L}\\b`, 'i'), 'word', 'to'],
		['en', new RegExp(`^(?:what(?:'s| is| are)?|whats)\\s+(?:the\\s+)?${L}\\s+(?:word\\s+)?for\\s+${Q}$`, 'i'), 'to', 'word'],
		['en', new RegExp(`^(?:what(?:'s| is)?|whats)\\s+${Q}\\s+in\\s+${L}$`, 'i'), 'word', 'to'],
		['en', new RegExp(`^translate\\s+${Q}(?:\\s+from\\s+${L})?$`, 'i'), 'word', 'from'],
		['en', new RegExp(`^${Q}\\s+in\\s+${L}\\??$`, 'i'), 'word', 'to'],
		// Spanish
		['es', new RegExp(`^(?:c[oó]mo se dice|c[oó]mo digo|traduce|traducir|traduceme|c[oó]mo se traduce)\\s+${Q}\\s+(?:en|al|a)\\s+${L}`, 'i'), 'word', 'to'],
		['es', new RegExp(`^(?:qu[eé] significa|qu[eé] quiere decir|c[oó]mo se dice|traduce|traducir|significado de)\\s+${Q}$`, 'i'), 'word'],
		// French
		['fr', new RegExp(`^(?:comment (?:dit-on|on dit|dire|se dit)|traduis|traduire|tradui[st]?-moi)\\s+${Q}\\s+(?:en|à|a)\\s+${L}`, 'i'), 'word', 'to'],
		['fr', new RegExp(`^(?:que veut dire|qu'est-ce que veut dire|que signifie|qu'est-ce que signifie|comment (?:dit-on|on dit)|traduis|traduire)\\s+${Q}$`, 'i'), 'word'],
		['fr', new RegExp(`^qu'est-ce que\\s+${Q}\\s+veut dire$`, 'i'), 'word'],
	];

	/** { word, to?, from?, lang } for "how do you say dog in Spanish", "¿qué significa feliz?", "que veut dire chien"; or null. lang is the language the question was asked in. */
	function translateQuery(text) {
		const t = String(text).trim().replace(/^[¿¡]+/, '').replace(/[?!.¿]+\s*$/, '').trim();
		for (const [lang, re, ...slots] of TRANSLATE) {
			const m = t.match(re);
			if (!m) continue;
			const out = { lang };
			slots.forEach((slot, i) => {
				const v = m[i + 1];
				if (v == null) return;
				out[slot] = slot === 'word' ? v.trim() : langCode(v);
			});
			// A word, a phrase or a short sentence: "how do you say 'where is the station' in French".
			if (out.word && out.word.split(/\s+/).length <= 14) return out;
		}
		return null;
	}

	(root.Omni = root.Omni || {}).onyxLanguages = { TABLE, BACK, IRREGULAR, ENDINGS, ARTICLE, LANGS, SWITCH, CRISIS, detect, findForeign, show, nameFrom, feeling, translateQuery, mathToEnglish, numbersToDigits, strip, size: TABLE.size };
})(typeof window !== 'undefined' ? window : globalThis);
