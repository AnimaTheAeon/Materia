# Materia

Materia is an indexer manager styled like the Final Fantasy VII party menu, matching
[Jenova](https://github.com/AnimaTheAeon/Jenova) and [Lifestream](https://github.com/AnimaTheAeon/Lifestream).
It manages your torrent trackers and Usenet indexers in one place and syncs them to Sonarr, Radarr, Lidarr and Readarr.

Materia is a fork of [Prowlarr](https://github.com/Prowlarr/Prowlarr). The indexer engine, its ~500 indexer
definitions and the *arr syncing are Prowlarr's; Materia changes the look and how it's packaged.

## What's different from Prowlarr

- FFVII menu look: blue gradient windows with silver borders, Nunito font, a white pointing-glove cursor in the
  menu on the right, a Time box (uptime and equipped indexers) and a message bar along the bottom.
- Each indexer gets a lettered materia square. The colored stripe shows its type: green for public, purple for
  private, yellow for Usenet, red when disabled.
- **Send to Lifestream** button on every torrent search result. It opens the magnet link (or the .torrent file)
  in Lifestream.
- Data lives in `%APPDATA%\Materia` on Windows, not next to the program.
- Never updates itself from Prowlarr's update server (that would replace Materia with Prowlarr). New versions
  come from this repo's Releases.
- No crash reports or analytics are sent to the Prowlarr/Servarr servers.
- Indexers still see Prowlarr's user agent, so trackers that recognize Prowlarr keep working.

## Install

**Windows:** download `Materia-Setup-<version>.exe` from Releases and run it (no admin needed). Materia starts in
the system tray and opens at http://localhost:9696.

**Synology (DS923+ and other x86-64 models, DSM 7.2):** download `Materia-<version>-x86_64.spk`, then
Package Center → Manual Install. Open Materia from the DSM main menu or go to http://your-nas:9696.

## Building

GitHub Actions builds everything on each push to `main`: the web interface, the Windows installer and portable
zip, and the Synology `.spk`. To publish a new release, bump the number in `VERSION` and push.

Local web interface build: `yarn install && yarn build --env production` (output in `_output/UI`).

## License

GPL-3.0, the same as Prowlarr. See [LICENSE](LICENSE). Nunito font: SIL Open Font License
(`frontend/src/Content/Fonts/Nunito-OFL.txt`).
