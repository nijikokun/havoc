# Havoc

Game oriented development framework

## Installation

- Download / Clone Repository
- NPM: `npm install havoc --save`

## Usage

```javascript
var entity = havoc.entity({
  name: "Nijikokun"
}).implement("health").implement("movement")

console.log("before", entity.position)
entity.move("north")
console.log("after", entity.position)
```

## Features

* **Component based** - Add-ons allow you to easily create any type of entity you need by simply implementing features such as health, abilities, statistics in an easy and quick way.
* **Entity-centric design** - By thinking everything in the game is an entity no longer do you need to create multiple classes with inheritance only entity types.
* **No Frills** - Does only what it needs, quickly iterate and implement features without the framework getting in your way.

## License

ISC