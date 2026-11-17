#!/bin/sh
# Assemble Materia-<version>-x86_64.spk from the linux-x64 package folder.
# Usage: distribution/synology/build-spk.sh path/to/Prowlarr-linux-x64-folder [outdir]
set -eu
APP="$1"
OUT="${2:-dist}"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
VERSION="$(tr -d ' \r\n' < "$ROOT/VERSION")"
BUILD="${BUILD_NUMBER:-0001}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# package.tgz: the program (bin) and the DSM main-menu shortcut (ui)
mkdir -p "$WORK/pkg/bin" "$WORK/pkg/ui"
cp -R "$APP/." "$WORK/pkg/bin/"
rm -rf "$WORK/pkg/bin/Prowlarr.Update"
chmod 755 "$WORK/pkg/bin/Prowlarr"
cp -R "$HERE/ui/." "$WORK/pkg/ui/"
# Materia updates itself: it downloads the next .spk and materia-run.sh swaps
# the new version in (the old Prowlarr updater isn't used, so it's left out).
printf 'PackageVersion=%s\nPackageAuthor=Materia\nUpdateMethod=BuiltIn\nBranch=main\n' "$VERSION-$BUILD" > "$WORK/pkg/package_info"
cp "$HERE/materia-run.sh" "$WORK/pkg/materia-run.sh"
chmod 755 "$WORK/pkg/materia-run.sh"
(cd "$WORK/pkg" && tar --owner=0 --group=0 -czf "$WORK/package.tgz" bin ui package_info materia-run.sh)

# spk layout
mkdir -p "$WORK/spk"
sed "s/@VERSION@/$VERSION-$BUILD/" "$HERE/package/INFO.in" > "$WORK/spk/INFO"
echo "extractsize=\"$(du -sk "$WORK/pkg" | cut -f1)\"" >> "$WORK/spk/INFO"
cp "$WORK/package.tgz" "$WORK/spk/"
cp -R "$HERE/package/scripts" "$HERE/package/conf" "$WORK/spk/"
cp "$HERE/package/PACKAGE_ICON.PNG" "$HERE/package/PACKAGE_ICON_256.PNG" "$WORK/spk/"
chmod 755 "$WORK/spk/scripts/"*

mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"
NAME="Materia-$VERSION-x86_64.spk"
(cd "$WORK/spk" && tar --owner=0 --group=0 -cf "$OUT/$NAME" INFO package.tgz scripts conf PACKAGE_ICON.PNG PACKAGE_ICON_256.PNG)
echo "$OUT/$NAME"
