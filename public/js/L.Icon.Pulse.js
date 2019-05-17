$(document).ready(() => {
  L.Icon.Pulse = L.DivIcon.extend({
    options: {
      className: '',
      iconSize: [12, 12],
      fillColor: 'red',
      color: 'red',
      animate: true,
      heartbeat: 1,
    },
    initialize(options) {
      L.setOptions(this, options);
      // css
      const uniqueClassName = `lpi-${new Date().getTime()}-${Math.round(Math.random() * 100000)}`;
      const before = [`background-color: ${this.options.fillColor}`];
      const after = [
        `box-shadow: 0 0 6px 2px ${this.options.color}`,
        `animation: pulsate ${this.options.heartbeat}s ease-out`,
        'animation-iteration-count: infinite',
        'animation-delay: 0',
      ];
      if (!this.options.animate) {
        after.push('animation: none');
        after.push('box-shadow:none');
      }
      const css = [
        `.${uniqueClassName}{${before.join(';')};}`,
        `.${uniqueClassName}:after{${after.join(';')};}`,
      ].join('');

      const el = document.createElement('style');
      if (el.styleSheet) {
        el.styleSheet.cssText = css;
      } else {
        el.appendChild(document.createTextNode(css));
      }
      document.getElementsByTagName('head')[0].appendChild(el);
      // apply css class
      this.options.className = `${this.options.className} leaflet-pulsing-icon ${uniqueClassName}`;

      // initialize icon
      L.DivIcon.prototype.initialize.call(this, options);
    },
  });

  L.icon.pulse = options => new L.Icon.Pulse(options);

  L.Marker.Pulse = L.Marker.extend({
    initialize(latlng, options) {
      options.icon = L.icon.pulse(options);
      L.Marker.prototype.initialize.call(this, latlng, options);
    },
  });
  L.marker.pulse = (latlng, options) => new L.Marker.Pulse(latlng, options);
});
