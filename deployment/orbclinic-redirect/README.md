# Legacy site redirect

This directory is the Cloudflare Pages production payload for the separate
`orbclinic` project. It keeps `orbclinic.pages.dev` available as HTTP 301
redirects to `www.orbmed.co.kr` during the search-engine migration. Do not
delete the `orbclinic` Pages project until its old search results and inbound
traffic have moved.

Deploy from this directory with:

```sh
wrangler pages deploy . --project-name orbclinic --branch main
```

The new site is a different Pages project named `orbmed`; never deploy this
redirect payload to that project.
