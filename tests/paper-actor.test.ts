import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import {
  createPaperActor,
  createRigidPaperActor,
  type PaperActorKind,
} from "../src/paper-actor";

function fixture(kind: PaperActorKind, atlas = false) {
  const texture = new THREE.Texture();
  texture.userData.poseAtlas = atlas;
  const actor = createPaperActor(texture, kind, 1);
  const mesh = actor.root.children[0] as THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshStandardMaterial
  >;
  const positions = mesh.geometry.getAttribute("position");
  const rest = new Float32Array(positions.array);
  return {
    actor,
    mesh,
    positions,
    rest,
    release: () => {
      actor.dispose();
      texture.dispose();
    },
  };
}

test("legacy actor art stays rigid while selection uses only a restrained root lean", () => {
  for (const kind of ["adam", "eve", "noah"] as const) {
    for (const atlas of [false, true]) {
      const selected = fixture(kind, atlas);
      const other = fixture(kind, atlas);
      selected.actor.root.position.set(2, 3, 4);
      for (const f of [selected, other])
        f.actor.update(2, "listen", false, false);
      // Repeated time settles mood identically; only selection differs.
      other.actor.update(2, "listen", false, false);
      selected.actor.update(2, "listen", false, false, 1);
      assert.deepEqual(selected.positions.array, selected.rest);
      assert.deepEqual(other.positions.array, other.rest);
      assert.ok(Math.abs(selected.actor.root.rotation.z) <= 0.04);
      assert.ok(Math.abs(other.actor.root.rotation.z) <= 0.04);
      assert.notEqual(
        selected.actor.root.rotation.z,
        other.actor.root.rotation.z,
        `${kind}: selection creates a small whole-card acknowledgment`,
      );
      assert.deepEqual(selected.actor.root.position.toArray(), [2, 3, 4]);
      assert.deepEqual(selected.actor.root.scale.toArray(), [1, 1, 1]);
      assert.equal(other.mesh.material.emissiveIntensity, 0);
      assert.ok(selected.mesh.material.emissiveIntensity > 0);
      selected.release();
      other.release();
    }
  }
});

test("image-backed actor uses alpha-trimmed visible width and never deforms its card", () => {
  const texture = new THREE.Texture();
  texture.userData.aspect = 0.5;
  const actor = createRigidPaperActor(texture, "eve", 1.1);
  const card = actor.root.children[0] as THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshStandardMaterial
  >;
  const rest = new Float32Array(card.geometry.getAttribute("position").array);
  assert.equal(card.geometry.parameters.width, 1.1);
  assert.equal(card.geometry.parameters.height, 2.2);
  assert.equal(actor.root.userData.visibleHeight, 2.2);
  for (let frame = 0; frame < 260; frame++) {
    actor.update(frame / 60, "work", true, false, frame === 130 ? 1 : 0);
    assert.deepEqual(card.geometry.getAttribute("position").array, rest);
    assert.deepEqual(actor.root.scale.toArray(), [1, 1, 1]);
  }
  actor.update(5, "work", true, false, 1);
  assert.ok(card.material.emissiveIntensity > 0);
  let textureDisposals = 0;
  texture.addEventListener("dispose", () => textureDisposals++);
  actor.dispose();
  assert.equal(
    textureDisposals,
    0,
    "the caller retains ownership of the image texture",
  );
  texture.dispose();
});

