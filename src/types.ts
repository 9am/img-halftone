import Channel from './channel';

export type Pair = [number, number];

export interface Painter {
    dom: Element;
    draw(channels: Channel[], size: Pair): void;
}

export type ChannelOptions = {
    source?: HTMLImageElement;
    name?: string;
    deg?: number;
    cellSize?: Pair;
    color?: string;
};

export enum Shape {
    CIRCLE = 'circle',
    TRIANGLE = 'triangle',
    RECTANGLE = 'rectangle',
    HEXAGON = 'hexagon',
}
