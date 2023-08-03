const color = new Map([
    ['key', ({ k }) => k],
    ['cyan', ({ k, r }) => (1 - r - k) / (1 - k)],
    ['magenta', ({ k, g }) => (1 - g - k) / (1 - k)],
    ['yellow', ({ k, b }) => (1 - b - k) / (1 - k)],
]);
const toFixed = (num, fact = 1000) => {
    return Math.trunc(num * fact) / fact;
};
const getAvg = (data) => {
    const len = data.length;
    let sum = 0;
    for (let i = 0; i < len; i += 1) {
        sum += data[i];
    }
    return sum / len;
};

const getImageData = (input, w, h, sx, sy, sw, sh) => {
    const data = [];
    for (let j = 0; j < sh; j++) {
        for (let i = 0; i < sw; i++) {
            const x = sx + i;
            const y = sy + j;
            const val = input[y * w + x];
            if (val !== undefined) {
                data.push(val);
            }
        }
    }
    return data;
};

const getCells = ({ origin, vw, vh, cellSize, name }) => {
    const [cw, ch] = cellSize;
    const colorPicker = color.get(name);
    const next = [];

    // convert channel color
    const len = origin.length;
    for (let i = 0; i < len; i += 4) {
        const [r, g, b] = [origin[i] / 255, origin[i + 1] / 255, origin[i + 2] / 255];
        const k = 1 - Math.max(r, g, b);
        let val = colorPicker({ k, r, g, b });
        next.push(val);
    }

    // return cells
    const column = Math.ceil(vw / cw);
    const row = Math.ceil(vh / ch);
    const cells = [];
    for (let j = 0; j < row; j++) {
        for (let i = 0; i < column; i++) {
            const cell = getImageData(next, vw, vh, i * cw, j * ch, cw, ch);
            const avg = getAvg(cell, 1);
            const size = toFixed(avg);
            cells.push(size);
        }
    }
    return { cells, column, row };
};

self.onmessage = (evt) => {
    postMessage(getCells(evt.data));
};
