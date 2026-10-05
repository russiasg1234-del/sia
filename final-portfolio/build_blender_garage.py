"""Build an editable Blender companion scene for the Three.js Dark Garage.

Run: blender -b --python build_blender_garage.py
The website remains procedural Three.js; this .blend is a native 3D model for
inspection and presentation, not an imported asset used by index.html.
"""

from math import cos, pi, sin
from pathlib import Path
import base64

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "dark-garage-model.blend"
PREVIEW = ROOT / "dark-garage-model-preview.png"
WEB_GLB = ROOT / "assets" / "dark-garage-architecture.glb"
WEB_DATA = ROOT / "garage-model-data.js"

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for col in list(bpy.data.collections):
    if col.name != "Collection":
        bpy.data.collections.remove(col)
root_collection = bpy.data.collections.get("Collection")
root_collection.name = "00 - Dark Garage"


def collection(name):
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    return col


shell = collection("01 - Architecture - self built")
bench = collection("02 - Workbench and monitor")
shelf = collection("03 - Empty storage shelf")
props = collection("04 - Workshop props - self built")
info = collection("05 - Profile and interactive targets")
lights = collection("06 - Lights and camera")


def material(name, color, roughness=.7, metallic=0, emission=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    node = mat.node_tree.nodes.get("Principled BSDF")
    node.inputs["Base Color"].default_value = (*color, 1)
    node.inputs["Roughness"].default_value = roughness
    node.inputs["Metallic"].default_value = metallic
    if emission:
        node.inputs["Emission Color"].default_value = (*color, 1)
        node.inputs["Emission Strength"].default_value = emission
    return mat


concrete = material("PBR | dark concrete | roughness .9", (.19, .23, .28), .9)
wall = material("PBR | charcoal wall | roughness .92", (.14, .17, .21), .92)
steel = material("PBR | painted steel | metallic .8", (.21, .29, .37), .42, .8)
metal = material("PBR | silver metal | metallic .82", (.46, .53, .61), .35, .82)
wood = material("PBR | dark worktop", (.37, .31, .26), .76)
rubber = material("PBR | rubber", (.045, .052, .062), .96)
red = material("Painted red", (.5, .12, .10), .65, .2)
cyan = material("Cyan emissive", (.31, .72, .82), .36, .35, 1.5)
screen = material("Portfolio screen", (.07, .14, .22), .5, 0, .55)
white = material("Light text", (.72, .86, .92), .6)


def move_to_collection(obj, col):
    for old in list(obj.users_collection):
        old.objects.unlink(obj)
    col.objects.link(obj)


def cube(name, loc, size, mat, col, bevel=.02):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    move_to_collection(obj, col)
    if bevel:
        mod = obj.modifiers.new("Soft manufactured edges", "BEVEL")
        mod.width = min(bevel, min(size) / 4)
        mod.segments = 2
        obj.modifiers.new("Weighted corner normals", "WEIGHTED_NORMAL")
    return obj


def cylinder(name, loc, radius, depth, mat, col, rotation=None, vertices=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc)
    obj = bpy.context.object
    obj.name = name
    if rotation:
        obj.rotation_euler = rotation
    obj.data.materials.append(mat)
    move_to_collection(obj, col)
    bevel = obj.modifiers.new("Rounded rim", "BEVEL")
    bevel.width = min(.015, depth / 5)
    bevel.segments = 2
    obj.modifiers.new("Weighted normals", "WEIGHTED_NORMAL")
    return obj


def torus(name, loc, major, minor, mat, col):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor,
                                     major_segments=32, minor_segments=10, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    move_to_collection(obj, col)
    return obj


def text(name, body, loc, size, col, mat=white, rot=(pi / 2, 0, pi)):
    curve = bpy.data.curves.new(name, "FONT")
    curve.body = body
    curve.size = size
    curve.extrude = .008
    curve.bevel_depth = .001
    obj = bpy.data.objects.new(name, curve)
    col.objects.link(obj)
    obj.location = loc
    obj.rotation_euler = rot
    obj.data.materials.append(mat)
    return obj


def light(name, loc, power, color, size):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = power
    data.color = color
    data.shape = "DISK"
    data.size = size
    obj = bpy.data.objects.new(name, data)
    lights.objects.link(obj)
    obj.location = loc
    obj.rotation_euler = (Vector((0, 0, 0)) - obj.location).to_track_quat("-Z", "Y").to_euler()
    return obj


# The same 8 x 8 footprint as the Three.js scene, with an open front/right side.
cube("Floor 8 x 8 units", (0, 0, -.09), (8, 8, .18), concrete, shell, .01)
cube("Back wall", (0, -3.93, 1.8), (8, .14, 3.6), wall, shell)
cube("Left wall", (-3.93, .07, 1.8), (.14, 7.86, 3.6), wall, shell)
cube("Right cutaway wall", (3.93, .07, .45), (.14, 7.86, .9), wall, shell)
cube("Back lower wall panel", (0, -3.84, .42), (7.85, .04, .84), steel, shell)
cube("Left lower wall panel", (-3.84, .06, .42), (.04, 7.7, .84), steel, shell)
for x in (-3.69, 3.69):
    cube("Front opening column", (x, 3.68, 1.775), (.22, .25, 3.55), steel, shell)
    cube("Roller guide", (x, 3.49, 1.525), (.07, .08, 3.05), metal, shell)
    cube("Roof side frame", (x, -.05, 3.42), (.14, 7.42, .18), steel, shell)
cube("Garage opening lintel", (0, 3.68, 3.49), (7.6, .3, .24), steel, shell)
for n in range(6):
    cube("Raised shutter slat %02d" % (n + 1), (0, 3.53, 2.77 + n * .126),
         (7.08, .095, .115), metal, shell, .01)
cube("Ceiling light housing", (.15, -2.98, 3.44), (2.4, .35, .09), steel, shell)
cube("Ceiling light diffuser", (.15, -2.98, 3.378), (2.15, .23, .03), cyan, shell, .005)
cube("Rear cyan strip", (0, -3.79, 3.25), (7.2, .025, .028), cyan, shell, .005)
text("Garage sign", "DARK GARAGE", (-1.15, -3.82, 3.02), .32, shell)
for x in (-2.2, .34):
    cube("Parking line", (x, .15, .009), (.052, 4.66, .018), cyan, shell, .004)


# Workbench and portfolio monitor.
cube("Work surface", (2.63, -2.57, 1.04), (1.93, 1.08, .12), wood, bench)
for x in (1.82, 3.45):
    for y in (-2.97, -2.17):
        cube("Bench leg", (x, y, .49), (.07, .07, .98), steel, bench)
cube("Bench lower shelf", (2.635, -2.57, .24), (1.64, .79, .06), metal, bench)
cube("Monitor base", (2.5, -2.72, 1.126), (.46, .28, .035), rubber, bench)
cube("Monitor stem", (2.5, -2.75, 1.235), (.075, .07, .22), metal, bench)
cube("Monitor frame", (2.5, -2.76, 1.59), (.99, .085, .63), rubber, bench)
cube("Clickable portfolio display", (2.5, -2.707, 1.59), (.89, .008, .52), screen, bench, .003)
text("Monitor title", "PORTFOLIO", (2.13, -2.70, 1.72), .085, bench)
cube("Keyboard", (2.5, -2.20, 1.13), (.65, .22, .035), rubber, bench)
for row in range(3):
    for col in range(9):
        cube("Keyboard key", (2.236 + col * .064, -2.263 + row * .053, 1.153),
             (.049, .041, .011), metal, bench, 0)
cylinder("Stool seat", (2.18, -1.5, .66), .26, .1, rubber, bench)
cylinder("Stool post", (2.18, -1.5, .31), .055, .58, metal, bench)
cylinder("Stool base", (2.18, -1.5, .025), .3, .035, steel, bench)
cube("Wall pegboard", (2.61, -3.79, 2.29), (1.93, .05, .65), steel, bench)
for n in range(3):
    cube("Hanging wrench", (2.05 + n * .28, -3.72, 2.24), (.027, .02, .28), metal, bench)


# Empty shelves, as in the current website.
for x in (-3.37, -1.92):
    cube("Shelf steel post", (x, -3.22, 1.025), (.05, .05, 2.05), steel, shelf)
for z in (.1, .76, 1.42, 2.03):
    cube("Empty wood shelf", (-2.645, -3.18, z), (1.55, .58, .055), wood, shelf)


# Workshop accessories.
for n in range(3):
    torus("Stacked spare tire %d" % (n + 1), (-2.65, .15, .12 + n * .23), .31, .11, rubber, props)
cube("Floor jack body", (-.65, .75, .17), (.44, 1.1, .13), red, props)
cube("Floor jack lifting arm", (-.65, .55, .30), (.18, .58, .1), metal, props)
cylinder("Jack handle", (-.65, 1.39, .57), .021, .92, metal, props, (pi / 2 - .38, 0, 0))
cube("Mechanic creeper frame", (1.05, .35, .16), (.67, 1.5, .075), red, props)
cube("Mechanic creeper cushion", (1.05, .40, .232), (.55, 1.26, .07), rubber, props)
for x in (.71, 1.39):
    for y in (-.20, .90):
        cylinder("Creeper wheel", (x, y, .09), .09, .07, rubber, props, (0, pi / 2, 0))
cylinder("Fire extinguisher body", (3.12, 2.65, .3), .12, .48, red, props)
cylinder("Extinguisher neck", (3.12, 2.65, .585), .055, .09, red, props)
cube("Extinguisher handle", (3.135, 2.65, .72), (.16, .04, .035), rubber, props)
cube("Extinguisher label", (3.12, 2.777, .34), (.14, .01, .19), white, props, .002)
cylinder("Wall clock rim", (2.75, -3.735, 2.98), .25, .05, rubber, props, (pi / 2, 0, 0))
cylinder("Wall clock face", (2.75, -3.70, 2.98), .225, .012, white, props, (pi / 2, 0, 0))
for n in range(12):
    a = n * 2 * pi / 12
    cube("Clock tick", (2.75 + .19 * sin(a), -3.685, 2.98 + .19 * cos(a)),
         (.015, .01, .035), rubber, props, 0)


# Portfolio and shader interaction locations match the web design.
cube("Profile information backplate", (.2, -3.78, 2.05), (2.43, .055, 1.34), steel, info)
cube("Portrait backplate", (-1.54, -3.78, 2.19), (.81, .065, 1.05), steel, info)
cube("Portrait placeholder", (-1.54, -3.735, 2.19), (.73, .01, .973), wall, info, .005)
text("Profile name", "SITTISAK BUSABUK", (-.92, -3.73, 2.45), .13, info)
text("Student number", "6621650469", (-.92, -3.73, 2.18), .12, info)
text("Course", "COMPUTER SCIENCE", (-.92, -3.73, 1.92), .10, info)
cube("Wall light switch plate", (-3.76, 1.75, 1.4), (.055, .25, .34), metal, info)
cube("Wall light switch rocker", (-3.70, 1.75, 1.435), (.075, .13, .14), steel, info)
cube("Cloth mounting bar", (-3.48, -1.0, 3.105), (.045, 1.18, .035), steel, info)
flag = cube("Vertex shader flag - web animation", (-3.48, -1.0, 2.76),
            (.018, 1.1, .65), cyan, info, 0)
flag["web_shader"] = "See garage-shaders.js for real-time vertex animation; this Blender mesh is static."

# Blender's Y axis maps to the opposite web Z axis during glTF export. Mirror
# the editable source layout in X so the presentation camera sees the same
# left/right arrangement as the web camera. The export restores the website's
# original X coordinates without modifying the saved Blender presentation.
for col in (shell, bench, shelf, props, info):
    for obj in col.objects:
        obj.location.x = -obj.location.x


light("Main ceiling area light", (.2, -2.0, 3.2), 620, (.68, .88, 1.0), 4.0)
light("Front fill", (2.0, 4.0, 5.0), 900, (1.0, 1.0, 1.0), 5.0)
light("Cyan rim", (-3.0, -1.0, 2.8), 420, (.28, .70, 1.0), 2.5)
camera_data = bpy.data.cameras.new("Presentation camera")
camera = bpy.data.objects.new("Presentation camera", camera_data)
lights.objects.link(camera)
camera.location = (-10.5, 12.5, 9.2)
camera.rotation_euler = (Vector((0, 0, 1.45)) - camera.location).to_track_quat("-Z", "Y").to_euler()
camera_data.type = "ORTHO"
camera_data.ortho_scale = 13.5
bpy.context.scene.camera = camera

world = bpy.context.scene.world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (.035, .045, .065, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = .5
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 32
scene.render.resolution_x = 1200
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = "AgX"
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = str(PREVIEW)

# Open in camera view, with every modeled part editable and organized.
for area in bpy.context.screen.areas:
    if area.type == "VIEW_3D":
        area.spaces.active.region_3d.view_perspective = "CAMERA"
bpy.ops.object.select_all(action="DESELECT")
bpy.context.view_layer.objects.active = None
bpy.ops.wm.save_as_mainfile(filepath=str(OUT))
bpy.ops.render.render(write_still=True)
# Export the architecture in the website's original coordinates. This happens
# after saving/rendering the mirrored Blender presentation scene, so the .blend
# matches the website visually without changing any website positioning code.
bpy.ops.object.select_all(action="DESELECT")
for obj in shell.objects:
    if obj.type == "MESH" and obj.name not in {"Ceiling light housing", "Ceiling light diffuser"}:
        obj.location.x = -obj.location.x
        obj.select_set(True)
bpy.context.view_layer.objects.active = next(obj for obj in shell.objects if obj.select_get())
bpy.ops.export_scene.gltf(filepath=str(WEB_GLB), export_format="GLB", use_selection=True)
for obj in shell.objects:
    if obj.select_get():
        obj.location.x = -obj.location.x
WEB_DATA.write_text(
    "window.GARAGE_ARCHITECTURE_BASE64='"
    + base64.b64encode(WEB_GLB.read_bytes()).decode("ascii") + "';\n",
    encoding="utf-8",
)
print("SAVED", OUT, "objects", len(bpy.data.objects))
print("PREVIEW", PREVIEW)
print("WEB GLB", WEB_GLB, WEB_GLB.stat().st_size, "bytes")
