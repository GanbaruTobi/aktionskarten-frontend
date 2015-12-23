# aktionskarten-frontend

[![Build Status](https://travis-ci.org/KartographischeAktion/aktionskarten-frontend.svg?branch=master)](https://travis-ci.org/KartographischeAktion/aktionskarten-frontend)

*aktionskarten-frontend* is an Angular web app which relies heavily on Leaflet.
The purpose of this app is to enable people to easily create their own action
maps like [Aktionskarten](http://aktionskarten.noblogs.org/). The whole app is
licenced under GPLv2.

See as well [aktionskarten-backend](github.com/KartographischeAktion/aktionskarten-backend).

## Get started

Install dependencies
```
$ pacman -S bower
$ bower install
```

Start Server
```
$ python -m http.server
```

Launch app
```
$ firefox http:localhost:8000
```

If you find a bug please report it [here](https://github.com/KartographischeAktion/aktionskarten-frontend/issues/new).


## Development

### Adding a new feature

1. Create a new branch from `master`
2. Implement your feature
3. Check tests and code quality with
  ```
  $ npm install
  $ npm run lint
  ```
4. Create a pull request

### Coding conventions
* Indentation: 2 spaces no tabs
* Single quotes (Example: 'foo' instead of "foo")
* Unix linebreaks
* Semicolons mandatory
