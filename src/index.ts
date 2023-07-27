import css from './index.css?inline';
import type { Pair } from './types';
import { CanvasPainter, GridPainter } from './painter';
import Channel from './channel';

const max = Math.pow(2, 21);
const template = document.createElement('template');
template.innerHTML = `<style>${css}</style><img id="img" alt="img-halftone" />`;

class ImgHalftone extends HTMLElement {
    static loadImage(url = '') {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            let img = new Image();
            img.crossOrigin = 'anonymous';
            img.id = 'img';
            img.setAttribute('part', 'img');
            img.onload = () => {
                resolve(img);
            };
            img.onerror = (error) => reject(error);
            img.src = url;
        });
    }
    static get observedAttributes() {
        return ['src', 'alt'];
    }

    private img: HTMLImageElement | null;
    private painter: CanvasPainter | GridPainter;
    private channels: [Channel, Channel, Channel, Channel];

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.append(template.content.cloneNode(true));
        this.painter = this.varient === 'grid' ? new GridPainter() : new CanvasPainter();
        this.channels = [
            new Channel({ name: 'key', color: '#333', deg: 45 }),
            new Channel({ name: 'cyan', color: 'cyan', deg: 15 }),
            new Channel({ name: 'magenta', color: 'magenta', deg: 75 }),
            new Channel({ name: 'yellow', color: 'yellow', deg: 0 }),
        ];
        this.img = this.shadowRoot!.querySelector('#img');
    }

    async attributeChangedCallback(name: string, prev: string, next: string) {
        if (prev === next) {
            return;
        }
        switch (name) {
            case 'src': {
                if (!this.src) {
                    break;
                }
                try {
                    this.shadowRoot!.host.classList.add('loading');
                    const img = await ImgHalftone.loadImage(this.src);
                    img.setAttribute('alt', this.alt);
                    // replace bg
                    this.img!.parentNode!.replaceChild(img, this.img!);
                    this.img = img;

                    // limit max pixel
                    const source = <HTMLImageElement>this.img.cloneNode();
                    const pixels = source.width * source.height;
                    const scale = Math.sqrt(max / pixels);
                    source.width = Math.ceil(source.width * scale);
                    source.height = Math.ceil(source.height * scale);

                    // update
                    await this.update({ source });
                } finally {
                    this.shadowRoot!.host.classList.remove('loading');
                }
                break;
            }
            case 'alt': {
                this.img?.setAttribute('alt', this.alt);
                break;
            }
            default:
                break;
        }
    }

    private async update({ source }: { source: HTMLImageElement }) {
        const size = this.cellsize;
        const cellSize: Pair = [size, size];
        await Promise.all(
            this.channels.map((channel) => channel.update({ source, cellSize }))
        );
        this.painter.draw(this.channels, [source!.width, source!.height]);
    }

    connectedCallback() {
        this.shadowRoot!.appendChild(this.painter.dom);
        if (!this.src) {
            this.src = '';
        }
    }

    disconnectedCallback() {
        this.img = null;
    }

    get src(): string {
        return this.getAttribute('src') ?? '';
    }

    set src(val: string) {
        this.setAttribute('src', val);
    }

    get alt(): string {
        return this.getAttribute('alt') ?? 'img-halftone';
    }

    set alt(val: string) {
        this.setAttribute('alt', val);
    }

    get varient(): string {
        return this.getAttribute('varient') ?? 'canvas';
    }

    set varient(val: string) {
        this.setAttribute('varient', val);
    }

    get cellsize(): number {
        return +this.getAttribute('cellsize')! || 4;
    }

    set cellsize(val: number) {
        this.setAttribute('cellsize', val + '');
    }
}

if (!window.customElements.get('img-halftone')) {
    window.customElements.define('img-halftone', ImgHalftone);
}
declare global {
    interface HTMLElementTagNameMap {
        'img-halftone': ImgHalftone;
    }
}

export default ImgHalftone;