test("legacy actor meshes keep fixed vertices through every mood and full action cycle", () => {
  for (const kind of ["adam", "eve", "noah"] as const) {
    for (const atlas of [false, true]) {
      const f = fixture(kind, atlas);
      const meshRest = f.actor.root.children.map((child) => {
        const mesh = child as THREE.Mesh;
        return new Float32Array(mesh.geometry.getAttribute("position").array);
      });
      for (const mood of [
        "welcome",
        "listen",
        "warn",
        "sad",
        "work",
        "hope",
      ] as const) {
        for (const time of [0, 0.55, 1, 2, 2.6, 4.3, 6.4, 9.2]) {
          f.actor.update(time, mood, true, false);
          f.actor.root.children.forEach((child, index) => {
            const mesh = child as THREE.Mesh;
            assert.deepEqual(
              mesh.geometry.getAttribute("position").array,
              meshRest[index],
              `${kind} ${mood} at ${time}s preserves authored pixels`,
            );
          });
          assert.deepEqual(f.actor.root.scale.toArray(), [1, 1, 1]);
          assert.ok(Math.abs(f.actor.root.rotation.z) <= 0.04);
        }
      }
      f.actor.update(10, "work", false, true);
      assert.deepEqual(f.actor.root.rotation.toArray(), [0, 0, 0, "XYZ"]);
      const arm = f.actor.root.getObjectByName(`rigid-${kind}-forearm`) as
        | THREE.Mesh
        | undefined;
      if (arm) assert.equal(arm.rotation.z, 0);
      f.release();
    }
  }
});

test("reduced motion gives static touch and hover feedback without deforming the illustration", () => {
  const f = fixture("eve", true);
  f.actor.update(1, "sad", true, false, 1);
  f.actor.update(2, "sad", true, true, 1, true);
  assert.deepEqual(new Float32Array(f.positions.array), f.rest);
  assert.deepEqual(f.actor.root.rotation.toArray(), [0, 0, 0, "XYZ"]);
  assert.ok(f.mesh.material.emissiveIntensity > 0.1);
  f.actor.update(3, "sad", false, true, 0, true);
  assert.deepEqual(new Float32Array(f.positions.array), f.rest);
  assert.ok(
    f.mesh.material.emissiveIntensity > 0 &&
      f.mesh.material.emissiveIntensity < 0.1,
  );
  f.actor.update(4, "sad", false, true);
  assert.equal(f.mesh.material.emissiveIntensity, 0);
  assert.deepEqual(new Float32Array(f.positions.array), f.rest);
  f.release();
});

test("a sad actor acknowledges touch with less whole-card lean than a welcome actor", () => {
  const sad = fixture("adam");
  const welcome = fixture("adam");
  for (let i = 0; i < 120; i++) {
    sad.actor.update(i / 60, "sad", false, false, 1);
    welcome.actor.update(i / 60, "welcome", false, false, 1);
  }
  assert.ok(
    Math.abs(sad.actor.root.rotation.z) <
      Math.abs(welcome.actor.root.rotation.z),
  );
  assert.deepEqual(sad.positions.array, sad.rest);
  assert.deepEqual(welcome.positions.array, welcome.rest);
  sad.release();
  welcome.release();
});

test("Noah's hammer specialization leaves other atlas moods unchanged", () => {
  const atlas = fixture("noah", true);
  const plain = fixture("noah", false);
  for (const mood of ["welcome", "listen", "warn", "sad", "hope"] as const) {
    for (let frame = 0; frame < 10; frame++) {
      atlas.actor.update(frame / 60, mood, true, false);
      plain.actor.update(frame / 60, mood, true, false);
      assert.deepEqual(atlas.positions.array, plain.positions.array);
    }
  }
  atlas.release();
  plain.release();
});

