# GitHub Pages Deployment

Repository:

```text
https://github.com/sobhigisrs/DrSobhi_CV.git
```

Expected live URL:

```text
https://sobhigisrs.github.io/DrSobhi_CV/
```

## Upload Steps

```bash
git init
git branch -M main
git remote add origin https://github.com/sobhigisrs/DrSobhi_CV.git
git add .
git commit -m "Build premium geospatial portfolio"
git push -u origin main
```

Then open GitHub:

1. Go to repository Settings.
2. Open Pages.
3. Source: Deploy from a branch.
4. Branch: `main`.
5. Folder: `/root`.
6. Save.

## Important

- `.nojekyll` must stay in the root.
- `index.html` must stay in the root.
- The site uses relative links, so it works under the `/DrSobhi_CV/` GitHub Pages path.
- `sitemap.xml` and `robots.txt` are configured for `https://sobhigisrs.github.io/DrSobhi_CV/`.
