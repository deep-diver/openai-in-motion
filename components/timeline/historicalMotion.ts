import type gsap from 'gsap';
import type { Group } from 'three';
import type { Chapter } from '@/data/types';

/** Event-specific mechanisms: hinges, game pieces, pointers, components and text.
 * No already-visible actor is scaled down during these three narrative beats.
 */
export function addHistoricalMotion(
  tl: gsap.core.Timeline,
  scene: Group,
  c: Chapter,
) {
  const A = 1.55,
    B = 4.8,
    C = 8.25;
  const find = (name: string) => scene.getObjectByName(name);
  const hero = find('story:hero');
  // A screen tells its story line by line; the monitor itself keeps its size.
  const heroLines: Group[] = [];
  hero?.traverse((part) => {
    if (part.name.startsWith('screen:line:')) heroLines.push(part as Group);
  });
  heroLines.forEach((line, i) => {
    tl.set(line, { visible: false }, 0);
    tl.set(line, { visible: true }, A + i * 1.55);
  });
  scene.traverse((part) => {
    if (part.name.startsWith('layer:')) {
      const y = part.position.y;
      tl.fromTo(
        part.position,
        { y: y + 0.6 },
        {
          y,
          duration: 0.75,
          ease: 'back.out(1.7)',
        },
        A + Number(part.name.split(':')[1]) * 0.09,
      );
    }
    if (part.name.startsWith('data:card:')) {
      const p = part.position.clone();
      tl.fromTo(
        part.position,
        { x: p.x - 0.35 },
        {
          x: p.x,
          duration: 0.65,
          ease: 'power2.out',
        },
        B + Number(part.name.split(':')[2]) * 0.22,
      );
    }
  });
  // Image examples assemble once, and then stay in the generated gallery.
  for (const name of ['image:avocado', 'image:astronaut']) {
    const part = hero?.getObjectByName(name);
    if (part) {
      const y = part.position.y;
      tl.set(part, { visible: false }, 0);
      tl.set(part, { visible: true }, B);
      tl.fromTo(
        part.position,
        { y: y + 0.55 },
        {
          y,
          duration: 1.2,
          ease: 'back.out(1.7)',
        },
        B,
      );
    }
  }
  const dog = find('clip:dog');
  if (dog)
    tl.to(dog.rotation, { y: -0.35, duration: 1.3, ease: 'power2.inOut' }, B);
  const organization = find('org:operating');
  if (organization)
    tl.fromTo(
      organization.position,
      { y: -0.7 },
      {
        y: 0,
        duration: 1.15,
        ease: 'power2.out',
      },
      B,
    );
  for (let i = 0; i < 3; i++) {
    const engine = find(`engine:${i}`);
    if (engine)
      tl.to(
        engine.rotation,
        { y: Math.PI * 2, duration: 3.2, ease: 'power2.inOut' },
        B + i * 0.35,
      );
  }
  const cart = find('cart:body'),
    pole = find('cart:pole');
  if (cart)
    tl.fromTo(
      cart.position,
      { x: -0.4 },
      { x: 0.35, duration: 1.1, repeat: 3, yoyo: true, ease: 'sine.inOut' },
      A,
    );
  if (pole) {
    tl.fromTo(
      pole.rotation,
      { z: -0.34 },
      { z: 0.2, duration: 1.2, ease: 'sine.inOut' },
      A,
    );
    tl.to(pole.rotation, { z: 0, duration: 1.6, ease: 'power2.out' }, B);
  }
  if (c.id.startsWith('gpt-2'))
    for (let i = 0; i < 4; i++) {
      const lid = find(`crate:lid:${i}`),
        lock = find(`crate:lock:${i}`);
      const open = c.id === 'gpt-2-full' ? i === 3 : i === 0;
      if (open && lid)
        tl.to(
          lid.rotation,
          { x: -1.45, duration: 1.15, ease: 'power2.inOut' },
          c.id === 'gpt-2-full' ? B + i * 0.23 : A + 0.4,
        );
      if (open && lock)
        tl.to(
          lock.position,
          { x: 0.28, y: 0.25, z: 0.72, duration: 1.1, ease: 'power2.inOut' },
          c.id === 'gpt-2-full' ? B + i * 0.23 : A + 0.4,
        );
    }
  const block = find('hand:block');
  if (block) {
    tl.to(
      block.rotation,
      { y: Math.PI * 0.5, duration: 1.3, ease: 'power2.inOut' },
      B,
    );
    tl.to(
      block.rotation,
      { z: Math.PI * 0.5, duration: 1.3, ease: 'power2.inOut' },
      C - 0.5,
    );
  }
  for (let i = 0; i < 4; i++) {
    const finger = find(`hand:finger:${i}`);
    if (finger)
      tl.to(
        finger.rotation,
        { x: 0.27, duration: 0.65, ease: 'power2.inOut' },
        A + i * 0.13,
      );
  }
  const vote = find('preference:vote:1');
  if (vote)
    tl.fromTo(
      vote.position,
      { y: 0.85 },
      { y: 1.25, duration: 0.8, ease: 'power2.out' },
      B,
    );
  for (let i = 0; i < 3; i++) {
    const bridge = find(`bridge:part:${i}`);
    if (bridge)
      tl.fromTo(
        bridge.position,
        { y: 1.3 },
        { y: 0.55, duration: 0.8, ease: 'power2.out' },
        B + i * 0.22,
      );
    const seat = find(`board:newseat:${i}`);
    if (seat)
      tl.fromTo(
        seat.position,
        { y: -1.3 },
        { y: 0, duration: 0.8, ease: 'power2.out' },
        B + 0.5 + i * 0.24,
      );
    const rack = find(`build:rack:${i}`);
    if (rack)
      tl.fromTo(
        rack.position,
        { y: -1 },
        { y: 0.14, duration: 1.1, ease: 'power2.out' },
        B + i * 0.3,
      );
    const bar = find(`planner:bar:${i}`);
    if (bar) {
      const x = bar.position.x;
      tl.fromTo(
        bar.position,
        { x: -0.32 },
        { x, duration: 1.1, ease: 'power2.inOut' },
        B + i * 0.35,
      );
    }
    const chip = find(`pcb:chip:${i}`);
    if (chip)
      tl.fromTo(
        chip.position,
        { y: 1.6 },
        { y: 0.39, duration: 0.85, ease: 'power2.out' },
        A + i * 0.45,
      );
    const trace = find(`pcb:trace:${i}`);
    if (trace)
      tl.fromTo(
        trace.scale,
        { x: 0 },
        { x: 1, duration: 1, ease: 'none' },
        B + i * 0.5,
      );
  }
  const plate = find('board:oldplate');
  if (plate) {
    if (c.id === 'altman-return-2023')
      tl.fromTo(
        plate.position,
        { x: 2.4 },
        { x: 0, duration: 1.6, ease: 'power2.inOut' },
        B,
      );
    else
      tl.to(
        plate.position,
        { x: -2.5, y: 0.23, z: 0.75, duration: 1.4, ease: 'power2.inOut' },
        B,
      );
  }
  const baton = find('chief:baton');
  if (baton)
    tl.to(baton.position, { x: 0.8, duration: 2, ease: 'power2.inOut' }, B);
  const vga = find('vga:plug');
  if (vga)
    tl.to(vga.position, { x: -0.27, duration: 1.4, ease: 'power2.inOut' }, B);
  const walker = find('tokyo:walker');
  if (walker)
    tl.to(walker.position, { x: 0.93, duration: 5, ease: 'none' }, A + 0.3);
  const answer = find('omni:answer');
  if (answer) {
    tl.set(answer, { visible: false }, 0);
    tl.set(answer, { visible: true }, C);
  }
  const cursor = find('reason:cursor');
  if (cursor) {
    tl.to(cursor.position, { x: 0, duration: 1.3, ease: 'power2.inOut' }, B);
    tl.to(
      cursor.position,
      { x: 0.82, duration: 1.3, ease: 'power2.inOut' },
      C - 0.8,
    );
  }
  const packet = find('router:packet');
  if (packet) {
    tl.to(
      packet.position,
      { x: -0.7, y: 1.6, duration: 1.1, ease: 'power2.inOut' },
      A,
    );
    tl.to(
      packet.position,
      { x: 0, y: 0.66, z: 0.5, duration: 1.4, ease: 'power2.inOut' },
      B,
    );
  }
  const complex = find('router:complex');
  if (complex) {
    tl.to(
      complex.position,
      { x: 0.7, y: 1.6, duration: 1.4, ease: 'power2.inOut' },
      B,
    );
    tl.to(
      complex.position,
      { x: 0, y: 0.66, z: 0.5, duration: 1.4, ease: 'power2.inOut' },
      C,
    );
  }
  const style = find('style:selector');
  if (style)
    tl.to(style.position, { x: 0.84, duration: 1.1, ease: 'power2.inOut' }, B);
  const car = find('race:car');
  if (car) {
    const lap = tl.addLabel('race-start', B);
    lap
      .to(car.position, { x: 0.98, duration: 1.15, ease: 'none' }, B)
      .to(car.position, { z: 0.57, duration: 0.7, ease: 'none' }, B + 1.15)
      .to(car.position, { x: -0.97, duration: 1.15, ease: 'none' }, B + 1.85)
      .to(car.position, { z: -0.58, duration: 0.7, ease: 'none' }, B + 3);
  }
  const pointer = find('computer:cursor');
  if (pointer)
    tl.to(
      pointer.position,
      { x: 0.73, y: 1.29, duration: 1.5, ease: 'power2.inOut' },
      B,
    );
  for (const name of ['calendar:event', 'quadrics:intersection']) {
    const part = find(name);
    if (part) {
      tl.set(part, { visible: false }, 0);
      tl.set(part, { visible: true }, C);
    }
  }
  // Model outputs, the solved puzzle and the completed PCB remain at their full size.
}
