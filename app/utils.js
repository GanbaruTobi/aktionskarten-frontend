function get(url, data) {
  return fetch(url, {
    body: JSON.stringify(data),
    headers: new Headers({"Content-Type": "application/json"})
  }).then((resp) => resp.json())
  .catch(console.err);
}

function post(url, data) {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: new Headers({"Content-Type": "application/json"})
  }).then((resp) => resp.json())
  .catch(console.err);
}

function patch(url, data) {
  return fetch(url, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: new Headers({"Content-Type": "application/json"})
  })
  .catch(console.err);
}

function put(url, data) {
  return fetch(url, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: new Headers({"Content-Type": "application/json"})
  })
  .catch(console.err);
}

function del(url, data) {
  return fetch(url, {
    method: "DELETE",
    body: JSON.stringify(data),
    headers: new Headers({"Content-Type": "application/json"})
  })
  .catch(console.err);
}

function getStyle(options) {
  var validKeys = ['color', 'weight', 'opacity', 'fillColor', 'fillOpacity', 'dashArray', 'icon.options.iconColor', 'icon.options.iconSize', 'icon.options.iconUrl'],
      style = {};

  validKeys.forEach(function(item) {
    var data = options;
    var keys = item.split('.');
    var key;

    for (let i=0; i<keys.length; ++i) {
      key = keys[i];
      if (!data || !(key in data)) {
        return;
      }
      data = data[key]
    }

    if (data) {
      style[key] = data;
    }
  });

  return style;
}


