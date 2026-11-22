# First Semester: An Arts Story

A work-in-progress 3D exploration of TU Dublin's BA Arts student induction and advising experience.

**Project status:** prototype under development. Not an official student advising service.

## Play

Once GitHub Pages is enabled and the game files are uploaded:

https://shaunferns.github.io/an_arts_story/

## Publishing

The GitHub Actions workflow installs the pinned Three.js version (0.160.0) **during deployment**, then copies the library into the published website. The deployed game therefore loads its 3D engine from the same website, rather than depending on an external CDN.

Upload the latest game as **index.html** to the root of this repository. If using the package, also upload **offline_presentation.html**. Pushes to `main` automatically build and deploy when GitHub Pages is configured to use **GitHub Actions**.

**First-time Pages setup:** Settings → Pages → Build and deployment → Source: GitHub Actions.

## Working approach

- Keep the latest development build here.
- Use releases or tagged commits for stable team-review versions.
- Test the live 3D world and game interactions before sharing a new version.
- Do not include real student records or identifying information.

## Roadmap

Induction and Grangegorman navigation; exploratory scavenger hunt; staged academic advising decisions; meaningful consequences and character continuity; accessibility; testing with students and academic advisers.
