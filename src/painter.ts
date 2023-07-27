import type { Painter, Pair } from './types';
import Channel from './channel';

const dpr = window.devicePixelRatio || 1;

export class CanvasPainter implements Painter {
    dom: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor() {
        this.dom = document.createElement('canvas');
        this.dom.classList.add('painter', 'canvas-painter');
        this.ctx = <CanvasRenderingContext2D>this.dom.getContext('2d', {
            antialias: false,
        });
    }

    draw(channels: Channel[], size: Pair) {
        const [w, h] = size;
        this.dom.width = Math.floor(w * dpr);
        this.dom.height = Math.floor(h * dpr);
        channels.forEach((channel) => {
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.scale(dpr, dpr);
            this.ctx.rotate(-channel.angle);
            this.ctx.translate(-h * Math.sin(channel.angle), 0);
            this.ctx.fillStyle = channel.color;
            const [column, row] = channel.size;
            const [cw, ch] = channel.cellSize;
            const path = new Path2D();
            const factor = 0.7;
            channel.cells.forEach((size: number, index: number) => {
                const [i, j] = [index % column, Math.floor(index / column)];
                const [x, y, r] = [
                    i * cw + cw * 0.5,
                    j * ch + ch * 0.5,
                    size * cw * factor,
                ];
                path.moveTo(x, y);
                path.arc(x, y, r, 0, Math.PI * 2);
            });
            this.ctx.fill(path);
            this.ctx.resetTransform();
        });
    }
}

export class GridPainter implements Painter {
    dom: HTMLElement;

    constructor() {
        this.dom = document.createElement('div');
        this.dom.classList.add('painter', 'grid-painter');
    }

    private createLayer(channel: Channel, w: number, h: number) {
        const [column, row] = channel.size;
        const [vw, vh] = channel.viewBox;
        const layer = document.createElement('section');
        layer.classList.add('layer', channel.name);
        layer.style.setProperty('--rad', `${-channel.angle}`);
        layer.style.setProperty('--color', `${channel.color}`);
        layer.style.setProperty('--column', `${column}`);
        layer.style.setProperty('--row', `${row}`);
        layer.style.setProperty('--scale-x', `${vw / w}`);
        layer.style.setProperty('--scale-y', `${vh / h}`);
        const cells = channel.cells.reduce((memo, size) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.style.setProperty('--size', `${size}`);
            memo.append(cell);
            return memo;
        }, document.createDocumentFragment());
        layer.append(cells);
        return layer;
    }

    draw(channels: Channel[], size: Pair) {
        const [w, h] = size;
        this.dom.innerHTML = '';
        this.dom.style.setProperty('--ratio', `${w} / ${h}`);
        const layers = channels.reduce((memo, channel) => {
            const layer = this.createLayer(channel, w, h);
            memo.append(layer);
            return memo;
        }, document.createDocumentFragment());
        this.dom.append(layers);
    }
}
