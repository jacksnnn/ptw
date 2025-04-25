# PARA TROOOPER WORLD - Interactive 3D Website

Dis project show off a interactive 3D spaceship ting, mek wid Spline, show pon di screen wid Three.js, and run wid Vite. Yuh can check out di spaceship and click pon di screens dem (LEFT, MIDDLE, RIGHT) fi zoom in and see di HTML bizniz right deh pon di 3D model.

## Technology Weh Wi Use

*   **Vite:** A quick quick frontend tool fi mek web develop sweet and easy.
*   **Three.js:** A popular JavaScript ting fi mek and show 3D graphics pon di web browser.
*   **Spline:** A 3D design tool fi build and sen out 3D web tings. Wi use `@splinetool/loader` fi load up di Spline scene.
*   **HTML/CSS/JavaScript:** Di usual web tools fi build out di look and feel.

## Set Up Di Ting and Mek It Run

Follow dem step yah fi get di project a work pon yuh own machine.

### Tings Yuh Haffi Have

*   **Node.js and npm:** Yuh need Node.js (which have npm inside). Ketch it from di official [Node.js website](https://nodejs.org/).
*   **Git:** Yuh need Git fi pull down di code. Check out how fi install Git [yah so](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

#### Get Node.js/npm wid Homebrew (fi di Mac Dem)

If yuh deh pon macOS and have [Homebrew](https://brew.sh/) install already, just run dis command inna yuh terminal fi get Node.js and npm:

```bash
brew install node
```

After dat done, check sey it install good:

```bash
npm -v
node -v
```

### 1. Pull Down Di Code (Clone)

First ting, copy di project files dem to yuh computer. Open up yuh terminal and run dis command:

```bash
git clone <repository-url>
```

Den, move inside di folder weh just mek:

```bash
cd ptw # Or whaeva di folder name
```

### 2. Install Di Needed Tings (Dependencies)

Once yuh inside di project folder, yuh haffi install all di tools and library dem weh di project use. Run dis command:

```bash
npm install
```

Dis command go read di `package.json` file and download everyting (like Vite, Three.js, SplineLoader) go inside di `node_modules` folder.

### 3. Start Di Engine (Run Dev Server)

Now yuh can start up di local server. Dis server show di project pon yuh machine, fix it up quick when yuh change di code, and open it inna yuh browser.

Run dis command:

```bash
npm run dev
```

Vite go start di server, and yuh fi see someting like dis inna yuh terminal:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Vite fi automatically open di project (usually `http://localhost:5173`).

### 4. Play Roun Wid Di Scene (NOT FULLY WORKING)

*   Yuh can spin round di spaceship wid yuh mouse (click and pull).
*   Click pon one a di three main screens (LEFT, MIDDLE, or RIGHT inna di Spline scene).
*   When yuh zoom in, yuh can interact wid di HTML ting deh pon di screen.
*   Click di "Return to Ship" button fi go back out.

## How Di Code Structure

*   `index.html`: Di main HTML page.
*   `src/main.js`: Di main JavaScript file wid di Three.js setup, Spline loadin, clicky-clicky bizniz, and CSS3D show.
*   `src/styles.css`: All di CSS style fi di HTML parts, both di 3D overlay and di zoom-in view.
*   `vite.config.js`: Config file fi di Vite tool.
*   `package.json`: List out di project needs and scripts.
*   `.gitignore`: Tell Git wha fi lef out.
*   `README.md`: Dis yah file!
