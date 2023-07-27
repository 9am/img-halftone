import type { ChannelOptions, Pair } from './types';
import Pool from './pool';

const createWorker = async () => {
    const worker = await import('./worker.js?raw');
    return new Worker(
        URL.createObjectURL(new Blob([worker.default], { type: 'application/script' }))
    );
};
const poolSize = 4;
const pool = new Pool({
    worker: createWorker,
    size:
        window.navigator.hardwareConcurrency && window.navigator.hardwareConcurrency > 1
            ? Math.max(1, poolSize)
            : 1,
});

class Channel {
    static deg2rad(ang = 0) {
        return (ang * Math.PI) / 180;
    }

    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _cells: number[];
    private _size: Pair;
    private _angle: number;
    private _options: ChannelOptions;

    public viewBox: Pair;
    public color: string = 'black';

    constructor(options: ChannelOptions) {
        this.color = options.color!;
        this._canvas = document.createElement('canvas');
        this._ctx = <CanvasRenderingContext2D>this._canvas.getContext('2d', {
            alpha: false,
            willReadFrequently: true,
            antialias: false,
        });
        this._ctx.imageSmoothingEnabled = false;
        this.update(options);
    }

    private getOrigin() {
        const { source, deg } = this._options;
        // prepare canvas
        const [w, h] = [source!.width, source!.height];
        this._angle = Channel.deg2rad(deg);
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        const [vw, vh] = [Math.ceil(w * cos + h * sin), Math.ceil(w * sin + h * cos)];
        this._canvas.width = vw;
        this._canvas.height = vh;
        this.viewBox = [vw, vh];

        // prepare ctx
        this._ctx.fillStyle = 'white';
        this._ctx.fillRect(0, 0, vw, vh);
        this._ctx.translate(h * sin, 0);
        this._ctx.rotate(this.angle);
        // screenshot
        this._ctx.drawImage(source!, 0, 0, w, h);
        this._ctx.resetTransform();
        const { data: origin } = this._ctx.getImageData(0, 0, vw, vh);
        return {
            origin,
            vw,
            vh,
        };
    }

    async update(options: ChannelOptions) {
        this._options = {
            ...this._options,
            ...options,
        };
        if (!this._options.source) {
            return;
        }
        const { name, cellSize } = this._options;
        const origin = this.getOrigin();
        const { cells, column, row } = await pool.addTask({
            ...origin,
            name,
            cellSize,
        });
        this._size = [column, row];
        this._cells = cells;
    }

    get angle(): number {
        return this._angle;
    }

    get size(): [number, number] {
        return this._size;
    }

    get cellSize(): Pair {
        return this._options.cellSize!;
    }

    get name(): string {
        return this._options.name!;
    }

    get cells(): number[] {
        return this._cells;
    }

    destory() {}
}

export default Channel;
