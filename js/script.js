    var audioCtx = new (AudioContext || webkitAudioContext)();
    var ctx, canvas;
    var grid = [], 
        played = [], 
        notes = {},
    realNotes = {};
    var xtiles = document.getElementById('xtiles').value, 
    ytiles = document.getElementById('ytiles').value,
        //minHz = document.getElementById('minHz').value,
        maxHz = document.getElementById('maxHz').value,
        soundChoice = document.getElementById('soundChoice').value,
        interval = 45-document.getElementById('speed').value,
        lastPosition = 0,
        pxs = 2,
        end;

    function init() {
        canvas = document.getElementById('myCanvas');
        ctx = myCanvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight-100;
        ctx.strokeStyle="#39FF14";
        ctx.lineWidth=10;
    }

    function createNotes() {
        for (var i = 0; i < ytiles; i++) {
            notes[i] = {frequency: ((ytiles-i)*(maxHz/ytiles)) }
        }
    }
    realNotes = {         
    0: { frequency: "261.6" },
    1: { frequency: "293.7" },
    2: { frequency: "329.6" },
    3: { frequency: "349.2" },
    4: { frequency: "392" },
    5: { frequency: "440" },
    6: { frequency: "493.9" },
    7: { frequency: "523.3" },
    8: { frequency: "587.3" },
    9: { frequency: "659.3"}
    };

    /* 
    //
    // Sound Code Begin
    //
    */

    function Key(frequency) {
        var keySound = new Sound(frequency, soundChoice);

        return {
            sound: keySound
        };
    }

    function Sound(frequency, type) {
        this.osc = audioCtx.createOscillator(); // Create oscillator node
        this.pressed = false; // flag to indicate if sound is playing

        /* Set default configuration for sound */
        if(typeof frequency !== 'undefined') {
            /* Set frequency. If it's not set, the default is used (440Hz) */
            this.osc.frequency.value = frequency;
        }

        /* Set waveform type. Default is actually 'sine' but triangle sounds better :) */
        this.osc.type = soundChoice;

        /* Start playing the sound. You won't hear it yet as the oscillator node needs to be
        piped to output (AKA your speakers). */
        this.osc.start(0);
    };

    Sound.prototype.play = function() {
        if(!this.pressed) {
            this.pressed = true;
            this.osc.connect(audioCtx.destination);
        }
    };

    Sound.prototype.stop = function() {
        this.pressed = false;
        this.osc.disconnect();
    };

    function createKeyboard(notes) {
        for(var keyCode in notes) {
            var note = notes[keyCode];

            /* Generate playable key */
            note.key = new Key(note.frequency);

        }
    }

    var playNote = function(pos) {
        if(typeof notes[pos] !== 'undefined') {
            // Pipe sound to output (AKA speakers)
            if (ytiles == 10) {
                realNotes[pos].key.sound.play();
            } else {
                notes[pos].key.sound.play();
            }
        }
    };

    
    var endNote = function(pos) {
        if(typeof notes[pos] !== 'undefined') {
            // Kill connection to output
            if (ytiles == 10) {
                realNotes[pos].key.sound.stop();
            } else {
                notes[pos].key.sound.stop();
            }
        }
    };

    /* 
    //
    // Sound Code End 
    //
    */

    function resetGrid() {
        grid = [];
        var temp = [];
        for (var i = 0; i < xtiles; i++) {
            for (var y = 0; y < ytiles; y++) {
               temp.push(0);
           }
       grid.push(temp);
       temp = [];
        }
    }

    function resetPlayed() {
        played.length = 0;
        for (var i = 0; i < xtiles; i++) {
        played.push(0);
        }
    }

    function updateGrid(x, y) {
        if (grid[x][y] == 0)
        grid[x][y] = 1;
        else
        grid[x][y] = 0;
        
        colorGrid();
    }

    function colorGrid() {
        for (var i = 0; i < xtiles; i++) {
        for (var y = 0; y < ytiles; y++) {
            if (grid[i][y] == 1) {
            ctx.fillRect((i/xtiles)*canvas.width,(y/ytiles)*canvas.height,canvas.width/xtiles,canvas.height/ytiles);
            }
        }
        }
    }

    function drawline(x) {
        // draw line
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        colorGrid();
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

        // play sounds
        var xpos = Math.floor((x/canvas.width)*xtiles);
        if (played[xpos] == 0) {
           for (var i = 0; i < ytiles; i++) {
               if (grid[xpos][i] == 1) {
                  //console.log(i);
                  playNote(i);
                  endNoteHelper(i);
               }
           }
           played[xpos] = 1
        }

        // move line
        if (x > canvas.width) {
           resetPlayed();
           return 0;
        } else {
           x+=pxs;
           return x;
        }
    }

    function endNoteHelper(yval) {
        setTimeout(function(){endNote(yval);}, ((canvas.width/xtiles)/pxs)*interval)-2;
    }

    function moveline() {
        end = setInterval(function(){lastPosition = drawline(lastPosition);}, interval);
    }

    function resetLine() {
        interval = 45-document.getElementById('speed').value;
        clearInterval(end);
        end = setInterval(function(){lastPosition = drawline(lastPosition);}, interval);
        console.log(interval);

    }

    function resetSound() {
        endNotes();
        soundChoice = document.getElementById('soundChoice').value;
        if (ytiles == 10) {
            createKeyboard(realNotes);
        } else {
            createKeyboard(notes);
        }
    }

    function resetBoard() {
        endNotes();
        lastPosition = 0;
        xtiles = document.getElementById('xtiles').value; 
        ytiles = document.getElementById('ytiles').value;
    createNotes();
        if (ytiles == 10) {
            createKeyboard(realNotes);
        } else {
            createKeyboard(notes);
        }
        resetGrid();
        colorGrid();
        resetPlayed();
    }

    function resetHz() {
        endNotes();
        //minHz = document.getElementById('minHz').value;
        maxHz = document.getElementById('maxHz').value;
        createNotes();
        if (ytiles == 10) {
            createKeyboard(realNotes);
        } else {
            createKeyboard(notes);
        }
    }

    function endNotes() {
        for (var i = 0; i < ytiles; i++) {
            endNote(i);
        }
    }

    function randomG() {
        lastPosition = 0;
        resetGrid();
        colorGrid();
        resetPlayed();
        for (var i = 0; i < xtiles; i++) {
            for (var y = 0; y < ytiles; y++) {
                if (Math.floor((Math.random() * 100)) % 10 == 0)
                //if (Math.floor((Math.random() * 100)) % (Math.floor(Math.random() * 10)) == 0)
                    grid[i][y] = 1;
            }
        }
    }

    // listen for clicks
    var elem = document.getElementById('myCanvas');
    elem.addEventListener('click', function(event) {
            var x = event.pageX-10,
        y = event.pageY-10;

        console.log(x);
        console.log(y);

        var xpos = Math.floor((x/canvas.width)*xtiles);
    var ypos = Math.floor((y/canvas.height)*ytiles);
        updateGrid(xpos, ypos);

        }, false);

    init();
    resetGrid();
    resetPlayed();
    createNotes();
    createKeyboard(realNotes);
    moveline();
