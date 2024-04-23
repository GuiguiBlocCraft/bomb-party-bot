let wordlist;
let wordsExcluded = [];
let oldPlayerId;
let oldPlayer;
let oldWord = null;
let currentLanguage;

window.running = true;
window.joinAuto = true;

console.clear();
console.log("%cJKLM %cBot\n%cDéveloppé par %cGuiguiBlocCraft %cet %cCocoCOD4%c\n\nCommandes :\n%c  running = false|true %c: Activer le bot\n%c  joinAuto = false|true %c: Rejoindre automatiquement la partie\n", "font-size: 48px", "font-size: 24px", "font-size: 16px; color: #bada55", "font-size: 16px; color: none", "font-size: 16px; color: #bada55", "font-size: 16px; color: none", "font-size: 16px; color: #00ff00", "font-size: 14px; color: #e00000; font-weight: bold", "font-size: 14px; color: none", "font-size: 14px; color: #e00000; font-weight: bold", "font-size: 14px; color: none");

let wordlistUrl = setWordListUrl(rules.dictionaryId.value);

if(wordlistUrl !== undefined) {
    const div = document.createElement("div");
    div.className = "quickRules";
    div.setAttribute("style", "top: 50px !important");
    const node = document.createTextNode("~ Bot by Guigui and Coco 🤖 ~");
    div.appendChild(node);
    document.getElementsByClassName("canvasArea")[0].appendChild(div);

    fetch(wordlistUrl)
        .then(a => a.text())
        .then(a => wordlist = a.split("\n").map(a => strNoAccent(a)))
        .finally(runBot());
}

function runBot() {
    setInterval(function () {
        if (milestone.currentPlayerPeerId === oldPlayerId)
            return;
    
        if (milestone.playerStatesByPeerId) oldPlayer = milestone.playerStatesByPeerId[oldPlayerId];
        oldPlayerId = milestone.currentPlayerPeerId;
    
        if (milestone.currentPlayerPeerId === undefined) {
            console.log("💣 Partie réinitialisée !");
            wordsExcluded = [];
    
            if (window.joinAuto) {
                setTimeout(function () {
                    console.log("💣 Partie rejointe");
                    socket.emit("joinRound");
                }, 1000);
            }
            return;
        }
    
        if (milestone.currentPlayerPeerId === selfPeerId && window.running) {
            let player = milestone.playerStatesByPeerId[milestone.currentPlayerPeerId];
            let wordAnswers = wordlist.filter(str => str.includes(milestone.syllable) && !wordsExcluded.includes(str));
    
            let wordAnswersTmp = wordAnswers.filter(str => bonusLetters(player, str));
    
            if (wordAnswersTmp.length > 0)
                wordAnswers = wordAnswersTmp;
    
            if (wordAnswers.length === 0) {
                console.log(`❌ Aucun mot trouvé concernant la syllabe '${milestone.syllable}'`);
                wordAnswers.push("/suicide");
            }
    
            setWord(player, wordAnswers);
        }
    
        if (milestone.playerStatesByPeerId !== undefined && oldPlayer?.wasWordValidated) {
            let word = oldPlayer.word.split('').filter(a => (a.charCodeAt() >= 97 && a.charCodeAt() <= 122) || a == '-').join('');
    
            wordsExcluded.push(word);
            console.log(`✅ Mot utilisé : ${word} | ${wordsExcluded.length} mot(s) utilisé(s)`);
        }
    }, 10)
}

function setWord(player, wordAnswers) {
    if (milestone.currentPlayerPeerId === selfPeerId) {
        let wordAnswer = wordAnswers[Math.floor(Math.random() * (wordAnswers.length - 1))];
        let timeIncrement = 0;

        setTimeout(function () {
            playersByPeerId[selfPeerId].animation = { type: "woo", startTime: Date.now(), duration: 2000 };
            for (let n = 1; n <= wordAnswer.length; n++) {
                timeIncrement += 50 + Math.floor(Math.random() * 200);

                setTimeout(function () {
                    socket.emit("setWord", wordAnswer.substring(0, n), false);

                    if (n === wordAnswer.length) {
                        socket.emit("setWord", wordAnswer, true);
                        setTimeout(function () {
                            if (!player.wasWordValidated) {
                                setWord(player, wordAnswers);
                            }
                        }, 100);
                    }
                }, timeIncrement);
            }
        }, 500);
    }
}

function strNoAccent(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function bonusLetters(player, word) {
    for (let letter of Object.getOwnPropertyNames(player.bonusLetters)) {
        if (player.bonusLetters[letter] === 1 && word.includes(letter))
            return true;
    }

    return false;
}

function setWordListUrl(language) {
    switch(language) {
        case "fr":
            console.log('Mode => français 🥐');
            return "https://raw.githubusercontent.com/chrplr/openlexicon/master/datasets-info/Liste-de-mots-francais-Gutenberg/liste.de.mots.francais.frgut.txt";
        case "en":
            console.log('Mode => english 💂');
            return "https://raw.githubusercontent.com/sindresorhus/word-list/main/words.txt";
        case "fr-pokemon":
            console.log('Mode => pokemon (fr) ⚡');
            return "https://raw.githubusercontent.com/SirSkaro/Pokedex/master/src/main/resources/dictionaries/fr/pokemon.txt";
        case "en-pokemon":
            console.log('Mode => pokemon (en) 🔥');
            return "https://raw.githubusercontent.com/cervoise/pentest-scripts/master/password-cracking/wordlists/pokemon-list-en.txt";
        default:
            console.log(`Langue '${language}' non gérée 😐`);
            return;
    }
}