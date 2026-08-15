import os
Import("env")

# arduino-esp32 3.x moved FS and Network into standalone framework libraries,
# but their library.properties lack 'depends=' entries so PlatformIO never
# adds the src dirs.  Run as pre: so the change propagates to all lib envs.
pkg_dir = env.subst("$PROJECT_PACKAGES_DIR")
if not pkg_dir or pkg_dir == "$PROJECT_PACKAGES_DIR":
    piohome = os.environ.get(
        "PIOHOME_DIR", os.path.expanduser("~/.platformio"))
    pkg_dir = os.path.join(piohome, "packages")

_fw = os.path.join(pkg_dir, "framework-arduinoespressif32", "libraries")

env.Append(
    CPPPATH=[
        os.path.join(_fw, "FS", "src"),
        os.path.join(_fw, "Network", "src"),
    ]
)