test("Noah's rigid forearm partitions the illustration without duplicate UV coverage", () => {
  const f = fixture("noah", true);
  const body = f.actor.root.getObjectByName(
    "noah-body-without-forearm",
  ) as THREE.Mesh;
  const arm = f.actor.root.getObjectByName("rigid-noah-forearm") as THREE.Mesh;
  const joint = f.actor.root.getObjectByName(
    "noah-hammer-joint-underlap",
  ) as THREE.Mesh;
  assert.ok(joint, "a stationary source-matched print covers the elbow seam");
  assert.equal(joint.position.z, 0.01);
  let jointArea = 0;
  const jointUv = joint.geometry.getAttribute("uv");
  for (let i = 0; i < jointUv.count; i += 3)
    jointArea +=
      Math.abs(
        (jointUv.getX(i + 1) - jointUv.getX(i)) *
          (jointUv.getY(i + 2) - jointUv.getY(i)) -
          (jointUv.getY(i + 1) - jointUv.getY(i)) *
            (jointUv.getX(i + 2) - jointUv.getX(i)),
      ) / 2;
  assert.ok(
    jointArea > 0.01 && jointArea < 0.025,
    "soft underlap stays local to the source-matched elbow",
  );
  const jointAlpha = joint.geometry.getAttribute("color");
  assert.ok(jointAlpha.count > 0);
  assert.ok(
    Array.from(jointAlpha.array).some(
      (value, i) => i % 4 === 3 && value === 0,
    ) &&
      Array.from(jointAlpha.array).some(
        (value, i) => i % 4 === 3 && value === 1,
      ),
    "rounded overlap feathers outward instead of ending in a hard cuff edge",
  );
  let area = 0;
  for (const mesh of [body, arm]) {
    const uv = mesh.geometry.getAttribute("uv");
    assert.ok(uv.count > 0);
    for (let i = 0; i < uv.count; i += 3) {
      area +=
        Math.abs(
          (uv.getX(i + 1) - uv.getX(i)) * (uv.getY(i + 2) - uv.getY(i)) -
            (uv.getY(i + 1) - uv.getY(i)) * (uv.getX(i + 2) - uv.getX(i)),
        ) / 2;
    }
  }
  assert.ok(
    Math.abs(area - 1) < 0.00001,
    "complementary body and forearm cover the original texture once",
  );
  const armUv = arm.geometry.getAttribute("uv");
  let cuffRightEdge = -Infinity;
  const cuffBoundaryV = 1 - (310 - 123) / 732;
  for (let i = 0; i < armUv.count; i++)
    if (armUv.getY(i) <= cuffBoundaryV)
      cuffRightEdge = Math.max(cuffRightEdge, armUv.getX(i));
  assert.ok(
    cuffRightEdge <= (160 - 108) / 440 + 1e-5,
    "moving cutout narrows to the source skin/cuff boundary before the blue sleeve",
  );
  const armRest = new Float32Array(arm.geometry.getAttribute("position").array);
  f.actor.update(0, "work", false, false);
  assert.equal(f.mesh.visible, false);
  assert.ok(body.visible && arm.visible && joint.visible);
  let minAngle = 0;
  let maxAngle = 0;
  for (let frame = 0; frame < 157; frame++) {
    f.actor.update(frame / 60, "work", false, false);
    assert.deepEqual(
      arm.geometry.getAttribute("position").array,
      armRest,
      "rigid hand/tool never melt",
    );
    minAngle = Math.min(minAngle, arm.rotation.z);
    maxAngle = Math.max(maxAngle, arm.rotation.z);
    assert.ok(Number.isFinite(arm.rotation.z));
    assert.ok(
      Math.abs(arm.rotation.z) <= 1.91,
      "arm stays within its authored work arc",
    );
    assert.deepEqual(
      f.positions.array,
      f.rest,
      "the actor card itself never deforms",
    );
    assert.deepEqual(f.actor.root.scale.toArray(), [1, 1, 1]);
    for (let i = 0; i < f.positions.count; i++)
      if (f.rest[i * 3 + 1] < 0.08) {
        assert.equal(f.positions.getX(i), f.rest[i * 3]);
        assert.equal(f.positions.getY(i), f.rest[i * 3 + 1]);
      }
  }
  assert.ok(
    minAngle < -1.8 && maxAngle === 0,
    "full strike and return occur in one 2.6 second cycle",
  );
  f.actor.update(3, "work", false, true);
  assert.ok(f.mesh.visible);
  assert.equal(arm.visible, false);
  assert.equal(joint.visible, false);
  assert.equal(body.visible, false);
  assert.deepEqual(new Float32Array(f.positions.array), f.rest);
  const hits: THREE.Intersection[] = [];
  arm.raycast(new THREE.Raycaster(), hits);
  assert.equal(hits.length, 0, "hidden arm cannot create ghost clicks");
  f.release();
});

