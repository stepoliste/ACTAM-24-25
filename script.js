const DRUM_CLASSES = [
  'Kick',
  'Snare',
  'Hi-hat closed',
  'Hi-hat open',
  'Tom mid',
  'Clap',
  'Rim'
];
const TIME_HUMANIZATION = 0.01;

let Tone = mm.Player.tone;

let sampleBaseUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699';

let snarePanner = new Tone.Panner().toMaster();
new Tone.LFO(0.13, -0.25, 0.25).connect(snarePanner.pan).start();
// Kick
const kickSynth = new Tone.MembraneSynth({    
  envelope: { attack: 0.03, decay: 0.2, sustain: 0, release: 0.3 },
  volume: -6 
}).toMaster();

const distortion = new Tone.Distortion(0.4).toMaster();
kickSynth.connect(distortion);

document.getElementById("trigger-kick").addEventListener("click", () => {
  
  kickSynth.triggerAttackRelease("C2", "8n");
});


// Snare
const snareDrum = new Tone.NoiseSynth({    
  envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.2 },
  volume: -17, // Increased volume for a harder sound
  noise: { type: 'white' } // Use white noise for a sharper snare sound
}).toMaster();

const snareDistortion = new Tone.Distortion(0.4).toMaster();
snareDrum.connect(snareDistortion);

 document.getElementById("trigger-snare").addEventListener("click", () => {
  
  snareDrum.triggerAttackRelease("8n");
});

// Hi-hat
const hiHatSynth = new Tone.MetalSynth({
  frequency: 200, envelope: { attack: 0.01, decay: 0.2, release: 0.1 },
  harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
  volume: -12 // Reduced by 6 dB
}).toMaster();

document.getElementById("trigger-hihat").addEventListener("click", () => {
  
  hiHatSynth.triggerAttackRelease("8n");
});


// Open Hi-hat
const hiHatOpSynth = new Tone.NoiseSynth({
  frequency: 400, envelope: { attack: 0.01, decay: 0.1, release: 0.1 },
  harmonicity: 6.1, modulationIndex: 32, resonance: 5000, octaves: 1.5,
  volume: -18 // Reduced by 6 dB
}).toMaster();


document.getElementById("trigger-hihatop").addEventListener("click", () => {
 
  hiHatOpSynth.triggerAttackRelease("8n");
});



let drumKit = [
  kickSynth,
  snareDrum.connect(snarePanner),
  hiHatSynth.connect(new Tone.Panner(-0.5).toMaster()),
  hiHatOpSynth.connect(new Tone.Panner(-0.5).toMaster()),
  new Tone.Players({
    high: `${sampleBaseUrl}/slamdam-tom-mid-vh.mp3`,
    med: `${sampleBaseUrl}/slamdam-tom-mid-vm.mp3`,
    low: `${sampleBaseUrl}/slamdam-tom-mid-vl.mp3`
  }).connect(new Tone.Panner(0.5).toMaster()),
  new Tone.Players({
    high: `${sampleBaseUrl}/909-clap-vh.mp3`,
    med: `${sampleBaseUrl}/909-clap-vm.mp3`,
    low: `${sampleBaseUrl}/909-clap-vl.mp3`
  }).connect(new Tone.Panner(0.5).toMaster()),
  new Tone.Players({
    high: `${sampleBaseUrl}/909-rim-vh.wav`,
    med: `${sampleBaseUrl}/909-rim-vm.wav`,
    low: `${sampleBaseUrl}/909-rim-vl.wav`
  }).connect(new Tone.Panner(0.5).toMaster())
];


