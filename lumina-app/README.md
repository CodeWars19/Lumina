# Lumina — Palm Reading App

A mystical palm reading experience powered by Google Gemini. Capture your palm, get an AI reading, and ask follow-up questions.

## Setup

1. **Get a Gemini API key** (free)  
   - Go to [Google AI Studio](https://aistudio.google.com/apikey)  
   - Create and copy your API key  

2. **Add your API key**  
   - Open `index.html` in a text editor  
   - Find `GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'` near the top  
   - Replace `YOUR_GEMINI_API_KEY` with your key  

## Run

**Option A — Quick (double-click)**  
- Open `index.html` in your browser  
- Camera may require HTTPS or `localhost` in some browsers  

**Option B — Local server (recommended)**  
```bash
cd lumina-app
npx --yes serve .
```
Then open http://localhost:3000

**Option C — Python**
```bash
cd lumina-app
python -m http.server 8080
```
Then open http://localhost:8080

## Usage

1. Click **Activate Camera**
2. Place your open palm in the frame (hand detection will highlight the ring)
3. Click **Read My Palm**
4. Chat with Lumina about your reading
