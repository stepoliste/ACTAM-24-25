# Generative Drum Machine

This project is a generative drum machine designed for musicians, producers, and enthusiasts looking to explore dynamic and creative rhythm patterns. Leveraging machine learning and sound synthesis, it offers a unique and interactive experience.

---

## Features

### **1. Step Sequencing**
- Supports **7 instruments** (Kick, Snare, Hi-hat Open, Hi-hat Closed, Tom Mid, Clap, Rim) over **16 steps**.
- Users input the first 4 steps; the algorithm completes the remaining sequence.

### **2. Sound Controls**
- Adjustable sound parameters for synthesized sounds, including:
  - Attack (A)
  - Release (R)
  - Gain
  - Pitch

### **3. Advanced Features**
- **Swing Control:** Modify the groove and feel of the pattern.
- **Temperature Control:** Alter the creativity of pattern generation by the neural network.
- **Integrated Effects:**
  - Reverb
  - Delay
  - High-Pass Filter (HPF)

### **4. MIDI Integration**
- Compatibility with external MIDI devices.

---

## Usage

### **Getting Started**
1. **Open the Application:** Load the interface in your browser.
2. **Set Initial Steps:** Select the first four beats of your pattern.
3. **Generate Pattern:** Click the "Generate" button to let the algorithm complete the sequence.
4. **Play/Pause:** Control playback using the "Play/Pause" button.
5. **Sound Tuning:** Adjust sound synthesis parameters and apply effects using the provided sliders.
6. **Export MIDI:** Connect your external MIDI devices for seamless integration.

### **Creative Controls**
- **Swing:** Adjust the timing between steps for a humanized feel.
- **Temperature:** Increase for wilder patterns; decrease for more conventional rhythms.
- **Sound Synthesis:** Fine-tune attack, release, gain, and pitch for each instrument.

---

## Why It’s Different

This drum machine stands out from traditional models by incorporating:

1. **Machine Learning Integration:**
   - Built with **Google Magenta**, trained on millions of MIDI patterns.
2. **Generative Sequencing:**
   - Users can co-create rhythms with AI-generated patterns.
3. **Temperature Control:**
   - Provides control over the creativity level of the neural network's output.

---

## Target Audience

- **Beginners:** Intuitive and fun interface for getting started with drum machines.
- **Live Performers:** Dynamic features and real-time control for live performances.

---

## How It Works

### **Technologies Used**
- **Tone.js:** For sound synthesis and scheduling.
- **Magenta.js:** Neural network model for pattern generation.
- **WebMIDI:** MIDI device support.
- **Materialize.css:** Interface styling.

### **Algorithm Workflow**
1. User sets the first 4 steps.
2. The seed is fed into the neural network.
3. The network generates the remaining 12 steps based on learned patterns.
4. Users can further modify the sequence or regenerate it.

---

## Future Enhancements
- Export audio files.
- Additional effects and sound customizations.
- More machine learning models for varied styles.

---

## Credits
- Developed using Google Magenta and Tone.js.
- UI design based on Materialize CSS.

Enjoy creating your unique rhythms with the Generative Drum Machine!

