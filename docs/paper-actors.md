# Illustrated paper actors — first quality iteration

`src/paper-actor.ts` makes each existing transparent Adam, Eve or Noah illustration a continuous, articulated paper surface. It does not translate the whole sprite around to imitate acting. Local regions of a subdivided mesh move around the neck, chest and arms while the feet remain planted. The original face and brushwork remain intact.

The source cutouts were visually inspected before setting their joint regions. Adam and Noah have lowered arms, so their hands make small outward gestures from their shoulders. Eve has clasped hands at her chest; her animation keeps that pose together. All three have a restrained head tilt and depth turn, breathing, and slight loose-cloth motion. Speaking adds a small head emphasis; this is not lip sync. Mood changes blend over time, with quieter listening and sadness and stronger welcoming, warning and working gestures. Long pauses in the gesture cycle avoid an uninterrupted waving motion.

## Integration

```ts
const actor = createPaperActor(texture, "adam", 0.8);
scene.add(actor.root);
actor.root.position.set(x, supportSurfaceY, z);
actor.update(elapsedSeconds, "welcome", isSpeaking, reducedMotion);
// When removing the actor:
actor.dispose();
```

The root lies at the bottom center of the upright XY plane. Set its position/rotation once for the shelf or book support; acting does not alter them. The caller may fold the root around its base during the mechanical book-opening transition. `update` takes seconds, independent of narration speed. Texture ownership stays with the caller. Reduced motion immediately returns every vertex to its exact original pose. Disposal is idempotent.

The lit, rough paper uses alpha-tested edges, casts a silhouette shadow and receives scene light. Each actor has 1,025 vertices and 1,920 triangles. No extra images, model requests or runtime services are required.

## Evidence and remaining visual review

TypeScript compilation passed. A deterministic three-second welcome/speaking exercise for all three characters measured zero displacement for every vertex below 8% of height, unchanged root position, finite deformation, and exact restoration of all vertices under reduced motion. Largest measured vertex displacement at the final sample was 3.11% of height for Adam, 2.52% for Eve and 1.37% for Noah. These measurements cover the complete rectangle, including transparent regions, rather than claiming visible face displacement.

The integrated scene still needs direct visual scoring at reading distance and a smaller viewport. Inspect face continuity, attached wrists, planted feet, proper surface shadows, and whether gestures can be perceived without looking like rubber. Compare an idle interval with speech and a warning/sad interval. These restrained puppet motions improve internal character life, but they do not by themselves prove reference-quality acting. They cannot produce new illustrated facial expressions, articulated fingers, or genuine lip shapes from a single painted pose. Future richer acting should use authored alternate expressions or layered joint artwork if this first pass remains too restrained.