let midiDrums = [36, 38, 42, 46, 43, 49, 51];
let reverseMidiMapping = new Map([
  [36, 0],
  [35, 0],
  [38, 1],
  [27, 1],
  [28, 1],
  [31, 1],
  [32, 1],
  [33, 1],
  [34, 1],
  [37, 1],
  [39, 1],
  [40, 1],
  [56, 1],
  [65, 1],
  [66, 1],
  [75, 1],
  [85, 1],
  [42, 2],
  [44, 2],
  [54, 2],
  [68, 2],
  [69, 2],
  [70, 2],
  [71, 2],
  [73, 2],
  [78, 2],
  [80, 2],
  [46, 3],
  [67, 3],
  [72, 3],
  [74, 3],
  [79, 3],
  [81, 3],
  [43, 4],
  [29, 4],
  [41, 4],
  [61, 4],
  [64, 4],
  [84, 4],
  [49, 5],
  [55, 5],
  [57, 5],
  [58, 5],
  [51, 6],
  [52, 6],
  [53, 6],
  [59, 6],
  [82, 6]
]);

let temperature = 1.0;

let outputs = {
  internal: {
  play: (drumIdx, velocity, time) => {
    if (drumIdx === 0) {
      kickSynth.triggerAttackRelease("C2", "8n", time);
    } else if (drumIdx === 1) {
      snareDrum.triggerAttackRelease("8n", time);
    } else if (drumIdx === 2) {
      hiHatSynth.triggerAttackRelease("8n", time);
    }  else if (drumIdx === 3) {
      hiHatOpSynth.triggerAttackRelease("8n", time);
    }
    else {
      let player = drumKit[drumIdx];
      if (player instanceof Tone.Players) {
        player.get(velocity).start(time);
      }
    }
  }
}
}

window.state = {
  patternLength: 16,
  seedLength: 4,
  swing: 0.50,
  pattern: Array.from({ length: 16 }, () => []),
  tempo: 120
};

