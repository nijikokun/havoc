// havoc.js
//
// Game Oriented Development Framework for Javascript
//
// Everything is component based.
// Everything is essentially an entity.
// Nothing matters. Make what you want. Share with the world, enjoy life.
//
// License ISC
// Copyright Nijiko Yonskai 2013-2016
// Version 1.0
(function (exports) {
  var havoc = exports.havoc = { utils: {}, math: {}, store: localStorage };

  havoc.math.square = function (x) {
    return x * x;
  };

  havoc.math.cube = function (x) {
    return x * havoc.math.square(x);
  };

  havoc.math.withinRange = function (value, min, max) {
    return (value >= min && value <= max);
  };

  havoc.math.randomBetween = function (min, max, flt) {
    var result = Math.exp(Math.random() * Math.log(max - min)) + min;
    return flt ? result : Math.round(result);
  };

  // No Operation Function
  havoc.utils.noop = function () {};

  // String mutable method for capitalization
  //
  // * str {String} Value to be capitalized
  havoc.utils.capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Lowercase a given string, object values, or array strings
  //
  // * o {Object} Value(s) to be lowercased
  havoc.utils.lowercase = function (o, i) {
    if (typeof o === 'string') {
      return o.toLowerCase();
    } else if (Object.prototype.toString.call(o) === '[object Array]') {
      for(i = 0; i < o.length; i++)
        if (typeof o[i] === 'string')
          o[i] = o[i].toLowerCase();
    } else if (typeof o === 'object') {
      for(i in o)
        if (o.hasOwnProperty(i) && typeof o[i] === 'string')
          o[i] = o[i].toLowerCase();
    }

    return o;
  };

  // Probably a better way of doing this, don't give a fuck, YOLO
  //
  // * options {Object}
  // * options.on {Object} Object to have method injected on and returned
  // - options.type {String|Array} Method prefix, determines whether we uppercase `name` argument
  // * options.name {String} Object variable to be manipulated or referenced to
  // - options.callable {Function} Callable function to be used instead of a generated one
  // - options.min {Boolean} Should we expect a minimum cap for argument on setter
  // - options.max {Boolean} Should we expect a maximum for argument on setter
  // - options.acronym {Boolean} Should we create getter,setters for acronyms
  havoc.utils.createTypeMethod = function (options, uname) {
    function create(opts, uname) {
      capitalizedName = havoc.utils.capitalize(opts.name);

      opts.on[
        (opts.type ? opts.type + capitalizedName : opts.name)
      ] = (opts.type && opts.type === 'set') ? function (a) {
        if (opts.min && opts.on['min' + capitalizedName] && a < opts.on['min' + capitalizedName]) a = opts.on['min' + capitalizedName];
        if (opts.max && opts.on['max' + capitalizedName] && a > opts.on['max' + capitalizedName]) a = opts.on['max' + capitalizedName];
        return (opts.on[opts.name] = a) ? opts.on : false;
      } : (typeof opts.callable === 'function') ? opts.callable : function () { return opts.on[opts.name]; };

      return o.on;
    }

    capitalizedName = havoc.utils.capitalize(options.name);
    if (options.min) options.on = havoc.utils.createTypeMethod({ name: 'Min' + capitalizedName, type: ['get', 'set'], on: options.on });
    if (options.max) options.on = havoc.utils.createTypeMethod({ name: 'Max' + capitalizedName, type: ['get', 'set'], on: options.on });
    if (options.acronym) options.on = havoc.utils.createTypeMethod({ name: capitalizedName + 'Acronym', type: ['get', 'set'], on: options.on });
    if (options.type && Object.prototype.toString.call(options.type)) {
      for(var i = 0; i < options.type.length; i++) options.on = create({
        name: options.name, type: options.type[i], callable: options.callable || undefined, on: options.on
      });

      return options.on;
    }

    return create(options);
  };

  // Creates a thin wrapper around the HTML5 LocalStorage API
  // for ease of access and control, as well as additional
  // functionality for fast prototyping and coding.
  //
  // - settings {Object}
  //
  // Return: {Object} Gives quick methods to accessing localStorage API
  havoc.storage = function (settings) {
    var expires;

    if (!settings) settings = {};
    if (settings.expires === 'session') havoc.store = sessionStorage;
    if (typeof havoc.store == 'undefined') return false;

    if ("expires" in settings && typeof settings.expires == 'number' && settings.expires > 0)
      expires = (+new Date()) + settings.expires;

    return {
      // Save data to local storage
      set: function (key, data) {
        var value = { "havoc:store" : data };
        if (expires) value["havoc:expires"] = expires;
        havoc.store.setItem(key, JSON.stringify(value));
        return this;
      },

      // Given a string will return single store
      // Given an array it will return multiple stored information
      get: function (keys) {
        var data, value, now = (+new Date()), $self = this, i, exists = false;

        // Private Data Check function to prevent re-typing this twice.
        function check (data) {
          if (data === null) return null;
          if ("havoc:store" in data)
            if ("havoc:expires" in data && now >= data["havoc:expires"])
              $self.remove(keys);
            else return value["havoc:store"];
          return null;
        }

        try {
          if (Object.prototype.toString.call(keys) === '[object Array]') {
            data = {};
            for (i = 0; i < keys.length; i++) {
              value = JSON.parse(havoc.store.getItem(keys[i]));
              if (value !== null) {
                if (!exists) exists = true;
                data[keys[i]] = check(value);
              }
            }
            data = (exists) ? data : null;
          } else {
            value = JSON.parse(havoc.store.getItem(keys));
            data = check(value);
          }
        } catch (error) { console.log(error.message); }

        return data;
      },

      // Imports an object filled with key-store values hassle-free
      "import": function (data) {
        var key;
        for (key in data)
          if (data.hasOwnProperty(key))
            this.set(key, data[key]);
        return this;
      },

      // Given a string it will remove a single key-store
      // Given an array it will remove multiple key-stores
      "remove": function (keys) {
        if (Object.prototype.toString.call(keys) === '[object Array]') for(var i = 0; i < keys.length; i++) havoc.store.removeItem(keys[i]);
        else  havoc.store.removeItem(keys);
        return this;
      },

      // Empty the current store completely, wipes all data.
      empty: function () {
        havoc.store.clear();
        return this;
      }
    };
  };

  // Event System in a single function aside from removal
  //
  // - topic {String} Event topic
  // - arg {Object} Function to subscribe to a topic, object to publish to subscribers
  havoc.event = function(topic, arg) {
    if (typeof arg === 'function') {
      if (!havoc.event.topics[topic]) havoc.event.topics[topic] = [];
      var token = (++uuid).toString();

      havoc.event.topics[topic].push({
        token: token,
        func: func
      });

      return token;
    }

    if (!havoc.event.topics[topic])
      return false;

    setTimeout(function() {
      var subscribers = havoc.event.topics[topic], len = subscribers ? subscribers.length : 0;
      while (len--) subscribers[len].func(topic, arg);
    }, 0);

    return true;
  };

  havoc.event.topics = {};
  havoc.event.uuid = -1;
  havoc.event.remove = function(token) {
    for (var m in havoc.event.topics)
      if (havoc.event.topics.indexOf(m))
        for (var i = 0, j = havoc.event.topics[m].length; i < j; i++)
          if (havoc.event.topics[m][i].token === token && havoc.event.topics[m].splice(i, 1))
            return token;
    return false;
  };

  // Entity Class
  //
  // - Options {Object} Each item in this will be iterated upon set on the object and made into getter setters.
  havoc.entity = function (options) {
    var $this = {
      _type: 'entity'
    };

    // Handle options as a name only, otherwise, just make it an empty object
    if (!options || typeof options !== "object")
      options = (typeof options === "string") ? { name: options } : {};

    // Default Options for entities
    options.name = options.name || '???';

    // Handle getter setters like this
    for (var i in options)
      if (options.hasOwnProperty(i))
        $this[i] = options[i],
        $this = havoc.utils.createTypeMethod({ on: $this, type: ['get', 'set'], name: i });

    // Implements add-on functionality into current entity
    //
    // * name {String} Add-on name
    // - options {Object} Add-on specific information
    //
    // Version 0.1
    $this.implement = function (name, options) {
      return havoc.entity.addons.use(name, options, $this);
    };

    return $this;
  };

  // {Object} Entity Add-on Container Object
  havoc.entity.addons = {};

  // Add-on Implementation Sugar for generic checks DRY.
  //
  // * name {String} Add-on object key value
  // * options {Object} Add-on specific information
  // * $this {Object} Entity Reference
  havoc.entity.addons.use = function (name, options, $this) {
    if (!$this || !$this._type || $this._type !== 'entity') throw { message: "Invalid Object, not of Entity type.", name: "InvalidEntity", reference: $this };
    if (!name || !havoc.entity.addons[name]) throw { messsage: "Addon you are trying to implement does not exist!", name: "InvalidAddon", reference: name };
    return havoc.entity.addons[name].call("_private", options || {}, $this);
  };

  // Add-on creation method for generic checks, DRY.
  //
  // * name {String} Add-on identification name
  // - check {String} Add-on reference on entity to check for prior implementation.
  // - callback {Function} Add-on callable method upon implementation, utilizing `this` as reference (**can also be `check` argument if no check is required.**)
  havoc.entity.addons.add = function (name, check, callback) {
    havoc.entity.addons[name] = function (options, $this) {
      if (this.toString() !== "_private") throw { message: "You cannot call this method directly.", name: "InvalidInvocation" };
      return (check && typeof check === 'string' && $this[check]) ? $this :  (typeof check === 'function' ? check : callback).call($this, options);
    };
  };

  // Sugar method with additional features built in for entity statistics
  havoc.entity.addons.addStat = function (name, defaults, additions) {
    return havoc.entity.addons.add(name, name, function (options) {
      var $this = this, i;

      $this[name] = function (value, current) {
        if (value) {
          if ($this[name].min && value < $this[name].min) value = $this[name].min;
          if ($this[name].max && value > $this[name].max) value = $this[name].max;
          $this[name][ current ? 'current' : 'temp' ] = parseFloat(value);
          return $this;
        }

        return $this[name][ current ? 'current' : 'temp' ];
      };

      this[name].base = parseFloat(options.base || options.max || defaults.base || defaults.max || 100);
      this[name].min = parseFloat(options.min || defaults.min || 0);
      this[name].max = parseFloat(options.max || defaults.max || 0);
      this[name].acronym = parseFloat(options.acronym || defaults.acronym || name);
      this[name].current = this[name].base;
      this[name].temp = this[name].base;
      this[name].reset = function () { $this[name].current = $this[name].temp; return $this; };

      for (i in options)
        if (options.hasOwnProperty(i) && (i !== 'min' || i !== 'max' || i !== 'base' || i != 'acronym'))
            this[name][i] = options[i];

      if (additions)
        for (i in additions)
          if (additions.hasOwnProperty(i))
            this[i] = additions[i];

      return this;
    });
  };

  havoc.entity.addons.addStat('health', { min: 0, max: 100, acronym: 'hp' }, {
    isDead: function () {
      return this.health <= this.minHealth;
    }
  });

  havoc.entity.addons.addStat('mana', { min: 0, max: 100, acronym: 'mp' });
  havoc.entity.addons.addStat('defense', { min: 0, max: 255, acronym: 'def' });
  havoc.entity.addons.addStat('attack', { min: 0, max: 255, acronym: 'atk' });
  havoc.entity.addons.addStat('speed', { min: 0, max: 255, acronym: 'spd' });
  havoc.entity.addons.add('movement', 'position', function (options) {
    this.position = options.base || [0, 0];
    this.movementSpeed = 1;

    this.move = function (dir) {
      switch (dir.toUpperCase()) {
        case "U": case "UP": case "N": case "NORTH": this.position[0] += 1 * this.movementSpeed; break;
        case "D": case "DOWN": case "S": case "SOUTH": this.position[0] -= 1 * this.movementSpeed; break;
        case "L": case "LEFT": case "W": case "WEST": this.position[1] -= 1 * this.movementSpeed; break;
        case "R": case "RIGHT": case "E": case "EAST": this.position[1] += 1 * this.movementSpeed; break;
      }

      havoc.event('onMove', { dir: dir, target: this });
      return this;
    };

    return this;
  });

  // {Object} Abilities Key-store
  havoc.abilities = {};

  // Fetch or create abilities on `havoc.abilities` key-store
  //
  // * name {String} Ability name
  // - options {Object} Ability options for creation and storage
  havoc.ability = function (name, options) {
    if (typeof options === 'object') {
      options = havoc.utils.lowercase(options);

      if (!options.callback) throw { message: "Missing options / callback", name: "InvalidOptions", reference: options };
      else if (!options.type) throw { message: "Missing type reference", name: "InvalidType", reference: options };
      else if (!options.use) throw { message: "Missing use option, need stat to draw from", name: "MissingUseType", reference: options };

      var $this = {
        tiers: {
          base: {
            name: name,
            cost: options.cost || 0,
            type: options.type,
            stat: options.use,
            callback: options.callback,
            conditions: options.conditions || havoc.utils.noop
          }
        }
      };

      $this.base = function () {
        return $this.tiers.base;
      };

      $this.tier = function (name, options) {
        if (name === 'base') throw { message: "Private tier cannot be fetched or overriden.", name: "PrivateTier", reference: name };
        if (!name) throw { message: "Invalid tier name given.", name: "InvalidAbilityTierName", reference: name };
        if (!options) return $this.tiers[name];
        else if (!options.callback) throw { message: "Missing options / callback", name: "InvalidOptions", reference: options };
        else if (!options.type) throw { message: "Missing type reference", name: "InvalidType", reference: options };
        else if (!options.use) throw { message: "Missing use option, need stat to draw from", name: "MissingUseType", reference: options };

        var $self = {
          name: name,
          cost: options.cost || 0,
          type: options.type,
          stat: options.use,
          callback: options.callback,
          conditions: options.conditions || havoc.utils.noop
        };

        $this.tiers[name] = $self;
        return $this;
      };

      if (options.tiers) for (var i in options.tiers)
        if (typeof i === 'string' && i !== 'base') $this = $this.tier(i, options.tiers[i]);

      havoc.abilities[name] = $this;

      return $this;
    }

    return havoc.abilities[name];
  };

  havoc.entity.addons.add('ability', function (options) {
    options = havoc.utils.lowercase(options);

    if (!options.name) throw { message: "Missing ability options.", name: "InvalidOptions", reference: options };
    if (this.abilities && this.abilities[options.name] && !options.tier) return this;

    var ability = havoc.ability(options.name);
    if (!ability) throw { message: "Missing ability", name: "MissingAbility", reference: options.name };
    if (!this[ability.stat] || typeof this[ability.stat] !== 'function') throw { message: "Missing stat add-on", name: "MissingAddon", reference: ability.stat };
    if (ability.conditions.call(this) === false) throw { message: "Entity and ability are incompatible", name: "IncompatibleAbility", reference: [ ability, this ] };

    if (!this.abilities) {
      this.abilities = {};

      this.useAbility = function (name, options) {
        if (this.abilities.length < 1) return { error: "NO_ABILITIES" };
        options = options || {};
        $ability = this.abilities[name];
        if (!$ability) return { error: "MISSING_ABILITY" };
        if (options.tier) if (!$ability.tier[options.tier]) return { error: "MISSING_TIER" }; else $ability = $ability[options.tier];
        if ($ability.cost > this[$ability.stat]()) return { error: "INSUFFICIENT_" + $ability.stat.toUpperCase() };
        else this[$ability.stat](this[$ability.stat]() - $ability.cost, true);
        return $ability.callback.apply(this, [ options.target ]) || this;
      };
    }

    if (options.tier && this.abilities[options.name]) {
      var tier = ability.tier(options.tier);
      if (!tier.error) this.abilities[options.name][options.tier] = tier;
      return (tier.error) ? tier.error : this;
    }

    this.abilities[options.name] = ability.base();

    return this;
  });

  havoc.entity.addons.add('inventory', 'inventory', function (options) {
    this.inventory = Object.prototype.toString.call(options.starting) === '[object Array]' ? options.starting : [];

    this.inventory.use = function (item, target) {
      var i = 0; for (;i < this.inventory.length; i++)
        if (this.inventory[i].name === item.toLowerCase())
          if (this.inventory[i].use.call(this, target) === true)
            if (this.inventory[i].count === 1) this.inventory.splice(i, 1);
            else this.inventory[i].count--;
      return false;
    };

    this.inventory.has = function (item) {
      var i = 0; for (;i < this.inventory.length; i++)
        if (this.inventory[i].name === item.toLowerCase()) return i;
      return false;
    };

    this.inventory.count = function (item) {
      if (!item) return this.inventory.length;
      var i = 0, count = 0; for (;i < this.inventory.length; i++)
        if (this.inventory[i].name === item.toLowerCase()) return this.inventory[i].count;
      return false;
    };

    this.inventory.add = function (item, amount) {
      if (!item) return this;
      var i = 0, count = 0; for (;i < this.inventory.length; i++)
        if (this.inventory[i].name === item.toLowerCase()) this.inventory[i].count += amount || 1;
      return this;
    };

    this.inventory.remove = function (item, amount) {
      if (!item) return this;
      var i = 0, count = 0; for (;i < this.inventory.length; i++) {
        if (this.inventory[i].name === item.toLowerCase()) {
          if (amount) {
            if (this.inventory[i].count <= amount) this.inventory.splice(i, 1);
            else this.inventory[i].count -= amount;
          } else this.inventory.splice(i, 1);
        }
      }

      return this;
    };

    return havoc.utils.createTypeMethod({
      on: this, type: ['get', 'set'], name: 'inventory'
    });
  });

  havoc.entity.addons.add('item', 'inventory', function (options) {
    if (this.inventory.has(options.name)) return this.inventory.add(item, options.amount);

    var $item = {
      name: options.name.toLowerCase() || 'item' + this.inventory.length+1,
      realName: options.name,
      cost: options.cost || 0,
      count: options.amount || 1,
      use: options.callback || havoc.utils.noop
    };

    this.inventory.push($item);

    return this;
  });

})(typeof window === 'undefined' ? module.exports : window)