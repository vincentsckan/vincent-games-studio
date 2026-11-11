#!/usr/bin/env python3
"""Build the six 裂空擂台 figurine meshes with local, free tools only.

Reads the locked full-body cuts (does not modify them), runs TripoSR on CPU
(MIT research model, not the paid Tripo / Meshy / CSM APIs), then cleans the
mesh in local Blender and writes GLB files.

Usage:
  REF_DIR=/path/to/refs python3 tools/reconstruct_local.py assets/models
"""

import os
import subprocess
import sys
import textwrap

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TRIPOSR = os.environ.get("TRIPOSR_DIR", "/tmp/TripoSR")
WORK = os.environ.get("RECON_WORK", "/tmp/rift-recon")


def prepare(src, dest):
    image = Image.open(src).convert("RGBA")
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if bbox:
        image = image.crop(bbox)
    side = 768
    foreground = int(side * 0.86)
    scale = foreground / max(image.size)
    resized = image.resize(
        (max(1, int(image.width * scale)), max(1, int(image.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGB", (side, side), (128, 128, 128))
    canvas.paste(
        resized,
        ((side - resized.width) // 2, (side - resized.height) // 2),
        resized,
    )
    canvas.save(dest)


def reconstruct_all(pairs, out_dir):
    sys.path.insert(0, TRIPOSR)
    import torch
    from tsr.system import TSR

    os.makedirs(out_dir, exist_ok=True)
    model = TSR.from_pretrained(
        "stabilityai/TripoSR",
        config_name="config.yaml",
        weight_name="model.ckpt",
    )
    model.renderer.set_chunk_size(8192)
    model.to("cpu")
    for name, src in pairs:
        prepared = os.path.join(WORK, name + "-input.png")
        prepare(src, prepared)
        from PIL import Image as _Image

        image = _Image.open(prepared).convert("RGB")
        with torch.no_grad():
            scene = model([image], device="cpu")
            meshes = model.extract_mesh(scene, True, resolution=256)
        obj_path = os.path.join(WORK, name + ".obj")
        os.makedirs(os.path.dirname(obj_path), exist_ok=True)
        meshes[0].export(obj_path)
        print("MESH", name, "verts", len(meshes[0].vertices), "faces", len(meshes[0].faces), flush=True)


BLENDER = r"""
import math, os, sys, bpy
from mathutils import Vector

work, out_dir = sys.argv[sys.argv.index("--") + 1 : sys.argv.index("--") + 3]
names = sys.argv[sys.argv.index("--") + 3 :]

def process(name):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.wm.obj_import(
        filepath=os.path.join(work, name + ".obj"),
        up_axis="Z",
        forward_axis="X",
    )
    obj = [o for o in bpy.context.scene.objects if o.type == "MESH"][0]
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.remove_doubles(threshold=0.0015)
    bpy.ops.mesh.delete_loose()
    bpy.ops.object.mode_set(mode="OBJECT")
    mod = obj.modifiers.new("smooth", "SMOOTH")
    mod.factor = 0.2
    mod.iterations = 2
    bpy.ops.object.modifier_apply(modifier="smooth")
    # TripoSR looks along +X. After a Z-up OBJ import the face points +Y.
    # glTF Y-up maps Blender +Y to glTF -Z, which is the three.js front.
    verts = obj.data.vertices
    zs = sorted(v.co.z for v in verts)
    ground = zs[max(0, int(len(zs) * 0.015))]
    xs = [v.co.x for v in verts]
    ys = [v.co.y for v in verts]
    cx = (min(xs) + max(xs)) * 0.5
    cy = (min(ys) + max(ys)) * 0.5
    for v in verts:
        v.co.x -= cx
        v.co.y -= cy
        v.co.z -= ground
    height = max(v.co.z for v in verts)
    scale = 1.58 / max(height, 1e-4)
    for v in verts:
        v.co *= scale
    obj.data.update()
    color = obj.data.color_attributes.get("Color") or obj.data.color_attributes[0]
    obj.data.color_attributes.active_color = color
    obj.data.color_attributes.render_color_index = obj.data.color_attributes.find(color.name)
    # TripoSR albedo comes out very dark. Lift it so the costume stays readable
    # under the arena lights. This edits the mesh colors only, never the refs.
    for item in color.data:
        rgba = list(item.color)
        for i in range(3):
            rgba[i] = min(1.0, (max(rgba[i], 0.0) ** 0.4) * 1.85)
        item.color = rgba
    mat = bpy.data.materials.new("figurine")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (1.0, 1.0, 1.0, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.62
    bsdf.inputs["Metallic"].default_value = 0.08
    attr = mat.node_tree.nodes.new("ShaderNodeAttribute")
    attr.attribute_name = color.name
    mat.node_tree.links.new(attr.outputs["Color"], bsdf.inputs["Base Color"])
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, name + ".glb")
    bpy.ops.export_scene.gltf(
        filepath=out,
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_texcoords=False,
        export_normals=True,
        export_colors=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
    )
    preview = os.environ.get("PREVIEW_DIR")
    if preview:
        render_views(obj, name, preview)
    mn = Vector((1e9, 1e9, 1e9))
    mx = Vector((-1e9, -1e9, -1e9))
    for v in obj.data.vertices:
        for i in range(3):
            mn[i] = min(mn[i], v.co[i])
            mx[i] = max(mx[i], v.co[i])
    size = mx - mn
    print("GLB", name, "size", tuple(round(float(x), 3) for x in size), "verts", len(obj.data.vertices))
    if min(size.x, size.y, size.z) < 0.25:
        raise SystemExit("flat mesh: " + name)

def render_views(obj, name, preview):
    import bpy
    os.makedirs(preview, exist_ok=True)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 8
    scene.render.resolution_x = 540
    scene.render.resolution_y = 720
    scene.render.film_transparent = False
    world = bpy.data.worlds.new("preview")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.05, 0.045, 0.07, 1)
    bg.inputs["Strength"].default_value = 0.6
    scene.world = world
    sun_data = bpy.data.lights.new("sun", "SUN")
    sun_data.energy = 3.2
    sun = bpy.data.objects.new("sun", sun_data)
    scene.collection.objects.link(sun)
    sun.rotation_euler = (0.7, 0.2, -0.6)
    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 50
    cam = bpy.data.objects.new("cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    target = Vector((0.0, 0.0, 0.82))
    views = {
        "front": Vector((0.0, 3.15, 0.95)),
        "back": Vector((0.0, -3.15, 0.95)),
        "side": Vector((3.15, 0.0, 0.95)),
    }
    for label, loc in views.items():
        cam.location = loc
        direction = target - loc
        cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = os.path.join(preview, name + "-" + label + ".png")
        bpy.ops.render.render(write_still=True)

for name in names:
    process(name)
"""


def blender_export(names, out_dir):
    script = os.path.join(WORK, "export_glb.py")
    with open(script, "w", encoding="utf-8") as handle:
        handle.write(BLENDER)
    cmd = [
        "blender",
        "--background",
        "--python",
        script,
        "--",
        WORK,
        out_dir,
        *names,
    ]
    subprocess.check_call(cmd)


def main():
    ref = os.environ.get("REF_DIR")
    if not ref:
        raise SystemExit("Set REF_DIR to the read-only reference folder")
    out_dir = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "assets", "models"))
    mapping = {
        "pofeng-p1": os.path.join(ref, "pofeng-full-p1.png"),
        "pofeng-p2": os.path.join(ref, "pofeng-full-p2.png"),
        "xianming-p1": os.path.join(ref, "xianming-full-p1.png"),
        "xianming-p2": os.path.join(ref, "xianming-full-p2.png"),
        "dingchao-p1": os.path.join(ref, "dingchao-full-p1.png"),
        "dingchao-p2": os.path.join(ref, "dingchao-full-p2.png"),
    }
    missing = [path for path in mapping.values() if not os.path.isfile(path)]
    if missing:
        raise SystemExit("missing refs:\n" + "\n".join(missing))
    os.makedirs(WORK, exist_ok=True)
    pairs = list(mapping.items())
    if os.environ.get("SKIP_RECON") != "1":
        reconstruct_all(pairs, out_dir)
    blender_export([name for name, _ in pairs], out_dir)
    missing_glb = [
        name for name, _ in pairs if not os.path.isfile(os.path.join(out_dir, name + ".glb"))
    ]
    if missing_glb:
        raise SystemExit("GLB export missing: " + ", ".join(missing_glb))
    print("DONE", out_dir)


if __name__ == "__main__":
    main()