let rnn = new mm.MusicRNN(
  'https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/drum_kit_rnn'
);
Promise.all([
  rnn.initialize(),
  new Promise(res => Tone.Buffer.on('load', res))
]).then(([vars]) => {
  let state = {
    patternLength: 16, // Initialize pattern length to 16
    seedLength: 4, // Fix seed length to 4
    swing: 0.50,
    pattern: Array.from({ length: 16 }, () => []), // Ensure pattern length is 16
    tempo: 120
  };
  let stepEls = [],
    hasBeenStarted = false,
    oneEighth = Tone.Time('8n').toSeconds(),
    activeOutput = 'internal',
    midiClockSender = null,
    midiClockStartSent = false,
    activeClockInput = 'none',
    currentSchedulerId,
    stepCounter;

  function generatePattern(seed, length) {
    let seedSeq = toNoteSequence(seed);
    return rnn
      .continueSequence(seedSeq, length, temperature)
      .then(r => seed.concat(fromNoteSequence(r, length)));
  }

  function getStepVelocity(step) {
    if (step % 4 === 0) {
      return 'high';
    } else if (step % 2 === 0) {
      return 'med';
    } else {
      return 'low';
    }
  }

  function humanizeTime(time) {
    return time - TIME_HUMANIZATION / 2 + Math.random() * TIME_HUMANIZATION;
  }

  function tick(time = Tone.now() - Tone.context.lookAhead) {
    if (_.isNumber(stepCounter) && state.pattern) {
      stepCounter++;
      if (midiClockSender) midiClockSender(time, stepCounter);

      let stepIdx = stepCounter % state.pattern.length;
      let isSwung = stepIdx % 2 !== 0;
      if (isSwung) {
        time += (state.swing - 0.5) * oneEighth;
      }
      let velocity = getStepVelocity(stepIdx);
      let drums = state.pattern[stepIdx];
      drums.forEach(d => {
        let humanizedTime = stepIdx === 0 ? time : humanizeTime(time);
        outputs[activeOutput].play(d, velocity, humanizedTime);
        visualizePlay(humanizedTime, stepIdx, d);
      });
    }
  }

  function startPattern() {
    stepCounter = -1;
    midiClockStartSent = false;
    updatePlayPauseIcons();
  }

  window.stopPattern = function() {
    stepCounter = null;
    updatePlayPauseIcons();
  };


  function visualizePlay(time, stepIdx, drumIdx) {
    Tone.Draw.schedule(() => {
      if (!stepEls[stepIdx]) return;
      let cellEl = stepEls[stepIdx].cellEls[drumIdx];
      if (cellEl && cellEl.classList.contains('on')) { // Ensure cellEl is defined
        cellEl.style.boxShadow = '0 4px 8px rgba(255, 255, 255, 0.5)';
        setTimeout(() => {
          cellEl.style.boxShadow = 'none';
        }, 100);
      }
    }, time);
  }

  window.renderPattern = function(regenerating = false) {
    let seqEl = document.querySelector('.sequencer .steps');
    while (stepEls.length > state.pattern.length) {
      let { stepEl } = stepEls.pop();
      stepEl.remove();
    }
    for (let stepIdx = 0; stepIdx < state.pattern.length; stepIdx++) {
      let step = state.pattern[stepIdx];
      let stepEl, cellEls;
      if (stepEls[stepIdx]) {
        stepEl = stepEls[stepIdx].stepEl;
        cellEls = stepEls[stepIdx].cellEls;
      } else {
        stepEl = document.createElement('div');
        stepEl.classList.add('step');
        stepEl.dataset.stepIdx = stepIdx;
        seqEl.appendChild(stepEl);
        cellEls = [];
      }

      stepEl.style.flex = stepIdx % 2 === 0 ? state.swing : 1 - state.swing;

      for (let cellIdx = 0; cellIdx < DRUM_CLASSES.length; cellIdx++) {
        let cellEl;
        if (cellEls[cellIdx]) {
          cellEl = cellEls[cellIdx];
        } else {
          cellEl = document.createElement('div');
          cellEl.classList.add('cell');
          cellEl.classList.add(_.kebabCase(DRUM_CLASSES[cellIdx]));
          cellEl.dataset.stepIdx = stepIdx;
          cellEl.dataset.cellIdx = cellIdx;
          stepEl.appendChild(cellEl);
          cellEls[cellIdx] = cellEl;
        }
        if (step.indexOf(cellIdx) >= 0) {
          cellEl.classList.add('on');
        } else {
          cellEl.classList.remove('on');
        }
      }
      stepEls[stepIdx] = { stepEl, cellEls };

      let stagger = stepIdx * (300 / (state.patternLength - state.seedLength));
      setTimeout(() => {
        if (stepIdx < state.seedLength) {
          stepEl.classList.add('seed');
        } else {
          stepEl.classList.remove('seed');
          if (regenerating) {
            stepEl.classList.add('regenerating');
          } else {
            stepEl.classList.remove('regenerating');
            stepEl.classList.add('generated'); // Add generated class
          }
        }
      }, stagger);
    }
  }

 

  function regenerate() {
    let seed = _.take(state.pattern, state.seedLength);
    renderPattern(true);
    return generatePattern(seed, state.patternLength - seed.length).then(
      result => {
        state.pattern = result;
        onPatternUpdated();
      }
    );
  }

  function onPatternUpdated() {
    stopPattern();
    renderPattern();
  }

  function toggleStep(cellEl) {
    if (state.pattern && cellEl.classList.contains('cell')) {
      let stepIdx = +cellEl.dataset.stepIdx;
      let cellIdx = +cellEl.dataset.cellIdx;
      let isOn = cellEl.classList.contains('on');
      if (isOn) {
        _.pull(state.pattern[stepIdx], cellIdx);
        cellEl.classList.remove('on');
      } else {
        state.pattern[stepIdx].push(cellIdx);
        cellEl.classList.add('on');
      }
    }
  }

  function toNoteSequence(pattern) {
    return mm.sequences.quantizeNoteSequence(
      {
        ticksPerQuarter: 220,
        totalTime: pattern.length / 2,
        timeSignatures: [
          {
            time: 0,
            numerator: 4,
            denominator: 4
          }
        ],
        tempos: [
          {
            time: 0,
            qpm: 120
          }
        ],
        notes: _.flatMap(pattern, (step, index) =>
          step.map(d => ({
            pitch: midiDrums[d],
            startTime: index * 0.5,
            endTime: (index + 1) * 0.5
          }))
        )
      },
      1
    );
  }

  function fromNoteSequence(seq, patternLength) {
    let res = _.times(patternLength, () => []);
    for (let { pitch, quantizedStartStep } of seq.notes) {
      res[quantizedStartStep].push(reverseMidiMapping.get(pitch));
    }
    return res;
  }

  function setSwing(newSwing) {
    state.swing = newSwing;
    renderPattern();
  }

  function updatePlayPauseIcons() {
    const pauseIcon = document.querySelector('.playpause .pause-icon');
    const playIcon = document.querySelector('.playpause .play-icon');
    
    if (pauseIcon && playIcon) {
      if (_.isNumber(stepCounter)) {
        pauseIcon.style.display = null;
        playIcon.style.display = 'none';
      } else {
        playIcon.style.display = null;
        pauseIcon.style.display = 'none';
      }
    }
  }

  WebMidi.enable(err => {
    if (err) {
      console.error('WebMidi could not be enabled', err);
      return;
    }
    document
      .querySelectorAll('.webmidi-enabled')
      .forEach(e => (e.style.display = 'block'));
    let outputSelector = document.querySelector('.midi-output');
    let clockOutputSelector = document.querySelector('.midi-clock-output');
    let clockInputSelector = document.querySelector('.midi-clock-input');
    let activeClockOutput,
      midiClockCounter = 0,
      eighthsCounter = 0,
      lastEighthAt;

    function onDevicesChanged() {
      while (outputSelector.firstChild) {
        outputSelector.firstChild.remove();
      }
      let internalOption = document.createElement('option');
      internalOption.value = 'internal';
      internalOption.innerText = 'Internal drumkit';
      outputSelector.appendChild(internalOption);
      for (let output of WebMidi.outputs) {
        let option = document.createElement('option');
        option.value = output.id;
        option.innerText = output.name;
        outputSelector.appendChild(option);
      }
      $(outputSelector).formSelect();
      onActiveOutputChange('internal');

      while (clockOutputSelector.firstChild) {
        clockOutputSelector.firstChild.remove();
      }
      let noneOption = document.createElement('option');
      noneOption.value = 'none';
      noneOption.innerText = 'Not sending';
      clockOutputSelector.appendChild(noneOption);
      for (let output of WebMidi.outputs) {
        let option = document.createElement('option');
        option.value = output.id;
        option.innerText = output.name;
        clockOutputSelector.appendChild(option);
      }
      $(clockOutputSelector).formSelect();
      onActiveClockOutputChange('none');

      while (clockInputSelector.firstChild) {
        clockInputSelector.firstChild.remove();
      }
      noneOption = document.createElement('option');
      noneOption.value = 'none';
      noneOption.innerText = 'None (using internal clock)';
      clockInputSelector.appendChild(noneOption);
      for (let input of WebMidi.inputs) {
        let option = document.createElement('option');
        option.value = input.id;
        option.innerText = input.name;
        clockInputSelector.appendChild(option);
      }
      $(clockInputSelector).formSelect();
      onActiveClockInputChange('none');
    }

    function onActiveOutputChange(id) {
      if (activeOutput !== 'internal') {
        outputs[activeOutput] = null;
      }
      activeOutput = id;
      if (activeOutput !== 'internal') {
        let output = WebMidi.getOutputById(id);
        outputs[id] = {
          play: (drumIdx, velo, time) => {
            let delay = (time - Tone.now()) * 1000;
            let duration = (oneEighth / 2) * 1000;
            let velocity = { high: 1, med: 0.75, low: 0.5 };
            output.playNote(midiDrums[drumIdx], 1, {
              time: delay > 0 ? `+${delay}` : WebMidi.now,
              velocity,
              duration
            });
          }
        };
      }
      for (let option of Array.from(outputSelector.children)) {
        option.selected = option.value === id;
      }
    }

    function onActiveClockOutputChange(id) {
      if (activeClockOutput !== 'none') {
        stopSendingMidiClock();
      }
      activeClockOutput = id;
      if (activeClockOutput !== 'none') {
        startSendingMidiClock();
      }
      for (let option of Array.from(clockOutputSelector.children)) {
        option.selected = option.value === id;
      }
    }

    function startSendingMidiClock() {
      let output = WebMidi.getOutputById(activeClockOutput);
      midiClockSender = function(time, stepCounter) {
        let startDelay = time - Tone.now() + Tone.context.lookAhead;
        let sixteenth = Tone.Time('16n').toSeconds();
        for (let i = 0; i < 6; i++) {
          let tickDelay = startDelay + (sixteenth / 6) * i;
          if (i === 0 && stepCounter === 0 && !midiClockStartSent) {
            console.log('sending clock start');
            output.sendStart({ time: `+${tickDelay * 1000}` });
            midiClockStartSent = true;
          }
          output.sendClock({ time: `+${tickDelay * 1000}` });
        }
      };
    }

    function stopSendingMidiClock() {
      midiClockSender = null;
      midiClockStartSent = false;
    }

    function incomingMidiClockStart() {
      midiClockCounter = 0;
      eighthsCounter = 0;
      startPattern();
    }

    function incomingMidiClockStop() {
      midiClockCounter = 0;
      eighthsCounter = 0;
      lastEighthAt = null;
      stopPattern();
    }

    function incomingMidiClockTick(evt) {
      if (midiClockCounter % 6 === 0) {
        tick();
      }
      if (eighthsCounter % 12 === 0) {
        if (lastEighthAt) {
          oneEighth = (evt.timestamp - lastEighthAt) / 1000;
        }
        lastEighthAt = evt.timestamp;
      }
      midiClockCounter++;
      eighthsCounter++;
    }

    function onActiveClockInputChange(id) {
      if (activeClockInput === 'none') {
        Tone.Transport.clear(currentSchedulerId);
        currentSchedulerId = null;
      } else if (activeClockInput) {
        let input = WebMidi.getInputById(activeClockInput);
        input.removeListener('start', 'all', incomingMidiClockStart);
        input.removeListener('stop', 'all', incomingMidiClockStop);
        input.removeListener('clock', 'all', incomingMidiClockTick);
      }
      activeClockInput = id;
      if (activeClockInput === 'none') {
        currentSchedulerId = Tone.Transport.scheduleRepeat(tick, '16n');
        oneEighth = Tone.Time('8n').toSeconds();
      } else {
        let input = WebMidi.getInputById(id);
        input.addListener('start', 'all', incomingMidiClockStart);
        input.addListener('stop', 'all', incomingMidiClockStop);
        input.addListener('clock', 'all', incomingMidiClockTick);
      }
    }

    onDevicesChanged();
    WebMidi.addListener('connected', onDevicesChanged);
    WebMidi.addListener('disconnected', onDevicesChanged);

    $(outputSelector)
      .on('change', evt => onActiveOutputChange(evt.target.value))
      .formSelect();
    $(clockOutputSelector)
      .on('change', evt => onActiveClockOutputChange(evt.target.value))
      .formSelect();
    $(clockInputSelector)
      .on('change', evt => onActiveClockInputChange(evt.target.value))
      .formSelect();
  });

  document.querySelector('.app').addEventListener('click', event => {
    if (event.target.classList.contains('cell')) {
      toggleStep(event.target);
    }
  });
  document.querySelector('.regenerate').addEventListener('click', event => {
    event.preventDefault();
    event.currentTarget.classList.remove('pulse');
    document.querySelector('.playpause').classList.remove('pulse');
    regenerate().then(() => {
      if (!hasBeenStarted) {
        Tone.context.resume();
        Tone.Transport.start();
        hasBeenStarted = true;
      }
      if (Tone.Transport.state === 'started') {
        setTimeout(startPattern, 0);
      }
    });
  });
  document.querySelector('.playpause').addEventListener('click', event => {
    event.preventDefault();
    document.querySelector('.playpause').classList.remove('pulse');
    if (_.isNumber(stepCounter)) {
      stopPattern();
      Tone.Transport.pause();
    } else {
      Tone.context.resume();
      Tone.Transport.start();
      startPattern();
      hasBeenStarted = true;
    }
  });

  document.querySelector('.app').addEventListener('mousedown', evt => {
    let el = evt.target;
    if (
      el.classList.contains('gutter') &&
      el.classList.contains('seed-marker')
    ) {
      evt.preventDefault();
    }
  });
  document.querySelector('.app').addEventListener('mouseup', () => {
    // No need to handle draggingSeedMarker
  });
  document.querySelector('.app').addEventListener('mouseover', evt => {
    // No need to handle draggingSeedMarker
  });

  const knobs = [
    { id: 'tempo', image: 'knobs/gb/small_black_120.png' },
    { id: 'swing', image: 'knobs/gb/pointy_red_120.png' },
    { id: 'temperature', image: 'knobs/gb/pointy_white_120.png' },
    { id: 'kick-attack', image: 'knobs/gb/small_black_120.png' },
    { id: 'kick-release', image: 'knobs/gb/small_black_120.png' },
    { id: 'kick-pitch', image: 'knobs/gb/small_black_120.png' },
    { id: 'kick-gain', image: 'knobs/gb/small_black_120.png' },
    { id: 'snare-attack', image: 'knobs/gb/small_black_120.png' },
    { id: 'snare-release', image: 'knobs/gb/small_black_120.png' },
    { id: 'snare-pitch', image: 'knobs/gb/small_black_120.png' },
    { id: 'snare-gain', image: 'knobs/gb/small_black_120.png' },
    { id: 'hihatcl-attack', image: 'knobs/gb/small_black_120.png' },
    { id: 'hihatcl-release', image: 'knobs/gb/small_black_120.png' },
    { id: 'hihatcl-pitch', image: 'knobs/gb/small_black_120.png' },
    { id: 'hihatcl-gain', image: 'knobs/gb/small_black_120.png' },
    { id: 'hihatop-attack', image: 'knobs/gb/small_black_120.png' },
    { id: 'hihatop-release', image: 'knobs/gb/small_black_120.png' },
    { id: 'hihatop-pitch', image: 'knobs/gb/small_black_120.png' },
    { id: 'hihatop-gain', image: 'knobs/gb/small_black_120.png' },

  ];

  knobs.map(({id, image, indicator}) => {
    const el = document.getElementById(id)
    KnobHelper.createKnobSprite(el, id, image, indicator)
  })
  
  knobs.forEach(({ id, image }) => {
    const knobElement = document.getElementById(id);

    // Set the initial position of the knob to match its value
    knobElement.value = knobElement.getAttribute('value');

    // Log the value when the knob changes
    knobElement.addEventListener('change', (event) => {
      const value = parseFloat(event.target.value);
      if (!isFinite(value)) return; // Ensure the value is finite

      console.log(`Knob "${id}" value: ${value}`);
      if (id === 'tempo') {
        Tone.Transport.bpm.value = state.tempo = value;
        oneEighth = Tone.Time('8n').toSeconds();
      } else if (id === 'swing') { 
        setSwing(value);
      } else if (id === 'temperature') {
        temperature = value;
      } else if (id === 'kick-attack') {
        kickSynth.envelope.attack = value;
      } else if (id === 'kick-release') {
        kickSynth.envelope.release = value;
      } else if (id === 'kick-pitch') {
        kickSynth.pitchDecay = value / 1000;
      } else if (id === 'kick-gain') {
        kickSynth.volume.value = Tone.gainToDb(value);
      } else if (id === 'snare-attack') {
        snareDrum.envelope.attack = value;
      } else if (id === 'snare-release') {
        snareDrum.envelope.release = value;
      } else if (id === 'snare-gain') {
        snareDrum.volume.value = Tone.gainToDb(value);
      } else if (id === 'hihatcl-attack') {
        hiHatSynth.envelope.attack = value;
      } else if (id === 'hihatcl-release') {
        hiHatSynth.envelope.release = value;
      } else if (id === 'hihatcl-pitch') {
        hiHatSynth.frequency.value = value;
      } else if (id === 'hihatcl-gain') {
        hiHatSynth.volume.value = Tone.gainToDb(value);
      } else if (id === 'hihatop-attack') {
        hiHatOpSynth.envelope.attack = event.target.value;
      } else if (id === 'hihatop-release') {
        hiHatOpSynth.envelope.release = event.target.value;
      } else if (id === 'hihatop-gain') {
        hiHatOpSynth.volume.value = Tone.gainToDb(event.target.value);
      } else if (id === 'hihatop-gain') {
        hiHatOpSynth.volume.value = Tone.gainToDb(event.target.value);
      }
    });
  });
  
  

  $('#pattern-length')
    .on('change', evt => setPatternLength(+evt.target.value))
    .formSelect();


  renderPattern();

  document.querySelector('.progress').remove();
  document.querySelector('.app').style.display = null;
});




