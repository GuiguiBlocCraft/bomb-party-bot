let wordlist;
let wordsExcluded = [];
let oldPlayerId;
let oldPlayer;
let oldWord = null;

window.running = true;
window.joinAuto = true;

console.clear();
console.log("%cJKLM %cBot\n%cDéveloppé par %cGuiguiBlocCraft %cet %cCocoCOD4%c\n\nCommandes :\n%c  running = false|true %c: Activer le bot\n%c  joinAuto = false|true %c: Rejoindre automatiquement la partie\n","font-size: 48px","font-size: 24px","font-size: 16px; color: #bada55","font-size: 16px; color: none","font-size: 16px; color: #bada55",   "font-size: 16px; color: none","font-size: 16px; color: #00ff00","font-size: 14px; color: #e00000; font-weight: bold","font-size: 14px; color: none","font-size: 14px; color: #e00000; font-weight: bold","font-size: 14px; color: none");

fetch('https://raw.githubusercontent.com/chrplr/openlexicon/master/datasets-info/Liste-de-mots-francais-Gutenberg/liste.de.mots.francais.frgut.txt')
    .then(a => a.text())
    .then(a => wordlist = a.split("\n").map(a => strNoAccent(a)));

setInterval(function() {
    if(milestone.currentPlayerPeerId === oldPlayerId)
        return;

    if(milestone.playerStatesByPeerId) oldPlayer = milestone.playerStatesByPeerId[oldPlayerId];
    oldPlayerId = milestone.currentPlayerPeerId;

    if(milestone.currentPlayerPeerId === undefined) {
        console.log("💣 Partie réinitialisée !");
        wordsExcluded = [];

        if(window.joinAuto) {
            setTimeout(function() {
                console.log("💣 Partie rejointe");
                socket.emit("joinRound");
            }, 1000);
        }
        return;
    }

    if(milestone.currentPlayerPeerId === selfPeerId && window.running) {
        let player = milestone.playerStatesByPeerId[milestone.currentPlayerPeerId];
        let wordAnswers = wordlist.filter(str => str.includes(milestone.syllable) && !wordsExcluded.includes(str));

        let wordAnswersTmp = wordAnswers.filter(str => bonusLetters(player, str));

        if(wordAnswersTmp.length > 0)
            wordAnswers = wordAnswersTmp;

        if(!wordAnswers.length === 0) {
            console.log(`❌ Aucun mot trouvé concernant la syllabe ${milestone.syllable}`);
            return;
        }

        let wordAnswer = wordAnswers[Math.floor(Math.random() * (wordAnswers.length - 1))];
        let timeIncrement = 0;

        setTimeout(function() {
            playersByPeerId[selfPeerId].animation = { type: "woo", startTime: Date.now(), duration: 2000 };
            for(let n = 1; n <= wordAnswer.length; n++) {
                timeIncrement += 50 + Math.floor(Math.random() * 200);

                setTimeout(function() {
                    socket.emit("setWord", wordAnswer.substring(0, n), false);

                    if(n === wordAnswer.length)
                        socket.emit("setWord", wordAnswer, true);
                }, timeIncrement);
            }
        }, 300);
    }

    if(milestone.playerStatesByPeerId !== undefined && oldPlayer?.wasWordValidated) {
        let word = oldPlayer.word.split('').filter(a => isNaN(a) || a != '-').join('');

        wordsExcluded.push(word);
        console.log(`✅ Mot utilisé : ${word} | ${wordsExcluded.length} mot(s) utilisé(s)`);
    }
}, 10)

function strNoAccent(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function bonusLetters(player, word) {
    for(let letter of Object.getOwnPropertyNames(player.bonusLetters)) {
        if(player.bonusLetters[letter] === 1 && word.includes(letter))
            return true;
    }

    return false;
}