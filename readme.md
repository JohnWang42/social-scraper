# Social Scraper

API to scrape latest posts/tweets/photos from various social sources.

**Currently Implemented**

- Instagram
    - caches images for configurable amount of time
    - subject to however long Instagram allows their JSON to be read publicly
- Twitter
    - uses official API to grab tweet URLs from user timeline
    - caches oembed codes for configurable amount of time