// Creazione effetti con valori iniziali
const reverb = new Tone.Freeverb();
const delay = new Tone.FeedbackDelay("8n", 0.5);
const highPassFilter = new Tone.Filter(500, "highpass");

reverb.wet.value = 0;
delay.wet.value = 0;
highPassFilter.frequency.value = 20;

// Assicuriamoci che ogni drum pad sia collegato alla catena di effetti
drumKit.forEach(drum => {
  drum.disconnect();
  drum.connect(highPassFilter); // Passa prima dal filtro
  highPassFilter.connect(reverb); // Poi il riverbero
  reverb.connect(delay); // Poi il delay
  delay.connect(Tone.Master); // Uscita finale
});


// Funzione per mappare i valori (0-100 dello slider → range scelto)
function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Funzione per aggiornare gli effetti in base agli slider
function updateEffect(effect, slider, min, max) {
  let sliderValue = parseFloat(slider.value);
  let mappedValue = mapRange(sliderValue, 0, 100, min, max);
  effect.linearRampTo(mappedValue, 0.1);
}

// Controllo del Riverbero
const reverbSlider = document.getElementById("reverb-slider");
reverbSlider.addEventListener("input", () => updateEffect(reverb.wet, reverbSlider, 0, 1));

// Controllo del Delay
const delaySlider = document.getElementById("delay-slider");
delaySlider.addEventListener("input", () => updateEffect(delay.wet, delaySlider, 0, 1));

// Controllo High-Pass Filter
const highpassSlider = document.getElementById("highpass-slider");
highpassSlider.addEventListener("input", () => updateEffect(highPassFilter.frequency, highpassSlider, 20, 1000));

// Forza un update iniziale per sincronizzare i valori (IMPORTANTE!)
setTimeout(() => {
  reverbSlider.dispatchEvent(new Event('input'));
  delaySlider.dispatchEvent(new Event('input'));
  highpassSlider.dispatchEvent(new Event('input'));
}, 100);


// CLEAR
setTimeout(() => {
  reverbSlider.dispatchEvent(new Event('input'));
  delaySlider.dispatchEvent(new Event('input'));
  highpassSlider.dispatchEvent(new Event('input'));
}, 100);


document.getElementById("clear-pattern").addEventListener("click", () => {
  state.pattern = Array.from({ length: state.patternLength }, () => []);
  stopPattern();
  
  document.querySelectorAll(".cell.on").forEach(cell => cell.classList.remove("on"));

  stepEls.forEach(({ stepEl }) => stepEl.remove("on"));

  renderPattern();
});