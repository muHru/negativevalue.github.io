# Negative Value

Source for the Negative Value blog. GitHub Pages builds it with Jekyll. There's no build step or workflow to maintain.

## Writing a post

Add a Markdown file to `_posts/` named `YYYY-MM-DD-slug.md`:

```markdown
---
layout: post
title: The Title of the Post
tags: [value-form, communization]
---

Body in Markdown. Footnotes work like this.[^1]

[^1]: Heinrich, *An Introduction to the Three Volumes of Karl Marx's Capital*.
```

Push to the branch Pages deploys from, and the post appears on the home page within a minute or two.

- **Tags** become the TOPICS list on the home page and sections on `/topics/`. Keep them lowercase and hyphenated (`value-form`, `ccru`, `lovecraft`) so the same topic isn't split two ways.
- **Posts are numbered** in the list by publish order, oldest = 001.
- `_posts/2026-09-23-transmission-000.md` is a starter post that exercises the styles. Delete it when you publish your first real one.

## Settings

`_config.yml` holds the site title, description, and footer links. Set `email:` to show an address in the footer.

## Previewing locally

Needs Ruby 3.x:

```sh
gem install jekyll -v '~> 3.10' jekyll-feed jekyll-seo-tag kramdown-parser-gfm webrick
jekyll serve
```

Then open http://localhost:4000.

## Layout

| Path | What it is |
|---|---|
| `index.html` | Home: masthead, about, post list, topics |
| `topics.html` | Posts grouped by tag |
| `_layouts/post.html` | Single post |
| `_layouts/default.html` | Page shell, fonts, keyboard bar |
| `assets/css/style.css` | All styles; colours are CSS variables at the top |
| `assets/js/site.js` | Keyboard shortcuts, invert toggle, the animated ASCII field |

Keyboard: `H` home, `A` about, `P` posts, `T` topics, `J`/`K` page down/up, `C` contact, `I` invert (remembered per browser).