test("the rigid Noah tool reaches waist height without translating its root", () => {
  const texture = new THREE.Texture();
  texture.userData.poseAtlas = true;
  texture.userData.aspect = 440 / 732;
  const actor = createPaperActor(texture, "noah", 1.95);
  const arm = actor.root.getObjectByName("rigid-noah-forearm") as THREE.Mesh;
  const point = new THREE.Vector3(
    (((210 - 108) / 440 - 0.5) * 1.95 * 440) / 732,
    (1 - (180 - 123) / 732) * 1.95,
    0,
  ).sub(arm.position);
  actor.update(0, "work", false, false);
  actor.root.updateMatrixWorld(true);
  const high = arm.localToWorld(point.clone());
  actor.update(1, "work", false, false);
  actor.root.updateMatrixWorld(true);
  const low = arm.localToWorld(point.clone());
  assert.ok(high.y > 1.7 && low.y > 0.85 && low.y < 1.2);
  assert.ok(high.y - low.y > 0.55);
  assert.deepEqual(actor.root.position.toArray(), [0, 0, 0]);
  actor.dispose();
  texture.dispose();
});

function eveFruitFixture(pose = 1) {
  const texture = new THREE.Texture();
  texture.userData.poseAtlas = true;
  texture.userData.pose = pose;
  texture.userData.aspect = 329 / 865;
  texture.repeat.set(329 / 1774, 865 / 887);
  texture.offset.set(724 / 1774, 1 - 878 / 887);
  const actor = createPaperActor(texture, "eve", 1.95);
  return {
    actor,
    texture,
    release() {
      actor.dispose();
      texture.dispose();
    },
  };
}

test("Eve's fruit forearm partitions pose1 exactly and moves rigidly while the cuff and feet stay planted", () => {
  const f = eveFruitFixture();
  const original = f.actor.root.children[0] as THREE.Mesh;
  const body = f.actor.root.getObjectByName(
    "eve-body-without-forearm",
  ) as THREE.Mesh;
  const arm = f.actor.root.getObjectByName("rigid-eve-forearm") as THREE.Mesh;
  assert.ok(body && arm, "pose1 needs the dedicated fruit-hand partition");
  let area = 0;
  for (const mesh of [body, arm]) {
    const uv = mesh.geometry.getAttribute("uv");
    for (let i = 0; i < uv.count; i += 3)
      area +=
        Math.abs(
          (uv.getX(i + 1) - uv.getX(i)) * (uv.getY(i + 2) - uv.getY(i)) -
            (uv.getY(i + 1) - uv.getY(i)) * (uv.getX(i + 2) - uv.getX(i)),
        ) / 2;
  }
  assert.ok(Math.abs(area - 1) < 1e-5);
  const armRest = Array.from(arm.geometry.getAttribute("position").array);
  const bodyRest = Array.from(body.geometry.getAttribute("position").array);
  const fullRest = Array.from(original.geometry.getAttribute("position").array);
  let maximum = 0;
  for (let i = 0; i <= 64; i++) {
    f.actor.update(i / 10, "warn", true, false);
    assert.equal(original.visible, false);
    assert.ok(arm.visible && body.visible);
    assert.deepEqual(
      Array.from(arm.geometry.getAttribute("position").array),
      armRest,
    );
    assert.deepEqual(
      Array.from(body.geometry.getAttribute("position").array),
      bodyRest,
    );
    maximum = Math.max(maximum, Math.abs(arm.rotation.z));
  }
  assert.ok(
    maximum > 0.3 && maximum < 0.5,
    "clear but restrained elbow motion",
  );
  assert.equal(
    arm.rotation.z,
    0,
    "a full gesture returns to the authored pose",
  );
  f.actor.update(2.4, "warn", true, true);
  assert.ok(original.visible && !body.visible && !arm.visible);
  assert.deepEqual(
    Array.from(original.geometry.getAttribute("position").array),
    fullRest,
  );
  assert.deepEqual(f.actor.root.position.toArray(), [0, 0, 0]);
  const hits: THREE.Intersection[] = [];
  arm.raycast(new THREE.Raycaster(), hits);
  assert.equal(hits.length, 0, "hidden fruit hand cannot accept ghost clicks");
  assert.equal((arm.material as THREE.MeshStandardMaterial).map, f.texture);
  f.actor.update(2.4, "warn", false, false, 1);
  assert.ok((arm.material as THREE.MeshStandardMaterial).emissiveIntensity > 0);
  let textureDisposals = 0;
  f.texture.addEventListener("dispose", () => textureDisposals++);
  f.actor.dispose();
  assert.equal(
    textureDisposals,
    0,
    "actor never disposes the caller-owned texture",
  );
  f.release();
});

