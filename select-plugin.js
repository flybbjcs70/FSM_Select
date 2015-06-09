var globelSelect;
(function () {


    var $ = function (id) {
        return document.querySelector(id);
    }
    var $$ = function (b, a) {
        a = a || document;
        return a.querySelectorAll(b);
    }

    var mix = function (target, src) {

        for (var p in src) {
            //if (!(p in target)) {
            target[p] = src[p];
            //}
        }
        return target;
    }

    var sub = (function () {
        var _sub = {},
            evtname='_' + +new Date() + 'events';
        _sub[evtname] = {};

        _sub.on = function (type, fn) {
            this[evtname][type] = this[evtname][type] || [];
            this[evtname][type].push(fn);
        }
        _sub.fire = function (type, event) {
            var evt = this[evtname][type] || [],
                _this = this;
            evt.forEach(function (v, k) {

                v.call(_this, mix({ type: type }, event || {}));
            })
        }
        return _sub;

    }());

    function FSM(config) {
        this.config = config;
        this.states = config.states;
        this.currentState = config.initState;
        this.events = config.events;
        this.nextState = null;

        this.defineEvents();
    }

    FSM.prototype = {
        defineEvents: function () {
            var _this = this;
            
            for (var k in this.events) {
                (function (k) {
                    var fn = _this.events[k];
                    fn.call(_this, function (event) {
                        _this.fire(k, event);
                    });
                    _this.on(k, _this.trans);
                }(k));
            }

        },
        trans: function (event) {

            var _this = this;

            if (!_this.currentState) return;
            var nextCall = _this.states[_this.currentState][event.type];
            if (!nextCall) return;
            var next = nextCall.call(_this, event);
            _this.currentState = next;
        }
    };

    var Select = function (container, config) {
        var _this = this;
        this.container = $(container);
        this.config = mix({
            selectCls: "select",
            boxCls: "select-options",
            optionCls: "select-option"
        }, config);
        this.select = $$('.' + this.config.selectCls, this.container)[0];
        this.box = $$('.' + this.config.boxCls, this.container)[0];
        this.options = $$('.' + this.config.optionCls, this.container);
        console.log(this.config.optionCls)
        this.value = this.options[0].getAttribute('data-value');
        this.text = this.options[0].innerHTML;
        this.setText();
        this.isFold = true;

        var stateConfig = {
            initState: 'fold',
            states: {
                'fold': {
                    'unfoldmenu': function () {
                        _this.unfold();
                        return 'unfold';
                    }
                },
                'unfold': {
                    'foldmenu': function () {
                        _this.fold();
                        return 'fold';
                    },
                    'clickmenu': function (e) {
                        _this.selectItem(e.currentItem);
                        return 'fold';
                    }
                }
            },
            events: {
                'unfoldmenu': function (fn) {
                    _this.container.addEventListener('click', function (e) {
                        e.stopPropagation();
                        if (_this.isFold) {
                            fn();
                        }
                    }, false);
                },
                'foldmenu': function (fn) {
                    document.addEventListener('click', function () {

                        if (!_this.isFold) {
                            fn();
                        }
                    }, false);

                },
                'clickmenu': function (fn) {
                    _this.box.addEventListener('click', function (e) {

                        if (e.target.nodeName !== 'LI') return;
                        e.stopPropagation();
                        fn({ currentItem: e.target });
                    });
                }
            }
        };

        this.FSM = new FSM(stateConfig);
    }

    Select.prototype = {
        setText: function () {
            var select = this.select;
            select.innerHTML = this.text;
        },
        unfold: function () {
            this.box.style.display = 'block';
            this.isFold = false;
        },
        fold: function () {
            this.box.style.display = 'none';
            this.isFold = true;
        },
        selectItem: function (item) {
            var _this = this;
            value = item.getAttribute('data-value');
            text = item.innerHTML;
            _this.value = value;
            _this.text = text;
            _this.setText();
            _this.fold();
            _this.fire('select', { value: value, text: text });
            // this.select.innerHTML = item.innerHTML;
            console.log(_this.select.parentNode)
            _this.select.parentNode.querySelector('input').value = (item.getAttribute('data-value'));
            //this.isFold = true;
        }
    }
    mix(FSM.prototype, sub);
    mix(Select.prototype, sub);

    globelSelect = Select;
}());