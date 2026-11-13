# Materia changes

Each version's "- " lines become its release notes and show on Materia's Updates page.
Add a section here before bumping VERSION.

## 1.4.1

- Synology: fixed searches failing, which also made adding Midgar, Turks, Sonarr or Radarr fail with "Prowlarr URL is invalid"

## 1.4.0

- Midgar is now in the Add Application list (Settings > Apps), with Midgar's port 8990 already filled in. It works the same as the Sonarr entry.

## 1.3.0

- Lifestream is now in the Add Download Client list (it uses Lifestream's remote control on port 9091)
- With Lifestream added, each search result has one Send to Lifestream button that sends the release straight to Lifestream, from any device

## 1.2.1

- Synology: fixed "Failed to install the package" in Package Center

## 1.2.0

- Fixed: first-time setup couldn't save your username and password
- Fixed: Config → General couldn't be saved
- Fixed: a false "not a valid release branch" warning on every install
- Box of X: opening a page now fades slowly through dark green instead of flashing bright lime
- Materia no longer contacts Prowlarr's servers for news or a time check
- Indexers now see the Prowlarr version Materia is built on (3.0.2)
- Search: the search box is now at the top of the Search page
- Search results: Send to Lifestream comes first; the duplicate magnet button is gone; Grab only shows once a download client is set up
- The search box at the top is now called "Find indexer", since it only finds indexers by name
- Config opens on Apps; "Indexers" is now "Proxies"; the overview page is gone
- Add buttons say what they add ("Add app", "Add proxy", and so on)
- Sync profile tags are readable in both themes
- Stats: colors match the theme, and you see "No stats yet" instead of empty charts
- The indexer toolbar is simpler (Sync is on the Apps page; column options are the gear in the table header)
- The status line says "No indexers yet" when you haven't added any, and Box of X shows it on two lines
- Box of X on a phone: the top row fits, and section tabs scroll sideways on one line
- Box of X: the first Indexers tab is now "List"
- The top-right menu (restart, shut down, theme, log out) uses a power icon
- FFVII menu: the Time box says "Equipped" instead of "Materia"
- Clearer wording on first-time setup, the Download Clients page, the login page and help links

## 1.1.3

- New icon: the Turks orb in materia green

## 1.1.2

- Box of X: zoom into the orb to open a page, and back out on BACK

## 1.1.1

- Box of X: linked materia slots in the home orb

## 1.1.0

- Added the Box of X theme, with a theme picker in Config → UI and in the top-right menu

## 1.0.1

- Updates now come from Materia's GitHub Releases, and Windows installs them itself
