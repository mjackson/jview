(function (jQuery, undefined) {

  var jQueryFn = jQuery.fn,
  isFunction = jQuery.isFunction,
  _init = true;

  function jView() {
    if (_init && isFunction(this.init)) {
      this.init.apply(this, arguments);
    }
  }

  jView.version = '0.1';

  jView.sup = jQueryFn.init;

  jView.sub = function (init) {
    var sup = this;

    function sub() {
      sup.apply(this, arguments);
    }

    sub.sup = sup;
    sub.sub = sup.sub;
    sub.addEvent = sup.addEvent;
    sub.removeEvent = sup.removeEvent;

    _init = false;
    sub.prototype = new sup;
    _init = true;

    sub.prototype.constructor = sub;

    // Default init simply calls super's init with the same args.
    sub.prototype.init = init || function () {
      sup.prototype.init.apply(this, arguments);
    }

    return sub;
  }

  jView.addEvent = function (name) {
    this.prototype[name] = function (data, fn) {
      if (arguments.length > 0) {
        if (fn == null) {
          fn = data;
          data = null;
        }

        return this.bind(name, data, fn);
      }

      return this.trigger(name);
    }
  }

  jView.removeEvent = function (name) {
    if (isFunction(this.prototype[name])) {
      delete this.prototype[name];
    }
  }

  jView.prototype = new jView.sup;
  jView.prototype.constructor = jView;

  jView.prototype.init = function (width, height, tagName) {
    tagName = tagName || 'div';
    jView.sup.call(this, '<' + tagName + '>');

    width = width || 0;
    height = height || width;
    if (width || height) {
      this.css({ width: width, height: height });
    }

    this.dom = this[0];
  }

  // Hijack jQuery.fn.bind and jQuery.fn.one to call the handler in the scope
  // of the view object (instead of the element).
  jQuery.each(['bind', 'one'], function (i, name) {
    jView.prototype[name] = function (type, data, fn) {
      if (isFunction(this[type]) && this[type] !== jQueryFn[type]) {
        jQuery([this])[name](type, data, fn);
        return this;
      }

      return jQueryFn[name].call(this, type, data, jQuery.proxy(fn, this));
    }
  });

  // Hijack jQuery.fn.unbind and jQuery.fn.trigger.
  jQuery.each(['unbind', 'trigger'], function (i, name) {
    jView.prototype[name] = function (type) {
      if (isFunction(this[type]) && this[type] !== jQueryFn[type]) {
        jQueryFn[name].apply(jQuery([this]), arguments);
        return this;
      }

      return jQueryFn[name].apply(this, arguments);
    }
  });

  // Hijack jQuery.fn.triggerHandler. Need to do this separately from unbind
  // and trigger because the return value is different.
  jView.prototype.triggerHandler = function (type, data) {
    if (isFunction(this[type]) && this[type] !== jQueryFn[type]) {
      return jQuery([this]).triggerHandler(type, data);
    }

    return jQueryFn.triggerHandler.call(this, type, data);
  }

  jView.prototype.append = function (view) {
    jQueryFn.append.apply(this, arguments);

    if (view instanceof jView) {
      view.superview = this;
    }

    return this;
  }

  jView.prototype.appendTo = function (view) {
    jQueryFn.appendTo.apply(this, arguments);

    if (view instanceof jView) {
      this.superview = view;
    } else {
      this.superview = undefined;
    }

    return this;
  }

  jView.prototype.prepend = function (view) {
    jQueryFn.prepend.apply(this, arguments);

    if (view instanceof jView) {
      view.superview = this;
    }

    return this;
  }

  jView.prototype.prependTo = function (view) {
    jQueryFn.prependTo.apply(this, arguments);

    if (view instanceof jView) {
      this.superview = view;
    } else {
      this.superview = undefined;
    }

    return this;
  }

  jView.prototype.before = function (view) {
    jQueryFn.before.apply(this, arguments);

    if (view instanceof jView) {
      view.superview = this.superview;
    }

    return this;
  }

  jView.prototype.after = function (view) {
    jQueryFn.after.apply(this, arguments);

    if (view instanceof jView) {
      view.superview = this.superview;
    }

    return this;
  }

  jView.prototype.insertBefore = function (view) {
    jQueryFn.insertBefore.apply(this, arguments);

    if (view instanceof jView) {
      this.superview = view.superview;
    }

    return this;
  }

  jView.prototype.insertAfter = function (view) {
    jQueryFn.insertAfter.apply(this, arguments);

    if (view instanceof jView) {
      this.superview = view.superview;
    }

    return this;
  }

  jView.prototype.replaceAll = function (view) {
    jQueryFn.replaceAll.apply(this, arguments);

    if (view instanceof jView) {
      this.superview = view.superview;
      view.superview = undefined;
    }

    return this;
  }

  jView.prototype.replaceWith = function (view) {
    jQueryFn.replaceWith.apply(this, arguments);

    if (view instanceof jView) {
      view.superview = this.superview;
      this.superview = undefined;
    }

    return this;
  }

  // expose
  window.jView = jView;

})(jQuery);