test("Eve fruit specialization does not alter other moods or atlas poses", () => {
  const f = eveFruitFixture(1),
    other = eveFruitFixture(0);
  assert.equal(
    other.actor.root.getObjectByName("rigid-eve-forearm"),
    undefined,
  );
  for (const mood of ["welcome", "listen", "sad", "work", "hope"] as const) {
    f.actor.update(2, mood, false, false);
    other.actor.update(2, mood, false, false);
    const a = f.actor.root.children[0] as THREE.Mesh;
    const b = other.actor.root.children[0] as THREE.Mesh;
    assert.deepEqual(
      a.geometry.getAttribute("position").array,
      b.geometry.getAttribute("position").array,
    );
    assert.ok(a.visible);
  }
  f.release();
  other.release();
});

function adamPresentationFixture(pose = 0) {
  const texture = new THREE.Texture();
  texture.userData.poseAtlas = true;
  texture.userData.pose = pose;
  texture.userData.aspect = 301 / 854;
  const actor = createPaperActor(texture, "adam", 1.95);
  return {
    actor,
    texture,
    release() {
      actor.dispose();
      texture.dispose();
    },
  };
}

test("Adam presentation partitions skin once without distorting the printed body", () => {
  const f = adamPresentationFixture();
  const full = f.actor.root.children[0] as THREE.Mesh;
  const arm = f.actor.root.getObjectByName("rigid-adam-forearm") as THREE.Mesh;
  const body = f.actor.root.getObjectByName(
    "adam-body-without-forearm",
  ) as THREE.Mesh;
  const patch = f.actor.root.getObjectByName(
    "adam-garment-underpatch",
  ) as THREE.Mesh;
  assert.ok(
    arm && body && patch,
    "presentation requires an isolated skin joint and garment-only fill",
  );
  let area = 0;
  const triangles: number[][] = [];
  for (const mesh of [arm, body]) {
    const uv = mesh.geometry.getAttribute("uv");
    for (let i = 0; i < uv.count; i += 3) {
      const t = Array.from({ length: 6 }, (_, j) =>
        j % 2 ? uv.getY(i + Math.floor(j / 2)) : uv.getX(i + Math.floor(j / 2)),
      );
      area +=
        Math.abs(
          (t[2] - t[0]) * (t[5] - t[1]) - (t[3] - t[1]) * (t[4] - t[0]),
        ) / 2;
      triangles.push(t);
    }
  }
  assert.ok(Math.abs(area - 1) < 1e-5);
  // Interior sample coverage catches overlapping triangles that an area sum alone could conceal.
  for (let u = 0.017; u < 1; u += 0.041137)
    for (let v = 0.019; v < 1; v += 0.043197) {
      let count = 0;
      for (const t of triangles) {
        const signs = [0, 1, 2].map((i) => {
          const j = (i + 1) % 3;
          return (
            (t[j * 2] - t[i * 2]) * (v - t[i * 2 + 1]) -
            (t[j * 2 + 1] - t[i * 2 + 1]) * (u - t[i * 2])
          );
        });
        if (signs.every((x) => x > 1e-10) || signs.every((x) => x < -1e-10))
          count++;
      }
      assert.equal(
        count,
        1,
        "original texture has neither holes nor duplicate triangle coverage",
      );
    }
  const armRest = Array.from(arm.geometry.getAttribute("position").array);
  const bodyRest = Array.from(body.geometry.getAttribute("position").array);
  const fullRest = Array.from(full.geometry.getAttribute("position").array);
  for (const time of [0, 2, 4, 6]) {
    f.actor.update(time, "welcome", true, false);
    assert.ok(arm.visible && body.visible && patch.visible && !full.visible);
    assert.deepEqual(
      Array.from(arm.geometry.getAttribute("position").array),
      armRest,
    );
    assert.deepEqual(
      Array.from(body.geometry.getAttribute("position").array),
      bodyRest,
      "head, torso, and clothing remain a rigid printed card",
    );
    assert.ok(Number.isFinite(arm.rotation.z));
    assert.deepEqual(f.actor.root.scale.toArray(), [1, 1, 1]);
    f.actor.root.updateMatrixWorld(true);
    const armPositions = arm.geometry.getAttribute("position");
    for (let i = 0; i < armPositions.count; i++) {
      const point = arm.localToWorld(
        new THREE.Vector3().fromBufferAttribute(armPositions, i),
      );
      assert.ok(
        Number.isFinite(point.x) &&
          Number.isFinite(point.y) &&
          Number.isFinite(point.z),
      );
      assert.ok(
        Math.abs(point.x) <= (1.95 * 301) / 854 / 2 + 1e-6 &&
          point.y >= 0 &&
          point.y <= 1.95,
        "hand stays within original actor envelope",
      );
    }
    if (time === 2)
      assert.ok(
        Math.abs(arm.rotation.z) > 1.1 && Math.abs(arm.rotation.z) < 1.2,
      );
    if (time === 0 || time === 6) assert.equal(arm.rotation.z, 0);
  }
  const uv = patch.geometry.getAttribute("uv");
  for (let i = 0; i < uv.count; i++) {
    const x = uv.getX(i) * 301 + 184,
      y = (1 - uv.getY(i)) * 854 + 18;
    assert.ok(
      x >= 399.9 && x <= 432.1 && y >= 439.9 && y <= 470.1,
      "underpatch samples verified opaque garment only",
    );
  }
  f.actor.update(2, "welcome", true, true);
  assert.ok(full.visible && !arm.visible && !body.visible && !patch.visible);
  assert.deepEqual(
    Array.from(full.geometry.getAttribute("position").array),
    fullRest,
  );
  const hits: THREE.Intersection[] = [];
  for (const mesh of [arm, body, patch])
    mesh.raycast(new THREE.Raycaster(), hits);
  assert.equal(hits.length, 0);
  assert.deepEqual(f.actor.root.position.toArray(), [0, 0, 0]);
  f.release();
});

test("Adam presentation leaves other poses and moods on a rigid full-pose card", () => {
  const rig = adamPresentationFixture(),
    plain = adamPresentationFixture(1);
  assert.equal(
    plain.actor.root.getObjectByName("rigid-adam-forearm"),
    undefined,
  );
  for (const mood of ["sad", "hope", "listen", "work"] as const) {
    rig.actor.update(2, mood, false, false);
    plain.actor.update(2, mood, false, false);
    const a = rig.actor.root.children[0] as THREE.Mesh,
      b = plain.actor.root.children[0] as THREE.Mesh;
    assert.ok(a.visible);
    assert.deepEqual(
      a.geometry.getAttribute("position").array,
      b.geometry.getAttribute("position").array,
    );
  }
  rig.release();
  plain.release();
});
